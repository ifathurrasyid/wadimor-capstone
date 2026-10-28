-- Remove unused Google sign-in metadata; preserve all users and business data.
BEGIN;
DROP TABLE IF EXISTS oauth_login_states;
ALTER TABLE users DROP COLUMN IF EXISTS google_subject;
COMMIT;
