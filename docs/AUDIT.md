# Project assessment — 23 September 2026

## Assessment

I chose the stack well suited to a five-person college capstone. Keep React + Vite, Tailwind v4, Express 5, node-postgres, and PostgreSQL. The original deliverable was a working database-to-table proof of concept, not yet a POS. No framework replacement, microservices, Redis, or ORM is needed to complete it.

## Audit findings and disposition

| Priority | Finding | Disposition |
|---|---|---|
| High | Startup pool.connect() never released its client | Removed; pool.query() acquires/releases connections automatically. Added connection/query limits and idle error handling. |
| High | SQL bootstrap dropped all five tables | Replaced with transactional, empty-database-only bootstrap. Existing tables now cause failure instead of deletion. |
| High | Seeded user passwords stored in plaintext | Removed user seeds from bootstrap. Existing plaintext demo passwords disabled via migration 003; admin_w was provisioned with a scrypt hash. |
| High | No authentication or backend role enforcement | Added separate Admin/Customer login endpoints, server-side role checks, PostgreSQL sessions, and Admin-only analytics. |
| High | No constraints against negative prices/stock, invalid quantities, orphan detail rows, or inconsistent detail subtotals | Revised bootstrap plus separately prepared migration. Migration 001 was applied to the backed-up local database. |
| Medium | Failed HTTP response could become products state and crash .map() | Added HTTP and payload checks, error UI, retry, timeout, and request cleanup. |
| Medium | Hardcoded browser localhost:5000 | Relative /api with Vite proxy. Production needs equivalent reverse proxy. |
| Medium | Status claimed success even when DB was unavailable | Readiness now queries PostgreSQL and returns 503 when unavailable. |
| Medium | Unrestricted CORS, default Express errors, no JSON size bound | Origin allowlist, JSON errors, 32 KB body limit, x-powered-by disabled. CORS is not access control. |
| Medium | Docker DB published on all interfaces with literal default credentials | Compose configured for localhost and external env. Running container unchanged pending recreation. Current credentials still need rotation before deployment. |
| Medium | No graceful shutdown | SIGINT/SIGTERM close HTTP and pool with a 15-second upper bound. |
| Medium | No root ignore rules or environment template | Added root .gitignore and redacted .env.example. No Git repository exists at project root; initialize version control before collaboration. |
| Low | Backend main pointed to nonexistent entry and no start/test scripts | Corrected entry; added production start and Node test runner scripts. |
| Low | Tailwind v3-style config unused by v4, redundant Autoprefixer | Removed unused config and Autoprefixer package/plugin; kept working v4 PostCSS setup. |
| Low | Vite title/favicon and unused starter styling | Branded title/favicon, replaced App.css, Indonesian document language. Unused source artwork remains harmless; it is not imported into the bundle. |

## Structure

- backend/src/index.js: environment, connection pool, HTTP lifecycle.
- backend/src/app.js: injectable Express application, authentication routes, and SQL analytics.
- backend/src/auth.js: password hashing, PostgreSQL-backed sessions, role/CSRF checks, and login limits.
- backend/test/app.test.js: five API regression tests using Node's built-in runner.
- backend/schema.sql: safe bootstrap for new databases.
- backend/migrations/001_integrity.sql: one-time migration for original databases.
- backend/migrations/002_sessions.sql and 003_reset_legacy_passwords.sql: session storage and removal of original plaintext demo passwords.
- backend/scripts/create-admin.js: local admin provisioning and password rotation.
- frontend/src/App.jsx: separate sign-in pages, Admin dashboard/inventory/reports, in-store customer basket, printable receipts, and transaction history.
- frontend/src/App.css: responsive visual system; index.css imports Tailwind v4.
- docker-compose.yml: local PostgreSQL service and persistent volume.

As features grow, split frontend into pages, components, hooks, and API helpers; split backend into routes, services, validation, and repositories. The application now has several flows in App.jsx; extract pages, components, and API hooks before extending checkout, product editing, or reports.

## Stack and performance

React/Vite is appropriate for an interactive POS where server-rendered SEO is not the primary requirement. Tailwind v4 is valid through the existing PostCSS integration; it already handles vendor prefixing. Express and pg are sufficient for transactional CRUD. PostgreSQL supplies exact NUMERIC values, constraints, transactions, and row locking. Docker makes the database repeatable; persist data and test restoration, not just container startup.

No performance load test was performed. Six catalog rows do not establish production capacity. The API still returns the full catalog and filtering is client-side: fine for this demo, but add parameterized server-side search/category/stock filters and bounded pagination before large inventories. Do not silently cap the existing array response, because summaries would become misleading. Prefer an explicit paginated response contract with separate counts/aggregates. Debounce search only when it starts making network requests.

