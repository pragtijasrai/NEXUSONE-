# NexusOne — Connecting Every Corner of Campus.
Monorepo: `frontend/` (React, plain CSS, Vite) and `backend/` (Express, PostgreSQL). See `docs/architecture.md`.

## Run separately
Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev` (http://localhost:5173)
Backend: `cd backend && cp .env.example .env` (set JWT_SECRET, DATABASE_URL) `&& npm install && npm run dev` (http://localhost:4000/api/health)
Create tables: `psql $DATABASE_URL -f backend/models/schema.sql`. Tests: `cd backend && npm test`.
Both at once: `npm run install:all && npm run dev` from the root.

## Demo
Student demo: `alex.morgan@northbridge.edu` / `demo1234` (mock mode). All frontend data is fictional.
## Status
Frontend: landing, login, student dashboard. Backend: health + auth. Remaining portals and API modules are planned.
"# NEXUSONE-" 
