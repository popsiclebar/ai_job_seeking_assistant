"""Defines the public request and normalized response contracts for job discovery.
These models shield frontend consumers from JobTech-specific field names and nesting."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class JobSearchRequest(BaseModel):
    """Describe one user-initiated JobTech search and its source pagination."""

    query: str = Field(min_length=1, max_length=200, examples=["data engineer Stockholm"])
    limit: int = Field(default=10, ge=1, le=100)
    offset: int = Field(default=0, ge=0, le=2000)
    sort: Literal[
        "relevance",
        "pubdate-desc",
        "pubdate-asc",
        "applydate-desc",
        "applydate-asc",
        "updated",
    ] = "relevance"
    remote: bool | None = None
    experience_required: bool | None = None


class JobSummary(BaseModel):
    """Represent the source-independent job fields needed by the first UI and later pipeline."""

    source: Literal["jobtech"] = "jobtech"
    source_job_id: str
    title: str
    company: str | None
    location: str | None
    description: str
    employment_start: str | None
    employment_type: str | None
    working_hours: str | None
    duration: str | None
    workplace_model: str | None
    occupation: str | None
    published_at: datetime | None
    application_deadline: datetime | None
    job_url: str | None
    application_url: str | None
    number_of_vacancies: int | None
    experience_required: bool | None
    relevance: float | None


class JobSearchResponse(BaseModel):
    """Return normalized jobs together with stable pagination and source timing metadata."""

    query: str
    total: int
    total_positions: int
    limit: int
    offset: int
    next_offset: int | None
    source_query_time_ms: int | None
    source_result_time_ms: int | None
    jobs: list[JobSummary]
