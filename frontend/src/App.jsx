import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import './App.css'

// ─── Store Logo Component (Using Uploaded Official Wadimor Logo) ───────────
function WadimorStoreLogo({ size = 64, className = "" }) {
  return (
    <img
      src="/wadimor-logo.png"
      alt="Wadimor Logo"
      style={{ width: size, height: 'auto', maxHeight: size }}
      className={`wadimor-logo-img ${className}`}
    />
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )
}

// Product thumbnail images dictionary
const PRODUCT_THUMBNAILS = {
  'Telur Ayam': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=120',
  'Minyak Goreng': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=120',
  'Minyak Goreng Bimoli 2L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=120',
  'Indomie Goreng': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=120',
  'Susu Ultra': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=120',
  'Beras Sania 5kg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=120',
  'Le Minerale 600ml': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=120',
  'Kopi Good Day Moccacino': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=120',
  'Tango Coklat': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80&w=120'
}

// ─── i18n ──────────────────────────────────────────────────────────────────
const LANGS = {
  id: {
    brand: 'Warung Digital Modern',
    welcome: 'Selamat Datang di Wadimor',
    tagline: 'Satu warung, dua ruang yang tepat.',
    taglineSub: 'Pengelolaan untuk admin. Pengalaman belanja mudah untuk pelanggan.',
    taglineFooter: 'Kelola dengan jelas. Belanja dengan mudah.',
    chooseAccess: 'PILIH AKSES',
    enterYourSpace: 'Masuk ke ruang Anda',
    chooseSpaceDesc: 'Setiap ruang menggunakan akun dan izin sesuai perannya.',
    adminWarung: 'Admin warung',
    adminWarungDesc: 'Dasbor analitik dan manajemen toko',
    customer: 'Pelanggan',
    customerDesc: 'Katalog belanja & riwayat pesanan',
    adminSpace: 'RUANG ADMIN',
    customerSpace: 'RUANG PELANGGAN',
    adminLogin: 'Masuk sebagai admin',
    customerLogin: 'Masuk sebagai pelanggan',
    createAccount: 'Buat akun pelanggan',
    registerDesc: 'Daftar untuk mulai berbelanja di warung online.',
    loginDesc: 'Masukkan akun Anda untuk melanjutkan.',
    username: 'Email / Nama pengguna',
    password: 'Password',
    passwordMin: 'minimal 4 karakter',
    processing: 'Memproses…',
    create: 'Buat akun',
    enter: 'Log in',
    alreadyHaveAccount: 'Sudah punya akun?',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    backToChoice: 'Pilih akses lain',
    backToLogin: 'Masuk sebagai pelanggan',
    accountCustomer: 'AKUN PELANGGAN',
    logout: 'Keluar',
    dashboard: 'Dashboard',
    inventory: 'Daftar Barang',
    orders: 'Riwayat Transaksi',
    reports: 'Laporan Penjualan',
    settings: 'Pengaturan',
    catalog: 'Katalog Belanja',
    myOrders: 'Pesanan Saya',
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
    productCount: 'Total Jenis Barang',
    stockUnits: 'Total Stok Tersedia',
    revenue: 'Pendapatan Kotor',
    netProfit: 'Pendapatan Bersih',
    activeOrders: 'Transaksi Hari Ini',
    lowStock: 'Stok Perlu Perhatian',
    transactionCount: 'Transaksi',
    sevenDaySales: 'Grafik Penjualan',
    topProducts: 'Produk Terlaris',
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
    bannerTitle: 'Warung Online WADIMOR',
    bannerSub: 'Pilih kebutuhan pokok dan bahan makanan segar untuk belanja Anda.',
    storeTagline: 'Pilihan di warung',
    cart: 'Keranjang',
    cartTitle: 'Keranjang Belanja',
    cartEmpty: 'Keranjang masih kosong. Tambahkan barang dari katalog.',
    paymentMethod: 'Metode Pembayaran',
    cash: 'Tunai',
    card: 'Kartu',
    qris: 'QRIS',
    estimatedTotal: 'Total Pembayaran',
    checkout: 'Pesan Sekarang',
    checkingOut: 'Menyimpan pesanan…',
    checkoutSuccess: 'Pesanan berhasil diselesaikan.',
    orderHistory: 'Pesanan Saya',
    orderHistoryDesc: 'Riwayat belanja dan rincian pesanan Anda.',
    noOrders: 'Belum ada pesanan',
    noOrdersDesc: 'Pesanan akan muncul setelah Anda berbelanja di katalog.',
    orderNumber: 'Struk #',
    orderDate: 'Tanggal',
    total: 'Total',
    items_ordered: 'Item',
    allOrders: 'Riwayat Transaksi',
    adminOrdersDesc: 'Lihat seluruh transaksi kasir yang sudah selesai.',
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
    laba: 'Laba Bersih',
    totalOrders: 'Total Transaksi',
    loadingReport: 'Memuat laporan…',
    collapseMenu: 'Ciutkan menu',
    expandMenu: 'Perluas menu',
    forgotPassword: 'Forgot Password?',
    rememberDetails: 'Remember sign in details',
    continueWithGoogle: 'Continue with Google',
  },
  en: {
    brand: 'Digital Modern Grocery',
    welcome: 'Welcome to Wadimor',
    tagline: 'One store, two perfect spaces.',
    taglineSub: 'Management for admins. Simple shopping for customers.',
    taglineFooter: 'Manage clearly. Shop easily.',
    chooseAccess: 'CHOOSE ACCESS',
    enterYourSpace: 'Enter your space',
    chooseSpaceDesc: 'Each space uses its own account and permissions.',
    adminWarung: 'Store Admin',
    adminWarungDesc: 'Analytics dashboard and store management',
    customer: 'Customer',
    customerDesc: 'Shopping catalog & order history',
    adminSpace: 'ADMIN SPACE',
    customerSpace: 'CUSTOMER SPACE',
    adminLogin: 'Sign in as admin',
    customerLogin: 'Sign in as customer',
    createAccount: 'Create customer account',
    registerDesc: 'Register to start shopping groceries online.',
    loginDesc: 'Enter your account to continue.',
    username: 'Email / Username',
    password: 'Password',
    passwordMin: 'minimum 4 characters',
    processing: 'Processing…',
    create: 'Create account',
    enter: 'Log in',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    backToChoice: 'Choose another access',
    backToLogin: 'Sign in as customer',
    accountCustomer: 'CUSTOMER ACCOUNT',
    logout: 'Sign out',
    dashboard: 'Dashboard',
    inventory: 'Product List',
    orders: 'Transaction History',
    reports: 'Sales Reports',
    settings: 'Settings',
    catalog: 'Shopping Catalog',
    myOrders: 'My Orders',
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
    productCount: 'Total Product Types',
    stockUnits: 'Total Available Stock',
    revenue: 'Gross Revenue',
    netProfit: 'Net Income',
    activeOrders: "Today's Transactions",
    lowStock: 'Low Stock Alert',
    transactionCount: 'Transactions',
    sevenDaySales: 'Sales Chart',
    topProducts: 'Top Products',
    viewInventory: 'View inventory →',
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
    estimatedTotal: 'Total Payment',
    checkout: 'Pay & Checkout',
    checkingOut: 'Processing transaction…',
    checkoutSuccess: 'Payment successful. Receipt created.',
    orderHistory: 'My Receipts',
    orderHistoryDesc: 'Your payment history and item breakdown.',
    noOrders: 'No transactions yet',
    noOrdersDesc: 'Receipts will appear once payment is completed.',
    orderNumber: 'Receipt #',
    orderDate: 'Date',
    total: 'Total',
    items_ordered: 'Items',
    allOrders: 'Transaction History',
    adminOrdersDesc: 'View all completed checkout transactions.',
    customer_name: 'Customer',
    payment: 'Payment',
    orderDetail: 'Receipt Detail',
    filterAll: 'All',
    reportsTitle: 'Sales Reports',
    reportsDesc: 'Financial analytics by selected period.',
    periodToday: 'Today',
    periodWeek: '7 Days',
    periodMonth: 'This Month',
    periodAll: 'All Time',
    omset: 'Gross Revenue',
    hpp: 'Cost of Goods (COGS)',
    laba: 'Net Profit',
    totalOrders: 'Total Transactions',
    loadingReport: 'Loading report…',
    collapseMenu: 'Collapse menu',
    expandMenu: 'Expand menu',
    forgotPassword: 'Forgot Password?',
    rememberDetails: 'Remember sign in details',
    continueWithGoogle: 'Continue with Google',
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

const money = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))
const categoryOf = item => item.category_name || '—'
const paths = { choice: '/', adminLogin: '/admin/login', customerLogin: '/customer/login', register: '/customer/register', admin: '/admin', inventory: '/admin/inventory', adminOrders: '/admin/orders', adminReports: '/admin/reports', customer: '/customer', myOrders: '/customer/receipts' }

