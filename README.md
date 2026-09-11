# AI Job Seeking Assistant

A local-first application for discovering Swedish jobs, evaluating job fit, preparing truthful HTML application documents, and tracking applications.

The current executable slice contains a FastAPI backend, typed JobTech ingestion into PostgreSQL,
stored-job retrieval, and a Next.js job-review workspace.

## Repository layout

- `backend/` — FastAPI, deterministic workflows, agents, retrieval, and persistence.
- `frontend/` — Next.js dashboard and job/application/profile interfaces.
- `docs/` — public architecture and usage documentation.
- `.agents/` — ignored local decisions, plans, and progress notes.

The backend is a modular monolith. Agents, RAG, database access, and external integrations have explicit internal boundaries but share one deployable backend until independent scaling is justified.

## Safety

This repository is intended to be public. Never commit:

- API keys or `.env` files
- resumes or other personal documents
- fetched job payloads or local databases
- generated resumes, cover letters, or application exports

Use `.env.example` as the configuration template.

## Development

Backend:

```bash
cp .env.example .env
docker compose up -d postgres
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Then open `http://localhost:3000/jobs`. Backend API documentation is available at
`http://localhost:8000/docs`.

Run a first backend-owned ingestion with:

```bash
cd backend
source .venv/bin/activate
python -m app.commands.ingest_jobs --query "data engineer Stockholm" --limit 100
```

See [backend/README.md](backend/README.md) for backend boundaries and the current API surface.

## Current scope

Backend-owned same-source ingestion, normalization, stored-job retrieval, and the database-only Job
Search interface work end to end. Application tracking, scheduled ingestion, cross-source matching,
preference-based discovery, fit evaluation, and document generation remain upcoming milestones.

See [docs/architecture.md](docs/architecture.md) for the public module boundaries. Detailed decisions, plans, and progress are maintained locally in the ignored `.agents/` directory.
