const { randomBytes, createHash, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);
const SESSION_DAYS = 7;
const ROLE_MAP = { admin: ['admin', 'super_admin'], cashier: ['kasir'], customer: ['pelanggan'] };

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(stored)) return false;
  const [, salt, encoded] = stored.split('$');
  const candidate = await scrypt(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(encoded, 'hex'));
}

function digest(token) { return createHash('sha256').update(token).digest('hex'); }
function cookieName() { return process.env.NODE_ENV === 'production' ? '__Host-wadimor_session' : 'wadimor_session'; }
function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_DAYS * 86400000 };
}
function getCookie(req) {
  const prefix = `${cookieName()}=`;
  const raw = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(prefix));
  const value = raw?.slice(prefix.length);
  return value && /^[0-9a-f]{64}$/.test(value) ? value : null;
}
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name || user.displayName || user.username,
    role: user.role,
    mustChangePassword: Boolean(user.must_change_password ?? user.mustChangePassword),
  };
}
async function createSession(pool, res, user) {
  const token = randomBytes(32).toString('hex');
  const csrfToken = randomBytes(32).toString('hex');
  await pool.query(`INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`, [digest(token), user.id, csrfToken]);
  res.cookie(cookieName(), token, cookieOptions());
  return { user: publicUser(user), csrfToken };
}
function createAuth(pool, origins) {
  const attempts = new Map();
  function originGuard(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin && !origins.includes(origin)) return res.status(403).json({ error: 'Asal permintaan tidak diizinkan' });
    return next();
  }
  async function requireUser(req, res, next) {
    const token = getCookie(req);
    if (!token) return res.status(401).json({ error: 'Silakan masuk terlebih dahulu' });
    try {
      const result = await pool.query(`SELECT s.token_hash, s.csrf_token, u.id, u.username, u.display_name, u.role, u.must_change_password
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1 AND s.expires_at > NOW()`, [digest(token)]);
      if (!result.rows.length) return res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
      req.account = result.rows[0];
      next();
    } catch (error) { next(error); }
  }
  function requireReady(req, res, next) {
    return requireUser(req, res, () => req.account.must_change_password
      ? res.status(428).json({ error: 'Ganti kata sandi sementara sebelum melanjutkan.', code: 'PASSWORD_CHANGE_REQUIRED' })
      : next());
  }
  function requireAdmin(req, res, next) {
    return ['admin', 'super_admin'].includes(req.account.role) ? next() : res.status(403).json({ error: 'Khusus admin' });
  }
  function requireSuperAdmin(req, res, next) {
    return req.account.role === 'super_admin' ? next() : res.status(403).json({ error: 'Khusus super admin' });
  }
  function requireCashier(req, res, next) {
    return req.account.role === 'kasir' ? next() : res.status(403).json({ error: 'Khusus kasir' });
  }
  function csrfGuard(req, res, next) {
    const supplied = req.get('x-csrf-token');
    const expected = req.account.csrf_token;
    if (!supplied || !/^[0-9a-f]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
      return res.status(403).json({ error: 'Token keamanan tidak valid' });
    }
    next();
  }
  function limitLogin(req, res, next) {
    const key = req.ip;
    const now = Date.now();
    if (attempts.size > 1000) for (const [name, record] of attempts) if (record.until <= now) attempts.delete(name);
    const record = attempts.get(key);
    if (record && record.until > now && record.count >= 5) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
    req.loginKey = key;
    next();
  }
  function failedLogin(key) {
    const current = attempts.get(key);
    const now = Date.now();
    attempts.set(key, current && current.until > now ? { ...current, count: current.count + 1 } : { count: 1, until: now + 900000 });
  }
  function clearLogin(key) { attempts.delete(key); }
  return { originGuard, requireUser, requireReady, requireAdmin, requireSuperAdmin, requireCashier, csrfGuard, limitLogin, failedLogin, clearLogin, createSession: (res, user) => createSession(pool, res, user), getCookie, publicUser };
}
module.exports = { createAuth, hashPassword, verifyPassword, digest, ROLE_MAP, cookieName, cookieOptions, publicUser };
