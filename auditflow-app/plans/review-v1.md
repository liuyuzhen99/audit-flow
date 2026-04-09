Overall this is a strong MVP plan. The structure is sensible, scope is mostly controlled, and the polling-based mock
strategy is a good fit.

What I’d change/add before implementation:

High-priority changes

1. Add a clear server/client boundary

Right now the plan is UI-centric, but with Next.js App Router you should define this early.

Recommend:

- Keep page.tsx and route-level layout files as Server Components by default
- Move interactive parts into small Client Components
- Put fetch adapters in something like:
  /lib/api
  artists.ts
  queue.ts
  pipeline.ts
  library.ts
  reports.ts

Why: prevents the whole app from turning into use client, which is a common early architecture mistake.

---

2. Add URL-state synchronization for list pages

For Artists, Queue, Pipeline, and Library, search/filter/sort/pagination should live in the URL.

Add explicitly:

- search params as source of truth
- hooks like:
  - use-list-query-state
  - use-sort-param
  - use-filter-params

Why: better shareability, back/forward support, and later API integration.

---

3. Add a data contract layer with validation

Since the app starts with mocks and later swaps to real APIs, define runtime-safe contracts now.

Add:
/lib/schemas
artist.ts
queue.ts
pipeline.ts
library.ts
report.ts
Use zod for:

- mock payload validation
- API response parsing
- shared DTO typing

Why: avoids silent drift between mock data and real backend contracts.

---

4. Revisit generic hooks that may become too abstract

A few hooks feel premature:

- use-dashboard-search.ts
- use-audit-status.ts
- use-polling-resource.ts

These are okay, but don’t let them become “god hooks”.

Recommend:

- keep polling generic
- keep domain mapping in domain-specific selectors/adapters
- treat status display mapping as lib/status.ts or per-domain config, not necessarily a hook

Example:
/lib/adapters/queue.ts
/lib/adapters/pipeline.ts
/lib/status/queue.ts
/lib/status/audit.ts

Why: status mapping and payload normalization are not inherently React concerns.

---

5. Add a proper table foundation

You have data-table.tsx, but the plan should say whether this is based on TanStack Table.

I strongly recommend TanStack Table for:

- sorting
- column visibility
- row selection
- pagination
- reusable cell renderers

Without it, your table layer may become hard to evolve.

---

6. Split mock data from mock behavior

Right now lib/mock-data.ts and mock-generators.ts are mentioned, but behavior simulation deserves a separate layer.

Recommend:
/lib/mocks
data/
factories/
simulators/
handlers/

Example:

- data/queue.ts
- simulators/queue-progress.ts
- handlers/queue.ts

Why: static mock fixtures and state transition logic should not be mixed.

---

Important additions

7. Add design tokens / app theme layer

Since this is a dashboard product, add a minimal token system from day one.

Add:

- semantic colors: success/warning/error/info/muted
- status color mapping
- spacing/container widths
- chart/media panel colors

Could live in:

- globals.css
- Tailwind theme extension
- lib/theme.ts only if really needed

Why: status-heavy UIs get inconsistent fast without semantic tokens.

---

8. Add accessibility requirements to the plan

Missing right now.

At minimum define:

- keyboard navigation for sidebar, tables, tabs, dialogs
- visible focus states
- color contrast for status badges/progress
- screen-reader labels for player controls
- reduced-motion handling for polling/progress updates

For a media workflow dashboard, this matters more than teams expect.

---

9. Add an explicit error/loading/skeleton convention

You mention loading/empty/error states, but not how they’re standardized.

Recommend adding shared components:
/components/shared
loading-state.tsx
error-state.tsx
empty-state.tsx
section-skeleton.tsx
table-skeleton.tsx

Why: avoids every feature inventing its own placeholder patterns.

---

10. Add responsive layout rules, not just “tablet degradation”

“Desktop first, then tablet degradation” is too vague.

Define:

- sidebar behavior under lg
- table overflow strategy
- which KPI cards wrap/collapse
- which library panels become tabs/drawers
- whether detail side panels stack below content on smaller screens

This should be decided now because it affects component APIs.

---

Scope/architecture adjustments

11. Consider delaying /settings

For first implementation pass, /settings may be unnecessary unless it’s in the provided UI.

