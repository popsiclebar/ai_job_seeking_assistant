"""Exposes the user-initiated job discovery endpoint.
The route validates HTTP input and delegates provider work to the search service."""

from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.session import get_database_session
from app.schemas.jobs import JobSearchRequest, JobSearchResponse
from app.services.job_search import search_jobtech_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(
    search_request: JobSearchRequest,
    session: Annotated[AsyncSession, Depends(get_database_session)],
) -> JobSearchResponse:
    """Persist and return one normalized page of live JobTech advertisements."""
    try:
        return await search_jobtech_jobs(search_request, get_settings(), session)
    except (httpx.HTTPError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="JobTech did not return a usable response.",
        ) from exc
