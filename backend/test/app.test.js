const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { hashPassword, digest } = require('../src/auth');

function fakeDatabase() {
  const users = new Map();
  const sessions = new Map();
  let nextId = 1;
  const metrics = {
    summary: { product_count: 1, stock_units: 4, low_stock_count: 1, transaction_count: 0, revenue: '0' },
    daily: [{ day: '2026-09-23', orders: 0, revenue: '0' }], topProducts: [],
  };
  return {
    users, sessions,
    async connect() {
      return {
        query: this.query.bind(this),
        release: () => {}
      };
    },
    async query(sql, params = []) {
      if (sql === 'SELECT 1') return { rows: [{ '?column?': 1 }] };
      if (sql.startsWith('INSERT INTO users')) {
        if (users.has(params[0])) { const error = new Error('duplicate'); error.code = '23505'; throw error; }
        const user = { id: nextId++, username: params[0], display_name: params[0], password: params[1], role: 'pelanggan', must_change_password: false };
        users.set(user.username, user);
        return { rows: [user] };
      }
      if (sql.includes('FROM users WHERE username = ')) return { rows: users.has(params[0]) ? [users.get(params[0])] : [] };
      if (sql.startsWith('INSERT INTO sessions')) { sessions.set(params[0], { token_hash: params[0], user_id: params[1], csrf_token: params[2] }); return { rows: [] }; }
      if (sql.includes('FROM sessions s JOIN users')) {
        const session = sessions.get(params[0]);
        const user = [...users.values()].find(item => item.id === session?.user_id);
        return { rows: user ? [{ ...session, id: user.id, username: user.username, display_name: user.display_name || user.username, role: user.role, must_change_password: Boolean(user.must_change_password) }] : [] };
      }
      if (sql.startsWith('SELECT password, must_change_password FROM users')) {
        const user = [...users.values()].find(item => item.id === params[0]);
        return { rows: user ? [{ password: user.password, must_change_password: user.must_change_password }] : [] };
      }
      if (sql.startsWith('UPDATE users SET password = $1, must_change_password = FALSE')) {
        const user = [...users.values()].find(item => item.id === params[1]);
        if (user) { user.password = params[0]; user.must_change_password = false; }
        return { rows: [], rowCount: user ? 1 : 0 };
      }
      if (sql.startsWith('DELETE FROM sessions WHERE user_id')) {
        for (const [key, session] of sessions) if (session.user_id === params[0] && (!params[1] || key !== params[1])) sessions.delete(key);
        return { rows: [] };
      }
      if (sql.startsWith('DELETE FROM sessions')) { sessions.delete(params[0]); return { rows: [] }; }
      if (sql.includes('FROM products p LEFT JOIN')) return { rows: [{ id: 1, name: 'Beras', price: '75000.00', stock: 4, min_stock: 5, category_name: null }] };
      if (sql.includes('AS product_count')) return { rows: [metrics.summary] };
      if (sql.includes('generate_series')) return { rows: metrics.daily };
      if (sql.includes('FROM transaction_details td')) return { rows: metrics.topProducts };
      throw new Error(`Unhandled query: ${sql}`);
    },
  };
}
async function serve(t, pool = fakeDatabase()) {
  const server = createApp(pool, ['http://localhost:5173']).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { url: `http://127.0.0.1:${server.address().port}`, pool };
}
async function post(url, path, body, headers = {}) {
  return fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...headers }, body: JSON.stringify(body) });
}
async function adminLogin(url, pool) {
  pool.users.set('admin_w', { id: 99, username: 'admin_w', display_name: 'Admin WADIMOR', password: await hashPassword('admin-password-123'), role: 'admin', must_change_password: false });
  const response = await post(url, '/api/auth/login/admin', { username: 'admin_w', password: 'admin-password-123' });
  return { response, cookie: response.headers.get('set-cookie').split(';')[0], body: await response.json() };
}
test('readiness reports a database outage', async t => {
  const pool = fakeDatabase();
  const { url } = await serve(t, pool);
  assert.equal((await fetch(url + '/api/status')).status, 200);
  pool.query = async () => { throw new Error('unavailable'); };
  assert.equal((await fetch(url + '/api/status')).status, 503);
});
test('customer registration hashes passwords, creates a session, and cannot see admin metrics', async t => {
  const { url, pool } = await serve(t);
  const response = await post(url, '/api/auth/register', { username: 'buyer_one', password: 'customer-password-123' });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.user.role, 'pelanggan');
  assert.match(pool.users.get('buyer_one').password, /^scrypt\$/);
  assert.notEqual(pool.users.get('buyer_one').password, 'customer-password-123');
  const cookie = response.headers.get('set-cookie').split(';')[0];
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=Strict/);
  assert.equal((await fetch(url + '/api/products')).status, 401);
  assert.equal((await fetch(url + '/api/products', { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await fetch(url + '/api/admin/analytics', { headers: { Cookie: cookie } })).status, 403);
  assert.equal((await post(url, '/api/auth/login/admin', { username: 'buyer_one', password: 'customer-password-123' })).status, 401);
  assert.equal((await post(url, '/api/auth/register', { username: 'buyer_one', password: 'another-password-123' })).status, 409);
});
test('admin login returns database analytics and customer login rejects admin role', async t => {
  const { url, pool } = await serve(t);
  const { response, cookie, body } = await adminLogin(url, pool);
  assert.equal(response.status, 200);
  assert.equal(body.user.role, 'admin');
  const analytics = await fetch(url + '/api/admin/analytics', { headers: { Cookie: cookie } });
  assert.equal(analytics.status, 200);
  assert.deepEqual((await analytics.json()).summary, { product_count: 1, stock_units: 4, low_stock_count: 1, transaction_count: 0, revenue: '0' });
  assert.equal((await post(url, '/api/auth/login/customer', { username: 'admin_w', password: 'admin-password-123' })).status, 401);
});
test('logout requires CSRF token and revokes the server session', async t => {
  const { url, pool } = await serve(t);
  const { cookie, body } = await adminLogin(url, pool);
  assert.equal((await post(url, '/api/auth/logout', {}, { Cookie: cookie })).status, 403);
  assert.equal((await post(url, '/api/auth/logout', {}, { Cookie: cookie, Origin: 'https://evil.example', 'x-csrf-token': body.csrfToken })).status, 403);
  assert.equal((await post(url, '/api/auth/logout', {}, { Cookie: cookie, 'x-csrf-token': body.csrfToken })).status, 204);
  assert.equal((await fetch(url + '/api/auth/me', { headers: { Cookie: cookie } })).status, 401);
  assert.equal(pool.sessions.has(digest(cookie.split('=')[1])), false);
});
test('checkout processes correctly when stock is sufficient', async t => {
  const { url, pool } = await serve(t);

  // mock for checkout
  const originalQuery = pool.query;
  pool.query = async (sql, params = []) => {
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
    if (sql.includes('INSERT INTO users')) {
      const user = { id: 2, username: params[0], password: params[1], role: 'pelanggan' };
      pool.users.set(user.username, user);
      return { rows: [user] };
    }
    if (sql.includes('FROM products WHERE id = ANY')) return { rows: [{ id: 1, name: 'Beras', price: 75000, cost_price: 66000, stock: 10 }] };
    if (sql.includes('UPDATE products SET stock')) return { rows: [] };
    if (sql.includes('INSERT INTO transactions')) return { rows: [{ id: 101, created_at: new Date() }] };
    if (sql.includes('INSERT INTO transaction_details')) return { rows: [] };
    return originalQuery(sql, params);
  };

  const response = await post(url, '/api/auth/register', { username: 'buyer_two', password: 'customer-password-123' });
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const { csrfToken } = await (await fetch(url + '/api/auth/me', { headers: { Cookie: cookie } })).json();

  const checkoutResponse = await post(url, '/api/transactions/checkout', {
    items: [{ productId: 1, quantity: 2 }],
    paymentMethod: 'cash'
  }, { Cookie: cookie, 'x-csrf-token': csrfToken });

  assert.equal(checkoutResponse.status, 201);
  const result = await checkoutResponse.json();
  assert.equal(result.receipt.id, 101);
  assert.equal(result.receipt.totalAmount, 150000);
  assert.equal(result.receipt.paymentMethod, 'cash');
  assert.equal(result.receipt.items[0].name, 'Beras');
});

