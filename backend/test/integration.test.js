const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../src/app');
const { hashPassword } = require('../src/auth');

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

  await t.test('stock delivery/correction keeps actor, reason, balances; invalid changes roll back', async () => {
    const product = await newProduct('Ledger product');
    const adjust = body => request(`/api/admin/products/${product.id}/stock`, { session: admin, method: 'PATCH', body });
    assert.equal((await adjust({ amount: 5, kind: 'delivery', reason: 'Supplier delivery' })).status, 200);
    assert.equal((await adjust({ amount: -2, kind: 'correction', reason: 'Damaged packaging' })).status, 200);
    for (const amount of [-50, 0, 1.5, null, '2']) assert.equal((await adjust({ amount, reason: 'Invalid change' })).status, 400);
    assert.equal((await adjust({ amount: 2, reason: '' })).status, 400);
    const history = await request(`/api/admin/stock-movements?productId=${product.id}`, { session: admin });
    assert.equal(history.body.total, 3);
    assert.deepEqual(history.body.items.map(row => [row.kind, row.quantity, row.stock_before, row.stock_after]), [['correction', -2, 15, 13], ['delivery', 5, 10, 15], ['opening', 10, 0, 10]]);
    assert.equal(history.body.items[0].actor_id, admin.id);
    assert.equal(history.body.items[0].reason, 'Damaged packaging');
    assert.equal((await request('/api/admin/stock-movements', { session: customer })).status, 403);
    assert.equal((await request(`/api/admin/products/${product.id}`, { session: admin, method: 'PUT', body: { ...product, price: Number(product.price), cost_price: Number(product.cost_price), stock: 999, name: 'Edited product' } })).status, 200);
    assert.equal((await pool.query('SELECT stock FROM products WHERE id = $1', [product.id])).rows[0].stock, 13);
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
