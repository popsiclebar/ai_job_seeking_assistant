"""Verifies deterministic conversion from JobTech fields to the public job schema.
The fixture is synthetic so tests remain stable and contain no third-party contact data."""

from app.integrations.jobtech.normalizer import normalize_search_result
from app.integrations.jobtech.schemas import JobTechSearchResult
from app.schemas.jobs import JobSearchRequest


def test_normalize_search_result_maps_job_and_pagination() -> None:
    """Confirm useful source fields and the next offset survive normalization."""
    source_result = JobTechSearchResult.model_validate(
        {
            "total": {"value": 12},
            "positions": 14,
            "query_time_in_millis": 3,
            "result_time_in_millis": 8,
            "hits": [
                {
                    "id": "job-123",
                    "headline": "Data Engineer",
                    "access": "As soon as possible",
                    "relevance": 0.91,
                    "webpage_url": "https://example.test/jobs/job-123",
                    "application_deadline": "2026-10-01T23:59:59",
                    "number_of_vacancies": 2,
                    "description": {"text": "Build reliable data pipelines."},
                    "employment_type": {
                        "concept_id": "kpPX_CNN_gDU",
                        "label": "Tillsvidareanställning",
                    },
                    "working_hours_type": {
                        "concept_id": "6YE1_gAC_R2G",
                        "label": "Heltid",
                    },
                    "duration": {"label": "Tills vidare"},
                    "employer": {"name": "Example AB"},
                    "application_details": {"url": "https://example.test/apply"},
                    "experience_required": True,
                    "occupation": {"label": "Dataingenjör"},
                    "workplace_model": {"label": "Hybrid"},
                    "workplace_address": {
                        "city": "Stockholm",
                        "municipality": "Stockholm",
                        "region": "Stockholms län",
                        "country": "Sverige",
                    },
                    "publication_date": "2026-09-01T08:30:00",
                }
            ],
        }
    )
    search_request = JobSearchRequest(query="data engineer Stockholm", limit=1, offset=0)

    result = normalize_search_result(source_result, search_request)

    assert result.total == 12
    assert result.total_positions == 14
    assert result.next_offset == 1
    assert result.jobs[0].source_job_id == "job-123"
    assert result.jobs[0].company == "Example AB"
    assert result.jobs[0].location == "Stockholm, Stockholms län, Sverige"
    assert result.jobs[0].employment_start == "As soon as possible"
    assert result.jobs[0].employment_type == "permanent_employment"
    assert result.jobs[0].working_hours == "full_time"
    assert result.jobs[0].application_url == "https://example.test/apply"
