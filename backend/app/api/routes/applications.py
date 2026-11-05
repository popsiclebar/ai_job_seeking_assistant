"""Exposes the personal application tracker over HTTP.
Routes validate requests and map tracker rules to HTTP errors; services own persistence."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Application, ApplicationStatus
from app.database.session import get_database_session
from app.repositories.applications import get_application, list_applications
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationRead,
    ApplicationSort,
    ApplicationUpdate,
)
from app.services.applications import (
    ApplicationValidationError,
    create_application,
    delete_application,
    update_application,
)

router = APIRouter(prefix="/applications", tags=["applications"])
DatabaseSession = Annotated[AsyncSession, Depends(get_database_session)]


async def load_application(application_id: UUID, session: DatabaseSession) -> Application:
    """Resolve the path identity to a stored application or answer 404."""
    application = await get_application(session, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
    return application


@router.get("", response_model=ApplicationListResponse)
async def read_applications(
    session: DatabaseSession,
    status_filter: Annotated[ApplicationStatus | None, Query(alias="status")] = None,
    query: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    sort: ApplicationSort = "recent",
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0, le=100000)] = 0,
) -> ApplicationListResponse:
    """List tracked applications with optional status and text filters."""
    applications, total, status_counts = await list_applications(
        session,
        status=status_filter,
        query=query,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    next_offset = offset + len(applications) if offset + len(applications) < total else None
    return ApplicationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        next_offset=next_offset,
        status_counts=status_counts,
        applications=[ApplicationRead.model_validate(item) for item in applications],
    )


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def add_application(data: ApplicationCreate, session: DatabaseSession) -> ApplicationRead:
    """Track a new shortlisted or submitted application."""
    return ApplicationRead.model_validate(await create_application(session, data))


@router.patch("/{application_id}", response_model=ApplicationRead)
async def edit_application(
    changes: ApplicationUpdate,
    session: DatabaseSession,
    application: Annotated[Application, Depends(load_application)],
) -> ApplicationRead:
    """Change status, dates, or details of one tracked application."""
    try:
        updated = await update_application(session, application, changes)
    except ApplicationValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    return ApplicationRead.model_validate(updated)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_application(
    session: DatabaseSession,
    application: Annotated[Application, Depends(load_application)],
) -> Response:
    """Delete one tracked application, for example one added by mistake."""
    await delete_application(session, application)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
