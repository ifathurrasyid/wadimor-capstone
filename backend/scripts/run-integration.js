// Explicit runner: uses temporary schemas, never resets the public schema.
const path = require('node:path');
const { spawnSync } = require('node:child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
if (!process.env.TEST_DATABASE_URL) {
  if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Configure TEST_DATABASE_URL or the local backend/.env database settings first.');
    process.exit(1);
  }
  const url = new URL('postgres://localhost');
  url.username = process.env.DB_USER;
  url.password = process.env.DB_PASSWORD;
  url.hostname = process.env.DB_HOST || '127.0.0.1';
  url.port = process.env.DB_PORT || '5434';
  url.pathname = process.env.DB_NAME;
  process.env.TEST_DATABASE_URL = url.toString();
}
const result = spawnSync(process.execPath, ['--test', path.join(__dirname, '../test/integration.test.js')], { env: process.env, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
