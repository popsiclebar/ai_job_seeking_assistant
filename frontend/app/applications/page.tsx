/**
 * Defines the application-tracking route.
 * It will present submitted jobs and their small, explicit status model.
 */
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function ApplicationsPage() {
  /** Render the Applications feature boundary until tracking is implemented. */
  return (
    <PlaceholderPage
      eyebrow="Applications"
      title="Track every application"
      description="Application status, dates, and next actions will live here once persistence is connected."
    />
  );
}
