-- Adds staff lifecycle: super admin provisioning, display names, and forced temporary-password replacement.
BEGIN;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'kasir', 'pelanggan'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
UPDATE users SET display_name = username WHERE display_name IS NULL OR BTRIM(display_name) = '';
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
UPDATE users SET role = 'super_admin'
WHERE id = (SELECT id FROM users WHERE role = 'admin' ORDER BY created_at, id LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin');
COMMIT;
