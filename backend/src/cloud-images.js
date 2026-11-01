const { createClient } = require('@supabase/supabase-js');
let client;
function storage() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  client ||= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client.storage.from(process.env.SUPABASE_STORAGE_BUCKET || 'product-images');
}
async function uploadCloudImage(name, buffer, contentType) {
  const bucket = storage();
  if (!bucket) {
    if (process.env.VERCEL) throw new Error('Configure Supabase Storage before uploading images.');
    return null;
  }
  const { error } = await bucket.upload(name, buffer, { contentType, upsert: false });
  if (error) throw new Error('Product image upload failed.');
  return bucket.getPublicUrl(name).data.publicUrl;
}
async function removeCloudImage(url) {
  if (!process.env.SUPABASE_URL) return;
  const prefix = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET || 'product-images'}/`;
  if (!url?.startsWith(prefix)) return;
  const name = url.slice(prefix.length);
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/i.test(name)) return;
  const bucket = storage();
  if (!bucket) return;
  const { error } = await bucket.remove([name]);
  if (error) console.error('Product image cleanup failed.');
}
module.exports = { uploadCloudImage, removeCloudImage };
