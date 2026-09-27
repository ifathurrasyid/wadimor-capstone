# Penyelarasan fitur dengan usulan tim

Nama WADIMOR tetap bisa dipakai. Judul akademik dapat dibuat lebih spesifik: **Sistem Informasi Manajemen Stok dan Penjualan Warung Berbasis Web (WADIMOR)**. Pilih apakah sistem ini memang mencakup kasir/penjualan; jika ya, jangan menyebutnya hanya sistem stok.

| Menu usulan | Status saat ini | Langkah berikutnya |
|---|---|---|
| Dashboard | Total jenis barang, unit stok, pendapatan kotor, jumlah transaksi, peringatan stok, grafik/tabel penjualan 7 hari ada. Angka terisi dari transaksi checkout yang tersimpan. | Tambahkan metrik laba setelah harga modal dan aturan perhitungan jelas. |
| Daftar Barang | Nama, kategori, stok, batas minimum, harga jual, status, dan nomor baris ada. | Tambah harga modal, penyesuaian stok dengan alasan, tambah/edit barang, dan arsip. |
| Kasir Digital | Katalog, jumlah, keranjang, metode pembayaran di toko, checkout atomik, dan struk sudah ada. | Tambahkan barcode/SKU, nominal uang tunai dan kembalian, serta perlindungan klik ganda. |
| Riwayat Transaksi | Halaman Admin dan riwayat struk Customer menampilkan ID, waktu, item, pembayaran, dan total. | Tambahkan filter tanggal dan snapshot nama produk pada detail transaksi. |
| Laporan Penjualan | Dashboard 7 hari serta laporan hari ini/7 hari/bulan/semua waktu tersedia. | Tegaskan istilah laba kotor vs laba bersih dan zona waktu laporan. |
| Peringatan Stok | Jumlah peringatan, status, sisa stok, batas minimum, dan filter barang menipis ada. | Buat menu khusus jika daftar barang makin banyak; saat ini filter inventori sudah cukup. |

## Keputusan data yang perlu dibuat bersama analis

1. **Kasir dan pelanggan berbeda.** Halaman Customer saat ini adalah katalog/daftar belanja. Jika Customer melakukan checkout sendiri, riwayat transaksi tidak memiliki “nama kasir”. Untuk transaksi yang diproses staf, Admin dapat bertindak sebagai kasir, atau tambahkan role `kasir`. ERD transaksi sebaiknya menyimpan `customer_id` dan `cashier_id` secara terpisah bila keduanya dibutuhkan.
2. **“Pendapatan bersih” perlu definisi.** Pendapatan kotor = total transaksi penjualan. Pendapatan bersih bisa berarti penjualan setelah diskon/refund, sedangkan *laba bersih* juga mengurangi harga modal dan biaya operasional. Pilih istilah yang benar di laporan. Jangan hitung laba hanya dari harga jual.
3. **Harga modal perlu riwayat.** Simpan `cost_price` untuk harga modal terbaru, tetapi salin `cost_at_transaction` ke detail transaksi saat checkout. Kalau harga modal berubah kemudian, laba historis tetap benar. Tentukan apakah diskon, pajak, retur, dan biaya operasional masuk cakupan capstone.
4. **Stok harus dapat diaudit.** Catat setiap penambahan/pengurangan dengan jumlah, alasan, waktu, dan admin yang melakukannya. Pada checkout, kurangi stok dan simpan transaksi dalam satu transaksi database; tolak stok yang tidak cukup.
5. **Hapus barang perlu aturan.** Produk yang pernah masuk transaksi tidak boleh dihapus begitu saja. Gunakan status arsip/nonaktif; simpan nama, harga jual, dan modal pada detail struk agar riwayat tetap terbaca.
6. **Gambar produk bisa opsional.** Simpan URL/path gambar dan gunakan placeholder saat kosong. Batasi ukuran/format unggahan bila fitur upload dibuat.
7. **Tetapkan zona waktu laporan.** Gunakan Asia/Jakarta secara konsisten untuk rentang harian/mingguan/bulanan dan uji transaksi di sekitar pergantian hari.

## Urutan kerja yang disarankan

1. Sepakati role/aktor checkout dan definisi metrik dengan analis; perbarui ERD, use case, dan mockup.
2. Tambahkan migrasi database untuk harga modal, snapshot detail transaksi, dan catatan mutasi stok. Jangan jalankan ulang `schema.sql` pada database yang sudah berisi data.
3. Bangun CRUD barang dan penyesuaian stok dengan validasi serta hak akses Admin.
4. Perkuat checkout yang sudah ada dengan idempotency key, input uang tunai/kembalian, dan uji pembelian stok terakhir secara bersamaan.
5. Tambahkan filter riwayat dan sempurnakan perhitungan laba sesuai definisi tim.
6. Baru tambahkan unggah gambar dan polesan presentasi.

Untuk capstone, satu alur lengkap—Admin menambah stok, Customer membeli, stok turun tepat sekali, transaksi muncul di riwayat dan laporan—lebih kuat daripada banyak menu yang masih kosong.
