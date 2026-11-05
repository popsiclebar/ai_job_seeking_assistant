/**
 * Defines the Applications route for tracking roles from shortlist to outcome.
 * The feature module owns data loading and editing; this file only mounts it.
 */
import { ApplicationsWorkspace } from "@/features/applications/ApplicationsWorkspace";

export default function ApplicationsPage() {
  /** Render the database-backed application tracker. */
  return <ApplicationsWorkspace />;
}
