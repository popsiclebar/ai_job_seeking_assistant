"""Verifies conversion of Excel tracker rows into validated applications.
Rows are supplied in memory so the test needs neither a workbook nor a database."""

from datetime import date, datetime

import pytest

from app.commands.import_applications import EXPECTED_HEADER, parse_tracker_rows
from app.database.models import ApplicationStatus


def test_rows_map_to_applications_with_normalized_values() -> None:
    """Convert dates, statuses, links, and source spelling variants consistently."""
    rows = [
        EXPECTED_HEADER,
        (
            datetime(2026, 8, 24),
            "Junior Data Engineer",
            "Friday",
            "Applied",
            " https://arbetsformedlingen.se/platsbanken/annonser/31385429",
            "Stockholm",
            "Arbetsförmedlingen",
            None,
        ),
        (datetime(2026, 9, 3), "Software Engineer", "Pixelgen", "Rejected", None, None, None, None),
        (None, None, None, None, None, None, None, None),
    ]

    applications, errors = parse_tracker_rows(rows)

    assert errors == []
    assert len(applications) == 2
    first, second = applications
    assert first.applied_on == date(2026, 8, 24)
    assert first.status == ApplicationStatus.APPLIED
    assert str(first.job_url).startswith("https://arbetsformedlingen.se/")
    assert first.source == "Platsbanken"
    assert second.status == ApplicationStatus.REJECTED


def test_ghosted_and_withdrawn_are_recorded_as_rejected() -> None:
    """Treat every ended-without-offer outcome as rejected."""
    rows = [
        EXPECTED_HEADER,
        (datetime(2026, 5, 1), "Developer", "A", "Ghosted", None, None, None, None),
        (datetime(2026, 5, 2), "Developer", "B", "Withdrawn", None, None, None, None),
    ]

    applications, _ = parse_tracker_rows(rows)

    assert {item.status for item in applications} == {ApplicationStatus.REJECTED}


def test_invalid_rows_are_reported_not_imported() -> None:
    """Report unknown statuses and broken links with their spreadsheet row numbers."""
    rows = [
        EXPECTED_HEADER,
        (datetime(2026, 5, 1), "Developer", "A", "Maybe", None, None, None, None),
        (datetime(2026, 5, 2), "Developer", "B", "Applied", "not a url", None, None, None),
    ]

    applications, errors = parse_tracker_rows(rows)

    assert applications == []
    assert errors[0].startswith("row 2: unknown status")
    assert errors[1] == "row 3: invalid job_url"


def test_unexpected_header_is_rejected() -> None:
    """Refuse a worksheet whose columns do not match the tracker layout."""
    with pytest.raises(ValueError, match="Unexpected header"):
        parse_tracker_rows([("Company", "Title")])
