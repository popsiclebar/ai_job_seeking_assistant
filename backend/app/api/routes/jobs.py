"""Exposes persisted job browsing for collected opportunities.
Routes validate user queries while provider ingestion remains a backend-owned operation."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import AwareDatetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_database_session
from app.repositories.jobs import get_job_with_sources, list_jobs
from app.schemas.jobs import (
    StoredJob,
    StoredJobDetail,
    StoredJobListResponse,
    StoredJobSort,
    StoredJobSource,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=StoredJobListResponse)
async def read_jobs(
    session: Annotated[AsyncSession, Depends(get_database_session)],
    query: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    location: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    work_mode: Annotated[
        str | None,
        Query(pattern="^(on_site|hybrid|remote)$"),
    ] = None,
    employment_type: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    work_schedule: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    published_since: AwareDatetime | None = None,
    include_expired: bool = False,
    sort: StoredJobSort = "published_desc",
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0, le=10000)] = 0,
) -> StoredJobListResponse:
    """List canonical jobs already collected in PostgreSQL without contacting JobTech."""
    stored_jobs, total = await list_jobs(
        session,
        query=query,
        location=location,
        work_mode=work_mode,
        employment_type=employment_type,
        work_schedule=work_schedule,
        published_since=published_since,
        include_expired=include_expired,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    next_offset = offset + len(stored_jobs) if offset + len(stored_jobs) < total else None
    return StoredJobListResponse(
        total=total,
        limit=limit,
        offset=offset,
        next_offset=next_offset,
        jobs=[StoredJob.model_validate(job) for job in stored_jobs],
    )


@router.get("/{job_id}", response_model=StoredJobDetail)
async def read_job(
    job_id: UUID,
    session: Annotated[AsyncSession, Depends(get_database_session)],
) -> StoredJobDetail:
    """Return a complete canonical JD and every retained source listing for it."""
    result = await get_job_with_sources(session, job_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    job, sources = result
    stored_job = StoredJob.model_validate(job)
    return StoredJobDetail(
        **stored_job.model_dump(),
        job_description=job.job_description,
        sources=[StoredJobSource.model_validate(source) for source in sources],
    )
