# Artora Backend — Phase A

Phase A of the production backend: **authentication + server-managed
sessions + health**, backed by PostgreSQL. Built *alongside* the existing
localStorage demo — the frontend is **not** migrated in this phase.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Web framework | Express (no extra frameworks) |
| Database | PostgreSQL |
| Password hashing | **Argon2id** (`argon2` npm package) |
| Sessions | Server-side `sessions` table + opaque `UUID` cookie |
| Cookie | `HttpOnly` + `SameSite=Lax`; `Secure` auto-enabled in `NODE_ENV=production` |

## Quick start

```bash
# 1. Server dependencies only
cd server
npm install

# 2. Configure (NEVER commit the real values)
cp ../.env.example ../.env     # then edit DATABASE_URL / SESSION_SECRET
# or export them in your shell

# 3. Start (also serves the existing static frontend)
npm start
# -> GET http://localhost:3000/api/health   { status: "ok" }
```

> The server serves the existing static frontend at `/` (unchanged demo) and
> exposes the API under `/api`.

## Database schema (Phase A)

```sql
-- users
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  password_hash  TEXT NOT NULL,   -- Argon2id
  name           TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_key ON users (lower((trim(email))));

-- sessions (opaque server-side session store)
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx   ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
```

Apply manually (Phase A DDL runs programmatically on boot via
`server/db/migrations/001_initial.js` → `CREATE TABLE IF NOT EXISTS`):

```bash
psql "$DATABASE_URL" -f server/db/migrations/001_initial.sql
```

## API (Phase A)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | service liveness |
| POST | `/api/auth/register` | none | Argon2id user creation (email-unique) |
| POST | `/api/auth/login` | none | verify + issue session cookie |
| POST | `/api/auth/logout` | session | invalidate server session + clear cookie |
| GET | `/api/auth/me` | session | current user (or 401) |

## Migration note (intentional, out of Phase A scope)

The existing demo store keeps the old 32-bit client hash of the *name* in
`js/auth.js hashPassword()`. **That hash is not reused**: Phase A accounts are
created fresh via `/api/auth/register` with Argon2id. Migration of existing
demo accounts is Option C (explicit re-registration) and is **not** done in
Phase A.

## Security properties (Phase A)

- Passwords: Argon2id, per-password random salt, never plaintext, never the demo hash.
- Identity: cookie holds **only** a server-generated session id.
- Authorization: `requireAuth` resolves `userId` from the session row joined to `users` — never trusts client-sent email/userId/role.
- Session fixation: a fresh session id is minted on every login.
- SQL: all queries are parameterized (`$1`, `$2`, …).
- Errors: production responses never include stack traces or SQL.
- Cookie: `HttpOnly`, `SameSite=Lax`, `Secure` in production.
