/**
 * Defines the candidate-profile and preference route.
 * This feature will own the truthful evidence used by retrieval and fit evaluation.
 */
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function ProfilePage() {
  /** Render the Profile feature boundary until candidate editing is implemented. */
  return (
    <PlaceholderPage
      eyebrow="Candidate profile"
      title="Keep your evidence accurate"
      description="Your experience, skills, and preferences will become the evidence used for job-fit evaluation."
    />
  );
}
