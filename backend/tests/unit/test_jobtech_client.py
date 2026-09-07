"""Verifies JobTech request construction without using the network.
The test protects query and pagination behavior at the provider boundary."""

import httpx
import pytest

from app.integrations.jobtech.client import JobTechClient


@pytest.mark.asyncio
async def test_search_passes_pagination_and_query() -> None:
    """Confirm search controls and optional authentication reach JobTech unchanged."""

    async def handler(request: httpx.Request) -> httpx.Response:
        """Inspect the outgoing request and return a representative source payload."""
        assert request.url.path == "/search"
        assert request.url.params["q"] == "data engineer"
        assert request.url.params["limit"] == "5"
        assert request.url.params["offset"] == "10"
        assert request.url.params["sort"] == "pubdate-desc"
        assert request.url.params["remote"] == "true"
        assert request.url.params["experience"] == "false"
        assert request.headers["api-key"] == "test-key"
        return httpx.Response(
            200,
            json={
                "total": {"value": 1},
                "hits": [
                    {
                        "id": "job-1",
                        "headline": "Data Engineer",
                        "provider_only": {"nested": True},
                    }
                ],
                "new_provider_field": "retained",
            },
        )

    async with JobTechClient(
        base_url="https://jobtech.example",
        timeout_seconds=1,
        api_key="test-key",
        transport=httpx.MockTransport(handler),
    ) as client:
        result = await client.search(
            query="data engineer",
            limit=5,
            offset=10,
            sort="pubdate-desc",
            remote=True,
            experience_required=False,
        )

    assert result.total.value == 1
    assert result.hits[0].model_dump(mode="json", exclude_unset=True)["provider_only"] == {
        "nested": True
    }
    assert result.model_extra == {"new_provider_field": "retained"}
