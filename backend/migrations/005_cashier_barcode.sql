-- Adds cashier accounts and optional product codes/barcodes for in-store POS.
-- Back up the database first; apply this migration once.
BEGIN;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'kasir', 'pelanggan'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS products_barcode_unique_idx ON products(barcode) WHERE barcode IS NOT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS transactions_cashier_idx ON transactions(cashier_id);
COMMIT;
