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
