/**
 * Defines shared metadata and the persistent productivity-style application shell.
 * Feature pages render beside route-aware navigation within the main workspace.
 */
import "@fontsource-variable/inter";
import type { Metadata } from "next";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

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
        <div className="min-h-screen bg-canvas md:flex">
          <AppSidebar />
          <div className="min-w-0 flex-1">
            <AppTopbar />
            <main className="mx-auto min-w-0 max-w-[1488px] px-6 py-6 max-lg:px-5 max-md:px-4 max-md:py-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
