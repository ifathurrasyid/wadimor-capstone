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
    async query(sql, params = []) {
      if (sql === 'SELECT 1') return { rows: [{ '?column?': 1 }] };
      if (sql.startsWith('INSERT INTO users')) {
        if (users.has(params[0])) { const error = new Error('duplicate'); error.code = '23505'; throw error; }
        const user = { id: nextId++, username: params[0], password: params[1], role: 'pelanggan' };
        users.set(user.username, user);
        return { rows: [user] };
      }
      if (sql.startsWith('SELECT id, username, password, role FROM users')) return { rows: users.has(params[0]) ? [users.get(params[0])] : [] };
      if (sql.startsWith('INSERT INTO sessions')) { sessions.set(params[0], { token_hash: params[0], user_id: params[1], csrf_token: params[2] }); return { rows: [] }; }
      if (sql.includes('FROM sessions s JOIN users')) {
        const session = sessions.get(params[0]);
        const user = [...users.values()].find(item => item.id === session?.user_id);
        return { rows: user ? [{ ...session, id: user.id, username: user.username, role: user.role }] : [] };
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
  pool.users.set('admin_w', { id: 99, username: 'admin_w', password: await hashPassword('admin-password-123'), role: 'admin' });
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
test('plaintext legacy passwords and bad requests cannot authenticate', async t => {
  const { url, pool } = await serve(t);
  pool.users.set('legacy', { id: 1, username: 'legacy', password: 'cust123', role: 'pelanggan' });
  assert.equal((await post(url, '/api/auth/login/customer', { username: 'legacy', password: 'cust123' })).status, 401);
  assert.equal((await post(url, '/api/auth/register', { username: 'x', password: 'short' })).status, 400);
  const malformed = await fetch(url + '/api/auth/login/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(url + '/api/missing')).status, 404);
});
