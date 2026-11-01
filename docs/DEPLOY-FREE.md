# WADIMOR online Rp0: Vercel Hobby + Supabase Free

Untuk demo capstone pribadi nonkomersial. Bukan jaminan layanan gratis tanpa batas atau selalu aktif. Diperiksa 1 November 2026: Supabase Free menyediakan database 500 MB, file 1 GB, egress 5 GB; proyek dapat dijeda setelah seminggu tidak aktif. Vercel Hobby memiliki kuota dan batas penggunaan pribadi nonkomersial. Tetap di paket Free/Hobby; jangan aktifkan trial berbayar, upgrade, add-on berbayar, atau membeli domain. Pakai alamat `.vercel.app`. Jika kuota tidak cukup, kurangi penggunaan atau hentikan demo, bukan upgrade.

Sumber: https://supabase.com/pricing dan https://vercel.com/docs/plans/hobby.

## 1. Buat database gratis (pemilik proyek saja)

1. Masuk ke https://supabase.com/dashboard menggunakan GitHub.
2. Buat organisasi **Free**, lalu proyek `wadimor`. Pilih region terdekat yang tersedia.
3. Buat password database baru yang kuat dan simpan pribadi. Ini bukan password login WADIMOR.
4. Di SQL Editor jalankan isi `backend/schema.sql` **sekali pada database baru yang kosong**. Jangan jalankan migration 001–013 lagi: schema sudah memuat struktur terkini.
5. Jalankan isi `backend/deployment/supabase-security.sql`. Ini menutup akses tabel melalui API browser; backend tetap memakai koneksi PostgreSQL.
6. Di Storage, buat bucket **public** `product-images`. Isinya hanya foto produk yang boleh dilihat publik. Tetapkan batas file 3 MB dan MIME types image/jpeg, image/png, image/webp. Jangan membuat kebijakan upload publik.
7. Dari menu Connect salin URI **Transaction pooler**, biasanya port **6543**. Masukkan password database pada placeholder URI; karakter khusus harus di-URL-encode. Tambahkan `?sslmode=require` jika belum ada opsi SSL. Jangan menggunakan URI direct IPv6 untuk fungsi serverless ini.
8. Dari pengaturan API, salin Project URL dan server-side **service_role** key (legacy API keys bila perlu). Jangan kirim key di chat, GitHub, atau frontend.

## 2. Siapkan akun Admin pada database online

Database baru tidak membawa akun lokal. Untuk demo awal, buat satu pemilik baru. Di komputer pengelola proyek, buka PowerShell di folder utama. Masukkan URI online secara privat:

```powershell
$onlineConnection = Read-Host 'Tempel URI Transaction Pooler (input tersembunyi)' -MaskInput
$env:DATABASE_URL = $onlineConnection
$env:ADMIN_PASSWORD = Read-Host 'Password baru Admin minimal 6 karakter (input tersembunyi)' -MaskInput
npm.cmd --prefix backend run setup:admin -- admin_w
Remove-Item Env:DATABASE_URL
Remove-Item Env:ADMIN_PASSWORD
Remove-Variable onlineConnection
```

`-MaskInput` membutuhkan PowerShell 7. Jika menggunakan Windows PowerShell 5, gunakan pengaturan environment privat atau minta bantuan pengelola; jangan menaruh password di repository. Pastikan script berhasil dan variabel dibersihkan meski script gagal. Login WADIMOR tetap memakai hashing/sesi aplikasi yang sudah ada, bukan Supabase Auth.

Jika ingin mempertahankan akun/data lokal, lakukan ekspor dan impor terencana, bukan menyalin schema kembali. Foto lokal `backend/uploads/products` juga harus dipindahkan dan URL produknya diperbarui. Prosedur database baru di atas tidak memindahkan data lokal secara otomatis.

## 3. Deploy Vercel

1. Masuk akun Vercel yang sudah dipakai portofolio; tetap pilih **Hobby**.
2. Add New Project → impor repository `wadimor-capstone` setelah perubahan deployment tersedia di GitHub.
3. Root Directory: **folder utama repository**, bukan frontend/backend. Framework Preset: **Other**. `vercel.json` mengatur install, build, API, dan output.
4. Pilih Node.js **22.x** di pengaturan proyek.
5. Tambahkan environment variables server berikut (untuk Production):

| Nama | Nilai |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URI Transaction Pooler Supabase dengan SSL |
| `CORS_ORIGINS` | URL website persis, misalnya `https://wadimor-demo.vercel.app`, tanpa slash penutup |
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key, server only |
| `SUPABASE_STORAGE_BUCKET` | `product-images` |
| `STORE_NAME` | `WADIMOR` |

6. Deploy. Jika URL baru diketahui setelah deploy, ubah `CORS_ORIGINS` ke URL sebenarnya dan **Redeploy**. Pakai URL production tetap; URL preview tidak otomatis diizinkan login.
7. Buka `/api/status`: harus menampilkan database connected. Lalu buka website dan login Admin.
8. Buat akun Kasir dari Kelola Pengguna. Beri tiap teman akun sendiri. Mereka cukup membuka link yang sama.

Jangan set variabel rahasia dengan prefix `VITE_`. Jangan memakai `.env` lokal sebagai database production. Jangan memasang cron ping hanya untuk menghindari kebijakan pause layanan gratis.

## 4. Periksa sebelum dibagikan

- Login dan logout Admin/Kasir/Customer dari dua perangkat.
- Upload foto, redeploy, periksa foto masih tampil.
- Buat transaksi percobaan; periksa stok/laporan dan pembayaran.
- Buka URL langsung `/admin/inventory` dan refresh, pastikan halaman tidak 404.
- Tes cookie login melalui HTTPS dan penolakan perubahan dari origin lain.
- Pastikan Supabase Data API tidak mengekspos tabel users/sessions.
- Simpan backup database dan foto secara berkala; jangan menganggap Free menyediakan backup otomatis.

Saat proyek Supabase dijeda, pemilik perlu memulihkannya dari dashboard sebelum demo. Saat kuota terlampaui, layanan bisa dibatasi. Rp0 berlaku selama tetap di paket gratis dan ketentuannya; tidak ada janji uptime atau gratis selamanya.

## Perubahan teknis

`api/index.js` mengekspor Express sebagai Vercel Function. Browser mengakses `/api` di domain yang sama, mempertahankan cookie HttpOnly/Secure dan CSRF yang sudah ada. `DATABASE_URL` dipakai backend dan setup Admin; pool serverless dibatasi dua koneksi per instance. Upload memakai Supabase Storage jika konfigurasi tersedia; Vercel menolak fallback tulis ke disk lokal. Lokal tetap mendukung Docker dan file lokal. Batas upload tetap 3 MB agar JSON base64 berada di bawah batas request fungsi Vercel untuk satu foto; hindari payload besar tambahan.
