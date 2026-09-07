"""Transforms JobTech advertisements into the application's stable job contract.
Normalization is deterministic and contains no ranking, persistence, or AI behavior."""

from app.integrations.jobtech.schemas import JobTechSearchResult
from app.schemas.jobs import JobSearchRequest, JobSearchResponse, JobSummary

EMPLOYMENT_TYPE_BY_CONCEPT_ID = {
    "1paU_aCR_nGn": "on_demand_employment",
    "EBhX_Qm2_8eX": "seasonal_employment",
    "gro4_cWF_6D7": "substitute_employment",
    "kpPX_CNN_gDU": "permanent_employment",
    "sTu5_NBQ_udq": "fixed_term_employment",
    "PFZr_Syz_cUq": "regular_employment",
}
WORK_SCHEDULE_BY_CONCEPT_ID = {
    "6YE1_gAC_R2G": "full_time",
    "947z_JGS_Uk2": "part_time",
}


def normalize_search_result(
    source_result: JobTechSearchResult,
    search_request: JobSearchRequest,
) -> JobSearchResponse:
    """Normalize one JobTech result page and calculate the next valid source offset."""
    jobs: list[JobSummary] = []
    for hit in source_result.hits:
        address = hit.workplace_address
        location_parts: list[str] = []
        if address:
            for value in (address.city or address.municipality, address.region, address.country):
                if value and value not in location_parts:
                    location_parts.append(value)

        jobs.append(
            JobSummary(
                source_job_id=hit.id,
                title=hit.headline,
                company=hit.employer.name if hit.employer else None,
                location=", ".join(location_parts) or None,
                description=hit.description.text,
                employment_start=hit.access,
                employment_type=(
                    EMPLOYMENT_TYPE_BY_CONCEPT_ID.get(hit.employment_type.concept_id)
                    if hit.employment_type and hit.employment_type.concept_id
                    else None
                ),
                working_hours=(
                    WORK_SCHEDULE_BY_CONCEPT_ID.get(hit.working_hours_type.concept_id)
                    if hit.working_hours_type and hit.working_hours_type.concept_id
                    else None
                ),
                duration=hit.duration.label if hit.duration else None,
                workplace_model=hit.workplace_model.label if hit.workplace_model else None,
                occupation=hit.occupation.label if hit.occupation else None,
                published_at=hit.publication_date,
                application_deadline=hit.application_deadline,
                job_url=hit.webpage_url,
                application_url=(hit.application_details.url if hit.application_details else None),
                number_of_vacancies=hit.number_of_vacancies,
                experience_required=hit.experience_required,
                relevance=hit.relevance,
            )
        )

    candidate_offset = search_request.offset + len(jobs)
    next_offset = (
        candidate_offset
        if jobs and candidate_offset < source_result.total.value and candidate_offset <= 2000
        else None
    )
    return JobSearchResponse(
        query=search_request.query,
        total=source_result.total.value,
        total_positions=source_result.positions,
        limit=search_request.limit,
        offset=search_request.offset,
        next_offset=next_offset,
        source_query_time_ms=source_result.query_time_in_millis,
        source_result_time_ms=source_result.result_time_in_millis,
        jobs=jobs,
    )
