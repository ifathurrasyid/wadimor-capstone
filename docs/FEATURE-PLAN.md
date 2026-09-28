# Rencana Fitur WADIMOR

**Judul Capstone Project yang disetujui:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

WADIMOR tetap digunakan sebagai nama aplikasi. Scope sistem mencakup pengelolaan inventori dan data penjualan yang dibutuhkan untuk memperbarui stok, riwayat transaksi, serta laporan.

[Baca versi bahasa Inggris](#english-version)

## Status fitur

| Area | Status saat ini | Langkah berikutnya |
|---|---|---|
| Dashboard | Menampilkan jumlah produk, total unit stok, pendapatan kotor, transaksi, stok menipis, serta penjualan tujuh hari dari data tersimpan. | Tambahkan perbandingan periode setelah aturan tanggal dan zona waktu ditetapkan. |
| Daftar Barang | Menampilkan nama, kategori, stok, batas minimum, harga jual, harga modal, status, pencarian, dan filter. | Tambahkan create/edit/archive produk dan penyesuaian stok dengan alasan. |
| Kasir Digital | Menyediakan katalog, jumlah, keranjang, metode pembayaran di toko, checkout atomik, dan struk. | Tambahkan SKU/barcode, uang diterima, kembalian, dan idempotency key untuk mencegah transaksi ganda. |
| Riwayat Transaksi | Admin dan Customer dapat melihat ID, waktu, item, metode pembayaran, dan total sesuai hak akses. | Tambahkan filter tanggal dan snapshot nama/SKU produk. |
| Laporan | Menyediakan laporan hari ini, tujuh hari, bulan berjalan, dan seluruh waktu. | Tetapkan definisi pendapatan, laba kotor, laba bersih, refund, diskon, dan zona waktu. |
| Peringatan Stok | Menampilkan jumlah peringatan, sisa stok, batas minimum, status, dan filter stok menipis. | Buat halaman khusus jika katalog berkembang; filter inventori cukup untuk scope saat ini. |
| Authentication | Login Admin/Customer terpisah, registrasi Customer, session PostgreSQL, dan role check server tersedia. | Tambahkan reset password, recovery, manajemen session, dan rate limiting untuk deployment publik. |

## Keputusan produk dan data

### 1. Bedakan Customer dan Kasir

`transactions.user_id` saat ini mewakili pengguna yang melakukan checkout. Jika staf memproses transaksi untuk Customer, model data memerlukan `cashier_id` dan `customer_id` terpisah. Tim juga perlu menentukan apakah role `kasir` diperlukan atau Admin dapat bertindak sebagai kasir.

### 2. Gunakan istilah keuangan yang tepat

- Pendapatan kotor: total nilai penjualan sebelum pengurangan.
- Pendapatan bersih: pendapatan setelah diskon, refund, atau potongan yang disepakati.
- Laba kotor: pendapatan dikurangi harga modal barang.
- Laba bersih: laba setelah harga modal dan biaya operasional lain.

Jangan menampilkan label â€œlaba bersihâ€ jika sistem hanya mengurangi harga modal produk.

### 3. Simpan riwayat harga modal

`products.cost_price` menyimpan harga modal terbaru. Saat checkout, nilainya disalin ke `transaction_details.cost_at_transaction` agar laporan historis tetap benar walaupun harga modal berubah.

### 4. Audit setiap perubahan stok

Penambahan atau pengurangan stok harus mencatat produk, jumlah perubahan, alasan, waktu, dan pengguna. Checkout harus mengurangi stok dan menyimpan transaksi dalam satu database transaction.

### 5. Arsipkan produk

Produk yang pernah digunakan dalam transaksi tidak boleh dihapus permanen. Gunakan status aktif/arsip dan simpan snapshot nama, SKU, harga jual, serta harga modal pada detail transaksi.

### 6. Tetapkan aturan pembayaran

Tentukan metode pembayaran, status berhasil/gagal, uang diterima, kembalian, pembatalan, refund, dan apakah transaksi selesai dapat diedit.

### 7. Gunakan zona waktu bisnis yang konsisten

Gunakan `Asia/Jakarta` untuk batas harian, mingguan, dan bulanan. Uji transaksi di sekitar tengah malam agar tidak masuk ke periode yang salah.

### 8. Jadikan gambar produk opsional

Simpan URL atau path gambar dan tampilkan placeholder ketika kosong. Jika upload dibuat, batasi tipe file, ukuran, dimensi, dan lokasi penyimpanan.

## Urutan implementasi

1. Sepakati aktor checkout, permission matrix, istilah keuangan, pembayaran, dan zona waktu; perbarui ERD, use case, serta mockup.
2. Pecah frontend dan backend menjadi page, component, route, service, validation, dan repository yang lebih kecil.
3. Tambahkan migration untuk SKU, snapshot produk, arsip, dan mutasi stok; uji pada salinan database.
4. Bangun create/edit/archive produk dan penyesuaian stok dengan validasi serta hak akses Admin.
5. Perkuat checkout dengan idempotency key, uang diterima/kembalian, dan integration test untuk pembelian stok terakhir secara bersamaan.
6. Tambahkan filter riwayat dan sempurnakan laporan berdasarkan definisi tim.
7. Tambahkan reset password, session management, dan hardening sebelum akses publik.
8. Tambahkan upload gambar dan polish presentasi setelah alur utama stabil.

## Target demo capstone

Alur demo yang kuat adalah: Admin login â†’ Admin menambah atau menyesuaikan stok dengan alasan â†’ Customer memilih produk â†’ checkout berhasil tepat satu kali â†’ stok berkurang â†’ struk tampil di riwayat â†’ dashboard dan laporan ikut berubah.

Satu alur lengkap dan dapat diuji lebih bernilai daripada banyak menu yang belum terhubung ke database.

---

<a id="english-version"></a>

# WADIMOR Feature Plan â€” English Version

**Approved Capstone Project Title:** Inventori Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

WADIMOR remains the application name. The system scope includes inventori management and the sales data needed to update stock, transaction history, and reports.

[Read the Indonesian version](#rencana-fitur-wadimor)

## Feature status

| Area | Current status | Next step |
|---|---|---|
| Dashboard | Shows product count, total inventori units, gross revenue, transactions, low-stock items, and seven-day sales from stored data. | Add period comparison after date and timezone rules are defined. |
| Inventori | Shows name, category, stock, minimum stock, sale price, cost price, status, search, and filters. | Add product create/edit/archive and stock adjustments with reasons. |
| Digital checkout | Provides catalog, quantities, basket, in-store payment method, atomic checkout, and receipt. | Add SKU/barcode, tendered amount, change, and an idempotency key to prevent duplicates. |
| Transaction history | Admin and Customer users can view IDs, times, items, payment methods, and totals according to permission. | Add date filters and product name/SKU snapshots. |
| Reports | Provides today, seven-day, current-month, and all-time reports. | Define revenue, gross profit, net profit, refunds, discounts, and timezone. |
| Stock alerts | Shows alert count, remaining stock, minimum stock, status, and a low-stock filter. | Create a dedicated page if the catalog grows; the inventori filter is enough for the current scope. |
| Authentication | Separate Admin/Customer login, Customer registration, PostgreSQL sessions, and server role checks are available. | Add password reset, recovery, session management, and production-grade rate limiting. |

## Product and data decisions

### 1. Separate Customer and Cashier

`transactions.user_id` currently identifies the user performing checkout. If staff process a sale for a Customer, the model needs separate `cashier_id` and `customer_id` fields. The team must also decide whether a `cashier` role is required or Admin can act as cashier.

### 2. Use precise financial terms

- Gross revenue: total sales before deductions.
- Net revenue: revenue after agreed discounts, refunds, or deductions.
- Gross profit: revenue minus cost of goods sold.
- Net profit: profit after product cost and other operating expenses.

Do not display â€œnet profitâ€ when the system only subtracts product cost.

### 3. Preserve cost history

`products.cost_price` stores the current product cost. At checkout, it is copied to `transaction_details.cost_at_transaction`, keeping historical reports accurate when costs change.

### 4. Audit every inventori change

Every stock increase or decrease should record the product, quantity change, reason, time, and responsible user. Checkout must reduce stock and save the sale in one database transaction.

### 5. Archive products

Products referenced by transactions should not be permanently deleted. Use active/archive status and store name, SKU, sale-price, and cost snapshots in transaction details.

### 6. Define payment rules

Define supported methods, success/failure states, cash received, change, cancellation, refunds, and whether completed transactions can be edited.

### 7. Use one business timezone

Use `Asia/Jakarta` consistently for daily, weekly, and monthly boundaries. Test transactions around midnight so they do not appear in the wrong period.

### 8. Keep product images optional

Store an image URL or path and show a placeholder when empty. If uploads are implemented, restrict file type, size, dimensions, and storage location.

## Recommended implementation order

1. Agree on checkout actors, permission matrix, financial terms, payment rules, and timezone; update the ERD, use cases, and mockups.
2. Split the frontend and backend into smaller pages, components, routes, services, validation modules, and repositories.
3. Add migrations for SKU, product snapshots, archiving, and stock movements; test them on a database copy.
4. Build product create/edit/archive and inventori adjustments with validation and Admin authorization.
5. Strengthen checkout with an idempotency key, tender/change handling, and a concurrent last-item integration test.
6. Add history filters and complete reports based on agreed definitions.
7. Add password reset, session management, and hardening before public access.
8. Add image upload and presentation polish after the core flow is stable.

## Capstone demo target

A strong demonstration is: Admin signs in â†’ Admin adds or adjusts stock with a reason â†’ Customer selects products â†’ checkout succeeds exactly once â†’ stock decreases â†’ the receipt appears in history â†’ dashboard and reports update.

One complete, testable workflow is more valuable than many screens that are not connected to the database.

