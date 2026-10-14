-- Existing databases through migration 009. Preserves all existing records.
BEGIN;
CREATE TABLE stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(100) NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('opening', 'delivery', 'correction', 'sale', 'cancellation')),
  reason VARCHAR(300) NOT NULL,
  quantity INTEGER NOT NULL,
  stock_before INTEGER NOT NULL CHECK (stock_before >= 0),
  stock_after INTEGER NOT NULL CHECK (stock_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (stock_after = stock_before + quantity)
);
CREATE INDEX stock_movements_product_idx ON stock_movements(product_id, id DESC);
INSERT INTO stock_movements (product_id, product_name, actor_name, kind, reason, quantity, stock_before, stock_after)
SELECT id, name, 'System', 'opening', 'Opening balance when stock history was enabled', stock, 0, stock FROM products;
CREATE FUNCTION record_stock_movement() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE prior INTEGER := 0;
BEGIN
  IF TG_OP = 'UPDATE' THEN prior := OLD.stock; END IF;
  IF TG_OP = 'INSERT' OR NEW.stock <> prior THEN
    INSERT INTO stock_movements (product_id, product_name, actor_id, actor_name, transaction_id, kind, reason, quantity, stock_before, stock_after)
    VALUES (NEW.id, NEW.name, NULLIF(current_setting('wadimor.actor_id', true), '')::integer,
      COALESCE(NULLIF(current_setting('wadimor.actor_name', true), ''), 'System'),
      NULLIF(current_setting('wadimor.transaction_id', true), '')::integer,
      COALESCE(NULLIF(current_setting('wadimor.kind', true), ''), CASE WHEN TG_OP = 'INSERT' THEN 'opening' ELSE 'correction' END),
      COALESCE(NULLIF(current_setting('wadimor.reason', true), ''), 'Database stock change'),
      NEW.stock - prior, prior, NEW.stock);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER products_stock_history AFTER INSERT OR UPDATE OF stock ON products
FOR EACH ROW EXECUTE FUNCTION record_stock_movement();

ALTER TABLE transactions ADD COLUMN cash_tendered NUMERIC(12, 2), ADD COLUMN cash_change NUMERIC(12, 2),
  ADD CONSTRAINT transactions_cash_check CHECK (
    (cash_tendered IS NULL AND cash_change IS NULL) OR
    (cash_tendered IS NOT NULL AND cash_change IS NOT NULL AND payment_method = 'cash'
      AND cash_tendered >= total_amount AND cash_change = cash_tendered - total_amount));
CREATE TABLE checkout_requests (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_key VARCHAR(100) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, request_key)
);
ALTER TABLE transaction_details ADD COLUMN product_name VARCHAR(150);
UPDATE transaction_details td SET product_name = p.name FROM products p WHERE p.id = td.product_id;
ALTER TABLE transaction_details ALTER COLUMN product_name SET NOT NULL;
CREATE INDEX transactions_user_page_idx ON transactions(user_id, created_at DESC, id DESC);
CREATE INDEX transactions_cashier_page_idx ON transactions(cashier_id, created_at DESC, id DESC);
COMMIT;
