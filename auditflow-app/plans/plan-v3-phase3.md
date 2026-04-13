# Context

Phase 1 is complete and Phase 2 has already delivered the typed contract, schema, mock-data, adapter, API, and async-state foundation for `auditflow-app`. The remaining Phase 2 gap is optional-but-useful live client polling for Queue and Pipeline. Phase 3 should build on that stable foundation to add the shared interaction system defined in `auditflow-app/docs/roadmap.md`: reusable table, toolbar/filter/search controls, shared status/progress/loading/error patterns, and URL query-state sync.

This plan follows `auditflow-app/CLAUDE.md` and `auditflow-app/docs/coding-standards.md`: keep the architecture extensible and enterprise-ready, reuse the existing typed layers, keep naming consistent, add comments only when needed, and verify all changed behavior with tests.

## Recommended approach

### 1. Finish the Phase 2 leftover before broader Phase 3 work
Implement narrow client-side live polling for Queue and Pipeline without turning the route pages into broad client pages.

**Reuse**
- `auditflow-app/src/lib/api/queue.ts`
- `auditflow-app/src/lib/api/pipeline.ts`
- `auditflow-app/src/hooks/use-polling-resource.ts`
- `auditflow-app/src/lib/adapters/queue.ts`
- `auditflow-app/src/lib/adapters/pipeline.ts`
- `auditflow-app/src/lib/mocks/sources/queue.ts`
- `auditflow-app/src/lib/mocks/sources/pipeline.ts`

**Critical files to modify**
- `auditflow-app/src/app/(dashboard)/queue/page.tsx`
- `auditflow-app/src/app/(dashboard)/pipeline/page.tsx`
- `auditflow-app/src/hooks/use-polling-resource.ts`
- likely new/expanded feature components under `auditflow-app/src/components/features/queue/` and `auditflow-app/src/components/features/pipeline/`

**Implementation notes**
- Keep `queue/page.tsx` and `pipeline/page.tsx` as server entry points that assemble the initial payload.
- Extract the live-rendering parts into small client feature components that receive initial data and then poll through the typed client fetch layer.
- Continue using the adapter layer so UI components render view models instead of raw DTOs.
- Preserve deterministic `tick`-based progression from the existing mock simulators.
- Treat stale-response rejection, refresh error handling, and terminal-stop behavior as explicit hook/client-polling requirements to implement and verify, not as assumptions about the current hook.

**Decisions to lock during implementation**
- Polling continues to use `tick` and terminal payloads to control progression.
- Keep `polling.intervalMs` fixed for each mounted polling flow in this phase unless there is a concrete product need to add dynamic rescheduling support in `use-polling-resource`.
- Terminal payloads stop further polling.
- Stale/out-of-order responses are ignored.
- Refresh errors should keep the last good data on screen and surface a non-blocking error state.
- Display labels remain adapter/status-map driven so future EN/ZH expansion does not require contract changes.

### 2. Lock the shared query-state contract for Phase 3
Build Phase 3 on top of the common query vocabulary that already exists instead of inventing page-local params.

**Reuse**
- `auditflow-app/src/types/api.ts`
- `auditflow-app/src/lib/schemas/common.ts`

**Canonical query params**
- `page`
- `pageSize`
- `q`
- `status`
- `sortBy`
- `sortDirection`
- keep `tick` reserved for live polling flows only

**Implementation notes**
- URL state should be the source of truth for search/filter/sort/pagination.
- Shared interaction components should write query state; page loaders and client fetchers should read it.
- Parse and serialize query params through one shared helper or hook built on the existing typed query contract so names, defaults, and reset behavior stay canonical across pages.
- Avoid duplicated local state that can drift from the URL.

### 3. Build the shared interaction primitives
Upgrade the current presentational controls into reusable, controlled interaction components.

