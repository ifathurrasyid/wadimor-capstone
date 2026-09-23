const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { Pool } = require('pg');
const { createApp } = require('./app');
const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST,
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5434), max: 10,
  connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000, statement_timeout: 10000,
});
pool.on('error', error => console.error('Idle database connection error:', error.message));
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
const server = createApp(pool, origins).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`WADIMOR API: http://localhost:${port}`));
server.on('error', async error => {
  console.error('HTTP server error:', error.message);
  await pool.end();
  process.exitCode = 1;
});
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  const timeout = setTimeout(() => process.exit(1), 15000);
  timeout.unref();
  server.close(async () => { await pool.end(); clearTimeout(timeout); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
