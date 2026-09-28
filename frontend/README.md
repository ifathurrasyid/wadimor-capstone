# Frontend WADIMOR

**Judul Capstone Project:** Sistem Informasi Inventory untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

Frontend WADIMOR adalah aplikasi React 19 yang dijalankan dan dibuild menggunakan Vite 8, dengan Tailwind CSS 4 melalui PostCSS.

[Baca versi bahasa Inggris](#english-version)

## Tanggung jawab

- Menampilkan halaman login terpisah untuk Admin dan Customer.
- Menyediakan registrasi Customer dan protected view berdasarkan session.
- Menampilkan dashboard, inventory, laporan, dan riwayat untuk Admin.
- Menampilkan katalog, filter, keranjang, checkout di toko, struk, dan riwayat untuk Customer.
- Menggunakan path relatif `/api`; Vite meneruskan request development ke backend port `5000`.

Pengiriman barang berada di luar scope. Checkout selesai dengan pembayaran dan penyerahan barang langsung di toko.

## Instalasi

Jalankan dari folder utama repository:

```powershell
npm.cmd --prefix frontend ci
```

Perintah ini memasang React dan seluruh dependency dari lockfile. Jangan menjalankan `create-react-app` atau `npm create vite` karena project frontend sudah tersedia.

## Menjalankan development server

Dari folder utama:

```powershell
npm.cmd --prefix frontend run dev
```

Atau dari folder `frontend`:

```powershell
npm.cmd run dev
```

Buka `http://localhost:5173`. Backend harus berjalan pada `http://localhost:5000` dan PostgreSQL harus tersedia agar seluruh data dapat dimuat.

## Pemeriksaan

```powershell
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend audit
```

`build` membuat output production di `frontend/dist`. Folder tersebut dibuat otomatis dan tidak perlu di-commit.

## Dokumentasi terkait

- [README utama](../README.md)
- [Panduan setup](../docs/SETUP-GUIDE.md)
- [Panduan UI/UX](../docs/UI-UX.md)
- [Audit teknis](../docs/AUDIT.md)

---

<a id="english-version"></a>

# WADIMOR Frontend — English Version

**Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

The WADIMOR frontend is a React 19 application served and built with Vite 8, using Tailwind CSS 4 through PostCSS.

[Read the Indonesian version](#frontend-wadimor)

## Responsibilities

- Displays separate Admin and Customer login pages.
- Provides Customer registration and session-based protected views.
- Displays dashboard, inventory, reports, and history for Admin.
- Displays catalog, filters, basket, in-store checkout, receipts, and history for Customer.
- Uses relative `/api` paths; Vite proxies development requests to backend port `5000`.

Delivery is outside the project scope. Checkout ends with payment and item handover at the store.

## Installation

Run from the repository root:

```powershell
npm.cmd --prefix frontend ci
```

This installs React and all dependencies from the lockfile. Do not run `create-react-app` or `npm create vite` because the frontend project already exists.

## Running the development server

From the repository root:

```powershell
npm.cmd --prefix frontend run dev
```

Or from the `frontend` folder:

```powershell
npm.cmd run dev
```

Open `http://localhost:5173`. The backend must run at `http://localhost:5000`, and PostgreSQL must be available for all data to load.

## Checks

```powershell
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend audit
```

`build` creates production output in `frontend/dist`. This generated folder should not be committed.

## Related documentation

- [Main README](../README.md#english-version)
- [Setup guide](../docs/SETUP-GUIDE.md#english-version)
- [UI/UX guide](../docs/UI-UX.md#english-version)
- [Technical audit](../docs/AUDIT.md#english-version)
