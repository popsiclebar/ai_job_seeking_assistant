"""Replaces job-bound applications with a standalone application tracker.

Applications now record company, title, link, source, dates, and notes directly so opportunities
from any job board can be tracked; linking to a collected job is optional.

Revision ID: 20261105_0002
Revises: 20260902_0001
Create Date: 2026-11-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20261105_0002"
down_revision: str | Sequence[str] | None = "20260902_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

tracker_status = postgresql.ENUM(
    "shortlisted",
    "applied",
    "interviewing",
    "offer",
    "rejected",
    name="application_status",
    create_type=False,
)
original_status = postgresql.ENUM(
    "active",
    "applied",
    "interview",
    "offer",
    "rejected",
    "expired",
    name="application_status",
    create_type=False,
)


def upgrade() -> None:
    """Drop the unused job-bound table and create the standalone tracker."""
    op.drop_table("applications")
    original_status.drop(op.get_bind(), checkfirst=True)
    op.drop_constraint("uq_raw_job_and_canonical_job", "raw_job_postings", type_="unique")

    tracker_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("company", sa.Text(), nullable=False),
        sa.Column("job_title", sa.Text(), nullable=False),
        sa.Column("status", tracker_status, server_default="shortlisted", nullable=False),
        sa.Column("applied_on", sa.Date(), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("job_url", sa.Text(), nullable=True),
        sa.Column("location", sa.Text(), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status = 'shortlisted' OR applied_on IS NOT NULL",
            name="ck_applications_applied_on_after_shortlist",
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id"),
    )
    op.create_index("ix_applications_status", "applications", ["status"])


def downgrade() -> None:
    """Restore the original job-bound applications table."""
    op.drop_index("ix_applications_status", table_name="applications")
    op.drop_table("applications")
    tracker_status.drop(op.get_bind(), checkfirst=True)

    op.create_unique_constraint(
        "uq_raw_job_and_canonical_job", "raw_job_postings", ["id", "job_id"]
    )
    original_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("raw_job_posting_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", original_status, server_default="active", nullable=False),
        sa.Column("application_date", sa.Date(), nullable=True),
        sa.Column("resume_html", sa.Text(), nullable=True),
        sa.Column("cover_letter_html", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["raw_job_posting_id", "job_id"],
            ["raw_job_postings.id", "raw_job_postings.job_id"],
            name="fk_application_source_for_job",
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id"),
    )
