# Panduan UI/UX dan Handoff Tim

**Judul Capstone Project:** Sistem Informasi Inventori untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

Dokumen ini merangkum sistem visual, perilaku antarmuka, pekerjaan desain berikutnya, dan acceptance checklist WADIMOR.

[Baca versi bahasa Inggris](#english-version)

## Arah desain saat ini

Antarmuka menggunakan navigasi hijau tua, latar netral hangat, permukaan data putih, dan aksen amber yang terbatas untuk peringatan stok. Bahasa utama produk adalah Bahasa Indonesia. Warna selalu didampingi teks agar status tidak hanya bergantung pada persepsi warna.

Gambar produk sementara menggunakan placeholder huruf yang netral sampai foto nyata yang sudah dioptimalkan tersedia.

## Alur yang sudah tersedia

### Admin

- Halaman login Admin terpisah dengan role check di server.
- Dashboard menampilkan pendapatan, transaksi, stok menipis, penjualan tujuh hari, tabel harian, dan produk terlaris.
- Inventori menyediakan ringkasan, pencarian, filter kategori, filter stok menipis, dan tabel produk.
- Shortcut stok menipis mereset filter yang bertentangan.
- Riwayat transaksi dan laporan menggunakan data checkout yang tersimpan.

### Customer

- Halaman login dan registrasi Customer terpisah.
- Pencarian dan filter kategori mengontrol katalog.
- Product card menampilkan harga, ketersediaan, dan kontrol jumlah.
- Produk habis tidak dapat dimasukkan ke keranjang.
- Keranjang menampilkan ringkasan dan metode pembayaran di toko.
- Checkout menghitung ulang harga di server, menyimpan transaksi, dan mengurangi stok secara atomik.
- Checkout berhasil menampilkan struk yang dapat dicetak dan masuk ke riwayat Customer.

Keranjang yang belum dibayar hanya tersimpan di memory browser dan hilang setelah reload. Session login tetap bertahan melalui cookie selama belum kedaluwarsa atau logout.

## Responsiveness dan accessibility

Pada layar sempit, navigasi berpindah ke atas, kartu ringkasan tetap ringkas, tabel inventori dapat scroll horizontal, dan keranjang tampil setelah katalog. Halaman secara keseluruhan tidak boleh menghasilkan horizontal scroll.

Fondasi accessibility saat ini:

- Elemen `button`, `label`, `input`, `select`, dan heading yang semantik.
- Table header yang jelas.
- Focus outline yang terlihat.
- Skip link.
- Pesan error dengan role alert.
- Pengumuman loading.
- Status dalam bentuk teks dan warna.

Accessibility tetap perlu diuji dengan keyboard, zoom 200%, contrast checker, dan screen reader dasar.

## Handoff untuk designer

Buat component library yang dapat digunakan ulang, bukan layar yang didesain terpisah. Komponen minimum:

- Navigation dan page heading.
- Primary, secondary, danger, dan text button.
- Labeled input, password field, select, checkbox, dan field error.
- KPI card dan chart container.
- Product row, product card, stock badge, dan category label.
- Empty, loading, error, offline, dan success state.
- Quantity selector, basket row, payment selector, dan receipt summary.
- Dialog konfirmasi dengan fokus keyboard yang benar.

Gunakan spacing increment 4 atau 8 piksel, body text minimal 16 piksel untuk bacaan panjang, target sentuh yang nyaman, dan contrast yang dapat dibaca. Siapkan frame pada lebar 1440, 768, dan 390 piksel; implementasi juga diuji sampai 320 piksel.

## Flow yang perlu didesain berikutnya

1. **Authentication:** show/hide password, session expired, recovery, field error, rate-limit feedback, dan loading. Pemilihan role hanya membuka halaman login; tidak memberikan role.
2. **Admin inventori:** create/edit product, validation, stock adjustment dengan alasan, archived product, duplicate SKU, unsaved changes, dan konfirmasi tindakan berbahaya.
3. **Customer shopping:** katalog/keranjang kosong, produk habis, quantity limit, perubahan harga/stok saat checkout, login required, duplicate-click protection, success, dan printable receipt.
4. **Cashier workflow:** barcode/search cepat, keranjang ramah keyboard, uang diterima, kembalian, payment failure, pencegahan submit ganda, dan print receipt.
5. **History:** rentang tanggal, detail transaksi, payment/refund status, periode kosong, dan receipt yang accessible.
6. **Analytics:** rentang tanggal, perbandingan periode, zona waktu bisnis, empty data, dan table equivalent untuk setiap chart. Jangan menampilkan laba yang belum dapat dihitung dari data nyata.

## Acceptance checklist untuk tester

### Authentication dan hak akses

- [ ] Admin login melalui `/admin/login`; Customer melalui halaman Customer.
- [ ] Credential Admin tidak dapat digunakan pada form Customer, dan sebaliknya.
- [ ] Customer menerima `403` ketika meminta API analytics Admin.
- [ ] Logout membatalkan session; tombol Back tidak membuka data terlindungi.
- [ ] Reload mempertahankan session valid tetapi menghapus keranjang yang belum dibayar.

### Inventori dan filter

- [ ] Data awal menampilkan enam produk, 388 unit, dan satu item stok menipis.
- [ ] `Tango Coklat` berstatus `Menipis`; fixture stok nol berstatus `Habis` dan tidak dapat ditambahkan.
- [ ] Pencarian tidak membedakan huruf besar/kecil.
- [ ] Search, kategori, dan filter stok menipis bekerja bersama.
- [ ] Reset mengembalikan seluruh daftar.
- [ ] Shortcut stok menipis mengabaikan filter lama yang bertentangan.

### Checkout dan integritas data

- [ ] Jumlah item tidak dapat melebihi stok yang dimuat.
- [ ] Jumlah nol menghapus item dari keranjang.
- [ ] Total sesuai dengan harga dan jumlah yang terlihat.
- [ ] Checkout membuat tepat satu transaksi, mengurangi stok sekali, membersihkan keranjang, dan menampilkan struk.
- [ ] Klik bayar berulang tidak membuat transaksi ganda; catat sebagai gap sampai idempotency diterapkan.
- [ ] Stok tidak cukup menampilkan pesan dan tidak menyimpan transaksi parsial.

### Status error, kosong, dan loading

- [ ] API yang berhenti menampilkan error dan retry, bukan halaman kosong.
- [ ] Aplikasi pulih setelah backend berjalan kembali.
- [ ] Array kosong valid menampilkan empty state.
- [ ] Payload tidak valid menampilkan error yang aman.
- [ ] Loading diumumkan dan tidak menyebabkan layout shift berlebihan.

### Keyboard, ukuran layar, dan browser

- [ ] Semua kontrol utama dapat digunakan dengan keyboard dan urutan Tab masuk akal.
- [ ] Focus selalu terlihat dan tidak terperangkap.
- [ ] Input dan tombol memiliki nama yang bermakna.
- [ ] Periksa lebar 320, 390, 768, dan 1440 piksel.
- [ ] Hanya tabel inventori yang boleh scroll horizontal.
- [ ] Periksa zoom 200%, nama panjang, kategori kosong, harga besar, dan stok besar.
- [ ] Uji Chrome, Edge, Firefox, dan minimal satu mobile browser.

Catatan bug minimal berisi browser, viewport, langkah reproduksi, hasil yang diharapkan, hasil aktual, screenshot, dan tingkat dampak.

## Pembagian tanggung jawab

| Role | Output terdekat |
|---|---|
| Coordinator | Milestone: inventori write → checkout hardening → history/report → acceptance/presentation |
| Analyst | Permission matrix, aturan checkout/refund, istilah laporan, ERD, dan perbedaan Customer/Kasir |
| Designer | Component library serta happy/error/empty/loading state untuk seluruh flow |
| Developer | Satu vertical feature lengkap dan diuji pada satu waktu; migration selalu versioned |
| Tester/Documentation | Acceptance run, role/concurrency case, bug evidence, dan screenshot nyata |

---

<a id="english-version"></a>

# UI/UX Guide and Team Handoff — English Version

**Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

This document summarizes WADIMOR's visual system, interface behavior, next design work, and acceptance checklist.

[Read the Indonesian version](#panduan-uiux-dan-handoff-tim)

## Current design direction

The interface uses forest-green navigation, a warm neutral background, white data surfaces, and restrained amber accents for stock alerts. The product's primary language is Indonesian. Color is paired with text so status never depends on color perception alone.

Product images use neutral letter placeholders until real, optimized images are available.

## Implemented flows

### Admin

- Separate Admin login with server-enforced role checks.
- Dashboard with revenue, transactions, low stock, seven-day sales, a daily table, and top products.
- Inventory summaries, search, category filter, low-stock filter, and product table.
- Low-stock shortcut that resets conflicting filters.
- Transaction history and reports backed by stored checkout data.

### Customer

- Separate Customer login and registration.
- Search and category controls for the catalog.
- Product cards with price, availability, and quantity controls.
- Out-of-stock products cannot be added.
- Basket summary and in-store payment method.
- Server-priced atomic checkout that stores the transaction and reduces stock.
- Printable receipt and Customer history after successful checkout.

An unpaid basket exists only in browser memory and is cleared by reload. The login session remains through its cookie until expiry or logout.

## Responsiveness and accessibility

On narrow screens, navigation moves above the page, summary cards remain compact, the Inventory table can scroll horizontally, and the basket follows the catalog. The full page should not scroll horizontally.

Current accessibility foundations:

- Semantic `button`, `label`, `input`, `select`, and heading elements.
- Clear table headers.
- Visible focus outlines.
- A skip link.
- Alert semantics for errors.
- Loading announcements.
- Status expressed through text and color.

Accessibility still requires keyboard, 200% zoom, contrast-checker, and basic screen-reader testing.

## Designer handoff

Create a reusable component library instead of independently designed screens. Minimum components:

- Navigation and page heading.
- Primary, secondary, danger, and text buttons.
- Labeled input, password field, select, checkbox, and field error.
- KPI card and chart container.
- Product row, product card, stock badge, and category label.
- Empty, loading, error, offline, and success states.
- Quantity selector, basket row, payment selector, and receipt summary.
- Confirmation dialog with correct keyboard focus.

Use 4- or 8-pixel spacing increments, at least 16-pixel body text for longer reading, comfortable touch targets, and readable contrast. Prepare frames at 1440, 768, and 390 pixels; test implementation down to 320 pixels.

## Flows to design next

1. **Authentication:** show/hide password, session expiry, recovery, field errors, rate-limit feedback, and loading. Role choice opens a login page; it does not grant a role.
2. **Admin Inventory:** product create/edit, validation, reasoned stock adjustment, archived products, duplicate SKU, unsaved changes, and destructive-action confirmation.
3. **Customer shopping:** empty catalog/basket, unavailable product, quantity limit, changed price/stock at checkout, login required, duplicate-click protection, success, and printable receipt.
4. **Cashier workflow:** fast barcode/search, keyboard-friendly basket, cash received, change, payment failure, double-submit prevention, and receipt printing.
5. **History:** date range, transaction details, payment/refund status, empty period, and accessible receipt.
6. **Analytics:** date range, period comparison, business timezone, empty data, and a table equivalent for every chart. Do not show profit that cannot be calculated from real data.

## Tester acceptance checklist

### Authentication and permissions

- [ ] Admin signs in through `/admin/login`; Customer uses Customer pages.
- [ ] Admin credentials cannot be used in the Customer form, and vice versa.
- [ ] Customer receives `403` from the Admin analytics API.
- [ ] Logout revokes the session; Back does not restore protected data.
- [ ] Reload preserves a valid session but clears an unpaid basket.

### Inventory and filtering

- [ ] Initial data shows six products, 388 units, and one low-stock item.
- [ ] `Tango Coklat` shows `Menipis`; a zero-stock fixture shows `Habis` and cannot be added.
- [ ] Search is case-insensitive.
- [ ] Search, category, and low-stock filters combine correctly.
- [ ] Reset restores the complete list.
- [ ] The low-stock shortcut ignores conflicting old filters.

### Checkout and data integrity

- [ ] Quantity cannot exceed loaded stock.
- [ ] Quantity zero removes an item.
- [ ] Totals match visible prices and quantities.
- [ ] Checkout creates exactly one transaction, reduces stock once, clears the basket, and displays a receipt.
- [ ] Repeated payment clicks do not create duplicates; record this as a gap until idempotency is implemented.
- [ ] Insufficient stock shows a message and does not save a partial transaction.

### Error, empty, and loading states

- [ ] An unavailable API shows an error and retry, not a blank page.
- [ ] The app recovers after the backend restarts.
- [ ] A valid empty array displays an empty state.
- [ ] Invalid payload displays a safe error.
- [ ] Loading is announced without excessive layout shift.

### Keyboard, screen size, and browser

- [ ] Primary controls work with keyboard only and Tab order is logical.
- [ ] Focus remains visible and is not trapped.
- [ ] Inputs and buttons have meaningful names.
- [ ] Check 320, 390, 768, and 1440-pixel widths.
- [ ] Only the Inventory table scrolls horizontally.
- [ ] Check 200% zoom, long names, empty categories, large prices, and large stock.
- [ ] Test Chrome, Edge, Firefox, and at least one mobile browser.

A bug report should include browser, viewport, reproduction steps, expected result, actual result, screenshot, and impact level.

## Team ownership

| Role | Immediate output |
|---|---|
| Coordinator | Milestones: Inventory write → checkout hardening → history/report → acceptance/presentation |
| Analyst | Permission matrix, checkout/refund rules, reporting terms, ERD, and Customer/Cashier distinction |
| Designer | Component library and happy/error/empty/loading states for every flow |
| Developer | One complete, tested vertical feature at a time; all migrations versioned |
| Tester/Documentation | Acceptance runs, role/concurrency cases, bug evidence, and real screenshots |




