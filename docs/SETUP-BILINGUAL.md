# WADIMOR - Panduan Setup Singkat

## Tentang panduan ini

Aku menggunakan WADIMOR sebagai POS untuk toko offline. Setelah pembayaran, sistem menampilkan receipt/invoice (faktur pembayaran) yang bisa langsung dicetak. Sistem ini tidak memakai fitur pengiriman.

## 1. Teknologi yang dipakai

- **React:** membuat halaman admin dan customer.
- **Vite:** menjalankan development frontend dengan cepat dan membuat build production.
- **Tailwind CSS v4:** mengatur tampilan dengan class CSS yang konsisten.
- **Node.js:** menjalankan kode backend JavaScript.
- **Express.js:** membuat REST API, route, middleware login, dan penanganan error.
- **pg (node-postgres):** menghubungkan backend ke PostgreSQL.
- **PostgreSQL:** menyimpan user, produk, stok, transaksi, dan detail transaksi.
- **Docker Compose:** menjalankan PostgreSQL dalam container yang konsisten dan datanya tetap tersimpan.
- **npm:** memasang dependency dan menjalankan script proyek.
- **Git dan GitHub:** menyimpan versi kode dan membagikan update.

## 2. Bisa dijalankan tanpa Docker?

Bisa. Aku rekomendasikan Docker biar semua orang memakai versi dan port PostgreSQL yang sama, dan database bisa dijalankan dengan satu perintah. Tapi Docker tidak wajib; kamu juga bisa memasang PostgreSQL langsung di Windows lalu mengarahkan backend ke sana.

## 3. Yang perlu dipasang

Aku memasang Git, Node.js 22 atau lebih baru, dan PowerShell. Setelah itu aku memilih satu opsi database:

- **Opsi Docker:** Docker Desktop dengan Compose.
- **Opsi tanpa Docker:** PostgreSQL 15 atau lebih baru, serta `psql` atau pgAdmin.

## 4. Opsi A - Docker (direkomendasikan)

Dari folder repository, jalankan:

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
cd wadimor-capstone
Copy-Item backend/.env.example backend/.env
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
```

Edit `backend/.env` dan isi `DB_PASSWORD` dengan password lokal. Jangan commit file ini.

Untuk database baru, jalankan schema satu kali:

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

Buka dua terminal lalu jalankan backend dan frontend:

```powershell
npm.cmd --prefix backend run dev
npm.cmd --prefix frontend run dev
```

Buka `http://localhost:5173`. Gunakan `/admin/login` untuk Admin atau `/customer/login` untuk Customer.

## 5. Opsi B - PostgreSQL tanpa Docker

Pasang PostgreSQL secara lokal, lalu buat user dan database melalui pgAdmin atau `psql`:

```sql
CREATE USER admin WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE wadimor_db OWNER admin;
```

Isi `backend/.env` seperti ini. Port PostgreSQL lokal biasanya `5432`:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=choose-a-local-password
DB_NAME=wadimor_db
```

Untuk database baru, terapkan schema satu kali:

```powershell
psql -h 127.0.0.1 -p 5432 -U admin -d wadimor_db -v ON_ERROR_STOP=1 -f backend/schema.sql
npm.cmd --prefix backend run setup:admin
```

Setelah itu, jalankan backend dan frontend dengan perintah yang sama seperti opsi Docker.

## 6. Kalau database sudah ada

Jangan jalankan `schema.sql` pada database lama. Lakukan backup dulu, lalu jalankan hanya migration yang belum pernah dipakai, secara berurutan:

`001_integrity.sql`, `002_sessions.sql`, `003_reset_legacy_passwords.sql`, dan `004_pos_features.sql`.

Untuk Docker, gunakan `docker compose ... exec -T db psql ...`. Tanpa Docker, gunakan `psql ... -f backend/migrations/<file>`. Setiap migration cukup dijalankan satu kali.

## 7. Update setelah ada perubahan di GitHub

```powershell
git pull --ff-only
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

Jangan memakai `docker compose down -v` kecuali memang ingin menghapus semua data lokal.

## 8. Perbaikan umum

