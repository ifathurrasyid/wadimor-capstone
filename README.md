# WADIMOR

**Judul Capstone Project:** Sistem Informasi Inventory untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

[Baca versi bahasa Inggris](#english-version)

## Tentang proyek

WADIMOR adalah aplikasi web untuk membantu usaha mikro retail, khususnya warung kelontong, mengelola inventory dan transaksi penjualan. Aplikasi menyediakan area terpisah untuk Admin dan Customer.

Admin dapat memantau stok, transaksi, dan laporan. Customer dapat melihat katalog, membuat keranjang, menyelesaikan pembayaran di toko, dan mencetak struk. Sistem dirancang untuk transaksi langsung di toko dan tidak memiliki fitur pengiriman.

## Fitur utama

- Login dan hak akses terpisah untuk Admin dan Customer.
- Dashboard Admin dengan ringkasan stok, pendapatan, transaksi, stok menipis, dan penjualan tujuh hari.
- Katalog produk, pencarian, filter kategori, dan keranjang digital.
- Checkout atomik: harga diperiksa oleh server dan stok hanya berkurang jika transaksi berhasil.
- Struk yang dapat dicetak, riwayat transaksi, dan laporan penjualan.
- Penyimpanan akun, produk, inventory, dan transaksi menggunakan PostgreSQL.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express 5, node-postgres (`pg`) |
| Database | PostgreSQL 15 |
| Database lokal | Docker Compose, direkomendasikan |
| Pemeriksaan kualitas | Node test runner, ESLint, Vite production build |

## Mulai dengan cepat

Bagian ini ditujukan untuk anggota tim yang sudah memasang Git, Node.js, dan Docker Desktop. Jika belum pernah menggunakan terminal atau belum memasang software tersebut, ikuti [panduan setup lengkap](docs/SETUP-GUIDE.md).

Jalankan perintah berikut dari folder utama proyek:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Perintah schema hanya boleh dijalankan satu kali pada database yang benar-benar baru. Untuk database lama, gunakan migration sesuai [panduan setup](docs/SETUP-GUIDE.md#10-menggunakan-database-yang-sudah-ada).

Jalankan backend di terminal pertama:

```powershell
npm.cmd --prefix backend run dev
```

Jalankan frontend di terminal kedua:

```powershell
npm.cmd --prefix frontend run dev
```

Buka `http://localhost:5173` di browser. Gunakan akun Admin yang dibuat melalui perintah `setup:admin`, atau buat akun Customer melalui halaman registrasi.

## Alamat lokal

| Alamat | Kegunaan |
|---|---|
| `http://localhost:5173` | Aplikasi utama |
| `http://localhost:5173/admin/login` | Login Admin |
| `http://localhost:5173/customer/login` | Login Customer |
| `http://localhost:5173/customer/register` | Registrasi Customer |
| `http://localhost:5000/api/status` | Pemeriksaan status backend dan database |

## Pemeriksaan kualitas

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

Semua perintah harus dijalankan dari folder utama `wadimor-capstone`. Dokumentasi menggunakan `npm.cmd` agar perintah tetap berfungsi ketika Windows PowerShell memblokir `npm.ps1`.

## Dokumentasi

- [Panduan setup](docs/SETUP-GUIDE.md) — instalasi yang sangat rinci untuk pemula.
- [Panduan kolaborasi](docs/COLLABORATING.md) — branch, commit, push, dan pull request.
- [Rencana fitur](docs/FEATURE-PLAN.md) — status fitur, keputusan produk, dan urutan pengembangan.
- [Panduan UI/UX](docs/UI-UX.md) — sistem desain, handoff, dan acceptance checklist.
- [Audit teknis](docs/AUDIT.md) — temuan teknis, batasan, dan rekomendasi.
- [Catatan frontend](frontend/README.md) — ringkasan khusus aplikasi React.

## Catatan keamanan dan data

- Jangan commit `backend/.env`, backup database, `node_modules`, atau folder `dist`.
- Password disimpan sebagai hash `scrypt`, bukan teks biasa.
- Session disimpan di PostgreSQL melalui cookie `HttpOnly` dan `SameSite=Strict`.
- Volume PostgreSQL tetap menyimpan data setelah container dihentikan.
- Jangan menjalankan `docker compose down -v` kecuali seluruh data lokal memang boleh dihapus.

## Status proyek

WADIMOR masih merupakan proyek capstone yang berjalan secara lokal, bukan layanan production. Deployment publik memerlukan HTTPS, reverse proxy `/api` dengan origin yang sama, pengelolaan secret, backup yang diuji, dan hardening tambahan.

---

<a id="english-version"></a>

# WADIMOR — English Version

**Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

[Read the Indonesian version](#wadimor)

## About the project

WADIMOR is a web application that helps micro retail businesses, particularly neighborhood grocery stores, manage inventory and sales transactions. The application provides separate areas for Admin and Customer users.

Admins can monitor inventory, transactions, and reports. Customers can browse the catalog, build a basket, complete an in-store payment, and print a receipt. The system is designed for in-store transactions and does not include delivery.

## Main features

- Separate Admin and Customer authentication and permissions.
- Admin dashboard with inventory, revenue, transaction, low-stock, and seven-day sales summaries.
- Product catalog, search, category filters, and a digital basket.
- Atomic checkout: prices are verified by the server and stock is reduced only when the transaction succeeds.
- Printable receipts, transaction history, and sales reports.
- PostgreSQL storage for accounts, products, inventory, and transactions.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express 5, node-postgres (`pg`) |
| Database | PostgreSQL 15 |
| Local database | Docker Compose, recommended |
| Quality checks | Node test runner, ESLint, Vite production build |

## Quick start

This section is intended for team members who already have Git, Node.js, and Docker Desktop installed. If terminal use or software installation is unfamiliar, follow the [complete setup guide](docs/SETUP-GUIDE.md#english-version).

Run the following commands from the project root:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Run the schema command only once for a completely new database. For an existing database, use the migrations described in the [setup guide](docs/SETUP-GUIDE.md#10-using-an-existing-database).

Start the backend in the first terminal:

```powershell
npm.cmd --prefix backend run dev
```

Start the frontend in the second terminal:

```powershell
npm.cmd --prefix frontend run dev
```

Open `http://localhost:5173` in a browser. Use the Admin account created with `setup:admin`, or create a Customer account from the registration page.

## Local addresses

| Address | Purpose |
|---|---|
| `http://localhost:5173` | Main application |
| `http://localhost:5173/admin/login` | Admin login |
| `http://localhost:5173/customer/login` | Customer login |
| `http://localhost:5173/customer/register` | Customer registration |
| `http://localhost:5000/api/status` | Backend and database health check |

## Quality checks

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

Run all commands from the main `wadimor-capstone` folder. The documentation uses `npm.cmd` so commands still work when Windows PowerShell blocks `npm.ps1`.

## Documentation

- [Setup guide](docs/SETUP-GUIDE.md#english-version) — highly detailed installation instructions for beginners.
- [Collaboration guide](docs/COLLABORATING.md#english-version) — branches, commits, pushes, and pull requests.
- [Feature plan](docs/FEATURE-PLAN.md#english-version) — feature status, product decisions, and development order.
- [UI/UX guide](docs/UI-UX.md#english-version) — design system, handoff, and acceptance checklist.
- [Technical audit](docs/AUDIT.md#english-version) — technical findings, limitations, and recommendations.
- [Frontend notes](frontend/README.md#english-version) — notes specific to the React application.

## Security and data notes

- Never commit `backend/.env`, database backups, `node_modules`, or generated `dist` folders.
- Passwords are stored as `scrypt` hashes, not plaintext.
- Sessions are stored in PostgreSQL and use `HttpOnly`, `SameSite=Strict` cookies.
- The PostgreSQL volume keeps its data after the container stops.
- Do not run `docker compose down -v` unless all local database data may be deleted.

## Project status

WADIMOR remains a locally run capstone project, not a production service. Public deployment requires HTTPS, a same-origin `/api` reverse proxy, secret management, tested backups, and additional hardening.