**Reuse / evolve**
- `auditflow-app/src/components/shared/page-toolbar.tsx`
- `auditflow-app/src/components/shared/search-input.tsx`
- `auditflow-app/src/components/shared/status-badge.tsx`
- `auditflow-app/src/components/shared/loading-state.tsx`
- `auditflow-app/src/components/shared/error-state.tsx`
- `auditflow-app/src/components/shared/empty-state.tsx`
- `auditflow-app/src/components/shared/section-skeleton.tsx`

**Critical files to modify**
- `auditflow-app/src/components/shared/page-toolbar.tsx`
- `auditflow-app/src/components/shared/search-input.tsx`
- likely new shared hooks/components under:
  - `auditflow-app/src/hooks/`
  - `auditflow-app/src/components/shared/`

**Implementation notes**
- Keep `PageToolbar` mainly as a layout shell.
- Make `SearchInput` controlled and URL-driven.
- Add shared filter/sort/pagination/query-sync primitives instead of burying logic inside each page.
- Keep naming unified and avoid over-generalized abstractions.

### 4. Build the shared data table on the existing dependency
Use the installed `@tanstack/react-table` dependency for the first reusable table foundation.

**Reuse**
- `auditflow-app/package.json` already includes `@tanstack/react-table`
- adapter outputs from:
  - `auditflow-app/src/lib/adapters/artists.ts`
  - `auditflow-app/src/lib/adapters/queue.ts`
  - `auditflow-app/src/lib/adapters/library.ts`
  - `auditflow-app/src/lib/adapters/pipeline.ts`

**Critical files to modify**
- likely new shared table files under `auditflow-app/src/components/shared/`
- `auditflow-app/src/app/(dashboard)/artists/page.tsx`
- `auditflow-app/src/app/(dashboard)/queue/page.tsx`

**Implementation notes**
- First iteration should support typed columns, sortable headers, empty/loading/error slots, status cells, and progress cells.
- Start with Artists, then Queue.
- Do not force Pipeline or Library into a table abstraction where it does not fit.

### 5. Integrate Phase 3 module by module
Apply the shared interaction system incrementally in the order that minimizes rework.

**Recommended sequence**
1. Artists
2. Queue
3. Library
4. Pipeline

**Why this order**
- Artists is the simplest proving ground for search/sort/query sync.
- Queue reuses the table foundation and adds live status/progress behavior.
- Library should reuse toolbar/query-state/shared states where they improve the current grid workflow, but it should not be forced into table-style interactions that do not fit the asset browser UX.
- Pipeline should reuse only the interaction pieces that fit its console/detail surface.

**Critical files to modify**
- `auditflow-app/src/app/(dashboard)/artists/page.tsx`
- `auditflow-app/src/app/(dashboard)/queue/page.tsx`
- `auditflow-app/src/app/(dashboard)/library/page.tsx`
- `auditflow-app/src/app/(dashboard)/pipeline/page.tsx`

## Risks and guardrails

- Do not bypass the existing DTO → schema → adapter → UI layering.
- Do not move transport shaping into pages/components.
- Do not create one mega-abstraction that tries to unify table pages, card pages, and live pipeline polling in a single API.
- Keep raw status values canonical in data contracts and map display labels through adapters/status helpers.
- Leave room for bilingual EN/ZH product content in labels and statuses.

## Verification

Run validation from `auditflow-app`.

### Tests to add/update
- polling hook tests for:
  - terminal stop
  - stale response rejection
  - refresh error behavior
  - any hidden-tab behavior if introduced
- client fetch/query tests for queue and pipeline polling inputs
- direct shared primitive tests for controlled search input behavior, toolbar composition, and shared query-state reset semantics
- shared query-state hook tests for URL read/write, debounce, reset, and back/forward behavior
- shared table/render tests for loading, error, empty, sortable headers, status cells, and progress cells
- page/module integration tests for:
  - Artists search/sort/query sync
  - Queue search/filter/query sync plus live updates
  - Library shared toolbar/query behavior
  - Pipeline shared states plus live console updates

### Full validation
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
