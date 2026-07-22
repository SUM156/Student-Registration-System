# 🎓 Student Registration System

[![CI](https://github.com/sumairdero/student-registration-system/actions/workflows/ci.yml/badge.svg)](https://github.com/sumairdero/student-registration-system/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.19-black.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/mysql-8.0-4479A1.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack CRUD application for registering and managing student records, built with a vanilla HTML/CSS/JS frontend and a Node.js + Express + MySQL REST API. Built as a final project for the Startup Sindh Web Development Summer Internship 2026.

## Table of contents

- [Problem statement](#problem-statement)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Folder structure](#folder-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Problem statement

Academic institutions need a simple, reliable way to register students, search/filter existing records, and correct or remove entries — with server-side validation and data integrity (no duplicate emails, no malformed dates) that a purely client-side tool cannot guarantee.

## Features

- ✅ **Full CRUD** — create, read, update (partial/PATCH), and delete student records.
- 🔒 **Defense-in-depth validation** — client-side for instant feedback, server-side (`express-validator`) as the actual source of truth.
- 🌐 **REST API** — versioned, consistently-shaped JSON responses (`docs/API.md`).
- 🔍 **Search & filter** — search by name/email, filter by course, paginated results.
- ♿ **Accessible frontend** — semantic HTML5, ARIA live regions for toasts/errors, visible focus states, skip link, keyboard-operable dialog.
- 📱 **Mobile-first, responsive** — single-column form on small screens, multi-column on larger ones; horizontally scrollable table instead of clipped content.
- 🛡️ **Security middleware** — `helmet` headers, scoped CORS, rate limiting, parameterized SQL (no injection surface).
- 🧪 **Automated tests** — Jest + Supertest integration tests covering every endpoint's success and failure paths.
- 🐳 **Container-ready** — Dockerfile per service + a root `docker-compose.yml` that runs the API and MySQL together with the schema auto-loaded.
- ⚙️ **CI** — GitHub Actions: lint, test against a real MySQL service container, Docker build check.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (mobile-first, no framework), vanilla JavaScript (ES2022) |
| Backend | Node.js 18+, Express 4 |
| Database | MySQL 8 (via `mysql2/promise`, parameterized queries) |
| Validation | `express-validator` (server), hand-written rules (client) |
| Testing | Jest, Supertest |
| Security | `helmet`, `cors`, `express-rate-limit` |
| CI/CD | GitHub Actions, Docker, Docker Compose |

## Architecture

Full rationale and diagrams in **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**. Summary:

```
frontend/  → static HTML/CSS/JS, talks to the API only via js/api.js
backend/   → routes → validators → controllers → models (raw, parameterized SQL)
             app.js (Express config, no listen()) + server.js (the actual entrypoint)
```

## Installation

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8 (or use `docker-compose up`, which provisions it for you)

### Backend

```bash
cd backend
cp .env.example .env        # then edit DB_USER/DB_PASSWORD to match your MySQL setup
npm install

# Load the schema (and optional sample data) into MySQL
mysql -u root -p < database/schema.sql
mysql -u root -p student_registration_db < database/seed.sql   # optional sample rows

npm run dev                  # starts on http://localhost:3000 with auto-reload
```

### Frontend

The frontend is static — no build step. Serve it with any static file server, e.g.:

```bash
cd frontend
npx serve .          # or: python3 -m http.server 5500
```

Open the URL it prints (e.g. `http://localhost:5500`). Make sure `backend/.env`'s `CORS_ALLOWED_ORIGINS` includes that exact origin.

## Usage

1. Fill in the **Register New Student** form and submit — client-side validation gives instant feedback; the server re-validates and rejects duplicate emails with a clear message.
2. Use the **search box** and **course filter** above the table to narrow the list; both are debounced/instant.
3. Click **✏️ Edit** on any row to load that student back into the form (now in "edit" mode — submit to `PATCH`, or **Cancel** to discard).
4. Click **🗑️ Delete** to remove a record — a confirmation dialog guards against accidental deletion.

## Folder structure

```
student-registration-system/
├── backend/
│   ├── src/
│   │   ├── config/         # env.js (validated env vars), database.js (MySQL pool)
│   │   ├── controllers/    # student.controller.js — orchestration, no SQL
│   │   ├── models/         # student.model.js — the ONLY file with raw SQL
│   │   ├── routes/         # student.routes.js, index.js — wiring only
│   │   ├── middlewares/    # errorHandler, notFound, validateRequest
│   │   ├── validators/     # express-validator rule chains
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler
│   │   ├── app.js          # Express app (no .listen())
│   │   └── server.js       # actual process entrypoint
│   ├── database/           # schema.sql, seed.sql
│   ├── tests/               # Jest + Supertest integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/                # reset.css, styles.css (mobile-first)
│   └── js/                 # api.js, validation.js, ui.js, main.js
├── docs/
│   ├── API.md               # full endpoint reference
│   └── ARCHITECTURE.md      # design decisions and trade-offs
├── .github/workflows/ci.yml
├── docker-compose.yml       # backend + MySQL together
├── LICENSE
└── README.md
```

## Testing

```bash
cd backend
npm test              # Jest + Supertest, model layer mocked — fast, no DB needed
```

Covers: successful create/list/get/update/delete, every validation failure path, the 404 (not found) and 409 (duplicate email) paths, and the global 404 handler for unmatched routes.

## Deployment

**Docker Compose (recommended for a full local/demo environment):**
```bash
docker compose up --build
```
This starts MySQL (with `schema.sql` and `seed.sql` auto-loaded on first run) and the backend together, wired to talk to each other.

**Backend only, any Node host (Render, Railway, etc.):** point the start command at `node src/server.js`, and set the `DB_*` environment variables from `.env.example` to your managed MySQL instance's credentials.

**Frontend:** any static host (GitHub Pages, Netlify, Vercel). Update `BASE_URL` in `frontend/js/api.js` to your deployed backend's URL before publishing.

## Future roadmap

See **[`docs/ARCHITECTURE.md` §6](docs/ARCHITECTURE.md#6-future-roadmap)**: authentication/authorization, courses as a first-class table, soft deletes, structured logging, and real-database (non-mocked) integration tests.

## Contributing

1. Fork, branch off `main`.
2. `npm run lint` and `npm test` must pass before opening a PR.
3. Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, ...).

## License

[MIT](LICENSE) © 2026 Sumair Ahmed Dero
