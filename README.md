# Release Checklist

A single-page application for tracking software release progress through a fixed checklist of steps. Built with React + Vite (frontend) and Node.js + Express (backend), backed by PostgreSQL.

## Live Demo

- **Frontend:** `https://release-tool.vercel.app/`
- **Backend:** `https://release-tool.onrender.com/`

---

## Running Locally

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech) — free tier works great)

### 1. Clone the repository

```bash
git clone https://github.com/pdmnsahu/release-tool.git
cd release-tool
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your `DATABASE_URL`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

The API will run on `http://localhost:3001`. The database tables are created automatically on first run.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

The default `.env` proxies API calls to `localhost:3001` via Vite's proxy config — no changes needed for local dev.

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

### Backend (Render)

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node src/index.js`
6. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `FRONTEND_URL` — your Vercel frontend URL
   - `NODE_ENV` — `production`

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` — your Render backend URL + `/api` (e.g. `https://your-api.onrender.com/api`)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/releases` | List all releases with steps and computed status |
| `POST` | `/api/releases` | Create a new release |
| `GET` | `/api/releases/:id` | Get a single release with steps |
| `PATCH` | `/api/releases/:id` | Update a release's `additional_info` |
| `PATCH` | `/api/releases/:id/steps/:stepKey` | Toggle a step on or off |
| `DELETE` | `/api/releases/:id` | Delete a release |
| `GET` | `/api/releases/meta/steps` | Get the list of all fixed steps |
| `GET` | `/api/health` | Health check |

### Request / Response Examples

**POST `/api/releases`**
```json
// Request body
{ "name": "v2.4.0", "date": "2025-06-01T10:00:00", "additional_info": "Optional notes" }

// Response
{
  "id": 1, "name": "v2.4.0", "date": "2025-06-01T10:00:00",
  "additional_info": "Optional notes", "status": "planned",
  "steps": [{ "key": "code_review", "label": "Code Review Approved", "completed": false }, ...]
}
```

**PATCH `/api/releases/1/steps/code_review`**
```json
// Request body
{ "completed": true }

// Response — full release object with updated status
```

---

## Database Schema

```sql
CREATE TABLE releases (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  date          TIMESTAMP NOT NULL,
  additional_info TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE release_steps (
  id          SERIAL PRIMARY KEY,
  release_id  INTEGER REFERENCES releases(id) ON DELETE CASCADE,
  step_key    VARCHAR(100) NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  UNIQUE(release_id, step_key)
);
```

The **status** field (`planned` | `ongoing` | `done`) is computed at query time and never stored.

### Status logic

- `planned` — no steps completed
- `ongoing` — at least one step completed, but not all
- `done` — all steps completed

---

## Fixed Steps

Every release shares the same 10 steps:

| Key | Label |
|-----|-------|
| `code_review` | Code Review Approved |
| `tests_passing` | All Tests Passing |
| `staging_deploy` | Deployed to Staging |
| `qa_sign_off` | QA Sign-off |
| `changelog_updated` | Changelog Updated |
| `db_migrations_ready` | DB Migrations Ready |
| `dependencies_audited` | Dependencies Audited |
| `production_deploy` | Deployed to Production |
| `smoke_tests` | Smoke Tests Passed |
| `notify_team` | Team Notified |

---

## Project Structure

```
release-checklist/
├── backend/
│   ├── src/
│   │   ├── db/index.js        # DB pool + schema init
│   │   ├── routes/releases.js # All release endpoints
│   │   ├── steps.js           # Fixed steps + status logic
│   │   └── index.js           # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/index.js            # API client
│   │   ├── components/
│   │   │   ├── NewReleaseModal.jsx
│   │   │   └── ReleaseDetail.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```
