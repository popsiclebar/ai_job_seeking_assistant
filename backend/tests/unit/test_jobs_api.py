"""Verifies the FastAPI contract for manual normalized job search.
Provider behavior is replaced so the test covers HTTP validation without network access."""

from fastapi.testclient import TestClient

from app.api.routes import jobs as jobs_route
from app.main import app
from app.schemas.jobs import JobSearchResponse


def test_search_jobs_returns_normalized_response(monkeypatch) -> None:
    """Confirm a valid request is delegated and serialized through the public endpoint."""

    async def fake_search_jobtech_jobs(search_request, settings, session) -> JobSearchResponse:
        """Return an empty normalized page while preserving validated request metadata."""
        return JobSearchResponse(
            query=search_request.query,
            total=0,
            total_positions=0,
            limit=search_request.limit,
            offset=search_request.offset,
            next_offset=None,
            source_query_time_ms=1,
            source_result_time_ms=2,
            jobs=[],
        )

    monkeypatch.setattr(jobs_route, "search_jobtech_jobs", fake_search_jobtech_jobs)
    response = TestClient(app).post(
        "/api/v1/jobs/search",
        json={"query": "data engineer Stockholm", "limit": 5, "offset": 0},
    )

    assert response.status_code == 200
    assert response.json() == {
        "query": "data engineer Stockholm",
        "total": 0,
        "total_positions": 0,
        "limit": 5,
        "offset": 0,
        "next_offset": None,
        "source_query_time_ms": 1,
        "source_result_time_ms": 2,
        "jobs": [],
    }


def test_search_jobs_rejects_invalid_pagination() -> None:
    """Confirm invalid source offsets fail before any JobTech request is attempted."""
    response = TestClient(app).post(
        "/api/v1/jobs/search",
        json={"query": "data engineer", "offset": 2001},
    )

    assert response.status_code == 422
