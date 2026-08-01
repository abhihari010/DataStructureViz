# Testing and operations

## Local verification

Run these commands from the repository root. They do not require production
credentials; backend tests use the H2 test profile and the Judge0 tests use a
local HTTP mock.

```powershell
Set-Location backend
mvn -B test

Set-Location ..\client
npm ci
npm test
npm run check
npm run build
```

The client build should keep its largest uncompressed JavaScript asset below
700 kB. The same check runs in GitHub Actions. Maven Surefire output and CI
client/audit logs are retained as workflow artifacts when available.

## Environment and Judge0

Keep runtime values in deployment-provider environment variables or the
ignored `backend/src/main/resources/application-local.properties`. Never put
database credentials, `JWT_SECRET`, mail credentials, or Judge0/RapidAPI keys
in source control or any `VITE_*` client variable.

Required backend values are:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | Database credentials |
| `JWT_SECRET` | JWT signing secret |
| `JUDGE0_API_URL` | Judge0 submission endpoint |
| `JUDGE0_API_KEY` / `JUDGE0_API_HOST` | RapidAPI credentials when using RapidAPI |
| `FRONTEND_URL` | Allowed frontend origin |

Mailjet variables are needed only for email verification and password reset.
Use a local/self-hosted Judge0 URL and omit the RapidAPI headers for local
development when appropriate. Tests must continue to mock Judge0 so they do
not consume paid provider quota.

## Deployment and health checks

The backend is configured for Fly.io in `backend/fly.toml`. Configure the
environment variables above as Fly secrets or environment variables, deploy
the backend image, and use `GET /api/health` for liveness. Use
`GET /api/health/readiness` for deployment diagnostics: database failure
returns HTTP 503, while Judge0 is reported as `DEGRADED` and does not block
basic readiness. The Fly health check already uses the readiness endpoint.

Review the retained dependency reports on every CI run. Treat high or critical
client audit findings and unexpected dependency-tree changes as release
blocking until they are upgraded, explicitly accepted with an owner, or
removed.

## Progress data compatibility

Flyway V3 adds missing columns for databases created by the former Hibernate
`ddl-auto` workflow and removes duplicate legacy topic-progress rows before
adding the `(user_id, topic_id)` uniqueness constraint. New verified
submissions update both the per-problem learning loop and the legacy topic
aggregate. Existing topic-level completion is not inferred into individual
problems because that mapping cannot be proven safely; per-problem history
starts when a learner drafts, runs, or submits that problem after deployment.
