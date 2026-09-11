/**
 * Defines shared metadata and the persistent productivity-style application shell.
 * Feature pages render beside route-aware navigation within the main workspace.
 */
import "@fontsource-variable/inter";
import type { Metadata } from "next";

import { AppSidebar } from "@/components/layout/AppSidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Assistant",
  description: "Local-first job discovery and application preparation",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  /** Render the common HTML document and primary application navigation. */
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white md:flex">
          <AppSidebar />
          <div className="min-w-0 flex-1">
            <header className="flex h-16 items-center justify-between border-b bg-white px-8 max-md:h-14 max-md:px-4">
              <span className="text-sm font-medium text-muted-foreground">Job search workspace</span>
              <span className="text-xs font-medium text-muted-foreground">Local development</span>
            </header>
            <main className="min-w-0 px-8 py-7 max-md:px-4 max-md:py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
