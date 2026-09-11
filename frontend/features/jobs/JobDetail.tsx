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
import { Button } from "@/components/ui/button";

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
      <article className="rounded-lg border px-6 py-14 text-center text-sm text-muted-foreground">
        Select a job to review its description.
      </article>
    );
  }
  if (state === "error") {
    return (
      <article className="rounded-lg border px-6 py-14 text-center text-sm text-destructive">
        This job could not be loaded.
      </article>
    );
  }
  if (state === "loading" || !matchesSelection || !job) {
    return (
      <article className="rounded-lg border px-6 py-14 text-center text-sm text-muted-foreground">
        Loading job details…
      </article>
    );
  }

  return (
    <article className="min-w-0 rounded-lg border px-6 py-5 max-sm:px-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold">{job.company ?? "Company not provided"}</p>
        <time className="shrink-0 text-xs text-muted-foreground" dateTime={job.published_at ?? undefined}>
          {job.published_at ? dateFormatter.format(new Date(job.published_at)) : "Date not provided"}
        </time>
      </div>
      <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.025em]">{job.title}</h2>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
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

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {job.application_url ? (
          <Button
            className="h-10 rounded-md"
            render={<a href={job.application_url} rel="noreferrer" target="_blank" />}
          >
            Open application
            <ExternalLink aria-hidden="true" data-icon="inline-end" />
          </Button>
        ) : null}
        {job.work_mode ? (
          <Badge className="capitalize" variant="outline">
            {job.work_mode.replace("_", "-")}
          </Badge>
        ) : null}
      </div>

      <div className="mt-6 border-t pt-5">
        <h3 className="mb-3 text-base font-semibold">Job description</h3>
        <p className="whitespace-pre-wrap text-base leading-7 text-neutral-700">
          {job.job_description}
        </p>
      </div>

      <div className="mt-7 border-t pt-5">
        <h3 className="mb-4 text-base font-semibold">Sources</h3>
        {job.sources.map((source) => (
          <div
            className="flex items-center justify-between gap-4 text-sm"
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
