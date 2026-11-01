const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

function connectionOptions() {
  if (!process.env.DATABASE_URL) return {
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5434),
  };
  const url = new URL(process.env.DATABASE_URL);
  if (/\.pooler\.supabase\.com$/.test(url.hostname) || /^db\.[a-z0-9]+\.supabase\.co$/.test(url.hostname)) {
    // pg's URI SSL parameters override ssl.ca; use the trusted Supabase CA explicitly.
    for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat']) url.searchParams.delete(key);
    return { connectionString: url.toString(), ssl: {
      ca: fs.readFileSync(path.join(__dirname, '../certs/supabase-ca.crt'), 'utf8'),
      rejectUnauthorized: true,
    } };
  }
  return { connectionString: process.env.DATABASE_URL };
}

function createPool() {
  const pool = new Pool({
    ...connectionOptions(),
    max: process.env.VERCEL ? 2 : 10,
    connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, statement_timeout: 10000,
  });
  pool.on('error', error => console.error('Idle database connection error:', error.message));
  return pool;
}
module.exports = { createPool, connectionOptions };