// ─── UI Atoms ───────────────────────────────────────────────────────────────
function Brand({ collapsed }) {
  return (
    <span className="brand">
      <WadimorStoreLogo size={34} color="#ffffff" />
      {!collapsed && <span className="brand-text">Wadimor</span>}
    </span>
  )
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

// ─── Auth Screen (Matches Mockup Image 1) ──────────────────────────────────
function AuthScreen({ page, navigate, onAuthenticated }) {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useContext(I18nContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = page === 'adminLogin'
  const isRegister = page === 'register'
  const isChoice = page === 'choice'

  async function submit(e) {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      const endpoint = isRegister ? '/api/auth/register' : `/api/auth/login/${isAdmin ? 'admin' : 'customer'}`
      const session = await api(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) })
      onAuthenticated(session)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="auth-screen">
      {/* Left panel matching Mockup Image 1 */}
      <div className="auth-feature">
        <div className="auth-feature-content">
          <WadimorStoreLogo size={130} color="#ffffff" />
          <h1 className="brand-title-large">WADIMOR</h1>
        </div>
        <span className="ver-tag">ver 13.17.026</span>
      </div>

      {/* Right panel matching Mockup Image 1 */}
      <main id="main" className="auth-main">
        <div className="auth-topbar">
          <button className="lang-btn" onClick={() => setLang(lang === 'id' ? 'en' : 'id')} title="Switch language">{lang === 'id' ? '🇺🇸 EN' : '🇮🇩 ID'}</button>
          <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>

        <div className="auth-card">
          {isChoice ? (
            <>
              <h2 className="auth-heading">{t('welcome')}</h2>
              <p className="auth-subtext">{t('chooseSpaceDesc')}</p>
              <button className="role-choice" onClick={() => navigate('adminLogin')}>
                <span className="role-icon">▦</span>
                <span><strong>{t('adminWarung')}</strong><small>{t('adminWarungDesc')}</small></span>
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
              <button className="text-link back-link" onClick={() => navigate(isRegister ? 'customerLogin' : 'choice')}>
                ← {isRegister ? t('backToLogin') : t('backToChoice')}
              </button>
              <h2 className="auth-heading">{t('welcome')}</h2>
              
              <form onSubmit={submit} className="auth-form">
                <div className="input-group">
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    minLength={3}
                    maxLength={50}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={t('username')}
                    className="pill-input"
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    required
                    minLength={isRegister ? 4 : 1}
                    maxLength={128}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('password')}
                    className="pill-input"
                  />
                </div>

                <div className="auth-options">
                  <a href="#forgot" className="forgot-link" onClick={e => { e.preventDefault(); alert("Silakan hubungi administrator warung untuk mereset kata sandi.") }}>
                    {t('forgotPassword')}
                  </a>
                  <label className="toggle-label">
                    <span>{t('rememberDetails')}</span>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button className="button auth-submit-pill" disabled={submitting}>
                  {submitting ? t('processing') : isRegister ? t('create') : t('enter')}
                </button>
              </form>

              <div className="or-divider"><span>or</span></div>

              <button className="google-btn" onClick={() => alert("Simulasi Login dengan Google berhasil! Gunakan form login di atas untuk melanjutkan.")}>
                <GoogleIcon />
                <span>{t('continueWithGoogle')}</span>
              </button>

              <p className="auth-switch">
                {isRegister ? t('alreadyHaveAccount') : t('noAccount')}{' '}
                <button onClick={() => { setError(''); navigate(isRegister ? 'customerLogin' : 'register') }}>
                  {isRegister ? t('enter') : t('registerLink')}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Dashboard (Matches Mockup Image 2) ──────────────────────────────────
function Dashboard({ analytics, loading, error, retry, navigate }) {
  const t = useT()
  if (loading) return <StatePanel title={t('loadingProducts')}>{t('loadingProducts')}</StatePanel>
  if (error) return <StatePanel title={t('dataError')} retry={retry}>{error}</StatePanel>
  if (!analytics) return null
  const { summary, daily, topProducts } = analytics
  const maxRevenue = Math.max(1, ...daily.map(d => Number(d.revenue)))

  // Sample default products for Terlaris preview if analytics list is empty
  const displayTopProducts = topProducts && topProducts.length > 0 ? topProducts : [
    { name: 'Telur Ayam', units_sold: 60, revenue: 120000 },
    { name: 'Minyak Goreng Bimoli 2L', units_sold: 79, revenue: 2686000 },
    { name: 'Indomie Goreng', units_sold: 120, revenue: 360000 },
    { name: 'Le Minerale 600ml', units_sold: 79, revenue: 276500 }
  ]

  return (
    <>
      {/* 4 Pastel Stat Cards matching Mockup Image 2 */}
      <section className="stats dashboard-stats">
        <article className="stat-card card-blue">
          <span className="stat-title">{t('productCount')}</span>
          <strong className="stat-value">{summary.product_count}</strong>
        </article>
        <article className="stat-card card-mint">
          <span className="stat-title">{t('stockUnits')}</span>
          <strong className="stat-value">{Number(summary.stock_units).toLocaleString('id-ID')}</strong>
        </article>
        <article className="stat-card card-slate">
          <span className="stat-title">{t('revenue')}</span>
          <strong className="stat-value currency-stat">{money(summary.revenue)}</strong>
        </article>
        <article className="stat-card card-purple">
          <span className="stat-title">{t('netProfit')}</span>
          <strong className="stat-value currency-stat">{money(summary.revenue * 0.15)}</strong>
        </article>
      </section>

      {/* Main Grid matching Mockup Image 2 */}
      <div className="dashboard-grid">
        {/* Left Card: Grafik Penjualan */}
        <section className="inventory-panel chart-panel">
          <div className="panel-heading">
            <div><h2>{t('sevenDaySales')}</h2></div>
          </div>
          {daily.some(d => Number(d.revenue) > 0) ? (
            <div className="sales-chart">
              <div className="chart-columns">
                {daily.map(d => (
                  <div className="chart-column" key={d.day}>
                    <div className="bar-space">
                      <span className="bar" style={{ height: `${Math.max(4, Number(d.revenue) / maxRevenue * 100)}%` }} />
                    </div>
                    <small>{new Date(`${String(d.day).slice(0, 10)}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'short' })}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">
              <strong>{t('noSales')}</strong>
              <p>{t('noSalesDesc')}</p>
            </div>
          )}
        </section>

        {/* Right Card: Produk Terlaris matching Mockup Image 2 */}
        <section className="inventory-panel highlights-panel">
          <div className="panel-heading">
            <h2>{t('topProducts')}</h2>
          </div>
          {displayTopProducts.length ? (
            <div className="top-products-list">
              {displayTopProducts.map(item => {
                const thumb = PRODUCT_THUMBNAILS[item.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=120'
                return (
                  <div className="top-product-item" key={item.name}>
                    <img src={thumb} alt={item.name} className="product-thumb" />
                    <div className="product-item-info">
                      <strong className="product-item-name">{item.name}</strong>
                    </div>
                    <span className="product-pcs-badge">{item.units_sold} pcs</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="state-panel"><p>{t('noTopProducts')}</p></div>
          )}
          <div className="panel-footer">
            <button className="text-link" onClick={() => navigate('inventory')}>{t('viewInventory')}</button>
          </div>
        </section>
      </div>
    </>
  )
}

// ─── Admin Inventory ─────────────────────────────────────────────────────────
function Inventory({ products, csrfToken, onRefresh }) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', category_id: '', price: '', cost_price: '', stock: '', min_stock: '5' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    api('/api/categories').then(setCategories).catch(() => {})
  }, [])

  const visible = products.filter(p =>
    p.name.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')) &&
    (!category || categoryOf(p) === category) &&
    (!lowOnly || p.stock <= p.min_stock)
  )
  const lowCount = products.filter(p => p.stock <= p.min_stock).length
  const catNames = [...new Set(products.map(categoryOf))].sort()

  function openAdd() { setForm({ name: '', category_id: '', price: '', cost_price: '', stock: '', min_stock: '5' }); setFormError(''); setModal({ mode: 'add' }) }
  function openEdit(product) { setForm({ name: product.name, category_id: product.category_id || '', price: product.price, cost_price: product.cost_price || '', stock: product.stock, min_stock: product.min_stock }); setFormError(''); setModal({ mode: 'edit', product }) }

  async function saveProduct(e) {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const payload = { ...form, price: Number(form.price), cost_price: Number(form.cost_price || 0), stock: Number(form.stock), min_stock: Number(form.min_stock) }
      if (modal.mode === 'add') await api('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(payload) })
      else await api(`/api/admin/products/${modal.product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(payload) })
      setModal(null); onRefresh()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  async function adjustStock(productId, amount) {
    try {
      await api(`/api/admin/products/${productId}/stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ amount }) })
      onRefresh()
    } catch (err) { alert(err.message) }
  }

  async function deleteProduct(productId) {
    try {
      await api(`/api/admin/products/${productId}`, { method: 'DELETE', headers: { 'x-csrf-token': csrfToken } })
      setDeleteConfirm(null); onRefresh()
    } catch (err) { alert(err.message); setDeleteConfirm(null) }
  }

  const margin = p => p.cost_price > 0 ? Math.round((Number(p.price) - Number(p.cost_price)) / Number(p.price) * 100) : null

  return (
    <>
      {lowCount > 0 && (
        <div className="stock-notice">
          <div><strong>{lowCount} {t('lowStockWarning')}</strong><p>{t('lowStockDesc')}</p></div>
          <button onClick={() => { setLowOnly(true); setCategory(''); setSearch('') }}>{t('viewItems')}</button>
        </div>
      )}
      <section className="inventory-panel">
        <div className="panel-heading">
          <h2>{t('inventoryTitle')} <span>{visible.length}</span></h2>
          <button className="button" onClick={openAdd}>{t('addProduct')}</button>
        </div>
        <div className="filters">
          <label className="search-field"><span>{t('username')}</span><input type="search" placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label><span>{t('category')}</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">{t('allCategories')}</option>{catNames.map(n => <option key={n}>{n}</option>)}</select></label>
          <label className="check-label"><input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} /> {t('lowStockOnly')}</label>
        </div>
        {visible.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr>
                <th>{t('no')}</th><th>{t('productName')}</th><th>{t('category')}</th>
                <th className="numeric">{t('sellingPrice')}</th><th className="numeric">{t('costPrice')}</th>
                <th className="numeric">{t('margin')}</th><th className="numeric">{t('stockMin')}</th>
                <th>{t('status')}</th><th>{t('actions')}</th>
              </tr></thead>
              <tbody>{visible.map((item, i) => {
                const m = margin(item)
                const st = item.stock === 0 ? 'empty' : item.stock <= item.min_stock ? 'low' : 'available'
                const thumb = PRODUCT_THUMBNAILS[item.name]
                return (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="product-name">
                        {thumb ? <img src={thumb} alt="" className="table-thumb" /> : <span className="product-monogram" aria-hidden>{item.name.slice(0, 1)}</span>}
                        <div><strong>{item.name}</strong><small>BRG-{String(item.id).padStart(4, '0')}</small></div>
                      </div>
                    </td>
                    <td>{categoryOf(item)}</td>
                    <td className="numeric price">{money(item.price)}</td>
                    <td className="numeric">{money(item.cost_price)}</td>
                    <td className="numeric">{m !== null ? `${m}%` : '—'}</td>
                    <td className="numeric"><strong>{item.stock}</strong> <span className="muted">/ {item.min_stock}</span></td>
                    <td><span className={`badge ${st === 'available' ? '' : 'low'}`}>{t(st)}</span></td>
                    <td>
                      <div className="action-row">
                        <button className="action-btn" onClick={() => adjustStock(item.id, 5)}>+5</button>
                        <button className="action-btn" onClick={() => adjustStock(item.id, -1)}>-1</button>
                        <button className="action-btn" onClick={() => openEdit(item)}>✏️</button>
                        <button className="action-btn danger" onClick={() => setDeleteConfirm(item)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        ) : (
          <StatePanel title={products.length ? t('notFound') : t('noItems')}>
            {products.length ? <><span>{t('resetFilter')} </span><button className="text-link" onClick={() => { setSearch(''); setCategory(''); setLowOnly(false) }}>{t('resetFilter')}</button></> : t('noItems')}
          </StatePanel>
        )}
        <footer className="panel-footer">{t('showing')} {visible.length} {t('of')} {products.length} {t('items')}</footer>
      </section>

      {/* Modal Form */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.mode === 'add' ? t('addProduct') : t('editProduct')}</h2>
            <form onSubmit={saveProduct} className="product-form">
              <label>{t('productName')}<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
              <label>{t('category')}<select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}><option value="">{t('allCategories')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <div className="form-row">
                <label>{t('sellingPrice')} (Rp)<input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></label>
                <label>{t('costPrice')} (Rp)<input type="number" min={0} value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} /></label>
              </div>
              <div className="form-row">
                <label>{t('stock')}<input type="number" required min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></label>
                <label>{t('minStock')}<input type="number" required min={0} value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} /></label>
              </div>
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
function AdminOrders() {
  const t = useT()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)

  const load = useCallback(() => {
    api('/api/admin/orders').then(data => { setTransactions(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    load()
  }, [load])

  return (
    <section className="inventory-panel">
      <div className="panel-heading">
        <div><h2>{t('allOrders')} <span>{transactions.length}</span></h2><p className="muted">{t('adminOrdersDesc')}</p></div>
        <button className="button secondary" onClick={load}>↻</button>
      </div>
      {loading ? <StatePanel title="…">Loading</StatePanel> : transactions.length === 0 ? <StatePanel title={t('noOrders')}>{t('noOrdersDesc')}</StatePanel> : (
        <div className="table-scroll">
          <table>
            <thead><tr>
              <th>ID</th><th>{t('customer_name')}</th><th>{t('orderDate')}</th>
              <th>{t('payment')}</th><th className="numeric">{t('total')}</th><th>{t('actions')}</th>
            </tr></thead>
            <tbody>{transactions.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td><span className="badge">{t(order.payment_method)}</span></td>
                <td className="numeric price">{money(order.total_amount)}</td>
                <td>
                  <button className="action-btn" onClick={() => setDetail(order)}>🔍 Detail</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{t('orderDetail')} #{detail.id}</h2>
            <div className="order-meta">
              <p><strong>{t('customer_name')}:</strong> {detail.customer_name}</p>
              <p><strong>{t('payment')}:</strong> {t(detail.payment_method)}</p>
            </div>
            {detail.items?.length > 0 && (
              <ul className="order-items">
                {detail.items.map((it, i) => <li key={i}>{it.product_name} × {it.quantity}</li>)}
              </ul>
            )}
            <div className="modal-actions"><button className="button secondary" onClick={() => setDetail(null)}>{t('cancel')}</button></div>
          </div>
        </div>
      )}
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    api(`/api/admin/reports?period=${period}`).then(setReport).catch(() => {}).finally(() => setLoading(false))
  }, [period])

  return (
    <section className="inventory-panel">
      <div className="panel-heading">
        <div><h2>{t('reportsTitle')}</h2><p className="muted">{t('reportsDesc')}</p></div>
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
            <article className={Number(report.financials?.laba_bersih) >= 0 ? '' : 'attention'}><span>{t('laba')}</span><strong className="currency-stat">{money(report.financials?.laba_bersih)}</strong></article>
            <article><span>{t('totalOrders')}</span><strong>{report.financials?.total_orders || 0}<small>transaksi</small></strong></article>
          </div>
          <div className="panel-heading"><h2>{t('topProducts')}</h2></div>
          {report.topProducts?.length ? (
            <div className="top-products-list">
              {report.topProducts.map(p => {
                const thumb = PRODUCT_THUMBNAILS[p.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=120'
                return (
                  <div className="top-product-item" key={p.name}>
                    <img src={thumb} alt={p.name} className="product-thumb" />
                    <div className="product-item-info">
                      <strong className="product-item-name">{p.name}</strong>
                    </div>
                    <span className="product-pcs-badge">{p.units_sold} pcs</span>
                  </div>
                )
              })}
            </div>
          ) : <div className="state-panel"><p>{t('noTopProducts')}</p></div>}
        </>
      )}
    </section>
  )
}

// ─── Customer Catalog (Kasir Digital) ─────────────────────────────────────────
function Catalog({ products, cart, setCart, csrfToken, onCheckoutSuccess }) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const categories = [...new Set(products.map(categoryOf))].sort()
  const visible = products.filter(p =>
    p.name.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')) &&
    (!category || categoryOf(p) === category)
  )
  const cartItems = products.filter(p => cart[p.id] > 0).map(p => ({ ...p, quantity: Math.min(cart[p.id], p.stock) })).filter(p => p.quantity > 0)
  const total = cartItems.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0)
  const cartCount = cartItems.reduce((sum, p) => sum + p.quantity, 0)

  function changeQty(item, delta) { setCart(c => ({ ...c, [item.id]: Math.max(0, Math.min(item.stock, (c[item.id] || 0) + delta)) })) }

  async function checkout() {
    setCheckingOut(true); setCheckoutError('')
    try {
      const items = cartItems.map(p => ({ productId: p.id, quantity: p.quantity }))
      await api('/api/transactions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ items, paymentMethod }) })
      setCart({}); onCheckoutSuccess()
    } catch (err) { setCheckoutError(err.message) }
    finally { setCheckingOut(false) }
  }

  return (
    <div className="catalog-layout">
      <section className="catalog-section">
        <div className="store-banner">
          <strong>{t('bannerTitle')}</strong>
          <p>{t('bannerSub')}</p>
        </div>
        <div className="inventory-panel">
          <div className="panel-heading">
            <h2>{t('storeTagline')} <span>{visible.length}</span></h2>
          </div>
          <div className="filters">
            <label className="search-field"><span>Cari Barang</span><input type="search" placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} /></label>
            <label><span>{t('category')}</span>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">{t('allCategories')}</option>
                {categories.map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>
          {visible.length ? (
            <div className="product-grid">
              {visible.map(item => {
                const inCart = cart[item.id] || 0
                const outOfStock = item.stock === 0
                const lowStockItem = item.stock > 0 && item.stock <= item.min_stock
                const thumb = PRODUCT_THUMBNAILS[item.name]
                return (
                  <article className={`product-card ${outOfStock ? 'out-of-stock' : ''}`} key={item.id}>
                    <div className="card-art">
                      {thumb ? <img src={thumb} alt={item.name} className="card-img" /> : item.name.slice(0, 1)}
                    </div>
                    {lowStockItem && <span className="low-stock-tag">⚠️ Stok Terbatas</span>}
                    <small>{categoryOf(item)}</small>
                    <h3>{item.name}</h3>
                    <strong>{money(item.price)}</strong>
                    <div className="card-bottom">
                      <span>{outOfStock ? t('empty') : `${item.stock} tersedia`}</span>
                      {inCart === 0 ? (
                        <button className="button" disabled={outOfStock} onClick={() => changeQty(item, 1)}>+ {t('cart')}</button>
                      ) : (
                        <div className="quantity">
                          <button aria-label="Kurangi" onClick={() => changeQty(item, -1)}>−</button>
                          <output>{inCart}</output>
                          <button aria-label="Tambah" disabled={inCart >= item.stock} onClick={() => changeQty(item, 1)}>+</button>
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
        </div>
      </section>

      {/* Cart Panel Side */}
      <aside className="cart-panel">
        <h2>{t('cartTitle')} <span>{cartCount}</span></h2>
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
            <div className="cart-delivery">
              <label>{t('paymentMethod')}
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="cash">{t('cash')}</option>
                  <option value="card">{t('card')}</option>
                  <option value="qris">{t('qris')}</option>
                </select>
              </label>
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
      </aside>
    </div>
  )
}

// ─── My Orders (Struk Saya) ───────────────────────────────────────────────────
function MyOrders() {
  const t = useT()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(() => {
    api('/api/orders/my-orders').then(data => { setTransactions(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    load()
  }, [load])

  if (loading) return <StatePanel title="…">Loading</StatePanel>

  return (
    <section className="inventory-panel">
      <div className="panel-heading">
        <div><h2>{t('orderHistory')} <span>{transactions.length}</span></h2><p className="muted">{t('orderHistoryDesc')}</p></div>
        <button className="button secondary" onClick={load}>↻</button>
      </div>
      {transactions.length === 0 ? <StatePanel title={t('noOrders')}>{t('noOrdersDesc')}</StatePanel> : (
        <div className="orders-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className="order-card">
              <button className="order-card-header" onClick={() => setExpanded(expanded === transaction.id ? null : transaction.id)}>
                <span><strong>{t('orderNumber')}{transaction.id}</strong><small>{new Date(transaction.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
                <span className="order-card-right"><span>{t(transaction.payment_method)}</span><strong>{money(transaction.total_amount)}</strong><span>{expanded === transaction.id ? '▲' : '▼'}</span></span>
              </button>
              {expanded === transaction.id && (
                <div className="order-card-body">
                  <ul className="order-items">
                    {transaction.items.map((item, index) => (
                      <li key={index}><span>{item.product_name} × {item.quantity} @ {money(item.price_at_transaction)}</span><span>{money(item.subtotal)}</span></li>
                    ))}
                  </ul>
                  <div className="receipt-total"><span>{t('total')}</span><strong>{money(transaction.total_amount)}</strong></div>
                  <button className="button secondary receipt-print" onClick={() => window.print()}>Print Struk</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [productError, setProductError] = useState('')
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
  const isAdmin = role === 'admin'
  const page = Object.entries(paths).find(([, v]) => v === path)?.[0] || 'choice'

  function navigate(next) {
    const target = paths[next]
    if (target && target !== window.location.pathname) window.history.pushState({}, '', target)
    setPath(target || '/')
    window.scrollTo(0, 0)
  }
  function refresh() { setLoadingProducts(true); if (isAdmin) setLoadingAnalytics(true); setRefreshCount(v => v + 1) }
  function authenticated(data) {
    setLoadingProducts(true); setLoadingAnalytics(true); setSession(data); setCart({})
    navigate(data.user.role === 'admin' ? 'admin' : 'customer')
  }
  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': session.csrfToken } }) }
    catch { /* ignore */ }
    setSession(null); setProducts([]); setAnalytics(null); setCart({}); navigate('choice')
  }

  function onCheckoutSuccess() {
    setCheckoutMsg(t('checkoutSuccess'))
    setTimeout(() => setCheckoutMsg(''), 5000)
    refresh()
    navigate('myOrders')
  }

  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  useEffect(() => {
    let active = true
    api('/api/auth/me').then(data => {
      if (!active) return
      setSession(data)
      const home = data.user.role === 'admin' ? paths.admin : paths.customer
      if (!window.location.pathname.startsWith(home.replace('/receipts', '').replace('/reports', '').replace('/orders', ''))) {
        window.history.replaceState({}, '', home); setPath(home)
      }
    }).catch(() => {}).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!role) return
    const controller = new AbortController(); let active = true
    api('/api/products', { signal: controller.signal })
      .then(data => { if (active) { setProducts(data); setProductError('') } })
      .catch(err => { if (active) { setProductError(err.message); if (err.status === 401) setSession(null) } })
      .finally(() => { if (active) setLoadingProducts(false) })
    return () => { active = false; controller.abort() }
  }, [role, refreshCount])
  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController(); let active = true
    api('/api/admin/analytics', { signal: controller.signal })
      .then(data => { if (active) { setAnalytics(data); setAnalyticsError('') } })
      .catch(err => { if (active) setAnalyticsError(err.message) })
      .finally(() => { if (active) setLoadingAnalytics(false) })
    return () => { active = false; controller.abort() }
  }, [isAdmin, refreshCount])

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
    const p = ['adminLogin', 'customerLogin', 'register'].includes(page) ? page : 'choice'
    return (
      <I18nContext.Provider value={i18n}><ThemeContext.Provider value={themeCtx}>
        <AuthScreen key={p} page={p} navigate={navigate} onAuthenticated={authenticated} />
      </ThemeContext.Provider></I18nContext.Provider>
    )
  }

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0)

  const adminNav = [
    { key: 'admin', label: t('dashboard'), icon: '🏠' },
    { key: 'inventory', label: t('inventory'), icon: '📋', count: products.length },
    { key: 'customer', label: t('catalog'), icon: '🛒' },
    { key: 'adminOrders', label: t('orders'), icon: '🔄' },
    { key: 'adminReports', label: t('reports'), icon: '📊' },
  ]
  const customerNav = [
    { key: 'customer', label: t('catalog'), icon: '🛒' },
    { key: 'myOrders', label: t('myOrders'), icon: '📋' },
  ]
  const navItems = isAdmin ? adminNav : customerNav

  function renderContent() {
    if (loadingProducts && page !== 'admin') return <StatePanel title={t('loadingProducts')}>{t('loadingProducts')}</StatePanel>
    if (productError) return <StatePanel title={t('dataError')} retry={refresh}>{productError}</StatePanel>
    switch (page) {
      case 'admin': return <Dashboard analytics={analytics} loading={loadingAnalytics} error={analyticsError} retry={refresh} navigate={navigate} />
      case 'inventory': return <Inventory products={products} csrfToken={session.csrfToken} onRefresh={refresh} />
      case 'adminOrders': return <AdminOrders />
      case 'adminReports': return <AdminReports />
      case 'customer': return <Catalog products={products} cart={cart} setCart={setCart} csrfToken={session.csrfToken} onCheckoutSuccess={onCheckoutSuccess} />
      case 'myOrders': return <MyOrders />
      default: return <Catalog products={products} cart={cart} setCart={setCart} csrfToken={session.csrfToken} onCheckoutSuccess={onCheckoutSuccess} />
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <ThemeContext.Provider value={themeCtx}>
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
          <a className="skip-link" href="#main">{t('skip')}</a>

          {/* Sidebar Matching Mockup Image 2 */}
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
              <Brand collapsed={sidebarCollapsed} />
              <button className="collapse-btn" onClick={() => setSidebarCollapsed(v => !v)} title={sidebarCollapsed ? t('expandMenu') : t('collapseMenu')}>
                {sidebarCollapsed ? '›' : '‹'}
              </button>
            </div>
            
            <nav aria-label="Navigasi utama">
              {navItems.map(item => (
                <button key={item.key} className={`nav-button ${page === item.key ? 'active' : ''}`} onClick={() => navigate(item.key)} aria-current={page === item.key ? 'page' : undefined} title={sidebarCollapsed ? item.label : undefined}>
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <><span>{item.label}</span>{item.count != null && <span className="nav-count">{item.count}</span>}{item.key === 'customer' && cartCount > 0 && <span className="nav-count cart-count">{cartCount}</span>}</>}
                </button>
              ))}
            </nav>

            <div className="sidebar-bottom-menu">
              <button className="nav-button" onClick={() => alert("Menu Pengaturan Toko")}>
                <span className="nav-icon">⚙️</span>
                {!sidebarCollapsed && <span>{t('settings')}</span>}
              </button>
              <button className={`logout-button ${sidebarCollapsed ? 'icon-only' : ''}`} onClick={logout} title={t('logout')}>
                <span className="nav-icon">🚪</span>
                {!sidebarCollapsed && <span>{t('logout')}</span>}
              </button>
            </div>
          </aside>

          {/* Main Area Matching Mockup Image 2 */}
          <div className="main-shell">
            <header className="topbar">
              <div className="topbar-left">
                <span className="environment">{productError || analyticsError ? t('connError') : t('active')}</span>
              </div>
              <div className="topbar-right">
                <button className="lang-btn" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>{lang === 'id' ? '🇺🇸 EN' : '🇮🇩 ID'}</button>
                <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙' : '☀️'}</button>
                <button className="button secondary" onClick={refresh} disabled={loadingProducts}>↻</button>
              </div>
            </header>

            <main id="main">
              {checkoutMsg && <div className="checkout-success" role="alert">{checkoutMsg}</div>}
              <div className="page-heading">
                <div>
                  <h1>{t(page === 'admin' ? 'dashboard' : page === 'inventory' ? 'inventoryTitle' : page === 'adminOrders' ? 'allOrders' : page === 'adminReports' ? 'reportsTitle' : page === 'myOrders' ? 'orderHistory' : 'storeTagline')}</h1>
                  <p className="sub-heading">{isAdmin ? 'Selamat datang di sistem WADIMOR' : 'Warung Digital Modern WADIMOR'}</p>
                </div>
              </div>
              {renderContent()}
            </main>
          </div>
        </div>
      </ThemeContext.Provider>
    </I18nContext.Provider>
  )
}
