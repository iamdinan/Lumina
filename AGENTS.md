# AGENTS.md (Backend)

## What this project is

**Lumina API** is the backend for a TV series tracker. It fetches series/
season/episode metadata from TMDB, caches it in Postgres, and exposes
authenticated endpoints for per-user tracking: watchlist status, watched
episodes, profile info, and watch-time stats. Consumed by a separate React
frontend (see that project's own AGENTS.md).

## Tech stack

- Node.js + Express
- PostgreSQL (`pg` driver, raw parameterized SQL — no ORM)
- Auth: `bcrypt` (password hashing) + `jsonwebtoken` (JWT, 7-day expiry)
- Validation: `express-validator`
- Security/middleware: `helmet`, `cors`, `express-rate-limit` (auth routes
  only)
- External API: TMDB, via an `axios` wrapper in `services/tmdb.service.js`

## How to run locally

```bash
npm install
npm run dev        # nodemon src/server.js
```

Requires `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/lumina
TMDB_API_KEY=...
TMDB_BASE_URL=https://api.themoviedb.org/3
JWT_SECRET=...
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Health check: `GET /api/health` — confirms the DB pool connects.

## Migrations

No migration tool in use. Schema changes are hand-written `.sql` files, run
manually against the `lumina` Postgres database (currently via the VS Code
Postgres extension). Convention: numbered files in `db/migrations/`
(e.g. `002_add_runtime_and_profile_fields.sql`). Never edit an
already-applied migration — write a new one.

## Coding conventions

- **Controllers**: wrapped in `asyncHandler` (`utils/asyncHandler.js`) — no
  manual try/catch. Throw `AppError(statusCode, message)` for deliberate
  error responses; let anything unexpected bubble to the global
  `errorHandler` middleware.
- **Validation**: every route with params/body gets an `express-validator`
  chain in `src/validators/`, applied as
  `[...validators, validate, controllerFn]`. Controllers shouldn't
  re-validate what the chain already covers.
- **DB access**: raw parameterized SQL via `pool.query(...)`. Always use
  `$1, $2...` placeholders — never string-interpolate values into SQL.
  Multi-statement writes that must succeed/fail together use an explicit
  transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) with a checked-out `client`.
- **Upserts**: use `ON CONFLICT ... DO UPDATE` / `DO NOTHING`, not
  select-then-insert-or-update logic.
- **Response shape**: JSON, snake_case keys (matches DB column naming).
- **Naming**: snake_case in SQL/DB columns and JSON payloads, camelCase in
  JS variables/functions.

## Things to never do without asking

- Don't add a running/cached "total watch time" column on `users` — watch
  time is deliberately computed live via `SUM(runtime_minutes)` over
  `user_episodes`/`episodes` on every request, specifically to avoid
  increment/decrement bugs across mark/unmark/bulk-complete/remove paths.
- Don't change the `user_episodes` key shape (surrogate `watch_id` PK +
  `UNIQUE(user_id, episode_id)`) without checking STATE.md/DECISIONS.md —
  intentionally structured this way to allow rewatch tracking later by
  dropping the UNIQUE constraint, with zero migration needed at that point.
- Don't change the automatic status state machine (watchlist → watching →
  completed, and the cascade-delete of watch history on series removal)
  without confirming — this is deliberate product behavior implemented in
  `recalculateSeriesStatus` (`userEpisodes.controller.js`), not incidental
  logic.
- Don't touch `.env` or commit secrets (`JWT_SECRET`, `TMDB_API_KEY`,
  `DATABASE_URL`) into any tracked file.
- Don't hand-edit an already-applied migration file — add a new one.
- Don't introduce an ORM or migration framework without discussion — see
  DECISIONS.md for why raw SQL + manual migrations were chosen.

## Other docs

- `docs/ARCHITECTURE.md` — folder layout, data flow, request lifecycle.
- `docs/DECISIONS.md` — ADR-style log of why things are built this way.
- `docs/STATE.md` — what's done, in progress, known issues, session log. **Read
  this first.**
