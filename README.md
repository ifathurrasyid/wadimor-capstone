# WADIMOR

**Judul Capstone Project:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

[Baca versi bahasa Inggris](#english-version)

## Tentang proyek

WADIMOR adalah aplikasi web untuk membantu usaha mikro retail, khususnya warung kelontong, mengelola inventori dan transaksi penjualan. Aplikasi menyediakan area terpisah untuk Admin, Kasir, dan Customer. Kasir menangani transaksi walk-in tanpa perlu akun Customer.

Admin mengelola barang, stok, akun, dan laporan. Kasir memasukkan ID produk atau memindai barcode, memproses pembayaran, lalu mencetak faktur. Customer tetap dapat masuk, memilih barang, checkout, dan melihat struk melalui fitur belanja yang sudah tersedia. Sistem dirancang untuk transaksi langsung di toko dan tidak memiliki fitur pengiriman.

## Fitur utama

- Login dan hak akses terpisah untuk Admin, Kasir, dan Customer.
- Dashboard Admin dengan ringkasan stok, pendapatan, transaksi, stok menipis, dan penjualan tujuh hari.
- POS Kasir dengan pencarian, input ID/barcode, dan keranjang yang selalu terlihat; katalog serta keranjang Customer tetap tersedia.
- Checkout atomik: harga diperiksa oleh server dan stok hanya berkurang jika transaksi berhasil.
- Faktur berisi barang dan harga yang dapat dicetak dari checkout maupun riwayat transaksi; laporan penjualan dan badge peringatan stok rendah.
- Penyimpanan akun, produk, inventori, dan transaksi menggunakan PostgreSQL.

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

Masuk sebagai Super Admin, lalu buat akun Admin atau Kasir melalui menu **Kelola Staf**. Password sementara hanya ditampilkan satu kali dan wajib diganti saat login pertama.

Perintah schema hanya boleh dijalankan satu kali pada database yang benar-benar baru. Untuk database lama, gunakan migration sesuai [panduan setup](docs/SETUP-GUIDE.md#10-menggunakan-database-yang-sudah-ada).

Jalankan backend di terminal pertama:

```powershell
npm.cmd --prefix backend run dev
```

Jalankan frontend di terminal kedua:

```powershell
npm.cmd --prefix frontend run dev
```

Buka `http://localhost:5173` di browser. Gunakan akun Admin atau Kasir yang dibuat melalui command setup masing-masing. Akun Customer tetap bisa dibuat melalui halaman registrasi.

## Alamat lokal

| Alamat | Kegunaan |
|---|---|
| `http://localhost:5173` | Aplikasi utama |
| `http://localhost:5173/admin/login` | Login Admin |
| `http://localhost:5173/cashier/login` | Login Kasir |
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

- [Panduan setup](docs/SETUP-GUIDE.md) â€” instalasi yang sangat rinci untuk pemula.
- [Panduan kolaborasi](docs/COLLABORATING.md) â€” branch, commit, push, dan pull request.
- [Rencana fitur](docs/FEATURE-PLAN.md) â€” status fitur, keputusan produk, dan urutan pengembangan.
- [Panduan UI/UX](docs/UI-UX.md) â€” sistem desain, handoff, dan acceptance checklist.
- [Audit teknis](docs/AUDIT.md) â€” temuan teknis, batasan, dan rekomendasi.
- [Catatan frontend](frontend/README.md) â€” ringkasan khusus aplikasi React.

## Catatan keamanan dan data

- Jangan commit `backend/.env`, backup database, `node_modules`, atau folder `dist`.
- Password disimpan sebagai hash `scrypt`, bukan teks biasa.
- Session disimpan di PostgreSQL melalui cookie `HttpOnly` dan `SameSite=Strict`.
- Volume PostgreSQL tetap menyimpan data setelah container dihentikan.
- Jangan menjalankan `docker compose down -v` kecuali seluruh data lokal memang boleh dihapus.

## Status proyek

WADIMOR masih merupakan proyek capstone yang berjalan secara lokal, bukan layanan production. Deployment publik memerlukan HTTPS, reverse proxy `/api` dan `/uploads` dengan origin yang sama, pengelolaan secret, backup yang diuji, penyimpanan persisten untuk foto di `backend/uploads/products`, dan hardening tambahan.

---

<a id="english-version"></a>

# WADIMOR â€” English Version

**Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

[Read the Indonesian version](#wadimor)

## About the project

WADIMOR is a web application that helps micro retail businesses, particularly neighborhood grocery stores, manage Inventory and sales transactions. The application provides separate areas for Admin, Cashier, and Customer users. Cashiers handle walk-in sales without requiring a Customer account.

Admins manage products, stock, accounts, and reports. Cashiers enter a product ID or scan a barcode, take payment, and print an invoice. Customers can still sign in, shop, check out, and view receipts through the existing customer features. The system is designed for in-store transactions and does not include delivery.

## Main features

- Separate Admin, Cashier, and Customer authentication and permissions.
- Admin dashboard with Inventory, revenue, transaction, low-stock, and seven-day sales summaries.
- Cashier POS with product ID/barcode entry and a persistent cart, while keeping the customer catalog and basket.
- Atomic checkout: prices are verified by the server and stock is reduced only when the transaction succeeds.
- Printable invoices with purchased items from checkout and transaction history, sales reports, and a low-stock notification badge.
- PostgreSQL storage for accounts, products, Inventory, and transactions.

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

Sign in as the Super Admin, then create Admin or Cashier accounts from **Manage Staff**. The temporary password is shown once and must be changed at first login.

Run the schema command only once for a completely new database. For an existing database, use the migrations described in the [setup guide](docs/SETUP-GUIDE.md#10-using-an-existing-database).

Start the backend in the first terminal:

```powershell
npm.cmd --prefix backend run dev
```

Start the frontend in the second terminal:

```powershell
npm.cmd --prefix frontend run dev
```

Open `http://localhost:5173` in a browser. Use the Admin or Cashier account created with the matching setup command. Customer accounts remain available through registration.

## Local addresses

| Address | Purpose |
|---|---|
| `http://localhost:5173` | Main application |
| `http://localhost:5173/admin/login` | Admin login |
| `http://localhost:5173/cashier/login` | Cashier login |
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

- [Pitch deck sederhana](docs/PITCH-DECK.md)
- [Konstruksi dan infrastruktur sistem](docs/SYSTEM-ARCHITECTURE.md)

- [Setup guide](docs/SETUP-GUIDE.md#english-version) â€” highly detailed installation instructions for beginners.
- [Collaboration guide](docs/COLLABORATING.md#english-version) â€” branches, commits, pushes, and pull requests.
- [Feature plan](docs/FEATURE-PLAN.md#english-version) â€” feature status, product decisions, and development order.
- [UI/UX guide](docs/UI-UX.md#english-version) â€” design system, handoff, and acceptance checklist.
- [Technical audit](docs/AUDIT.md#english-version) â€” technical findings, limitations, and recommendations.
- [Frontend notes](frontend/README.md#english-version) â€” notes specific to the React application.

## Security and data notes

- Never commit `backend/.env`, database backups, `node_modules`, or generated `dist` folders.
- Passwords are stored as `scrypt` hashes, not plaintext.
- Sessions are stored in PostgreSQL and use `HttpOnly`, `SameSite=Strict` cookies.
- The PostgreSQL volume keeps its data after the container stops.
- Do not run `docker compose down -v` unless all local database data may be deleted.

## Project status

WADIMOR remains a locally run capstone project, not a production service. Public deployment requires HTTPS, same-origin `/api` and `/uploads` reverse proxies, secret management, tested backups, persistent storage for photos in `backend/uploads/products`, and additional hardening.








