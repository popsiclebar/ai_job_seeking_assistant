/**
 * Displays the complete normalized job selected from the result table.
 * The panel exposes only stored facts and links retained from source postings.
 */
"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { StoredJobDetail as StoredJobDetailType } from "./types";

type JobDetailProps = {
  job: StoredJobDetailType | null;
  matchesSelection: boolean;
  selectedJobId: string | null;
  state: "loading" | "ready" | "error";
};

const dateFormatter = new Intl.DateTimeFormat("en-SE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function JobDetail({ job, matchesSelection, selectedJobId, state }: JobDetailProps) {
  /** Render selected-job loading, error, empty, and complete detail states. */
  if (!selectedJobId) {
    return (
      <article className="rounded-xl border border-border bg-surface px-6 py-14 text-center shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]">
        <p className="text-sm font-medium text-foreground">No job selected</p>
        <p className="mt-1 text-sm text-muted-foreground">Select an opportunity to review its description.</p>
      </article>
    );
  }
  if (state === "error") {
    return (
      <article className="rounded-xl border border-border bg-surface px-6 py-14 shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]">
        <p className="text-sm font-medium text-foreground">This job could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">Select the role again or refresh the page.</p>
      </article>
    );
  }
  if (state === "loading" || !matchesSelection || !job) {
    return (
      <article className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]" aria-label="Loading job details">
        <div className="h-3 w-32 animate-pulse rounded bg-surface-hover" />
        <div className="mt-4 h-7 w-3/4 animate-pulse rounded bg-surface-hover" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-surface-hover" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-surface-hover" />
      </article>
    );
  }

  return (
    <article className="min-w-0 rounded-xl border border-border bg-surface px-6 py-5 shadow-[0_1px_2px_rgb(9_9_17_/_0.025)] max-sm:px-4 min-[1200px]:sticky min-[1200px]:top-[72px] min-[1200px]:max-h-[calc(100vh-88px)] min-[1200px]:overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Selected opportunity</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{job.company ?? "Company not provided"}</p>
        </div>
        {job.work_mode ? (
          <Badge className="h-6 rounded-md border-border bg-surface-subtle px-2 text-muted-foreground capitalize" variant="outline">
            {job.work_mode.replace("_", "-")}
          </Badge>
        ) : null}
      </div>
      <h2 className="mt-3 text-2xl leading-8 font-semibold tracking-[-0.025em] text-foreground">{job.title}</h2>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin aria-hidden="true" className="size-4" />
          {job.location ?? "Location not provided"}
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <BriefcaseBusiness aria-hidden="true" className="size-4" />
          {job.employment_type?.replaceAll("_", " ") ?? "Employment type not provided"}
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Clock3 aria-hidden="true" className="size-4" />
          {job.work_schedule?.replaceAll("_", " ") ?? "Schedule not provided"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-4" />
          Deadline {job.application_deadline
            ? dateFormatter.format(new Date(job.application_deadline))
            : "not provided"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-border pb-5">
        {job.application_url ? (
          <a
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#174B89] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={job.application_url}
            rel="noreferrer"
            target="_blank"
          >
            Apply on source
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        ) : null}
        <time className="text-xs text-muted-foreground tabular-nums" dateTime={job.published_at ?? undefined}>
          Published {job.published_at ? dateFormatter.format(new Date(job.published_at)) : "date not provided"}
        </time>
      </div>

      <div className="pt-5">
        <h3 className="mb-3 text-sm font-semibold tracking-[-0.01em] text-foreground">Job description</h3>
        <p className="max-w-[75ch] whitespace-pre-wrap text-[15px] leading-6 text-body">
          {job.job_description}
        </p>
      </div>

      <div className="mt-7 border-t border-border pt-5">
        <h3 className="mb-4 text-sm font-semibold tracking-[-0.01em] text-foreground">Sources</h3>
        {job.sources.map((source) => (
          <div
            className="flex items-center justify-between gap-4 text-[13px]"
            key={`${source.source}-${source.source_job_id}`}
          >
            <span className="capitalize">{source.source}</span>
            {source.source_url ? (
              <a
                className="font-semibold text-primary hover:underline"
                href={source.source_url}
                rel="noreferrer"
                target="_blank"
              >
                View original posting
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
