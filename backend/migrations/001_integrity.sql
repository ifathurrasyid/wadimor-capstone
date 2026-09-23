-- Existing databases only. Back up first; apply once using psql -v ON_ERROR_STOP=1.
-- Invalid existing records fail the transaction instead of being rewritten.
BEGIN;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'pelanggan'));
ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);
ALTER TABLE products ADD CONSTRAINT products_stock_check CHECK (stock >= 0);
ALTER TABLE products ADD CONSTRAINT products_min_stock_check CHECK (min_stock >= 0);
ALTER TABLE transactions ADD CONSTRAINT transactions_total_amount_check CHECK (total_amount >= 0);
ALTER TABLE transaction_details ALTER COLUMN transaction_id SET NOT NULL;
ALTER TABLE transaction_details ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE transaction_details ADD CONSTRAINT transaction_details_quantity_check CHECK (quantity > 0);
ALTER TABLE transaction_details ADD CONSTRAINT transaction_details_price_at_transaction_check CHECK (price_at_transaction >= 0);
ALTER TABLE transaction_details ADD CONSTRAINT transaction_details_subtotal_check CHECK (subtotal = quantity * price_at_transaction);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX transactions_user_idx ON transactions(user_id);
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
COMMIT;
