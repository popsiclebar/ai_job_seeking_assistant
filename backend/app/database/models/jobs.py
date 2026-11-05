"""Defines source, canonical job, and personal application persistence models.
Raw provider fidelity stays separate from normalized job and workflow state."""

import uuid
from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ApplicationStatus(StrEnum):
    """Track one opportunity from shortlist to outcome.

    Ghosted and withdrawn applications are recorded as rejected because the outcome is the same."""

    SHORTLISTED = "shortlisted"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"


class Job(Base):
    """Represent one normalized real-world opportunity shared by source listings."""

    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint(
            "work_mode IS NULL OR work_mode IN ('on_site', 'hybrid', 'remote')",
            name="ck_jobs_work_mode",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    company: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(Text)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    employment_start: Mapped[str | None] = mapped_column(Text)
    employment_type: Mapped[str | None] = mapped_column(Text)
    work_schedule: Mapped[str | None] = mapped_column(Text)
    work_mode: Mapped[str | None] = mapped_column(String(20))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    application_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    application_url: Mapped[str | None] = mapped_column(Text)


class RawJobPosting(Base):
    """Retain the latest complete payload for one source-specific job listing."""

    __tablename__ = "raw_job_postings"
    __table_args__ = (
        UniqueConstraint("source", "source_job_id", name="uq_raw_job_source_identity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        index=True,
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    source_job_id: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    retrieved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    raw_payload: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False)


class Application(Base):
    """Track one opportunity the user shortlisted or applied to, from any job source.

    The optional job link connects applications to collected jobs without requiring that every
    application originate from an ingested provider listing."""

    __tablename__ = "applications"
    __table_args__ = (
        CheckConstraint(
            "status = 'shortlisted' OR applied_on IS NOT NULL",
            name="ck_applications_applied_on_after_shortlist",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        unique=True,
    )
    company: Mapped[str] = mapped_column(Text, nullable=False)
    job_title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(
            ApplicationStatus,
            name="application_status",
            values_callable=lambda statuses: [status.value for status in statuses],
        ),
        nullable=False,
        index=True,
        default=ApplicationStatus.SHORTLISTED,
        server_default=ApplicationStatus.SHORTLISTED.value,
    )
    applied_on: Mapped[date | None] = mapped_column(Date)
    deadline: Mapped[date | None] = mapped_column(Date)
    job_url: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
