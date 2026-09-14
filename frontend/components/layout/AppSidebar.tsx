/**
 * Owns responsive product navigation and the route-aware active state.
 * Desktop uses a quiet fixed rail; mobile uses an accessible modal drawer.
 */
"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  ListChecks,
  Menu,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job search", href: "/jobs", icon: Search },
  { label: "Applications", href: "/applications", icon: ListChecks },
  { label: "Resume & CV", href: "/resume", icon: FileText },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

function Brand() {
  /** Render the text-first product identity shared by both navigation modes. */
  return (
    <Link
      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold tracking-[-0.01em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      href="/"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <BriefcaseBusiness aria-hidden="true" size={15} strokeWidth={2} />
      </span>
      <span>AI Job Assistant</span>
    </Link>
  );
}

function NavigationLinks({ closeOnNavigate = false }: { closeOnNavigate?: boolean }) {
  /** Render workflow links with a stable and explicit current-page treatment. */
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Workspace
      </p>
      {primaryNavigation.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === href : pathname.startsWith(href);
        const link = (
          <Link
            aria-current={active ? "page" : undefined}
            className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              active
                ? "bg-surface-selected font-medium text-primary"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
            href={href}
          >
            {active ? (
              <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
            ) : null}
            <Icon aria-hidden="true" size={18} strokeWidth={active ? 2 : 1.7} />
            {label}
          </Link>
        );

        return closeOnNavigate ? (
          <Dialog.Close key={href} nativeButton={false} render={link} />
        ) : (
          <span key={href}>{link}</span>
        );
      })}
    </nav>
  );
}

function SettingsLink({ closeOnNavigate = false }: { closeOnNavigate?: boolean }) {
  /** Render the settings destination at the foot of either navigation surface. */
  const pathname = usePathname();
  const active = pathname.startsWith("/settings");
  const link = (
    <Link
      aria-current={active ? "page" : undefined}
      className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        active
          ? "bg-surface-selected font-medium text-primary"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
      href="/settings"
    >
      {active ? (
        <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
      ) : null}
      <Settings aria-hidden="true" size={18} strokeWidth={active ? 2 : 1.7} />
      Settings
    </Link>
  );

  return closeOnNavigate ? <Dialog.Close nativeButton={false} render={link} /> : link;
}

export function AppSidebar() {
  /** Compose the permanent desktop rail and compact mobile drawer. */
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 md:flex">
        <Brand />
        <div className="mt-6">
          <NavigationLinks />
        </div>
        <div className="mt-auto pt-3">
          <SettingsLink />
        </div>
      </aside>

      <Dialog.Root>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-3 md:hidden">
          <Brand />
          <Dialog.Trigger
            aria-label="Open navigation"
            className="grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Menu aria-hidden="true" size={20} />
          </Dialog.Trigger>
        </header>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex justify-start">
            <Dialog.Popup className="flex h-full w-[min(86vw,320px)] flex-col border-r border-border bg-sidebar px-3 py-4 shadow-[0_8px_24px_rgb(9_9_17_/_0.08)] transition-transform duration-200 data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
              <Dialog.Title className="sr-only">Product navigation</Dialog.Title>
              <Dialog.Description className="sr-only">
                Choose a workspace section.
              </Dialog.Description>
              <div className="flex items-center justify-between">
                <Brand />
                <Dialog.Close
                  aria-label="Close navigation"
                  className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X aria-hidden="true" size={20} />
                </Dialog.Close>
              </div>
              <div className="mt-6">
                <NavigationLinks closeOnNavigate />
              </div>
              <div className="mt-auto border-t border-border pt-3">
                <SettingsLink closeOnNavigate />
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
