/**
 * Defines user-controlled search and global AI settings.
 * Secrets remain server-side and must never be placed in browser configuration.
 */
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function SettingsPage() {
  /** Render the Settings feature boundary until configuration forms are implemented. */
  return (
    <PlaceholderPage
      eyebrow="Settings"
      title="Control your workspace"
      description="Search criteria and model preferences will be managed here while secrets remain server-side."
    />
  );
}
