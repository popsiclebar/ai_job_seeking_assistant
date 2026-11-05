/**
 * Coordinates the Applications page: status tabs, search, the add/edit form, and the table.
 * It owns tracker state and reloads the current page after every change.
 */
"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { createApplication, deleteApplication, listApplications, updateApplication } from "./api";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationTable } from "./ApplicationTable";
import {
  applicationStatuses,
  statusLabels,
  type Application,
  type ApplicationFilters,
  type ApplicationPage,
} from "./types";

const PAGE_SIZE = 50;
const COMMON_SOURCES = ["LinkedIn", "Platsbanken", "Indeed", "Company site", "Referral", "Recruiter"];

export function ApplicationsWorkspace() {
  /** Keep filters, the loaded page, and the open form synchronized with the API. */
  const [filters, setFilters] = useState<ApplicationFilters>({ status: "", query: "", sort: "recent" });
  const [draftQuery, setDraftQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<ApplicationPage | null>(null);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Application | "new" | null>(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    /** Read the current page whenever filters, offset, or stored data change. */
    const controller = new AbortController();
    listApplications(filters, offset, PAGE_SIZE, controller.signal)
      .then((result) => {
        setPage(result);
        setListState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setListState("error");
      });
    return () => controller.abort();
  }, [filters, offset, reloadKey]);

  const knownSources = useMemo(() => {
    /** Suggest common job boards plus any source already used on this page. */
    const sources = new Set(COMMON_SOURCES);
    page?.applications.forEach((application) => application.source && sources.add(application.source));
    return [...sources];
  }, [page]);

  const totalAcrossStatuses = page
    ? applicationStatuses.reduce((sum, status) => sum + page.status_counts[status], 0)
    : null;

  function applyFilters(next: Partial<ApplicationFilters>) {
    /** Change filters and return to the first page. */
    setListState("loading");
    setOffset(0);
    setFilters((current) => ({ ...current, ...next }));
  }

  function reload() {
    /** Refresh the table after a change and close the form. */
    setEditing(null);
    setListState("loading");
    setReloadKey((key) => key + 1);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    /** Apply the typed search text. */
    event.preventDefault();
    applyFilters({ query: draftQuery });
  }

  return (
    <section className="min-w-0">
      <header className="flex min-h-14 items-start justify-between gap-6 max-sm:flex-col max-sm:gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Application tracker</p>
          <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.025em] text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every role from shortlist to outcome.</p>
        </div>
        <Button onClick={() => setEditing("new")} type="button">
          <Plus aria-hidden="true" />
          Add application
        </Button>
      </header>

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-1 border-b border-border">
        {(["", ...applicationStatuses] as const).map((status) => {
          const active = filters.status === status;
          const count = status ? page?.status_counts[status] : totalAcrossStatuses;
          return (
            <button
              aria-pressed={active}
              className={`-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              key={status || "all"}
              onClick={() => applyFilters({ status })}
              type="button"
            >
              {status ? statusLabels[status] : "All"}{" "}
              <span className="text-muted-foreground tabular-nums">{count ?? "—"}</span>
            </button>
          );
        })}
      </nav>

      <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={submitSearch}>
        <div className="min-w-[260px] flex-1">
          <Label className="mb-1.5 text-xs font-medium text-muted-foreground" htmlFor="application-search">Search</Label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-lg border-input bg-white pl-9 text-base sm:text-[13px]"
              id="application-search"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Company, title, or notes"
              type="search"
              value={draftQuery}
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 text-xs font-medium text-muted-foreground" htmlFor="application-sort">Sort</Label>
          <NativeSelect id="application-sort" onChange={(event) => applyFilters({ sort: event.target.value as ApplicationFilters["sort"] })} value={filters.sort}>
            <NativeSelectOption value="recent">Most recent</NativeSelectOption>
            <NativeSelectOption value="deadline_asc">Deadline first</NativeSelectOption>
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {editing ? (
        <ApplicationForm
          application={editing === "new" ? null : editing}
          key={editing === "new" ? "new" : editing.id}
          knownSources={knownSources}
          onCancel={() => setEditing(null)}
          onDelete={editing === "new" ? undefined : async () => {
            await deleteApplication(editing.id);
            reload();
          }}
          onSave={async (input) => {
            if (editing === "new") await createApplication(input);
            else await updateApplication(editing.id, input);
            reload();
          }}
        />
      ) : null}

      {statusError ? <p className="mt-3 text-sm text-destructive" role="alert">{statusError}</p> : null}

      <ApplicationTable
        listState={listState}
        offset={offset}
        onEdit={(application) => setEditing(application)}
        onPageChange={(nextOffset) => {
          setListState("loading");
          setOffset(nextOffset);
        }}
        onStatusChange={(application, status) => {
          setStatusError("");
          updateApplication(application.id, { status })
            .then(() => setReloadKey((key) => key + 1))
            .catch(() => setStatusError(`Could not update ${application.job_title}. Try again.`));
        }}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}
