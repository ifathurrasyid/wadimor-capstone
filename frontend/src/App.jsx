import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import wadimorLogo from './assets/wadimor-logo.svg'

// ─── i18n ──────────────────────────────────────────────────────────────────
const LANGS = {
  id: {
    stockHistory: 'Riwayat Stok',
    allMovements: 'Semua Perubahan',
    adjustStock: 'Sesuaikan Stok',
    reason: 'Alasan',
    movementKind: 'Jenis Perubahan',
    opening: 'Saldo Awal',
    delivery: 'Barang Masuk',
    correction: 'Koreksi',
    sale: 'Penjualan',
    cancellation: 'Pembatalan',
    quantityChange: 'Perubahan Jumlah',
    actor: 'Oleh',
    balance: 'Stok Sebelum / Sesudah',
    cashTendered: 'Uang Diterima',
    cashChange: 'Kembalian',
    retryCheckout: 'Periksa / Ulangi Checkout',
    checkoutUncertain: 'Hasil checkout belum diterima. Ulangi permintaan yang sama untuk mendapatkan struk tanpa membuat penjualan ganda.',
    searchOrders: 'Cari nomor transaksi atau nama',
    allStatuses: 'Semua Status',
    previousPage: 'Sebelumnya',
    nextPage: 'Berikutnya',
    grossProfitNote: 'Laba kotor = penjualan dikurangi harga pokok barang. Belum dikurangi biaya operasional.',
    stockEditHint: 'Gunakan Sesuaikan Stok untuk mengubah jumlah dengan alasan tercatat.',

    brand: 'Warung Digital Modern',
    welcome: 'SELAMAT DATANG DI WADIMOR',
    tagline: 'Satu warung, peran yang tepat.',
    taglineSub: 'Pengelolaan untuk admin. Pengalaman belanja sederhana untuk pelanggan.',
    taglineFooter: 'Kelola dengan jelas. Belanja dengan mudah.',
    sidebarNote: 'Lebih rapi, setiap hari.',
    sidebarNoteDesc: 'Kelola kebutuhan warung dalam satu tempat.',
    mainNav: 'Navigasi utama',
    footerBrand: 'Warung Digital Modern · Dibuat untuk keseharian.',
    chooseAccess: 'PILIH AKSES',
    enterYourSpace: 'Masuk ke ruang Anda',
    chooseSpaceDesc: 'Setiap ruang menggunakan akun dan izin sesuai perannya.',
    adminWarung: 'Admin warung',
    adminWarungDesc: 'Dasbor analitik dan manajemen toko',
    cashier: 'Kasir',
    cashierMenuTitle: 'Kasir Digital',
    cashierDesc: 'Transaksi toko, pembayaran, dan faktur',
    cashierSpace: 'RUANG KASIR',
    cashierLogin: 'Masuk sebagai kasir',
    cashierRoom: 'Ruang kasir',
    cashierName: 'Nama Kasir',
    lowStockMenu: 'Peringatan Stok',
    scanOrType: 'Pindai barcode atau masukkan ID produk',
    addByCode: 'Tambah Barang',
    codeNotFound: 'Kode produk tidak ditemukan.',
    productCode: 'ID / Barcode',
    productImage: 'Foto produk',
    imageUrlHint: 'Pilih JPG, PNG, atau WebP hingga 3 MB.',
    imageInvalid: 'Pilih gambar JPG, PNG, atau WebP berukuran maksimal 3 MB.',
    imageReadError: 'Gambar tidak dapat dibaca. Coba pilih file lain.',
    cashierCart: 'Keranjang Kasir',
    walkInCustomer: 'Pelanggan toko',
    customer: 'Belanja Customer',
    customerDesc: 'Belanja mandiri dan struk pembelian',
    adminSpace: 'RUANG ADMIN',
    customerSpace: 'RUANG CUSTOMER',
    adminLogin: 'Masuk sebagai admin',
    customerLogin: 'Masuk sebagai pelanggan',
    createAccount: 'Buat akun pelanggan',
    registerDesc: 'Daftar untuk menggunakan kasir digital.',
    loginDesc: 'Masukkan akun Anda untuk melanjutkan.',
    username: 'Nama pengguna',
    password: 'Kata sandi',
    confirmPassword: 'Konfirmasi kata sandi',
    name: 'Nama lengkap',
    passwordMin: 'minimal 4 karakter',
    processing: 'Memproses…',
    create: 'Buat akun',
    enter: 'Masuk',
    alreadyHaveAccount: 'Sudah punya akun?',
    noAccount: 'Belum punya akun?',
    registerLink: 'Daftar pelanggan',
    backToChoice: 'Pilih akses lain',
    backToLogin: 'Masuk sebagai pelanggan',
    accountCustomer: 'AKUN PELANGGAN',
    logout: 'Keluar akun',
    dashboard: 'Dasbor',
    inventory: 'Inventori',
    orders: 'Riwayat Transaksi',
    reports: 'Laporan',
    catalog: 'Katalog',
    myOrders: 'Struk Saya',
    refresh: '↻ Perbarui',
    adminRoom: 'Ruang admin',
    customerRoom: 'Ruang pelanggan',
    active: 'WADIMOR aktif',
    connError: 'Koneksi bermasalah',
    skip: 'Langsung ke konten',
    retry: 'Coba lagi',
    sessionCheck: 'Memeriksa sesi…',
    loadingProducts: 'Memuat katalog…',
    dataError: 'Data belum tersedia',
    productCount: 'Jenis Barang',
    stockUnits: 'Total Stok',
    revenue: 'Pendapatan Kotor',
    grossProfit: 'Laba Kotor',
    activeOrders: 'Transaksi Hari Ini',
    lowStock: 'Stok Perlu Perhatian',
    transactionCount: 'Transaksi',
    sevenDaySales: 'Penjualan 7 Hari Terakhir',
    topProducts: 'Barang Terlaris',
    viewInventory: 'Lihat inventori →',
    noSales: 'Belum ada penjualan dalam 7 hari terakhir',
    noSalesDesc: 'Grafik akan terisi saat transaksi checkout tersimpan.',
    noTopProducts: 'Belum ada barang terjual.',
    inventoryTitle: 'Daftar Barang',
    lowStockWarning: 'barang perlu dicek kembali',
    lowStockDesc: 'Prioritaskan pengisian barang yang menipis atau habis.',
    viewItems: 'Lihat barang →',
    searchPlaceholder: 'Cari nama barang…',
    allCategories: 'Semua kategori',
    lowStockOnly: 'Stok menipis / habis',
    priceIDR: 'Harga dalam Rupiah',
    no: 'No.',
    productName: 'Nama Barang',
    category: 'Kategori',
    sellingPrice: 'Harga Jual',
    costPrice: 'Harga Modal',
    stockMin: 'Stok / Min.',
    margin: 'Margin',
    status: 'Status',
    actions: 'Aksi',
    noItems: 'Belum ada barang',
    notFound: 'Barang tidak ditemukan',
    resetFilter: 'Reset filter',
    showing: 'Menampilkan',
    of: 'dari',
    items: 'barang',
    available: 'Tersedia',
    low: 'Menipis',
    empty: 'Habis',
    addProduct: '+ Tambah Barang',
    editProduct: 'Edit Barang',
    saveProduct: 'Simpan Barang',
    cancel: 'Batal',
    delete: 'Hapus',
    confirmDelete: 'Yakin hapus barang ini?',
    stock: 'Stok',
    minStock: 'Stok Minimum',
    productForm: 'Form Barang',
    bannerTitle: 'Kasir Digital WADIMOR',
    bannerSub: 'Pilih barang, bayar langsung di kasir, lalu simpan struk Anda.',
    storeTagline: 'Pilihan di warung',
    cart: 'Keranjang',
    cartTitle: 'Keranjang Belanja',
    cartEmpty: 'Keranjang masih kosong. Tambahkan barang dari katalog.',
    paymentMethod: 'Metode Pembayaran',
    cash: 'Tunai',
    card: 'Kartu',
    qris: 'QRIS',
    estimatedTotal: 'Total Pembayaran',
    checkout: 'Bayar & Selesaikan',
    checkingOut: 'Menyimpan transaksi…',
    checkoutSuccess: 'Pembayaran berhasil dikonfirmasi kasir. Struk sudah dibuat.',
    paymentPending: 'Menunggu konfirmasi pembayaran',
    paymentPaid: 'Pembayaran berhasil',
    paymentCancelled: 'Dibatalkan',
    paymentStatus: 'Status pembayaran',
    seeReceipt: 'Lihat struk',
    seePaymentStatus: 'Lihat status pembayaran',
    confirmPayment: 'Konfirmasi pembayaran',
    cancelOrder: 'Batalkan pesanan',
    confirmCancelOrder: 'Batalkan pesanan ini? Stok akan dikembalikan ke inventori.',
    confirmPaymentSuccess: 'Pembayaran berhasil dikonfirmasi.',
    qrisInstructions: 'Pindai QRIS menggunakan aplikasi pembayaran, masukkan jumlah yang tepat, lalu tunjukkan bukti pembayaran kepada kasir. Status berubah menjadi berhasil setelah kasir mengonfirmasi.',
    qrisUnavailable: 'QRIS belum dikonfigurasi. Tunjukkan nomor transaksi ini kepada kasir untuk membayar di toko.',
    inStorePayment: 'Pembayaran dilakukan langsung di toko. Tunjukkan nomor transaksi kepada kasir.',
    receiptLegal: 'Struk ini merupakan bukti transaksi WADIMOR. Simpan struk ini untuk keperluan pengembalian atau pemeriksaan transaksi.',
    noDelivery: 'Pesanan hanya dapat diambil langsung di toko. WADIMOR tidak menyediakan layanan pengiriman.',
    imageUrl: 'Atau tempel URL gambar',
    orderHistory: 'Struk Saya',
    orderHistoryDesc: 'Riwayat pembayaran dan rincian barang Anda.',
    noOrders: 'Belum ada transaksi',
    noOrdersDesc: 'Struk akan muncul setelah pembayaran diselesaikan.',
    orderNumber: 'Struk #',
    orderDate: 'Tanggal',
    total: 'Total',
    items_ordered: 'Item',
    allOrders: 'Riwayat Transaksi',
    adminOrdersDesc: 'Pantau transaksi dan konfirmasi pembayaran yang sudah diterima.',
    customer_name: 'Pelanggan',
    payment: 'Pembayaran',
    orderDetail: 'Detail Struk',
    filterAll: 'Semua',
    reportsTitle: 'Laporan Penjualan',
    reportsDesc: 'Analitik keuangan berdasarkan periode yang dipilih.',
    periodToday: 'Hari Ini',
    periodWeek: '7 Hari',
    periodMonth: 'Bulan Ini',
    periodAll: 'Semua Waktu',
    omset: 'Omset (Pendapatan Kotor)',
    hpp: 'HPP (Total Modal)',
    laba: 'Laba Kotor',
    totalOrders: 'Total Transaksi',
    loadingReport: 'Memuat laporan…',
    collapseMenu: 'Ciutkan menu',
    expandMenu: 'Perluas menu',
    staffManagement: 'Kelola Pengguna',
    staffTitle: 'Kelola Akun Pengguna',
    staffDesc: 'Super Admin mengelola semua akun. Admin hanya dapat membuat dan menghapus akun Kasir.',
    addStaff: 'Tambah Pengguna',
    fullName: 'Nama lengkap',
    role: 'Peran',
    adminRole: 'Admin',
    cashierRole: 'Kasir',
    customerRole: 'Pelanggan',
    superAdminRole: 'Super Admin',
    createStaff: 'Buat Akun',
    temporaryPassword: 'Kata Sandi Sementara',
    temporaryPasswordNote: 'Salin kata sandi saja. Hanya ditampilkan satu kali.',
    copyPassword: 'Salin',
    copied: 'Tersalin',
    resetOtp: 'Reset Kata Sandi',
    waitingPasswordChange: 'Menunggu penggantian kata sandi',
    activeAccount: 'Aktif',
    deleteUser: 'Hapus Akun',
    confirmDeleteUser: 'Hapus akun ini? Tindakan ini tidak dapat dibatalkan.',
    passwordSetupTitle: 'Ganti kata sandi sementara',
    passwordSetupDesc: 'Untuk keamanan, buat kata sandi pribadi sebelum menggunakan WADIMOR.',
    newPassword: 'Kata sandi baru',
    passwordsMismatch: 'Konfirmasi kata sandi tidak cocok.',
    passwordMin6: 'Minimal 6 karakter',
    changePassword: 'Ganti Kata Sandi',
    settings: 'Pengaturan',
    settingsTitle: 'Pengaturan Akun',
    profileSettings: 'Nama Profil',
    profileDesc: 'Nama ini tampil pada akun dan invoice transaksi.',
    saveName: 'Simpan Nama',
    currentPassword: 'Kata sandi saat ini',
    passwordSettings: 'Ubah Kata Sandi',
    passwordChanged: 'Kata sandi berhasil diperbarui.',
    nameSaved: 'Nama berhasil diperbarui.',
    usernameHint: '3-50 karakter: huruf, angka, atau underscore',
  },
  en: {
    stockHistory: 'Stock History',
    allMovements: 'All Movements',
    adjustStock: 'Adjust Stock',
    reason: 'Reason',
    movementKind: 'Movement Type',
    opening: 'Opening Balance',
    delivery: 'Delivery',
    correction: 'Correction',
    sale: 'Sale',
    cancellation: 'Cancellation',
    quantityChange: 'Quantity Change',
    actor: 'By',
    balance: 'Stock Before / After',
    cashTendered: 'Cash Received',
    cashChange: 'Change',
    retryCheckout: 'Check / Retry Checkout',
    checkoutUncertain: 'The checkout result has not arrived. Retry the same request to recover the receipt without creating a duplicate sale.',
    searchOrders: 'Search transaction number or name',
    allStatuses: 'All Statuses',
    previousPage: 'Previous',
    nextPage: 'Next',
    grossProfitNote: 'Gross profit is sales minus cost of goods, before operating expenses.',
    stockEditHint: 'Use Adjust Stock to change the quantity with a recorded reason.',

    brand: 'Digital Modern Grocery',
    welcome: 'WELCOME TO WADIMOR',
    tagline: 'One store, the right role for everyone.',
    taglineSub: 'Management for admins. Simple shopping for customers.',
    taglineFooter: 'Manage clearly. Shop easily.',
    sidebarNote: 'Tidier, every day.',
    sidebarNoteDesc: 'Manage your store essentials in one place.',
    mainNav: 'Main navigation',
    footerBrand: 'Digital Modern Grocery · Built for everyday work.',
    chooseAccess: 'CHOOSE ACCESS',
    enterYourSpace: 'Enter your space',
    chooseSpaceDesc: 'Each space uses its own account and permissions.',
    adminWarung: 'Store Admin',
    adminWarungDesc: 'Analytics dashboard and store management',
    cashier: 'Cashier',
    cashierMenuTitle: 'Digital Cashier',
    cashierDesc: 'In-store sales, payment, and receipts',
    cashierSpace: 'CASHIER SPACE',
    cashierLogin: 'Sign in as cashier',
    cashierRoom: 'Cashier space',
    cashierName: 'Cashier',
    lowStockMenu: 'Low Stock Alerts',
    scanOrType: 'Scan a barcode or enter a product ID',
    addByCode: 'Add Item',
    codeNotFound: 'Product code not found.',
    productCode: 'ID / Barcode',
    productImage: 'Product photo',
    imageUrlHint: 'Choose a JPG, PNG, or WebP file up to 3 MB.',
    imageInvalid: 'Choose a JPG, PNG, or WebP image up to 3 MB.',
    imageReadError: 'The image could not be read. Try another file.',
    cashierCart: 'Cashier Cart',
    walkInCustomer: 'Walk-in customer',
    customer: 'Customer',
    customerDesc: 'Self-service shopping and receipts',
    adminSpace: 'ADMIN SPACE',
    customerSpace: 'CUSTOMER SPACE',
    adminLogin: 'Sign in as admin',
    customerLogin: 'Sign in as customer',
    createAccount: 'Create customer account',
    registerDesc: 'Register to use the digital checkout.',
    loginDesc: 'Enter your account to continue.',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm password',
    name: 'Full name',
    passwordMin: 'minimum 4 characters',
    processing: 'Processing…',
    create: 'Create account',
    enter: 'Sign in',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    registerLink: 'Register',
    backToChoice: 'Choose another access',
    backToLogin: 'Sign in as customer',
    accountCustomer: 'CUSTOMER ACCOUNT',
    logout: 'Sign out',
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    orders: 'Transaction History',
    reports: 'Reports',
    catalog: 'Catalog',
    myOrders: 'My Receipts',
    refresh: '↻ Refresh',
    adminRoom: 'Admin space',
    customerRoom: 'Customer space',
    active: 'WADIMOR active',
    connError: 'Connection issue',
    skip: 'Skip to content',
    retry: 'Try again',
    sessionCheck: 'Checking session…',
    loadingProducts: 'Loading catalog…',
    dataError: 'Data not available',
    productCount: 'Product Types',
    stockUnits: 'Total Stock',
    revenue: 'Gross Revenue',
    grossProfit: 'Gross Profit',
    activeOrders: "Today's Transactions",
    lowStock: 'Low Stock Alert',
    transactionCount: 'Transactions',
    sevenDaySales: 'Last 7 Days Sales',
    topProducts: 'Top Products',
    viewInventory: 'Lihat inventori →',
    noSales: 'No sales in the last 7 days',
    noSalesDesc: 'Chart will fill up once checkout transactions are recorded.',
    noTopProducts: 'No products sold yet.',
    inventoryTitle: 'Product List',
    lowStockWarning: 'products need attention',
    lowStockDesc: 'Prioritize restocking low or out-of-stock items.',
    viewItems: 'View items →',
    searchPlaceholder: 'Search product name…',
    allCategories: 'All categories',
    lowStockOnly: 'Low / out-of-stock only',
    priceIDR: 'Prices in IDR',
    no: 'No.',
    productName: 'Product Name',
    category: 'Category',
    sellingPrice: 'Selling Price',
    costPrice: 'Cost Price',
    stockMin: 'Stock / Min.',
    margin: 'Margin',
    status: 'Status',
    actions: 'Actions',
    noItems: 'No products yet',
    notFound: 'Product not found',
    resetFilter: 'Reset filters',
    showing: 'Showing',
    of: 'of',
    items: 'items',
    available: 'Available',
    low: 'Low',
    empty: 'Out of stock',
    addProduct: '+ Add Product',
    editProduct: 'Edit Product',
    saveProduct: 'Save Product',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Delete this product?',
    stock: 'Stock',
    minStock: 'Min Stock',
    productForm: 'Product Form',
    bannerTitle: 'WADIMOR Digital Checkout',
    bannerSub: 'Choose items, pay at the counter, then keep your receipt.',
    storeTagline: 'Products at the store',
    cart: 'Cart',
    cartTitle: 'Shopping Cart',
    cartEmpty: 'Cart is empty. Add items from the catalog.',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    qris: 'QRIS',
    estimatedTotal: 'Payment Total',
    checkout: 'Pay & Complete',
    checkingOut: 'Saving transaction…',
    checkoutSuccess: 'The cashier confirmed your payment. Your receipt is ready.',
    paymentPending: 'Awaiting payment confirmation',
    paymentPaid: 'Payment successful',
    paymentCancelled: 'Cancelled',
    paymentStatus: 'Payment status',
    seeReceipt: 'View receipt',
    seePaymentStatus: 'View payment status',
    confirmPayment: 'Confirm payment',
    cancelOrder: 'Cancel order',
    confirmCancelOrder: 'Cancel this order? Its items will return to inventory.',
    confirmPaymentSuccess: 'Payment confirmed successfully.',
    qrisInstructions: 'Scan this QRIS with your payment app, enter the exact amount, then show proof of payment to the cashier. The status changes to successful after the cashier confirms it.',
    qrisUnavailable: 'QRIS is not configured yet. Show this order number to the cashier to pay in store.',
    inStorePayment: 'Pay in store. Show your order number to the cashier.',
    receiptLegal: 'This receipt is proof of a WADIMOR transaction. Keep it for returns or transaction inquiries.',
    noDelivery: 'Orders are for in-store pickup only. WADIMOR does not offer delivery.',
    imageUrl: 'Or paste an image URL',
    orderHistory: 'My Receipts',
    orderHistoryDesc: 'Your payment history and purchased items.',
    noOrders: 'No transactions yet',
    noOrdersDesc: 'Your receipt will appear after payment is completed.',
    orderNumber: 'Receipt #',
    orderDate: 'Date',
    total: 'Total',
    items_ordered: 'Items',
    allOrders: 'Transaction History',
    adminOrdersDesc: 'Review transactions and confirm payments received in store.',
    customer_name: 'Customer',
    payment: 'Payment',
    orderDetail: 'Receipt Details',
    filterAll: 'All',
    reportsTitle: 'Sales Reports',
    reportsDesc: 'Financial analytics by selected period.',
    periodToday: 'Today',
    periodWeek: '7 Days',
    periodMonth: 'This Month',
    periodAll: 'All Time',
    omset: 'Gross Revenue',
    hpp: 'Cost of Goods (COGS)',
    laba: 'Gross Profit',
    totalOrders: 'Total Transactions',
    loadingReport: 'Loading report…',
    collapseMenu: 'Collapse menu',
    expandMenu: 'Expand menu',
    staffManagement: 'Manage Users',
    staffTitle: 'Manage User Accounts',
    staffDesc: 'Super Admins manage all accounts. Admins can only create and delete Cashier accounts.',
    addStaff: 'Add User',
    fullName: 'Full name',
    role: 'Role',
    adminRole: 'Admin',
    cashierRole: 'Cashier',
    customerRole: 'Customer',
    superAdminRole: 'Super Admin',
    createStaff: 'Create Account',
    temporaryPassword: 'Temporary Password',
    temporaryPasswordNote: 'Copy the password only. It is shown once.',
    copyPassword: 'Copy',
    copied: 'Copied',
    resetOtp: 'Reset Password',
    waitingPasswordChange: 'Waiting for password change',
    activeAccount: 'Active',
    deleteUser: 'Delete Account',
    confirmDeleteUser: 'Delete this account? This cannot be undone.',
    passwordSetupTitle: 'Replace your temporary password',
    passwordSetupDesc: 'For security, create a private password before using WADIMOR.',
    newPassword: 'New password',
    passwordsMismatch: 'Password confirmation does not match.',
    passwordMin6: 'At least 6 characters',
    changePassword: 'Change Password',
    settings: 'Settings',
    settingsTitle: 'Account Settings',
    profileSettings: 'Profile Name',
    profileDesc: 'This name appears on your account and transaction invoices.',
    saveName: 'Save Name',
    currentPassword: 'Current password',
    passwordSettings: 'Change Password',
    passwordChanged: 'Password updated successfully.',
    nameSaved: 'Name updated successfully.',
    usernameHint: '3-50 characters: letters, numbers, or underscore',
  }
}