test('admin can retrieve net profit reports', async t => {
  const { url, pool } = await serve(t);

  // override query for admin logic
  const originalQuery = pool.query;
  pool.query = async (sql, params = []) => {
    if (sql.includes('FROM users WHERE username = ')) return { rows: [{ id: 99, username: 'admin_w', display_name: 'Admin WADIMOR', password: await hashPassword('admin123'), role: 'admin', must_change_password: false }] };
    if (sql.includes('INSERT INTO sessions')) { pool.sessions.set(params[0], { token_hash: params[0], user_id: 99, csrf_token: params[2] }); return { rows: [] }; }
    if (sql.includes('SELECT * FROM sessions')) return { rows: [{ user_id: 99 }] };
    if (sql.includes('FROM sessions s JOIN users')) return { rows: [{ id: 99, username: 'admin_w', display_name: 'Admin WADIMOR', role: 'admin', must_change_password: false, token_hash: params[0] }] };
    if (sql.includes('laba_bersih')) return { rows: [{ omset: 150000, hpp: 132000, laba_bersih: 18000, total_orders: 1 }] };
    if (sql.includes('units_sold')) return { rows: [{ name: 'Beras', units_sold: 2, revenue: 150000 }] };
    return originalQuery(sql, params);
  };

  const response = await post(url, '/api/auth/login/admin', { username: 'admin_w', password: 'admin123' });
  const cookie = response.headers.get('set-cookie').split(';')[0];

  const reportResponse = await fetch(url + '/api/admin/reports?period=all', { headers: { Cookie: cookie } });
  assert.equal(reportResponse.status, 200);
  const data = await reportResponse.json();
  assert.equal(data.financials.laba_bersih, 18000);
  assert.equal(data.topProducts[0].name, 'Beras');
});

