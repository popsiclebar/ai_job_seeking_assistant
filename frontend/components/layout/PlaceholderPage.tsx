/**
 * Provides an honest, designed empty state for feature routes not yet connected.
 * It keeps the page useful without implying that planned workflows already exist.
 */
import { Clock3 } from "lucide-react";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  /** Render one route heading and a restrained unavailable-workflow panel. */
  return (
    <section>
      <header className="min-h-14">
        <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.025em] text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>
      <article className="mt-5 flex min-h-[280px] max-w-3xl flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-[0_1px_2px_rgb(9_9_17_/_0.025)]">
        <span className="grid size-10 place-items-center rounded-[10px] bg-metric-blue text-primary">
          <Clock3 aria-hidden="true" className="size-5" strokeWidth={1.7} />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">This workspace is not available yet</p>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          It will become interactive when its data workflow is connected. No placeholder records are shown.
        </p>
        <span className="mt-5 rounded-md bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          Planned for a later product phase
        </span>
      </article>
    </section>
  );
}
