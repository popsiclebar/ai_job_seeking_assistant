"""Coordinates live JobTech discovery, normalization, and durable ingestion.
The service commits one complete search page before returning it to the caller."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.integrations.jobtech.client import JobTechClient
from app.integrations.jobtech.normalizer import normalize_search_result
from app.repositories.jobs import upsert_jobs
from app.schemas.jobs import JobSearchRequest, JobSearchResponse


async def search_jobtech_jobs(
    search_request: JobSearchRequest,
    settings: Settings,
    session: AsyncSession,
) -> JobSearchResponse:
    """Fetch, persist, and return one normalized page of JobTech advertisements."""
    async with JobTechClient(
        base_url=settings.jobtech_base_url,
        timeout_seconds=settings.jobtech_timeout_seconds,
        api_key=settings.jobtech_api_key,
    ) as client:
        source_result = await client.search(
            query=search_request.query,
            limit=search_request.limit,
            offset=search_request.offset,
            sort=search_request.sort,
            remote=search_request.remote,
            experience_required=search_request.experience_required,
        )
    response = normalize_search_result(source_result, search_request)
    raw_payloads = {
        ("jobtech", hit.id): hit.model_dump(mode="json", exclude_unset=True)
        for hit in source_result.hits
    }
    await upsert_jobs(session, response.jobs, raw_payloads)
    await session.commit()
    return response