test('temporary-password cashier is blocked until choosing a private password', async t => {
  const { url, pool } = await serve(t);
  pool.users.set('cashier_one', { id: 42, username: 'cashier_one', display_name: 'Sinta', password: await hashPassword('TempPass123'), role: 'kasir', must_change_password: true });
  const login = await post(url, '/api/auth/login/cashier', { username: 'cashier_one', password: 'TempPass123' });
  assert.equal(login.status, 200);
  const body = await login.json();
  assert.equal(body.user.mustChangePassword, true);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(url + '/api/products', { headers: { Cookie: cookie } })).status, 428);
  const changed = await post(url, '/api/auth/change-password', { newPassword: 'PrivatePass456' }, { Cookie: cookie, 'x-csrf-token': body.csrfToken });
  assert.equal(changed.status, 200);
  assert.equal(pool.users.get('cashier_one').must_change_password, false);
  assert.equal((await fetch(url + '/api/products', { headers: { Cookie: cookie } })).status, 200);
});
test('plaintext legacy passwords and bad requests cannot authenticate', async t => {
  const { url, pool } = await serve(t);
  pool.users.set('legacy', { id: 1, username: 'legacy', display_name: 'Legacy', password: 'cust123', role: 'pelanggan', must_change_password: false });
  assert.equal((await post(url, '/api/auth/login/customer', { username: 'legacy', password: 'cust123' })).status, 401);
  assert.equal((await post(url, '/api/auth/register', { username: 'x', password: 'abc' })).status, 400);
  const malformed = await fetch(url + '/api/auth/login/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(url + '/api/missing')).status, 404);
});

