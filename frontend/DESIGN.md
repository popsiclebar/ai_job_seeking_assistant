# AI Job Assistant design guide

This document defines the product's visual language and the decisions that shape its interfaces.
It is self-contained guidance for creating consistent pages, whether or not the reader has access to the application source.

## Scope

Use this guide for job discovery, application tracking, resume/profile workflows, and related job-search summaries. Choose a composition for the user's task; do not turn every page into a dashboard. The intended character is calm, precise, and useful: a pale neutral workspace, white work panels, muted blue selection, subtle pastel metrics, and compact typography.

The specifications describe the intended design contract. They are not a claim that every pattern is already implemented. The available implementation primitives are listed below; do not assume undocumented components, utility classes, or a hosted stylesheet exist.

## Reader, task, and information hierarchy

The reader is a person deciding which opportunity deserves attention and what to do next. Before choosing a layout, identify the immediate task, the evidence needed, and the next available action.

| Reader's task | Composition | What receives emphasis |
| --- | --- | --- |
| Decide what needs attention today | Compact summary, opportunities, deadlines/next steps | Actionable work before historical analytics |
| Compare jobs and inspect one | Filter toolbar, scannable queue, adjacent detail on desktop | Title/company, key constraints, readable description |
| Review application progress | Status filters and comparable rows; optional factual summary | Next action and dates, with status as supporting context |
| Edit profile or resume information | Readable form sections with explicit labels | Current field, relevant help, save/error feedback |
| Read a progress report | One factual takeaway, supporting comparison, then detail | Evidence for the takeaway and its time period |

A quick scan should reveal the page's purpose and next action. A closer read should reveal the underlying records, dates, source context, and limitations. Keep detail available without giving every piece equal visual weight.

Use the full available panel width for evidence tables. Constrain long prose to a comfortable reading width rather than constraining the entire table to that same width. A chart earns space only when it answers a useful question more clearly than a count, list, or table.

## Copy and data

Use sentence case, concrete nouns, and action labels such as “View job” or “Save changes.” Avoid promotional greetings, vague productivity claims, and implementation-status paragraphs. Explain what the user can do, not how the frontend was assembled.

Preserve supplied facts, units, dates, and sources. A match recommendation needs supporting reasons. A percentage needs a denominator or understandable definition. A trend needs a real comparison period. Do not imply a capability exists through decorative controls.

| State | Visible treatment |
| --- | --- |
| Loading | Stable geometry and neutral skeletons |
| Known zero | `0`, with useful context and an available next action |
| Unavailable | Em dash and concise explanation; never imply zero |
| Failure | Local error and relevant recovery action; retain usable content |
| Stale | Known timestamp and freshness context where relevant |
| Success | Quiet confirmation and updated affected content |

Do not fabricate metrics, chart history, activity, interviews, users, or AI recommendations to complete a layout. A sparse page with one useful panel is preferable to several empty charts. Clearly identify synthetic data in any demonstration.

## Color vocabulary

### Semantic tokens

These values define the product design contract. Use token names in components; raw palette values belong in the theme definition.

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#F4F6F9` | Main page background visible in gutters |
| `sidebar` | `#F8F9FB` | Quiet navigation plane |
| `surface` | `#FFFFFF` | Header, cards, tables, menus |
| `surface-subtle` | `#F8F9FB` | Nested group, hover baseline, table header |
| `surface-hover` | `#F0F3F7` | Hovered neutral rows/controls |
| `surface-selected` | `#E9EFF7` | Selected navigation or record |
| `ink` | `#090911` | Primary titles and metric values |
| `text` | `#343942` | Normal content and labels |
| `text-muted` | `#616B79` | Metadata and explanatory text |
| `text-disabled` | `#8A929E` | Disabled content only |
| `border-subtle` | `#E8ECF1` | Card boundaries and table separators |
| `border` | `#DCE2EA` | Neutral group boundaries |
| `border-control` | `#7F8B9B` | Essential control outline when outline identifies the control |
| `primary` | `#1B58A1` | Primary action, active data, links |
| `primary-hover` | `#174B89` | Hovered primary button |
| `primary-pressed` | `#123F75` | Pressed primary button |
| `primary-foreground` | `#FFFFFF` | Text/icons on primary |
| `blue-muted` | `#91AECF` | Supporting chart series |
| `blue-soft` | `#BCD7F5` | Pale fills and secondary chart series |
| `blue-pale` | `#D8E4F0` | Track/fill or optional small accent surface |
| `teal` | `#287A8F` | Secondary data family for supporting data |
| `metric-blue` | `#EDF2F9` | First metric tile |
| `metric-lavender` | `#F1EFF8` | Second metric tile |
| `metric-sage` | `#F2F5EE` | Third metric tile |
| `metric-blush` | `#F8EFF3` | Fourth metric tile |
| `success` / `success-soft` | `#28724F` / `#EDF6F0` | Successful/completed status |
| `warning` / `warning-soft` | `#92551A` / `#FBF3E8` | Deadline or caution |
| `danger` / `danger-soft` | `#B23C50` / `#FBEFF1` | Failure/destructive action |

