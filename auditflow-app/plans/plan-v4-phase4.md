# Phase 4 implementation plan — AuditFlow module completion

## Context

Phase 3 is complete and has already delivered the shared interaction foundation for `auditflow-app`: typed DTOs and Zod validation, adapters, mock sources/API routes, URL-synced list query state, shared table/pagination/status/toolbar primitives, and polling shells for live Queue/Pipeline surfaces. Phase 4 should therefore avoid building more generic infrastructure unless a module requirement proves it necessary. The goal is to finish the four product modules listed in `docs/roadmap.md` — Artists, Queue, Pipeline, and Library list/detail — by wiring module-specific interactions, navigation, and the missing Library detail surface while preserving the existing server-entry + client-shell architecture.

This plan follows the current requirements in `CLAUDE.md` and `docs/coding-standards.md`: enterprise-grade UX, fast and maintainable frontend code, unified naming, professional hand-written mock data, and automated tests for every implemented behavior.

## Scope boundary

### Phase 4 includes

- Complete module-level UI behavior for Artists, Queue, Pipeline, and Library.
- Add the missing `/library/[assetId]` detail route.
- Wire current stub buttons/cards to meaningful actions or clear Phase-4-safe mock behavior.
- Add typed mock endpoints only where needed to support those interactions.
- Keep DTO → adapter → ViewModel separation; no raw DTO display logic in UI components.
- Add focused unit/component/API-route tests for each new behavior.

### Phase 4 explicitly excludes

- Full audit report detail pages and rule-hit deep dives; roadmap places those in Phase 5.
- Full media player implementation; roadmap places media player in Phase 5.
- Real backend integration; continue using typed mock APIs/sources.
- Row selection infrastructure and true long-running bulk operations; Phase 4 can queue a mock bulk operation and show confirmation.
- Authentication/permissions; no auth system exists in the current codebase.
- Replacing the existing polling hook with SWR; although `CLAUDE.md` mentions SWR, the current validated architecture uses `usePollingResource` and should stay consistent for Phase 4.

## Existing code to reuse

- Server-page initial data pattern in:
  - `src/app/(dashboard)/artists/page.tsx`
  - `src/app/(dashboard)/queue/page.tsx`
  - `src/app/(dashboard)/pipeline/page.tsx`
  - `src/app/(dashboard)/library/page.tsx`
- Client-shell pattern in:
  - `src/components/features/artists/artists-dashboard-client.tsx`
  - `src/components/features/queue/queue-dashboard-client.tsx`
  - `src/components/features/pipeline/pipeline-dashboard-client.tsx`
  - `src/components/features/library/library-dashboard-client.tsx`
- Shared list/query utilities:
  - `src/hooks/use-list-query-state.ts`
  - `src/lib/query/list-query.ts`
  - `src/types/api.ts`
- Polling utility:
  - `src/hooks/use-polling-resource.ts`
- API validation/fetch layer:
  - `src/lib/api/fetcher.ts`
  - `src/lib/api/artists.ts`
  - `src/lib/api/queue.ts`
  - `src/lib/api/pipeline.ts`
  - `src/lib/api/library.ts`
- Shared UI primitives:
  - `src/components/shared/data-table.tsx`
  - `src/components/shared/query-pagination.tsx`
  - `src/components/shared/page-toolbar.tsx`
  - `src/components/shared/search-input.tsx`
  - `src/components/shared/stat-card.tsx`
  - `src/components/shared/status-badge.tsx`
  - `src/components/shared/error-state.tsx`
  - `src/components/shared/empty-state.tsx`
  - `src/components/shared/loading-state.tsx`
- Status mappings:
  - `src/lib/status/audit.ts`
  - `src/lib/status/pipeline.ts`
- Mock source/data pattern:
  - `src/lib/mocks/sources/*`
  - `src/lib/mocks/data/*`

## Recommended implementation sequence

### 0. Fix `usePollingResource` interval re-subscription bug

**Why first (prerequisite):** `use-polling-resource.ts` reads `state.data.polling.intervalMs` in the `setInterval` effect dependency array. Every time `intervalMs` changes in a polled response, the interval tears down and restarts, causing one missed tick. Phase 4 adds more polling consumers (Pipeline stop action, Queue row actions) — fix this before wiring them.

