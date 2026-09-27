# WADIMOR

WADIMOR is a college capstone project for an in-store digital warung. It has separate Admin and Customer access, inventory and product management, an Admin analytics dashboard, a digital basket, atomic checkout, printable payment receipts, transaction history, and sales reports. There is no delivery workflow; payment and item handover happen at the store.

## Run locally (PowerShell)

Use Node.js 22 LTS, Docker Desktop, and npm. Use `npm.cmd` when PowerShell blocks `npm.ps1`.

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
# On a new checkout, copy backend/.env.example to backend/.env and set local credentials.
docker compose --env-file backend/.env up -d db
npm.cmd --prefix backend run dev
```

In another terminal:

```powershell
npm.cmd --prefix frontend run dev
```

Open http://127.0.0.1:5173. Choose Admin or Customer. Customer users can register at `/customer/register`. Admin accounts are provisioned locally:

```powershell
npm.cmd --prefix backend run setup:admin
```

That command creates or rotates `admin_w` by default and prints a one-time random password. Save it in a password manager; rerunning the command invalidates previous sessions and rotates the password. To use another admin username, run `node backend/scripts/create-admin.js another_admin` from the project root. Passwords are hashed with Node's scrypt before storage.

The existing local database was backed up to `backups/wadimor-before-auth.dump`. Migrations `001_integrity.sql`, `002_sessions.sql`, and `003_reset_legacy_passwords.sql` were applied on 23 September 2026. The original plaintext demo passwords for `admin_w` and `pelanggan_1` were disabled; the existing `pelanggan_1` record needs a separate reset/provisioning flow if that specific username should be reused. Do **not** reapply migration 001 or bootstrap `schema.sql` to the existing database. Keep the backup secure because it contains the original demo user records. The backup is ignored by Git.

For a new empty database, run the bootstrap before creating an admin:

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

The bootstrap creates all six tables and six demo products, but no users. PostgreSQL volumes survive container recreation. Do not use `docker compose down -v` unless intentionally deleting the data.

## Access and API

| Page/API | Who can use it |
|---|---|
| `/admin/login` | Admin sign-in only |
| `/customer/login`, `/customer/register` | Customer sign-in and registration |
| `/admin`, `/admin/inventory` | Admin session |
| `/customer` | Customer session |
| `GET /api/products` | Any signed-in user |
| `GET /api/admin/analytics` | Admin session only |

The server owns role decisions; switching URLs or editing browser state cannot grant Admin API access. Sessions use an opaque HttpOnly, SameSite=Strict cookie backed by PostgreSQL and expire after seven days. Login and registration check request origin; logout also requires a session CSRF token. Production cookies require HTTPS. Login attempts are limited per IP in memory. `GET /api/status` remains public for health checks. The catalog and dashboard pull real database values; with no transactions, sales metrics show zero and the recent-sales chart shows an empty state.

The current Docker container still uses its original port binding until recreated. `docker-compose.yml` is configured to bind PostgreSQL to localhost and read environment credentials. Changing `DB_PASSWORD` in `.env` does not change a password already stored in a PostgreSQL volume. Coordinate an actual database password change before a deployment. Configure HTTPS and a same-origin `/api` reverse proxy in production; the Vite development proxy is not included in the build.

## Checks

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

Read the [audit and roadmap](docs/AUDIT.md) and [UI/UX guide](docs/UI-UX.md). Checkout uses a database transaction and row locking, calculates prices on the server, and reduces stock only when the transaction succeeds. Migration `004_pos_features.sql` adds product cost snapshots for profit reports to existing databases.

For teammates, see [collaboration and local setup](docs/COLLABORATING.md).

See [feature alignment and priorities](docs/FEATURE-PLAN.md) for the team's proposed six-menu scope.

## Quick rerun after pulling updates

For an existing working installation, run:

```powershell
git pull --ff-only
docker compose --env-file backend/.env up -d db
Get-Content -Raw backend/migrations/004_pos_features.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
npm.cmd --prefix backend run dev
npm.cmd --prefix frontend run dev
```

Run migration 004 only if `products.cost_price` and `transaction_details.cost_at_transaction` do not already exist. A fresh database already gets those columns from `schema.sql`; do not run migration 004 against a fresh database that was bootstrapped from the current version.
