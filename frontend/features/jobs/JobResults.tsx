/**
 * Presents one paginated database result page as a compact selectable table.
 * Responsive rows retain the same facts when the desktop columns collapse.
 */
"use client";

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
  /** Render result states, selectable records, and offset-based navigation. */
  const pageStart = jobPage && jobPage.total > 0 ? jobPage.offset + 1 : 0;
  const pageEnd = jobPage ? Math.min(jobPage.offset + jobPage.jobs.length, jobPage.total) : 0;

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border" aria-busy={listState === "loading"}>
      <div className="grid grid-cols-[1.35fr_1fr_1.1fr_0.8fr_0.8fr] gap-3 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground max-md:hidden">
        <span>Role</span>
        <span>Company</span>
        <span>Location</span>
        <span>Published</span>
        <span>Deadline</span>
      </div>

      {listState === "loading" ? (
        <div className="px-5 py-14 text-center text-sm text-muted-foreground">Loading jobs…</div>
      ) : null}
      {listState === "error" ? (
        <div className="px-5 py-14 text-center text-sm text-destructive" role="alert">
          Stored jobs could not be loaded. Check that the backend is running.
        </div>
      ) : null}
      {listState === "ready" && jobPage?.jobs.length === 0 ? (
        <div className="px-5 py-14 text-center text-sm leading-6 text-muted-foreground">
          No collected jobs match these filters. Broaden the query and search again.
        </div>
      ) : null}

      {listState === "ready"
        ? jobPage?.jobs.map((job) => (
            <button
              aria-pressed={selectedJobId === job.id}
              className={`relative grid w-full grid-cols-[1.35fr_1fr_1.1fr_0.8fr_0.8fr] items-center gap-3 border-b px-4 py-3 text-left text-sm transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring max-md:flex max-md:flex-col max-md:items-start ${
                selectedJobId === job.id ? "bg-accent" : "bg-white hover:bg-muted/60"
              }`}
              key={job.id}
              onClick={() => onSelect(job.id)}
              type="button"
            >
              {selectedJobId === job.id ? (
                <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
              ) : null}
              <span className="min-w-0">
                <strong className="block leading-5 font-semibold">{job.title}</strong>
                <span className="mt-1 hidden text-xs text-muted-foreground max-md:block">
                  {job.company ?? "Company not provided"}
                </span>
              </span>
              <span className="truncate text-muted-foreground max-md:hidden">
                {job.company ?? "Not provided"}
              </span>
              <span className="min-w-0 text-muted-foreground">
                <span className="block truncate">{job.location ?? "Not provided"}</span>
                {job.work_mode ? (
                  <span className="mt-0.5 block text-xs capitalize">
                    {job.work_mode.replace("_", "-")}
                  </span>
                ) : null}
              </span>
              <time className="text-muted-foreground" dateTime={job.published_at ?? undefined}>
                {job.published_at ? dateFormatter.format(new Date(job.published_at)) : "—"}
              </time>
              <time
                className="text-muted-foreground"
                dateTime={job.application_deadline ?? undefined}
              >
                {job.application_deadline
                  ? dateFormatter.format(new Date(job.application_deadline))
                  : "—"}
              </time>
            </button>
          ))
        : null}

      <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {pageStart}–{pageEnd} of {jobPage?.total ?? 0} jobs
        </span>
        <div className="flex gap-1">
          <Button
            disabled={offset === 0 || listState === "loading"}
            onClick={() => onPageChange(Math.max(0, offset - pageSize))}
            size="sm"
            type="button"
            variant="ghost"
          >
            Previous
          </Button>
          <Button
            disabled={jobPage?.next_offset === null || listState === "loading"}
            onClick={() => onPageChange(jobPage?.next_offset ?? offset)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
