# NexusOne — Backend

Node.js + Express + PostgreSQL backend for the NexusOne campus management platform.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 14+ |

---

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy env file and fill in values
copy .env.example .env

# 3. Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE nexusone;"
psql -U postgres -c "CREATE USER nexusone WITH PASSWORD 'change_me';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nexusone TO nexusone;"

# 4. Run migrations (creates all tables)
npm run migrate

# 5. Seed demo data
npm run seed

# 6. Start the dev server
npm run dev
```

Server starts at: `http://localhost:4000`  
Health check: `http://localhost:4000/api/v1/health`

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://nexusone:change_me@localhost:5432/nexusone
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1h
LOG_LEVEL=debug
```

Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## NPM Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start with `--watch` (auto-restarts on changes) |
| `npm start` | Production start |
| `npm test` | Run all tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run migrate:status` | Show migration status |
| `npm run seed` | Insert demo data |

---

## Architecture

```
Request → Express → Middleware → Route → Controller → Service → Model → PostgreSQL
                                                               ↓
                                                         Response ←
```

### Layers

- **Routes** (`routes/`) — define endpoints, attach middleware
- **Controllers** (`controllers/`) — extract from request, call service, format response
- **Services** (`services/`) — all business logic, no HTTP knowledge
- **Models** (`models/`) — all SQL queries, parameterized, no business logic
- **Middleware** (`middleware/`) — auth, validation, rate limiting, error handling
- **Validators** (`validators/`) — Zod schemas for request body validation

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication

All protected routes require:
```
Authorization: Bearer <accessToken>
```

#### POST /auth/register
Create a student or faculty account.
```json
{ "name": "Alex Morgan", "email": "alex@northbridge.edu", "password": "demo1234", "role": "student" }
```
Returns: `{ success, message, data: { user, accessToken, refreshToken } }`

#### POST /auth/login
```json
{ "email": "alex.morgan@northbridge.edu", "password": "demo1234" }
```
Returns: `{ success, message, data: { user, accessToken, refreshToken } }`

#### POST /auth/refresh
Exchange a refresh token for a new token pair (rotation enforced).
```json
{ "refreshToken": "..." }
```

#### POST /auth/logout
Revoke the refresh token.
```json
{ "refreshToken": "..." }
```

#### GET /auth/me *(auth required)*
Returns current user from JWT payload.

#### PATCH /auth/me *(auth required)*
Update own profile.
```json
{ "name": "New Name", "phone": "+91-9876543210" }
```

#### PATCH /auth/me/password *(auth required)*
Change own password (invalidates all refresh tokens).
```json
{ "currentPassword": "demo1234", "newPassword": "newsecurepassword" }
```

### Users (Admin only)

#### GET /users
Paginated user list. Query params: `page`, `limit`, `role`, `status`, `search`, `sortBy`, `sortDir`

#### GET /users/:id

#### PATCH /users/:id
```json
{ "status": "inactive" }
```

#### DELETE /users/:id

### Health

#### GET /health
No auth required. Returns server and database status.

---

## Database

### Schema Overview

| Table | Purpose |
|---|---|
| `users` | Central auth — all roles |
| `students` | Student-specific profile (1:1 with users) |
| `faculty` | Faculty-specific profile (1:1 with users) |
| `maintenance_staff` | Maintenance profile (1:1 with users) |
| `departments` | Academic departments |
| `courses` | Course catalogue |
| `course_enrollments` | Student ↔ course M:M |
| `class_sessions` | Scheduled class meetings |
| `attendance_records` | Per-student per-session |
| `assignments` | Faculty-created assignments |
| `assignment_submissions` | Student submissions |
| `rooms` | Bookable campus spaces |
| `room_bookings` | Reservations with EXCLUDE constraint |
| `maintenance_tickets` | Fault reports |
| `maintenance_ticket_history` | Status change log |
| `events` | Campus events |
| `event_registrations` | User event sign-ups |
| `announcements` | Role-targeted notices |
| `lost_and_found_items` | Lost/found reports |
| `notifications` | Per-user notification inbox |
| `refresh_tokens` | Hashed refresh tokens |
| `audit_logs` | Admin action log |
| `schema_migrations` | Migration tracking |

### Key Design Decisions

**Room booking concurrency**: The `room_bookings` table uses a PostgreSQL `EXCLUDE USING gist` constraint with `tstzrange` to prevent overlapping bookings at the database level — even under concurrent requests.

**Refresh tokens**: Stored as SHA-256 hashes. The raw token is sent to the client once and never stored. Rotation is enforced: using a refresh token immediately revokes it and issues a new pair.

**No ORM**: Raw `pg` queries with parameterized placeholders everywhere. This demonstrates SQL directly and prevents injection.

---

## Authentication Flow

```
1. POST /auth/login → receives { accessToken, refreshToken }
2. Store accessToken in sessionStorage
3. Store refreshToken in localStorage
4. Every API request: Authorization: Bearer <accessToken>
5. On 401: apiClient auto-calls POST /auth/refresh
6. On logout: POST /auth/logout revokes refreshToken
```

**Access token**: 1h JWT, validated by `authenticate` middleware on every request.  
**Refresh token**: 30-day random string, stored as SHA-256 hash in DB, rotated on every use.

---

## Role-Based Access Control

| Role | Can do |
|---|---|
| `student` | Own academic records, bookings, tickets, events |
| `faculty` | Manage own classes, attendance, assignments |
| `admin` | Full user management, all data, analytics |
| `maintenance` | Assigned ticket queue, status updates |

Public registration only allows `student` or `faculty`. The `admin` and `maintenance` roles can only be assigned by an existing admin via `PATCH /users/:id`.

---

## Demo Credentials (seed data)

| Role | Email | Password |
|---|---|---|
| Student | alex.morgan@northbridge.edu | demo1234 |
| Faculty | priya.raman@northbridge.edu | demo1234 |
| Admin | jordan.ellis@northbridge.edu | demo1234 |
| Maintenance | sam.okafor@northbridge.edu | demo1234 |

These are development-only accounts. Change all passwords before any production deployment.

---

## Testing

```bash
npm test
```

Tests run without a real database — the test suite covers:
- Input validation on all auth endpoints
- JWT middleware (missing, expired, wrong secret, valid)
- Role-based access control (student/faculty blocked from admin routes)
- Registration role restriction (admin/maintenance rejected by schema)
- Refresh token rotation
- Logout token revocation
- Profile update strict schema validation
- Health endpoint

---

## Security Notes

- Passwords hashed with bcrypt cost 12
- JWTs signed with `HS256`, verified on every request
- Rate limiting: 5 req/15min on auth endpoints, 100 req/15min general
- Helmet sets security headers on all responses
- CORS restricted to configured origin(s)
- All SQL uses parameterized queries — no string concatenation
- `password_hash` never returned in any API response
- Stack traces never sent to clients in production
- HTTPS required in production (not enforced in dev)

---

## Known Limitations

- Password reset (forgot password) not yet implemented
- File uploads (profile photos, attachments) not yet implemented
- WebSocket/real-time notifications not yet implemented
- Phases 3–10 (dashboards, rooms, events, etc.) are stubbed as 501
- No email verification on registration
