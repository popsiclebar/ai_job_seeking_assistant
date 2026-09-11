/**
 * Owns browser calls for persisted job browsing.
 * The frontend never invokes provider ingestion or other operational workflows.
 */
import { apiRequest } from "@/lib/api/client";

import type { StoredJobDetail, StoredJobFilters, StoredJobPage } from "./types";

export async function listStoredJobs(
  filters: StoredJobFilters,
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<StoredJobPage> {
  /** Build the canonical-jobs query and read one database page. */
  const parameters = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort: filters.sort,
    include_expired: String(filters.includeExpired),
  });
  if (filters.query.trim()) parameters.set("query", filters.query.trim());
  if (filters.location.trim()) parameters.set("location", filters.location.trim());
  if (filters.workMode) parameters.set("work_mode", filters.workMode);
  if (filters.publishedWithinDays) {
    const publishedSince = new Date();
    publishedSince.setUTCDate(
      publishedSince.getUTCDate() - Number(filters.publishedWithinDays),
    );
    parameters.set("published_since", publishedSince.toISOString());
  }

  return apiRequest<StoredJobPage>(`/jobs?${parameters.toString()}`, { signal });
}

export async function getStoredJob(jobId: string, signal?: AbortSignal) {
  /** Read the complete normalized description and source records for one job. */
  return apiRequest<StoredJobDetail>(`/jobs/${jobId}`, { signal });
}