**Modify:**

- `src/hooks/use-polling-resource.ts`
  - Add an `intervalMsRef = useRef(initialData.polling.intervalMs)`.
  - Keep `intervalMsRef.current` in sync inside the existing data-update path.
  - Change the `setInterval` effect dependency array to `[state.data.polling.terminal]` only.
  - The interval callback reads `intervalMsRef.current` dynamically instead of closing over `state.data.polling.intervalMs`.

**Tests:**

- Extend `use-polling-resource.test.ts` to verify that changing `intervalMs` in a polled response does not restart the interval (i.e., no missed tick between the old and new interval).

### 1. Add Artists-scoped query type for date filter

**Why first (after step 0):** Artists needs a “Recent 2 Weeks” filter. This must NOT be added to the shared `ListQueryDto` — that type is used by all four modules and must stay generic. Instead, define a module-scoped extension type and keep all date-range logic inside the Artists domain.

**Create/Modify:**

- `src/types/artist.ts`
  - Add `ArtistsListQueryDto` extending `ListQueryDto` with `dateRange?: “2w”`.
- `src/hooks/use-list-query-state.ts`
  - Add a generic `setFilter(key: string, value: string | undefined)` method following the existing `setStatus` pattern. This is the shared escape hatch for module-specific filters.
- `src/components/features/artists/artists-dashboard-client.tsx`
  - Wrap `setFilter` into a typed local `setDateRange(value: “2w” | undefined)` helper.
- `src/lib/mocks/sources/artists.ts` and `src/app/api/mock/artists/route.ts`
  - Accept and parse `dateRange` from the Artists-scoped query type only. No changes to shared `parseListQueryParams`.

**Tests:**

- Extend `use-list-query-state.test.tsx` to verify `setFilter` updates the URL and resets page.
- Extend artists mock source tests to verify `dateRange=2w` filters correctly and invalid values are ignored.

### 2. Implement Library asset detail data contract and source

**Why second:** `/library/[assetId]` is the largest missing Phase 4 surface and becomes the target for Library cards and Pipeline “Open in Library”.

**Modify:**

- `src/lib/mocks/data/library.ts`
  - Enrich hand-written seed assets with realistic `versions` data.
  - Keep `metadata.sourceStatus` meaningful for the detail page.
- `src/lib/mocks/sources/library.ts`
  - Add a typed lookup function such as `getLibraryAssetDetail(assetId: string)`.
  - Return a single `LibraryAssetDto` for known assets.
  - Throw or return a not-found state for unknown assets, matching current mock source style.
- `src/types/library.ts`
  - Add `LibraryAssetDetailViewModel` and small nested view-model types for versions/metadata if needed.
  - Reuse the existing `LibraryAssetDto`, `AssetVersionDto`, and `AssetMetadataDto`; do not duplicate DTOs.
- `src/lib/adapters/library.ts`
  - Add `adaptLibraryAssetDetail(item: LibraryAssetDto)`.
  - Reuse existing formatting logic (`formatDuration`, `formatDateLabel`, status mapping, gradient selection).
  - Expose display-ready fields: title, artist, status label/tone, duration, resolution, created date, source status label, versions with formatted dates, and gradient class.
- `src/lib/schemas/library.ts`
  - Reuse the existing `libraryAssetDtoSchema` if it already validates a single asset shape.
  - Only add a new response schema if the API route wraps the asset in an object.

**Tests:**

- Add/extend adapter tests for `adaptLibraryAssetDetail`.
- Add source tests for known and unknown `assetId` lookup.
- Extend schema tests only if a new response shape is added.

### 3. Add the `/library/[assetId]` route and detail client

**Why third:** Build the new user-facing surface after the data layer exists, and keep it scoped to Phase 4 detail requirements without pulling in the Phase 5 media player/report viewer.

**Create:**

- `src/app/(dashboard)/library/[assetId]/page.tsx`
  - Server component.
  - Reads `params.assetId`.
  - Calls the new mock source directly, matching current server-page patterns.
  - Adapts with `adaptLibraryAssetDetail`.
  - Handles unknown IDs with Next.js `notFound()`.
  - Renders a header with a back link to `/library`, the asset title, artist name, and status.
  - Add prev/next navigation (enterprise UX): compute `prevId`/`nextId` from the current filtered list (mock source can expose an ordered list), and pass them to the client so users can move through assets without going back to the grid.

