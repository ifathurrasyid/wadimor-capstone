import { useEffect, useState } from 'react'
import './App.css'

const money = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0))
const categoryOf = item => item.category_name || 'Tanpa kategori'
const statusOf = item => item.stock === 0 ? 'Habis' : item.stock <= item.min_stock ? 'Menipis' : 'Tersedia'
const paths = { choice: '/', adminLogin: '/admin/login', customerLogin: '/customer/login', register: '/customer/register', admin: '/admin', inventory: '/admin/inventory', customer: '/customer' }

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

function Brand() { return <span className="brand"><span className="brand-mark">W</span><span>WADIMOR<small>Warung Digital Modern</small></span></span> }
function StatePanel({ title, children, retry }) { return <div className="state-panel" role={retry ? 'alert' : 'status'}><h2>{title}</h2><p>{children}</p>{retry && <button className="button" onClick={retry}>Coba lagi</button>}</div> }

function AuthScreen({ page, navigate, onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = page === 'adminLogin'
  const isRegister = page === 'register'
  const isChoice = page === 'choice'
  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const endpoint = isRegister ? '/api/auth/register' : `/api/auth/login/${isAdmin ? 'admin' : 'customer'}`
      const session = await api(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) })
      onAuthenticated(session)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }
  return <div className="auth-screen"><div className="auth-feature"><Brand /><div><p className="eyebrow">SELAMAT DATANG DI WADIMOR</p><h1>Satu warung, dua ruang yang tepat.</h1><p>Pengelolaan untuk admin. Pengalaman belanja sederhana untuk pelanggan.</p></div><span>Kelola dengan jelas. Belanja dengan mudah.</span></div><main id="main" className="auth-main"><div className="auth-card">
    {isChoice ? <><p className="eyebrow">PILIH AKSES</p><h2>Masuk ke ruang Anda</h2><p className="muted">Setiap ruang menggunakan akun dan izin sesuai perannya.</p><button className="role-choice" onClick={() => navigate('adminLogin')}><span className="role-icon">▦</span><span><strong>Admin warung</strong><small>Dasbor analitik dan inventori</small></span><span>→</span></button><button className="role-choice" onClick={() => navigate('customerLogin')}><span className="role-icon">▤</span><span><strong>Pelanggan</strong><small>Katalog dan daftar belanja</small></span><span>→</span></button></> : <><button className="text-link" onClick={() => navigate(isRegister ? 'customerLogin' : 'choice')}>← {isRegister ? 'Masuk sebagai pelanggan' : 'Pilih akses lain'}</button><p className="eyebrow">{isRegister ? 'AKUN PELANGGAN' : isAdmin ? 'RUANG ADMIN' : 'RUANG PELANGGAN'}</p><h2>{isRegister ? 'Buat akun pelanggan' : isAdmin ? 'Masuk sebagai admin' : 'Masuk sebagai pelanggan'}</h2><p className="muted">{isRegister ? 'Daftar untuk menyusun daftar belanja Anda.' : 'Masukkan akun Anda untuk melanjutkan.'}</p><form onSubmit={submit} className="auth-form"><label>Nama pengguna<input autoComplete="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nama pengguna" /></label><label>Kata sandi<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 12 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? 'Minimal 12 karakter' : 'Kata sandi'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button auth-submit" disabled={submitting}>{submitting ? 'Memproses…' : isRegister ? 'Buat akun' : 'Masuk'}</button></form>{!isAdmin && <p className="auth-switch">{isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} <button onClick={() => { setError(''); navigate(isRegister ? 'customerLogin' : 'register') }}>{isRegister ? 'Masuk' : 'Daftar pelanggan'}</button></p>}</>}
  </div></main></div>
}

