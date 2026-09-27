-- Add cost data required for gross-profit reports in the in-store POS.
BEGIN;
ALTER TABLE products
ADD COLUMN cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0);

UPDATE products SET cost_price = 66000 WHERE name = 'Beras Sania 5kg';
UPDATE products SET cost_price = 30000 WHERE name = 'Minyak Goreng Bimoli 2L';
UPDATE products SET cost_price = 2600 WHERE name = 'Le Minerale 600ml';
UPDATE products SET cost_price = 1500 WHERE name = 'Kopi Good Day Moccacino';
UPDATE products SET cost_price = 2400 WHERE name = 'Indomie Goreng';
UPDATE products SET cost_price = 6800 WHERE name = 'Tango Coklat';

ALTER TABLE transaction_details
ADD COLUMN cost_at_transaction NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost_at_transaction >= 0);

UPDATE transaction_details td
SET cost_at_transaction = p.cost_price
FROM products p
WHERE td.product_id = p.id;
COMMIT;