- `src/app/(dashboard)/library/[assetId]/error.tsx`
  - Next.js route error boundary.
  - Render `ErrorState` with a "Failed to load asset" message and a back link to `/library`.

- `src/components/features/library/library-asset-detail-client.tsx`
  - Client component for interactive but local-only detail behavior.
  - Render a hero/preview placeholder using the existing gradient class rather than a real media player.
  - Render metadata cards for duration, resolution, source processing status, and created date.
  - Render version cards from the asset’s `versions` list.
  - Render a compact audit/activity placeholder panel that links the concept to Phase 5 but does not require `AuditReportDto` rendering.
  - Render prev/next navigation links when provided.

**Important UX constraints:**

- The preview area should clearly communicate “preview/player coming in Phase 5” without feeling broken.
- Use Tailwind tokens and existing `StatusBadge`/`StatCard` where appropriate.
- Keep the route responsive: one-column on small screens, split detail/side panel on large screens.

**Tests:**

- New `src/components/features/library/library-asset-detail-client.test.tsx` verifying:
  - Title, artist, status, duration, resolution, source status, and version labels render.
  - Empty versions state renders gracefully if a fixture has no versions.
  - Prev/next links render only when ids are provided.
- Extend dashboard page tests or add a route-level test verifying unknown assets call `notFound()` if the current test setup supports it.
- Add a basic `error.tsx` render test if your test setup supports App Router error boundary testing; otherwise keep it manual-verified.

### 4. Make Library list cards navigable

**Why fourth:** This is a small UI change, but it should target an existing route.

**Modify:**

- `src/components/features/library/library-dashboard-client.tsx`
  - Wrap each asset card with `next/link` to `/library/${asset.id}`.
  - Preserve the current card visual design.
  - Add hover/focus styles: visible focus ring, subtle shadow/translate transition, and accessible link text.

**Tests:**

- Extend `library-dashboard-client.test.tsx` to assert each card has the correct link destination.
- Verify keyboard-accessible link behavior by checking rendered anchors rather than only click handlers.

### 5. Wire Artists toolbar behavior

**Why fifth:** Artists is already query-driven and non-polling, so it is a safe place to complete module-specific filter/actions after the Artists-scoped query support exists.

**Modify:**

- `src/lib/mocks/sources/artists.ts`
  - Accept `dateRange` from `ArtistsListQueryDto`.
  - When `dateRange === "2w"`, filter artists by their recent sync/release date fields using deterministic mock dates rather than `Date.now()` where possible.
- `src/app/api/mock/artists/route.ts`
  - Read `dateRange` from query params and pass through to the mock source (module-scoped only).
- `src/components/features/artists/artists-dashboard-client.tsx`
  - Wire “Recent 2 Weeks” as a toggle using the local typed wrapper around `setFilter("dateRange", value)`.
  - Replace the inert “Filter” button with concrete status filter controls, following the existing Queue/Library status button pattern.
  - **Bulk Download (enterprise-safe):** avoid an implicit bulk operation over an invisible filter set.
    - Preferred Phase 4 behavior: disable the button and label it “Bulk Download (Phase 5)” with an accessible tooltip explaining row selection will be added in Phase 5.
    - Acceptable alternative if you must ship behavior in Phase 4: make the scope explicit in the label, e.g. “Bulk Download (12)”, and require a confirmation modal that states exactly what will be included.

**Optional new mock route if needed (only if shipping behavior in Phase 4):**

- `src/app/api/mock/artists/bulk-download/route.ts`
  - `POST` returns a typed success payload such as `{ queued: true, count: number }`.
  - Keep it deterministic and side-effect-free.

**Tests:**

- Extend `artists-dashboard-client.test.tsx` to verify:
  - Recent 2 Weeks toggles `dateRange=2w` in the URL.
  - Status filter updates `status` in the URL.
  - Bulk Download is either disabled and clearly Phase-5-gated, or (if implemented) shows pending/success UI with explicit count confirmation.
- Add API-route tests for the bulk-download mock route if created.

### 6. Add Queue row and header actions

**Why sixth:** Queue already has live polling, filtering, sorting, and pagination. Phase 4 should make row-level operational paths explicit without building Phase 5 reports.

