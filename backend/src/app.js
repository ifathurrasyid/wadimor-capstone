const express = require('express');
const cors = require('cors');
const { createAuth, hashPassword, verifyPassword, digest, ROLE_MAP, cookieName, cookieOptions } = require('./auth');

function createApp(pool, origins = []) {
  const app = express();
  const auth = createAuth(pool, origins);
  app.disable('x-powered-by');
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '32kb' }));
  app.use(auth.originGuard);

  app.get('/api/status', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'unavailable', database: 'disconnected' });
    }
  });

  app.post('/api/auth/register', async (req, res, next) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,50}$/.test(username) || typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: 'Nama pengguna 3–50 karakter (huruf, angka, _) dan kata sandi minimal 12 karakter.' });
    }
    try {
      const passwordHash = await hashPassword(password);
      const result = await pool.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, 'pelanggan')
        RETURNING id, username, role`, [username, passwordHash]);
      const session = await auth.createSession(res, result.rows[0]);
      res.status(201).json(session);
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Nama pengguna sudah dipakai.' });
      next(error);
    }
  });

  for (const [loginType, role] of Object.entries(ROLE_MAP)) {
    app.post(`/api/auth/login/${loginType}`, auth.limitLogin, async (req, res, next) => {
      const { username, password } = req.body || {};
      if (typeof username !== 'string' || typeof password !== 'string' || username.length > 50 || password.length > 128) {
        return res.status(400).json({ error: 'Masukkan nama pengguna dan kata sandi.' });
      }
      try {
        const result = await pool.query('SELECT id, username, password, role FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user || user.role !== role || !await verifyPassword(password, user.password)) {
          auth.failedLogin(req.loginKey);
          return res.status(401).json({ error: 'Nama pengguna atau kata sandi tidak cocok.' });
        }
        auth.clearLogin(req.loginKey);
        const session = await auth.createSession(res, user);
        res.json(session);
      } catch (error) { next(error); }
    });
  }

  app.get('/api/auth/me', auth.requireUser, (req, res) => {
    const { id, username, role, csrf_token: csrfToken } = req.account;
    res.json({ user: { id, username, role }, csrfToken });
  });
  app.post('/api/auth/logout', auth.requireUser, auth.csrfGuard, async (req, res, next) => {
    try {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [req.account.token_hash]);
      res.clearCookie(cookieName(), { ...cookieOptions(), maxAge: undefined });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  app.get('/api/products', auth.requireUser, async (_req, res, next) => {
    try {
      const result = await pool.query(`SELECT p.id, p.name, p.price, p.stock, p.min_stock, c.name AS category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC`);
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  app.get('/api/admin/analytics', auth.requireUser, auth.requireAdmin, async (_req, res, next) => {
    try {
      const [summary, daily, topProducts] = await Promise.all([
        pool.query(`SELECT
          (SELECT COUNT(*)::int FROM products) AS product_count,
          (SELECT COALESCE(SUM(stock), 0)::int FROM products) AS stock_units,
          (SELECT COUNT(*)::int FROM products WHERE stock <= min_stock) AS low_stock_count,
          (SELECT COUNT(*)::int FROM transactions) AS transaction_count,
          (SELECT COALESCE(SUM(total_amount), 0) FROM transactions) AS revenue`),
        pool.query(`SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(COUNT(t.id), 0)::int AS orders,
          COALESCE(SUM(t.total_amount), 0) AS revenue
          FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
          LEFT JOIN transactions t ON t.created_at >= d.day AND t.created_at < d.day + INTERVAL '1 day'
          GROUP BY d.day ORDER BY d.day`),
        pool.query(`SELECT p.name, SUM(td.quantity)::int AS units_sold,
          SUM(td.subtotal) AS revenue FROM transaction_details td
          JOIN products p ON p.id = td.product_id
          GROUP BY p.id, p.name ORDER BY units_sold DESC, p.name ASC LIMIT 5`),
      ]);
      res.json({ summary: summary.rows[0], daily: daily.rows, topProducts: topProducts.rows });
    } catch (error) { next(error); }
  });

  app.use((_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Permintaan terlalu besar' });
    console.error('API error:', error.message);
    res.status(500).json({ error: 'Data belum dapat dimuat. Silakan coba lagi.' });
  });
  return app;
}
module.exports = { createApp };
