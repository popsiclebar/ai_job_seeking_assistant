"""Verifies HTTP contracts for persisted job browsing.
Database behavior is replaced so API tests remain deterministic."""

from datetime import UTC, datetime
from types import SimpleNamespace
from uuid import UUID

from fastapi.testclient import TestClient

from app.api.routes import jobs as jobs_route
from app.main import app


def test_live_ingestion_is_not_a_public_api() -> None:
    """Keep provider ingestion outside the unauthenticated browser surface."""
    response = TestClient(app).post(
        "/api/v1/jobs/search",
        json={"query": "data engineer Stockholm"},
    )

    assert response.status_code == 405


def test_read_jobs_returns_filtered_database_page(monkeypatch) -> None:
    """Confirm browsing delegates validated filters and returns stable pagination metadata."""
    job_id = UUID("00000000-0000-0000-0000-000000000001")
    published_at = datetime(2026, 9, 8, 8, 30, tzinfo=UTC)
    stored_job = SimpleNamespace(
        id=job_id,
        title="Data Engineer",
        company="Example AB",
        location="Stockholm, Sweden",
        employment_start="As soon as possible",
        employment_type="permanent_employment",
        work_schedule="full_time",
        work_mode="hybrid",
        published_at=published_at,
        application_deadline=None,
        application_url="https://example.test/apply",
    )

    async def fake_list_jobs(session, **filters):
        """Return one stored record while exposing filter arguments to the assertion."""
        assert filters == {
            "query": "data engineer",
            "location": "Stockholm",
            "work_mode": "hybrid",
            "employment_type": None,
            "work_schedule": "full_time",
            "published_since": datetime(2026, 9, 1, tzinfo=UTC),
            "include_expired": False,
            "sort": "published_desc",
            "limit": 1,
            "offset": 0,
        }
        return [stored_job], 2

    monkeypatch.setattr(jobs_route, "list_jobs", fake_list_jobs)
    response = TestClient(app).get(
        "/api/v1/jobs",
        params={
            "query": "data engineer",
            "location": "Stockholm",
            "work_mode": "hybrid",
            "work_schedule": "full_time",
            "published_since": "2026-09-01T00:00:00Z",
            "limit": 1,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "total": 2,
        "limit": 1,
        "offset": 0,
        "next_offset": 1,
        "jobs": [
            {
                "id": str(job_id),
                "title": "Data Engineer",
                "company": "Example AB",
                "location": "Stockholm, Sweden",
                "employment_start": "As soon as possible",
                "employment_type": "permanent_employment",
                "work_schedule": "full_time",
                "work_mode": "hybrid",
                "published_at": "2026-09-08T08:30:00Z",
                "application_deadline": None,
                "application_url": "https://example.test/apply",
            }
        ],
    }


def test_read_job_returns_description_and_sources(monkeypatch) -> None:
    """Confirm the detail endpoint exposes the normalized JD and provider identity."""
    job_id = UUID("00000000-0000-0000-0000-000000000001")
    retrieved_at = datetime(2026, 9, 8, 9, 0, tzinfo=UTC)
    stored_job = SimpleNamespace(
        id=job_id,
        title="AI Engineer",
        company="Example AB",
        location="Stockholm, Sweden",
        job_description="Build useful AI systems.",
        employment_start=None,
        employment_type="permanent_employment",
        work_schedule="full_time",
        work_mode=None,
        published_at=None,
        application_deadline=None,
        application_url=None,
    )
    source = SimpleNamespace(
        source="jobtech",
        source_job_id="job-123",
        source_url="https://example.test/jobs/job-123",
        published_at=None,
        retrieved_at=retrieved_at,
    )

    async def fake_get_job_with_sources(session, requested_job_id):
        """Return a canonical job and source without opening PostgreSQL."""
        assert requested_job_id == job_id
        return stored_job, [source]

    monkeypatch.setattr(jobs_route, "get_job_with_sources", fake_get_job_with_sources)
    response = TestClient(app).get(f"/api/v1/jobs/{job_id}")

    assert response.status_code == 200
    assert response.json()["job_description"] == "Build useful AI systems."
    assert response.json()["sources"] == [
        {
            "source": "jobtech",
            "source_job_id": "job-123",
            "source_url": "https://example.test/jobs/job-123",
            "published_at": None,
            "retrieved_at": "2026-09-08T09:00:00Z",
        }
    ]


def test_read_job_returns_not_found(monkeypatch) -> None:
    """Return a clear 404 when a canonical UUID does not exist."""

    async def fake_get_job_with_sources(session, job_id):
        """Represent a missing database record."""
        return None

    monkeypatch.setattr(jobs_route, "get_job_with_sources", fake_get_job_with_sources)
    response = TestClient(app).get("/api/v1/jobs/00000000-0000-0000-0000-000000000099")

    assert response.status_code == 404
    assert response.json() == {"detail": "Job not found."}


def test_read_jobs_rejects_invalid_filters() -> None:
    """Reject unsupported work modes and pagination before querying PostgreSQL."""
    client = TestClient(app)

    assert client.get("/api/v1/jobs", params={"work_mode": "sometimes"}).status_code == 422
    assert client.get("/api/v1/jobs", params={"limit": 101}).status_code == 422
    assert (
        client.get(
            "/api/v1/jobs",
            params={"published_since": "2026-09-01T00:00:00"},
        ).status_code
        == 422
    )
