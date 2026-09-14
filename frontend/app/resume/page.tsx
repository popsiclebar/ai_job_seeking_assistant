/**
 * Defines the HTML resume editing and preview route.
 * Browser printing will provide PDF output without another document format.
 */
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function ResumePage() {
  /** Render the Resume feature boundary until HTML editing is implemented. */
  return (
    <PlaceholderPage
      eyebrow="Resume"
      title="Prepare a focused resume"
      description="Edit and preview stable HTML documents before exporting them through the browser."
    />
  );
}
