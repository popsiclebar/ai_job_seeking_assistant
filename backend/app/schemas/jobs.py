"""Defines contracts for internal ingestion and persisted job browsing.
These models shield consumers from provider fields and database internals."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

StoredJobSort = Literal["published_desc", "published_asc", "deadline_asc"]


class JobSearchRequest(BaseModel):
    """Describe one backend-owned JobTech ingestion page."""

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


class StoredJob(BaseModel):
    """Expose the normalized fields needed to browse one persisted opportunity."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    company: str | None
    location: str | None
    employment_start: str | None
    employment_type: str | None
    work_schedule: str | None
    work_mode: Literal["on_site", "hybrid", "remote"] | None
    published_at: datetime | None
    application_deadline: datetime | None
    application_url: str | None


class StoredJobListResponse(BaseModel):
    """Return one stable page from the canonical jobs stored in PostgreSQL."""

    total: int
    limit: int
    offset: int
    next_offset: int | None
    jobs: list[StoredJob]


class StoredJobSource(BaseModel):
    """Identify one provider listing retained for a canonical opportunity."""

    model_config = ConfigDict(from_attributes=True)

    source: str
    source_job_id: str
    source_url: str | None
    published_at: datetime | None
    retrieved_at: datetime


class StoredJobDetail(StoredJob):
    """Expose the complete normalized JD and its available provider listings."""

    job_description: str
    sources: list[StoredJobSource]
