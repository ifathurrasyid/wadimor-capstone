# Working with WADIMOR / Bekerja dengan WADIMOR

I keep the complete local installation instructions in [SETUP-BILINGUAL.md](SETUP-BILINGUAL.md). It explains the stack, Docker and no-Docker setup, fresh and existing databases, running the app, troubleshooting, and Git workflow in English and Indonesian.

Saya menyimpan panduan instalasi lengkap di [SETUP-BILINGUAL.md](SETUP-BILINGUAL.md). Panduan itu menjelaskan stack, setup dengan atau tanpa Docker, database baru dan lama, cara menjalankan aplikasi, troubleshooting, serta workflow Git dalam bahasa Inggris dan Indonesia.

## My collaboration rules / Aturan kolaborasi saya

I pull before I edit, create a focused branch, run the relevant checks, and open a pull request. You can use this workflow:

Saya melakukan pull sebelum mengedit, membuat branch yang fokus, menjalankan pemeriksaan yang relevan, dan membuka pull request. Kamu bisa menggunakan workflow berikut:

```powershell
git switch main
git pull --ff-only
git switch -c feature/short-description
# edit and test / edit dan uji perubahan
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

I never commit `backend/.env`, database backups, `node_modules`, or generated `dist` files. GitHub shares the source code; you still run the API and PostgreSQL locally unless I deploy them to a server.

Saya tidak pernah melakukan commit pada `backend/.env`, backup database, `node_modules`, atau folder `dist` hasil build. GitHub membagikan source code; kamu tetap menjalankan API dan PostgreSQL secara lokal kecuali saya melakukan deployment ke server.

