# Working together on WADIMOR

## Access to the code

The repository owner shares its GitHub URL with the team. For a private repository, the owner opens **Settings → Collaborators → Add people** and invites each member's GitHub username. Each teammate accepts the invitation before cloning. A public repository can be viewed and cloned without an invitation, but teammates still need write access to push branches.

Clone the project on each teammate's computer:

```powershell
git clone REPOSITORY_URL
cd wadimor-capstone
```

Replace `REPOSITORY_URL` with the actual GitHub URL. Teammates should work on a branch, push it, and open a pull request instead of editing `main` directly:

```powershell
git switch -c feature/your-task
git add .
git commit -m "Describe your change"
git push -u origin feature/your-task
```

Before starting new work, run `git switch main` and `git pull --ff-only` to get the latest accepted changes. Do not commit `.env`, database backups, `node_modules`, or generated `dist` files. The CI workflow checks backend tests and frontend lint/build on pushes and pull requests.

## Running the app locally

Each teammate needs Node.js 22 LTS, npm, and Docker Desktop. From the cloned project root:

```powershell
Copy-Item backend/.env.example backend/.env
# Edit backend/.env and set DB_PASSWORD to a private local value.
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
docker compose --env-file backend/.env up -d db
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

`schema.sql` is **only for a fresh database**. It fails when tables already exist. The generated Admin password is shown once in the terminal. Customer accounts can register in the app. Run `npm.cmd --prefix backend run dev` and `npm.cmd --prefix frontend run dev` in separate terminals, then open http://127.0.0.1:5173.

The GitHub repository contains source code, not your running database or local user accounts. Every teammate who starts Docker locally gets their own database. If the team needs shared test data, use a safe seed script or a separate shared development database; do not upload local backups or credentials.

## Sharing a running app

`localhost` only works on the same computer. A GitHub repository link lets friends see and clone the code; it does not host the API or PostgreSQL database. GitHub Pages alone cannot run this full stack. For a browser-accessible demo, deploy the React build, Express API, and PostgreSQL to suitable hosting with HTTPS, environment variables, and a same-origin `/api` proxy. Rotate the current demo Admin password and database credentials before public deployment.

## Teammate deployment tutorial

This project runs locally on each laptop. GitHub shares the source code; Docker runs that laptop's PostgreSQL database; the two Node processes run the API and browser application. No teammate needs access to another teammate's database.

### 1. Install prerequisites

Install these before cloning:

- Git for Windows
- Node.js 22 LTS
- Docker Desktop with the Linux container engine enabled

After installation, open a new PowerShell window and check:

```powershell
git --version
node --version
npm.cmd --version
docker version
```

### 2. Clone and enter the project

```powershell
git clone https://github.com/ifathurrasyid/wadimor-capstone.git
Set-Location wadimor-capstone
```

If the repository is private, the owner must invite the teammate under **GitHub → repository → Settings → Collaborators** before cloning.

### 3. Create the local environment file

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Set `DB_PASSWORD` to a private password for this laptop. Keep `backend/.env` local; it is ignored by Git.

### 4. Install dependencies

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

### 5. Start PostgreSQL

```powershell
docker compose --env-file backend/.env up -d db
docker compose ps
```

Wait until the database status is `healthy`. If Docker is not running, start Docker Desktop and repeat this step.

### 6A. Fresh laptop/database

Use this path when this laptop has no WADIMOR database yet:

```powershell
Get-Content -Raw backend/schema.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

The schema creates demo categories and products. The Admin setup command prints a one-time generated password. Customer accounts are created from `/customer/register`.

Do not run `schema.sql` again after it succeeds. It is a fresh-database bootstrap and is intentionally not a repeatable migration.

### 6B. Existing database created before the latest commit

If this laptop already has the original WADIMOR database, do not run `schema.sql`. Back it up first, then apply each migration once in order:

```powershell
docker compose --env-file backend/.env exec -T db pg_dump -U admin -d wadimor_db -Fc -f /tmp/wadimor-before-update.dump
docker cp wadimor_postgres:/tmp/wadimor-before-update.dump .\wadimor-before-update.dump
Get-Content -Raw backend/migrations/001_integrity.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/002_sessions.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/003_reset_legacy_passwords.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
Get-Content -Raw backend/migrations/004_pos_features.sql | docker compose --env-file backend/.env exec -T db psql -U admin -d wadimor_db -v ON_ERROR_STOP=1
npm.cmd --prefix backend run setup:admin
```

The migration disables old plaintext demo passwords and adds cost-price fields used by reports. It does not delete products. Store the backup outside Git and do not upload it.

If a migration says a column or constraint already exists, stop and check the database before rerunning it. Do not use `docker compose down -v`; that deletes the PostgreSQL volume and all local data.

### 7. Start the API and frontend

Open two PowerShell windows from the project root.

Window 1:

```powershell
npm.cmd --prefix backend run dev
```

Window 2:

```powershell
npm.cmd --prefix frontend run dev
```

Open http://127.0.0.1:5173. Use `/admin/login` for Admin or `/customer/login` for Customer. The Vite frontend proxies `/api` to the backend on port 5000.

### 8. Verify the installation

In a third PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/status
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
```

The status response should report `"database": "connected"`. A fresh database should show six demo products and one low-stock item. Sales and profit are zero until a checkout is completed.

### Common fixes

- `npm.ps1 cannot be loaded`: use `npm.cmd` exactly as shown.
- `password authentication failed`: make `backend/.env` match the password used when the PostgreSQL volume was first initialized. Changing `.env` alone does not change an existing database password.
- `port 5434 already allocated`: stop the other PostgreSQL container/process, or coordinate a different port in both `backend/.env` and `docker-compose.yml`.
- `EADDRINUSE` on 5000 or 5173: stop an old backend/frontend terminal with Ctrl+C.
- `ECONNREFUSED` from the frontend: start the backend and confirm http://127.0.0.1:5000/api/status works.
- Empty products after cloning: initialize the fresh database using step 6A.

### Daily team workflow

```powershell
git switch main
git pull --ff-only
git switch -c feature/short-description
# make and test your change
npm.cmd --prefix backend test
npm.cmd --prefix frontend run lint
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request and wait for CI before merging. Never commit `.env`, database dumps, `node_modules`, or `dist`.
