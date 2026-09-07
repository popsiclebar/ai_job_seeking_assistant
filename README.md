# AI Job Seeking Assistant

A local-first application for discovering Swedish jobs, evaluating job fit, preparing truthful HTML application documents, and tracking applications.

The current executable slice contains a FastAPI backend, typed JobTech ingestion into PostgreSQL, and a Next.js frontend.

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
npm install
npm run dev
```

Then open `http://localhost:3000`. Backend API documentation is available at `http://localhost:8000/docs`.

Run a first persisted search with:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/jobs/search \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "data engineer Stockholm",
    "limit": 5,
    "offset": 0,
    "sort": "pubdate-desc"
  }'
```

See [backend/README.md](backend/README.md) for backend boundaries and the current API surface.

## Current scope

Same-source ingestion and normalization are working end to end. Stored-job retrieval, cross-source matching, preference-based discovery, fit evaluation, document generation, and application tracking interfaces remain upcoming milestones.

See [docs/architecture.md](docs/architecture.md) for the public module boundaries. Detailed decisions, plans, and progress are maintained locally in the ignored `.agents/` directory.
