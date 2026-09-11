# AI Job Assistant Design System

This document defines how the application should look and behave. It complements `AGENTS.md`, which
defines how the code should be built. Future interface work must preserve these rules unless a design
decision is explicitly changed.

The structure follows the `DESIGN.md` approach documented by
[awesome-design-md](https://github.com/voltagent/awesome-design-md): atmosphere, semantic tokens,
typography, components, layout, elevation, responsive behavior, and explicit anti-patterns.

## Product character

The AI Job Assistant is a focused personal operations tool, not an AI marketing page. It should feel
quiet, capable, trustworthy, and fast to scan—closer to a well-made project manager or research desk
than a futuristic assistant. The supplied Monday-style reference is the primary visual benchmark:
one continuous white workspace structured by typography, spacing, and thin rules.

- Put live work and real data in the first viewport.
- Prefer clear hierarchy and compact density over decorative whitespace.
- Let AI appear through useful actions and explanations, not visual effects.
- Use familiar productivity patterns: persistent navigation, structured panels, tables, filters,
  status labels, and direct actions.
- Keep the interface professional without making it sterile; small blue details and considered type
  provide personality.

## Color system

The palette is white and neutral with one restrained cobalt action color. Use semantic names in code
so colors can change without rewriting components.

| Token | Value | Role |
| --- | --- | --- |
| Canvas | `#ffffff` | Application background |
| Surface | `#ffffff` | Primary panels and cards |
| Surface subtle | `#f7f7f7` | Hover states and quiet grouped controls only |
| Surface selected | `#eff6ff` | Selected navigation and records |
| Ink | `#101828` | Headings and primary text |
| Body | `#344054` | Running text |
| Muted | `#667085` | Secondary labels and metadata |
| Hairline | `#e4e7ec` | Borders and separators |
| Hairline strong | `#d0d5dd` | Input borders and stronger divisions |
| Accent | `#2563eb` | Primary actions and active navigation |
| Accent active | `#1d4ed8` | Pressed or active primary action |
| Accent soft | `#eff6ff` | Low-emphasis blue background |
| Success | `#17803d` | Completed or healthy state |
| Success soft | `#ecfdf3` | Success background |
| Warning | `#b54708` | Deadlines and caution |
| Warning soft | `#fffaeb` | Warning background |
| Error | `#b42318` | Failures and destructive states |
| Error soft | `#fef3f2` | Error background |

Color rules:

- Keep the application canvas and all principal work areas plain white.
- Build hierarchy with hairline borders, alignment, spacing, and type before adding fills.
- Use subtle gray only for hover, selection support, or a genuinely grouped control.
- Reserve accent blue for selection, navigation, links, focus, and primary actions.
- Use semantic colors only when they communicate state.
- Never use purple/pink AI gradients, rainbow text, glowing borders, or decorative auroras.
- Do not use low-contrast gray text for information required to make a decision.

## Typography

Use only open-source fonts that are bundled with the application. The default family is **Inter
Variable**, distributed under the SIL Open Font License and loaded locally through `@fontsource`.
Do not load fonts from third-party CDNs.

| Role | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| Page title | `30px` | 650–700 | `1.2` | Route-level heading |
| Section title | `20px` | 650 | `1.3` | Major panel heading |
| Card title | `16px` | 600 | `1.4` | Jobs, applications, summaries |
| Body | `15–16px` | 400 | `1.6` | Descriptions and primary content |
| UI label | `14px` | 500–600 | `1.4` | Navigation, controls, buttons |
| Metadata | `12–13px` | 500 | `1.4` | Dates and tertiary context |

- Use sentence case throughout the interface.
- Use negative letter spacing only on page titles (`-0.02em` maximum).
- Avoid oversized marketing typography inside the application.
- Use tabular numbers for counts, dates, and status summaries where available.

## Application shell

Desktop uses the classic productivity layout shown in the project references:

- A fixed `232px` left sidebar with the product identity at the top.
- Primary workflow navigation grouped near the top.
- Secondary settings navigation anchored near the bottom.
- A slim top utility bar over the main workspace for environment and product context.
- Main content uses the remaining viewport width with `24–32px` padding.

The sidebar is white and separated by a single hairline. Active navigation may use a solid blue
rectangle with a white icon and label, matching the supplied reference. Avoid floating navigation
pills, a tinted application canvas, or a dark sidebar unless the whole direction is reconsidered.

## Spacing and geometry

Use a 4px base scale: `4`, `8`, `12`, `16`, `20`, `24`, `32`, and `40px`.

- Page gutters: `32px` desktop, `20px` tablet, `16px` mobile.
- Panel padding: `20–24px`.
- Control height: `40–44px`; touch controls must not be smaller than `44px` on mobile.
- Panel radius: `12px`.
- Control radius: `8px`.
- Badge radius: full pill only for compact taxonomy or status values.
- Prefer alignment and separators over extra containers.

## Components

### Panels and cards

Panels use the same white as the canvas and rely on one-pixel separators. Do not use shadows for
ordinary application structure and do not place every paragraph in its own card.

### Buttons

- Primary: accent background, white label, 8px radius, weight 600.
- Secondary: white surface, strong hairline border, ink label.
- Tertiary: no container until hover/focus; used for pagination and quiet actions.
- Every button needs a visible focus state and a disabled state.
- One primary action per local task area.

### Inputs and filters

Inputs use white surfaces, strong hairline borders, 8px radius, and an accent focus ring. Labels sit
above controls. Dense filter groups may use a subtle surface but should not resemble a marketing
form. Applied filters must remain visible and predictable.

### Lists and tables

Use rows with hairline separators for comparable records. Selection uses accent-soft background and
a narrow blue leading indicator. Important job metadata—company, location, publication date,
deadline, work mode, and status—must be scannable without opening the record.

### Status and AI output

Status labels use semantic soft backgrounds and plain language. AI recommendations must show their
reasoning or source context and must not be represented by magical glow, floating sparkles, or a
gradient badge. A small sparkle icon is acceptable only as a functional AI-action marker.

## Jobs workspace

The Jobs route is a working surface:

- Page title and matching count form one compact header row.
- Provider ingestion never appears in the user-facing workspace; Job Search reads collected data.
- Default filters avoid silently applying future profile preferences. Expired jobs remain excluded
  unless the user enables the visible control.
- Filters sit above the results and apply in one predictable action.
- Desktop uses a master-detail layout: scannable job queue left, complete JD right.
- The selected row remains obvious while reading a long description.
- External application and original-source links are clearly labeled.

## Dashboard

Use the dashboard only for data the system truly knows. The preferred order is:

1. Concise application summary.
2. Real status counts.
3. Recent high-priority jobs.
4. Upcoming application deadlines or interviews.
5. Recent meaningful activity.

Never fabricate charts, trends, percentages, schedules, or AI recommendations to fill the layout.
Empty states should explain what action creates the missing data.

## Responsive behavior

- At `1024px` and below, allow master-detail areas to stack when two columns become cramped.
- At `768px` and below, transform the sidebar into a compact top navigation area with horizontally
  scrollable primary links; keep every route reachable without hover.
- Collapse filter grids to two columns on tablet and one column on mobile.
- Preserve document reading width and do not introduce horizontal page scrolling.
- Do not hide essential actions or metadata solely to make the layout fit.

## Accessibility and interaction

- Meet WCAG AA contrast for text and controls.
- Use semantic landmarks, labels, headings, lists, and buttons.
- All interactive elements must be keyboard reachable with a visible focus indicator.
- Never rely on color alone for selection or status.
- Respect reduced-motion preferences; functional state changes do not require animation.
- Body text should remain readable at 200% browser zoom.

## Anti-patterns

Do not introduce:

- Purple, pink, or blue-purple gradients used as generic “AI” branding.
- Glassmorphism, blur-heavy surfaces, neon glows, or floating decorative blobs.
- Giant welcome headlines before the actual work surface.
- Repeated three-card marketing layouts inside operational routes.
- Excessive rounded containers, pill-shaped inputs, or shadows on every surface.
- Fake analytics, fake activity, fake users, or example applications presented as real data.
- Icons without labels for primary navigation.
- Commercial or remotely hosted fonts.
- Framework-default styling presented as a finished product identity.
- Gray or tinted page backgrounds behind white cards.

## Implementation rules

- Use Tailwind CSS utilities for product and feature styling; do not add feature CSS modules.
- Keep `app/globals.css` only for Tailwind/shadcn imports, semantic tokens, and the global reset.
- Use shadcn/ui primitives for matching controls, then compose them with this design system at the
  call site. Do not treat the generated shadcn theme as the product's visual identity.

## Agent checklist

Before completing frontend work, verify:

- The screen follows this document and uses semantic tokens.
- The primary user task is visible in the first viewport.
- Every displayed metric or record comes from real product data.
- Loading, empty, success, and failure states are designed.
- Desktop and mobile layouts remain usable.
- No forbidden AI-aesthetic patterns were introduced.
- Fonts are open source and bundled locally.