const I18nContext = createContext({ lang: 'id', t: k => k, setLang: () => {} })
const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })
function useT() { return useContext(I18nContext).t }
function useTheme() { return useContext(ThemeContext) }

// ─── API helper ─────────────────────────────────────────────────────────────
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Layanan belum tersedia. Coba lagi.')
    error.status = response.status
    throw error
  }
  return data
}

function usePagedApi(url, refreshToken = 0) {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pageSize: 20, loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setState(current => ({ ...current, loading: true, error: '' }))
      api(url, { signal: controller.signal }).then(data => {
        if (!controller.signal.aborted) setState({ ...data, loading: false, error: '' })
      }).catch(error => {
        if (!controller.signal.aborted) setState(current => ({ ...current, loading: false, error: error.message }))
      })
    }, 180)
    return () => { clearTimeout(timer); controller.abort() }
  }, [url, revision, refreshToken])
  return { ...state, reload }
}
function Pagination({ data, onPage }) {
  const t = useT()
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize))
  return <footer className="panel-footer inventory-pagination">
    <span>{t('showing')} {data.total ? (data.page - 1) * data.pageSize + 1 : 0}&ndash;{Math.min(data.page * data.pageSize, data.total)} {t('of')} {data.total}</span>
    <div className="pagination-controls"><button disabled={data.loading || data.page <= 1} onClick={() => onPage(data.page - 1)} aria-label={t('previousPage')}>&lsaquo;</button><span>{data.page} / {pages}</span><button disabled={data.loading || data.page >= pages} onClick={() => onPage(data.page + 1)} aria-label={t('nextPage')}>&rsaquo;</button></div>
  </footer>
}
function CashSummary({ tendered, change }) {
  const t = useT()
  return tendered == null ? null : <div className="cash-summary"><p>{t('cashTendered')}: <strong>{money(tendered)}</strong></p><p>{t('cashChange')}: <strong>{money(change)}</strong></p></div>
}
function OrderFilters({ search, setSearch, status, setStatus }) {
  const t = useT()
  return <div className="filters"><label className="search-field"><span>{t('searchOrders')}</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label><label><span>{t('paymentStatus')}</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">{t('allStatuses')}</option>{['pending', 'paid', 'cancelled'].map(value => <option key={value} value={value}>{t(value === 'pending' ? 'paymentPending' : value === 'paid' ? 'paymentPaid' : 'paymentCancelled')}</option>)}</select></label></div>
}