- Port `5434` sedang dipakai: hentikan container lama atau ubah port mapping dan `DB_PORT` secara bersamaan.
- API tidak terhubung: pastikan PostgreSQL berjalan dan isi `backend/.env` benar.
- Frontend network error: jalankan backend dulu, lalu cek `http://localhost:5000/api/status`.
- `npm.ps1` diblokir PowerShell: gunakan `npm.cmd` seperti di contoh.

## 9. Kolaborasi

```powershell
git pull --ff-only
git switch -c feature/short-description
# edit dan uji perubahan
git add .
git commit -m "Describe my change"
git push -u origin feature/short-description
```

GitHub hanya membagikan source code. API dan PostgreSQL tetap harus dijalankan di laptop masing-masing, kecuali aku melakukan deployment ke server.

---

# WADIMOR - Simple Setup Guide

## About this guide

I use WADIMOR as an offline, in-store POS. After payment, the system shows a printable receipt/invoice. There is no delivery workflow.

## 1. Technology

- **React:** builds the Admin and Customer screens.
- **Vite:** provides fast frontend development and production builds.
- **Tailwind CSS v4:** keeps styling consistent with utility classes.
- **Node.js:** runs the backend JavaScript code.
- **Express.js:** provides REST APIs, routes, middleware, and error handling.
- **pg (node-postgres):** connects the backend to PostgreSQL.
- **PostgreSQL:** stores users, products, stock, transactions, and details.
- **Docker Compose:** runs PostgreSQL in a consistent container with persistent data.
- **npm:** installs dependencies and runs project scripts.
- **Git and GitHub:** versions and shares the code.

## 2. Can it run without Docker?

Yes. I recommend Docker so everyone uses the same PostgreSQL version and port, and the database starts with one command. Docker is optional; you can install PostgreSQL directly on Windows and point the backend to it.

## 3. Requirements

Install Git, Node.js 22 or newer, and PowerShell. Choose one database option:

- **Docker:** Docker Desktop with Compose.
- **Without Docker:** PostgreSQL 15 or newer, plus `psql` or pgAdmin.

## 4. Option A - Docker (recommended)

From the repository folder:

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
cd wadimor-capstone
Copy-Item backend/.env.example backend/.env
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
```

Edit `backend/.env` and set a private local `DB_PASSWORD`. Never commit this file.

For a new database, run the schema once:

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

Start the backend and frontend in separate terminals:

```powershell
npm.cmd --prefix backend run dev
npm.cmd --prefix frontend run dev
```

Open `http://localhost:5173`. Use `/admin/login` for Admin or `/customer/login` for Customer.

## 5. Option B - PostgreSQL without Docker

Install PostgreSQL locally, then create the user and database:

```sql
CREATE USER admin WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE wadimor_db OWNER admin;
```

Set these values in `backend/.env` (the usual local port is `5432`):

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=choose-a-local-password
DB_NAME=wadimor_db
```

For a new database, apply the schema once:

```powershell
psql -h 127.0.0.1 -p 5432 -U admin -d wadimor_db -v ON_ERROR_STOP=1 -f backend/schema.sql
npm.cmd --prefix backend run setup:admin
```

Then start the backend and frontend with the same commands as the Docker option.

## 6. Existing database

Do not run `schema.sql` on an existing database. Back it up first, then apply only missing migrations in order: `001_integrity.sql`, `002_sessions.sql`, `003_reset_legacy_passwords.sql`, and `004_pos_features.sql`.

Use `docker compose ... exec -T db psql ...` with Docker, or `psql ... -f backend/migrations/<file>` without Docker. Run each migration only once.

## 7. Updating after a GitHub push

```powershell
git pull --ff-only
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

Do not use `docker compose down -v` unless you intentionally want to erase local data.

## 8. Common fixes

- Port `5434` is busy: stop the old container or change the port mapping and `DB_PORT` together.
- API connection fails: check that PostgreSQL is running and `backend/.env` is correct.
- Frontend network error: start the backend and check `http://localhost:5000/api/status`.
- PowerShell blocks `npm.ps1`: use `npm.cmd` as shown.

## 9. Collaboration

```powershell
git pull --ff-only
git switch -c feature/short-description
# edit and test your change
git add .
git commit -m "Describe my change"
git push -u origin feature/short-description
```

GitHub shares the source code. You still run the API and PostgreSQL locally unless I deploy them to a server.
