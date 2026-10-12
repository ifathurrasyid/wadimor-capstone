const express = require('express');
const { randomBytes, randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const cors = require('cors');
const { createAuth, hashPassword, verifyPassword, digest, ROLE_MAP, cookieName, cookieOptions, publicUser } = require('./auth');
const PRODUCT_IMAGE_DIR = path.join(__dirname, '../uploads/products');

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
}
function normalizeImageUrl(value) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2048) return undefined;
  if (/^\/uploads\/products\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined;
  } catch { return undefined; }
}
async function persistProductImage(imageData, imageUrl) {
  if (!imageData) {
    const normalized = normalizeImageUrl(imageUrl);
    if (normalized === undefined) throw Object.assign(new Error('Product image must be a valid HTTPS link or uploaded image.'), { code: 'INVALID_IMAGE' });
    return { url: normalized, filePath: null };
  }
  if (typeof imageData !== 'string' || imageData.length > 4_200_000) throw Object.assign(new Error('Image must be 3 MB or smaller.'), { code: 'INVALID_IMAGE' });
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageData);
  if (!match) throw Object.assign(new Error('Upload a JPG, PNG, or WebP image.'), { code: 'INVALID_IMAGE' });
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > 3 * 1024 * 1024) throw Object.assign(new Error('Image must be 3 MB or smaller.'), { code: 'INVALID_IMAGE' });
  const validSignature = match[1] === 'image/png'
    ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : match[1] === 'image/jpeg'
      ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
      : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (!validSignature) throw Object.assign(new Error('The selected file is not a valid image.'), { code: 'INVALID_IMAGE' });
  const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].slice(6);
  await fs.mkdir(PRODUCT_IMAGE_DIR, { recursive: true });
  const filePath = path.join(PRODUCT_IMAGE_DIR, randomUUID() + '.' + extension);
  await fs.writeFile(filePath, buffer, { flag: 'wx' });
  return { url: '/uploads/products/' + path.basename(filePath), filePath };
}
async function removeProductImage(imageUrl) {
  if (!/^\/uploads\/products\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(imageUrl || '')) return;
  await fs.rm(path.join(PRODUCT_IMAGE_DIR, path.basename(imageUrl)), { force: true });
}
function createApp(pool, origins = []) {
  const app = express();
  const auth = createAuth(pool, origins);
  app.disable('x-powered-by');
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads/products', express.static(PRODUCT_IMAGE_DIR, { index: false, maxAge: '1d' }));
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
    const { username, password, passwordConfirm } = req.body || {};
    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,50}$/.test(username) || displayName.length < 2 || displayName.length > 100 || typeof password !== 'string' || password.length < 8 || password.length > 128 || password !== passwordConfirm) {
      return res.status(400).json({ error: 'Nama pengguna 3â€“50 karakter (huruf, angka, _) dan kata sandi minimal 8 karakter dengan konfirmasi yang sama.' });
    }
    try {
      const passwordHash = await hashPassword(password);
      const result = await pool.query(`INSERT INTO users (username, display_name, password, role, must_change_password) VALUES ($1, $2, $3, 'pelanggan', FALSE)
        RETURNING id, username, display_name, role, must_change_password`, [username, displayName, passwordHash]);
      const session = await auth.createSession(res, result.rows[0]);
      res.status(201).json(session);
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Nama pengguna sudah dipakai.' });
      next(error);
    }
  });

  for (const [loginType, roles] of Object.entries(ROLE_MAP)) {
    app.post(`/api/auth/login/${loginType}`, auth.limitLogin, async (req, res, next) => {
      const { username, password } = req.body || {};
      if (typeof username !== 'string' || typeof password !== 'string' || username.length > 50 || password.length > 128) {
        return res.status(400).json({ error: 'Masukkan nama pengguna dan kata sandi.' });
      }
      try {
        const result = await pool.query('SELECT id, username, display_name, password, role, must_change_password FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user || !roles.includes(user.role) || !await verifyPassword(password, user.password)) {
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
    const { csrf_token: csrfToken } = req.account;
    res.json({ user: publicUser(req.account), csrfToken });
  });

  app.post('/api/auth/logout', auth.requireUser, auth.csrfGuard, async (req, res, next) => {
    try {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [req.account.token_hash]);
      res.clearCookie(cookieName(), { ...cookieOptions(), maxAge: undefined });
      res.status(204).end();
    } catch (error) { next(error); }
  });
  app.post('/api/auth/change-password', auth.requireUser, auth.csrfGuard, async (req, res, next) => {
    const { currentPassword = '', newPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'Kata sandi baru harus 8-128 karakter.' });
    }
    try {
      const result = await pool.query('SELECT password, must_change_password FROM users WHERE id = $1', [req.account.id]);
      const user = result.rows[0];
      if (!user) return res.status(404).json({ error: 'Akun tidak ditemukan.' });
      if (!user.must_change_password && !await verifyPassword(currentPassword, user.password)) {
        return res.status(401).json({ error: 'Kata sandi saat ini tidak cocok.' });
      }
      const passwordHash = await hashPassword(newPassword);
      await pool.query('UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2', [passwordHash, req.account.id]);
      await pool.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [req.account.id, req.account.token_hash]);
      res.json({ message: 'Kata sandi berhasil diperbarui.', mustChangePassword: false });
    } catch (error) { next(error); }
  });

  app.patch('/api/account/profile', auth.requireReady, auth.csrfGuard, async (req, res, next) => {
    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    if (displayName.length < 2 || displayName.length > 100) return res.status(400).json({ error: 'Nama harus 2-100 karakter.' });
    try {
      const result = await pool.query(`UPDATE users SET display_name = $1 WHERE id = $2
        RETURNING id, username, display_name, role, must_change_password`, [displayName, req.account.id]);
      res.json({ user: publicUser(result.rows[0]) });
    } catch (error) { next(error); }
  });

  app.get('/api/admin/staff', auth.requireReady, auth.requireAdmin, async (_req, res, next) => {
    try {
      const result = await pool.query(`SELECT id, username, display_name, role, must_change_password, created_at
        FROM users ORDER BY CASE role WHEN 'super_admin' THEN 0 WHEN 'admin' THEN 1 WHEN 'kasir' THEN 2 ELSE 3 END, display_name, username`);
      res.json(result.rows.map(user => ({ ...publicUser(user), createdAt: user.created_at })));
    } catch (error) { next(error); }
  });

  app.post('/api/admin/staff', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    const requestedRole = req.body?.role;
    const roleMap = { cashier: 'kasir', admin: 'admin', customer: 'pelanggan' };
    const role = roleMap[requestedRole] || null;
    const allowed = req.account.role === 'super_admin' ? ['kasir', 'admin', 'pelanggan'] : ['kasir'];
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username) || displayName.length < 2 || displayName.length > 100 || !allowed.includes(role)) {
      return res.status(400).json({ error: 'Isi nama, username valid, dan role Admin/Kasir.' });
    }
    try {
      const temporaryPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(temporaryPassword);
      const result = await pool.query(`INSERT INTO users
        (username, display_name, password, role, must_change_password, created_by)
        VALUES ($1, $2, $3, $4, TRUE, $5)
        RETURNING id, username, display_name, role, must_change_password`,
      [username, displayName, passwordHash, role, req.account.id]);
      res.status(201).json({ staff: publicUser(result.rows[0]), temporaryPassword });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Username sudah digunakan.' });
      next(error);
    }
  });

  app.post('/api/admin/staff/:id/reset-password', auth.requireReady, auth.requireSuperAdmin, auth.csrfGuard, async (req, res, next) => {
    try {
      const temporaryPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(temporaryPassword);
      const result = await pool.query(`UPDATE users SET password = $1, must_change_password = TRUE
        WHERE id = $2 AND role IN ('admin', 'kasir') RETURNING id, username, display_name, role, must_change_password`,
      [passwordHash, req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Staf tidak ditemukan atau tidak dapat direset.' });
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [req.params.id]);
      res.json({ staff: publicUser(result.rows[0]), temporaryPassword });
    } catch (error) { next(error); }
  });

  // GET CATEGORIES
  app.get('/api/categories', auth.requireReady, async (_req, res, next) => {
    try {
      const result = await pool.query('SELECT id, name, description FROM categories ORDER BY id ASC');
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  // GET PRODUCTS (Customers see without cost_price, Admins see cost_price)
  app.get('/api/products', auth.requireReady, async (req, res, next) => {
    try {
      const includeCost = ['admin', 'super_admin'].includes(req.account.role);
      const costField = includeCost ? ', p.cost_price' : '';
      const result = await pool.query(`SELECT p.id, p.category_id, p.name, p.barcode, p.image_url, p.price, p.stock, p.min_stock, c.name AS category_name ${costField}
        FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC`);
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  app.get('/api/public-config', auth.requireReady, (_req, res) => {
    const configuredQr = process.env.QRIS_IMAGE_URL || '';
    const localQr = configuredQr.startsWith('/') && !configuredQr.includes('..') && /^\/[a-z0-9_/-]+\.(?:jpe?g|png|webp)$/i.test(configuredQr);
    const qrisImageUrl = (localQr ? configuredQr : normalizeImageUrl(configuredQr)) || null;
    res.json({ qrisImageUrl, storeName: process.env.STORE_NAME || 'WADIMOR' });
  });

  // IN-STORE CHECKOUT (atomic stock update and receipt creation)
  app.post('/api/transactions/checkout', auth.requireReady, auth.csrfGuard, async (req, res, next) => {
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

      const cashierName = ['super_admin', 'admin', 'kasir'].includes(req.account.role)
        ? (req.account.display_name || req.account.username) : null;
      const cashierId = ['super_admin', 'admin', 'kasir'].includes(req.account.role) ? req.account.id : null;
      const paymentStatus = req.account.role === 'pelanggan' ? 'pending' : 'paid';
      const txResult = await client.query(`INSERT INTO transactions (user_id, cashier_id, cashier_name, total_amount, payment_method, payment_status, payment_confirmed_at, payment_confirmed_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at, payment_status`, [
        req.account.role === 'pelanggan' ? req.account.id : null,
        cashierId, cashierName, totalAmount, paymentMethod, paymentStatus,
        paymentStatus === 'paid' ? new Date() : null,
        paymentStatus === 'paid' ? cashierId : null,
      ]);
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
        receipt: { id: transactionId, createdAt: txResult.rows[0].created_at, customer: req.account.role === 'pelanggan' ? req.account.display_name : null, cashier: cashierName, paymentMethod, paymentStatus: txResult.rows[0].payment_status, items: details, totalAmount }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.message.includes('Stok tidak cukup') || error.message.includes('tidak ditemukan')) return res.status(400).json({ error: error.message });
      next(error);
    } finally { client.release(); }
  });

  async function transactionHistory(req, res, next, scope = 'customer') {
    try {
      const params = scope === 'all' ? [] : [req.account.id];
      const where = scope === 'all' ? '' : scope === 'cashier' ? 'WHERE t.cashier_id = $1 OR t.payment_status = \'pending\'' : 'WHERE t.user_id = $1';
      const result = await pool.query(`SELECT t.id, t.total_amount, t.payment_method, t.payment_status, t.payment_confirmed_at, t.created_at,
        customer.display_name AS customer_name, COALESCE(t.cashier_name, cashier.display_name, cashier.username) AS cashier_name FROM transactions t
        LEFT JOIN users customer ON customer.id = t.user_id
        LEFT JOIN users cashier ON cashier.id = t.cashier_id ${where} ORDER BY t.created_at DESC`, params);
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

  app.get('/api/transactions/mine', auth.requireReady, (req, res, next) => transactionHistory(req, res, next));
  app.get('/api/admin/transactions', auth.requireReady, auth.requireAdmin, (req, res, next) => transactionHistory(req, res, next, 'all'));
  app.get('/api/cashier/transactions', auth.requireReady, auth.requireCashier, (req, res, next) => transactionHistory(req, res, next, 'cashier'));
  app.post('/api/transactions/:id/confirm-payment', auth.requireReady, (req, res, next) => ['admin', 'super_admin', 'kasir'].includes(req.account.role) ? next() : res.status(403).json({ error: 'Khusus staf toko.' }), auth.csrfGuard, async (req, res, next) => {
    const transactionId = Number(req.params.id);
    if (!Number.isInteger(transactionId) || transactionId < 1) return res.status(400).json({ error: 'ID transaksi tidak valid.' });
    try {
      const result = await pool.query(`UPDATE transactions SET payment_status = 'paid', payment_confirmed_at = NOW(), payment_confirmed_by = $2::integer,
        cashier_id = $2::integer, cashier_name = COALESCE(cashier_name, (SELECT display_name FROM users WHERE id = $2::integer))
        WHERE id = $1 AND payment_status = 'pending' RETURNING id, payment_status, payment_confirmed_at`, [transactionId, req.account.id]);
      if (!result.rowCount) return res.status(409).json({ error: 'Transaksi tidak ditemukan atau statusnya sudah berubah.' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  });
  app.post('/api/transactions/:id/cancel', auth.requireReady, auth.csrfGuard, async (req, res, next) => {
    if (req.account.role !== 'pelanggan') return res.status(403).json({ error: 'Hanya pesanan Customer yang dapat dibatalkan di sini.' });
    const transactionId = Number(req.params.id);
    if (!Number.isInteger(transactionId) || transactionId < 1) return res.status(400).json({ error: 'ID transaksi tidak valid.' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const transaction = await client.query(`SELECT id FROM transactions WHERE id = $1 AND user_id = $2 AND payment_status = 'pending' FOR UPDATE`, [transactionId, req.account.id]);
      if (!transaction.rowCount) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Pesanan tidak ditemukan atau sudah diproses.' });
      }
      await client.query(`UPDATE products p SET stock = p.stock + td.quantity FROM transaction_details td
        WHERE td.transaction_id = $1 AND p.id = td.product_id`, [transactionId]);
      await client.query(`UPDATE transactions SET payment_status = 'cancelled' WHERE id = $1`, [transactionId]);
      await client.query('COMMIT');
      res.json({ id: transactionId, payment_status: 'cancelled' });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally { client.release(); }
  });
  // ADMIN PRODUCT CRUD
  app.post('/api/admin/products', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const { name, category_id, price, cost_price = 0, stock = 0, min_stock = 5, image_url = null, image_data = null } = req.body;
    const barcode = typeof req.body.barcode === 'string' && req.body.barcode.trim() ? req.body.barcode.trim() : null;
    if (!name || isNaN(price) || (barcode && barcode.length > 64)) return res.status(400).json({ error: 'Data produk tidak lengkap atau kode produk tidak valid.' });
    let uploadedImage;
    try {
      uploadedImage = await persistProductImage(image_data, image_url);
      const result = await pool.query(`INSERT INTO products (name, category_id, barcode, image_url, price, cost_price, stock, min_stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [name, category_id || null, barcode, uploadedImage.url, price, cost_price, stock, min_stock]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (uploadedImage?.filePath) await fs.rm(uploadedImage.filePath, { force: true });
      if (error.code === 'INVALID_IMAGE') return res.status(400).json({ error: error.message });
      if (error.code === '23505') return res.status(409).json({ error: 'Kode produk/barcode sudah digunakan.' });
      next(error);
    }
  });
  app.delete('/api/admin/staff/:id', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId) || targetId < 1) return res.status(400).json({ error: 'Invalid user ID.' });
    if (targetId === req.account.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
    try {
      const result = await pool.query(`DELETE FROM users WHERE id = $1 AND id <> $3
        AND ($2::boolean OR role = 'kasir') RETURNING id`, [targetId, req.account.role === 'super_admin', req.account.id]);
      if (!result.rowCount) return res.status(404).json({ error: 'User not found or protected.' });
      res.json({ message: 'User deleted.' });
    } catch (error) { next(error); }
  });

  app.put('/api/admin/products/:id', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    const { name, category_id, price, cost_price, stock, min_stock, image_url = null, image_data = null } = req.body;
    const barcode = typeof req.body.barcode === 'string' && req.body.barcode.trim() ? req.body.barcode.trim() : null;
    if (!name || isNaN(price) || (barcode && barcode.length > 64)) return res.status(400).json({ error: 'Data produk tidak lengkap atau kode produk tidak valid.' });
    let uploadedImage;
    let previousImageUrl;
    let saved = false;
    try {
      const previous = await pool.query('SELECT image_url FROM products WHERE id = $1', [req.params.id]);
      if (!previous.rowCount) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      previousImageUrl = previous.rows[0].image_url;
      uploadedImage = await persistProductImage(image_data, image_url);
      const result = await pool.query(`UPDATE products
        SET name = $1, category_id = $2, barcode = $3, image_url = $4, price = $5, cost_price = $6, stock = $7, min_stock = $8
        WHERE id = $9 RETURNING *`, [name, category_id || null, barcode, uploadedImage.url, price, cost_price, stock, min_stock, req.params.id]);
      if (result.rowCount === 0) {
        if (uploadedImage.filePath) await fs.rm(uploadedImage.filePath, { force: true });
        return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      }
      saved = true;
      if (previousImageUrl !== uploadedImage.url) await removeProductImage(previousImageUrl);
      res.json(result.rows[0]);
    } catch (error) {
      if (!saved && uploadedImage?.filePath) await fs.rm(uploadedImage.filePath, { force: true });
      if (error.code === 'INVALID_IMAGE') return res.status(400).json({ error: error.message });
      if (error.code === '23505') return res.status(409).json({ error: 'Kode produk/barcode sudah digunakan.' });
      next(error);
    }
  });
  app.patch('/api/admin/products/:id/stock', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
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

  app.delete('/api/admin/products/:id', auth.requireReady, auth.requireAdmin, auth.csrfGuard, async (req, res, next) => {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, image_url', [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      await removeProductImage(result.rows[0].image_url);
      res.json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
      if (error.code === '23503') return res.status(409).json({ error: 'Produk tidak dapat dihapus karena sudah ada di riwayat transaksi.' });
      next(error);
    }
  });

  // ADMIN ANALYTICS / REPORTS
  app.get('/api/admin/reports', auth.requireReady, auth.requireAdmin, async (req, res, next) => {
    const period = req.query.period || 'all'; // today, week, month, all
    let dateFilter = '';

    if (period === 'today') dateFilter = `WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE`;
    else if (period === 'week') dateFilter = `WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    else if (period === 'month') dateFilter = `WHERE payment_status = 'paid' AND created_at >= date_trunc('month', CURRENT_DATE)`;

    try {
      // 1. Overall Financials (Gross, Cost, Net)
      const txDetailsFilter = dateFilter ? dateFilter.replace('created_at', 't.created_at') : `WHERE t.payment_status = 'paid'`;

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
  app.get('/api/admin/analytics', auth.requireReady, auth.requireAdmin, async (_req, res, next) => {
    try {
      const [summary, daily, topProducts] = await Promise.all([
        pool.query(`SELECT
          (SELECT COUNT(*)::int FROM products) AS product_count,
          (SELECT COALESCE(SUM(stock), 0)::int FROM products) AS stock_units,
          (SELECT COUNT(*)::int FROM products WHERE stock <= min_stock) AS low_stock_count,
          (SELECT COUNT(*)::int FROM transactions WHERE payment_status = 'paid') AS transaction_count,
          (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE payment_status = 'paid') AS revenue`),
        pool.query(`SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(COUNT(t.id), 0)::int AS orders,
          COALESCE(SUM(t.total_amount), 0) AS revenue
          FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
          LEFT JOIN transactions t ON t.created_at >= d.day AND t.created_at < d.day + INTERVAL '1 day' AND t.payment_status = 'paid'
          GROUP BY d.day ORDER BY d.day`),
        pool.query(`SELECT p.name, SUM(td.quantity)::int AS units_sold,
          SUM(td.subtotal) AS revenue FROM transaction_details td
          JOIN products p ON p.id = td.product_id
          JOIN transactions t ON t.id = td.transaction_id AND t.payment_status = 'paid'
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




