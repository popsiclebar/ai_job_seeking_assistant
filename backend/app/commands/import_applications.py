"""Imports an existing Excel application tracker into the applications table.
The import is idempotent: rows already stored with the same company, title, and date are skipped."""

import argparse
import asyncio
from collections.abc import Iterable
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook
from pydantic import ValidationError

from app.database.models import Application, ApplicationStatus
from app.database.session import close_database, session_factory
from app.repositories.applications import find_duplicate
from app.schemas.applications import ApplicationCreate

EXPECTED_HEADER = (
    "Date",
    "Job Title",
    "Company",
    "Status",
    "Job Link",
    "Location",
    "Source",
    "Notes",
)
STATUS_LABELS = {
    "shortlisted": ApplicationStatus.SHORTLISTED,
    "applied": ApplicationStatus.APPLIED,
    "interview": ApplicationStatus.INTERVIEWING,
    "interviewing": ApplicationStatus.INTERVIEWING,
    "offer": ApplicationStatus.OFFER,
    "rejected": ApplicationStatus.REJECTED,
    "ghosted": ApplicationStatus.REJECTED,
    "withdrawn": ApplicationStatus.REJECTED,
}
# Spelling variants of the same job board collapse to one name so source statistics stay accurate.
SOURCE_ALIASES = {
    "arbetsformedlingen": "Platsbanken",
    "arbetsförmedlingen": "Platsbanken",
    "platsbanken": "Platsbanken",
    "ledigajobb.se": "Ledigajobb",
    "ledigajobb": "Ledigajobb",
}


def parse_tracker_rows(
    rows: Iterable[tuple[object, ...]],
) -> tuple[list[ApplicationCreate], list[str]]:
    """Convert spreadsheet rows (header first) into validated applications and row errors."""
    iterator = iter(rows)
    header = tuple(str(cell).strip() if cell is not None else "" for cell in next(iterator, ()))
    if header[: len(EXPECTED_HEADER)] != EXPECTED_HEADER:
        raise ValueError(f"Unexpected header {header!r}; expected {EXPECTED_HEADER!r}.")

    applications: list[ApplicationCreate] = []
    errors: list[str] = []
    for row_number, row in enumerate(iterator, start=2):
        cells = [cell.strip() if isinstance(cell, str) else cell for cell in row[:8]]
        cells += [None] * (8 - len(cells))
        applied, title, company, status_label, link, location, source, notes = cells
        if not any(cells):
            continue

        status = STATUS_LABELS.get(str(status_label or "").strip().lower())
        if status is None:
            errors.append(f"row {row_number}: unknown status {status_label!r}")
            continue
        if isinstance(applied, datetime):
            applied = applied.date()
        source_text = str(source).strip() if source else None
        try:
            applications.append(
                ApplicationCreate(
                    company=str(company or ""),
                    job_title=str(title or ""),
                    status=status,
                    applied_on=applied if isinstance(applied, date) else None,
                    job_url=link or None,
                    location=location or None,
                    source=SOURCE_ALIASES.get(source_text.lower(), source_text)
                    if source_text
                    else None,
                    notes=notes or None,
                )
            )
        except ValidationError as error:
            fields = ", ".join(str(item["loc"][0]) for item in error.errors())
            errors.append(f"row {row_number}: invalid {fields}")
    return applications, errors


async def import_applications(path: Path, sheet: str) -> None:
    """Load one worksheet and insert every application that is not already stored."""
    workbook = load_workbook(path, read_only=True, data_only=True)
    applications, errors = parse_tracker_rows(workbook[sheet].iter_rows(values_only=True))
    workbook.close()

    inserted = skipped = 0
    try:
        async with session_factory() as session:
            for item in applications:
                if await find_duplicate(
                    session,
                    company=item.company,
                    job_title=item.job_title,
                    applied_on=item.applied_on,
                ):
                    skipped += 1
                    continue
                values = item.model_dump()
                values["job_url"] = str(item.job_url) if item.job_url else None
                session.add(Application(**values))
                await session.flush()
                inserted += 1
            await session.commit()
    finally:
        await close_database()

    print(f"Imported {inserted} applications, skipped {skipped} already stored.")
    for error in errors:
        print(f"Not imported: {error}")


def main() -> None:
    """Parse the workbook path and run the import."""
    parser = argparse.ArgumentParser(description="Import an Excel application tracker.")
    parser.add_argument("path", type=Path, help="Path to the .xlsx tracker.")
    parser.add_argument("--sheet", default="Full-time", help="Worksheet name to import.")
    arguments = parser.parse_args()
    asyncio.run(import_applications(arguments.path, arguments.sheet))


if __name__ == "__main__":
    main()
