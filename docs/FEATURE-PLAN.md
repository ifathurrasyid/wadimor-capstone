# Rencana Fitur WADIMOR

**Judul Capstone Project yang disetujui:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

WADIMOR tetap digunakan sebagai nama aplikasi. Scope sistem mencakup pengelolaan inventori dan data penjualan yang dibutuhkan untuk memperbarui stok, riwayat transaksi, serta laporan.

[Baca versi bahasa Inggris](#english-version)

## Status fitur

| Area | Status saat ini | Langkah berikutnya |
|---|---|---|
| Dashboard | Menampilkan jumlah produk, total unit stok, pendapatan kotor, transaksi, stok menipis, serta penjualan tujuh hari dari data tersimpan. | Tambahkan perbandingan periode setelah aturan tanggal dan zona waktu ditetapkan. |
| Daftar Barang | Menampilkan produk, stok, batas minimum, harga, kode/barcode opsional, status, pencarian, dan filter; Admin tetap dapat menambah, mengedit lewat modal, serta mengatur stok. | Tambahkan pencatatan audit untuk setiap mutasi stok. |
| Kasir Digital | Kasir memproses transaksi walk-in dengan input ID/barcode, keranjang tetap terlihat, checkout atomik, dan faktur; katalog dan akun Customer tetap dipertahankan. | Tambahkan uang diterima/kembalian dan idempotency key untuk mencegah transaksi ganda. |
| Riwayat Transaksi | Admin melihat seluruh transaksi; Kasir melihat transaksi miliknya; Customer melihat struk akunnya. ID transaksi membuka faktur dengan daftar barang dan harga. | Tambahkan filter tanggal dan snapshot nama/kode produk. |
| Laporan | Menyediakan laporan hari ini, tujuh hari, bulan berjalan, dan seluruh waktu. | Tetapkan definisi pendapatan, laba kotor, laba bersih, refund, diskon, dan zona waktu. |
| Peringatan Stok | Badge lonceng di navigasi Admin menghitung barang yang perlu di-restock dan membuka daftar stok menipis. | Tambahkan pengingat stok yang bisa diatur jika dibutuhkan. |
| Authentication | Separate Admin/Cashier/Customer logins, Customer registration, PostgreSQL sessions, and server role checks are available. | Add password reset, recovery, session management, and production rate limiting. |

## Keputusan produk dan data

### 1. Pisahkan peran Kasir dan Customer

Kasir memproses pembelian walk-in, jadi pembeli tidak perlu membuat akun Customer di kasir. Transaksi menyimpan `cashier_id`, sedangkan `user_id` Customer boleh kosong. Akun Customer dan katalog belanja tetap tersedia sebagai alur terpisah. Pemesanan jarak jauh belum termasuk alur inti.
### 2. Gunakan istilah keuangan yang tepat

- Pendapatan kotor: total nilai penjualan sebelum pengurangan.
- Pendapatan bersih: pendapatan setelah diskon, refund, atau potongan yang disepakati.
- Laba kotor: pendapatan dikurangi harga modal barang.
- Laba bersih: laba setelah harga modal dan biaya operasional lain.

Jangan menampilkan label “laba bersih” jika sistem hanya mengurangi harga modal produk.

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

1. Lengkapi permission matrix Admin/Kasir/Customer dan perbarui ERD serta diagram sesuai alur Kasir.
2. Pecah frontend dan backend menjadi page, component, route, service, validation, dan repository yang lebih kecil.
3. Lanjutkan migration untuk audit mutasi stok, snapshot nama/kode produk, dan arsip.
4. Bangun create/edit/archive produk dan penyesuaian stok dengan validasi serta hak akses Admin.
5. Perkuat checkout dengan idempotency key, uang diterima/kembalian, dan integration test untuk pembelian stok terakhir secara bersamaan.
6. Tambahkan filter riwayat dan sempurnakan laporan berdasarkan definisi tim.
7. Tambahkan reset password, session management, dan hardening sebelum akses publik.
8. Tambahkan upload gambar dan polish presentasi setelah alur utama stabil.

## Target demo capstone

Alur demo yang kuat adalah: Admin login → Admin menambah stok → Kasir login → memasukkan ID/barcode barang → checkout berhasil tepat satu kali → stok berkurang → faktur muncul di riwayat → dashboard dan laporan ikut berubah. Fitur Customer tetap dapat didemonstrasikan secara terpisah.

Satu alur lengkap dan dapat diuji lebih bernilai daripada banyak menu yang belum terhubung ke database.

---

<a id="english-version"></a>

# WADIMOR Feature Plan — English Version

**Approved Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

WADIMOR remains the application name. The system scope includes Inventory management and the sales data needed to update stock, transaction history, and reports.

[Read the Indonesian version](#rencana-fitur-wadimor)

## Feature status

| Area | Current status | Next step |
|---|---|---|
| Dashboard | Shows product count, total Inventory units, gross revenue, transactions, low-stock items, and seven-day sales from stored data. | Add period comparison after date and timezone rules are defined. |
| Inventory | Shows name, category, stock, minimum stock, sale price, cost price, status, search, and filters. | Add product create/edit/archive and stock adjustments with reasons. |
| Digital checkout | Cashiers process walk-in sales with product ID/barcode entry, a persistent cart, atomic checkout, and invoices; the customer catalog and accounts remain available. | Add tendered amount/change and an idempotency key to prevent duplicate sales. |
| Transaction history | Admin sees all sales, Cashier sees their own, and Customers keep their account receipts. Clicking a transaction opens an invoice with item details and prices. | Add date filters and product name/code snapshots. |
| Reports | Provides today, seven-day, current-month, and all-time reports. | Define revenue, gross profit, net profit, refunds, discounts, and timezone. |
| Stock alerts | The Admin sidebar bell counts products that need restocking and opens the low-stock list. | Add configurable reminders if needed. |
| Authentication | Separate Admin/Cashier/Customer logins, Customer registration, PostgreSQL sessions, and server role checks are available. | Add password reset, recovery, session management, and production rate limiting. |

## Product and data decisions

### 1. Separate the Cashier and Customer roles

Cashiers process walk-in sales, so shoppers do not need a Customer account at the counter. Transactions store `cashier_id`; the Customer `user_id` can be empty. Customer accounts and the shopping catalog remain available separately. Remote ordering is outside the core workflow for now.
### 2. Use precise financial terms

- Gross revenue: total sales before deductions.
- Net revenue: revenue after agreed discounts, refunds, or deductions.
- Gross profit: revenue minus cost of goods sold.
- Net profit: profit after product cost and other operating expenses.

Do not display “net profit” when the system only subtracts product cost.

### 3. Preserve cost history

`products.cost_price` stores the current product cost. At checkout, it is copied to `transaction_details.cost_at_transaction`, keeping historical reports accurate when costs change.

### 4. Audit every Inventory change

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
4. Build product create/edit/archive and Inventory adjustments with validation and Admin authorization.
5. Strengthen checkout with an idempotency key, tender/change handling, and a concurrent last-item integration test.
6. Add history filters and complete reports based on agreed definitions.
7. Add password reset, session management, and hardening before public access.
8. Add image upload and presentation polish after the core flow is stable.

## Capstone demo target

A strong demonstration is: Admin signs in → Admin adds stock → Cashier signs in → enters/scans item codes → checkout succeeds once → stock decreases → the invoice appears in history → dashboard and reports update. Customer shopping can be demonstrated separately.

One complete, testable workflow is more valuable than many screens that are not connected to the database.







