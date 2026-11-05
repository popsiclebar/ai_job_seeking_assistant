/**
 * Presents tracked applications as a comparable table with inline status changes.
 * Rows keep role, status, dates, and source visible; editing opens the full form.
 */
"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  applicationStatuses,
  statusLabels,
  type Application,
  type ApplicationPage,
  type ApplicationStatus,
} from "./types";

type ApplicationTableProps = {
  page: ApplicationPage | null;
  listState: "loading" | "ready" | "error";
  offset: number;
  pageSize: number;
  onEdit: (application: Application) => void;
  onPageChange: (offset: number) => void;
  onStatusChange: (application: Application, status: ApplicationStatus) => void;
};

const statusStyles: Record<ApplicationStatus, string> = {
  shortlisted: "border-border bg-surface-subtle text-muted-foreground",
  applied: "border-transparent bg-metric-blue text-primary",
  interviewing: "border-transparent bg-warning-soft text-warning",
  offer: "border-transparent bg-success-soft text-success",
  rejected: "border-transparent bg-danger-soft text-destructive",
};

const dateFormatter = new Intl.DateTimeFormat("en-SE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null): string {
  /** Show a calendar date without shifting it across time zones. */
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

function isDeadlineSoon(application: Application): boolean {
  /** Flag shortlisted roles whose deadline is today or within the next three days. */
  if (application.status !== "shortlisted" || !application.deadline) return false;
  const [year, month, day] = application.deadline.split("-").map(Number);
  const daysLeft = (new Date(year, month - 1, day).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000;
  return daysLeft >= 0 && daysLeft <= 3;
}

export function ApplicationTable({
  page,
  listState,
  offset,
  pageSize,
  onEdit,
  onPageChange,
  onStatusChange,
}: ApplicationTableProps) {
  /** Render loading, error, empty, and populated states with offset pagination. */
  const pageStart = page && page.total > 0 ? page.offset + 1 : 0;
  const pageEnd = page ? Math.min(page.offset + page.applications.length, page.total) : 0;

  return (
    <section
      aria-busy={listState === "loading"}
      aria-label="Applications"
      className="mt-4 min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]"
    >
      {listState === "error" ? (
        <div className="px-5 py-14" role="alert">
          <p className="text-sm font-medium text-foreground">Applications could not be loaded.</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Check that the backend is running, then reload the page.</p>
        </div>
      ) : null}

      {listState === "ready" && page?.applications.length === 0 ? (
        <div className="px-5 py-14">
          <p className="text-sm font-medium text-foreground">No applications match</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Change the status or search, or add an application.</p>
        </div>
      ) : null}

      {listState !== "error" && (listState === "loading" || (page?.applications.length ?? 0) > 0) ? (
        <div className="relative overflow-x-auto" role="region" aria-label="Applications table" tabIndex={0}>
          <table className="w-full min-w-[860px] border-collapse text-[13px] leading-5">
            <thead className="bg-surface-subtle text-left text-xs font-medium text-muted-foreground">
              <tr className="h-10 border-b border-border">
                <th className="px-4 font-medium" scope="col">Role</th>
                <th className="px-4 font-medium" scope="col">Status</th>
                <th className="px-4 font-medium" scope="col">Applied</th>
                <th className="px-4 font-medium" scope="col">Deadline</th>
                <th className="px-4 font-medium" scope="col">Source</th>
                <th className="px-4 font-medium" scope="col">Location</th>
                <th className="w-12 px-2" scope="col"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody>
              {listState === "loading"
                ? [0, 1, 2, 3, 4, 5].map((item) => (
                    <tr className="h-14 border-b border-border" key={item}>
                      <td className="px-4" colSpan={7}>
                        <div className="h-4 w-2/5 animate-pulse rounded bg-surface-hover" />
                      </td>
                    </tr>
                  ))
                : page?.applications.map((application) => (
                    <tr className="h-14 border-b border-border last:border-b-0 hover:bg-surface-hover" key={application.id}>
                      <td className="max-w-[360px] px-4 py-2">
                        <span className="flex items-center gap-1.5">
                          <strong className="truncate font-semibold text-foreground" title={application.job_title}>{application.job_title}</strong>
                          {application.job_url ? (
                            <a aria-label={`Open job ad for ${application.job_title}`} className="shrink-0 text-muted-foreground hover:text-primary" href={application.job_url} rel="noreferrer" target="_blank">
                              <ExternalLink aria-hidden="true" className="size-3.5" />
                            </a>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{application.company}</span>
                      </td>
                      <td className="px-4">
                        <select
                          aria-label={`Status for ${application.job_title} at ${application.company}`}
                          className={`h-6 cursor-pointer rounded-md border px-2 text-xs font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${statusStyles[application.status]}`}
                          onChange={(event) => onStatusChange(application, event.target.value as ApplicationStatus)}
                          value={application.status}
                        >
                          {applicationStatuses.map((status) => (
                            <option key={status} value={status}>{statusLabels[status]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(application.applied_on)}</td>
                      <td className={`px-4 whitespace-nowrap tabular-nums ${isDeadlineSoon(application) ? "font-medium text-warning" : "text-muted-foreground"}`}>
                        {formatDate(application.deadline)}
                      </td>
                      <td className="px-4 text-muted-foreground">{application.source ?? "—"}</td>
                      <td className="max-w-[160px] truncate px-4 text-muted-foreground">{application.location ?? "—"}</td>
                      <td className="px-2">
                        <Button aria-label={`Edit ${application.job_title} at ${application.company}`} onClick={() => onEdit(application)} size="icon-sm" type="button" variant="ghost">
                          <Pencil aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <footer className="flex min-h-14 items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="tabular-nums">Showing {pageStart}–{pageEnd} of {page?.total ?? 0}</span>
        <div className="flex gap-1">
          <Button aria-label="Previous page" disabled={offset === 0 || listState === "loading"} onClick={() => onPageChange(Math.max(0, offset - pageSize))} size="icon" type="button" variant="ghost">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button aria-label="Next page" disabled={page?.next_offset === null || listState === "loading"} onClick={() => onPageChange(page?.next_offset ?? offset)} size="icon" type="button" variant="ghost">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </footer>
    </section>
  );
}