const money = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))
const categoryOf = item => item.category_name || '—'
const paths = { choice: '/', adminLogin: '/admin/login', cashierLogin: '/cashier/login', customerLogin: '/customer/login', register: '/customer/register', admin: '/admin', inventory: '/admin/inventory', lowStock: '/admin/low-stock', adminOrders: '/admin/transactions', adminReports: '/admin/reports', staff: '/admin/staff', adminSettings: '/admin/settings', cashier: '/cashier', cashierOrders: '/cashier/transactions', cashierSettings: '/cashier/settings', customer: '/customer', myOrders: '/customer/receipts', customerSettings: '/customer/settings' }

// ─── UI Atoms ───────────────────────────────────────────────────────────────
function Brand({ collapsed }) {
  const t = useT()
  return (
    <span className="brand">
      <img className="brand-mark" src="/assets/wadimor-shop.svg" alt="" aria-hidden="true" />
      {!collapsed && <span>WADIMOR<small>{t('brand')}</small></span>}
    </span>
  )
}

function ReceiptBrand() {
  return <div className="receipt-brand"><img src={wadimorLogo} alt="WADIMOR" /></div>
}
function StatePanel({ title, children, retry }) {
  const t = useT()
  return (
    <div className="state-panel" role={retry ? 'alert' : 'status'}>
      <h2>{title}</h2><p>{children}</p>
      {retry && <button className="button" onClick={retry}>{t('retry')}</button>}
    </div>
  )
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ page, navigate, onAuthenticated }) {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useContext(I18nContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = page === 'adminLogin'
  const isCashier = page === 'cashierLogin'
  const isRegister = page === 'register'
  const isChoice = page === 'choice'

  async function submit(e) {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      const loginRole = isAdmin ? 'admin' : isCashier ? 'cashier' : 'customer'
      const endpoint = isRegister ? '/api/auth/register' : `/api/auth/login/${loginRole}`
      if (isRegister && password !== passwordConfirm) throw new Error(t('passwordsMismatch'))
      const session = await api(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password, passwordConfirm, displayName: displayName.trim() }) })
      onAuthenticated(session)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="auth-screen">
      <div className="auth-feature">
        <Brand collapsed={false} />
        <div>
          <p className="eyebrow">{t('welcome')}</p>
          <h1>{t('tagline')}</h1>
          <p>{t('taglineSub')}</p>
        </div>
        <span>{t('taglineFooter')}</span>
      </div>
      <main id="main" className="auth-main">
        <div className="auth-topbar">
          <button className="lang-btn" onClick={() => setLang(lang === 'id' ? 'en' : 'id')} title="Switch language">{lang === 'id' ? '🇺🇸 EN' : '🇮🇩 ID'}</button>
          <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        <div className="auth-card">
          {isChoice ? (
            <>
              <p className="eyebrow">{t('chooseAccess')}</p>
              <h2>{t('enterYourSpace')}</h2>
              <p className="muted">{t('chooseSpaceDesc')}</p>
              <button className="role-choice" onClick={() => navigate('adminLogin')}>
                <span className="role-icon">▦</span>
                <span><strong>{t('adminWarung')}</strong><small>{t('adminWarungDesc')}</small></span>
                <span>→</span>
              </button>
              <button className="role-choice" onClick={() => navigate('cashierLogin')}>
                <span className="role-icon">▣</span>
                <span><strong>{t('cashier')}</strong><small>{t('cashierDesc')}</small></span>
                <span>→</span>
              </button>
              <button className="role-choice" onClick={() => navigate('customerLogin')}>
                <span className="role-icon">▤</span>
                <span><strong>{t('customer')}</strong><small>{t('customerDesc')}</small></span>
                <span>→</span>
              </button>
            </>
          ) : (
            <>
              <button className="text-link" onClick={() => navigate(isRegister ? 'customerLogin' : 'choice')}>
                ← {isRegister ? t('backToLogin') : t('backToChoice')}
              </button>
              <p className="eyebrow">{isRegister ? t('accountCustomer') : isAdmin ? t('adminSpace') : isCashier ? t('cashierSpace') : t('customerSpace')}</p>
              <h2>{isRegister ? t('createAccount') : isAdmin ? t('adminLogin') : isCashier ? t('cashierLogin') : t('customerLogin')}</h2>
              <p className="muted">{isRegister ? t('registerDesc') : t('loginDesc')}</p>
              <form onSubmit={submit} className="auth-form">
                {isRegister && <label>{t('name')}<input autoComplete="name" required minLength={2} maxLength={100} value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>}
                <label>{t('username')}<input autoComplete="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('username')} /></label>
                <label>{t('password')}<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 6 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? t('passwordMin6') : t('password')} /></label>
                {isRegister && <label>{t('confirmPassword')}<input type="password" autoComplete="new-password" required minLength={6} maxLength={128} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} /></label>}
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button auth-submit" disabled={submitting}>{submitting ? t('processing') : isRegister ? t('create') : t('enter')}</button>
              </form>
              {!isAdmin && !isCashier && <p className="auth-switch">{isRegister ? t('alreadyHaveAccount') : t('noAccount')} <button onClick={() => { setError(''); navigate(isRegister ? 'customerLogin' : 'register') }}>{isRegister ? t('enter') : t('registerLink')}</button></p>}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ analytics, loading, error, retry, navigate }) {
  const t = useT()
  const { lang } = useContext(I18nContext)
  const [grossProfit, setGrossProfit] = useState(null)
  useEffect(() => {
    if (!analytics) return
    let active = true
    api('/api/admin/reports?period=all').then(data => {
      if (active) setGrossProfit(data.financials?.laba_kotor ?? null)
    }).catch(() => { if (active) setGrossProfit(null) })
    return () => { active = false }
  }, [analytics])
  if (loading) return <StatePanel title={t('loadingProducts')}>{t('loadingProducts')}</StatePanel>
  if (error) return <StatePanel title={t('dataError')} retry={retry}>{error}</StatePanel>
  if (!analytics) return null
  const { summary, daily, topProducts } = analytics
  const maxRevenue = Math.max(1, ...daily.map(d => Number(d.revenue)))
  const chartPoints = daily.map((day, index) => ({
    x: 58 + index * (600 / Math.max(1, daily.length - 1)),
    y: 215 - (Number(day.revenue) / maxRevenue) * 175,
    day,
  }))
  const chartLine = chartPoints.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const chartArea = chartPoints.length ? `${chartLine} L ${chartPoints.at(-1).x} 215 L ${chartPoints[0].x} 215 Z` : ''
  return (
    <>
      <section className="stats dashboard-stats">
        <article className="stat-products"><span>{t('productCount')}</span><strong>{summary.product_count}</strong><small>{t('items')}</small></article>
        <article className="stat-stock"><span>{t('stockUnits')}</span><strong>{Number(summary.stock_units).toLocaleString('id-ID')}</strong><small>unit</small></article>
        <article className="stat-gross"><span>{t('revenue')}</span><strong className="currency-stat">{money(summary.revenue)}</strong><small>{t('transactionCount')}: {Number(summary.transaction_count).toLocaleString('id-ID')}</small></article>
        <article className="stat-profit"><span>{t('grossProfit')}</span><strong className="currency-stat">{grossProfit == null ? '—' : money(grossProfit)}</strong><small>{grossProfit == null ? ' ' : t('reportsTitle')}</small></article>
      </section>
      <div className="dashboard-grid">
        <section className="inventory-panel chart-panel">
          <div className="panel-heading"><div><h2>{t('sevenDaySales')}</h2><p className="muted">{t('revenue')}</p></div><span className="chart-period">7 {lang === 'id' ? 'hari terakhir' : 'last days'}</span></div>
          {daily.some(d => Number(d.revenue) > 0) ? (
            <div className="sales-chart"><svg viewBox="0 0 700 255" role="img" aria-label={t('sevenDaySales')} preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map(index => <g key={index}><line className="chart-gridline" x1="58" x2="658" y1={40 + index * 43.75} y2={40 + index * 43.75} /><text className="chart-axis" x="48" y={44 + index * 43.75} textAnchor="end">{new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(maxRevenue * (1 - index / 4))}</text></g>)}
              <path className="chart-area" d={chartArea} /><path className="chart-line" d={chartLine} />
              {chartPoints.map(point => <g key={point.day.day}><circle className="chart-dot" cx={point.x} cy={point.y} r="5"><title>{money(point.day.revenue)}</title></circle><text className="chart-axis chart-date" x={point.x} y="245" textAnchor="middle">{new Date(`${String(point.day.day).slice(0, 10)}T12:00:00`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short' })}</text></g>)}
            </svg></div>
          ) : (
            <div className="chart-empty"><strong>{t('noSales')}</strong><p>{t('noSalesDesc')}</p></div>
          )}
        </section>
        <section className="inventory-panel highlights-panel">
          <div className="panel-heading"><h2>{t('topProducts')}</h2></div>
          {topProducts.length ? (
            <ol className="top-list">{topProducts.map((item, index) => {
              const product = item
              return <li key={item.name}><span className="top-rank">{index + 1}</span><span className="top-product-art">{product?.image_url ? <img src={product.image_url} alt="" /> : item.name.slice(0, 1)}</span><span className="top-product-copy"><strong>{item.name}</strong><small>{item.units_sold} {lang === 'id' ? 'terjual' : 'sold'}</small></span><strong className="top-product-revenue">{money(item.revenue)}</strong></li>
            })}</ol>
          ) : <div className="state-panel"><p>{t('noTopProducts')}</p></div>}
          <div className="panel-footer"><button className="text-link" onClick={() => navigate('inventory')}>{t('viewInventory')}</button></div>
        </section>
      </div>
    </>
  )
}

// ─── Admin Inventory ─────────────────────────────────────────────────────────
function Inventory({ csrfToken, onRefresh, refreshToken, initialLowOnly = false }) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowOnly, setLowOnly] = useState(initialLowOnly)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', product? }
  const [form, setForm] = useState({ name: '', category_id: '', barcode: '', image_url: '', image_data: '', image_preview: '', price: '', cost_price: '', stock: '', min_stock: '5' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [adjustment, setAdjustment] = useState(null)
  const [historyProduct, setHistoryProduct] = useState(null)
  const data = usePagedApi(`/api/products?${new URLSearchParams({ page, pageSize: 7, q: search, category, lowStock: lowOnly })}`, refreshToken)
  const products = data.items
  const refreshInventory = () => { data.reload(); onRefresh() }

  useEffect(() => {
    api('/api/categories').then(setCategories).catch(() => {})
  }, [])

  const catNames = categories.map(item => item.name)
  const currentPage = data.page
  const pageItems = products

  function openAdd() { setForm({ name: '', category_id: '', barcode: '', image_url: '', image_data: '', image_preview: '', price: '', cost_price: '', stock: '', min_stock: '5' }); setFormError(''); setModal({ mode: 'add' }) }
  function openEdit(product) { setForm({ name: product.name, category_id: product.category_id || '', barcode: product.barcode || '', image_url: product.image_url || '', image_data: '', image_preview: product.image_url || '', price: product.price, cost_price: product.cost_price || '', stock: product.stock, min_stock: product.min_stock }); setFormError(''); setModal({ mode: 'edit', product }) }

  async function saveProduct(e) {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const payload = { ...form, image_data: form.image_data || null, price: Number(form.price), cost_price: Number(form.cost_price || 0), stock: Number(form.stock), min_stock: Number(form.min_stock) }
      if (modal.mode === 'add') await api('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(payload) })
      else await api(`/api/admin/products/${modal.product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(payload) })
      setModal(null); refreshInventory()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  async function adjustStock(event) {
    event.preventDefault(); setSaving(true); setFormError('')
    try {
      await api(`/api/admin/products/${adjustment.product.id}/stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ amount: Number(adjustment.amount), kind: adjustment.kind, reason: adjustment.reason }) })
      setAdjustment(null); refreshInventory()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  async function deleteProduct(productId) {
    try {
      await api(`/api/admin/products/${productId}`, { method: 'DELETE', headers: { 'x-csrf-token': csrfToken } })
      setDeleteConfirm(null); refreshInventory()
    } catch (err) { alert(err.message); setDeleteConfirm(null) }
  }

  return (
    <>
      <section className="inventory-panel inventory-list-panel">
        <div className="panel-heading inventory-heading">
          <h2>{t('inventoryTitle')} <span>{data.total}</span></h2>
          <div className="action-row"><button className="button secondary" onClick={() => setHistoryProduct({ id: '', name: '' })}>{t('stockHistory')}</button><button className="button" onClick={openAdd}>{t('addProduct')}</button></div>
        </div>
        <div className="filters inventory-filters">
          <label className="search-field"><span className="sr-only">{t('searchPlaceholder')}</span><input type="search" placeholder={t('searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /></label>
          <label className="inventory-category"><span className="sr-only">{t('category')}</span><select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}><option value="">{t('allCategories')}</option>{catNames.map(n => <option key={n}>{n}</option>)}</select></label>
          <label className="check-label"><input type="checkbox" checked={lowOnly} onChange={e => { setLowOnly(e.target.checked); setPage(1) }} /> {t('lowStockOnly')}</label>
        </div>
        {data.error ? <StatePanel title={t('dataError')} retry={data.reload}>{data.error}</StatePanel> : data.loading ? <StatePanel title={t('loadingProducts')} /> : data.total ? (
          <div className="table-scroll inventory-table-scroll">
            <table>
              <thead><tr>
                <th>{t('no')}</th><th>{t('productName')}</th><th>{t('category')}</th>
                <th className="numeric">{t('stock')}</th><th className="numeric">{t('minStock')}</th>
                <th className="numeric">{t('sellingPrice')}</th><th className="numeric">{t('costPrice')}</th>
                <th>{t('status')}</th><th>{t('actions')}</th>
              </tr></thead>
              <tbody>{pageItems.map((item, i) => {
                const st = item.stock === 0 ? 'empty' : item.stock <= item.min_stock ? 'low' : 'available'
                return (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * 7 + i + 1}</td>
                    <td><div className="product-name">{item.image_url ? <img className="product-thumb" src={item.image_url} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true }} /> : <span className="product-monogram" aria-hidden>{item.name.slice(0, 1)}</span>}<div><strong>{item.name}</strong><small>ID-{item.id}{item.barcode ? ` | ${item.barcode}` : ''}</small></div></div></td>
                    <td>{categoryOf(item)}</td>
                    <td className={`numeric stock-value ${st}`}>{item.stock}</td>
                    <td className="numeric">{item.min_stock}</td>
                    <td className="numeric price">{money(item.price)}</td>
                    <td className="numeric">{money(item.cost_price)}</td>
                    <td><span className={`badge ${st === 'available' ? '' : 'low'}`}>{t(st)}</span></td>
                    <td>
                      <div className="action-row">
                        <button className="action-btn" onClick={() => { setFormError(''); setAdjustment({ product: item, amount: '', kind: 'delivery', reason: '' }) }}>{t('adjustStock')}</button>
                        <button className="action-btn" onClick={() => setHistoryProduct(item)}>{t('stockHistory')}</button>
                        <button className="action-btn" title={t('editProduct')} aria-label={`${t('editProduct')} ${item.name}`} onClick={() => openEdit(item)}>✎</button>
                        <button className="action-btn danger" title={t('delete')} aria-label={`${t('delete')} ${item.name}`} onClick={() => setDeleteConfirm(item)}>×</button>
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        ) : (
          <StatePanel title={search || category || lowOnly ? t('notFound') : t('noItems')}>
            {search || category || lowOnly ? <><span>{t('resetFilter')} </span><button className="text-link" onClick={() => { setSearch(''); setCategory(''); setLowOnly(false) }}>{t('resetFilter')}</button></> : t('noItems')}
          </StatePanel>
        )}
        <Pagination data={data} onPage={setPage} />
      </section>

      {historyProduct && <StockHistory product={historyProduct} onClose={() => setHistoryProduct(null)} />}
      {adjustment && <div className="modal-backdrop"><div className="modal"><h2>{t('adjustStock')} &mdash; {adjustment.product.name}</h2><form className="product-form" onSubmit={adjustStock}>
        <label>{t('movementKind')}<select value={adjustment.kind} onChange={e => setAdjustment(current => ({ ...current, kind: e.target.value }))}><option value="delivery">{t('delivery')}</option><option value="correction">{t('correction')}</option></select></label>
        <label>{t('quantityChange')}<input type="number" required step="1" min={adjustment.kind === 'delivery' ? 1 : -1000000} max="1000000" value={adjustment.amount} onChange={e => setAdjustment(current => ({ ...current, amount: e.target.value }))} /></label>
        <label>{t('reason')}<input required minLength="3" maxLength="300" value={adjustment.reason} onChange={e => setAdjustment(current => ({ ...current, reason: e.target.value }))} /></label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions"><button type="button" className="button secondary" disabled={saving} onClick={() => setAdjustment(null)}>{t('cancel')}</button><button className="button" disabled={saving}>{t('saveProduct')}</button></div>
      </form></div></div>}

      {/* Product Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.mode === 'add' ? t('addProduct') : t('editProduct')}</h2>
            <form onSubmit={saveProduct} className="product-form">
              <label>{t('productName')}<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
              <label>{t('productCode')}<input value={form.barcode} maxLength={64} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder={t('productCode')} /></label>
              <label>{t('productImage')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
                const file = event.target.files?.[0]
                if (!file) return
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
                  setFormError(t('imageInvalid')); event.target.value = ''; return
                }
                const reader = new FileReader()
                reader.onload = () => { const imageData = String(reader.result || ''); setForm(current => ({ ...current, image_data: imageData, image_preview: imageData })); setFormError('') }
                reader.onerror = () => setFormError(t('imageReadError'))
                reader.readAsDataURL(file)
              }} /><small className="muted">{t('imageUrlHint')}</small></label>
              <label>{t('imageUrl')}<input type="url" maxLength={2048} value={form.image_url.startsWith('/uploads/') ? '' : form.image_url} onChange={event => setForm(current => ({ ...current, image_url: event.target.value, image_data: '', image_preview: event.target.value }))} placeholder="https://example.com/product.jpg" /></label>
              {form.image_preview && <div className="product-image-preview-wrap"><img className="product-image-preview" src={form.image_preview} alt={t('productImage')} /><button type="button" className="text-link" onClick={() => setForm(current => ({ ...current, image_url: '', image_data: '', image_preview: '' }))}>{t('delete')}</button></div>}
              <label>{t('category')}<select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}><option value="">{t('allCategories')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <div className="form-row">
                <label>{t('sellingPrice')} (Rp)<input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></label>
                <label>{t('costPrice')} (Rp)<input type="number" min={0} value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} /></label>
              </div>
              <div className="form-row">
                <label>{t('stock')}<input disabled={modal.mode === 'edit'} type="number" required min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></label>
                <label>{t('minStock')}<input type="number" required min={0} value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} /></label>
              </div>
              {modal.mode === 'edit' && <p className="muted">{t('stockEditHint')}</p>}
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setModal(null)}>{t('cancel')}</button>
                <button type="submit" className="button" disabled={saving}>{saving ? t('processing') : t('saveProduct')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{t('confirmDelete')}</h2>
            <p className="muted">{deleteConfirm.name}</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setDeleteConfirm(null)}>{t('cancel')}</button>
              <button className="button danger" onClick={() => deleteProduct(deleteConfirm.id)}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Admin Orders ─────────────────────────────────────────────────────────────
function StockHistory({ product, onClose }) {
  const t = useT()
  const { lang } = useContext(I18nContext)
  const [page, setPage] = useState(1)
  const [kind, setKind] = useState('')
  const data = usePagedApi(`/api/admin/stock-movements?${new URLSearchParams({ productId: product.id, page, pageSize: 10, kind })}`)
  return <div className="modal-backdrop"><div className="modal stock-history-modal" role="dialog" aria-modal="true" aria-label={t('stockHistory')}>
    <div className="panel-heading"><h2>{t('stockHistory')}{product.name ? ` - ${product.name}` : ''}</h2><button className="button secondary" onClick={onClose}>{t('cancel')}</button></div>
    <label>{t('movementKind')}<select value={kind} onChange={event => { setKind(event.target.value); setPage(1) }}><option value="">{t('allMovements')}</option>{['opening', 'delivery', 'correction', 'sale', 'cancellation'].map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label>
    {data.error ? <StatePanel title={t('dataError')} retry={data.reload}>{data.error}</StatePanel> : data.loading ? <StatePanel title={t('loadingProducts')} /> : <div className="table-scroll"><table><thead><tr><th>{t('orderDate')}</th><th>{t('productName')}</th><th>{t('movementKind')}</th><th>{t('quantityChange')}</th><th>{t('balance')}</th><th>{t('actor')}</th><th>{t('reason')}</th></tr></thead><tbody>{data.items.map(item => <tr key={item.id}><td>{new Date(item.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</td><td>{item.product_name}</td><td>{t(item.kind)}{item.transaction_id && ` #${item.transaction_id}`}</td><td>{item.quantity > 0 ? '+' : ''}{item.quantity}</td><td>{item.stock_before} &rarr; {item.stock_after}</td><td>{item.actor_name}</td><td>{item.reason}</td></tr>)}</tbody></table></div>}
    <Pagination data={data} onPage={setPage} />
  </div></div>
}

function AdminOrders({ cashierMode = false, csrfToken }) {
  const t = useT()
  const { lang } = useContext(I18nContext)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const data = usePagedApi(`${cashierMode ? '/api/cashier/transactions' : '/api/admin/transactions'}?${new URLSearchParams({ page, pageSize: 20, q: search, status })}`)
  const { items: transactions, loading, reload: load } = data
  const [detail, setDetail] = useState(null)
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState(null)
  const [confirming, setConfirming] = useState(false)

  async function confirmPayment(transaction, cashTendered) {
    if (transaction.payment_method === 'cash' && cashTendered == null) { setPayment({ transaction, cash: '' }); return }
    setConfirming(true)
    try {
      await api(`/api/transactions/${transaction.id}/confirm-payment`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ cashTendered }) })
      setPayment(null); setDetail(null); setNotice(t('confirmPaymentSuccess')); load()
    } catch (error) { setNotice(error.message) }
    finally { setConfirming(false) }
  }

  return (
    <section className="inventory-panel">
      {notice && <p className="checkout-success" role="status">{notice}</p>}
      <div className="panel-heading">
        <div><h2>{t('allOrders')} <span>{data.total}</span></h2><p className="muted">{t('adminOrdersDesc')}</p></div>
        <button className="button secondary" onClick={load}>↻</button>
      </div>
      <OrderFilters search={search} setSearch={value => { setSearch(value); setPage(1) }} status={status} setStatus={value => { setStatus(value); setPage(1) }} />
      {data.error && <StatePanel title={t('dataError')} retry={load}>{data.error}</StatePanel>}
      {loading ? <StatePanel title="…">Loading</StatePanel> : transactions.length === 0 ? <StatePanel title={t('noOrders')}>{t('noOrdersDesc')}</StatePanel> : (
        <div className="table-scroll"><table><thead><tr>
          <th>ID / Faktur</th><th>{t('cashierName')}</th><th>{t('orderDate')}</th><th>{t('items_ordered')}</th><th>{t('payment')}</th><th>{t('paymentStatus')}</th><th className="numeric">{t('total')}</th><th>{t('actions')}</th>
        </tr></thead><tbody>{transactions.map(transaction => <tr key={transaction.id}>
          <td><button className="text-link" onClick={() => setDetail(transaction)}>#{transaction.id}</button></td><td>{transaction.cashier_name || transaction.customer_name || t('walkInCustomer')}</td>
          <td>{new Date(transaction.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>{t(transaction.payment_method)}</td><td><span className={`badge ${transaction.payment_status === 'paid' ? '' : 'low'}`}>{t(transaction.payment_status === 'paid' ? 'paymentPaid' : transaction.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</span></td>
          <td className="numeric price">{money(transaction.total_amount)}</td>
          <td><div className="action-row"><button className="action-btn" onClick={() => setDetail(transaction)}>{t('orderDetail')}</button>{transaction.payment_status === 'pending' && <button className="button" disabled={confirming} onClick={() => confirmPayment(transaction)}>{t('confirmPayment')}</button>}</div></td>
        </tr>)}</tbody></table></div>
      )}
      <Pagination data={data} onPage={setPage} />
      {payment && <div className="modal-backdrop"><div className="modal"><h2>{t('confirmPayment')} #{payment.transaction.id}</h2><form className="product-form" onSubmit={event => { event.preventDefault(); confirmPayment(payment.transaction, Number(payment.cash)) }}>
        <p>{t('total')}: {money(payment.transaction.total_amount)}</p><label>{t('cashTendered')}<input type="number" step="0.01" min={payment.transaction.total_amount} required value={payment.cash} onChange={event => setPayment(current => ({ ...current, cash: event.target.value }))} /></label>
        <p>{t('cashChange')}: {money(Math.max(0, Number(payment.cash) - Number(payment.transaction.total_amount)))}</p>
        {notice && <p role="status">{notice}</p>}<div className="modal-actions"><button type="button" className="button secondary" disabled={confirming} onClick={() => setPayment(null)}>{t('cancel')}</button><button className="button" disabled={confirming}>{t('confirmPayment')}</button></div>
      </form></div></div>}
      {detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><div className="modal receipt" onClick={event => event.stopPropagation()}>
        <ReceiptBrand /><h2>{t('orderDetail')} #{detail.id}</h2>
        <p className="muted">{new Date(detail.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <div className="order-meta"><p><strong>{t('cashierName')}:</strong> {detail.cashier_name || detail.customer_name || t('walkInCustomer')}</p><p><strong>{t('payment')}:</strong> {t(detail.payment_method)}</p><p><strong>{t('paymentStatus')}:</strong> {t(detail.payment_status === 'paid' ? 'paymentPaid' : detail.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</p></div>
        <CashSummary tendered={detail.cash_tendered} change={detail.cash_change} />
        <ul className="order-items">{detail.items.map((item, index) => <li key={index}><span>{item.product_name} × {item.quantity} @ {money(item.price_at_transaction)}</span><span>{money(item.subtotal)}</span></li>)}</ul>
        <div className="receipt-total"><span>{t('total')}</span><strong>{money(detail.total_amount)}</strong></div><p className="receipt-thanks">{detail.payment_status === 'paid' ? t('receiptLegal') : t(detail.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</p>
        <div className="modal-actions"><button className="button secondary" onClick={() => window.print()}>Print</button><button className="button" onClick={() => setDetail(null)}>{t('cancel')}</button></div>
      </div></div>}
    </section>
  )
}
// ─── Admin Reports ────────────────────────────────────────────────────────────
function AdminReports() {
  const t = useT()
  const [period, setPeriod] = useState('all')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    api(`/api/admin/reports?period=${period}`).then(setReport).catch(() => {}).finally(() => setLoading(false))
  }, [period])

  return (
    <section className="inventory-panel">
      <div className="panel-heading">
        <div><h2>{t('reportsTitle')}</h2><p className="muted">{t('reportsDesc')}</p><p className="muted">{t('grossProfitNote')}</p></div>
        <div className="filter-tabs inline">
          {['today', 'week', 'month', 'all'].map(p => (
            <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {t(`period${p.charAt(0).toUpperCase() + p.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>
      {loading ? <StatePanel title={t('loadingReport')}>{t('loadingReport')}</StatePanel> : report && (
        <>
          <div className="stats report-stats">
            <article><span>{t('omset')}</span><strong className="currency-stat">{money(report.financials?.omset)}</strong></article>
            <article><span>{t('hpp')}</span><strong className="currency-stat">{money(report.financials?.hpp)}</strong></article>
            <article className={Number(report.financials?.laba_kotor) >= 0 ? '' : 'attention'}><span>{t('laba')}</span><strong className="currency-stat">{money(report.financials?.laba_kotor)}</strong></article>
            <article><span>{t('totalOrders')}</span><strong>{report.financials?.total_orders || 0}<small>transaksi</small></strong></article>
          </div>
          <div className="panel-heading"><h2>{t('topProducts')}</h2></div>
          {report.topProducts?.length ? (
            <ol className="top-list">{report.topProducts.map(p => <li key={p.name}><strong>{p.name}</strong><span>{p.units_sold} × · {money(p.revenue)}</span></li>)}</ol>
          ) : <div className="state-panel"><p>{t('noTopProducts')}</p></div>}
        </>
      )}
    </section>
  )
}

// ─── Customer Catalog ─────────────────────────────────────────────────────────
function Catalog({ cart, setCart, csrfToken, onCheckoutSuccess, accountId, refreshToken, cashierMode = false }) {
  const t = useT()
  const { lang } = useContext(I18nContext)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [receipt, setReceipt] = useState(null)
  const [storeConfig, setStoreConfig] = useState({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [cashTendered, setCashTendered] = useState('')
  const checkoutLock = useRef(false)
  const storageKey = `wadimor-checkout-${accountId}`
  const [pendingCheckout, setPendingCheckout] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(storageKey)) } catch { return null }
  })
  const data = usePagedApi(`/api/products?${new URLSearchParams({ page, pageSize: 12, q: search, category })}`, refreshToken)
  useEffect(() => { api('/api/categories').then(items => setCategories(items.map(item => item.name))).catch(() => {}) }, [])

  useEffect(() => { api('/api/public-config').then(setStoreConfig).catch(() => {}) }, [])

  const visible = data.items
  const cartItems = Object.values(cart).filter(item => item.quantity > 0)
  const total = cartItems.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0)
  const cartCount = cartItems.reduce((sum, p) => sum + p.quantity, 0)

  function changeQty(item, delta) {
    if (pendingCheckout || checkoutLock.current) return
    setCart(current => {
      const quantity = Math.max(0, Math.min(item.stock, (current[item.id]?.quantity || 0) + delta))
      const next = { ...current }
      if (quantity) next[item.id] = { ...item, quantity }
      else delete next[item.id]
      return next
    })
  }
  async function addByCode(event) {
    event.preventDefault()
    const code = search.trim()
    if (!code || pendingCheckout || checkoutLock.current) return
    try {
      const found = await api(`/api/products?${new URLSearchParams({ code, pageSize: 2 })}`)
      if (found.items.length !== 1) { setCheckoutError(t('codeNotFound')); return }
      const product = found.items[0]
      if (product.stock < 1) { setCheckoutError(t('empty')); return }
      changeQty(product, 1); setSearch(''); setPage(1); setCheckoutError('')
    } catch (error) { setCheckoutError(error.message) }
  }

  async function checkout() {
    if (checkoutLock.current) return
    checkoutLock.current = true
    setCheckingOut(true); setCheckoutError('')
    let attempt = pendingCheckout
    try {
      if (!attempt) {
        const items = cartItems.map(product => ({ productId: product.id, quantity: product.quantity }))
        if (!items.length) return
        attempt = { key: crypto.randomUUID(), body: { items, paymentMethod, cashTendered: cashierMode && paymentMethod === 'cash' ? Number(cashTendered) : null } }
        // Persist before sending: a lost response or page reload reuses the same key.
        sessionStorage.setItem(storageKey, JSON.stringify(attempt))
        setPendingCheckout(attempt)
      }
      const result = await api('/api/transactions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken, 'Idempotency-Key': attempt.key }, body: JSON.stringify(attempt.body) })
      sessionStorage.removeItem(storageKey); setPendingCheckout(null)
      setCart({}); setCartOpen(false); setReceipt(result.receipt); setCashTendered('')
      data.reload(); onCheckoutSuccess()
    } catch (err) {
      // A server rejection is definitive; transport errors retain the original attempt.
      if (err.status >= 400 && err.status < 500 && ![408, 429].includes(err.status)) {
        sessionStorage.removeItem(storageKey); setPendingCheckout(null)
      }
      setCheckoutError(err.message)
    } finally { checkoutLock.current = false; setCheckingOut(false) }
  }

  return (
    <><fieldset className="checkout-workspace" disabled={checkingOut || Boolean(pendingCheckout)}><div className={`catalog-layout ${cashierMode ? 'cashier-layout' : ''}`}>
      {!cashierMode && <p className="pickup-note">{t('noDelivery')}</p>}
      {/* Catalog Section */}
      <section className="catalog-section">
        {!cashierMode && <div className="store-banner">
          <strong>{t('bannerTitle')}</strong>
          <p>{t('bannerSub')}</p>
        </div>}
        <div className={`inventory-panel ${cashierMode ? 'cashier-catalog-panel' : ''}`}>
          {!cashierMode && <div className="panel-heading">
            <h2>{t('storeTagline')} <span>{visible.length}</span></h2>
          </div>}
          <div className={`filters ${cashierMode ? 'cashier-filters' : ''}`}>
            <label className="search-field"><span className={cashierMode ? 'sr-only' : ''}>{t('searchPlaceholder')}</span><input type="search" autoFocus={cashierMode} placeholder={cashierMode ? `${t('searchPlaceholder')} / ID / Barcode` : t('searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} onKeyDown={cashierMode ? event => { if (event.key === 'Enter') addByCode(event) } : undefined} /></label>
            {!cashierMode && <label><span>{t('category')}</span>
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
                <option value="">{t('allCategories')}</option>
                {categories.map(n => <option key={n}>{n}</option>)}
              </select>
            </label>}
          </div>
          {cashierMode && <div className="cashier-category-tabs" aria-label={t('category')}><button className={category === '' ? 'active' : ''} onClick={() => { setCategory(''); setPage(1) }}>{lang === 'id' ? 'Semua' : 'All'}</button>{categories.map(name => <button key={name} className={category === name ? 'active' : ''} onClick={() => { setCategory(name); setPage(1) }}>{name}</button>)}</div>}
          {data.error ? <StatePanel title={t('dataError')} retry={data.reload}>{data.error}</StatePanel> : data.loading ? <StatePanel title={t('loadingProducts')} /> : visible.length ? (
            <div className="product-grid">
              {visible.map(item => {
                const inCart = cart[item.id]?.quantity || 0
                const outOfStock = item.stock === 0
                const lowStockItem = item.stock > 0 && item.stock <= item.min_stock
                return (
                  <article className={`product-card ${cashierMode ? 'cashier-product-card' : ''} ${outOfStock ? 'out-of-stock' : ''}`} key={item.id}>
                    <div className="card-art">{item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" onError={event => { event.currentTarget.hidden = true }} /> : <><span className="card-placeholder">{item.name.slice(0, 1)}</span><span>WADIMOR / {categoryOf(item)}</span></>}</div>
                    {lowStockItem && <span className="low-stock-tag">⚠️ Stok Terbatas</span>}
                    <small>{categoryOf(item)}</small>
                    <h3>{item.name}</h3>
                    {cashierMode && <small className="cashier-product-id">ID: {item.id}{item.barcode ? ` | ${item.barcode}` : ''}</small>}
                    <strong>{money(item.price)}</strong>
                    <div className="card-bottom">
                      <span>{outOfStock ? t('empty') : `${item.stock} tersedia`}</span>
                      {cashierMode ? <div className="quantity"><button aria-label={`${item.name}: kurangi`} disabled={inCart === 0} onClick={() => changeQty(item, -1)}>−</button><output>{inCart}</output><button aria-label={`${item.name}: tambah`} disabled={outOfStock || inCart >= item.stock} onClick={() => changeQty(item, 1)}>+</button></div> : inCart === 0 ? (
                        <button className="button" disabled={outOfStock} onClick={() => changeQty(item, 1)}>+ {t('cart')}</button>
                      ) : (
                        <div className="quantity">
                          <button aria-label={`Kurangi`} onClick={() => changeQty(item, -1)}>−</button>
                          <output>{inCart}</output>
                          <button aria-label={`Tambah`} disabled={inCart >= item.stock} onClick={() => changeQty(item, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <StatePanel title={t('notFound')}>{t('resetFilter')}</StatePanel>
          )}
          <Pagination data={data} onPage={setPage} />
        </div>
      </section>

      {cashierMode && <aside className="cashier-cart inventory-panel">
        <div className="panel-heading"><h2><span className="cart-heading-icon" aria-hidden="true">▣</span>{t('cartTitle')} <span>{cartCount}</span></h2>{cartCount > 0 && <button className="text-link" onClick={() => setCart({})}>{t('delete')}</button>}</div>
        {cartItems.length === 0 ? <p className="cart-empty">{t('cartEmpty')}</p> : <div className="cart-items-list">{cartItems.map(item => <div className="cart-item" key={item.id}>
          <div className="cart-item-art">{item.image_url ? <img src={item.image_url} alt="" /> : item.name.slice(0, 1)}</div><div className="cart-item-info"><strong>{item.name}</strong><small>{item.quantity} × {money(item.price)}</small><span>{money(Number(item.price) * item.quantity)}</span></div>
          <button className="cart-remove" title={t('delete')} aria-label={`${t('delete')} ${item.name}`} onClick={() => changeQty(item, -item.quantity)}>×</button>
        </div>)}</div>}
        <div className="cart-payment"><label>{t('paymentMethod')}<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)}><option value="cash">{t('cash')}</option><option value="card">{t('card')}</option><option value="qris">{t('qris')}</option></select></label></div>
        {paymentMethod === 'cash' && <div className="cart-payment"><label>{t('cashTendered')}<input type="number" min={total} step="0.01" value={cashTendered} onChange={event => setCashTendered(event.target.value)} /></label><p>{t('cashChange')}: <strong>{money(Math.max(0, Number(cashTendered) - total))}</strong></p></div>}
        <div className="cart-total"><span>{t('estimatedTotal')}</span><strong>{money(total)}</strong></div>
        {checkoutError && <p className="form-error">{checkoutError}</p>}
        <button className="button checkout-btn" disabled={checkingOut || cartCount === 0 || (paymentMethod === 'cash' && (cashTendered === '' || Number(cashTendered) < total))} onClick={checkout}>{checkingOut ? t('checkingOut') : t('checkout')}</button>
      </aside>}
      {/* Cart Fab */}
      {!cashierMode && cartCount > 0 && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          🛒 {cartCount}
        </button>
      )}

      {/* Cart Slide-over */}
      <div className={`cart-slideover ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{t('cartTitle')} <span>{cartCount}</span></h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        {cartItems.length === 0 ? (
          <p className="cart-empty">{t('cartEmpty')}</p>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info"><strong>{item.name}</strong><span>{money(Number(item.price) * item.quantity)}</span></div>
                  <div className="quantity">
                    <button onClick={() => changeQty(item, -1)}>−</button>
                    <output>{item.quantity}</output>
                    <button disabled={item.quantity >= item.stock} onClick={() => changeQty(item, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-payment">
              <label>{t('paymentMethod')}<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)}><option value="cash">{t('cash')}</option><option value="card">{t('card')}</option><option value="qris">{t('qris')}</option></select></label>
              {!cashierMode && <p className="muted">{t('inStorePayment')}</p>}
            </div>
            <div className="cart-total">
              <span>{t('estimatedTotal')}</span><strong>{money(total)}</strong>
            </div>
            {checkoutError && <p className="form-error">{checkoutError}</p>}
            <button className="button checkout-btn" disabled={checkingOut} onClick={checkout}>
              {checkingOut ? t('checkingOut') : t('checkout')}
            </button>
          </>
        )}
      </div>
      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)} />}
      {receipt && <div className="modal-backdrop"><div className="modal receipt">
        {receipt.paymentStatus === 'pending' ? <>
          <ReceiptBrand /><p className="eyebrow">WADIMOR | #{receipt.id}</p><h2>{t('paymentPending')}</h2>
          <p className="muted">{t('payment')} | {t(receipt.paymentMethod)} | {money(receipt.totalAmount)}</p>
          {receipt.paymentMethod === 'qris' && storeConfig.qrisImageUrl && <img className="qris-image" src={storeConfig.qrisImageUrl} alt="QRIS WADIMOR" />}
          <p className="muted">{receipt.paymentMethod === 'qris' ? (storeConfig.qrisImageUrl ? t('qrisInstructions') : t('qrisUnavailable')) : t('inStorePayment')}</p>
          <p className="receipt-thanks">{t('noDelivery')}</p>
          <div className="modal-actions"><button className="button" onClick={() => setReceipt(null)}>{t('seePaymentStatus')}</button></div>
        </> : <>
          <ReceiptBrand /><p className="eyebrow">WADIMOR | {t('orderDetail')}</p><h2>{t('orderNumber')}{receipt.id}</h2>
          <p className="muted">{new Date(receipt.createdAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <div className="order-meta">{receipt.cashier && <p><strong>{t('cashierName')}:</strong> {receipt.cashier}</p>}<p><strong>{t('payment')}:</strong> {t(receipt.paymentMethod)}</p><p><strong>{t('paymentStatus')}:</strong> {t('paymentPaid')}</p></div>
          <CashSummary tendered={receipt.cashTendered} change={receipt.cashChange} /><ReceiptRows items={receipt.items} />
          <div className="receipt-total"><span>{t('total')}</span><strong>{money(receipt.totalAmount)}</strong></div>
          <p className="receipt-thanks">{t('receiptLegal')}</p>
          <div className="modal-actions"><button className="button secondary" onClick={() => window.print()}>Print</button><button className="button" onClick={() => setReceipt(null)}>Selesai</button></div>
        </>}
      </div></div>}
    </div></fieldset>
    {pendingCheckout && <section className="inventory-panel checkout-recovery" role="status"><p>{t('checkoutUncertain')}</p>{checkoutError && <p className="form-error">{checkoutError}</p>}<button className="button" disabled={checkingOut} onClick={checkout}>{checkingOut ? t('checkingOut') : t('retryCheckout')}</button></section>}</>

  )
}

// ─── My Orders ────────────────────────────────────────────────────────────────
function ReceiptRows({ items }) {
  return <ul className="order-items">{items.map((item, index) => <li key={item.productId || index}><span>{item.product_name || item.name} x {item.quantity} @ {money(item.price_at_transaction ?? item.unitPrice)}</span><span>{money(item.subtotal)}</span></li>)}</ul>
}

function MyOrders({ csrfToken }) {
  const t = useT()
  const { lang } = useContext(I18nContext)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const data = usePagedApi(`/api/transactions/mine?${new URLSearchParams({ page, pageSize: 20, q: search, status })}`)
  const { items: transactions, loading, reload: load } = data
  const [selected, setSelected] = useState(null)
  const [storeConfig, setStoreConfig] = useState({})

  useEffect(() => { const timer = setInterval(load, 15000); return () => clearInterval(timer) }, [load])
  useEffect(() => { api('/api/public-config').then(setStoreConfig).catch(() => {}) }, [])
  const selectedTransaction = selected && (transactions.find(item => item.id === selected.transaction.id) || selected.transaction)
  async function cancelOrder(transaction) {
    if (!window.confirm(t('confirmCancelOrder'))) return
    try {
      await api(`/api/transactions/${transaction.id}/cancel`, { method: 'POST', headers: { 'x-csrf-token': csrfToken } })
      setSelected(null)
      load()
    } catch (error) { window.alert(error.message) }
  }

  return <section className="inventory-panel">
    <div className="panel-heading"><div><h2>{t('orderHistory')} <span>{data.total}</span></h2><p className="muted">{t('orderHistoryDesc')}</p></div><button className="button secondary" onClick={load}>{t('refresh')}</button></div>
    <OrderFilters search={search} setSearch={value => { setSearch(value); setPage(1) }} status={status} setStatus={value => { setStatus(value); setPage(1) }} />
    {data.error && <StatePanel title={t('dataError')} retry={load}>{data.error}</StatePanel>}
    {loading ? <StatePanel title={t('loadingProducts')} /> : transactions.length === 0 ? <StatePanel title={t('noOrders')}>{t('noOrdersDesc')}</StatePanel> : <div className="orders-list">{transactions.map(transaction => <article key={transaction.id} className="order-card">
      <div className="order-card-header"><span><strong>{t('orderNumber')}{transaction.id}</strong><small>{new Date(transaction.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
        <span className="order-card-right"><span>{t(transaction.payment_method)}</span><strong>{money(transaction.total_amount)}</strong><span className={`badge ${transaction.payment_status === 'paid' ? '' : 'low'}`}>{t(transaction.payment_status === 'paid' ? 'paymentPaid' : transaction.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</span></span>
      </div>
      <div className="order-actions"><button className="button secondary" onClick={() => setSelected({ transaction, tab: 'receipt' })}>{t('seeReceipt')}</button><button className="button secondary" onClick={() => setSelected({ transaction, tab: 'status' })}>{t('seePaymentStatus')}</button></div>
    </article>)}</div>}
    <Pagination data={data} onPage={setPage} />
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal receipt" onClick={event => event.stopPropagation()}>
      <ReceiptBrand /><p className="eyebrow">WADIMOR | #{selectedTransaction.id}</p>
      {selected.tab === 'status' ? <><h2>{t('paymentStatus')}</h2><p className={`payment-status-large ${selectedTransaction.payment_status}`}>{t(selectedTransaction.payment_status === 'paid' ? 'paymentPaid' : selectedTransaction.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</p>
        <div className="order-meta"><p><strong>{t('payment')}:</strong> {t(selectedTransaction.payment_method)}</p><p><strong>{t('total')}:</strong> {money(selectedTransaction.total_amount)}</p>{selectedTransaction.payment_confirmed_at && <p><strong>{t('orderDate')}:</strong> {new Date(selectedTransaction.payment_confirmed_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>}</div>
        {selectedTransaction.payment_status === 'pending' && selectedTransaction.payment_method === 'qris' && storeConfig.qrisImageUrl && <img className="qris-image" src={storeConfig.qrisImageUrl} alt="QRIS WADIMOR" />}
        {selectedTransaction.payment_status === 'pending' && <p className="muted">{selectedTransaction.payment_method === 'qris' ? (storeConfig.qrisImageUrl ? t('qrisInstructions') : t('qrisUnavailable')) : t('inStorePayment')}</p>}
        <p className="receipt-thanks">{t('noDelivery')}</p>
        {selectedTransaction.payment_status === 'pending' && <button className="button danger-button" onClick={() => cancelOrder(selectedTransaction)}>{t('cancelOrder')}</button>}
      </> : <><h2>{t('orderNumber')}{selectedTransaction.id}</h2><p className="muted">{new Date(selectedTransaction.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <div className="order-meta">{selectedTransaction.customer_name && <p><strong>{t('fullName')}:</strong> {selectedTransaction.customer_name}</p>}{selectedTransaction.cashier_name && <p><strong>{t('cashierName')}:</strong> {selectedTransaction.cashier_name}</p>}<p><strong>{t('payment')}:</strong> {t(selectedTransaction.payment_method)}</p><p><strong>{t('paymentStatus')}:</strong> {t(selectedTransaction.payment_status === 'paid' ? 'paymentPaid' : selectedTransaction.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</p></div>
        <CashSummary tendered={selectedTransaction.cash_tendered} change={selectedTransaction.cash_change} /><ReceiptRows items={selectedTransaction.items} /><div className="receipt-total"><span>{t('total')}</span><strong>{money(selectedTransaction.total_amount)}</strong></div>
        <p className="receipt-thanks">{selectedTransaction.payment_status === 'paid' ? t('receiptLegal') : t(selectedTransaction.payment_status === 'cancelled' ? 'paymentCancelled' : 'paymentPending')}</p>
      </>}
      <div className="modal-actions">{selected.tab === 'receipt' && selectedTransaction.payment_status === 'paid' && <button className="button secondary" onClick={() => window.print()}>Print</button>}<button className="button" onClick={() => setSelected(null)}>{t('cancel')}</button></div>
    </div></div>}
  </section>
}
// ─── Staff & Account Settings ────────────────────────────────────────────────
function PasswordChangeModal({ session, onComplete }) {
  const t = useT()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (newPassword !== confirmPassword) return setError(t('passwordsMismatch'))
    setSaving(true)
    try {
      await api('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken }, body: JSON.stringify({ newPassword }) })
      onComplete()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  return <div className="forced-password-page">
    <div className="forced-password-brand"><Brand /></div>
    <div className="modal-backdrop persistent"><form className="modal account-form" onSubmit={submit}>
      <p className="eyebrow">WADIMOR · {t('settings')}</p>
      <h2>{t('passwordSetupTitle')}</h2>
      <p className="muted">{t('passwordSetupDesc')}</p>
      <label>{t('newPassword')}<input type="password" autoComplete="new-password" minLength={6} maxLength={128} required value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder={t('passwordMin6')} /></label>
      <label>{t('confirmPassword')}<input type="password" autoComplete="new-password" minLength={6} maxLength={128} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" disabled={saving}>{saving ? t('processing') : t('changePassword')}</button>
    </form></div>
  </div>
}

function StaffManagement({ csrfToken, isSuperAdmin, currentUserId }) {
  const t = useT()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ displayName: '', username: '', role: 'cashier' })
  const [credential, setCredential] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const load = useCallback(() => {
    api('/api/admin/staff').then(setStaff).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])
  async function createStaff(event) {
    event.preventDefault(); setSaving(true); setError(''); setCredential(null)
    try {
      const result = await api('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(form) })
      setCredential({ username: result.staff.username, password: result.temporaryPassword })
      setForm({ displayName: '', username: '', role: 'cashier' }); setShowForm(false); load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  async function resetPassword(member) {
    setError(''); setCredential(null)
    try {
      const result = await api(`/api/admin/staff/${member.id}/reset-password`, { method: 'POST', headers: { 'x-csrf-token': csrfToken } })
      setCredential({ username: result.staff.username, password: result.temporaryPassword }); load()
    } catch (err) { setError(err.message) }
  }
  async function deleteUser(member) {
    if (!window.confirm(t('confirmDeleteUser'))) return
    setError('')
    try {
      await api(`/api/admin/staff/${member.id}`, { method: 'DELETE', headers: { 'x-csrf-token': csrfToken } })
      setCredential(null)
      load()
    } catch (err) { setError(err.message) }
  }
  async function copyCredential() {
    if (!credential) return
    await navigator.clipboard.writeText(credential.password)
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  const roleLabel = role => role === 'super_admin' ? t('superAdminRole') : role === 'admin' ? t('adminRole') : role === 'kasir' ? t('cashierRole') : t('customerRole')
  if (loading) return <StatePanel title={t('loadingProducts')}>{t('loadingProducts')}</StatePanel>
  return <>
    {credential && <div className="credential-card" role="status">
      <div><p className="eyebrow">{t('temporaryPassword')}</p><strong>{credential.username}</strong><code>{credential.password}</code><small>{t('temporaryPasswordNote')}</small></div>
      <button className="button" onClick={copyCredential}>{copied ? t('copied') : t('copyPassword')}</button>
    </div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="inventory-panel">
      <div className="panel-heading"><div><h2>{t('staffTitle')} <span>{staff.length}</span></h2><p className="muted">{t('staffDesc')}</p></div><button className="button" onClick={() => setShowForm(true)}>{t('addStaff')}</button></div>
      <div className="table-scroll"><table><thead><tr><th>{t('fullName')}</th><th>{t('username')}</th><th>{t('role')}</th><th>{t('status')}</th><th>{t('actions')}</th></tr></thead>
      <tbody>{staff.map(member => <tr key={member.id}><td className="price">{member.displayName}</td><td>{member.username}</td><td>{roleLabel(member.role)}</td><td><span className={`badge ${member.mustChangePassword ? 'low' : ''}`}>{member.mustChangePassword ? t('waitingPasswordChange') : t('activeAccount')}</span></td><td><div className="action-row">{isSuperAdmin && ['admin', 'kasir'].includes(member.role) && <button className="action-btn" onClick={() => resetPassword(member)}>{t('resetOtp')}</button>}{member.id !== currentUserId && (isSuperAdmin || member.role === 'kasir') && <button className="action-btn danger" onClick={() => deleteUser(member)}>{t('deleteUser')}</button>}</div></td></tr>)}</tbody></table></div>
    </section>
    {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="modal account-form" onSubmit={createStaff} onClick={event => event.stopPropagation()}>
      <h2>{t('addStaff')}</h2>
      <label>{t('fullName')}<input required minLength={2} maxLength={100} value={form.displayName} onChange={event => setForm(current => ({ ...current, displayName: event.target.value }))} /></label>
      <label>{t('username')}<input required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" value={form.username} onChange={event => setForm(current => ({ ...current, username: event.target.value }))} /><small>{t('usernameHint')}</small></label>
      {isSuperAdmin && <label>{t('role')}<select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))}><option value="cashier">{t('cashierRole')}</option><option value="admin">{t('adminRole')}</option><option value="customer">{t('customerRole')}</option></select></label>}
      <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button><button className="button" disabled={saving}>{saving ? t('processing') : t('createStaff')}</button></div>
    </form></div>}
  </>
}

function AccountSettings({ session, onSessionUpdate }) {
  const t = useT()
  const [displayName, setDisplayName] = useState(session.user.displayName || session.user.username)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [error, setError] = useState('')
  async function saveProfile(event) {
    event.preventDefault(); setError(''); setProfileMessage('')
    try {
      const result = await api('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken }, body: JSON.stringify({ displayName }) })
      onSessionUpdate(result.user); setProfileMessage(t('nameSaved'))
    } catch (err) { setError(err.message) }
  }
  async function savePassword(event) {
    event.preventDefault(); setError(''); setPasswordMessage('')
    if (passwords.newPassword !== passwords.confirmPassword) return setError(t('passwordsMismatch'))
    try {
      await api('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken }, body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }) })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordMessage(t('passwordChanged'))
    } catch (err) { setError(err.message) }
  }
  return <div className="settings-grid">
    <form className="inventory-panel account-form" onSubmit={saveProfile}><div className="panel-heading"><div><h2>{t('profileSettings')}</h2><p className="muted">{t('profileDesc')}</p></div></div><div className="settings-body"><label>{t('username')}<input value={session.user.username} disabled /></label><label>{t('fullName')}<input required minLength={2} maxLength={100} value={displayName} onChange={event => setDisplayName(event.target.value)} /></label>{profileMessage && <p className="checkout-success">{profileMessage}</p>}<button className="button">{t('saveName')}</button></div></form>
    <form className="inventory-panel account-form" onSubmit={savePassword}><div className="panel-heading"><h2>{t('passwordSettings')}</h2></div><div className="settings-body"><label>{t('currentPassword')}<input type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={event => setPasswords(current => ({ ...current, currentPassword: event.target.value }))} /></label><label>{t('newPassword')}<input type="password" autoComplete="new-password" required minLength={6} maxLength={128} value={passwords.newPassword} onChange={event => setPasswords(current => ({ ...current, newPassword: event.target.value }))} /></label><label>{t('confirmPassword')}<input type="password" autoComplete="new-password" required minLength={6} maxLength={128} value={passwords.confirmPassword} onChange={event => setPasswords(current => ({ ...current, confirmPassword: event.target.value }))} /></label>{passwordMessage && <p className="checkout-success">{passwordMessage}</p>}{error && <p className="form-error">{error}</p>}<button className="button">{t('changePassword')}</button></div></form>
  </div>
}
// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analyticsError, setAnalyticsError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)
  const [cart, setCart] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'id')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [checkoutMsg, setCheckoutMsg] = useState('')

  const t = useCallback(key => (LANGS[lang] || LANGS.id)[key] || key, [lang])

  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('sidebar-collapsed', sidebarCollapsed) }, [sidebarCollapsed])

  const role = session?.user.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isSuperAdmin = role === 'super_admin'
  const mustChangePassword = Boolean(session?.user.mustChangePassword)
  const isCashier = role === 'kasir'
  const lowStockCount = analytics?.summary.low_stock_count || 0
  const page = Object.entries(paths).find(([, v]) => v === path)?.[0] || 'choice'

  function navigate(next) {
    const target = paths[next]
    if (target && target !== window.location.pathname) window.history.pushState({}, '', target)
    setPath(target || '/')
    window.scrollTo(0, 0)
  }
  function refresh() { if (isAdmin) setLoadingAnalytics(true); setRefreshCount(v => v + 1) }
  function authenticated(data) {
    setLoadingAnalytics(true); setSession(data); setCart({})
    navigate(['admin', 'super_admin'].includes(data.user.role) ? 'admin' : data.user.role === 'kasir' ? 'cashier' : 'customer')
  }
  function updateSessionUser(user) { setSession(current => ({ ...current, user: { ...current.user, ...user } })) }
  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': session.csrfToken } }) }
    catch { /* ignore */ }
    setSession(null); setAnalytics(null); setCart({}); navigate('choice')
  }

  function onCheckoutSuccess() {
    setCheckoutMsg(t('checkoutSuccess'))
    setTimeout(() => setCheckoutMsg(''), 5000)
    refresh()
  }

  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  useEffect(() => {
    let active = true
    api('/api/auth/me').then(data => {
      if (!active) return
      setSession(data)
      const home = ['admin', 'super_admin'].includes(data.user.role) ? paths.admin : data.user.role === 'kasir' ? paths.cashier : paths.customer
      const allowedPrefix = ['admin', 'super_admin'].includes(data.user.role) ? '/admin' : data.user.role === 'kasir' ? '/cashier' : '/customer'
      if (!window.location.pathname.startsWith(allowedPrefix)) {
        window.history.replaceState({}, '', home); setPath(home)
      }
    }).catch(() => {}).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isAdmin || mustChangePassword) return
    const controller = new AbortController(); let active = true
    api('/api/admin/analytics', { signal: controller.signal })
      .then(data => { if (active) { setAnalytics(data); setAnalyticsError('') } })
      .catch(err => { if (active) setAnalyticsError(err.message) })
      .finally(() => { if (active) setLoadingAnalytics(false) })
    return () => { active = false; controller.abort() }
  }, [isAdmin, mustChangePassword, refreshCount])

  const i18n = { lang, setLang, t }
  const themeCtx = { theme, setTheme }

  if (checking) {
    return (
      <I18nContext.Provider value={i18n}><ThemeContext.Provider value={themeCtx}>
        <div className="state-panel full-page"><h2>{t('sessionCheck')}</h2></div>
      </ThemeContext.Provider></I18nContext.Provider>
    )
  }

  if (!session) {
    const p = ['adminLogin', 'cashierLogin', 'customerLogin', 'register'].includes(page) ? page : 'choice'
    return (
      <I18nContext.Provider value={i18n}><ThemeContext.Provider value={themeCtx}>
        <AuthScreen key={p} page={p} navigate={navigate} onAuthenticated={authenticated} />
      </ThemeContext.Provider></I18nContext.Provider>
    )
  }
  if (mustChangePassword) {
    return <I18nContext.Provider value={i18n}><ThemeContext.Provider value={themeCtx}>
      <PasswordChangeModal session={session} onComplete={() => updateSessionUser({ mustChangePassword: false })} />
    </ThemeContext.Provider></I18nContext.Provider>
  }

  const cartCount = Object.values(cart).reduce((s, v) => s + v.quantity, 0)

  const adminNav = [
    { key: 'admin', label: t('dashboard'), icon: '▥' },
    { key: 'inventory', label: t('inventory'), icon: '▦' },
    { key: 'adminOrders', label: t('orders'), icon: '📦' },
    { key: 'adminReports', label: t('reports'), icon: '📊' },
    { key: 'lowStock', label: t('lowStockMenu'), icon: '🔔', badge: lowStockCount },
    ...(isSuperAdmin ? [{ key: 'staff', label: t('staffManagement'), icon: '👥' }] : []),
    { key: 'adminSettings', label: t('settings'), icon: '⚙' },
  ]
  const cashierNav = [
    { key: 'cashier', label: t('cashierMenuTitle'), icon: '▣' },
    { key: 'cashierOrders', label: t('orders'), icon: '📦' },
    { key: 'cashierSettings', label: t('settings'), icon: '⚙' },
  ]
  const customerNav = [
    { key: 'customer', label: t('catalog'), icon: '🛒' },
    { key: 'myOrders', label: t('myOrders'), icon: '📋' },
    { key: 'customerSettings', label: t('settings'), icon: '⚙' },
  ]
  const navItems = isAdmin ? [...adminNav.filter(item => item.key !== 'staff'), { key: 'staff', label: t('staffManagement'), icon: '👥' }] : isCashier ? cashierNav : customerNav
  function renderContent() {
    switch (page) {
      case 'admin': return <Dashboard analytics={analytics} loading={loadingAnalytics} error={analyticsError} retry={refresh} navigate={navigate} />
      case 'inventory': return <Inventory refreshToken={refreshCount} csrfToken={session.csrfToken} onRefresh={refresh} />
      case 'lowStock': return <Inventory key="lowStock" refreshToken={refreshCount} csrfToken={session.csrfToken} onRefresh={refresh} initialLowOnly />
      case 'adminOrders': return <AdminOrders csrfToken={session.csrfToken} />
      case 'cashier': return <Catalog accountId={session.user.id} refreshToken={refreshCount} cashierMode cart={cart} setCart={setCart} csrfToken={session.csrfToken} onCheckoutSuccess={onCheckoutSuccess} />
      case 'cashierOrders': return <AdminOrders cashierMode csrfToken={session.csrfToken} />
      case 'adminReports': return <AdminReports />
      case 'staff': return isAdmin ? <StaffManagement csrfToken={session.csrfToken} isSuperAdmin={isSuperAdmin} currentUserId={session.user.id} /> : <StatePanel title={t('dataError')}>403</StatePanel>
      case 'adminSettings':
      case 'cashierSettings':
      case 'customerSettings': return <AccountSettings session={session} onSessionUpdate={updateSessionUser} />
      case 'customer': return <Catalog accountId={session.user.id} refreshToken={refreshCount} cart={cart} setCart={setCart} csrfToken={session.csrfToken} onCheckoutSuccess={onCheckoutSuccess} />
      case 'myOrders': return <MyOrders csrfToken={session.csrfToken} />
      default: return <Catalog accountId={session.user.id} refreshToken={refreshCount} cart={cart} setCart={setCart} csrfToken={session.csrfToken} onCheckoutSuccess={onCheckoutSuccess} />
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <ThemeContext.Provider value={themeCtx}>
        <div className={`app-shell page-${page} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${['admin', 'inventory', 'lowStock', 'cashier'].includes(page) ? 'reference-layout' : ''}`}>
          <a className="skip-link" href="#main">{t('skip')}</a>

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
              <Brand collapsed={sidebarCollapsed} />
              <button className="collapse-btn" onClick={() => setSidebarCollapsed(v => !v)} title={sidebarCollapsed ? t('expandMenu') : t('collapseMenu')}>
                {sidebarCollapsed ? '›' : '‹'}
              </button>
            </div>
            {!sidebarCollapsed && <p className="nav-label">{isSuperAdmin ? t('superAdminRole') : isAdmin ? t('adminSpace') : isCashier ? t('cashierSpace') : t('customerSpace')}</p>}
            <nav aria-label={t('mainNav')}>
              {navItems.map(item => (
                <button key={item.key} className={`nav-button ${page === item.key ? 'active' : ''}`} onClick={() => navigate(item.key)} aria-current={page === item.key ? 'page' : undefined} title={sidebarCollapsed ? item.label : undefined}>
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}{item.badge > 0 && <span className="nav-count notification-count">{item.badge}</span>}{!sidebarCollapsed && <>{item.count != null && <span className="nav-count">{item.count}</span>}{item.key === 'customer' && cartCount > 0 && <span className="nav-count cart-count">{cartCount}</span>}</>}
                </button>
              ))}
            </nav>
            {!sidebarCollapsed && (
              <div className="sidebar-note">
                <span className="note-dot" /> {t('sidebarNote')}
                <p>{t('sidebarNoteDesc')}</p>
              </div>
            )}
            <div className={`workspace ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <span className="avatar" title={session.user.displayName || session.user.username}>{(session.user.displayName || session.user.username).slice(0, 1).toUpperCase()}</span>
              {!sidebarCollapsed && <div>{session.user.displayName || session.user.username}<small>{isSuperAdmin ? t('superAdminRole') : isAdmin ? t('adminWarung') : isCashier ? t('cashier') : t('customer')}</small></div>}
            </div>
            <button className={`logout-button ${sidebarCollapsed ? 'icon-only' : ''}`} onClick={logout} title={t('logout')}>
              {sidebarCollapsed ? '⏻' : t('logout')}
            </button>
          </aside>

          {/* Main */}
          <div className="main-shell">
            <header className="topbar">
              <span>{isAdmin ? t('adminRoom') : isCashier ? t('cashierRoom') : t('customerRoom')} <span className="breadcrumb">/ {t(page === 'admin' ? 'dashboard' : page === 'inventory' || page === 'lowStock' ? 'inventory' : page === 'adminOrders' || page === 'cashierOrders' ? 'orders' : page === 'adminReports' ? 'reports' : page === 'staff' ? 'staffManagement' : page.endsWith('Settings') ? 'settings' : page === 'myOrders' ? 'myOrders' : page === 'cashier' ? 'cashier' : 'catalog')}</span></span>
              <div className="topbar-right">
                <button className="lang-btn" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>{lang === 'id' ? '🇺🇸 EN' : '🇮🇩 ID'}</button>
                <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙' : '☀️'}</button>
                <button className="button secondary" onClick={refresh} disabled={isAdmin && loadingAnalytics}>↻</button>
                <span className="environment">{analyticsError ? t('connError') : t('active')}</span>
              </div>
            </header>

            <main id="main">
              {checkoutMsg && <div className="checkout-success" role="alert">{checkoutMsg}</div>}
              <div className="page-heading">
                <div>
                  <p className="eyebrow">{isAdmin ? 'PANTAU WARUNG ANDA' : isCashier ? 'TRANSAKSI TOKO' : 'BELANJA LEBIH MUDAH'}</p>
                  <h1>{t(page === 'admin' ? 'dashboard' : page === 'inventory' || page === 'lowStock' ? 'inventoryTitle' : page === 'adminOrders' || page === 'cashierOrders' ? 'allOrders' : page === 'adminReports' ? 'reportsTitle' : page === 'staff' ? 'staffTitle' : page.endsWith('Settings') ? 'settingsTitle' : page === 'myOrders' ? 'orderHistory' : page === 'cashier' ? 'cashierMenuTitle' : 'storeTagline')}</h1>
                </div>
              </div>
              {renderContent()}
              <footer className="page-footer">WADIMOR <span>{t('footerBrand')}</span></footer>
            </main>
          </div>
        </div>
      </ThemeContext.Provider>
    </I18nContext.Provider>
  )
}
