/**
 * Renders a truthful overview of the current job-search workspace.
 * Live opportunities receive priority while unbuilt workflows remain explicitly unavailable.
 */
"use client";

import { ArrowRight, BriefcaseBusiness, CalendarClock, FileText, ListChecks } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listStoredJobs } from "@/features/jobs/api";
import type { StoredJobFilters, StoredJobPage } from "@/features/jobs/types";

const dashboardFilters: StoredJobFilters = {
  query: "",
  location: "",
  workMode: "",
  publishedWithinDays: "",
  includeExpired: false,
  sort: "published_desc",
};

const dateFormatter = new Intl.DateTimeFormat("en-SE", {
  day: "numeric",
  month: "short",
});

export default function DashboardPage() {
  /** Load a small current opportunity snapshot and compose the overview around real records. */
  const [jobPage, setJobPage] = useState<StoredJobPage | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    /** Read only enough recent jobs to support the overview and its live total. */
    const controller = new AbortController();
    listStoredJobs(dashboardFilters, 0, 5, controller.signal)
      .then((page) => {
        setJobPage(page);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, []);

  const metrics = [
    {
      label: "Available jobs",
      value: state === "ready" ? String(jobPage?.total ?? 0) : "—",
      context: state === "error" ? "Could not refresh" : "Active collected roles",
      tint: "bg-metric-blue",
    },
    {
      label: "Applications",
      value: "—",
      context: "Tracking not connected yet",
      tint: "bg-metric-lavender",
    },
    {
      label: "Interviews",
      value: "—",
      context: "Not available yet",
      tint: "bg-metric-sage",
    },
    {
      label: "Upcoming deadlines",
      value: "—",
      context: "Application data required",
      tint: "bg-metric-blush",
    },
  ];

  return (
    <section>
      <header className="flex min-h-14 items-start justify-between gap-6 max-sm:flex-col">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Today’s focus</p>
          <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.025em] text-foreground">
            Your job search at a glance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review fresh opportunities and keep the next useful action visible.
          </p>
        </div>
        <Link
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#174B89] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/jobs"
        >
          Browse jobs
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>

      <div className="mt-5 grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-[480px]:grid-cols-1">
        {metrics.map((metric) => (
          <article className={`flex min-h-28 flex-col justify-between rounded-[10px] p-4 ${metric.tint}`} key={metric.label}>
            <p className="text-sm font-medium text-body">{metric.label}</p>
            <div>
              <p className="text-[28px] leading-[34px] font-medium tracking-[-0.025em] text-foreground tabular-nums">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.context}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 max-lg:grid-cols-1">
        <article className="col-span-8 min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(9_9_17_/_0.025)] max-lg:col-span-1">
          <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Fresh opportunities</h2>
              <p className="mt-1 text-xs text-muted-foreground">Recently published roles in your collected job pool.</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/jobs">
              All jobs <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </header>

          {state === "loading" ? (
            <div className="grid gap-px border-t border-border bg-border" aria-label="Loading opportunities">
              {[0, 1, 2, 3].map((item) => (
                <div className="flex h-16 items-center gap-4 bg-surface px-5" key={item}>
                  <span className="h-4 w-2/5 animate-pulse rounded bg-surface-hover" />
                  <span className="ml-auto h-3 w-20 animate-pulse rounded bg-surface-hover" />
                </div>
              ))}
            </div>
          ) : null}

          {state === "error" ? (
            <div className="border-t border-border px-5 py-10" role="alert">
              <p className="text-sm font-medium text-foreground">Opportunities could not be refreshed.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check that the backend is running, then open Job search to try again.</p>
            </div>
          ) : null}

          {state === "ready" && jobPage?.jobs.length === 0 ? (
            <div className="border-t border-border px-5 py-10">
              <p className="text-sm font-medium text-foreground">No active jobs are available.</p>
              <p className="mt-1 text-sm text-muted-foreground">Collected opportunities will appear here after the next backend ingestion.</p>
            </div>
          ) : null}

          {state === "ready" && jobPage?.jobs.length ? (
            <div className="border-t border-border">
              {jobPage.jobs.map((job) => (
                <Link className="grid min-h-16 grid-cols-[minmax(0,1.5fr)_minmax(120px,0.8fr)_auto] items-center gap-4 border-b border-border px-5 py-3 text-sm transition-colors last:border-b-0 hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring max-sm:grid-cols-[minmax(0,1fr)_auto]" href="/jobs" key={job.id}>
                  <span className="min-w-0">
                    <strong className="block truncate font-medium text-foreground">{job.title}</strong>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{job.company ?? "Company not provided"}</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground max-sm:hidden">{job.location ?? "Location not provided"}</span>
                  <time className="text-xs text-muted-foreground tabular-nums" dateTime={job.published_at ?? undefined}>
                    {job.published_at ? dateFormatter.format(new Date(job.published_at)) : "Date unavailable"}
                  </time>
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="col-span-4 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(9_9_17_/_0.025)] max-lg:col-span-1">
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">Next steps</h2>
          <p className="mt-1 text-xs text-muted-foreground">Build the evidence that makes future matching useful.</p>
          <div className="mt-4 divide-y divide-border">
            <Link className="group flex items-center gap-3 py-4 first:pt-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/profile">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-metric-sage text-success"><ListChecks aria-hidden="true" className="size-4" /></span>
              <span className="min-w-0"><strong className="block text-sm font-medium text-foreground">Complete your profile</strong><span className="mt-0.5 block text-xs text-muted-foreground">Add role and location preferences</span></span>
              <ArrowRight aria-hidden="true" className="ml-auto size-4 text-disabled transition-colors group-hover:text-primary" />
            </Link>
            <Link className="group flex items-center gap-3 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/resume">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-metric-lavender text-primary"><FileText aria-hidden="true" className="size-4" /></span>
              <span className="min-w-0"><strong className="block text-sm font-medium text-foreground">Prepare your resume</strong><span className="mt-0.5 block text-xs text-muted-foreground">Resume editing is coming next</span></span>
              <ArrowRight aria-hidden="true" className="ml-auto size-4 text-disabled transition-colors group-hover:text-primary" />
            </Link>
            <Link className="group flex items-center gap-3 py-4 last:pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/applications">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-metric-blue text-primary"><BriefcaseBusiness aria-hidden="true" className="size-4" /></span>
              <span className="min-w-0"><strong className="block text-sm font-medium text-foreground">Track an application</strong><span className="mt-0.5 block text-xs text-muted-foreground">Available after tracking is connected</span></span>
              <CalendarClock aria-hidden="true" className="ml-auto size-4 text-disabled" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
