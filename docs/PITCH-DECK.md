# WADIMOR — Pitch Deck Sederhana

## Slide 1 — Judul

**WADIMOR (Warung Digital Modern)**  
Sistem Informasi Inventori dan Kasir Digital untuk Toko Offline

## Slide 2 — Masalah

Warung masih sering mencatat stok dan transaksi secara manual. Cara ini membuat stok sulit dipantau, laporan penjualan lambat dibuat, dan kesalahan pencatatan mudah terjadi.

## Slide 3 — Solusi

WADIMOR menyatukan pengelolaan inventori, kasir digital, transaksi, dan laporan penjualan dalam satu aplikasi web.

Setelah pembayaran, sistem membuat **direct invoice/faktur langsung** yang bisa dicetak. Sistem ini dibuat untuk transaksi di toko dan tidak memiliki fitur delivery.

## Slide 4 — Siapa yang memakai?

- **Admin:** mengelola produk, stok, harga, pengguna, transaksi, dan laporan.
- **Customer:** melihat produk, memasukkan barang ke keranjang, checkout, dan melihat faktur serta riwayat pembelian.

Admin dan Customer memiliki halaman login yang berbeda.

## Slide 5 — Fitur utama

- Dashboard Admin dengan total produk, stok, pendapatan, dan grafik penjualan.
- Daftar Inventori dengan kategori, harga modal, harga jual, stok minimum, dan status stok.
- Penambahan, pengurangan, pengeditan, dan penghapusan produk.
- Keranjang belanja dan checkout.
- Pengurangan stok otomatis setelah checkout berhasil.
- Direct invoice/faktur pembayaran.
- Riwayat transaksi.
- Laporan penjualan dan peringatan stok rendah.

## Slide 6 — Alur penggunaan

1. Admin login dan memastikan produk serta stok sudah tersedia.
2. Customer login dan memilih produk.
3. Customer mengatur jumlah barang di keranjang.
4. Customer melakukan checkout.
5. Backend memeriksa stok dan menghitung total harga.
6. Database menyimpan transaksi dan mengurangi stok.
7. Sistem menampilkan faktur pembayaran.
8. Admin dapat melihat transaksi dan laporan penjualan.

## Slide 7 — Keunggulan

- Data stok dan transaksi tersimpan terpusat.
- Harga dihitung oleh server sehingga lebih aman.
- Stok dikunci saat checkout agar tidak berkurang dua kali.
- Admin dapat melihat kondisi toko dari dashboard.
- Aplikasi dapat dijalankan lokal di laptop tanpa layanan cloud.

## Slide 8 — Teknologi

- React + Vite: tampilan aplikasi di browser.
- Tailwind CSS: styling antarmuka.
- Node.js + Express: server dan REST API.
- PostgreSQL: penyimpanan data.
- Docker Compose: menjalankan PostgreSQL secara konsisten.
- GitHub: menyimpan kode dan mengatur kolaborasi.

## Slide 9 — Demo yang disarankan

Tunjukkan urutan ini: Admin login → melihat dashboard → menambah stok → Customer memilih produk → checkout → faktur muncul → stok berkurang → Admin membuka riwayat dan laporan.

## Slide 10 — Penutup

WADIMOR membantu toko offline mengurangi pencatatan manual dan melihat kondisi penjualan dengan lebih cepat. Sistem ini menjadi dasar yang dapat dikembangkan menjadi aplikasi toko yang lebih lengkap.
