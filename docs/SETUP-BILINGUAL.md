# WADIMOR - Simple Setup / Panduan Singkat

## About this guide / Tentang panduan ini

I use WADIMOR as an offline, in-store grocery POS. After payment, the system shows a printable **receipt/invoice (faktur pembayaran)**. It does not include delivery.

Saya menggunakan WADIMOR sebagai POS toko offline. Setelah pembayaran, sistem menampilkan **receipt/invoice (faktur pembayaran)** yang bisa dicetak. Sistem ini tidak menggunakan fitur pengiriman.

## 1. Technology and purpose / Teknologi dan fungsinya

| Technology | Purpose / Fungsi |
|---|---|
| React | I build the customer and admin screens with reusable components. / Saya membuat halaman customer dan admin dengan komponen yang bisa digunakan ulang. |
| Vite | I use it for fast frontend development and production builds. / Saya menggunakannya untuk development frontend yang cepat dan build production. |
| Tailwind CSS v4 | I style the interface consistently without writing many custom CSS files. / Saya mengatur tampilan secara konsisten tanpa banyak file CSS manual. |
| Node.js | I run the backend JavaScript code. / Saya menjalankan kode JavaScript backend. |
| Express.js | I create REST API routes, authentication middleware, and error handling. / Saya membuat route REST API, middleware autentikasi, dan penanganan error. |
| `pg` (node-postgres) | I connect the backend to PostgreSQL using a connection pool. / Saya menghubungkan backend ke PostgreSQL dengan connection pool. |
| PostgreSQL | I store users, products, stock, transactions, and transaction details. / Saya menyimpan user, produk, stok, transaksi, dan detail transaksi. |
| Docker Compose | I run PostgreSQL in an isolated, repeatable container with persistent storage. / Saya menjalankan PostgreSQL dalam container yang konsisten, terisolasi, dan memiliki penyimpanan persisten. |
| npm | I install dependencies and run project scripts. / Saya memasang dependency dan menjalankan script proyek. |
| Git and GitHub | I version the code and share updates with the team. / Saya menyimpan versi kode dan membagikan update kepada tim. |

## 2. Can I run it without Docker? / Apakah bisa tanpa Docker?

Yes. Docker is recommended because everyone gets the same PostgreSQL version and port, and I can start or stop the database with one command. Docker is not required: I can install PostgreSQL directly on Windows and point the backend to it.

Bisa. Docker saya rekomendasikan karena semua orang memakai versi dan port PostgreSQL yang sama, serta database bisa dijalankan dengan satu perintah. Docker tidak wajib: saya bisa memasang PostgreSQL langsung di Windows dan mengarahkan backend ke sana.

## 3. Requirements / Persiapan

I install Git, Node.js 22 or newer, and PowerShell. I choose **one** database option:

Saya memasang Git, Node.js 22 atau lebih baru, dan PowerShell. Saya memilih **satu** opsi database:

- **Docker option:** Docker Desktop with Compose.
- **Opsi Docker:** Docker Desktop dengan Compose.
- **No-Docker option:** PostgreSQL 15 or newer, plus `psql` or pgAdmin.
- **Opsi tanpa Docker:** PostgreSQL 15 atau lebih baru, serta `psql` atau pgAdmin.

## 4. Option A - Docker (recommended) / Opsi A - Docker (direkomendasikan)

From the repository folder, I run:

Dari folder repository, saya menjalankan:

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
cd wadimor-capstone
Copy-Item backend/.env.example backend/.env
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
```

I edit `backend/.env` and set a real local `DB_PASSWORD`. I keep this file private and never commit it.

Saya mengedit `backend/.env` dan mengisi `DB_PASSWORD` lokal yang benar. File ini saya simpan secara privat dan tidak saya commit.

For a new database, I run the schema once:

Untuk database baru, saya menjalankan schema satu kali:

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

Then I start two terminals:

Lalu saya membuka dua terminal:

```powershell
npm.cmd --prefix backend run dev
npm.cmd --prefix frontend run dev
```

I open `http://localhost:5173`. I create an admin account from the setup flow and register a customer account. The admin dashboard contains stock, sales analytics, transaction history, and low-stock alerts.

