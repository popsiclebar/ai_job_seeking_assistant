/**
 * Renders the add/edit form for one tracked application.
 * Fields mirror the tracker columns; empty optional fields are sent as null.
 */
"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import {
  applicationStatuses,
  statusLabels,
  type Application,
  type ApplicationInput,
} from "./types";

type ApplicationFormProps = {
  application: Application | null;
  knownSources: string[];
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  onSave: (input: ApplicationInput) => Promise<void>;
};

const labelClassName = "mb-1.5 text-xs font-medium text-muted-foreground";
const fieldClassName = "h-9 rounded-lg border-input bg-white px-3 text-base sm:text-[13px]";

function toInput(application: Application | null): ApplicationInput {
  /** Seed the form from a stored application, or from empty defaults for a new one. */
  return {
    company: application?.company ?? "",
    job_title: application?.job_title ?? "",
    status: application?.status ?? "applied",
    applied_on: application?.applied_on ?? null,
    deadline: application?.deadline ?? null,
    job_url: application?.job_url ?? null,
    location: application?.location ?? null,
    source: application?.source ?? null,
    notes: application?.notes ?? null,
  };
}

export function ApplicationForm({
  application,
  knownSources,
  onCancel,
  onDelete,
  onSave,
}: ApplicationFormProps) {
  /** Collect one application's fields and report save or delete failures in place. */
  const [values, setValues] = useState<ApplicationInput>(() => toInput(application));
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function update<K extends keyof ApplicationInput>(field: K, value: ApplicationInput[K]) {
    /** Store one field, turning blank optional text into null for the API. */
    setValues((current) => ({ ...current, [field]: value === "" ? null : value }));
  }

  async function run(action: () => Promise<void>) {
    /** Execute a save or delete and keep the form open with a message if it fails. */
    setState("saving");
    try {
      await action();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setState("error");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    /** Prevent navigation and save the controlled values. */
    event.preventDefault();
    void run(() => onSave(values));
  }

  return (
    <form
      aria-label={application ? "Edit application" : "Add application"}
      className="mt-4 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]"
      onSubmit={submit}
    >
      <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
        {application ? "Edit application" : "Add application"}
      </h2>

      <div className="mt-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="col-span-2 max-sm:col-span-1">
          <Label className={labelClassName} htmlFor="application-title">Job title</Label>
          <Input className={fieldClassName} id="application-title" required value={values.job_title} onChange={(event) => setValues({ ...values, job_title: event.target.value })} />
        </div>
        <div className="col-span-2 max-sm:col-span-1">
          <Label className={labelClassName} htmlFor="application-company">Company</Label>
          <Input className={fieldClassName} id="application-company" required value={values.company} onChange={(event) => setValues({ ...values, company: event.target.value })} />
        </div>
        <div>
          <Label className={labelClassName} htmlFor="application-status">Status</Label>
          <NativeSelect className="w-full" id="application-status" value={values.status} onChange={(event) => update("status", event.target.value as ApplicationInput["status"])}>
            {applicationStatuses.map((status) => (
              <NativeSelectOption key={status} value={status}>{statusLabels[status]}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label className={labelClassName} htmlFor="application-applied-on">Applied on</Label>
          <Input className={fieldClassName} id="application-applied-on" type="date" value={values.applied_on ?? ""} onChange={(event) => update("applied_on", event.target.value)} />
        </div>
        <div>
          <Label className={labelClassName} htmlFor="application-deadline">Deadline</Label>
          <Input className={fieldClassName} id="application-deadline" type="date" value={values.deadline ?? ""} onChange={(event) => update("deadline", event.target.value)} />
        </div>
        <div>
          <Label className={labelClassName} htmlFor="application-source">Source</Label>
          <Input className={fieldClassName} id="application-source" list="application-source-options" value={values.source ?? ""} onChange={(event) => update("source", event.target.value)} />
          <datalist id="application-source-options">
            {knownSources.map((source) => <option key={source} value={source} />)}
          </datalist>
        </div>
        <div className="col-span-2 max-sm:col-span-1">
          <Label className={labelClassName} htmlFor="application-url">Job link</Label>
          <Input className={fieldClassName} id="application-url" placeholder="https://" type="url" value={values.job_url ?? ""} onChange={(event) => update("job_url", event.target.value)} />
        </div>
        <div className="col-span-2 max-sm:col-span-1">
          <Label className={labelClassName} htmlFor="application-location">Location</Label>
          <Input className={fieldClassName} id="application-location" value={values.location ?? ""} onChange={(event) => update("location", event.target.value)} />
        </div>
        <div className="col-span-4 max-lg:col-span-2 max-sm:col-span-1">
          <Label className={labelClassName} htmlFor="application-notes">Notes</Label>
          <textarea
            className="min-h-20 w-full rounded-lg border border-input bg-white px-3 py-2 text-base text-body outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-[13px]"
            id="application-notes"
            value={values.notes ?? ""}
            onChange={(event) => update("notes", event.target.value)}
          />
        </div>
      </div>

      {state === "error" ? (
        <p className="mt-3 text-sm text-destructive" role="alert">{errorMessage}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        Leaving “Applied on” empty records today’s date for any status other than shortlisted.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button disabled={state === "saving"} type="submit">
          {application ? "Save changes" : "Add application"}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
        {onDelete ? (
          <Button
            className="ml-auto"
            disabled={state === "saving"}
            onClick={() => {
              if (window.confirm("Delete this application permanently?")) void run(onDelete);
            }}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
