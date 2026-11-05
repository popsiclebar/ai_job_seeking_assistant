"""Applies application-tracker rules and owns tracker transactions.
Status changes stamp the application date so every submitted application stays datable."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Application, ApplicationStatus
from app.schemas.applications import ApplicationCreate, ApplicationUpdate

TRACKER_TIMEZONE = ZoneInfo("Europe/Stockholm")
REQUIRED_TEXT_FIELDS = ("company", "job_title")


class ApplicationValidationError(ValueError):
    """Signal a tracker change that breaks a business rule rather than a field format."""


def today_in_tracker_timezone() -> date:
    """Return the calendar date the user experiences, independent of the server clock zone."""
    return datetime.now(TRACKER_TIMEZONE).date()


def ensure_applied_on(application: Application) -> None:
    """Stamp today's date when an application leaves the shortlist without a recorded date."""
    if application.status != ApplicationStatus.SHORTLISTED and application.applied_on is None:
        application.applied_on = today_in_tracker_timezone()


async def create_application(session: AsyncSession, data: ApplicationCreate) -> Application:
    """Persist one new tracked opportunity and return its stored state."""
    values = data.model_dump()
    values["job_url"] = str(data.job_url) if data.job_url else None
    values["company"] = data.company.strip()
    values["job_title"] = data.job_title.strip()
    application = Application(**values)
    ensure_applied_on(application)
    session.add(application)
    await session.commit()
    await session.refresh(application)
    return application


async def update_application(
    session: AsyncSession,
    application: Application,
    changes: ApplicationUpdate,
) -> Application:
    """Apply only the fields the caller sent, then re-check the application-date rule."""
    values = changes.model_dump(exclude_unset=True)
    for field in REQUIRED_TEXT_FIELDS:
        if field in values and not (values[field] or "").strip():
            raise ApplicationValidationError(f"{field} cannot be empty.")
    if values.get("job_url") is not None:
        values["job_url"] = str(values["job_url"])

    for field, value in values.items():
        setattr(application, field, value.strip() if field in REQUIRED_TEXT_FIELDS else value)
    ensure_applied_on(application)
    await session.commit()
    await session.refresh(application)
    return application


async def delete_application(session: AsyncSession, application: Application) -> None:
    """Remove one tracked application permanently."""
    await session.delete(application)
    await session.commit()
