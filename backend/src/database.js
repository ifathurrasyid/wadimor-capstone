const { Pool } = require('pg');

function createPool() {
  const pool = new Pool({
    ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
      user: process.env.DB_USER, host: process.env.DB_HOST,
      database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5434),
    }),
    max: process.env.VERCEL ? 2 : 10,
    connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, statement_timeout: 10000,
  });
  pool.on('error', error => console.error('Idle database connection error:', error.message));
  return pool;
}
module.exports = { createPool };
