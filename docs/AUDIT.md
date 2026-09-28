# Audit Teknis dan Roadmap

**Judul Capstone Project:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

**Terakhir diperbarui:** 28 September 2026

Dokumen ini mencatat penilaian teknis, perbaikan yang sudah diterapkan, batasan, dan rekomendasi WADIMOR. Dokumen ini bukan sertifikasi keamanan atau jaminan kesiapan production.

[Baca versi bahasa Inggris](#english-version)

## Ringkasan penilaian

React + Vite, Tailwind CSS, Express, node-postgres, dan PostgreSQL sesuai untuk proyek capstone lima orang. Stack ini cukup sederhana untuk dipelajari, mendukung transaksi database yang aman, dan tidak memerlukan microservices, Redis, ORM, atau penggantian framework untuk scope saat ini.

Prototype awal sudah berkembang menjadi aplikasi inventori dan POS lokal dengan authentication, katalog, checkout, receipt, history, dan analytics. Struktur source perlu dipecah sebelum fitur besar berikutnya ditambahkan.

## Temuan dan penyelesaian

| Priority | Temuan | Status |
|---|---|---|
| High | Client `pool.connect()` saat startup tidak dilepas | Selesai: koneksi dikelola pool dengan connection/query timeout dan idle error handling. |
| High | Bootstrap SQL lama menghapus tabel | Selesai: bootstrap baru transactional dan hanya untuk database kosong; tabel lama menyebabkan kegagalan, bukan penghapusan. |
| High | Password demo disimpan sebagai plaintext | Selesai: user seed dihapus, migration `003` menonaktifkan password lama, dan akun baru memakai hash `scrypt`. |
| High | Tidak ada authentication dan role enforcement backend | Selesai untuk scope lokal: login terpisah, role check server, session PostgreSQL, dan analytics khusus Admin. |
| High | Constraint data penting belum tersedia | Selesai: constraint harga, stok, jumlah, subtotal, foreign key, dan index utama ditambahkan. |
| High | Checkout berisiko menyimpan data parsial | Selesai untuk alur utama: checkout menggunakan transaction, row lock, harga server, dan rollback. |
| Medium | Respons HTTP gagal dapat diperlakukan sebagai data produk | Selesai: status/payload check, error UI, retry, timeout, dan cleanup ditambahkan. |
| Medium | URL API browser di-hard-code | Selesai untuk development: frontend memakai `/api` relatif dan Vite proxy. Production memerlukan reverse proxy. |
| Medium | Endpoint status sukses ketika database mati | Selesai: readiness melakukan query PostgreSQL dan mengembalikan `503` saat database tidak tersedia. |
| Medium | CORS luas, error default, dan body tanpa batas kecil | Selesai: origin allowlist, JSON error, batas 32 KB, dan `x-powered-by` dinonaktifkan. |
| Medium | Database Docker terbuka ke semua interface | Selesai untuk setup baru: port terikat ke `127.0.0.1` dan credential berasal dari `.env`. |
| Medium | Tidak ada graceful shutdown | Selesai: `SIGINT` dan `SIGTERM` menutup HTTP server dan pool dengan batas 15 detik. |
| Medium | Root ignore dan environment template belum tersedia | Selesai: `.gitignore` dan `backend/.env.example` tersedia. |
| Low | Entry backend dan npm scripts belum lengkap | Selesai: script development, production, test, dan setup Admin tersedia. |
| Low | Konfigurasi Tailwind lama tidak digunakan | Selesai: konfigurasi lama dan Autoprefixer berlebih dihapus. |
| Low | Branding Vite dan starter styling tersisa | Sebagian besar selesai; asset starter yang tidak di-import masih dapat dibersihkan. |

## Struktur teknis

| Lokasi | Tanggung jawab |
|---|---|
| `backend/src/index.js` | Environment, PostgreSQL pool, HTTP lifecycle, graceful shutdown |
| `backend/src/app.js` | Express app, authentication, produk, checkout, history, dan report endpoint |
| `backend/src/auth.js` | Password hashing, session, role/CSRF check, dan login limit |
| `backend/test/app.test.js` | API regression test dengan Node test runner |
| `backend/schema.sql` | Bootstrap aman hanya untuk database baru dan kosong |
| `backend/migrations/` | Perubahan berurutan untuk database lama |
| `backend/scripts/create-admin.js` | Provisioning dan rotasi password Admin lokal |
| `frontend/src/App.jsx` | Halaman dan alur Admin/Customer saat ini |
| `frontend/src/App.css` | Styling aplikasi yang responsive |
| `docker-compose.yml` | PostgreSQL lokal, health check, port, dan persistent volume |

`frontend/src/App.jsx` menangani terlalu banyak flow. Sebelum menambah CRUD produk, stock adjustment, reset password, atau kasir, pecah frontend menjadi pages, components, hooks, dan API helpers. Backend sebaiknya dipisah menjadi routes, services, validation, dan repositories.

## Performa dan skalabilitas

React/Vite sesuai untuk aplikasi interaktif yang tidak berfokus pada SEO server-rendered. Express dan `pg` cukup untuk transactional CRUD. PostgreSQL menyediakan `NUMERIC`, constraint, transaction, dan row locking yang diperlukan sistem inventori.

Belum ada load test. Enam produk demo tidak membuktikan kapasitas production. API catalog masih mengembalikan seluruh produk dan filter dijalankan di browser. Katalog besar memerlukan search/filter server-side, bounded pagination, dan aggregate terpisah.

Jangan membatasi array secara diam-diam karena ringkasan inventori dapat salah. Ubah kontrak API secara eksplisit jika pagination ditambahkan. Gunakan aggregate SQL untuk chart dan laporan.

Harga ditampilkan dalam Rupiah tanpa pecahan, sedangkan database memakai `NUMERIC(..., 2)`. Tim perlu memutuskan apakah pecahan harga diperbolehkan. Untuk kalkulasi kompleks, gunakan integer minor units atau decimal library.

## Authentication dan security

Kontrol saat ini mencakup hash `scrypt`, session server-side, cookie `HttpOnly` dan `SameSite=Strict`, role middleware, origin check, CSRF token untuk logout, dan pembatasan login per IP dalam memory.

Sebelum akses publik, tambahkan:

- HTTPS dan cookie `Secure`.
- Same-origin reverse proxy untuk `/api`.
- Secret management dan rotasi credential.
- Password reset/recovery dan session management.
- Rate limiting terdistribusi jika server lebih dari satu.
- Security headers, logging aman, monitoring, dan alerting.
- Backup terenkripsi dan restore drill.
- Dependency update policy dan security review berkala.

`CORS` bukan authentication. Keputusan role harus selalu dibuat oleh server.

## Gap data model dan fitur

1. Pisahkan `cashier_id` dan `customer_id` jika staf memproses transaksi Customer.
2. Tambahkan validasi produk, SKU/barcode unik, archive flag, dan stock movement log.
3. Tambahkan idempotency key agar retry atau double click tidak membuat transaksi ganda.
4. Simpan nomor struk, payment status, uang diterima/kembalian, dan snapshot nama/SKU produk.
5. Definisikan refund dan cancellation sebelum implementasi; semua perubahan harus dapat diaudit.
6. Definisikan gross profit, net profit, diskon, refund, biaya operasional, dan batas `Asia/Jakarta`.
7. Teliti timestamp database lama sebelum mengubahnya menjadi `TIMESTAMPTZ`.
8. Tambahkan test concurrent last-item, duplicate checkout, rollback, stock adjustment, role access, dan browser end-to-end.

Zod atau validator sejenis dapat membantu request body kompleks. React Router, TanStack Query, React Hook Form, dan chart library dapat dipertimbangkan saat kebutuhan nyata muncul.

## Verifikasi yang sudah dilakukan

- Frontend ESLint dan production build berhasil pada audit awal.
- Tujuh API regression test mencakup readiness, registration/role boundary, analytics, session/CSRF, checkout, laporan laba, serta penolakan password plaintext dan bad request.
- Kedua npm audit tidak melaporkan advisory yang diketahui pada waktu audit; hasil ini bukan bukti keamanan aplikasi.
- Login Admin, analytics, dan logout melalui Vite proxy berhasil.
- Data awal menghasilkan enam produk, 388 unit, satu produk menipis, serta nol transaksi dan pendapatan.
- Bootstrap dan migration integrity diuji dalam schema terisolasi sebelum diterapkan pada database backup.
- Rendering desktop diperiksa; acceptance manual penuh untuk role, mobile interaction, dan viewport tetap diperlukan.

Hasil verifikasi adalah snapshot pada waktu audit. Jalankan kembali test, lint, build, dan dependency audit setelah perubahan relevan.

## Referensi teknis

- [node-postgres pooling](https://node-postgres.com/features/pooling)
- [Tailwind CSS upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
- [Express production security](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Vite static deployment](https://vite.dev/guide/static-deploy)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)

---

<a id="english-version"></a>

# Technical Audit and Roadmap â€” English Version

**Capstone Project Title:** Inventori Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

**Last updated:** 28 September 2026

This document records WADIMOR's technical assessment, completed improvements, limitations, and recommendations. It is not a security certification or a production-readiness guarantee.

[Read the Indonesian version](#audit-teknis-dan-roadmap)

## Assessment summary

React + Vite, Tailwind CSS, Express, node-postgres, and PostgreSQL fit a five-person capstone. The stack is learnable, supports safe database transactions, and does not require microservices, Redis, an ORM, or a framework replacement for the current scope.

The original prototype has grown into a local inventori and POS application with authentication, catalog, checkout, receipts, history, and analytics. The source structure should be split before major additions.

## Findings and disposition

| Priority | Finding | Status |
|---|---|---|
| High | Startup `pool.connect()` client was not released | Completed: pool-managed connections now include connection/query timeouts and idle error handling. |
| High | Old SQL bootstrap dropped tables | Completed: the new transactional bootstrap is for empty databases; existing tables cause failure instead of deletion. |
| High | Demo passwords were plaintext | Completed: user seeds were removed, migration `003` disables legacy passwords, and new accounts use `scrypt`. |
| High | No backend authentication or role enforcement | Completed for local scope: separate login, server role checks, PostgreSQL sessions, and Admin-only analytics. |
| High | Important constraints were missing | Completed: price, stock, quantity, subtotal, foreign key, and index protections were added. |
| High | Checkout could save partial data | Completed for the main flow: checkout uses transactions, row locks, server prices, and rollback. |
| Medium | Failed HTTP responses could become product data | Completed: status/payload checks, error UI, retry, timeout, and cleanup were added. |
| Medium | Browser API URL was hard-coded | Completed for development: relative `/api` and Vite proxy. Production needs a reverse proxy. |
| Medium | Status succeeded when the database was down | Completed: readiness queries PostgreSQL and returns `503` when unavailable. |
| Medium | Broad CORS, default errors, and no small body limit | Completed: origin allowlist, JSON errors, 32 KB limit, and disabled `x-powered-by`. |
| Medium | Docker database exposed all interfaces | Completed for new setups: localhost binding and `.env` credentials. |
| Medium | No graceful shutdown | Completed: `SIGINT` and `SIGTERM` close the server and pool within 15 seconds. |
| Medium | Root ignore and environment template missing | Completed: `.gitignore` and `backend/.env.example` are present. |
| Low | Backend entry and npm scripts incomplete | Completed: development, production, test, and Admin setup scripts are available. |
| Low | Legacy Tailwind configuration unused | Completed: legacy configuration and redundant Autoprefixer were removed. |
| Low | Vite branding and starter styling remained | Mostly completed; unimported starter assets may still be cleaned up. |

## Technical structure

| Location | Responsibility |
|---|---|
| `backend/src/index.js` | Environment, PostgreSQL pool, HTTP lifecycle, graceful shutdown |
| `backend/src/app.js` | Express app, authentication, product, checkout, history, and report endpoints |
| `backend/src/auth.js` | Password hashing, sessions, role/CSRF checks, and login limits |
| `backend/test/app.test.js` | API regression tests with Node's test runner |
| `backend/schema.sql` | Safe bootstrap for a new, empty database only |
| `backend/migrations/` | Ordered changes for existing databases |
| `backend/scripts/create-admin.js` | Local Admin provisioning and password rotation |
| `frontend/src/App.jsx` | Current Admin and Customer pages and flows |
| `frontend/src/App.css` | Responsive application styling |
| `docker-compose.yml` | Local PostgreSQL, health check, port, and persistent volume |

`frontend/src/App.jsx` handles too many flows. Before product CRUD, stock adjustment, password reset, or cashier features, split the frontend into pages, components, hooks, and API helpers. Split the backend into routes, services, validation, and repositories.

## Performance and scalability

React/Vite fits an interactive application without server-rendered SEO requirements. Express and `pg` are sufficient for transactional CRUD. PostgreSQL provides the `NUMERIC` values, constraints, transactions, and row locking needed by inventori management.

No load test has been performed. Six demo products do not establish production capacity. The catalog API returns all products and filters in the browser. A larger catalog requires server-side search/filtering, bounded pagination, and separate aggregates.

Do not silently cap arrays because inventori summaries may become incorrect. Change the API contract explicitly for pagination. Use SQL aggregates for charts and reports.

Prices display as whole Rupiah while the database uses `NUMERIC(..., 2)`. The team should decide whether fractional prices are allowed. Use integer minor units or a decimal library for complex calculations.

## Authentication and security

Current controls include `scrypt`, server-side sessions, `HttpOnly` and `SameSite=Strict` cookies, role middleware, origin checks, a logout CSRF token, and in-memory per-IP login limits.

Before public access, add:

- HTTPS and `Secure` cookies.
- A same-origin `/api` reverse proxy.
- Secret management and credential rotation.
- Password reset/recovery and session management.
- Distributed rate limiting for multiple server instances.
- Security headers, safe logging, monitoring, and alerting.
- Encrypted backups and restore drills.
- A dependency update policy and regular security review.

`CORS` is not authentication. Role decisions must remain server-side.

## Data-model and feature gaps

1. Separate `cashier_id` and `customer_id` when staff process Customer sales.
2. Add product validation, unique SKU/barcode, archive flags, and stock movement logs.
3. Add an idempotency key so retries or double clicks cannot duplicate transactions.
4. Store receipt identifiers, payment status, tender/change, and product name/SKU snapshots.
5. Define refunds and cancellation before implementation; every change must be auditable.
6. Define gross profit, net profit, discounts, refunds, operating costs, and `Asia/Jakarta` boundaries.
7. Investigate legacy timestamps before converting them to `TIMESTAMPTZ`.
8. Add concurrent last-item, duplicate-checkout, rollback, stock-adjustment, role-access, and browser end-to-end tests.

Zod or a similar validator can help with complex request bodies. React Router, TanStack Query, React Hook Form, and a chart library may be considered when concrete needs appear.

## Completed verification

- Frontend ESLint and production build passed during the initial audit.
- Seven API regression tests cover readiness, registration/role boundaries, analytics, session/CSRF, checkout, profit reports, and rejection of plaintext passwords and bad requests.
- Both npm audits reported no known advisories at audit time; this is not proof of application security.
- Admin login, analytics, and logout through the Vite proxy worked.
- Initial data produced six products, 388 units, one low-stock product, and zero transactions and revenue.
- Bootstrap and integrity migrations were tested in isolated schemas before application to a backed-up database.
- Desktop rendering was checked; full role, mobile-interaction, and viewport acceptance testing remains necessary.

Verification results are snapshots from the audit date. Rerun tests, lint, build, and dependency audits after relevant changes.

## Technical references

- [node-postgres pooling](https://node-postgres.com/features/pooling)
- [Tailwind CSS upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
- [Express production security](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Vite static deployment](https://vite.dev/guide/static-deploy)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)

