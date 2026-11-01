const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { createPool } = require('../src/database');
const { hashPassword } = require('../src/auth');

async function provisionAdmin(pool, username, password) {
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) throw new Error('Invalid admin username');
  if (!password || password.length < 6 || password.length > 128) throw new Error('Provide an admin password (6-128 characters) as the third argument or ADMIN_PASSWORD');
  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize provisioning, including the first owner, without replacing another account.
    await client.query('LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE');
    const owner = await client.query("SELECT username FROM users WHERE role = 'admin'");
    if (owner.rowCount && owner.rows[0].username !== username) throw new Error('An owner Admin already exists. Use that username to reset its password.');
    const result = await client.query(`INSERT INTO users (username, display_name, password, role, must_change_password) VALUES ($1, $1, $2, 'admin', FALSE)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, must_change_password = FALSE
      WHERE users.role = 'admin'
      RETURNING id`, [username, passwordHash]);
    if (!result.rowCount) throw new Error('That username belongs to another account. Choose an unused owner username.');
    await client.query('DELETE FROM sessions WHERE user_id = $1', [result.rows[0].id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

async function main() {
  const username = process.argv[2] || 'admin_w';
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const pool = createPool();
  try {
    await provisionAdmin(pool, username, password);
    console.log('Owner Admin login:', username);
    console.log('Owner Admin password:', password);
    console.log('Keep this password private; rerunning this script resets it.');
  } finally { await pool.end(); }
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { provisionAdmin };



