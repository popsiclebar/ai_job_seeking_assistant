/**
 * Presents a paginated opportunity queue optimized for rapid comparison.
 * Each selectable row keeps identity, location, work mode, and dates visible without narrow columns.
 */
"use client";

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { StoredJobPage } from "./types";

type JobResultsProps = {
  jobPage: StoredJobPage | null;
  listState: "loading" | "ready" | "error";
  offset: number;
  pageSize: number;
  selectedJobId: string | null;
  onPageChange: (offset: number) => void;
  onSelect: (jobId: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-SE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function JobResults({
  jobPage,
  listState,
  offset,
  pageSize,
  selectedJobId,
  onPageChange,
  onSelect,
}: JobResultsProps) {
  /** Render result states, accessible selection, and offset-based navigation. */
  const pageStart = jobPage && jobPage.total > 0 ? jobPage.offset + 1 : 0;
  const pageEnd = jobPage ? Math.min(jobPage.offset + jobPage.jobs.length, jobPage.total) : 0;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]" aria-busy={listState === "loading"} aria-label="Job results">
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <div>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Opportunities</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Select a role to review the full posting.</p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{pageStart}–{pageEnd}</span>
      </header>

      {listState === "loading" ? (
        <div className="divide-y divide-border" aria-label="Loading jobs">
          {[0, 1, 2, 3, 4].map((item) => (
            <div className="h-[92px] px-4 py-4" key={item}>
              <div className="h-4 w-3/5 animate-pulse rounded bg-surface-hover" />
              <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-surface-hover" />
              <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-surface-hover" />
            </div>
          ))}
        </div>
      ) : null}

      {listState === "error" ? (
        <div className="px-5 py-14" role="alert">
          <p className="text-sm font-medium text-foreground">Stored jobs could not be loaded.</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Check that the backend is running, then submit the search again.</p>
        </div>
      ) : null}

      {listState === "ready" && jobPage?.jobs.length === 0 ? (
        <div className="px-5 py-14">
          <p className="text-sm font-medium text-foreground">No matching opportunities</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Broaden the filters and search again.</p>
        </div>
      ) : null}

      {listState === "ready" ? (
        <div>
          {jobPage?.jobs.map((job) => {
            const selected = selectedJobId === job.id;
            return (
              <button
                aria-pressed={selected}
                className={`relative block min-h-[92px] w-full border-b border-border px-4 py-3.5 text-left transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                  selected ? "bg-surface-selected" : "bg-surface hover:bg-surface-hover"
                }`}
                key={job.id}
                onClick={() => onSelect(job.id)}
                type="button"
              >
                {selected ? <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-primary" /> : null}
                <span className="flex items-start justify-between gap-4">
                  <span className="min-w-0">
                    <strong className={`block truncate text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`} title={job.title}>{job.title}</strong>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground" title={job.company ?? undefined}>{job.company ?? "Company not provided"}</span>
                  </span>
                  {job.work_mode ? (
                    <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground capitalize">{job.work_mode.replace("_", "-")}</span>
                  ) : null}
                </span>
                <span className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">{job.location ?? "Location not provided"}</span>
                  </span>
                  <span aria-hidden="true" className="ml-auto text-border">•</span>
                  <time className="shrink-0 tabular-nums" dateTime={job.published_at ?? undefined}>
                    {job.published_at ? dateFormatter.format(new Date(job.published_at)) : "Date unavailable"}
                  </time>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <footer className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground">
        <span className="tabular-nums">Showing {pageStart}–{pageEnd} of {jobPage?.total ?? 0}</span>
        <div className="flex gap-1">
          <Button aria-label="Previous results page" disabled={offset === 0 || listState === "loading"} onClick={() => onPageChange(Math.max(0, offset - pageSize))} size="icon" type="button" variant="ghost">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button aria-label="Next results page" disabled={jobPage?.next_offset === null || listState === "loading"} onClick={() => onPageChange(jobPage?.next_offset ?? offset)} size="icon" type="button" variant="ghost">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </footer>
    </section>
  );
}
