"""Combines all versioned API route modules.
Keeping registration here gives the application one explicit HTTP entry point."""

from fastapi import APIRouter

from app.api.routes import applications, health, jobs

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