If the goal is foundation + 4 operational modules, I’d make /settings low priority or stub only.

---

12. Reports should likely be treated as a subdomain, not just a route

/reports/[reportId] is important enough to justify its own feature folder.

Add:
/components/features/reports
report-summary.tsx
report-actions.tsx
report-rule-hit-list.tsx
report-timeline.tsx

Right now report UI is spread between activity/ and media/, which may get messy.

---

13. Library detail page likely needs route segmentation

The library detail screen looks rich enough that tabs may later map cleanly to nested routes.

Consider future-friendly structure:
/library/[assetId]
/library/[assetId]/activity
/library/[assetId]/versions
/library/[assetId]/report

You don’t need to implement nested routes now, but the component design should anticipate it.

---

Missing engineering foundations

14. Add linting, formatting, and quality gates

Should be in phase 1.

Include:

- ESLint
- Prettier
- TypeScript strict mode
- import sorting if your team likes it
- basic CI check commands

If starting from empty workspace, this is part of the frontend foundation.

---

15. Add testing strategy

The plan has verification but not actual automated testing.

For MVP, I’d add:

- unit tests for adapters/status mapping/hooks
- component smoke tests for shared primitives
- one e2e happy path per module

Good fit:

- Vitest + Testing Library
- Playwright for route-level flows

Especially test:

- queue progress transitions
- filter/query param sync
- asset version switching
- report rendering states

---

16. Add a reusable action pattern for row/menu actions

You mention row actions everywhere, but no shared action menu pattern.

Add shared primitives:

- row-actions-menu.tsx
- confirmation dialog conventions
- disabled/loading states for async actions

This becomes important across Queue, Pipeline, Library.

---

Specific folder structure suggestions

I’d slightly refine the structure to reduce cross-cutting sprawl:

/app
/(dashboard)
/artists
/queue
/pipeline
/library
/reports
/api/mock

/components
/layout
/shared
/ui
/features
/artists
/queue
/pipeline
/library
/reports

/lib
/api
/adapters
/mocks
/schemas
/status
/utils

/types

Notes:

- components/ui should hold shadcn-generated primitives
- lib/utils or lib/formatters is fine, but keep domain transforms in adapters/
- activity/ and media/ can stay if heavily reused, but if usage becomes report/library-specific, colocate them under
  those features

---

State strategy review

Your SWR choice is fine for MVP. I would keep it.

But I’d tighten the rule:

Use SWR only for server-backed or mock-server-backed state

For purely local UI state:

- player state
- table selection
- panel open/close
- transient filters before apply

Use local React state, not SWR.

Avoid global state library initially

Do not add Zustand/Redux unless a real cross-page state need appears.

---

One thing I would explicitly document

Define domain models vs view models.

Example:

- raw QueueItemDto
- transformed QueueTableRow

This can live in:

- types/queue.ts for DTOs
- lib/adapters/queue.ts for table/view mapping

Why: dashboards get messy when raw API shapes leak into components.

---

Recommended phase adjustments

I’d revise the phases like this:

1. Foundation
   - Next.js, Tailwind, shadcn, lint/test setup
   - theme tokens
   - app shell
   - route skeletons

2. Data contract + mock platform
   - zod schemas
   - mock fixtures/simulators/handlers
   - adapters + fetch layer

3. Shared interaction system
   - data table
   - toolbar/filter/search
   - status badges/progress/loading/error states
   - URL query-state sync

4. Module implementation
   - Artists
   - Queue
   - Pipeline
   - Library list/detail

5. Deep detail surfaces
   - Reports
   - media player
   - audit timeline/rule hits/comments

6. Polish + validation
   - responsive behavior
   - accessibility
   - e2e coverage
   - visual consistency pass

This order will reduce refactors.

---

Bottom line

Keep

- Next.js App Router
- Tailwind + shadcn/ui
- SWR + polling for MVP
- shared shell + domain feature split
- mock-first approach

Add/change

- server/client boundary rules
- URL query-state sync
- zod schema/contract layer
- TanStack Table
- mock behavior separation
- testing strategy
- accessibility requirements
- loading/error conventions
- semantic design tokens
- adapters/view-model layer

If you want, I can turn this into a revised v2 implementation plan with the structure and phases updated directly.
