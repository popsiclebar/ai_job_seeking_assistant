# Architecture

## Shape

The application uses a monorepo containing two deployable applications:

```text
Next.js frontend -> FastAPI backend -> PostgreSQL
                                    -> JobTech
                                    -> OpenAI
```

The backend is a modular monolith. Its dependency direction is:

```text
API routes
  -> application services and workflows
  -> repositories and provider interfaces
  -> PostgreSQL, JobTech, and OpenAI adapters
```

Routes validate and serialize HTTP data. They do not contain business logic. Deterministic tasks use ordinary Python services and workflows. LangGraph is reserved for bounded reasoning workflows.

## Knowledge domains

Candidate knowledge and collected-job knowledge are intentionally separate:

- Candidate retrieval supplies truthful evidence about skills and experience.
- Job-market retrieval supports semantic search and analysis across collected job descriptions.

An individual fit evaluation receives the selected job description directly and may retrieve candidate evidence. Historical job retrieval must not redefine that job's requirements.

Both domains may later share chunking, embedding, PostgreSQL full-text search, and pgvector infrastructure.

## Job persistence

Job data is divided by responsibility:

- `raw_job_postings` retains the latest complete payload and publication date for each source identity.
- `jobs` holds deduplicated, source-independent fields used for filtering and evaluation.
- `applications` holds the user's status and application-specific documents.

Each raw posting belongs to at most one canonical job, while one canonical job may collect listings from several sources. Source identity is enforced by `(source, source_job_id)`; cross-source matching remains conservative so uncertain advertisements are not merged.

Controlled canonical fields use stable English values derived from provider taxonomy identities.
Source-language labels and all other provider fields remain unchanged in the raw payload.

## Future extraction

If agent workloads become long-running or require separate scaling, an agent worker can be added as another runtime entry point using the same backend package. A separate service should only be introduced when deployment, scaling, isolation, or ownership requirements justify it.
