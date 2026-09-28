# Panduan Setup WADIMOR

**Judul Capstone Project:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

Panduan ini menjelaskan proses instalasi WADIMOR di Windows dari awal. Setiap langkah ditulis untuk pembaca yang belum pernah menggunakan Git, PowerShell, React, Docker, atau PostgreSQL.

[Baca versi bahasa Inggris](#english-version)

> **Jalur yang direkomendasikan:** gunakan Git, Node.js, dan Docker Desktop. Docker menjalankan PostgreSQL dengan konfigurasi yang sama untuk seluruh anggota tim.

## Daftar isi

1. [Memahami bagian proyek](#1-memahami-bagian-proyek)
2. [Yang perlu disiapkan](#2-yang-perlu-disiapkan)
3. [Memasang Git](#3-memasang-git)
4. [Memasang Node.js dan npm](#4-memasang-nodejs-dan-npm)
5. [Memasang Docker Desktop](#5-memasang-docker-desktop)
6. [Menentukan lokasi folder](#6-menentukan-lokasi-folder)
7. [Mengunduh proyek](#7-mengunduh-proyek)
8. [Setup pertama dengan Docker](#8-setup-pertama-dengan-docker)
9. [Menjalankan dan menghentikan aplikasi](#9-menjalankan-dan-menghentikan-aplikasi)
10. [Menggunakan database yang sudah ada](#10-menggunakan-database-yang-sudah-ada)
11. [Setup tanpa Docker](#11-setup-tanpa-docker)
12. [Mengambil perubahan dari GitHub](#12-mengambil-perubahan-dari-github)
13. [Pemeriksaan kualitas](#13-pemeriksaan-kualitas)
14. [Troubleshooting](#14-troubleshooting)
15. [Glosarium](#15-glosarium)

## 1. Memahami bagian proyek

WADIMOR terdiri dari tiga bagian yang harus bekerja bersama:

| Bagian | Penjelasan | Alamat lokal |
|---|---|---|
| Frontend | Tampilan React yang dibuka di browser | `http://localhost:5173` |
| Backend | Server Express yang memproses login, produk, checkout, dan laporan | `http://localhost:5000` |
| Database | PostgreSQL menyimpan akun, produk, inventori, dan transaksi | `127.0.0.1:5434` dengan Docker |

Frontend tidak dapat bekerja dengan lengkap jika backend berhenti. Backend juga tidak dapat bekerja jika PostgreSQL berhenti atau konfigurasi database salah.

### Apakah React perlu diunduh secara terpisah?

Tidak. Jangan menjalankan `create-react-app`, `npm create vite`, atau perintah lain untuk membuat proyek React baru. Proyek React WADIMOR sudah tersedia di folder `frontend`.

Setelah Node.js terpasang, perintah berikut membaca `frontend/package-lock.json` dan mengunduh React, Vite, Tailwind CSS, serta dependency frontend lain dengan versi yang sesuai:

```powershell
npm.cmd --prefix frontend ci
```

Backend menggunakan cara yang sama melalui `backend/package-lock.json`:

```powershell
npm.cmd --prefix backend ci
```

Kedua perintah membuat folder `node_modules`. Folder tersebut berisi dependency lokal, berukuran besar, tidak perlu diedit, dan tidak boleh dimasukkan ke Git.

## 2. Yang perlu disiapkan

Siapkan hal berikut sebelum memulai:

- Komputer Windows 10 atau Windows 11 64-bit.
- Koneksi internet untuk mengunduh software dan dependency.
- Ruang kosong beberapa gigabyte, terutama untuk Docker Desktop.
- Hak untuk memasang software di komputer.
- Git untuk mengunduh dan memperbarui source code.
- Node.js 22 LTS beserta npm.
- Docker Desktop dengan Docker Compose untuk jalur yang direkomendasikan.
- Editor teks. Visual Studio Code direkomendasikan, tetapi Notepad cukup untuk setup.

PowerShell tidak perlu diunduh secara terpisah pada Windows modern. Windows Terminal, PowerShell, dan terminal bawaan Visual Studio Code dapat menjalankan semua perintah dalam panduan ini.

## 3. Memasang Git

Git digunakan untuk menyalin repository dari GitHub dan mengambil perubahan terbaru.

1. Buka halaman resmi [Git for Windows](https://git-scm.com/install/windows).
2. Unduh installer 64-bit yang direkomendasikan.
3. Buka file installer yang sudah diunduh.
4. Untuk setup biasa, gunakan pilihan default dan tekan **Next** sampai instalasi selesai.
5. Tutup terminal yang sudah terbuka, lalu buka PowerShell baru agar terminal dapat menemukan Git.
6. Jalankan pemeriksaan berikut:

```powershell
git --version
```

Jika berhasil, terminal menampilkan versi seperti `git version 2.x.x`. Nomor versi dapat berbeda dan itu normal.

Jika muncul `git is not recognized`, restart Windows. Jika masih gagal, pasang ulang Git dan pastikan pilihan untuk menambahkan Git ke `PATH` tetap aktif.

## 4. Memasang Node.js dan npm

Node.js menjalankan backend dan alat build frontend. npm adalah package manager yang ikut terpasang bersama Node.js.

1. Buka halaman resmi [Node.js downloads](https://nodejs.org/en/download).
2. Pilih **Node.js 22 LTS** untuk Windows dan unduh installer `.msi` 64-bit. Gunakan versi LTS, bukan Current.
3. Buka installer.
4. Terima license agreement dan gunakan lokasi instalasi default.
5. Pastikan **npm package manager** dan **Add to PATH** tetap dipilih.
6. Selesaikan instalasi, tutup terminal lama, lalu buka PowerShell baru.
7. Periksa Node.js dan npm:

```powershell
node --version
npm.cmd --version
```

Versi Node.js harus diawali `v22`. npm menampilkan nomor versinya sendiri.

Panduan ini menggunakan `npm.cmd`, bukan `npm`, karena beberapa konfigurasi PowerShell memblokir file `npm.ps1`. Keduanya menjalankan npm yang sama.

## 5. Memasang Docker Desktop

Docker Desktop menjalankan PostgreSQL 15 di dalam container. Cara ini menghindari setup database manual dan direkomendasikan untuk anggota tim.

1. Buka dokumentasi resmi [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
2. Pastikan komputer mendukung virtualisasi dan WSL 2. Pada banyak komputer Windows 11, keduanya sudah tersedia.
3. Unduh Docker Desktop sesuai jenis prosesor. Sebagian besar laptop Windows menggunakan **x86_64/AMD64**.
4. Buka `Docker Desktop Installer.exe`.
5. Gunakan backend WSL 2 jika installer menampilkan pilihan tersebut.
6. Selesaikan instalasi dan restart Windows jika diminta.
7. Buka **Docker Desktop** dari Start Menu.
8. Tunggu sampai Docker Desktop menunjukkan bahwa engine berjalan. Login Docker Hub tidak diperlukan untuk database lokal ini.
9. Buka PowerShell baru dan jalankan:

```powershell
docker --version
docker compose version
```

Kedua perintah harus menampilkan nomor versi. Jika `docker is not recognized`, restart Windows atau buka ulang Docker Desktop dan terminal.

### Jika WSL belum tersedia

Buka PowerShell sebagai Administrator: klik Start, cari `PowerShell`, klik kanan, lalu pilih **Run as administrator**. Jalankan:

```powershell
wsl --install
wsl --update
```

Restart komputer setelah proses selesai, lalu buka Docker Desktop kembali. Langkah ini hanya diperlukan jika Docker melaporkan masalah WSL.

## 6. Menentukan lokasi folder

Source code dapat disimpan di lokasi yang mudah ditemukan dan memiliki ruang kosong. Contoh yang sederhana adalah `D:\Projects`. Lokasi seperti `C:\Users\NamaAnda\Documents\Projects` juga boleh digunakan.

Hindari folder sementara, folder `Downloads`, dan lokasi yang memerlukan hak Administrator seperti `C:\Program Files`. Jika memungkinkan, hindari folder cloud-sync agar `node_modules` tidak mengalami konflik sinkronisasi.

### Membuat folder melalui File Explorer

1. Buka **File Explorer**.
2. Pilih drive yang diinginkan, misalnya **Data (D:)**.
3. Klik kanan pada area kosong, pilih **New > Folder**, lalu beri nama `Projects`.
4. Buka folder `Projects`.

Jangan membuat folder `wadimor-capstone` secara manual untuk metode berikut. Perintah `git clone` akan membuat folder itu secara otomatis di dalam `Projects`.

### Membuka PowerShell tepat di folder tersebut

Cara yang paling konsisten di Windows 10 dan 11:

1. Pastikan File Explorer sedang membuka folder `Projects`.
2. Klik address bar di bagian atas File Explorer.
3. Ketik `powershell`, lalu tekan **Enter**.
4. PowerShell akan terbuka dengan lokasi folder yang benar.

Alternatif pada Windows 11: klik kanan area kosong lalu pilih **Open in Terminal**. Pada beberapa versi Windows 10: tahan **Shift**, klik kanan area kosong, lalu pilih **Open PowerShell window here**.

Periksa lokasi terminal:

```powershell
Get-Location
```

Jika folder dibuat di drive D, hasilnya seharusnya mirip `D:\Projects`.

## 7. Mengunduh proyek

Pastikan terminal masih berada di folder induk `Projects`, lalu jalankan:

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
```

Git mengunduh source code dan membuat folder `wadimor-capstone`. Setelah selesai, masuk ke folder tersebut:

```powershell
Set-Location wadimor-capstone
```

Periksa lokasi dan isi folder:

```powershell
Get-Location
Get-ChildItem
```

Folder yang benar berisi `backend`, `frontend`, `docs`, `README.md`, dan `docker-compose.yml`. Semua perintah berikutnya harus dijalankan dari folder utama ini, kecuali panduan menyebut lokasi lain.

### Jika repository sudah pernah diunduh

Jangan menjalankan `git clone` lagi di folder yang sama. Buka folder `wadimor-capstone`, buka PowerShell di sana, lalu gunakan `git pull --ff-only` seperti dijelaskan pada bagian update.

## 8. Setup pertama dengan Docker

Bagian ini hanya untuk database lokal baru yang belum pernah menjalankan WADIMOR. Pastikan Docker Desktop terbuka dan engine berjalan.

### Langkah 1 â€” Membuat file konfigurasi pribadi

Salin contoh konfigurasi menjadi `backend/.env`:

```powershell
Copy-Item backend/.env.example backend/.env
```

Buka file menggunakan Notepad:

```powershell
notepad backend/.env
```

Cari baris berikut:

```env
DB_PASSWORD=replace-with-local-password
```

Ganti bagian setelah `=` dengan password database lokal. Untuk menghindari masalah parsing, gunakan huruf dan angka tanpa spasi, misalnya:

```env
DB_PASSWORD=WadimorLocal2026
```

Contoh tersebut hanya untuk komputer lokal. Buat password berbeda untuk deployment. Jangan mengubah `DB_PORT=5434` ketika menggunakan Docker dengan konfigurasi repository ini.

Simpan dengan **Ctrl+S**, lalu tutup Notepad. File `.env` bersifat pribadi dan diabaikan oleh Git. Jangan memasukkan file atau password tersebut ke repository, chat publik, screenshot, atau laporan.

### Langkah 2 â€” Mengunduh dependency backend

```powershell
npm.cmd --prefix backend ci
```

Tunggu sampai prompt PowerShell muncul kembali. Perintah ini membuat `backend/node_modules`. Warning yang tidak menghentikan proses tidak selalu berarti gagal; error biasanya ditandai `npm ERR!`.

### Langkah 3 â€” Mengunduh React dan dependency frontend

```powershell
npm.cmd --prefix frontend ci
```

Perintah ini mengunduh React, React DOM, Vite, Tailwind CSS, ESLint, dan dependency frontend lain. Tidak ada installer React tambahan.

### Langkah 4 â€” Menjalankan PostgreSQL

```powershell
docker compose --env-file backend/.env up -d db
```

Pada penggunaan pertama, Docker mungkin membutuhkan waktu untuk mengunduh image `postgres:15-alpine`. Opsi `-d` membuat database berjalan di background.

Periksa status container:

```powershell
docker compose --env-file backend/.env ps
```

Tunggu sampai service `db` atau container `wadimor_postgres` menunjukkan status `healthy`. Jika masih `health: starting`, tunggu beberapa detik lalu periksa lagi.

### Langkah 5 â€” Membuat tabel dan data produk awal

> **Penting:** jalankan perintah ini hanya satu kali untuk database baru. Jangan jalankan pada database lama yang sudah memiliki tabel atau data.

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

Perintah ini membuat enam tabel, index, trigger, tiga kategori, dan enam produk contoh. Script menggunakan transaction sehingga perubahan dibatalkan jika terjadi error.

Hasil yang berhasil diakhiri dengan `COMMIT`. Jika tabel dilaporkan sudah ada, jangan menghapus volume. Database kemungkinan sudah pernah diinisialisasi; lanjutkan ke bagian database lama atau konfirmasikan dengan tim.

### Langkah 6 â€” Membuat akun Admin

Ganti `ChooseYourAdminPassword` dengan password pribadi sepanjang 4â€“128 karakter. Gunakan password tanpa spasi agar command lebih sederhana:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Contoh lokal:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w WadimorAdmin2026
```

Jika berhasil, terminal menampilkan username dan password Admin. Simpan password secara pribadi. Menjalankan kembali command dengan username yang sama akan mengganti password dan menghapus session lama akun tersebut.

Akun Admin tidak dapat dibuat dari halaman registrasi agar pengguna biasa tidak dapat memberikan role Admin kepada dirinya sendiri.

## 9. Menjalankan dan menghentikan aplikasi

WADIMOR memerlukan dua terminal aktif: satu untuk backend dan satu untuk frontend. Database berjalan di background melalui Docker.

### Setiap kali mulai bekerja

1. Buka Docker Desktop dan tunggu sampai engine berjalan.
2. Buka folder `wadimor-capstone` di File Explorer.
3. Ketik `powershell` pada address bar untuk membuka terminal di folder tersebut.
4. Pastikan database berjalan:

```powershell
docker compose --env-file backend/.env up -d db
```

5. Jalankan backend di terminal pertama:

```powershell
npm.cmd --prefix backend run dev
```

Terminal backend harus menampilkan alamat `http://localhost:5000`. Biarkan terminal tetap terbuka.

6. Buka terminal kedua di folder proyek.
7. Jalankan frontend:

```powershell
npm.cmd --prefix frontend run dev
```

8. Tunggu sampai Vite menampilkan alamat local, biasanya `http://localhost:5173`.
9. Buka alamat tersebut di browser.

Pilih Admin untuk login menggunakan akun setup. Pilih Customer lalu buka registrasi untuk membuat akun Customer; password Customer minimal empat karakter.

### Memeriksa backend

Jika frontend menampilkan network error, buka:

```text
http://localhost:5000/api/status
```

Respons sukses menunjukkan backend dan database dapat berkomunikasi. Respons `503` berarti backend hidup tetapi tidak dapat menghubungi PostgreSQL.

### Menghentikan aplikasi

1. Klik terminal frontend dan tekan **Ctrl+C**. Jawab `Y` jika muncul konfirmasi.
2. Klik terminal backend dan tekan **Ctrl+C**.
3. Database boleh tetap berjalan. Untuk menghentikannya tanpa menghapus data, jalankan:

```powershell
docker compose --env-file backend/.env stop db
```

Jalankan kembali database dengan `docker compose --env-file backend/.env up -d db`.

> Jangan gunakan `docker compose down -v` untuk shutdown biasa. Opsi `-v` menghapus volume dan seluruh data database lokal.

## 10. Menggunakan database yang sudah ada

Bagian ini ditujukan untuk database dari versi WADIMOR yang lebih lama. Jika setup dimulai dari database kosong dengan `backend/schema.sql` terbaru, migration berikut tidak perlu dijalankan.

### Aturan penting

- Jangan jalankan `backend/schema.sql` pada database lama.
- Buat backup sebelum migration.
- Jalankan setiap migration maksimal satu kali dan sesuai urutan nomor.
- Gunakan `-v ON_ERROR_STOP=1` agar `psql` berhenti saat menemukan error.
- Pastikan tidak ada anggota tim yang sedang checkout atau mengubah data.

Migration yang tersedia:

1. `001_integrity.sql` menambahkan constraint, index, dan trigger.
2. `002_sessions.sql` menambahkan penyimpanan session.
3. `003_reset_legacy_passwords.sql` menonaktifkan password demo lama yang masih berupa teks biasa.
4. `004_pos_features.sql` menambahkan harga modal untuk laporan laba kotor.

Untuk database Docker, jalankan hanya file yang belum pernah diterapkan:

```powershell
Get-Content -Raw backend/migrations/001_integrity.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/002_sessions.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/003_reset_legacy_passwords.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/004_pos_features.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

Setelah migration `003`, buat atau reset Admin melalui `setup:admin`. Pengguna lama yang password-nya berupa teks biasa harus mendaftar ulang atau menggunakan alur reset yang aman.

Jika tidak yakin migration mana yang sudah diterapkan, jangan menebak. Periksa backup atau catatan tim. Repository belum memiliki migration tracker otomatis.

## 11. Setup tanpa Docker

Bagian ini adalah alternatif jika Docker Desktop tidak dapat digunakan. Jalur ini lebih rumit karena PostgreSQL harus dipasang dan dikelola secara manual.

### Langkah 1 â€” Memasang PostgreSQL

1. Buka halaman resmi [PostgreSQL Windows installer](https://www.postgresql.org/download/windows/).
2. Unduh PostgreSQL 15 untuk Windows 64-bit.
3. Pasang **PostgreSQL Server**, **pgAdmin 4**, dan **Command Line Tools**. Stack Builder tidak diperlukan.
4. Gunakan port default `5432`.
5. Simpan password untuk user bawaan `postgres`. Password ini berbeda dari akun WADIMOR.
6. Selesaikan instalasi dan pastikan service PostgreSQL berjalan.

### Langkah 2 â€” Membuat user dan database

1. Buka **pgAdmin 4**.
2. Hubungkan ke server lokal menggunakan password `postgres` dari installer.
3. Pilih database `postgres`, lalu buka **Tools > Query Tool**.
4. Ganti password contoh berikut, lalu jalankan:

```sql
CREATE USER admin WITH PASSWORD 'WadimorLocal2026';
CREATE DATABASE wadimor_db OWNER admin;
```

Jika user atau database sudah ada, jangan menghapusnya sebelum memastikan data di dalamnya tidak diperlukan.

### Langkah 3 â€” Mengatur `.env`

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Ubah konfigurasi database menjadi:

```env
DB_USER=admin
DB_PASSWORD=WadimorLocal2026
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=wadimor_db
```

Nilai `DB_PASSWORD` harus sama dengan password pada `CREATE USER`.

### Langkah 4 â€” Memasang dependency

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

### Langkah 5 â€” Menerapkan schema melalui pgAdmin

1. Di pgAdmin, klik kanan **Databases** lalu pilih **Refresh**.
2. Pilih database `wadimor_db`.
3. Buka **Tools > Query Tool** dan pastikan database yang aktif adalah `wadimor_db`, bukan `postgres`.
4. Klik **Open File**, lalu pilih `backend/schema.sql` dari folder proyek.
5. Klik **Execute/Play**. Jalankan file hanya satu kali pada database baru.
6. Pastikan output terakhir menunjukkan `COMMIT` tanpa error.

Buat akun Admin dari PowerShell:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Jalankan backend dan frontend seperti pada bagian sebelumnya. Docker Desktop tidak diperlukan, tetapi service PostgreSQL Windows harus tetap berjalan.

## 12. Mengambil perubahan dari GitHub

Sebelum mulai bekerja, buka PowerShell di folder `wadimor-capstone` dan periksa perubahan lokal:

```powershell
git status
```

Jika status bersih, ambil perubahan terbaru:

```powershell
git switch main
git pull --ff-only
```

Setelah `package-lock.json` berubah atau setelah pull besar, sinkronkan dependency:

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

Jika ada migration baru, baca catatannya sebelum menjalankan. Jangan menjalankan ulang `schema.sql` pada database yang sudah ada.

Jika `git pull --ff-only` gagal karena perubahan lokal, jangan menggunakan `git reset --hard`. Commit perubahan pada branch sendiri atau minta bantuan tim untuk menyelesaikan conflict.

## 13. Pemeriksaan kualitas

Jalankan dari folder utama sebelum mengirim perubahan:

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

| Perintah | Tujuan |
|---|---|
| Backend test | Memeriksa perilaku API utama |
| Frontend lint | Menemukan masalah kode dan pola React |
| Frontend build | Memastikan production bundle dapat dibuat |
| npm audit | Memeriksa dependency terhadap advisory kerentanan yang diketahui |

Folder `frontend/dist` dibuat oleh build dan tidak perlu di-commit.

## 14. Troubleshooting

### `npm.ps1 cannot be loaded because running scripts is disabled`

Gunakan `npm.cmd` seperti dalam panduan ini:

```powershell
npm.cmd --prefix frontend run dev
```

### Command tidak dikenali

Jika `npm.cmd`, `node`, `git`, atau `docker` tidak dikenali, tutup semua terminal dan buka terminal baru. Jika masih gagal, restart Windows dan pastikan software terkait sudah dipasang serta ditambahkan ke `PATH`.

### Terminal berada di folder yang salah

Jalankan:

```powershell
Get-Location
Get-ChildItem
```

Pastikan output menampilkan folder utama `wadimor-capstone` dan file `docker-compose.yml`.

### Docker Desktop tidak berjalan

Buka Docker Desktop dari Start Menu dan tunggu engine selesai dimulai. Jika Docker menyebut WSL, ikuti langkah update WSL pada bagian instalasi Docker.

### Port `5434` sudah digunakan

Periksa container:

```powershell
docker ps
```

Jika container WADIMOR lama menggunakan port tersebut, gunakan container yang sama. Jika aplikasi lain menggunakannya, koordinasikan dengan tim sebelum mengubah `docker-compose.yml` dan `DB_PORT`; keduanya harus konsisten.

### `password authentication failed for user "admin"`

Pastikan `DB_PASSWORD` pada `backend/.env` sama dengan password saat volume Docker pertama kali dibuat. Mengedit `.env` setelah volume dibuat tidak otomatis mengganti password di PostgreSQL.

Jangan langsung menghapus volume karena tindakan itu menghapus data. Pulihkan password yang benar atau koordinasikan reset database dengan tim.

### Backend memberikan status `503`

Periksa database:

```powershell
docker compose --env-file backend/.env ps
```

Pastikan container sehat dan nilai `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, serta `DB_NAME` benar.

### Frontend menampilkan network error

Pastikan backend berjalan. Buka `http://localhost:5000/api/status`. Jika alamat tidak dapat dibuka, restart backend. Jika status berhasil, restart frontend dan refresh browser.

### Port `5000` atau `5173` sudah digunakan

Server lama mungkin masih berjalan. Cari terminal backend atau frontend sebelumnya dan hentikan dengan **Ctrl+C**.

### Schema melaporkan `relation already exists`

Database sudah berisi tabel. Jangan menjalankan schema lagi dan jangan menghapus data. Gunakan bagian database lama untuk menentukan migration yang diperlukan.

### Login Admin gagal

Pastikan halaman yang digunakan adalah `/admin/login`. Reset password dengan:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w NewPrivatePassword
```

Command tersebut juga membatalkan session lama untuk akun itu.

## 15. Glosarium

| Istilah | Arti sederhana |
|---|---|
| Repository | Folder proyek yang riwayat perubahannya dikelola Git |
| Clone | Mengunduh salinan repository ke komputer |
| Terminal/PowerShell | Jendela untuk menjalankan perintah teks |
| Dependency | Paket kode lain yang dibutuhkan proyek |
| Frontend | Bagian aplikasi yang dilihat di browser |
| Backend/API | Server yang menjalankan aturan bisnis dan berbicara dengan database |
| Database | Penyimpanan terstruktur untuk akun, produk, inventori, dan transaksi |
| Container | Lingkungan terisolasi yang menjalankan software, dalam proyek ini PostgreSQL |
| Environment variable | Nilai konfigurasi seperti port dan password database |
| Schema | Definisi awal tabel, relasi, constraint, dan data contoh |
| Migration | Perubahan database berurutan untuk database lama |
| Localhost | Komputer yang sedang digunakan, bukan server publik |

## Ringkasan perintah harian

Setelah setup pertama selesai, jalankan:

```powershell
git pull --ff-only
docker compose --env-file backend/.env up -d db
npm.cmd --prefix backend run dev
```

Buka terminal kedua pada folder yang sama:

```powershell
npm.cmd --prefix frontend run dev
```

Kemudian buka `http://localhost:5173`.

---

<a id="english-version"></a>

# WADIMOR Setup Guide â€” English Version

**Capstone Project Title:** Inventori Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

This guide explains how to install WADIMOR on Windows from the beginning. Every step is written for readers who have never used Git, PowerShell, React, Docker, or PostgreSQL.

[Read the Indonesian version](#panduan-setup-wadimor)

> **Recommended path:** use Git, Node.js, and Docker Desktop. Docker runs PostgreSQL with the same configuration for every team member.

## English table of contents

1. [Understanding the project](#1-understanding-the-project)
2. [What you need](#2-what-you-need)
3. [Installing Git](#3-installing-git)
4. [Installing Node.js and npm](#4-installing-nodejs-and-npm)
5. [Installing Docker Desktop](#5-installing-docker-desktop)
6. [Choosing a folder location](#6-choosing-a-folder-location)
7. [Downloading the project](#7-downloading-the-project)
8. [First setup with Docker](#8-first-setup-with-docker)
9. [Starting and stopping the application](#9-starting-and-stopping-the-application)
10. [Using an existing database](#10-using-an-existing-database)
11. [Setup without Docker](#11-setup-without-docker)
12. [Getting updates from GitHub](#12-getting-updates-from-github)
13. [Quality checks](#13-quality-checks)
14. [Troubleshooting](#14-english-troubleshooting)
15. [Glossary](#15-glossary)

## 1. Understanding the project

WADIMOR has three parts that must work together:

| Part | Explanation | Local address |
|---|---|---|
| Frontend | The React interface opened in a browser | `http://localhost:5173` |
| Backend | The Express server that processes login, products, checkout, and reports | `http://localhost:5000` |
| Database | PostgreSQL stores accounts, products, inventori, and transactions | `127.0.0.1:5434` with Docker |

The frontend cannot work fully when the backend is stopped. The backend also cannot work when PostgreSQL is stopped or its database configuration is incorrect.

### Does React need a separate download?

No. Do not run `create-react-app`, `npm create vite`, or another command that creates a new React project. The WADIMOR React project already exists in the `frontend` folder.

After Node.js is installed, this command reads `frontend/package-lock.json` and downloads React, Vite, Tailwind CSS, and the other frontend dependencies at the expected versions:

```powershell
npm.cmd --prefix frontend ci
```

The backend uses the same approach through `backend/package-lock.json`:

```powershell
npm.cmd --prefix backend ci
```

These commands create `node_modules` folders. They contain local dependencies, are large, should not be edited, and must not be committed to Git.

## 2. What you need

Prepare the following before starting:

- A 64-bit Windows 10 or Windows 11 computer.
- An internet connection for downloading software and dependencies.
- Several gigabytes of free space, mainly for Docker Desktop.
- Permission to install software.
- Git for downloading and updating the source code.
- Node.js 22 LTS with npm.
- Docker Desktop with Docker Compose for the recommended path.
- A text editor. Visual Studio Code is recommended, but Notepad is enough for setup.

PowerShell does not need a separate download on modern Windows. Windows Terminal, PowerShell, and the Visual Studio Code terminal can run every command in this guide.

## 3. Installing Git

Git copies the repository from GitHub and retrieves later updates.

1. Open the official [Git for Windows](https://git-scm.com/install/windows) page.
2. Download the recommended 64-bit installer.
3. Open the downloaded installer.
4. For a normal setup, keep the default options and select **Next** until installation finishes.
5. Close open terminals and start a new PowerShell window so it can find Git.
6. Run:

```powershell
git --version
```

A successful result looks like `git version 2.x.x`. A different version number is normal.

If `git is not recognized` appears, restart Windows. If it still fails, reinstall Git and keep the option that adds Git to `PATH` enabled.

## 4. Installing Node.js and npm

Node.js runs the backend and frontend build tools. npm is the package manager included with Node.js.

1. Open the official [Node.js downloads](https://nodejs.org/en/download) page.
2. Select **Node.js 22 LTS** for Windows and download the 64-bit `.msi` installer. Use LTS, not Current.
3. Open the installer.
4. Accept the license agreement and use the default installation location.
5. Keep **npm package manager** and **Add to PATH** selected.
6. Finish installation, close old terminals, and open a new PowerShell window.
7. Check the installation:

```powershell
node --version
npm.cmd --version
```

The Node.js version should start with `v22`. npm displays its own version number.

This guide uses `npm.cmd` because some PowerShell configurations block `npm.ps1`. Both commands run the same npm installation.

## 5. Installing Docker Desktop

Docker Desktop runs PostgreSQL 15 in a container. This avoids manual database setup and is recommended for the team.

1. Open the official [Docker Desktop installation guide](https://docs.docker.com/desktop/setup/install/windows-install/).
2. Confirm that the computer supports virtualization and WSL 2. Both are already available on many Windows 11 computers.
3. Download Docker Desktop for the correct processor. Most Windows laptops use **x86_64/AMD64**.
4. Open `Docker Desktop Installer.exe`.
5. Use the WSL 2 backend if the installer offers that choice.
6. Complete installation and restart Windows if requested.
7. Open **Docker Desktop** from the Start Menu.
8. Wait until the engine is running. A Docker Hub login is not required for this local database.
9. Open a new PowerShell window and run:

```powershell
docker --version
docker compose version
```

Both commands should display version numbers. If `docker is not recognized` appears, restart Windows or reopen Docker Desktop and the terminal.

### If WSL is unavailable

Open PowerShell as Administrator and run:

```powershell
wsl --install
wsl --update
```

Restart the computer, then reopen Docker Desktop. This is only necessary when Docker reports a WSL problem.

## 6. Choosing a folder location

Store the source code somewhere easy to find with enough free space. A simple example is `D:\Projects`; `C:\Users\YourName\Documents\Projects` is also acceptable.

Avoid temporary folders, `Downloads`, and protected locations such as `C:\Program Files`. If possible, avoid cloud-synchronized folders to prevent `node_modules` synchronization conflicts.

### Create the folder with File Explorer

1. Open **File Explorer**.
2. Select a drive, such as **Data (D:)**.
3. Right-click an empty area, select **New > Folder**, and name it `Projects`.
4. Open `Projects`.

Do not manually create `wadimor-capstone` for the method below. `git clone` creates it automatically inside `Projects`.

### Open PowerShell in the correct folder

1. Make sure File Explorer is displaying `Projects`.
2. Click the address bar.
3. Type `powershell` and press **Enter**.
4. PowerShell opens at the correct location.

On Windows 11, another option is to right-click an empty area and select **Open in Terminal**. On some Windows 10 versions, hold **Shift**, right-click, and select **Open PowerShell window here**.

Check the terminal location:

```powershell
Get-Location
```

For the D-drive example, the result should look like `D:\Projects`.

## 7. Downloading the project

Keep the terminal in the parent `Projects` folder and run:

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
```

Git downloads the source and creates `wadimor-capstone`. Enter it:

```powershell
Set-Location wadimor-capstone
```

Check the location and contents:

```powershell
Get-Location
Get-ChildItem
```

The correct folder contains `backend`, `frontend`, `docs`, `README.md`, and `docker-compose.yml`. Run following commands from this project root unless stated otherwise.

### If the repository was downloaded before

Do not clone it again into the same folder. Open the existing `wadimor-capstone` folder and use `git pull --ff-only` as explained in the update section.

## 8. First setup with Docker

This section is only for a new local database that has never run WADIMOR. Make sure Docker Desktop and its engine are running.

### Step 1 â€” Create the private configuration file

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Find:

```env
DB_PASSWORD=replace-with-local-password
```

Replace the value after `=` with a local database password. Letters and numbers without spaces are easiest while learning:

```env
DB_PASSWORD=WadimorLocal2026
```

This example is only for a local computer. Use a different password for deployment. Keep `DB_PORT=5434` when using this repository's Docker configuration.

Save with **Ctrl+S** and close Notepad. `.env` is private and ignored by Git. Never put it or its password in the repository, public chats, screenshots, or reports.

### Step 2 â€” Download backend dependencies

```powershell
npm.cmd --prefix backend ci
```

Wait for the prompt to return. This creates `backend/node_modules`. A warning does not always mean failure; errors are usually marked `npm ERR!`.

### Step 3 â€” Download React and frontend dependencies

```powershell
npm.cmd --prefix frontend ci
```

This downloads React, React DOM, Vite, Tailwind CSS, ESLint, and other frontend packages. There is no separate React installer.

### Step 4 â€” Start PostgreSQL

```powershell
docker compose --env-file backend/.env up -d db
```

On the first run, Docker may need time to download `postgres:15-alpine`. `-d` runs the database in the background.

Check it:

```powershell
docker compose --env-file backend/.env ps
```

Wait until `db` or `wadimor_postgres` reports `healthy`. If it shows `health: starting`, wait a few seconds and check again.

### Step 5 â€” Create tables and initial products

> **Important:** run this only once for a new database. Never run it on an existing database with tables or data.

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

This creates six tables, indexes, a trigger, three categories, and six demo products. The script uses a transaction, so errors roll back the changes.

A successful result ends with `COMMIT`. If tables already exist, do not delete the volume. Use the existing-database section or confirm the database history with the team.

### Step 6 â€” Create an Admin account

Replace the example with a private password of 4â€“128 characters. A password without spaces is easier to enter in this command:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Local example:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w WadimorAdmin2026
```

The terminal displays the Admin username and password. Store the password privately. Running the command again with the same username changes its password and deletes old sessions.

Admin accounts cannot be created through registration, preventing regular users from granting themselves the Admin role.

## 9. Starting and stopping the application

WADIMOR needs two active terminals: one for the backend and one for the frontend. The database runs in the background through Docker.

### Every time you start working

1. Open Docker Desktop and wait for the engine.
2. Open `wadimor-capstone` in File Explorer.
3. Type `powershell` in the address bar.
4. Start or confirm the database:

```powershell
docker compose --env-file backend/.env up -d db
```

5. Start the backend in the first terminal:

```powershell
npm.cmd --prefix backend run dev
```

Keep this terminal open. It should display `http://localhost:5000`.

6. Open a second terminal in the same project folder.
7. Start the frontend:

```powershell
npm.cmd --prefix frontend run dev
```

8. Wait for Vite to display `http://localhost:5173`.
9. Open that address in a browser.

Choose Admin to sign in with the setup account. Choose Customer and registration to create a Customer account; Customer passwords require at least four characters.

### Check the backend

If the frontend shows a network error, open:

```text
http://localhost:5000/api/status
```

A successful response means the backend and database can communicate. `503` means the backend runs but cannot reach PostgreSQL.

### Stop the application

1. Select the frontend terminal and press **Ctrl+C**. Enter `Y` if asked.
2. Select the backend terminal and press **Ctrl+C**.
3. The database may keep running. To stop it without deleting data:

```powershell
docker compose --env-file backend/.env stop db
```

Restart it with `docker compose --env-file backend/.env up -d db`.

> Do not use `docker compose down -v` for normal shutdown. `-v` deletes the volume and all local database data.

## 10. Using an existing database

This section applies to databases from older WADIMOR versions. A new database initialized with the current `backend/schema.sql` does not need these migrations.

### Important rules

- Never run `backend/schema.sql` on an existing database.
- Create a backup before migration.
- Run each migration at most once and in numeric order.
- Use `-v ON_ERROR_STOP=1` so `psql` stops on errors.
- Make sure nobody is checking out or changing data.

Available migrations:

1. `001_integrity.sql` adds constraints, indexes, and a trigger.
2. `002_sessions.sql` adds session storage.
3. `003_reset_legacy_passwords.sql` disables old plaintext demo passwords.
4. `004_pos_features.sql` adds cost data for gross-profit reports.

For Docker, run only files not previously applied:

```powershell
Get-Content -Raw backend/migrations/001_integrity.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/002_sessions.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/003_reset_legacy_passwords.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/004_pos_features.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

After migration `003`, create or reset the Admin with `setup:admin`. Legacy plaintext-password users must register again or use a secure reset flow.

If migration history is unclear, do not guess. Check backups or team records. The repository has no automatic migration tracker yet.

## 11. Setup without Docker

This alternative is for computers that cannot use Docker Desktop. It is more complex because PostgreSQL must be installed and managed manually.

### Step 1 â€” Install PostgreSQL

1. Open the official [PostgreSQL Windows installer](https://www.postgresql.org/download/windows/) page.
2. Download PostgreSQL 15 for 64-bit Windows.
3. Install **PostgreSQL Server**, **pgAdmin 4**, and **Command Line Tools**. Stack Builder is unnecessary.
4. Use the default port `5432`.
5. Store the password for the built-in `postgres` user. It is separate from WADIMOR accounts.
6. Finish installation and confirm the PostgreSQL service is running.

### Step 2 â€” Create the user and database

1. Open **pgAdmin 4**.
2. Connect to the local server with the installer password.
3. Select the `postgres` database and open **Tools > Query Tool**.
4. Replace the example password and run:

```sql
CREATE USER admin WITH PASSWORD 'WadimorLocal2026';
CREATE DATABASE wadimor_db OWNER admin;
```

If the user or database already exists, do not delete it before confirming its data is unneeded.

### Step 3 â€” Configure `.env`

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Set:

```env
DB_USER=admin
DB_PASSWORD=WadimorLocal2026
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=wadimor_db
```

`DB_PASSWORD` must match the `CREATE USER` password.

### Step 4 â€” Install dependencies

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

### Step 5 â€” Apply the schema through pgAdmin

1. In pgAdmin, right-click **Databases** and select **Refresh**.
2. Select `wadimor_db`.
3. Open **Tools > Query Tool** and confirm the active database is `wadimor_db`, not `postgres`.
4. Select **Open File** and choose `backend/schema.sql`.
5. Select **Execute/Play**. Run it only once on a new database.
6. Confirm the final output shows `COMMIT` without errors.

Create an Admin from PowerShell:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w ChooseYourAdminPassword
```

Start the backend and frontend as described earlier. Docker is unnecessary, but the Windows PostgreSQL service must remain running.

## 12. Getting updates from GitHub

Open PowerShell in `wadimor-capstone` and check local changes:

```powershell
git status
```

If clean, retrieve updates:

```powershell
git switch main
git pull --ff-only
```

After a lockfile change or substantial pull, synchronize dependencies:

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

Read new migration notes before running them. Never rerun `schema.sql` on an existing database.

If `git pull --ff-only` fails because of local changes, do not use `git reset --hard`. Commit work on a branch or ask the team for help resolving the conflict.

## 13. Quality checks

Run these from the project root before sharing changes:

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

| Command | Purpose |
|---|---|
| Backend test | Checks key API behavior |
| Frontend lint | Finds code and React-pattern issues |
| Frontend build | Confirms a production bundle can be created |
| npm audit | Checks dependencies against known vulnerability advisories |

The build creates `frontend/dist`, which should not be committed.

## 14. English troubleshooting

### `npm.ps1 cannot be loaded because running scripts is disabled`

Use `npm.cmd`:

```powershell
npm.cmd --prefix frontend run dev
```

### A command is not recognized

If `npm.cmd`, `node`, `git`, or `docker` is not recognized, close all terminals and open a new one. If needed, restart Windows and confirm the software was installed with `PATH` support.

### The terminal is in the wrong folder

```powershell
Get-Location
Get-ChildItem
```

Confirm that `wadimor-capstone` and `docker-compose.yml` are shown.

### Docker Desktop is not running

Open Docker Desktop and wait for its engine. If Docker reports WSL problems, follow the WSL steps in the installation section.

### Port `5434` is already in use

```powershell
docker ps
```

Reuse an existing WADIMOR container if it owns the port. If another app owns it, coordinate before changing both `docker-compose.yml` and `DB_PORT` consistently.

### `password authentication failed for user "admin"`

`DB_PASSWORD` must match the password used when the Docker volume was first created. Editing `.env` later does not change PostgreSQL's stored password. Do not delete the volume because that erases data; recover the password or coordinate a reset.

### Backend returns `503`

```powershell
docker compose --env-file backend/.env ps
```

Confirm the container is healthy and `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correct.

### Frontend shows a network error

Confirm the backend is running and open `http://localhost:5000/api/status`. Restart the backend if unreachable; otherwise restart the frontend and refresh the browser.

### Port `5000` or `5173` is in use

An older server may still be running. Find its terminal and press **Ctrl+C**.

### Schema reports `relation already exists`

The database already has tables. Do not rerun the schema or delete data. Follow the existing-database section.

### Admin login fails

Use `/admin/login`. Reset the password with:

```powershell
npm.cmd --prefix backend run setup:admin -- admin_w NewPrivatePassword
```

This also revokes old sessions for the account.

## 15. Glossary

| Term | Plain-language meaning |
|---|---|
| Repository | A project folder whose change history is managed by Git |
| Clone | Downloading a repository copy to a computer |
| Terminal/PowerShell | A window for running text commands |
| Dependency | Another code package required by the project |
| Frontend | The part users see in a browser |
| Backend/API | The server that runs business rules and communicates with the database |
| Database | Structured storage for accounts, products, inventori, and transactions |
| Container | An isolated environment that runs software, PostgreSQL in this project |
| Environment variable | A configuration value such as a port or database password |
| Schema | The initial definition of tables, relationships, constraints, and demo data |
| Migration | An ordered database change for an existing database |
| Localhost | The current computer, not a public server |

## Daily command summary

After first-time setup, run:

```powershell
git pull --ff-only
docker compose --env-file backend/.env up -d db
npm.cmd --prefix backend run dev
```

Open a second terminal in the same folder:

```powershell
npm.cmd --prefix frontend run dev
```

Then open `http://localhost:5173`.

