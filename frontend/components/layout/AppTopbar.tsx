/**
 * Supplies compact route context and a truthful workspace-status cue.
 * Route labels live here so the shared shell stays useful without repeating page copy.
 */
"use client";

import { CircleCheck } from "lucide-react";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/": "Overview",
  "/jobs": "Job search",
  "/applications": "Applications",
  "/resume": "Resume & CV",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function AppTopbar() {
  /** Render the current workspace section in the persistent desktop utility bar. */
  const pathname = usePathname();
  const route = Object.keys(routeLabels).find((href) =>
    href === "/" ? pathname === href : pathname.startsWith(href),
  );

  return (
    <header className="hidden h-14 items-center justify-between border-b border-border bg-surface px-6 md:flex">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Workspace</span>
        <span aria-hidden="true" className="text-disabled">/</span>
        <span className="font-semibold text-foreground">{routeLabels[route ?? "/"]}</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <CircleCheck aria-hidden="true" className="size-4 text-success" strokeWidth={1.8} />
        Personal workspace
      </div>
    </header>
  );
}