**Modify:**

- `src/types/queue.ts`
  - Add `reportId: string | null` to the queue DTO/ViewModel only if the current DTO lacks an equivalent report reference.
- `src/lib/schemas/queue.ts`
  - Validate `reportId` if added.
- `src/lib/mocks/data/queue.ts` and/or `src/lib/mocks/simulators/queue.ts`
  - Seed/pass through `reportId` for items that have completed or entered manual review.
- `src/lib/adapters/queue.ts`
  - Pass `reportId` through to `QueueTableRowViewModel`.
- `src/components/features/queue/queue-dashboard-client.tsx`
  - Add an Actions column to the existing `DataTable`.
  - **Column sizing (enterprise table UX):** define the Actions column with `size: 140` via TanStack Table's column sizing API. Use icon buttons (not text buttons) — arrow icon + tooltip for “Route to Pipeline”, document icon for “View Report”. This prevents the 6th column from overflowing or compressing existing columns on 1280px viewports.
  - “Route to Pipeline” should navigate to `/pipeline` using `useRouter` or `Link`.
  - “View Report” should be present but clearly Phase-5-gated unless a report route exists. Recommended behavior: disabled button with accessible title/description when no report route is available.
- `src/app/(dashboard)/queue/page.tsx`
  - Convert the header “Route to Pipeline” button to a real link to `/pipeline`.
  - Keep “Export Report” as a mock action only if a typed mock endpoint is added; otherwise label it as disabled/coming later to avoid a fake dead control.

**Tests:**

- Extend `queue-dashboard-client.test.tsx` to verify:
  - Route-to-pipeline actions render with `/pipeline` targets.
  - Report action is disabled or labelled as Phase-5-gated when no report route exists.
  - Existing polling behavior still renders last-good data on refresh error.
- Extend queue schema/adapter tests if `reportId` is added.

### 7. Wire Pipeline operational actions

**Why seventh:** Pipeline depends on Library detail for “Open in Library” and should keep mutation behavior lightweight until real backend integration.

**Modify:**

- `src/types/pipeline.ts`
  - Add `assetId: string | null` to deliverable DTO/ViewModel if no equivalent exists.
- `src/lib/schemas/pipeline.ts`
  - Validate deliverable `assetId`.
- `src/lib/mocks/data/pipeline.ts` and/or `src/lib/mocks/simulators/pipeline.ts`
  - Attach realistic `assetId` values to deliverables, pointing at existing library seed records.
- `src/lib/adapters/pipeline.ts`
  - Pass deliverable `assetId` through to the ViewModel.
- `src/components/features/pipeline/pipeline-dashboard-client.tsx`
  - “Open in Library” becomes a link to the first deliverable with a non-null `assetId`.
  - Disable or hide “Open in Library” when no linked asset exists.
  - “Stop Current Task” calls a typed mock `POST` endpoint and displays local pending/success/failure state.
  - **”Clear Console” (correct behavior):** do not simply hide rows until the next poll — that causes logs to reappear 4 seconds later, which feels broken. Instead, track a `clearedAtTick` ref in the client. On click, record `data.polling.tick`. The log render filters to only show entries where `entry.tick > clearedAtTick`. New log lines from subsequent polls appear normally; old lines stay hidden. Purely local state, no server mutation.
- `src/app/(dashboard)/pipeline/page.tsx`
  - Prefer moving action buttons that need client state into `PipelineDashboardClient` if they require POST/pending behavior.
  - If header buttons remain server-rendered, only convert safe navigation actions to `Link`; do not add inert buttons.

**Create if needed:**

- `src/app/api/mock/pipeline/stop/route.ts`
  - `POST` returns a typed success payload.
- A small API helper in `src/lib/api/pipeline.ts`, e.g. `stopPipelineJob(jobId: string)`.
- A Zod schema for the action response if current common schemas do not cover it.

**Tests:**

- Extend `pipeline-dashboard-client.test.tsx` to verify:
  - Open-in-Library link points at `/library/[assetId]`.
  - Missing `assetId` renders a disabled/absent action.
  - Stop action calls the mock API helper and shows pending/success/error UI.
  - Clear Console removes current log rows locally.
