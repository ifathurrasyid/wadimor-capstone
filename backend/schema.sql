-- Bootstrap only: run against an EMPTY database. Existing tables cause a rollback.
BEGIN;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Password HASH only; never plaintext.
    role VARCHAR(20) NOT NULL DEFAULT 'pelanggan' CHECK (role IN ('super_admin', 'admin', 'kasir', 'pelanggan')),
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    barcode VARCHAR(64) UNIQUE,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cashier_name VARCHAR(100),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_confirmed_at TIMESTAMPTZ,
    payment_confirmed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE transaction_details (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_transaction NUMERIC(10, 2) NOT NULL CHECK (price_at_transaction >= 0),
    cost_at_transaction NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal = quantity * price_at_transaction)
);
CREATE TABLE sessions (
    token_hash CHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token CHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX transactions_user_idx ON transactions(user_id);
CREATE INDEX transactions_cashier_idx ON transactions(cashier_id);
CREATE INDEX transactions_created_idx ON transactions(created_at);
CREATE INDEX details_transaction_idx ON transaction_details(transaction_id);
CREATE INDEX details_product_idx ON transaction_details(product_id);
CREATE FUNCTION touch_product_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION touch_product_updated_at();
-- Demo catalog only. Create users through a future password-hashing registration flow.
INSERT INTO categories (name, description) VALUES
('Sembako', 'Kebutuhan pokok harian'), ('Minuman', 'Minuman ringan dan kemasan'), ('Cemilan', 'Makanan ringan dan biskuit');
INSERT INTO products (category_id, name, price, cost_price, stock, min_stock) VALUES
(1, 'Beras Sania 5kg', 75000, 66000, 20, 5),
(1, 'Minyak Goreng Bimoli 2L', 34000, 30000, 15, 5),
(2, 'Le Minerale 600ml', 3500, 2600, 50, 10),
(2, 'Kopi Good Day Moccacino', 2000, 1500, 100, 20),
(3, 'Indomie Goreng', 3000, 2400, 200, 40),
(3, 'Tango Coklat', 8000, 6800, 3, 10);
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


