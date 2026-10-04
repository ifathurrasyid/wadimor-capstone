const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { randomBytes } = require('node:crypto');
const { Pool } = require('pg');
const { hashPassword } = require('../src/auth');

async function main() {
  const username = process.argv[2] || 'admin_w';
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) throw new Error('Invalid admin username');
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  if (!password || password.length < 4 || password.length > 128) throw new Error('Provide an admin password (4-128 characters) as the third argument or ADMIN_PASSWORD');
  const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_NAME, password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5434), connectionTimeoutMillis: 5000,
  });
  try {
    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`INSERT INTO users (username, display_name, password, role, must_change_password) VALUES ($1, $1, $2, 'super_admin', FALSE)
        ON CONFLICT (username) DO UPDATE SET display_name = EXCLUDED.display_name, password = EXCLUDED.password, role = 'super_admin', must_change_password = FALSE
        RETURNING id`, [username, passwordHash]);
      await client.query('DELETE FROM sessions WHERE user_id = $1', [result.rows[0].id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
    console.log('Super Admin login:', username);
    console.log('Super Admin password:', password);
    console.log('Keep this password private; rerunning this script resets it.');
  } finally { await pool.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });



