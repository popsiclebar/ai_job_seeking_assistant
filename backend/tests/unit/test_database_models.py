"""Checks the persistence metadata without requiring a running PostgreSQL service.
These tests protect the accepted table boundaries and identity constraints."""

from sqlalchemy import UniqueConstraint

from app.database.base import Base
from app.database.models import ApplicationStatus


def test_database_metadata_contains_three_job_domain_tables() -> None:
    """Keep raw source data, canonical jobs, and applications in separate tables."""
    assert set(Base.metadata.tables) == {"applications", "jobs", "raw_job_postings"}


def test_raw_postings_have_source_identity_and_published_date() -> None:
    """Ensure source deduplication and posting age remain available to ingestion."""
    table = Base.metadata.tables["raw_job_postings"]
    unique_columns = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }

    assert "published_at" in table.columns
    assert ("source", "source_job_id") in unique_columns
    assert "content_hash" not in table.columns


def test_application_status_matches_tracker_lifecycle() -> None:
    """Keep the five tracker statuses; ghosted and withdrawn outcomes are recorded as rejected."""
    assert [status.value for status in ApplicationStatus] == [
        "shortlisted",
        "applied",
        "interviewing",
        "offer",
        "rejected",
    ]


def test_applications_do_not_require_a_collected_job() -> None:
    """Allow tracking applications found on any job board, not only ingested listings."""
    table = Base.metadata.tables["applications"]

    assert table.columns["job_id"].nullable is True
    assert table.columns["company"].nullable is False
    assert table.columns["job_title"].nullable is False