function Dashboard({ analytics, loading, error, retry, navigate }) {
  if (loading) return <StatePanel title="Memuat analitik">Mengambil data penjualan dan stok…</StatePanel>
  if (error) return <StatePanel title="Analitik belum tersedia" retry={retry}>{error}</StatePanel>
  if (!analytics) return null
  const { summary, daily, topProducts } = analytics
  const maxRevenue = Math.max(1, ...daily.map(item => Number(item.revenue)))
  const hasSales = Number(summary.transaction_count) > 0
  return <><section className="stats dashboard-stats" aria-label="Ringkasan warung"><article><span>Total jenis barang</span><strong>{summary.product_count}<small>jenis</small></strong><p>Dalam katalog warung</p></article><article><span>Pendapatan kotor</span><strong className="currency-stat">{money(summary.revenue)}</strong><p>Dari seluruh transaksi tersimpan</p></article><article><span>Transaksi</span><strong>{Number(summary.transaction_count).toLocaleString('id-ID')}<small>transaksi</small></strong><p>Seluruh waktu</p></article><article className="attention"><span>Stok perlu perhatian</span><strong>{summary.low_stock_count}<small>barang</small></strong><p>Stok ≤ batas minimum</p></article><article><span>Stok tersedia</span><strong>{Number(summary.stock_units).toLocaleString('id-ID')}<small>unit</small></strong><p>Jumlah unit tersedia saat ini</p></article></section><div className="dashboard-grid"><section className="inventory-panel chart-panel"><div className="panel-heading"><div><h2>Penjualan 7 hari terakhir</h2><p className="muted">Berdasarkan tanggal server database</p></div></div>{hasSales && daily.some(item => Number(item.revenue) > 0) ? <div className="sales-chart" role="img" aria-label={`Grafik penjualan tujuh hari. ${daily.map(item => `${String(item.day).slice(0, 10)}: ${money(item.revenue)}`).join('; ')}`}><div className="chart-columns" aria-hidden="true">{daily.map(item => <div className="chart-column" key={item.day}><div className="bar-space"><span className="bar" style={{ height: `${Math.max(2, Number(item.revenue) / maxRevenue * 100)}%` }} /></div><small>{new Date(`${String(item.day).slice(0, 10)}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'short' })}</small></div>)}</div></div> : <div className="chart-empty"><strong>Belum ada penjualan dalam 7 hari terakhir</strong><p>Grafik akan terisi saat transaksi checkout tersimpan.</p></div>}<div className="daily-table table-scroll"><table><caption>Penjualan harian selama tujuh hari terakhir</caption><thead><tr><th>Tanggal</th><th className="numeric">Pesanan</th><th className="numeric">Penjualan</th></tr></thead><tbody>{daily.map(item => <tr key={item.day}><td>{String(item.day).slice(0, 10)}</td><td className="numeric">{item.orders}</td><td className="numeric">{money(item.revenue)}</td></tr>)}</tbody></table></div></section><section className="inventory-panel highlights-panel"><div className="panel-heading"><h2>Barang terlaris</h2></div>{topProducts.length ? <ol className="top-list">{topProducts.map(item => <li key={item.name}><strong>{item.name}</strong><span>{item.units_sold} terjual · {money(item.revenue)}</span></li>)}</ol> : <div className="state-panel"><p>Belum ada barang terjual.</p></div>}<div className="panel-footer"><button className="text-link" onClick={() => navigate('inventory')}>Lihat inventori →</button></div></section></div></>
}

function Inventory({ products, search, setSearch, category, setCategory, lowOnly, setLowOnly, resetFilters }) {
  const categories = [...new Set(products.map(categoryOf))].sort()
  const visible = products.filter(item => item.name.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')) && (!category || categoryOf(item) === category) && (!lowOnly || item.stock <= item.min_stock))
  const lowCount = products.filter(item => item.stock <= item.min_stock).length
  return <>{lowCount > 0 && <div className="stock-notice"><div><strong>{lowCount} barang perlu dicek kembali</strong><p>Prioritaskan pengisian barang yang menipis atau habis.</p></div><button onClick={() => { setLowOnly(true); setCategory(''); setSearch('') }}>Lihat barang →</button></div>}<section className="inventory-panel"><div className="panel-heading"><h2>Daftar barang <span>{visible.length}</span></h2><span className="muted">Harga dalam Rupiah</span></div><div className="filters"><label className="search-field"><span>Cari barang</span><input type="search" placeholder="Cari nama barang…" value={search} onChange={e => setSearch(e.target.value)} /></label><label><span>Kategori</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Semua kategori</option>{categories.map(name => <option key={name}>{name}</option>)}</select></label><label className="check-label"><input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} /> Stok menipis / habis</label></div>{visible.length ? <div className="table-scroll"><table><caption className="sr-only">Inventori, harga, dan status stok</caption><thead><tr><th scope="col">No.</th><th scope="col">Nama barang</th><th scope="col">Kategori</th><th className="numeric">Harga jual</th><th className="numeric">Stok / min.</th><th>Status</th></tr></thead><tbody>{visible.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><div className="product-name"><span className="product-monogram" aria-hidden="true">{item.name.slice(0, 1)}</span><div><strong>{item.name}</strong><small>BRG-{String(item.id).padStart(4, '0')}</small></div></div></td><td>{categoryOf(item)}</td><td className="numeric price">{money(item.price)}</td><td className="numeric"><strong>{item.stock}</strong> <span className="muted">/ {item.min_stock}</span></td><td><span className={`badge ${item.stock <= item.min_stock ? 'low' : ''}`}>{statusOf(item)}</span></td></tr>)}</tbody></table></div> : <StatePanel title={products.length ? 'Barang tidak ditemukan' : 'Belum ada barang'}>{products.length ? <><span>Coba kata kunci atau kategori lain. </span><button className="text-link" onClick={resetFilters}>Reset filter</button></> : 'Barang akan tampil setelah ditambahkan ke inventori.'}</StatePanel>}<footer className="panel-footer">Menampilkan {visible.length} dari {products.length} barang</footer></section></>
}

function Catalog({ products, cart, setCart, search, setSearch, category, setCategory, resetFilters }) {
  const categories = [...new Set(products.map(categoryOf))].sort()
  const visible = products.filter(item => item.name.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')) && (!category || categoryOf(item) === category))
  const cartItems = products.filter(item => cart[item.id] > 0).map(item => ({ ...item, quantity: Math.min(cart[item.id], item.stock) })).filter(item => item.quantity > 0)
  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  function changeQuantity(item, delta) { setCart(current => ({ ...current, [item.id]: Math.max(0, Math.min(item.stock, (current[item.id] || 0) + delta)) })) }
  return <div className="catalog-layout"><section className="inventory-panel"><div className="panel-heading"><h2>Pilihan di warung <span>{visible.length}</span></h2><span className="muted">Harga dalam Rupiah</span></div><div className="filters"><label className="search-field"><span>Cari barang</span><input type="search" placeholder="Cari nama barang…" value={search} onChange={e => setSearch(e.target.value)} /></label><label><span>Kategori</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Semua kategori</option>{categories.map(name => <option key={name}>{name}</option>)}</select></label></div>{visible.length ? <div className="product-grid">{visible.map(item => <article className="product-card" key={item.id}><div className="card-art" aria-hidden="true">{item.name.slice(0, 1)}<span>WADIMOR / {categoryOf(item)}</span></div><small>{categoryOf(item)}</small><h3>{item.name}</h3><strong>{money(item.price)}</strong><div className="card-bottom"><span>{item.stock ? `${item.stock} tersedia` : 'Stok habis'}</span><button className="button" disabled={!item.stock || (cart[item.id] || 0) >= item.stock} onClick={() => changeQuantity(item, 1)}>+ Tambah</button></div></article>)}</div> : <StatePanel title={products.length ? 'Barang tidak ditemukan' : 'Belum ada barang'}>{products.length ? <><span>Coba pencarian lain. </span><button className="text-link" onClick={resetFilters}>Reset filter</button></> : 'Katalog belum diisi.'}</StatePanel>}<footer className="panel-footer">Menampilkan {visible.length} dari {products.length} barang</footer></section><aside className="cart-panel"><h2>Daftar belanja <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></h2><p className="muted">Susun kebutuhan Anda di sini.</p>{cartItems.length ? cartItems.map(item => <div className="cart-item" key={item.id}><strong>{item.name}</strong><span>{money(Number(item.price) * item.quantity)}</span><div className="quantity"><button aria-label={`Kurangi ${item.name}`} onClick={() => changeQuantity(item, -1)}>−</button><output aria-label={`Jumlah ${item.name}`}>{item.quantity}</output><button aria-label={`Tambah ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => changeQuantity(item, 1)}>+</button></div></div>) : <p className="cart-empty">Daftar Anda masih kosong. Tambahkan barang dari katalog.</p>}<div className="cart-total"><span>Estimasi total</span><strong>{money(total)}</strong></div><p className="cart-note">Daftar sementara, belum memesan atau mengurangi stok. Pembayaran belum tersedia.</p></aside></div>
}

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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [cart, setCart] = useState({})
  const role = session?.user.role
  const isAdmin = role === 'admin'
  const page = Object.entries(paths).find(([, value]) => value === path)?.[0] || 'choice'
  function navigate(next) { const target = paths[next]; if (target && target !== window.location.pathname) window.history.pushState({}, '', target); setPath(target || '/'); window.scrollTo(0, 0) }
  function refresh() { setLoadingProducts(true); if (isAdmin) setLoadingAnalytics(true); setRefreshCount(value => value + 1) }
  function resetFilters() { setSearch(''); setCategory(''); setLowOnly(false) }
  function authenticated(data) { setLoadingProducts(true); setLoadingAnalytics(true); setSession(data); resetFilters(); setCart({}); navigate(data.user.role === 'admin' ? 'admin' : 'customer') }
  async function logout() { try { await api('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': session.csrfToken } }); setSession(null); setProducts([]); setAnalytics(null); setCart({}); navigate('choice') } catch (error) { setProductError(error.message) } }
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  useEffect(() => { let active = true; api('/api/auth/me').then(data => { if (active) { setSession(data); const home = data.user.role === 'admin' ? paths.admin : paths.customer; if (!window.location.pathname.startsWith(home)) { window.history.replaceState({}, '', home); setPath(home) } } }).catch(() => {}).finally(() => { if (active) setChecking(false) }); return () => { active = false } }, [])
  useEffect(() => {
    if (!role) return
    const controller = new AbortController()
    let active = true
    api('/api/products', { signal: controller.signal }).then(data => { if (!Array.isArray(data) || data.some(item => !item || !Number.isInteger(item.id) || typeof item.name !== 'string' || !Number.isFinite(Number(item.price)) || !Number.isInteger(item.stock) || !Number.isInteger(item.min_stock))) throw new Error('Format data barang tidak valid.'); if (active) { setProducts(data); setProductError('') } }).catch(error => { if (active) { setProductError(error.message); if (error.status === 401) setSession(null) } }).finally(() => { if (active) setLoadingProducts(false) })
    return () => { active = false; controller.abort() }
  }, [role, refreshCount])
  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController()
    let active = true
    api('/api/admin/analytics', { signal: controller.signal }).then(data => { if (active) { setAnalytics(data); setAnalyticsError('') } }).catch(error => { if (active) setAnalyticsError(error.message) }).finally(() => { if (active) setLoadingAnalytics(false) })
    return () => { active = false; controller.abort() }
  }, [isAdmin, refreshCount])
  if (checking) return <StatePanel title="Memeriksa sesi">Mohon tunggu sebentar…</StatePanel>
  if (!session) return <AuthScreen key={page} page={page === 'adminLogin' || page === 'customerLogin' || page === 'register' ? page : 'choice'} navigate={navigate} onAuthenticated={authenticated} />
  const current = isAdmin ? (page === 'inventory' ? 'inventory' : 'admin') : 'customer'
  return <div className="app-shell"><a className="skip-link" href="#main">Langsung ke konten</a><aside className="sidebar"><Brand /><p className="nav-label">{isAdmin ? 'RUANG ADMIN' : 'RUANG PELANGGAN'}</p><nav aria-label="Navigasi utama">{isAdmin ? <><button className={current === 'admin' ? 'nav-button active' : 'nav-button'} onClick={() => navigate('admin')} aria-current={current === 'admin' ? 'page' : undefined}>▥ Dasbor analitik</button><button className={current === 'inventory' ? 'nav-button active' : 'nav-button'} onClick={() => navigate('inventory')} aria-current={current === 'inventory' ? 'page' : undefined}>▦ Inventori <span className="nav-count">{products.length}</span></button></> : <button className="nav-button active" aria-current="page">▤ Katalog barang</button>}</nav><div className="sidebar-note"><span className="note-dot" /> Lebih rapi, setiap hari.<p>Kelola kebutuhan warung dalam satu tempat.</p></div><div className="workspace"><span className="avatar">{session.user.username.slice(0, 1).toUpperCase()}</span><div>{session.user.username}<small>{isAdmin ? 'Admin warung' : 'Pelanggan'}</small></div></div><button className="logout-button" onClick={logout}>Keluar akun</button></aside><div className="main-shell"><header className="topbar"><span>{isAdmin ? 'Ruang admin' : 'Ruang pelanggan'} <span className="breadcrumb">/ {current === 'admin' ? 'Dasbor' : current === 'inventory' ? 'Inventori' : 'Katalog'}</span></span><span className="environment">{productError || analyticsError ? 'Koneksi bermasalah' : 'WADIMOR aktif'}</span></header><main id="main"><div className="page-heading"><div><p className="eyebrow">{isAdmin ? 'PANTAU WARUNG ANDA' : 'BELANJA LEBIH MUDAH'}</p><h1>{current === 'admin' ? 'Dasbor analitik' : current === 'inventory' ? 'Inventori barang' : 'Kebutuhan harian Anda'}</h1><p className="muted">{current === 'admin' ? 'Ringkasan stok dan penjualan berdasarkan data yang sudah tercatat.' : current === 'inventory' ? 'Pantau ketersediaan barang dan batas stok minimum.' : 'Temukan barang dan susun daftar belanja.'}</p></div><button className="button secondary" onClick={refresh} disabled={loadingProducts || loadingAnalytics}>↻ Perbarui data</button></div>{current === 'admin' ? <Dashboard analytics={analytics} loading={loadingAnalytics} error={analyticsError} retry={refresh} navigate={() => navigate('inventory')} /> : loadingProducts ? <StatePanel title="Memuat barang">Mengambil katalog warung…</StatePanel> : productError ? <StatePanel title="Data belum tersedia" retry={refresh}>{productError}</StatePanel> : current === 'inventory' ? <Inventory {...{ products, search, setSearch, category, setCategory, lowOnly, setLowOnly, resetFilters }} /> : <Catalog {...{ products, cart, setCart, search, setSearch, category, setCategory, resetFilters }} />}<footer className="page-footer">WADIMOR <span>Warung Digital Modern · Dibuat untuk keseharian.</span></footer></main></div></div>
}

