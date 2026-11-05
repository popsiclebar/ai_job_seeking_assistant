"""Verifies HTTP contracts and status rules for the application tracker.
Database access is replaced so tests stay deterministic without PostgreSQL."""

from datetime import UTC, date, datetime
from types import SimpleNamespace
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.api.routes import applications as applications_route
from app.database.models import Application, ApplicationStatus
from app.main import app
from app.schemas.applications import ApplicationUpdate
from app.services import applications as applications_service

APPLICATION_ID = UUID("00000000-0000-0000-0000-0000000000a1")
TIMESTAMP = datetime(2026, 11, 5, 9, 0, tzinfo=UTC)


def stored_application(**overrides: object) -> SimpleNamespace:
    """Build one stored application record with realistic defaults."""
    values: dict[str, object] = {
        "id": APPLICATION_ID,
        "job_id": None,
        "company": "Everi Labs",
        "job_title": "Software Developer",
        "status": ApplicationStatus.APPLIED,
        "applied_on": date(2026, 11, 5),
        "deadline": date(2026, 11, 6),
        "job_url": "https://example.test/ad/1",
        "location": "Stockholm",
        "source": "Platsbanken",
        "notes": None,
        "created_at": TIMESTAMP,
        "updated_at": TIMESTAMP,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_list_applications_returns_page_and_status_counts(monkeypatch) -> None:
    """Expose per-status totals so the frontend can render status tabs from one request."""

    async def fake_list(session, **filters):
        """Return one row and assert validated filters reach the repository."""
        assert filters == {
            "status": ApplicationStatus.APPLIED,
            "query": "everi",
            "sort": "recent",
            "limit": 1,
            "offset": 0,
        }
        counts = {status: 0 for status in ApplicationStatus}
        counts[ApplicationStatus.APPLIED] = 2
        return [stored_application()], 2, counts

    monkeypatch.setattr(applications_route, "list_applications", fake_list)
    response = TestClient(app).get(
        "/api/v1/applications", params={"status": "applied", "query": "everi", "limit": 1}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert body["next_offset"] == 1
    assert body["status_counts"]["applied"] == 2
    assert body["status_counts"]["shortlisted"] == 0
    assert body["applications"][0]["company"] == "Everi Labs"


def test_unknown_status_filter_is_rejected() -> None:
    """Accept only the five tracker statuses; ghosted is recorded as rejected."""
    response = TestClient(app).get("/api/v1/applications", params={"status": "ghosted"})

    assert response.status_code == 422


def test_create_requires_company_and_title() -> None:
    """Refuse applications that cannot be identified later."""
    response = TestClient(app).post("/api/v1/applications", json={"company": "Ericsson"})

    assert response.status_code == 422


def test_update_returns_404_for_missing_application(monkeypatch) -> None:
    """Answer 404 instead of creating or silently ignoring unknown applications."""

    async def fake_get(session, application_id):
        """Simulate an identity that is not stored."""
        return None

    monkeypatch.setattr(applications_route, "get_application", fake_get)
    response = TestClient(app).patch(
        f"/api/v1/applications/{APPLICATION_ID}", json={"status": "rejected"}
    )

    assert response.status_code == 404


def test_leaving_shortlist_stamps_todays_date(monkeypatch) -> None:
    """Record when an application was submitted even if the user did not enter a date."""
    monkeypatch.setattr(
        applications_service, "today_in_tracker_timezone", lambda: date(2026, 11, 5)
    )
    application = Application(
        company="Ericsson", job_title="Storage DevSecOps Engineer", status="applied"
    )

    applications_service.ensure_applied_on(application)

    assert application.applied_on == date(2026, 11, 5)


def test_shortlisted_application_keeps_empty_date() -> None:
    """Leave shortlisted opportunities undated until they are actually submitted."""
    application = Application(
        company="EA", job_title="Software Engineer", status=ApplicationStatus.SHORTLISTED
    )

    applications_service.ensure_applied_on(application)

    assert application.applied_on is None


async def test_update_rejects_blank_company() -> None:
    """Keep every tracked application identifiable after edits; the rule fails before any I/O."""
    application = Application(company="Ericsson", job_title="Engineer", status="applied")

    with pytest.raises(applications_service.ApplicationValidationError, match="company"):
        await applications_service.update_application(
            None,  # type: ignore[arg-type]
            application,
            ApplicationUpdate(company="  "),
        )
