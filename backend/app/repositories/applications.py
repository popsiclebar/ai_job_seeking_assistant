"""Reads and writes tracked applications in PostgreSQL.
This repository owns tracker queries; status rules and transactions live in the service."""

from datetime import date
from uuid import UUID

from sqlalchemy import Date, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Application, ApplicationStatus
from app.schemas.applications import ApplicationSort


async def list_applications(
    session: AsyncSession,
    *,
    status: ApplicationStatus | None,
    query: str | None,
    sort: ApplicationSort,
    limit: int,
    offset: int,
) -> tuple[list[Application], int, dict[ApplicationStatus, int]]:
    """Return one filtered page, its total, and status counts for the same text query."""
    text_conditions = []
    if query:
        pattern = f"%{query.strip()}%"
        text_conditions.append(
            or_(
                Application.company.ilike(pattern),
                Application.job_title.ilike(pattern),
                Application.notes.ilike(pattern),
            )
        )

    counts_result = await session.execute(
        select(Application.status, func.count(Application.id))
        .where(*text_conditions)
        .group_by(Application.status)
    )
    status_counts = {status_value: 0 for status_value in ApplicationStatus}
    status_counts.update(dict(counts_result.tuples().all()))

    conditions = [*text_conditions]
    if status:
        conditions.append(Application.status == status)
    total = sum(status_counts[status] for status in ([status] if status else ApplicationStatus))

    if sort == "deadline_asc":
        order = (Application.deadline.asc().nullslast(), Application.created_at.desc())
    else:
        # Shortlisted rows have no application date, so their creation date keeps them in sequence.
        activity_date = func.coalesce(Application.applied_on, cast(Application.created_at, Date))
        order = (activity_date.desc(), Application.created_at.desc())

    rows = await session.execute(
        select(Application).where(*conditions).order_by(*order).limit(limit).offset(offset)
    )
    return list(rows.scalars().all()), total, status_counts


async def find_duplicate(
    session: AsyncSession,
    *,
    company: str,
    job_title: str,
    applied_on: date | None,
) -> Application | None:
    """Find an application with the same company, title, and date, ignoring letter case."""
    result = await session.execute(
        select(Application).where(
            func.lower(Application.company) == company.strip().lower(),
            func.lower(Application.job_title) == job_title.strip().lower(),
            Application.applied_on.is_(None)
            if applied_on is None
            else (Application.applied_on == applied_on),
        )
    )
    return result.scalars().first()


async def get_application(session: AsyncSession, application_id: UUID) -> Application | None:
    """Load one tracked application by identity."""
    return await session.get(Application, application_id)
