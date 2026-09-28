# Panduan Kolaborasi WADIMOR

**Judul Capstone Project:** Sistem Informasi Inventory untuk Usaha Mikro Retail (Studi Kasus: Warung Kelontong)

Dokumen ini menjelaskan workflow Git agar perubahan setiap anggota tim mudah ditinjau dan tidak saling menimpa. Untuk instalasi lokal, baca [Panduan Setup](SETUP-GUIDE.md).

[Baca versi bahasa Inggris](#english-version)

## Prinsip dasar

- Branch `main` harus selalu dapat dijalankan.
- Satu branch menangani satu fitur, perbaikan, atau topik dokumentasi.
- Ambil perubahan terbaru sebelum mulai bekerja.
- Buat commit kecil dengan pesan yang menjelaskan hasil perubahan.
- Jalankan pemeriksaan yang relevan sebelum push.
- Gunakan pull request agar anggota lain dapat meninjau perubahan.

## 1. Sebelum mulai bekerja

Buka PowerShell di folder utama `wadimor-capstone`, lalu periksa repository:

```powershell
git status
```

Jika ada perubahan yang belum di-commit, selesaikan atau commit sebelum berpindah branch. Jangan menghapus perubahan milik anggota lain.

Sinkronkan branch utama:

```powershell
git switch main
git pull --ff-only
```

Opsi `--ff-only` menghentikan proses jika Git memerlukan merge yang tidak terduga dan membantu menjaga riwayat `main` tetap jelas.

## 2. Membuat branch

Gunakan nama singkat yang menggambarkan pekerjaan:

```powershell
git switch -c feature/product-form
```

| Prefix | Penggunaan |
|---|---|
| `feature/` | Fitur baru |
| `fix/` | Perbaikan bug |
| `docs/` | Perubahan dokumentasi |
| `test/` | Penambahan atau perbaikan test |
| `refactor/` | Perubahan struktur tanpa mengubah perilaku |

Contoh: `fix/cart-total`, `docs/setup-guide`, atau `feature/stock-adjustment`.

## 3. Mengedit dan memeriksa perubahan

```powershell
git status --short
git diff
```

Pastikan perubahan hanya berhubungan dengan tujuan branch. Jangan mencampurkan formatting besar, fitur baru, dan bug yang tidak berkaitan dalam satu pull request.

## 4. Menjalankan pemeriksaan

Untuk perubahan full-stack atau sebelum merge, jalankan:

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

Jika perubahan memengaruhi UI atau alur pengguna, uji secara manual di browser dan catat hasilnya pada pull request.

## 5. Membuat commit

Tambahkan hanya file yang memang ingin dimasukkan:

```powershell
git add path/to/file
git status
```

`git add .` boleh digunakan setelah seluruh perubahan pada `git status` dipastikan terkait dengan pekerjaan ini.

Buat pesan commit yang singkat dan jelas:

```powershell
git commit -m "Add stock adjustment validation"
```

Jelaskan tindakan atau hasil, misalnya `Fix customer checkout error` atau `Rewrite setup guide`. Hindari pesan umum seperti `update`, `changes`, atau `fix`.

## 6. Push dan pull request

```powershell
git push -u origin feature/product-form
```

Kemudian buka repository GitHub, pilih **Compare & pull request**, dan sertakan:

- Ringkasan perubahan.
- Alasan perubahan diperlukan.
- Cara perubahan diuji.
- Screenshot untuk perubahan tampilan.
- Catatan migration atau perubahan `.env`, jika ada.

Minta minimal satu anggota tim meninjau perubahan penting sebelum merge.

## 7. Setelah pull request di-merge

```powershell
git switch main
git pull --ff-only
git branch -d feature/product-form
```

Hapus branch lokal hanya setelah memastikan perubahannya sudah masuk ke `main`.

## File yang tidak boleh di-commit

- `backend/.env` karena berisi konfigurasi dan password lokal.
- `node_modules/` karena merupakan dependency hasil download.
- `frontend/dist/` karena merupakan hasil build yang dapat dibuat ulang.
- `backups/` dan file dump database.
- Password, token, cookie, atau screenshot yang menampilkan data rahasia.

Gunakan `backend/.env.example` untuk mendokumentasikan nama variable tanpa credential asli.

## Perubahan database

Jangan mengubah database tim secara manual tanpa migration SQL.

- Beri nomor migration secara berurutan.
- Buat perubahan gagal dengan aman jika asumsi schema tidak terpenuhi.
- Uji migration pada salinan database terlebih dahulu.
- Dokumentasikan backup, urutan eksekusi, dan apakah migration dapat diulang.
- Jangan menjalankan `schema.sql` pada database lama.

## Menangani conflict

Jangan memilih seluruh versi sendiri atau versi orang lain tanpa membaca kedua sisi. Buka file yang ditandai, pahami perubahan yang bertabrakan, lalu gabungkan hasil yang benar. Jika konteks bisnis tidak jelas, diskusikan dengan penulis perubahan.

Jangan menggunakan `git reset --hard` untuk menyelesaikan conflict karena command tersebut dapat menghapus pekerjaan lokal yang belum disimpan.

## Checklist pull request

- [ ] Scope pull request fokus dan mudah dijelaskan.
- [ ] Tidak ada secret atau file lokal.
- [ ] Test, lint, dan build yang relevan berhasil.
- [ ] Perubahan UI diperiksa pada ukuran layar yang relevan.
- [ ] Perubahan database memiliki migration dan petunjuk backup.
- [ ] Dokumentasi diperbarui jika workflow atau perilaku pengguna berubah.

---

<a id="english-version"></a>

# WADIMOR Collaboration Guide — English Version

**Capstone Project Title:** Inventory Information System for Micro Retail Businesses (Case Study: Neighborhood Grocery Store)

This document describes the Git workflow that keeps each team member's changes reviewable and prevents accidental overwrites. For local installation, read the [Setup Guide](SETUP-GUIDE.md#english-version).

[Read the Indonesian version](#panduan-kolaborasi-wadimor)

## Basic principles

- The `main` branch should always remain runnable.
- One branch should cover one feature, fix, or documentation topic.
- Pull the latest changes before starting work.
- Create focused commits with messages that describe the result.
- Run relevant checks before pushing.
- Use pull requests so another team member can review changes.

## 1. Before starting work

Open PowerShell in the `wadimor-capstone` project root and inspect the repository:

```powershell
git status
```

Finish or commit uncommitted work before switching branches. Never delete another team member's changes.

Synchronize the main branch:

```powershell
git switch main
git pull --ff-only
```

`--ff-only` stops when Git would require an unexpected merge and helps keep the `main` history clear.

## 2. Creating a branch

Use a short descriptive name:

```powershell
git switch -c feature/product-form
```

| Prefix | Use |
|---|---|
| `feature/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation change |
| `test/` | Test addition or correction |
| `refactor/` | Structural change without behavior changes |

Examples: `fix/cart-total`, `docs/setup-guide`, or `feature/stock-adjustment`.

## 3. Editing and reviewing changes

```powershell
git status --short
git diff
```

Keep changes related to the branch objective. Avoid combining broad formatting, new features, and unrelated fixes in one pull request.

## 4. Running checks

For full-stack changes or before merging, run:

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
```

If a change affects the UI or user flow, test it manually in a browser and record the result in the pull request.

## 5. Creating a commit

Stage only intended files:

```powershell
git add path/to/file
git status
```

Use `git add .` only after confirming that every listed change belongs to the current work.

Create a clear commit message:

```powershell
git commit -m "Add stock adjustment validation"
```

Describe the action or outcome, such as `Fix customer checkout error` or `Rewrite setup guide`. Avoid vague messages such as `update`, `changes`, or `fix`.

## 6. Pushing and opening a pull request

```powershell
git push -u origin feature/product-form
```

Open GitHub, select **Compare & pull request**, and include:

- A summary of changes.
- Why the change is needed.
- How it was tested.
- Screenshots for visual changes.
- Migration or `.env` notes, when applicable.

Ask at least one team member to review important changes before merging.

## 7. After a pull request is merged

```powershell
git switch main
git pull --ff-only
git branch -d feature/product-form
```

Delete the local branch only after confirming its changes are in `main`.

## Files that must not be committed

- `backend/.env`, because it contains local configuration and passwords.
- `node_modules/`, because it contains downloaded dependencies.
- `frontend/dist/`, because it is reproducible build output.
- `backups/` and database dump files.
- Passwords, tokens, cookies, or screenshots containing secrets.

Use `backend/.env.example` to document variable names without real credentials.

## Database changes

Never modify the team database manually without an SQL migration.

- Number migrations sequentially.
- Make changes fail safely when schema assumptions are not met.
- Test migrations on a database copy first.
- Document backups, execution order, and repeatability.
- Never run `schema.sql` on an existing database.

## Handling conflicts

Do not choose all of one side without reading both versions. Open marked files, understand overlapping changes, and combine the correct result. Discuss unclear business context with the change author.

Do not use `git reset --hard` to resolve conflicts because it can erase uncommitted work.

## Pull request checklist

- [ ] The pull request scope is focused and easy to explain.
- [ ] No secrets or local-only files are included.
- [ ] Relevant tests, lint, and build checks pass.
- [ ] UI changes were checked at relevant screen sizes.
- [ ] Database changes include a migration and backup instructions.
- [ ] Documentation is updated when workflows or user behavior change.

## GitHub branch protection

Adding contributors is not enough. In GitHub, open **Settings -> Branches -> Add branch ruleset/rule** for main and enable required pull requests, at least one approval, passing status checks, blocked force pushes, and restricted direct pushes. Contributors need repository **Write** access, then they push feature branches and open pull requests.
