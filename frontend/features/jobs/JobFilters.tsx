/**
 * Renders the database query controls for the Jobs workspace.
 * Every visible field maps directly to a supported stored-jobs API filter.
 */
"use client";

import { Search } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import type { StoredJobFilters } from "./types";

type JobFiltersProps = {
  filters: StoredJobFilters;
  onChange: (filters: StoredJobFilters) => void;
  onSubmit: () => void;
};

const labelClassName =
  "mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground";
const inputClassName = "h-10 rounded-md bg-white px-3";

export function JobFilters({ filters, onChange, onSubmit }: JobFiltersProps) {
  /** Collect and submit one complete database query without invoking provider ingestion. */
  function submitFilters(event: FormEvent<HTMLFormElement>) {
    /** Prevent navigation before applying the controlled filter values. */
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="grid grid-cols-[1.35fr_1fr_0.8fr_0.8fr_0.9fr_auto] items-end gap-3 rounded-lg border px-4 py-4 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
      onSubmit={submitFilters}
    >
      <div>
        <Label className={labelClassName} htmlFor="filter-query">
          Keywords
        </Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className={`${inputClassName} pl-9`}
            id="filter-query"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Title or company"
            type="search"
            value={filters.query}
          />
        </div>
      </div>

      <div>
        <Label className={labelClassName} htmlFor="filter-location">
          Location
        </Label>
        <Input
          className={inputClassName}
          id="filter-location"
          onChange={(event) => onChange({ ...filters, location: event.target.value })}
          placeholder="Any location"
          value={filters.location}
        />
      </div>

      <div>
        <Label className={labelClassName} htmlFor="filter-work-mode">
          Work mode
        </Label>
        <NativeSelect
          className="w-full"
          id="filter-work-mode"
          onChange={(event) =>
            onChange({
              ...filters,
              workMode: event.target.value as StoredJobFilters["workMode"],
            })
          }
          value={filters.workMode}
        >
          <NativeSelectOption value="">Any mode</NativeSelectOption>
          <NativeSelectOption value="remote">Remote</NativeSelectOption>
          <NativeSelectOption value="hybrid">Hybrid</NativeSelectOption>
          <NativeSelectOption value="on_site">On-site</NativeSelectOption>
        </NativeSelect>
      </div>

      <div>
        <Label className={labelClassName} htmlFor="filter-age">
          Published
        </Label>
        <NativeSelect
          className="w-full"
          id="filter-age"
          onChange={(event) =>
            onChange({
              ...filters,
              publishedWithinDays: event.target
                .value as StoredJobFilters["publishedWithinDays"],
            })
          }
          value={filters.publishedWithinDays}
        >
          <NativeSelectOption value="">Any time</NativeSelectOption>
          <NativeSelectOption value="7">Last 7 days</NativeSelectOption>
          <NativeSelectOption value="14">Last 14 days</NativeSelectOption>
          <NativeSelectOption value="30">Last 30 days</NativeSelectOption>
        </NativeSelect>
      </div>

      <div>
        <Label className={labelClassName} htmlFor="filter-sort">
          Sort by
        </Label>
        <NativeSelect
          className="w-full"
          id="filter-sort"
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as StoredJobFilters["sort"],
            })
          }
          value={filters.sort}
        >
          <NativeSelectOption value="published_desc">Newest first</NativeSelectOption>
          <NativeSelectOption value="published_asc">Oldest first</NativeSelectOption>
          <NativeSelectOption value="deadline_asc">Deadline soonest</NativeSelectOption>
        </NativeSelect>
      </div>

      <div className="grid gap-2">
        <div className="flex h-6 items-center gap-2">
          <Checkbox
            checked={filters.includeExpired}
            id="include-expired"
            onCheckedChange={(checked) => onChange({ ...filters, includeExpired: checked })}
          />
          <Label className="text-sm font-normal" htmlFor="include-expired">
            Include expired
          </Label>
        </div>
        <Button className="h-10 rounded-md px-5" type="submit">
          <Search aria-hidden="true" data-icon="inline-start" />
          Search
        </Button>
      </div>
    </form>
  );
}
