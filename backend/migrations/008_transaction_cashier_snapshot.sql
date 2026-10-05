ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS cashier_name VARCHAR(100);

UPDATE transactions t
SET cashier_name = COALESCE(u.display_name, u.username)
FROM users u
WHERE t.cashier_id = u.id
  AND t.cashier_name IS NULL;
