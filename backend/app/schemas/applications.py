"""Defines HTTP contracts for the personal application tracker.
These models validate tracker input and keep ORM details out of frontend responses."""

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.database.models import ApplicationStatus

ApplicationSort = Literal["recent", "deadline_asc"]


class ApplicationFields(BaseModel):
    """Hold the user-editable facts shared by create requests and responses."""

    company: str = Field(min_length=1, max_length=200)
    job_title: str = Field(min_length=1, max_length=300)
    status: ApplicationStatus = ApplicationStatus.SHORTLISTED
    applied_on: date | None = None
    deadline: date | None = None
    job_url: str | None = Field(default=None, max_length=2000)
    location: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=100)
    notes: str | None = Field(default=None, max_length=5000)
    job_id: UUID | None = None


class ApplicationCreate(ApplicationFields):
    """Create one tracked opportunity; a link must be a valid absolute URL."""

    job_url: HttpUrl | None = None


class ApplicationUpdate(BaseModel):
    """Change any subset of fields; omitted fields keep their stored values."""

    company: str | None = Field(default=None, min_length=1, max_length=200)
    job_title: str | None = Field(default=None, min_length=1, max_length=300)
    status: ApplicationStatus | None = None
    applied_on: date | None = None
    deadline: date | None = None
    job_url: HttpUrl | None = None
    location: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=100)
    notes: str | None = Field(default=None, max_length=5000)


class ApplicationRead(ApplicationFields):
    """Expose one stored application with its identity and audit timestamps."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ApplicationListResponse(BaseModel):
    """Return one filtered page plus per-status totals for the tracker's status tabs."""

    total: int
    limit: int
    offset: int
    next_offset: int | None
    status_counts: dict[ApplicationStatus, int]
    applications: list[ApplicationRead]
