"""Persists normalized jobs alongside their complete source-specific payloads.
The repository owns same-source upserts while cross-source matching remains separate."""

from datetime import UTC, datetime

from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Job, RawJobPosting
from app.schemas.jobs import JobSummary


async def upsert_jobs(
    session: AsyncSession,
    jobs: list[JobSummary],
    raw_payloads: dict[tuple[str, str], dict[str, object]],
) -> None:
    """Insert new source identities and refresh their linked canonical jobs on repeats."""
    if not jobs:
        return

    identities = {(job.source, job.source_job_id) for job in jobs}
    existing_rows = await session.execute(
        select(RawJobPosting, Job)
        .outerjoin(Job, RawJobPosting.job_id == Job.id)
        .where(tuple_(RawJobPosting.source, RawJobPosting.source_job_id).in_(identities))
    )
    existing = {
        (raw_posting.source, raw_posting.source_job_id): (raw_posting, canonical_job)
        for raw_posting, canonical_job in existing_rows
        if (raw_posting.source, raw_posting.source_job_id) in identities
    }
    retrieved_at = datetime.now(UTC)

    for job_summary in jobs:
        identity = (job_summary.source, job_summary.source_job_id)
        raw_posting, canonical_job = existing.get(identity, (None, None))

        workplace_label = (job_summary.workplace_model or "").casefold()
        work_mode = None
        if "hybrid" in workplace_label:
            work_mode = "hybrid"
        elif "remote" in workplace_label or "distans" in workplace_label:
            work_mode = "remote"
        elif any(term in workplace_label for term in ("on-site", "onsite", "plats")):
            work_mode = "on_site"

        canonical_values = {
            "title": job_summary.title,
            "company": job_summary.company,
            "location": job_summary.location,
            "job_description": job_summary.description,
            "employment_start": job_summary.employment_start,
            "employment_type": job_summary.employment_type,
            "work_schedule": job_summary.working_hours,
            "work_mode": work_mode,
            "published_at": job_summary.published_at,
            "application_deadline": job_summary.application_deadline,
            "application_url": job_summary.application_url or job_summary.job_url,
        }

        if canonical_job is None:
            canonical_job = Job(**canonical_values)
            session.add(canonical_job)
            await session.flush()
        else:
            for field, value in canonical_values.items():
                setattr(canonical_job, field, value)

        raw_values = {
            "job_id": canonical_job.id,
            "source_url": job_summary.job_url,
            "published_at": job_summary.published_at,
            "retrieved_at": retrieved_at,
            "raw_payload": raw_payloads[identity],
        }
        if raw_posting is None:
            session.add(
                RawJobPosting(
                    source=job_summary.source,
                    source_job_id=job_summary.source_job_id,
                    **raw_values,
                )
            )
        else:
            for field, value in raw_values.items():
                setattr(raw_posting, field, value)

    await session.flush()