### Color placement rules

- Aim for roughly 85–90% white/near-neutral area, 8–12% pastel or pale data fill, and 2–5% stronger chromatic marks. These are visual review heuristics, not quotas or pixel-count requirements.
- The canvas is subtly cooler/darker than white panels. It should look near-white at a glance, not like a blue page.
- Keep headings and KPI values near-black, including on colored tiles. Do not make every number blue.
- Navigation selection uses `surface-selected` plus a primary label/icon. A solid blue sidebar block is not the default.
- Use all four metric tints only when four meaningful metrics exist. Do not manufacture a fourth metric for color symmetry.
- Metric tint identifies a stable category, not good/bad status. A blush interview tile does not mean an interview failed.
- Use one blue family within a time-series chart. Add teal only for a meaningful second series or different chart family. Category colors must retain stable meanings across pages.
- Never use `blue-muted`, `blue-soft`, or `blue-pale` as small text on white. They are fill colors, not readable label colors.
- Light borders are visual grouping aids, not necessarily accessible control boundaries. Use `border-control` where a control would otherwise be indistinguishable; visible labels, affordances, focus, and contrast still matter.
- No backdrop blur or decorative gradient on normal cards. A single-hue fade under a chart is allowed because it communicates the plotted area. Use a flat primary button.

## Typography

Use locally bundled **Inter Variable** (`@fontsource-variable/inter`).

Font stack: `"Inter Variable", sans-serif`. Use regular 400, medium 500, and semibold 600 by default. Avoid bold 700 across the whole interface. Keep the rhythm compact while preserving reading comfort.

| Role | Size / line height | Weight | Letter spacing |
| --- | --- | --- | --- |
| Brand label | 14px / 20px | 600 | -0.01em |
| Page heading | 24px / 32px | 600 | -0.025em |
| Compact topbar route title | 15px / 22px | 600 | -0.01em |
| Panel heading | 14px / 20px | 600 | -0.01em |
| KPI number | 28px / 34px | 500 | -0.025em |
| Compact inline metric | 22px / 28px | 500 | -0.02em |
| Body/UI label | 14px / 20px | 400 / 500 | 0 |
| Table content | 13px / 20px | 400 | 0 |
| Metadata/axis/legend | 12px / 18px | 400 / 500 | 0 |
| Long job description | 15px / 24px | 400 | 0 |
| Badge | 12px / 16px | 500 | 0 |

Use sentence case. Table headers can be medium-weight muted text; do not use widely tracked uppercase as the main hierarchy. Sidebar group labels may use 11px uppercase sparingly, but no essential information should depend on that size.

Use `font-variant-numeric: tabular-nums lining-nums` for counts, dates, percentages, and table numeric columns. Keep units at 12–13px next to large numbers and align baselines. Right-align comparable numeric columns. Reserve fixed-width formatting for IDs/code; do not make all metrics monospace.

Default text blocks and KPI tiles are left-aligned. Keep one alignment per metric row.

## Layout and geometry

Use a 4px spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px. Keep 2px for optical adjustments and active indicators.

| Primitive | Default geometry |
| --- | --- |
| Desktop sidebar | 232px wide; 12px horizontal padding; 40px navigation rows |
| Topbar | 56px high; white surface and one bottom divider |
| Main workspace | 24px desktop padding; 20px tablet; 16px mobile |
| Content grid | 12 columns, 16px gaps; content up to 1440px wide |
| Work panel | 20px padding; 12px radius; one subtle border |
| Metric tile | 16px padding; 10px radius; 104–112px tall when content fits |
| Standard control | 36px desktop height; 12px horizontal padding; 8px radius |
| Form field | 40px desktop height; label 6–8px above |
| Mobile interaction target | At least 44px; text-entry fields at least 16px font size |
| Table | 40px header; 48–56px body rows; 16px cell padding |
| Panel header to content | 16px |
| Icon to label / inline controls | 8px |

At desktop width, a dashboard may use four equal metric tiles followed by an 8/4 work-panel split. Use only as many metrics as are meaningful. Lists, forms, and detail pages should follow their own tasks instead of inheriting this composition.

Keep outer edges and title baselines aligned. Normal page scrolling is expected. Do not shrink text to force all content above the fold. The app fills its viewport; it has no oversized decorative outer frame.

Borders are 1 CSS pixel. Prefer horizontal table separators and avoid a complete spreadsheet grid. Normal cards use `0 1px 2px rgb(9 9 17 / 0.025)` with a subtle border. Header/sidebar have no shadow. Menus may use `0 8px 24px rgb(9 9 17 / 0.08), 0 2px 6px rgb(9 9 17 / 0.04)`. Use no more than two nested surface levels.

## Component vocabulary

These are design recipes, not promised exported component names.

