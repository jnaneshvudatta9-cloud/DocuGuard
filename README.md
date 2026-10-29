# DocuGuard — Smart Document Tracker

A full-stack web application to manage, track, and get AI-powered renewal guidance for your important documents.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19 · Vite · TypeScript · Tailwind CSS |
| Backend    | Node.js · Express · TypeScript              |
| Database   | Supabase (PostgreSQL + Row Level Security)  |
| Auth       | Supabase Auth (email/password)              |
| AI         | Google Gemini 2.0 Flash (backend only)      |
| Validation | Zod                                         |
| Icons      | lucide-react                                |

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key *(optional — app works without it using a demo checklist)*

---

## Environment Variables

> **Never commit real keys to Git.** Both `.env` files are excluded by `.gitignore`.

### `client/.env`

Copy from `client/.env.example`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

| Variable              | Where to find it                                                                 |
|-----------------------|----------------------------------------------------------------------------------|
| `VITE_SUPABASE_URL`   | Supabase Dashboard → Project Settings → API → Project URL                       |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → **anon / public** key          |
| `VITE_API_BASE_URL`   | URL of the running Express backend (default `http://localhost:5000`)             |

### `server/.env`

Copy from `server/.env.example`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

| Variable          | Where to find it                                                                    |
|-------------------|-------------------------------------------------------------------------------------|
| `PORT`            | Port for the Express server (default 5000)                                          |
| `CLIENT_URL`      | Frontend origin for CORS (default `http://localhost:5173`)                          |
| `SUPABASE_URL`    | Same as `VITE_SUPABASE_URL` above                                                   |
| `SUPABASE_ANON_KEY` | Same **anon / public** key as above — **not** the service-role secret key       |
| `GEMINI_API_KEY`  | Google AI Studio → Get API Key. If omitted, a demo checklist is returned instead.  |

> ⚠️ Use the **anon/public** key on the backend too. The server creates per-request Supabase clients that forward the user's JWT, so RLS policies enforce data isolation. The service-role key is never needed here.

---

## Database Setup

Run this once in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query):

```sql
-- Paste the contents of supabase/migrations/001_initial_schema.sql
```

The migration:
- Creates the `public.documents` table with all required columns
- Adds indexes for fast user-scoped and expiry-date queries
- Enables Row Level Security so each user can only access their own documents
- Creates an `updated_at` auto-trigger

If the table already exists with this schema, the `CREATE TABLE IF NOT EXISTS` and `DROP POLICY IF EXISTS` guards make the script safe to re-run.

---

## Local Development

### 1. Install dependencies

```powershell
# Frontend
cd client
npm install

# Backend (new terminal)
cd server
npm install
```

### 2. Create environment files

```powershell
# Frontend
copy client\.env.example client\.env
# Edit client\.env and fill in your values

# Backend
copy server\.env.example server\.env
# Edit server\.env and fill in your values
```

### 3. Start both servers

**Terminal 1 — Backend:**
```powershell
cd server
npm run dev
```
API will be running at `http://localhost:5000`

**Terminal 2 — Frontend:**
```powershell
cd client
npm run dev
```
App will open at `http://localhost:5173`

### 4. Verify

Visit `http://localhost:5000/api/health` — you should see:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## Type Checking

```powershell
# Frontend
cd client
npm run typecheck

# Backend
cd server
npm run typecheck
```

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `server`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add environment variables in Render dashboard:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `SUPABASE_URL=...`
   - `SUPABASE_ANON_KEY=...`
   - `GEMINI_API_KEY=...`

### Frontend → Vercel

1. Import the repository into [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Vercel auto-detects Vite
4. Add environment variables:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_API_BASE_URL=https://your-backend.onrender.com`

> **Important:** Update `CLIENT_URL` on Render and `VITE_API_BASE_URL` on Vercel to match each other's production URLs.

---

## Security Notes

- API keys are **never** in frontend code or committed to Git
- The Gemini API key is loaded only on the backend
- Supabase RLS prevents cross-user data access even if the API were called directly
- JWTs are verified server-side on every protected request
- No service-role / secret keys are used anywhere in this project

---

## Project Structure

```
DocuGaurd/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route-level pages
│   │   ├── hooks/             # Auth + documents hooks
│   │   ├── lib/               # Supabase client, API calls, date utils
│   │   └── types/             # TypeScript types
│   ├── .env.example
│   └── package.json
├── server/                    # Express API backend
│   ├── src/
│   │   ├── routes/            # /documents, /renewal-checklist
│   │   ├── middleware/        # JWT auth middleware
│   │   └── lib/               # Supabase server client factory
│   ├── .env.example
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .gitignore
└── README.md
```
