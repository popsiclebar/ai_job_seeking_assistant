/**
 * Coordinates the database-only Job Search page and its selected-record state.
 * Filters, results, and detail remain separate cohesive presentation boundaries.
 */
"use client";

import { useEffect, useState } from "react";

import { getStoredJob, listStoredJobs } from "./api";
import { JobDetail } from "./JobDetail";
import { JobFilters } from "./JobFilters";
import { JobResults } from "./JobResults";
import type { StoredJobDetail, StoredJobFilters, StoredJobPage } from "./types";

const PAGE_SIZE = 10;
const initialFilters: StoredJobFilters = {
  query: "",
  location: "",
  workMode: "",
  publishedWithinDays: "",
  includeExpired: false,
  sort: "published_desc",
};

export function JobsWorkspace() {
  /** Keep the applied query, current page, and selected canonical job synchronized. */
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [offset, setOffset] = useState(0);
  const [jobPage, setJobPage] = useState<StoredJobPage | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<StoredJobDetail | null>(null);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [detailState, setDetailState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    /** Read one result page whenever the applied database query or offset changes. */
    const controller = new AbortController();
    listStoredJobs(filters, offset, PAGE_SIZE, controller.signal)
      .then((page) => {
        setJobPage(page);
        setListState("ready");
        setDetailState("loading");
        setSelectedJobId((currentId) =>
          currentId && page.jobs.some((job) => job.id === currentId)
            ? currentId
            : (page.jobs[0]?.id ?? null),
        );
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setListState("error");
      });
    return () => controller.abort();
  }, [filters, offset]);

  useEffect(() => {
    /** Read the complete description whenever the selected canonical job changes. */
    if (!selectedJobId) {
      return;
    }

    const controller = new AbortController();
    getStoredJob(selectedJobId, controller.signal)
      .then((job) => {
        setSelectedJob(job);
        setDetailState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setDetailState("error");
      });
    return () => controller.abort();
  }, [selectedJobId]);

  return (
    <section className="max-w-none">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.025em]">Job Search</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Search jobs already collected in your database.
          </p>
        </div>
        <p className="text-sm text-muted-foreground max-sm:hidden" aria-live="polite">
          <strong className="font-semibold text-foreground">{jobPage?.total ?? "—"}</strong>{" "}
          {filters.includeExpired ? "matching jobs" : "matching active jobs"}
        </p>
      </header>

      <JobFilters
        filters={draftFilters}
        onChange={setDraftFilters}
        onSubmit={() => {
          setListState("loading");
          setOffset(0);
          setFilters({ ...draftFilters });
        }}
      />

      <div className="mt-5 grid grid-cols-[minmax(570px,1.12fr)_minmax(425px,0.88fr)] gap-4 max-xl:grid-cols-1">
        <JobResults
          jobPage={jobPage}
          listState={listState}
          offset={offset}
          onPageChange={(nextOffset) => {
            setListState("loading");
            setOffset(nextOffset);
          }}
          onSelect={(jobId) => {
            setDetailState("loading");
            setSelectedJobId(jobId);
          }}
          pageSize={PAGE_SIZE}
          selectedJobId={selectedJobId}
        />
        <JobDetail
          job={selectedJob}
          matchesSelection={selectedJob?.id === selectedJobId}
          selectedJobId={selectedJobId}
          state={detailState}
        />
      </div>
    </section>
  );
}
