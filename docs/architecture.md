# Architecture
- **frontend/**: React + Vite SPA. Pages call `src/services/*`; services use mock data now and `apiClient.js` when `VITE_USE_MOCK=false`.
- **backend/**: Express, layered as routes → controllers → services → models (PostgreSQL via `pg`). Validation with zod, JWT auth, bcrypt hashing, central error handler.
- **Status**: backend implements health and auth (register/login/me). Other modules are routed but return 501 until built. `sockets/` and `jobs/` are reserved for real-time updates and scheduled tasks.
- **Secrets**: only in `backend/.env` (gitignored). Frontend env holds public values only.
