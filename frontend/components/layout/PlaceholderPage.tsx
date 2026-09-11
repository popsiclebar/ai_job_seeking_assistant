/**
 * Provides a consistent temporary layout for feature routes not yet connected.
 * It keeps navigation usable while the MVP grows in working vertical slices.
 */
type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  /** Render explanatory content for one planned feature page. */
  return (
    <section className="max-w-4xl">
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">{title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      <div className="mt-10 border-t py-8 text-sm text-muted-foreground">
        This module will be connected in its MVP phase.
      </div>
    </section>
  );
}
