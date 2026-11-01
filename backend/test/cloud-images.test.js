const { test } = require('node:test');
const assert = require('node:assert/strict');
const { uploadCloudImage } = require('../src/cloud-images');

test('cloud deployments cannot silently store uploads on temporary disk', async () => {
  const before = { VERCEL: process.env.VERCEL, SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY };
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.VERCEL;
    assert.equal(await uploadCloudImage('test.png', Buffer.from('test'), 'image/png'), null);
    process.env.VERCEL = '1';
    await assert.rejects(uploadCloudImage('test.png', Buffer.from('test'), 'image/png'), /Configure Supabase Storage/);
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
