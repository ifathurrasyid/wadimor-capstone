-- Run after 011_single_owner.sql. No existing account is linked automatically.
BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_subject VARCHAR(255) UNIQUE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_customer_only' AND conrelid = 'users'::regclass) THEN
    ALTER TABLE users ADD CONSTRAINT users_google_customer_only CHECK (google_subject IS NULL OR role = 'pelanggan');
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS oauth_login_states (
  state_hash CHAR(64) PRIMARY KEY,
  browser_hash CHAR(64) NOT NULL,
  nonce CHAR(64) NOT NULL,
  code_verifier TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS oauth_login_states_expiry_idx ON oauth_login_states(expires_at);
COMMIT;
