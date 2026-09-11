/**
 * Defines the Jobs route for database-only search and detail review.
 * Provider ingestion deliberately remains outside the user-facing frontend.
 */
import { JobsWorkspace } from "@/features/jobs/JobsWorkspace";

export default function JobsPage() {
  /** Render the database-backed job collection and selected-job detail. */
  return <JobsWorkspace />;
}
