/**
 * Renders the high-level job-search dashboard.
 * Placeholder values establish the summary layout before workflows supply real data.
 */
const summaries = [
  ["New high-fit jobs", "—"],
  ["Active applications", "—"],
  ["Interviews", "—"],
  ["Blocking failures", "0"],
] as const;

export default function DashboardPage() {
  /** Present the application's most important job-search signals at a glance. */
  return (
    <section className="max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Dashboard</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Your job search, in one place.
      </p>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
        The project foundation is ready. Job discovery and application data will appear here as
        the workflows are connected.
      </p>
      <div className="mt-9 grid grid-cols-4 border-y max-lg:grid-cols-2 max-sm:grid-cols-1">
        {summaries.map(([label, value]) => (
          <article
            className="flex min-h-28 flex-col justify-between border-r px-5 py-4 last:border-r-0 max-lg:nth-[2]:border-r-0 max-lg:nth-[n+3]:border-t max-sm:border-r-0 max-sm:nth-[n+2]:border-t"
            key={label}
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <strong className="text-2xl font-semibold tabular-nums">{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