| Pattern | Required treatment |
| --- | --- |
| Navigation | Muted inactive labels; pale selected row with primary label/icon and explicit current-page state |
| Tabs | Dark active label, 2px primary underline, quiet inactive text; actual view switching |
| Metric tile | Label, dark 28px value, optional factual context; stable pastel category fill |
| Panel | Meaningful title, optional brief explanation, content; controls only where functional |
| Primary button | Solid primary, white text, 13px medium label; one dominant action per screen |
| Secondary button | Neutral text, white/subtle fill, visible border; same geometry as primary |
| Search/filter toolbar | Compact labeled controls, 8px gaps; applied filters visible and removable |
| Record row | Clear primary label, quieter metadata, subtle hover, explicit selection |
| Status badge | 12px label, 20–24px height, 6–8px horizontal padding, semantic soft fill plus readable text |
| Popover | Opaque white, 12px radius, restrained shadow, keyboard access and focus restoration |
| Tooltip | Compact label/value; cannot be the only way to access essential information |

Use one outline icon family, Lucide: 16px inline, 18px navigation, usually 1.5–1.75 stroke width. Keep text labels for primary navigation. Do not introduce random emoji, large decorative icon circles, or invented brand marks. Use the product name as text when an approved logo asset is unavailable. Use only assets with an appropriate license and never present another product's identity as this one.

## Charts and evidence

Use lines/areas for time, bars for comparison, and rows for actionable records. Prefer three to five categories in a donut; use a table or bars when exact comparison matters.

Main plots are approximately 200–240px high with readable labels. Lines use a 1.5px stroke. Area fill may fade from about 20% opacity to transparent. Bars have 4–6px top corners. Use three to five pale horizontal grid lines, 12px axis labels, explicit units, and unobtrusive legends. Show a small point marker and fine guide on hover/focus rather than at every sample.

Reserve strong color for a meaningful primary or selected series. Pale series need labels or an equally usable data representation. Counts start at zero; other scale choices must not mislead. Missing data is a gap. Do not smooth curves into invented extrema, add decorative reflections, or highlight an arbitrary month.

## Responsive behavior and accessibility

At 1200px and above, use the desktop shell and optional four-metric row. Between 1024–1199px, use two metrics per row and stack work panels if cramped. Between 768–1023px, use a 208px sidebar when usable, 20px content padding, and stack master/detail areas. Below 768px, use a compact header and labeled navigation drawer, 16px padding, and one main column. Below 480px, use one metric per row if two would truncate its labels.

All routes and essential actions remain reachable. Preserve reading order. Forms and filters wrap. Complex tables may scroll within a labeled region, but the whole page must not scroll horizontally. A mobile calendar shows one month, not two compressed months.

Use semantic landmarks, one route-level h1, labeled controls, visible focus, and keyboard-operable interactions. Focus uses a 2px primary outline with 2px offset. Ordinary text needs at least 4.5:1 contrast; large text and essential non-text marks/controls need 3:1. Verify actual combinations. Color alone does not communicate state. Support 200% zoom, long labels, and touch use.

Hover transitions are 120–160ms; popovers about 140ms with at most 4px movement; drawers 180–220ms. Chart updates may use 180–250ms if useful. Respect reduced-motion preferences. No cinematic route transitions, staggered card entrances, blur wipes, or bouncing panels.

## Available implementation primitives

In this repository, the shared styling entry is `app/globals.css`, relative to this file. It contains Tailwind v4/shadcn imports, semantic theme variables, and the global reset. Font loading uses `@fontsource-variable/inter`. Icons come from `lucide-react`.

The existing `components/ui/` primitives include button, input, checkbox, label, native-select, badge, and separator. Inspect their exports and supported props before composing them. The navigation shell is in `components/layout/AppSidebar.tsx`. Panels, metric tiles, charts, calendars, and drawers described here are recipes; do not assume matching reusable implementations exist.

Token names in the color table are semantic roles. Bind them through the local theme and explicitly expose any new Tailwind utilities before use. The specified palette is the target contract; verify the stylesheet when implementing it. There is no documented standalone hosted stylesheet or external class API. Outside this repository, define the listed values locally instead of importing unrelated branded CSS or guessing a stylesheet URL.

## Observable design failures

| Failure | Correction |
| --- | --- |
| Blue dominates every region | Restore near-neutral surfaces; reserve strong blue for action/selection |
| All pages use equal card grids | Choose structure around the reader's task |
| Main table is squeezed to prose width | Give evidence its available panel width |
| A large greeting pushes work down | Use a compact heading and show actionable content |
| Type shrinks to fit | Reflow, wrap, or use localized table scrolling |
| Shadows and rounded containers compete | Use subtle borders and limited nesting |
| Empty space is filled with invented analytics | Show honest states and available work |
| Glass, glows, decorative gradients, or sparkles signal AI | Communicate capability through useful actions and evidence |

Before delivery, check that the reader can identify the next action, facts remain intact, the palette and spacing are consistent, tables and labels fit, and the page works on desktop, mobile, keyboard, and zoomed layouts.
