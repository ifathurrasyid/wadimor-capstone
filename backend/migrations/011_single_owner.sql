-- Existing databases through migration 010 only; bootstrap already includes these rules.
BEGIN;
LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE;
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM users WHERE role IN ('super_admin', 'admin')) > 1 THEN
    RAISE EXCEPTION 'Multiple owner candidates: choose the owner and change other admin/super_admin accounts to kasir before applying migration 011.';
  END IF;
END;
$$;
-- Require a fresh login after changing the old owner's role.
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE role = 'super_admin');
UPDATE users SET role = 'admin' WHERE role = 'super_admin';
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'kasir', 'pelanggan'));
CREATE UNIQUE INDEX users_single_admin_idx ON users (role) WHERE role = 'admin';
COMMIT;