Saya membuka `http://localhost:5173`. Saya membuat akun admin melalui setup flow dan mendaftarkan akun customer. Dashboard admin berisi stok, analitik penjualan, riwayat transaksi, dan peringatan stok rendah.

## 5. Option B - PostgreSQL without Docker / Opsi B - PostgreSQL tanpa Docker

I install PostgreSQL locally, then create the database and user in pgAdmin or `psql`:

Saya memasang PostgreSQL secara lokal, lalu membuat database dan user melalui pgAdmin atau `psql`:

```sql
CREATE USER admin WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE wadimor_db OWNER admin;
```

I set these values in `backend/.env` (the default local PostgreSQL port is 5432):

Saya mengisi nilai berikut di `backend/.env` (port PostgreSQL lokal biasanya 5432):

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=choose-a-local-password
DB_NAME=wadimor_db
```

For a new database, I apply the schema once:

Untuk database baru, saya menerapkan schema satu kali:

```powershell
psql -h 127.0.0.1 -p 5432 -U admin -d wadimor_db -v ON_ERROR_STOP=1 -f backend/schema.sql
```

I then install dependencies and start the backend and frontend using the same commands in the Docker option. Docker can be removed later, but the database data remains in the local PostgreSQL installation.

Saya lalu memasang dependency dan menjalankan backend serta frontend dengan perintah yang sama seperti opsi Docker. Docker bisa dihapus, tetapi data database tetap berada di instalasi PostgreSQL lokal.

## 6. Existing database / Database yang sudah ada

I do not run `schema.sql` on an existing database. I back it up first, then apply only migrations that have not been applied, in order: `001_integrity.sql`, `002_sessions.sql`, `003_reset_legacy_passwords.sql`, and `004_pos_features.sql`.

Saya tidak menjalankan `schema.sql` pada database lama. Saya melakukan backup terlebih dahulu, lalu hanya menjalankan migration yang belum pernah dijalankan secara berurutan: `001_integrity.sql`, `002_sessions.sql`, `003_reset_legacy_passwords.sql`, dan `004_pos_features.sql`.

For Docker I use `docker compose ... exec -T db psql ... < backend/migrations/<file>`. Without Docker I use `psql ... -f backend/migrations/<file>`. I run each migration only once.

Untuk Docker saya menggunakan `docker compose ... exec -T db psql ... < backend/migrations/<file>`. Tanpa Docker saya menggunakan `psql ... -f backend/migrations/<file>`. Setiap migration hanya saya jalankan satu kali.

## 7. Updating after a GitHub push / Update setelah ada push GitHub

```powershell
git pull --ff-only
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

I check the migration folder before applying a new migration. I do not delete the database volume or use `docker compose down -v` unless I intentionally want to erase all local data.

Saya memeriksa folder migration sebelum menerapkan migration baru. Saya tidak menghapus volume database atau menggunakan `docker compose down -v` kecuali memang ingin menghapus semua data lokal.

## 8. Common fixes / Perbaikan umum

- If port `5434` is busy, I stop the old container or change the port mapping and `DB_PORT` together.
- Jika port `5434` sedang dipakai, saya menghentikan container lama atau mengubah port mapping dan `DB_PORT` secara bersamaan.
- If the API cannot connect, I check that PostgreSQL is running and that `backend/.env` matches it.
- Jika API tidak bisa terhubung, saya memastikan PostgreSQL berjalan dan `backend/.env` sesuai.
- If the frontend shows a network error, I start the backend first and check `http://localhost:5000/api/status`.
- Jika frontend menampilkan network error, saya menjalankan backend terlebih dahulu dan memeriksa `http://localhost:5000/api/status`.

## 9. Collaboration / Kolaborasi

I pull before editing and push small, focused commits:

Saya melakukan pull sebelum mengedit dan melakukan push dengan commit kecil yang fokus:

```powershell
git pull --ff-only
git add .
git commit -m "Describe my change"
git push origin main
```

GitHub shares the source code; it does not automatically host the local API or PostgreSQL database. You must run those services on your own laptop, or we must deploy them to a separate server.

GitHub membagikan source code; GitHub tidak otomatis menjalankan API lokal atau database PostgreSQL. Kamu harus menjalankan service tersebut di laptopmu, atau kami harus melakukan deployment ke server terpisah.

