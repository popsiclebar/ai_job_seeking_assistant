"""Runs one JobTech ingestion page as an internal backend operation.
This command is the local precursor to a scheduled production pipeline."""

import argparse
import asyncio

from app.core.config import get_settings
from app.database.session import close_database, session_factory
from app.schemas.jobs import JobSearchRequest
from app.services.job_search import search_jobtech_jobs


def build_parser() -> argparse.ArgumentParser:
    """Define explicit operator inputs for one bounded ingestion run."""
    parser = argparse.ArgumentParser(description="Fetch and store one JobTech result page.")
    parser.add_argument("--query", required=True, help="JobTech free-text query.")
    parser.add_argument("--limit", type=int, default=100, help="Results to process, from 1 to 100.")
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Source result offset, from 0 to 2000.",
    )
    parser.add_argument(
        "--sort",
        default="pubdate-desc",
        choices=(
            "relevance",
            "pubdate-desc",
            "pubdate-asc",
            "applydate-desc",
            "applydate-asc",
            "updated",
        ),
        help="JobTech result ordering.",
    )
    return parser


async def ingest_jobs(search_request: JobSearchRequest) -> None:
    """Execute and report one transactional provider-to-database ingestion."""
    try:
        async with session_factory() as session:
            result = await search_jobtech_jobs(search_request, get_settings(), session)
        print(
            f"Stored {len(result.jobs)} advertisements from "
            f"{result.total} JobTech matches for {result.query!r}."
        )
    finally:
        await close_database()


def main() -> None:
    """Validate command-line arguments and run the asynchronous ingestion task."""
    arguments = build_parser().parse_args()
    asyncio.run(
        ingest_jobs(
            JobSearchRequest(
                query=arguments.query,
                limit=arguments.limit,
                offset=arguments.offset,
                sort=arguments.sort,
            )
        )
    )


if __name__ == "__main__":
    main()
