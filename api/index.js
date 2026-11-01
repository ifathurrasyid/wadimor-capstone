// Vercel invokes this Express app; local development still uses backend/src/index.js.
const { createPool } = require('../backend/src/database');
const { createApp } = require('../backend/src/app');
const origins = (process.env.CORS_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
if (!process.env.DATABASE_URL || !origins.length) throw new Error('Configure DATABASE_URL and CORS_ORIGINS before deploying.');
module.exports = createApp(createPool(), origins);
