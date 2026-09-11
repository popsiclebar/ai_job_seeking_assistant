/**
 * Defines the frontend contracts for persisted job browsing.
 * These types mirror the database-backed FastAPI responses used by the Jobs workspace.
 */
export type WorkMode = "on_site" | "hybrid" | "remote";
export type JobSort = "published_desc" | "published_asc" | "deadline_asc";

export type StoredJob = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  employment_start: string | null;
  employment_type: string | null;
  work_schedule: string | null;
  work_mode: WorkMode | null;
  published_at: string | null;
  application_deadline: string | null;
  application_url: string | null;
};

export type StoredJobSource = {
  source: string;
  source_job_id: string;
  source_url: string | null;
  published_at: string | null;
  retrieved_at: string;
};

export type StoredJobDetail = StoredJob & {
  job_description: string;
  sources: StoredJobSource[];
};

export type StoredJobPage = {
  total: number;
  limit: number;
  offset: number;
  next_offset: number | null;
  jobs: StoredJob[];
};

export type StoredJobFilters = {
  query: string;
  location: string;
  workMode: "" | WorkMode;
  publishedWithinDays: "" | "7" | "14" | "30";
  includeExpired: boolean;
  sort: JobSort;
};
