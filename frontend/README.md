# Frontend

The frontend is a Next.js App Router application managed with pnpm. Tailwind CSS provides product
styling, and shadcn/ui supplies accessible React primitives. Feature components use Tailwind
utilities instead of separate CSS modules.

The Jobs workspace is the first database-backed feature. It browses and filters canonical jobs in
PostgreSQL and inspects a complete JD with its original source links. Provider ingestion is owned by
the backend and is never triggered from the browser. The remaining routes establish boundaries for
upcoming MVP slices.

All interface work follows [`DESIGN.md`](DESIGN.md), including its open-source font and restrained,
plain-white productivity-workspace rules.

Run `pnpm install` once, then `pnpm dev`.
