# WADIMOR — Konstruksi dan Infrastruktur Sistem

## Gambaran paling sederhana

WADIMOR terdiri dari tiga bagian utama:

```text
Browser pengguna
      |
      v
React + Vite (frontend, port 5173)
      |
      | HTTP request /api/*
      v
Node.js + Express (backend API, port 5000)
      |
      | SQL melalui connection pool
      v
PostgreSQL (database, port 5434 dari laptop)
```

Docker hanya membungkus PostgreSQL agar instalasinya sama di setiap laptop. React dan Node.js tetap berjalan sebagai proses npm biasa.

## Frontend — apa yang dilakukan?

Frontend adalah halaman yang dilihat pengguna di browser. Frontend menangani:

- halaman login Admin, Kasir, dan Customer;
- dashboard Admin;
- daftar Inventori;
- POS Kasir dengan input ID/barcode dan keranjang tetap terlihat; katalog serta keranjang Customer;
- formulir produk dan penyesuaian stok;
- faktur pembayaran dan riwayat transaksi;
- grafik serta status stok.

Frontend tidak boleh dipercaya untuk menghitung harga atau memberi akses Admin. Frontend hanya mengirim permintaan ke backend dan menampilkan hasilnya.

## Vite — apa yang dilakukan?

Tailwind CSS mengatur styling melalui utility classes pada komponen React. Vite menjalankan development server frontend pada `http://localhost:5173`. Vite juga meneruskan request `/api` ke backend port 5000 saat development. Saat production, Vite membuat file frontend statis melalui `npm run build`.

## Backend — apa yang dilakukan?

Backend adalah server Node.js dengan Express. Backend:

- menerima request dari frontend;
- memeriksa login, role, session, dan CSRF;
- memvalidasi input;
- menghitung harga dari data server;
- menjalankan checkout dalam transaksi database;
- mengunci stok saat checkout;
- mengurangi stok setelah transaksi berhasil;
- mengirim data dashboard, laporan, dan riwayat;
- mengembalikan error dalam format API.

Route utama memakai prefix `/api`, misalnya `/api/auth`, `/api/products`, dan `/api/transactions`.

## PostgreSQL — apa yang disimpan?

Database menyimpan data permanen. Tabel utama meliputi:

- `users`: username, password hash, dan role (`admin`, `kasir`, atau `pelanggan`);
- `categories`: kategori produk;
- `products`: nama, kode/barcode dan foto opsional, harga jual, harga modal, stok, dan batas minimum;
- `transactions`: ringkasan checkout, customer opsional, kasir opsional, waktu, total, dan metode pembayaran;
- `transaction_details`: produk, jumlah, harga saat transaksi, dan subtotal;
- `sessions`: session login yang masih aktif.

`schema.sql` dipakai saat membuat database baru. File migration dipakai untuk memperbarui database lama secara bertahap.

## Docker — apa yang dilakukan?

Docker Compose menjalankan container PostgreSQL bernama `wadimor_postgres`.

- Port laptop `5434` diarahkan ke port PostgreSQL container `5432`.
- Volume `wadimor_pgdata` menyimpan data agar tidak hilang saat container berhenti.
- Healthcheck memastikan database sudah siap.
- `docker compose down -v` menghapus volume dan seluruh data, jadi jangan dipakai sembarangan.

Tanpa Docker, PostgreSQL dapat dipasang langsung di Windows dan backend diarahkan ke port lokal, biasanya `5432`.

## Apa yang terjadi saat checkout?

1. Frontend mengirim daftar produk dan jumlah ke backend.
2. Backend membaca produk dari database, bukan mempercayai harga dari browser.
3. Backend mengunci baris produk yang dibeli.
4. Backend memastikan stok mencukupi.
5. Backend membuat `transactions` dan `transaction_details`.
6. Backend mengurangi stok.
7. Jika semua berhasil, backend melakukan commit.
8. Frontend menampilkan direct invoice.
9. Jika ada error, seluruh transaksi dibatalkan.

## Cara menjalankan secara lokal

1. Jalankan Docker Desktop.
2. Jalankan database:

```powershell
docker compose --env-file backend/.env up -d db
```

3. Jalankan backend di terminal pertama:

```powershell
npm.cmd --prefix backend run dev
```

4. Jalankan frontend di terminal kedua:

```powershell
npm.cmd --prefix frontend run dev
```

5. Buka `http://localhost:5173`.

## Penjelasan istilah penting

- **API:** pintu komunikasi antara frontend dan backend.
- **Endpoint:** alamat API tertentu, misalnya `/api/products`.
- **Session:** bukti login yang disimpan server dan dikirim melalui cookie.
- **Role:** hak akses, yaitu `super_admin`, `admin`, `kasir`, atau `pelanggan`. Kasir tidak memerlukan akun Customer untuk transaksi walk-in.
- **Migration:** perubahan database yang diberi nomor dan dijalankan berurutan.
- **Connection pool:** kumpulan koneksi database yang dipakai ulang backend.
- **Direct invoice:** faktur pembayaran langsung setelah checkout di toko.
## Menyiapkan akun staf

Command `setup:admin` membuat atau memulihkan satu akun Super Admin. Setelah login, Super Admin membuat Admin biasa atau Kasir melalui menu **Kelola Staf**. Sistem menghasilkan password sementara yang hanya ditampilkan satu kali. Staf wajib menggantinya pada login pertama sebelum dapat membuka fitur operasional.

Super Admin juga dapat mereset password staf dari menu yang sama. Admin biasa dapat menghapus akun selain Super Admin, tetapi tidak dapat membuat akun atau mereset password staf. Tidak ada endpoint yang dapat menaikkan role Admin menjadi Super Admin. Akun Super Admin dan akun yang sedang dipakai tidak dapat dihapus. Kasir masuk melalui `/cashier/login`; akun Customer dan fitur belanja Customer tetap tersedia terpisah.

Di Daftar Barang, Admin dapat mengisi barcode opsional. Jika belum ada barcode, Kasir tetap bisa memasukkan ID numerik yang ditampilkan di baris produk. Scanner USB dapat mengetikkan barcode ke kolom yang sama.


