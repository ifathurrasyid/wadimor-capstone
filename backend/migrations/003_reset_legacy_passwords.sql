-- Original demo users used plaintext passwords. Make those credentials unusable.
-- Apply once after backing up. Users must register anew or be provisioned with a hash.
BEGIN;
UPDATE users SET password = '!reset-required'
WHERE password NOT LIKE 'scrypt$%';
COMMIT;