- Extend pipeline schema/adapter tests for deliverable `assetId`.
- Add API-route tests for stop mock route if created.

### 8. Add focused mock action client helpers only where repeated

**Why eighth:** Phase 4 needs a few POST-like mock actions, but creating a full mutation framework would be premature.

**Recommended approach:**

- Keep one small API function per domain action in existing files:
  - `src/lib/api/artists.ts` for bulk download.
  - `src/lib/api/pipeline.ts` for stop task.
- Reuse `fetchValidatedJson` if it supports method/options cleanly; otherwise make a minimal local `fetch` with Zod parse in the domain API file.
- Do not introduce a shared mutation hook unless at least two actions share non-trivial identical state handling after implementation.

**Tests:**

- Add API helper tests beside existing `src/lib/api/index.test.ts` coverage.
- Mock `fetch` and verify request method/body/schema handling.

## Verification plan

Run all commands from `auditflow-app`, per `CLAUDE.md`.

1. Unit/component tests:
   - `npm test`
2. Lint:
   - `npm run lint`
3. Type safety:
   - `npm run typecheck`
4. Production build:
   - `npm run build`
5. Manual UI verification with local dev server:
   - Start the app from `auditflow-app`.
   - Verify `/artists`:
     - Search, sort, pagination still work.
     - Recent 2 Weeks toggles URL and results.
     - Status filter changes URL/results.
     - Bulk Download displays clear pending/success/error feedback.
   - Verify `/queue`:
     - Search/status/sort/pagination still work under polling.
     - Route-to-pipeline links navigate correctly.
     - Report action is not a broken dead route.
   - Verify `/pipeline`:
     - Polling still updates live data.
     - Open in Library navigates to a real asset detail page.
     - Stop Current Task and Clear Console show expected local feedback.
   - Verify `/library`:
     - Search/status filters still work.
     - Cards are keyboard-accessible links.
     - Cards navigate to `/library/[assetId]`.
   - Verify `/library/[assetId]`:
     - Known asset renders detail layout.
     - Unknown asset shows Next.js not-found behavior.
     - Responsive layout is usable on small and large widths.

## Risks and mitigations

- **Shared query regression:** The `ListQueryDto` type is NOT modified in Phase 4. Artists date filtering uses a module-scoped `ArtistsListQueryDto` extension. Mitigate with parse/serialize/page-reset tests and manual checks on Artists, Queue, and Library.
- **Polling interval re-subscription:** Fixed in step 0 before any new polling consumers are added. Covered by `use-polling-resource.test.ts`.
- **Scope creep into Phase 5:** Library detail can easily become a media player/report viewer. Keep it read-only and summary-level; only render preview placeholder, versions, metadata, and audit/activity summary.
- **Dead navigation:** Queue report routes do not exist yet. Do not add links that 404 during normal Phase 4 use; disable/label Phase-5-gated report actions.
- **Bulk action implicit scope:** Bulk Download must not operate on an invisible implicit filter set. Either gate it to Phase 5 (preferred) or make the scope explicit in the button label with a confirmation modal.
- **Mock action overengineering:** Avoid building a generic mutation framework. Use small domain API helpers and local component state.
- **Polling regressions:** Pipeline/Queue action wiring should not interfere with `usePollingResource`; tests should preserve last-good-data and terminal-stop behavior.
- **Data consistency:** Pipeline deliverable `assetId` values must point to actual `librarySeedRecords` IDs so Open in Library never links to a missing asset in the happy path.
- **Table overflow:** Queue Actions column must use `size: 140` and icon buttons to avoid compressing or overflowing the existing 5-column layout on 1280px viewports.
- **Route error handling:** Every new route added in Phase 4 must have a co-located `error.tsx` boundary rendering `ErrorState`. Do not rely on the root error boundary for module-level failures.

## Done criteria

Phase 4 is complete when:

- Artists toolbar actions are wired and URL/query behavior is tested.
- Queue has meaningful row/header actions without dead report routes.
- Pipeline actions are wired to real navigation or typed mock actions.
- Library cards navigate to a complete `/library/[assetId]` detail page.
- All new DTO/schema/adapter changes are covered by tests.
- All new client behavior is covered by component tests.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass from `auditflow-app`.
- Manual UI verification confirms the four module flows work end-to-end in the browser.
