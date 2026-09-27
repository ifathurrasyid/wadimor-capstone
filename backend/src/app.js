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
      return res.status(400).json({ error: 'Nama pengguna 3â€“50 karakter (huruf, angka, _) dan kata sandi minimal 12 karakter.' });
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

  // GET CATEGORIES
  app.get('/api/categories', auth.requireUser, async (_req, res, next) => {
    try {
      const result = await pool.query('SELECT id, name, description FROM categories ORDER BY id ASC');
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  // GET PRODUCTS (Customers see without cost_price, Admins see cost_price)
  app.get('/api/products', auth.requireUser, async (req, res, next) => {
    try {
      const includeCost = req.account.role === 'admin';
      const costField = includeCost ? ', p.cost_price' : '';
      const result = await pool.query(`SELECT p.id, p.category_id, p.name, p.price, p.stock, p.min_stock, c.name AS category_name ${costField}
        FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC`);
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  // IN-STORE CHECKOUT (atomic stock update and receipt creation)
  app.post('/api/transactions/checkout', auth.requireUser, auth.csrfGuard, async (req, res, next) => {
    const { items, paymentMethod = 'cash' } = req.body || {};
    const validPaymentMethods = ['cash', 'card', 'qris'];
    if (!Array.isArray(items) || items.length === 0 || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Keranjang atau metode pembayaran tidak valid.' });
    }
    if (items.some(item => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ error: 'Item transaksi tidak valid.' });
    }
    const quantities = new Map();
    for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    const normalizedItems = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const productIds = normalizedItems.map(item => item.productId).sort((a, b) => a - b);
      const { rows: products } = await client.query(`SELECT id, name, price, cost_price, stock
        FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`, [productIds]);
      if (products.length !== productIds.length) throw new Error('Salah satu produk tidak ditemukan.');

      let totalAmount = 0;
      const details = normalizedItems.map(item => {
        const product = products.find(entry => entry.id === item.productId);
        if (product.stock < item.quantity) throw new Error(`Stok tidak cukup untuk ${product.name}. Tersisa: ${product.stock}`);
        const unitPrice = Number(product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;
        return { productId: product.id, name: product.name, quantity: item.quantity, unitPrice, cost: Number(product.cost_price), subtotal };
      });

      const txResult = await client.query(`INSERT INTO transactions (user_id, total_amount, payment_method)
        VALUES ($1, $2, $3) RETURNING id, created_at`, [req.account.id, totalAmount, paymentMethod]);
      const transactionId = txResult.rows[0].id;
      for (const detail of details) {
        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [detail.quantity, detail.productId]);
        await client.query(`INSERT INTO transaction_details
          (transaction_id, product_id, quantity, price_at_transaction, cost_at_transaction, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)`,
        [transactionId, detail.productId, detail.quantity, detail.unitPrice, detail.cost, detail.subtotal]);
      }
      await client.query('COMMIT');
      res.status(201).json({
        receipt: { id: transactionId, createdAt: txResult.rows[0].created_at, customer: req.account.username, paymentMethod, items: details, totalAmount }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.message.includes('Stok tidak cukup') || error.message.includes('tidak ditemukan')) return res.status(400).json({ error: error.message });
      next(error);
    } finally { client.release(); }
  });

  async function transactionHistory(req, res, next, admin = false) {
    try {
      const params = admin ? [] : [req.account.id];
      const where = admin ? '' : 'WHERE t.user_id = $1';
      const result = await pool.query(`SELECT t.id, t.total_amount, t.payment_method, t.created_at,
        u.username AS customer_name FROM transactions t
        LEFT JOIN users u ON u.id = t.user_id ${where} ORDER BY t.created_at DESC`, params);
      const transactionIds = result.rows.map(row => row.id);
      const detailsByTransaction = {};
      if (transactionIds.length) {
        const detailsResult = await pool.query(`SELECT td.transaction_id, td.quantity, td.price_at_transaction,
          td.subtotal, p.name AS product_name FROM transaction_details td
          JOIN products p ON p.id = td.product_id WHERE td.transaction_id = ANY($1)
          ORDER BY td.id`, [transactionIds]);
        for (const detail of detailsResult.rows) {
          if (!detailsByTransaction[detail.transaction_id]) detailsByTransaction[detail.transaction_id] = [];
          detailsByTransaction[detail.transaction_id].push(detail);
        }
      }
      res.json(result.rows.map(transaction => ({ ...transaction, items: detailsByTransaction[transaction.id] || [] })));
    } catch (error) { next(error); }
  }

  app.get('/api/transactions/mine', auth.requireUser, (req, res, next) => transactionHistory(req, res, next));
  app.get('/api/admin/transactions', auth.requireUser, auth.requireAdmin, (req, res, next) => transactionHistory(req, res, next, true));
  // ADMIN PRODUCT CRUD
  app.post('/api/admin/products', auth.requireUser, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const { name, category_id, price, cost_price = 0, stock = 0, min_stock = 5 } = req.body;
    if (!name || isNaN(price)) return res.status(400).json({ error: 'Data produk tidak lengkap.' });

    try {
      const result = await pool.query(`
        INSERT INTO products (name, category_id, price, cost_price, stock, min_stock)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `, [name, category_id || null, price, cost_price, stock, min_stock]);
      res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
  });

  app.put('/api/admin/products/:id', auth.requireUser, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const { name, category_id, price, cost_price, stock, min_stock } = req.body;
    if (!name || isNaN(price)) return res.status(400).json({ error: 'Data produk tidak lengkap.' });

    try {
      const result = await pool.query(`
        UPDATE products
        SET name = $1, category_id = $2, price = $3, cost_price = $4, stock = $5, min_stock = $6
        WHERE id = $7 RETURNING *
      `, [name, category_id || null, price, cost_price, stock, min_stock, req.params.id]);

      if (result.rowCount === 0) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  });

  app.patch('/api/admin/products/:id/stock', auth.requireUser, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const { amount } = req.body; // e.g. +5 or -1
    if (isNaN(amount)) return res.status(400).json({ error: 'Amount harus berupa angka.' });

    try {
      const result = await pool.query(`
        UPDATE products SET stock = GREATEST(0, stock + $1) WHERE id = $2 RETURNING id, stock
      `, [amount, req.params.id]);

      if (result.rowCount === 0) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  });

  app.delete('/api/admin/products/:id', auth.requireUser, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      res.json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
      if (error.code === '23503') return res.status(409).json({ error: 'Produk tidak dapat dihapus karena sudah ada di riwayat transaksi.' });
      next(error);
    }
  });

  // ADMIN ANALYTICS / REPORTS
  app.get('/api/admin/reports', auth.requireUser, auth.requireAdmin, async (req, res, next) => {
    const period = req.query.period || 'all'; // today, week, month, all
    let dateFilter = '';

    if (period === 'today') dateFilter = `WHERE created_at >= CURRENT_DATE`;
    else if (period === 'week') dateFilter = `WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    else if (period === 'month') dateFilter = `WHERE created_at >= date_trunc('month', CURRENT_DATE)`;

    try {
      // 1. Overall Financials (Gross, Cost, Net)
      const txDetailsFilter = dateFilter ? dateFilter.replace('created_at', 't.created_at') : '';

      const financialsResult = await pool.query(`
        SELECT
          COALESCE(SUM(td.subtotal), 0) AS omset,
          COALESCE(SUM(td.quantity * td.cost_at_transaction), 0) AS hpp,
          COALESCE(SUM(td.subtotal - (td.quantity * td.cost_at_transaction)), 0) AS laba_bersih,
          COUNT(DISTINCT t.id) AS total_orders
        FROM transaction_details td
        JOIN transactions t ON t.id = td.transaction_id
        ${txDetailsFilter}
      `);

      // 2. Top Selling Products
      const topProductsResult = await pool.query(`
        SELECT p.name, SUM(td.quantity)::int AS units_sold,
          SUM(td.subtotal) AS revenue
        FROM transaction_details td
        JOIN transactions t ON t.id = td.transaction_id
        JOIN products p ON p.id = td.product_id
        ${txDetailsFilter}
        GROUP BY p.id, p.name
        ORDER BY units_sold DESC, p.name ASC
        LIMIT 5
      `);

      res.json({
        financials: financialsResult.rows[0],
        topProducts: topProductsResult.rows
      });
    } catch (error) { next(error); }
  });

  // Legacy analytics (if still needed by existing frontend before refactoring)
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
