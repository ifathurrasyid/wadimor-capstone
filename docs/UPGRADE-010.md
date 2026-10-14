# Inventory, checkout, and pagination upgrade

## Existing local databases

Back up the database before applying migration 010. Run this only after migrations through 009 are present. Do not run `schema.sql` over an existing database.

```powershell
docker compose --env-file backend/.env up -d db
New-Item -ItemType Directory -Force backups
docker compose --env-file backend/.env exec -T db pg_dump -U admin -d wadimor_db -Fc -f /tmp/before-010.dump
docker compose --env-file backend/.env cp db:/tmp/before-010.dump backups/before-010.dump
Get-Content -Raw backend/migrations/010_inventory_checkout.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

Use your configured database/user names if different. Check that each command succeeds before continuing. Migration 010 is applied once and fails atomically on a second application. New installations use the updated `backend/schema.sql`, which already contains this migration.

Restart the backend and refresh the frontend together because the list API response format changed.

## User-visible changes

- **Daftar Barang → Sesuaikan Stok:** enter a delivery or correction amount and a reason. Negative corrections are supported; changes that would make stock negative are rejected.
- **Riwayat Stok:** view opening balances, deliveries, corrections, sales, and cancellations, with the user, reason, timestamp, transaction reference, and before/after stock. A button beside each product opens that product's history; the toolbar opens all history, including deleted products.
- Stock is read-only in the product edit form. Product creation can set its opening balance. Product edits no longer overwrite stock from a stale form.
- Existing stock becomes an opening balance at migration time. Earlier movements cannot be reconstructed and are not presented as historical sales movements.
- Checkout records cash received and change. Staff confirming a customer's cash order also enter the received amount. Existing receipts retain empty cash fields because that information was not collected previously.
- Checkout retries reuse the same key and recover the original receipt. An uncertain request is saved in the current browser tab across page reloads; the cart is locked until the retry resolves. Keep that tab open if the network fails.
- Product names are saved on transaction lines so future renames do not change receipt history. For old receipts, the migration uses the product name available at migration time.
- Reports and dashboard now say **Laba Kotor / Gross Profit**, calculated as paid sales minus historical product cost. Operating expenses are not included.
- Inventory, cashier/customer catalogs, and transaction history now use bounded server pages, search, and filters. Cart items remain selected across catalog searches/pages.

## API changes

`GET /api/products`, `/api/transactions/mine`, `/api/admin/transactions`, `/api/cashier/transactions`, and `/api/admin/stock-movements` return:

```json
{ "items": [], "total": 0, "page": 1, "pageSize": 20 }
```

`page` starts at 1; `pageSize` is 1–100. Out-of-range pages clamp to the final page. Products accept `q`, `category` (category name), `lowStock=true`, and `code` (exact barcode, ID, or name). History accepts `q` (transaction number/customer/cashier) and `status`. Stock movements accept `productId` and `kind`.

`POST /api/transactions/checkout` requires an `Idempotency-Key` header (16–100 letters, numbers, underscores, or hyphens). Repeating a completed request returns HTTP 200 and the original response; a new sale returns HTTP 201. Reusing a key with different items/payment values returns HTTP 409. Cashier cash checkouts and cash confirmation require numeric `cashTendered`; insufficient cash is rejected. Receipt responses include `cashTendered` and `cashChange`.

Stock PATCH requires `{ "amount": 5, "kind": "delivery", "reason": "Supplier delivery" }`. Supported manual kinds are `delivery` and `correction`. Product PUT updates metadata/prices/minimum stock; its `stock` field is ignored. Reports expose `financials.laba_kotor` in place of `laba_bersih`.

## Verification

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:integration
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
```

The explicit integration command uses `TEST_DATABASE_URL`, or the database connection from `backend/.env`. It creates and cleans up randomly named schemas, preserving application data. The database user needs permission to create schemas. The regular test command skips database tests when `TEST_DATABASE_URL` is absent. CI sets that variable and runs all tests with a PostgreSQL 15 service.

Coverage includes upgrading an existing schema, bootstrap, audit history, rejected adjustments, checkout replay, competing buyers, cash validation, rollback after a database failure, cancellation, receipt snapshots, gross profit, and paginated role-scoped lists.
