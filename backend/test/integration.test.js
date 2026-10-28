const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../src/app');
const { hashPassword } = require('../src/auth');
const { provisionAdmin } = require('../scripts/create-admin');

const connectionString = process.env.TEST_DATABASE_URL;
async function database(t, bootstrap = '../schema.sql') {
  const admin = new Pool({ connectionString });
  const schema = `wadimor_test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({ connectionString, options: `-c search_path=${schema} -c timezone=UTC`, max: 10 });
  t.after(async () => { await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end(); });
  await pool.query(await fs.readFile(path.join(__dirname, bootstrap), 'utf8'));
  return pool;
}

test('migration 010 preserves existing data and establishes opening balances', { skip: !connectionString }, async t => {
  const pool = await database(t, 'fixtures/schema009.sql');
  await pool.query(`INSERT INTO transactions (total_amount, payment_status) VALUES (75000, 'paid');
    INSERT INTO transaction_details (transaction_id, product_id, quantity, price_at_transaction, cost_at_transaction, subtotal)
    VALUES (1, 1, 1, 75000, 66000, 75000)`);
  const before = (await pool.query('SELECT id, name, stock FROM products ORDER BY id')).rows;
  await pool.query(await fs.readFile(path.join(__dirname, '../migrations/010_inventory_checkout.sql'), 'utf8'));
  assert.deepEqual((await pool.query('SELECT id, name, stock FROM products ORDER BY id')).rows, before);
  assert.equal((await pool.query('SELECT product_name FROM transaction_details WHERE id = 1')).rows[0].product_name, before[0].name);
  assert.equal((await pool.query('SELECT total_amount FROM transactions WHERE id = 1')).rows[0].total_amount, '75000.00');
  const history = (await pool.query('SELECT product_id, stock_before, stock_after, kind FROM stock_movements ORDER BY product_id')).rows;
  assert.deepEqual(history, before.map(p => ({ product_id: p.id, stock_before: 0, stock_after: p.stock, kind: 'opening' })));
  // Reapplying a once-only migration fails atomically and preserves the first result.
  await assert.rejects(pool.query(await fs.readFile(path.join(__dirname, '../migrations/010_inventory_checkout.sql'), 'utf8')));
  await pool.query('ROLLBACK');
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM stock_movements')).rows[0].count, before.length);
});

test('migration 011 preserves the owner, cashiers, and data while removing super admin', { skip: !connectionString }, async t => {
  const pool = await database(t, 'fixtures/schema009.sql');
  await pool.query(await fs.readFile(path.join(__dirname, '../migrations/010_inventory_checkout.sql'), 'utf8'));
  await pool.query(`INSERT INTO users (username, display_name, password, role) VALUES
    ('owner', 'Store Owner', 'preserved-hash', 'super_admin'), ('cashier', 'Cashier', 'cashier-hash', 'kasir');
    INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at)
    SELECT repeat('a', 64), id, repeat('b', 64), NOW() + INTERVAL '1 day' FROM users WHERE username = 'owner'`);
  const products = (await pool.query('SELECT * FROM products ORDER BY id')).rows;
  const owner = (await pool.query("SELECT * FROM users WHERE username = 'owner'")).rows[0];
  await pool.query(await fs.readFile(path.join(__dirname, '../migrations/011_single_owner.sql'), 'utf8'));
  assert.deepEqual((await pool.query('SELECT * FROM users WHERE id = $1', [owner.id])).rows[0], { ...owner, role: 'admin' });
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM sessions')).rows[0].count, 0);
  assert.equal((await pool.query("SELECT role FROM users WHERE username = 'cashier'")).rows[0].role, 'kasir');
  assert.deepEqual((await pool.query('SELECT * FROM products ORDER BY id')).rows, products);
  await assert.rejects(pool.query("INSERT INTO users (username, display_name, password, role) VALUES ('other', 'Other', 'hash', 'admin')"), { code: '23505' });
  await assert.rejects(pool.query("UPDATE users SET role = 'super_admin' WHERE id = $1", [owner.id]), { code: '23514' });
});

test('migration 011 rejects ambiguous owners without changing their accounts', { skip: !connectionString }, async t => {
  const pool = await database(t, 'fixtures/schema009.sql');
  await pool.query(`INSERT INTO users (username, display_name, password, role) VALUES
    ('owner_one', 'Owner One', 'hash', 'super_admin'), ('owner_two', 'Owner Two', 'hash', 'admin')`);
  const before = (await pool.query('SELECT * FROM users ORDER BY id')).rows;
  await assert.rejects(pool.query(await fs.readFile(path.join(__dirname, '../migrations/011_single_owner.sql'), 'utf8')), /Multiple owner candidates/);
  await pool.query('ROLLBACK');
  assert.deepEqual((await pool.query('SELECT * FROM users ORDER BY id')).rows, before);
});

test('owner provisioning creates one admin, resets only that owner, and refuses account takeover', { skip: !connectionString }, async t => {
  const pool = await database(t);
  await pool.query("INSERT INTO users (username, display_name, password, role) VALUES ('cashier_existing', 'Cashier', 'unchanged', 'kasir')");
  await assert.rejects(provisionAdmin(pool, 'cashier_existing', 'Owner6'), /another account/);
  assert.equal((await pool.query("SELECT role FROM users WHERE username = 'cashier_existing'")).rows[0].role, 'kasir');
  const results = await Promise.allSettled([provisionAdmin(pool, 'owner_one', 'Owner6'), provisionAdmin(pool, 'owner_two', 'Owner6')]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const owner = (await pool.query("SELECT * FROM users WHERE role = 'admin'")).rows[0];
  await pool.query("UPDATE users SET display_name = 'Store Owner' WHERE id = $1", [owner.id]);
  await pool.query("INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 day')", ['a'.repeat(64), owner.id, 'b'.repeat(64)]);
  await provisionAdmin(pool, owner.username, 'Reset6');
  const reset = (await pool.query("SELECT * FROM users WHERE role = 'admin'")).rows[0];
  assert.equal(reset.id, owner.id);
  assert.equal(reset.display_name, 'Store Owner');
  assert.notEqual(reset.password, owner.password);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM sessions')).rows[0].count, 0);
});

test('PostgreSQL inventory, checkout, reports, and pagination', { skip: !connectionString }, async t => {
  const pool = await database(t);
  const server = createApp(pool, ['http://localhost:5173']).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const password = 'Integration-password-123';
  for (const [username, role] of [['admin_test', 'admin'], ['cashier_test', 'kasir'], ['customer_test', 'pelanggan']]) {
    await pool.query('INSERT INTO users (username, display_name, password, role) VALUES ($1, $1, $2, $3)', [username, await hashPassword(password), role]);
  }
  async function request(route, { session, method = 'GET', body, key } = {}) {
    const response = await fetch(base + route, { method, headers: {
      Origin: 'http://localhost:5173', 'Content-Type': 'application/json',
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}), ...(key ? { 'Idempotency-Key': key } : {}),
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  async function login(type, username) {
    const result = await request(`/api/auth/login/${type}`, { method: 'POST', body: { username, password } });
    assert.equal(result.status, 200);
    return { cookie: result.cookie, csrfToken: result.body.csrfToken, id: result.body.user.id };
  }
  const admin = await login('admin', 'admin_test');
  const cashier = await login('cashier', 'cashier_test');
  const customer = await login('customer', 'customer_test');
  const newProduct = async (name, stock = 10) => {
    const result = await request('/api/admin/products', { session: admin, method: 'POST', body: { name, price: 3100, cost_price: 2500, stock, min_stock: 2, barcode: randomUUID() } });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body;
  };
  const checkout = (product, quantity, key = randomUUID(), session = cashier, extra = {}) => request('/api/transactions/checkout', {
    session, method: 'POST', key, body: { items: [{ productId: product.id, quantity }], paymentMethod: 'cash', ...(session === cashier ? { cashTendered: 100000 } : {}), ...extra },
  });

  await t.test('owner can create cashiers only; other roles cannot manage accounts', async () => {
    const staffBody = { username: 'new_cashier', displayName: 'New Cashier', role: 'cashier' };
    for (const role of ['admin', 'super_admin', 'customer', 'kasir', undefined]) {
      assert.equal((await request('/api/admin/staff', { session: admin, method: 'POST', body: { ...staffBody, role } })).status, 400);
    }
    for (const session of [cashier, customer]) {
      assert.equal((await request('/api/admin/staff', { session })).status, 403);
      assert.equal((await request('/api/admin/staff', { session, method: 'POST', body: staffBody })).status, 403);
      assert.equal((await request(`/api/admin/staff/${admin.id}/reset-password`, { session, method: 'POST' })).status, 403);
      assert.equal((await request(`/api/admin/staff/${admin.id}`, { session, method: 'DELETE' })).status, 403);
    }
    const created = await request('/api/admin/staff', { session: admin, method: 'POST', body: staffBody });
    assert.equal(created.status, 201);
    assert.equal(created.body.staff.role, 'kasir');
    assert.equal(created.body.staff.mustChangePassword, true);
    const createdId = created.body.staff.id;
    const staffSession = await request('/api/auth/login/cashier', { method: 'POST', body: { username: staffBody.username, password: created.body.temporaryPassword } });
    assert.equal(staffSession.status, 200);
    assert.equal((await request(`/api/admin/staff/${createdId}/reset-password`, { session: admin, method: 'POST' })).status, 200);
    assert.equal((await request('/api/auth/me', { session: { cookie: staffSession.cookie } })).status, 401);
    for (const id of [admin.id]) {
      assert.equal((await request(`/api/admin/staff/${id}/reset-password`, { session: admin, method: 'POST' })).status, 404);
      assert.ok([400, 404].includes((await request(`/api/admin/staff/${id}`, { session: admin, method: 'DELETE' })).status));
    }
    const registration = await request('/api/auth/register', { method: 'POST', body: { username: 'role_injection', displayName: 'Role Injection', password: 'Buyer6', passwordConfirm: 'Buyer6', role: 'admin' } });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.user.role, 'pelanggan');
    await assert.rejects(pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [createdId]), { code: '23505' });
    assert.equal((await request(`/api/admin/staff/${createdId}`, { session: admin, method: 'DELETE' })).status, 200);
  });

  await t.test('owner can reset and delete customers while preserving their transactions', async () => {
    const registration = await request('/api/auth/register', { method: 'POST', body: { username: 'forgot_password', displayName: 'Forgot Password', password: 'Buyer6', passwordConfirm: 'Buyer6' } });
    assert.equal(registration.status, 201);
    const targetId = registration.body.user.id;
    const originalSession = { cookie: registration.cookie, csrfToken: registration.body.csrfToken };
    const product = await newProduct('Customer recovery product', 3);
    const purchase = await checkout(product, 1, randomUUID(), originalSession);
    assert.equal(purchase.status, 201);
    const originalTransaction = (await pool.query('SELECT * FROM transactions WHERE id = $1', [purchase.body.receipt.id])).rows[0];
    const reset = await request(`/api/admin/staff/${targetId}/reset-password`, { session: admin, method: 'POST' });
    assert.equal(reset.status, 200);
    assert.equal(reset.body.staff.role, 'pelanggan');
    assert.equal(reset.body.staff.mustChangePassword, true);
    assert.equal((await request('/api/auth/me', { session: originalSession })).status, 401);
    assert.equal((await request('/api/auth/login/customer', { method: 'POST', body: { username: 'forgot_password', password: 'Buyer6' } })).status, 401);
    const temporaryLogin = await request('/api/auth/login/customer', { method: 'POST', body: { username: 'forgot_password', password: reset.body.temporaryPassword } });
    assert.equal(temporaryLogin.status, 200);
    const temporarySession = { cookie: temporaryLogin.cookie, csrfToken: temporaryLogin.body.csrfToken };
    assert.equal((await request('/api/products', { session: temporarySession })).status, 428);
    assert.equal((await request('/api/auth/change-password', { session: temporarySession, method: 'POST', body: { newPassword: 'Reset6' } })).status, 200);
    assert.equal((await request('/api/products', { session: temporarySession })).status, 200);
    assert.equal((await request(`/api/admin/staff/${targetId}`, { session: admin, method: 'DELETE' })).status, 200);
    assert.equal((await request('/api/auth/me', { session: temporarySession })).status, 401);
    assert.deepEqual((await pool.query('SELECT * FROM transactions WHERE id = $1', [originalTransaction.id])).rows[0], { ...originalTransaction, user_id: null });
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 2);
    assert.equal((await request(`/api/admin/staff/${targetId}/reset-password`, { session: admin, method: 'POST' })).status, 404);
  });

  await t.test('failed session revocation rolls back a password reset', async () => {
    const before = (await pool.query('SELECT password, must_change_password FROM users WHERE id = $1', [cashier.id])).rows[0];
    await pool.query(`CREATE FUNCTION reject_session_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected session deletion failure'; END; $$;
      CREATE TRIGGER reject_session_delete BEFORE DELETE ON sessions FOR EACH ROW EXECUTE FUNCTION reject_session_delete()`);
    try { assert.equal((await request(`/api/admin/staff/${cashier.id}/reset-password`, { session: admin, method: 'POST' })).status, 500); }
    finally { await pool.query('DROP TRIGGER reject_session_delete ON sessions; DROP FUNCTION reject_session_delete()'); }
    assert.deepEqual((await pool.query('SELECT password, must_change_password FROM users WHERE id = $1', [cashier.id])).rows[0], before);
    assert.equal((await request('/api/auth/me', { session: cashier })).status, 200);
  });

  await t.test('stock delivery/correction keeps actor, reason, balances; invalid changes roll back', async () => {
    const product = await newProduct('Ledger product', 20);
    const adjust = body => request(`/api/admin/products/${product.id}/stock`, { session: admin, method: 'PATCH', body });
    const delivery = await adjust({ amount: 15, kind: 'delivery', reason: 'Supplier delivery' });
    assert.equal(delivery.status, 200);
    assert.equal(delivery.body.stock, 35);
    const correction = await adjust({ amount: 15, kind: 'correction', reason: 'Physical stock count' });
    assert.equal(correction.status, 200);
    assert.equal(correction.body.stock, 15);
    for (const amount of [-50, -1, 1000001, 1.5, null, '2', undefined]) assert.equal((await adjust({ amount, reason: 'Invalid change' })).status, 400);
    for (const amount of [-1, 0, 1.5, 1000001]) assert.equal((await adjust({ amount, kind: 'delivery', reason: 'Invalid delivery' })).status, 400);
    assert.equal((await adjust({ amount: 2, kind: 'invalid', reason: 'Invalid kind' })).status, 400);
    assert.equal((await adjust({ amount: 2, reason: '' })).status, 400);
    const history = await request(`/api/admin/stock-movements?productId=${product.id}`, { session: admin });
    assert.equal(history.body.total, 3);
    assert.deepEqual(history.body.items.map(row => [row.kind, row.quantity, row.stock_before, row.stock_after]), [['correction', -20, 35, 15], ['delivery', 15, 20, 35], ['opening', 20, 0, 20]]);
    assert.equal(history.body.items[0].actor_id, admin.id);
    assert.equal(history.body.items[0].reason, 'Physical stock count');
    assert.equal((await request('/api/admin/stock-movements', { session: customer })).status, 403);
    assert.equal((await request(`/api/admin/products/${product.id}`, { session: admin, method: 'PUT', body: { ...product, price: Number(product.price), cost_price: Number(product.cost_price), stock: 999, name: 'Edited product' } })).status, 200);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 15);
  });

  await t.test('correction can raise, clear, or retain stock; omitted kind also sets final stock', async () => {
    const product = await newProduct('Stock count product');
    const adjust = body => request(`/api/admin/products/${product.id}/stock`, { session: admin, method: 'PATCH', body: { reason: 'Physical stock count', ...body } });
    for (const amount of [25, 0, 13, 13]) {
      const result = await adjust({ amount, ...(amount === 13 ? {} : { kind: 'correction' }) });
      assert.equal(result.status, 200);
      assert.equal(result.body.stock, amount);
    }
    const history = await request(`/api/admin/stock-movements?productId=${product.id}`, { session: admin });
    assert.deepEqual(history.body.items.map(row => [row.kind, row.quantity, row.stock_before, row.stock_after]), [
      ['correction', 13, 0, 13], ['correction', -25, 25, 0], ['correction', 15, 10, 25], ['opening', 10, 0, 10],
    ]);
  });

  await t.test('simultaneous retries create one sale, one deduction, and replay the original receipt', async () => {
    const product = await newProduct('Idempotent product');
    const key = randomUUID();
    const results = await Promise.all([checkout(product, 2, key), checkout(product, 2, key)]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 201]);
    assert.deepEqual(results[0].body, results[1].body);
    const receipt = results[0].body.receipt;
    assert.equal(receipt.cashTendered, 100000); assert.equal(receipt.cashChange, 93800);
    assert.equal(receipt.items[0].cost, undefined);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 8);
    assert.equal((await pool.query("SELECT COUNT(*)::int AS count FROM stock_movements WHERE product_id = $1 AND kind = 'sale'", [product.id])).rows[0].count, 1);
    assert.equal((await checkout(product, 3, key)).status, 409);
    const history = await request(`/api/cashier/transactions?q=${receipt.id}`, { session: cashier });
    assert.equal(history.body.items[0].cash_change, '93800.00');
    await pool.query("UPDATE products SET name = 'Renamed after sale' WHERE id = $1", [product.id]);
    const renamed = await request(`/api/cashier/transactions?q=${receipt.id}`, { session: cashier });
    assert.equal(renamed.body.items[0].items[0].product_name, 'Idempotent product');
  });

  await t.test('two buyers competing for the last unit cannot oversell', async () => {
    const product = await newProduct('Last unit', 1);
    const results = await Promise.all([checkout(product, 1), checkout(product, 1)]);
    assert.deepEqual(results.map(r => r.status).sort(), [201, 400]);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 0);
  });

  await t.test('insufficient cash and unavailable items leave no partial sale or audit record', async () => {
    const product = await newProduct('Rollback product', 3);
    const key = randomUUID();
    assert.equal((await checkout(product, 1, key, cashier, { cashTendered: 3000 })).status, 400);
    assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM checkout_requests WHERE request_key = $1', [key])).rows[0].count, 0);
    const result = await request('/api/transactions/checkout', { session: cashier, method: 'POST', key: randomUUID(), body: { items: [{ productId: product.id, quantity: 1 }, { productId: 2147483647, quantity: 1 }], paymentMethod: 'cash', cashTendered: 100000 } });
    assert.equal(result.status, 400);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 3);
    assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM stock_movements WHERE product_id = $1', [product.id])).rows[0].count, 1);
    // Force a failure after the stock update to exercise rollback of the trigger and sale.
    await pool.query(`CREATE FUNCTION reject_test_detail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected failure'; END; $$;
      CREATE TRIGGER reject_test_detail BEFORE INSERT ON transaction_details FOR EACH ROW EXECUTE FUNCTION reject_test_detail()`);
    try { assert.equal((await checkout(product, 1)).status, 500); }
    finally { await pool.query('DROP TRIGGER reject_test_detail ON transaction_details; DROP FUNCTION reject_test_detail()'); }
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 3);
    assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM stock_movements WHERE product_id = $1', [product.id])).rows[0].count, 1);
  });

  await t.test('cancellation restores stock once; paid orders cannot be cancelled', async () => {
    const product = await newProduct('Cancellation product', 4);
    const pending = await checkout(product, 2, randomUUID(), customer);
    assert.equal(pending.status, 201); assert.equal(pending.body.receipt.paymentStatus, 'pending');
    const cancel = () => request(`/api/transactions/${pending.body.receipt.id}/cancel`, { session: customer, method: 'POST', body: {} });
    assert.deepEqual((await Promise.all([cancel(), cancel()])).map(r => r.status).sort(), [200, 409]);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 4);
    const history = await request(`/api/admin/stock-movements?productId=${product.id}&kind=cancellation`, { session: admin });
    assert.equal(history.body.total, 1); assert.equal(history.body.items[0].quantity, 2);
    const next = await checkout(product, 1, randomUUID(), customer);
    const route = `/api/transactions/${next.body.receipt.id}/confirm-payment`;
    assert.equal((await request(route, { session: cashier, method: 'POST', body: { cashTendered: 2000 } })).status, 400);
    assert.equal((await request(route, { session: cashier, method: 'POST', body: { cashTendered: 5000 } })).status, 200);
    assert.equal((await request(`/api/transactions/${next.body.receipt.id}/cancel`, { session: customer, method: 'POST', body: {} })).status, 409);
    assert.equal((await request(route, { session: cashier, method: 'POST', body: { cashTendered: 5000 } })).status, 409);
  });

  await t.test('bounded product/history pages support filters and preserve role privacy', async () => {
    const first = await request('/api/products?pageSize=2&page=1', { session: admin });
    const second = await request('/api/products?pageSize=2&page=2', { session: admin });
    assert.equal(first.body.items.length, 2); assert.ok(first.body.total > 2);
    assert.equal(first.body.items.some(item => second.body.items.some(other => other.id === item.id)), false);
    const found = await request('/api/products?q=Last%20unit&lowStock=true', { session: customer });
    assert.equal(found.body.total, 1); assert.equal(found.body.items[0].cost_price, undefined);
    const product = await newProduct('Exact scan');
    assert.equal((await request(`/api/products?code=${product.barcode}`, { session: cashier })).body.items[0].id, product.id);
    const missing = await request('/api/products?q=does-not-exist&page=999', { session: admin });
    assert.equal(missing.body.total, 0); assert.equal(missing.body.page, 1);
    assert.equal((await request('/api/products?pageSize=101', { session: admin })).status, 400);
    assert.equal((await request('/api/products?page=-1', { session: admin })).status, 400);
    const orders = await request('/api/admin/transactions?status=paid&pageSize=1', { session: admin });
    assert.equal(orders.body.items.length, 1); assert.ok(orders.body.total > 1);
    assert.equal(orders.body.items[0].payment_status, 'paid');
    assert.equal((await request('/api/admin/transactions', { session: customer })).status, 403);
    const mine = await request('/api/transactions/mine', { session: customer });
    assert.ok(mine.body.items.every(item => item.customer_name === 'customer_test'));
  });

  await t.test('gross profit equals paid sales minus historical cost', async () => {
    const report = await request('/api/admin/reports', { session: admin });
    assert.equal(report.status, 200);
    const f = report.body.financials;
    assert.equal(Number(f.laba_kotor), Number(f.omset) - Number(f.hpp));
    assert.ok(Number(f.laba_kotor) > 0); assert.equal(f.laba_bersih, undefined);
    const analytics = await request('/api/admin/analytics', { session: admin });
    assert.equal(analytics.status, 200); assert.equal(Number(analytics.body.summary.revenue), Number(f.omset));
  });
});

test('report periods and transaction date filters use WIB boundaries and historical cost', { skip: !connectionString }, async t => {
  const pool = await database(t);
  await pool.query("INSERT INTO users(username,display_name,password,role) VALUES ('report_owner','Owner',$1,'admin')", [await hashPassword('Owner123')]);
  for (const [when, amount, quantity, status] of [
    ['2026-09-30T16:59:59Z', 100, 1, 'paid'],
    ['2026-09-30T17:00:00Z', 200, 2, 'paid'],
    ['2026-10-31T16:59:59Z', 300, 3, 'paid'],
    ['2026-10-31T17:00:00Z', 400, 4, 'paid'],
    ['2026-10-15T00:00:00Z', 500, 5, 'pending'],
  ]) {
    const tx = await pool.query('INSERT INTO transactions(total_amount,payment_status,created_at) VALUES ($1,$2,$3) RETURNING id', [amount,status,when]);
    await pool.query(`INSERT INTO transaction_details(transaction_id,product_id,product_name,quantity,price_at_transaction,cost_at_transaction,subtotal)
      VALUES ($1,1,'Historical Product',$2,100,40,$3)`,[tx.rows[0].id,quantity,amount]);
  }
  const server = createApp(pool, ['http://localhost:5173']).listen(0,'127.0.0.1');
  await once(server,'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(base+'/api/auth/login/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'report_owner',password:'Owner123'})});
  const headers = {Cookie:login.headers.getSetCookie()[0].split(';')[0]};
  const report = await (await fetch(base+'/api/admin/reports?period=selectedMonth&month=2026-10',{headers})).json();
  assert.equal(Number(report.financials.omset),500);
  assert.equal(Number(report.financials.hpp),200);
  assert.equal(Number(report.financials.laba_kotor),300);
  assert.equal(Number(report.financials.units_sold),5);
  assert.equal(Number(report.financials.total_orders),2);
  assert.equal(Number(report.previous.omset),100);
  assert.equal(report.series.length,31);
  assert.equal(Number(report.series[0].revenue),200);
  assert.equal(Number(report.series[30].revenue),300);
  const history = await (await fetch(base+'/api/admin/transactions?dateFrom=2026-10-01&dateTo=2026-10-31&status=paid',{headers})).json();
  assert.equal(history.total,2);
  for (const query of ['period=invalid','period=selectedMonth&month=2026-13','period=year&year=nope']) assert.equal((await fetch(base+'/api/admin/reports?'+query,{headers})).status,400);
  for (const query of ['dateFrom=2026-02-30','dateFrom=2026-10-31&dateTo=2026-10-01']) assert.equal((await fetch(base+'/api/admin/transactions?'+query,{headers})).status,400);
  const yearly = await (await fetch(base+'/api/admin/reports?period=year&year=2026',{headers})).json();
  assert.equal(yearly.series.length,12);
  assert.equal(Number(yearly.financials.omset),1000);
  const analytics = await (await fetch(base+'/api/admin/analytics?days=30',{headers})).json();
  assert.equal(analytics.daily.length,30);
});
