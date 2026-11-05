/**
 * Defines the frontend contracts for the application tracker.
 * These types mirror the FastAPI applications responses and request bodies.
 */
export const applicationStatuses = [
  "shortlisted",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];
export type ApplicationSort = "recent" | "deadline_asc";

export const statusLabels: Record<ApplicationStatus, string> = {
  shortlisted: "Shortlisted",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export type Application = {
  id: string;
  job_id: string | null;
  company: string;
  job_title: string;
  status: ApplicationStatus;
  applied_on: string | null;
  deadline: string | null;
  job_url: string | null;
  location: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationPage = {
  total: number;
  limit: number;
  offset: number;
  next_offset: number | null;
  status_counts: Record<ApplicationStatus, number>;
  applications: Application[];
};

export type ApplicationInput = {
  company: string;
  job_title: string;
  status: ApplicationStatus;
  applied_on: string | null;
  deadline: string | null;
  job_url: string | null;
  location: string | null;
  source: string | null;
  notes: string | null;
};

export type ApplicationFilters = {
  status: "" | ApplicationStatus;
  query: string;
  sort: ApplicationSort;
};
