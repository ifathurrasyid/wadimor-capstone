BEGIN;
ALTER TABLE transactions
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  ADD COLUMN payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN payment_confirmed_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE transactions ALTER COLUMN payment_status SET DEFAULT 'pending';
COMMIT;
