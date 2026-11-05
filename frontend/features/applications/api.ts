/**
 * Owns browser calls for the application tracker.
 * Every function maps to one applications endpoint so components stay free of HTTP details.
 */
import { apiRequest } from "@/lib/api/client";

import type {
  Application,
  ApplicationFilters,
  ApplicationInput,
  ApplicationPage,
} from "./types";

export async function listApplications(
  filters: ApplicationFilters,
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<ApplicationPage> {
  /** Read one filtered tracker page together with per-status counts. */
  const parameters = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort: filters.sort,
  });
  if (filters.status) parameters.set("status", filters.status);
  if (filters.query.trim()) parameters.set("query", filters.query.trim());
  return apiRequest<ApplicationPage>(`/applications?${parameters.toString()}`, { signal });
}

export async function createApplication(input: ApplicationInput): Promise<Application> {
  /** Store a new shortlisted or submitted application. */
  return apiRequest<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateApplication(
  applicationId: string,
  changes: Partial<ApplicationInput>,
): Promise<Application> {
  /** Send only the changed fields of one application. */
  return apiRequest<Application>(`/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export async function deleteApplication(applicationId: string): Promise<void> {
  /** Remove one application permanently. */
  await apiRequest<void>(`/applications/${applicationId}`, { method: "DELETE" });
}
