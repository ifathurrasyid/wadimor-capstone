# Single owner Admin and stock corrections

The store has one **Admin**, the owner. The Super Admin role is removed. **Kelola Pengguna / Manage Users** can create **Cashier** accounts only. The Admin can reset passwords for and delete both **Cashier** and **Customer** accounts. Resetting generates a temporary password, signs the user out of all sessions, and requires a new password at the next login. Deletion preserves transaction history. The owner cannot be deleted or reset through staff management; use Settings or `setup:admin` with the existing owner's username. Customer registration remains available separately.

New databases initialized with `backend/schema.sql` already enforce the current roles and a unique owner. `setup:admin` creates the first owner or resets that same account; a different username cannot create a second owner or take over an existing Cashier/Customer account.

## Existing databases

Apply this once after migration 010, with the backend stopped. Back up the database first. Do not rerun `schema.sql`. Deploy the backend and frontend together.

```powershell
docker compose --env-file backend/.env exec -T db pg_dump -U admin -d wadimor_db -Fc -f /tmp/before-011.dump
docker compose --env-file backend/.env cp db:/tmp/before-011.dump backups/before-011.dump
Get-Content -Raw backend/migrations/011_single_owner.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
```

Use the configured database and username if different, and ensure `backups` exists before copying. Check each command succeeds. Migration 011 converts the sole existing Super Admin to Admin, keeping its ID, username, password, and display name, and requires that owner to sign in again. Existing Cashiers, Customers, products, transactions, and stock history are preserved. A database constraint prevents multiple Admins, including through direct database writes.

If multiple Admin/Super Admin accounts exist, the migration fails atomically without choosing the owner. Identify the actual owner with the team, change the other administrative accounts to `kasir`, and retry. Existing databases with a single regular Admin keep that account; databases without an owner can provision one with `setup:admin` after migrating.

## Stock correction behavior

**Barang Masuk / Delivery** adds the entered quantity to current stock. **Koreksi / Correction** sets stock to the entered final count, including zero. With current stock 20, delivery of 15 results in 35; correction to 15 results in 15. Negative counts are rejected. The history records the actual change and before/after balances; an unchanged count creates no stock movement.

The stock PATCH `amount` now represents the final count for `kind: "correction"` (also the default kind), and remains an added quantity for `kind: "delivery"`. Update other API clients accordingly. This behavior requires no changes to migration 010 or existing history; historical entries keep their recorded quantities.

## Bahasa Indonesia

Admin adalah satu-satunya pemilik toko. Menu Kelola Pengguna hanya dapat menambah Kasir, serta dapat mereset kata sandi dan menghapus Kasir maupun Customer. Reset menghasilkan kata sandi sementara dan mengakhiri semua sesi; pengguna wajib menggantinya saat masuk kembali. Riwayat transaksi tetap tersimpan setelah akun dihapus. Terapkan migration 011 setelah migration 010 dengan backend berhenti dan backup tersedia. Akun Super Admin lama menjadi Admin dengan username dan kata sandi yang sama; masuk kembali setelah upgrade. Jika ada beberapa akun administratif, migration berhenti tanpa mengubah data: tentukan pemilik bersama tim dan ubah akun administratif lainnya menjadi Kasir terlebih dahulu.

Koreksi menggunakan **Stok Akhir**, yaitu jumlah stok sebenarnya, termasuk nol. Barang Masuk tetap menambah stok. Riwayat stok menyimpan selisih serta stok sebelum/sesudah. Deploy backend dan frontend bersamaan.