Use backend SQL aggregates for charts instead of downloading transaction histories. Preserve numeric precision in checkout: use integer minor units or a decimal library; frontend totals are estimates. Current display rounds to whole Rupiah; decide whether fractional prices are permitted. The unpaid basket is memory-only and resets on reload. Completed checkout locks product rows, calculates prices from the database, stores cost snapshots, and decrements stock atomically.

Installed Node was v22.20.0. Keep the team on a patched supported LTS release. Keep lockfiles and use npm ci. Neither package audit reported known vulnerabilities at audit time; this is not proof of application security.

## Feature and data-model gaps

1. Decide cashier/admin/customer permissions. transactions.user_id currently ambiguously means cashier or buyer. Use separate cashier_id and nullable customer_id if both need attribution.
2. Authentication now has scrypt hashes, server-side sessions, role middleware, login limits, SameSite/HttpOnly cookies, origin checks, and CSRF protection for logout. Add account recovery, customer password reset, session management, stronger distributed rate limiting, and deployment hardening before public access.
3. Product/category CRUD with input validation, SKU/barcode uniqueness, archive flags, and stock movement records (actor, reason, quantity, time). Audit adjustments instead of silently overwriting stock.
4. Atomic checkout is implemented with a checked-out pg client, consistent product ordering, row locks, server-calculated prices, transaction details, and rollback. Add an idempotency key to prevent double submission and concurrency integration tests.
5. Persist receipt identifiers, payment state, tender/change for cash, and product-name/SKU snapshots on receipt details. Add refunds/cancellations deliberately. Header/detail totals are not automatically reconciled by current SQL checks; checkout must enforce this transactionally.
6. Admin analytics, transaction history, and period reports use real checkout data. Product cost and cost-at-transaction snapshots support gross-profit estimates. Define the Asia/Jakarta reporting boundary, refunds, discounts, operating costs, and the exact difference between gross profit and net profit.
7. Existing timestamps lack timezone. New bootstrap uses TIMESTAMPTZ, but the existing migration leaves them alone: establish how old timestamps were recorded before converting. Product updated_at now has a trigger in bootstrap/migration.
8. Add integration tests for concurrent last-item purchases, duplicate checkout, rollback on failure, role access, and stock adjustment history. Add browser tests for cart and retry behavior.

Use Zod (or equivalent) for more complex request bodies, React Router when navigation expands, and a chart library if analytics grows beyond the current accessible seven-day chart and table. TanStack Query and React Hook Form may help as caching, mutations, and forms grow. These are scoped recommendations, not installed dependencies.

## Verification and limits

- Frontend ESLint and Vite production build passed. Initial measured application JS: approximately 230 KB / 72 KB gzip; CSS approximately 16 KB / 4 KB gzip.
- Five API tests passed: readiness, customer registration and role boundaries, Admin analytics, session revocation/CSRF, and rejection of plaintext passwords.
- Both npm audits returned zero known vulnerabilities.
- Live Admin login, analytics, and logout through the Vite proxy worked. Analytics returned six products, 388 units, one low-stock item, and zero transactions/revenue.
- Process inspection showed two npm wrappers, one nodemon watcher and its one backend child, and one Vite process. Listeners were backend 5000 and frontend 5173. No duplicate server or zombie evidence; no user processes were killed.
- PostgreSQL retained six products and two users. A backup is saved in the ignored backups folder; the three migrations were applied.
- The original bootstrap and integrity migration were first validated in isolated schemas and rolled back. Integrity, sessions, and legacy-password migrations were then applied to the backed-up live database.
- Chrome headless rendering verified the desktop access-choice page after session initialization. Its minimum viewport is 500 px here, so a requested 390 px screenshot was cropped rather than a true mobile emulation. The 500 px page rendered fully after narrowing the grid/card CSS. Admin/Customer pages and smaller mobile interaction still need the manual acceptance checks in UI-UX.md.

## References

- [node-postgres pooling](https://node-postgres.com/features/pooling): release checked-out clients; pool.query handles simple queries.
- [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide): v4 configuration and built-in prefixing.
- [Express security practices](https://expressjs.com/en/advanced/best-practice-security.html): authentication-related security and deployment hardening.
- [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): HttpOnly and SameSite cookie design.
- [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html): CSRF token defense.
- [PostgreSQL row locking](https://www.postgresql.org/docs/17/explicit-locking.html): concurrent inventory checkout design.
- [Vite deployment](https://vite.dev/guide/static-deploy): static hosting and preview limitations.
- [Node.js releases](https://nodejs.org/en/about/previous-releases): supported runtime selection.

