# Backend

The backend is a FastAPI modular monolith for job discovery, normalization, persistence, application preparation, and job-search workflows. It keeps deterministic application code, external integrations, database access, and AI reasoning behind explicit internal boundaries.

## Responsibilities

- Expose versioned HTTP APIs to the frontend.
- Retrieve job advertisements through source-specific integrations such as JobTech.
- Normalize and deduplicate provider data into canonical jobs.
- Persist raw postings, normalized jobs, and application state in PostgreSQL.
- Coordinate bounded workflows for fit evaluation and application preparation.
- Provide candidate and job-market retrieval capabilities as later milestones are added.

## Structure

```text
app/
├── api/             HTTP routes and request boundaries
├── services/        Application use cases
├── workflows/       Deterministic multi-step processes
├── repositories/    Persistence operations
├── database/        SQLAlchemy models and sessions
├── integrations/    JobTech, OpenAI, and other external providers
├── agents/          Reasoning components
├── knowledge/       Candidate and job-market retrieval
└── schemas/         Public API contracts
```

Alembic migrations under `alembic/` are the source of truth for PostgreSQL schema changes. API schemas remain separate from ORM models so storage details do not leak into frontend contracts.

## Current API

- `GET /api/v1/health`
- `POST /api/v1/jobs/search`

The search endpoint retrieves a live JobTech page, upserts each complete source payload into
`raw_job_postings`, and refreshes its linked normalized row in `jobs`. Repeating a search updates
the same source identities instead of creating duplicates. Stored-job read endpoints remain a
later milestone.

## Development

The backend requires Python 3.12 and PostgreSQL. With local environment variables configured, install `requirements-dev.txt`, apply migrations with `alembic upgrade head`, and start the application with:

```bash
python -m uvicorn app.main:app --reload
```

Interactive OpenAPI documentation is available at `/docs` while the server is running. Broader architecture is documented in [`../docs/architecture.md`](../docs/architecture.md); service-specific documentation will live under `docs/` as those modules are implemented.
