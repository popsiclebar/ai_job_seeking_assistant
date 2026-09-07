"""Verifies that live search results cross the persistence boundary before returning.
Provider transport and SQL details are mocked so the service contract stays deterministic."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.core.config import Settings
from app.integrations.jobtech.schemas import JobTechSearchResult
from app.schemas.jobs import JobSearchRequest
from app.services import job_search


@pytest.mark.asyncio
async def test_search_persists_raw_and_normalized_jobs_before_commit(monkeypatch) -> None:
    """Keep complete hit payloads and commit their normalized jobs in one service call."""
    source_result = JobTechSearchResult.model_validate(
        {
            "total": {"value": 1},
            "positions": 1,
            "hits": [
                {
                    "id": "job-123",
                    "headline": "Data Engineer",
                    "description": {"text": "Build reliable pipelines."},
                    "provider_only": {"retained": True},
                }
            ],
        }
    )
    client = AsyncMock()
    client.__aenter__.return_value = client
    client.search.return_value = source_result
    client_factory = Mock(return_value=client)
    upsert = AsyncMock()
    session = SimpleNamespace(commit=AsyncMock())
    monkeypatch.setattr(job_search, "JobTechClient", client_factory)
    monkeypatch.setattr(job_search, "upsert_jobs", upsert)

    response = await job_search.search_jobtech_jobs(
        JobSearchRequest(query="data engineer", limit=1),
        Settings(_env_file=None),
        session,
    )

    assert response.jobs[0].source_job_id == "job-123"
    raw_payloads = upsert.await_args.args[2]
    assert raw_payloads[("jobtech", "job-123")]["provider_only"] == {"retained": True}
    session.commit.assert_awaited_once()
