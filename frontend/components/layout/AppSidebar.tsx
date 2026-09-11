/**
 * Renders the persistent product navigation and highlights the active workflow.
 * Desktop uses a fixed sidebar while mobile keeps the same routes in a compact row.
 */
"use client";

import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job Search", href: "/jobs", icon: Search },
  { label: "Applications", href: "/applications", icon: ListChecks },
  { label: "Resume & CV", href: "/resume", icon: FileText },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

export function AppSidebar() {
  /** Present stable workflow navigation with a route-aware active state. */
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[232px] shrink-0 flex-col border-r bg-white px-3 py-4 max-md:relative max-md:h-auto max-md:w-full max-md:border-r-0 max-md:border-b max-md:px-4 max-md:py-3">
      <Link
        className="flex items-center gap-3 rounded-md px-2 py-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground"
        href="/"
      >
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <BriefcaseBusiness aria-hidden="true" size={17} strokeWidth={2.2} />
        </span>
        <span>AI Job Assistant</span>
      </Link>

      <nav
        aria-label="Main navigation"
        className="mt-8 flex flex-col gap-1 max-md:mt-3 max-md:flex-row max-md:overflow-x-auto max-md:pb-1"
      >
        {primaryNavigation.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
        <Link
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden ${
            pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          href="/settings"
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
          Settings
        </Link>
      </nav>

      <div className="mt-auto border-t pt-3 max-md:hidden">
        <Link
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          href="/settings"
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
