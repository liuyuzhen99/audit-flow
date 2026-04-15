# Phase 4 Status — AuditFlow Module Completion

**Date:** 2026-04-14
**Branch:** master
**CI status:** all checks passing

---

## Done criteria checklist

| Criterion | Status |
|---|---|
| Artists toolbar actions wired and URL/query behavior tested | ✅ |
| Queue has meaningful row/header actions without dead report routes | ✅ |
| Pipeline actions wired to real navigation or typed mock actions | ✅ |
| Library cards navigate to `/library/[assetId]` detail page | ✅ |
| All new DTO/schema/adapter changes covered by tests | ✅ |
| All new client behavior covered by component tests | ✅ |
| `npm test` passes | ✅ 154/154 |
| `npm run lint` passes | ✅ |
| `npm run typecheck` passes | ✅ |
| `npm run build` passes | ✅ |
| Manual UI verification | pending (user) |

---

## What was implemented

### Step 0 — Polling interval fix
- `src/hooks/use-polling-resource.ts`: added `intervalMsRef` to avoid interval restart on `intervalMs` change; effect now depends only on `terminal` flag.
- Test: `use-polling-resource.test.ts` verifies no missed tick when `intervalMs` changes mid-poll.

### Step 1 — Artists-scoped date filter
- `src/types/artist.ts`: added `ArtistsListQueryDto` extending `ListQueryDto` with `dateRange?: "2w"`.
- `src/hooks/use-list-query-state.ts`: added `setFilter(key, value)` generic escape hatch; added `extraFiltersRef` to carry module-specific params through `navigate`.
- `src/lib/mocks/sources/artists.ts`: `filterArtists` accepts `dateRange`; deterministic cutoff `2026-03-31`.
- `src/app/api/mock/artists/route.ts`: reads `dateRange` separately from shared `parseListQueryParams`.
- `src/app/(dashboard)/artists/page.tsx`: reads `dateRange` from `searchParams` and passes to mock source.
- Tests: `use-list-query-state.test.tsx`, `sources/index.test.ts`, `dashboard-pages.test.tsx`.

### Step 2 — Library asset detail data contract
- `src/lib/mocks/data/library.ts`: enriched seed records with realistic `versions` arrays (asset-1: 3 versions, asset-2: 2, asset-3: 1, asset-4: empty).
- `src/lib/mocks/sources/library.ts`: added `getLibraryAssetDetail(assetId)` and `getOrderedLibraryAssetIds(query?)`.
- `src/types/library.ts`: added `LibraryAssetVersionViewModel` and `LibraryAssetDetailViewModel`.
- `src/lib/adapters/library.ts`: added `adaptLibraryAssetDetail`; extracted `getGradientClassName` and `formatSourceStatusLabel` helpers.
- Tests: `adapters/index.test.ts`, `sources/index.test.ts`.

### Step 3 — `/library/[assetId]` route and detail client
- `src/app/(dashboard)/library/[assetId]/page.tsx`: server component; `notFound()` for unknown IDs; computes `prevId`/`nextId` from ordered list.
- `src/app/(dashboard)/library/[assetId]/error.tsx`: route error boundary rendering `ErrorState` with back link.
- `src/components/features/library/library-asset-detail-client.tsx`: hero gradient placeholder, metadata cards (Duration, Resolution, Source, Created), versions list with empty state, audit activity placeholder, prev/next navigation links.
- Tests: `library-asset-detail-client.test.tsx` (5 tests).

### Step 4 — Library list cards navigable
- `src/components/features/library/library-dashboard-client.tsx`: replaced `<article>` with `<Link href="/library/${id}">` per card; added hover/focus styles and group transitions.
- Tests: `library-dashboard-client.test.tsx` extended with link destination assertion.

### Step 5 — Artists toolbar behavior
- `src/components/features/artists/artists-dashboard-client.tsx`: wired "Recent 2 Weeks" toggle via `setFilter("dateRange", ...)`, concrete status filter buttons (All / Approved / Review / Rejected / Monitoring), disabled "Bulk Download (Phase 5)" with tooltip.
- Tests: `artists-dashboard-client.test.tsx` (5 tests).

### Step 6 — Queue row and header actions
- `src/lib/schemas/queue.ts`: added `reportId: z.string().nullable()`.
- `src/lib/mocks/data/queue.ts`: added `reportId` to seed records.
- `src/lib/mocks/simulators/queue.ts`: passes `reportId` only for terminal statuses.
- `src/lib/adapters/queue.ts`: passes `reportId` through to `QueueTableRowViewModel`.
- `src/components/features/queue/queue-dashboard-client.tsx`: added Actions column (`size: 140`) with Route-to-Pipeline `<Link href="/pipeline">` and Phase-5-gated View Report disabled button.
- `src/app/(dashboard)/queue/page.tsx`: header "Route to Pipeline" is a `<Link>`; "Export Report" is disabled and labelled Phase 5.
- Tests: `queue-dashboard-client.test.tsx` (6 tests).

### Step 7 — Pipeline operational actions
- `src/lib/schemas/pipeline.ts`: added `tick` to log entry schema; added `assetId` to deliverable schema.
- `src/lib/mocks/data/pipeline.ts`: added `assetId` to seed records.
- `src/lib/mocks/simulators/pipeline.ts`: `buildLogs` includes `tick`; `buildDeliverables` includes `assetId` when ready.
- `src/lib/adapters/pipeline.ts`: passes `tick` and `assetId` through to view models.
- `src/app/api/mock/pipeline/stop/route.ts`: POST endpoint returning `{ success, jobId, message }`.
- `src/lib/api/pipeline.ts`: added `stopPipelineJob` helper with Zod-validated response.
- `src/components/features/pipeline/pipeline-dashboard-client.tsx`:
  - "Open in Library" is a `<Link>` when a deliverable has `assetId`, disabled button otherwise.
  - "Stop Current Task" calls `stopPipelineJob`, shows pending/success/error state.
  - "Clear Console" records `clearedAtTick` ref; `visibleLogs` filters by `tick > clearedAtTick`; `renderCount` in memo deps ensures immediate re-render.
- `src/app/(dashboard)/pipeline/page.tsx`: "Resume Paused" and "Create Task" are disabled and labelled as later-phase.
- Tests: `pipeline-dashboard-client.test.tsx` (8 tests), `routes.test.ts` extended, `api/index.test.ts` extended.

### Step 8 — Library page header cleanup
- `src/app/(dashboard)/library/page.tsx`: "Grid View" and "Refresh Sync" are now disabled and labelled Phase 5 (were previously live-looking inert buttons).

---

## Test summary

| Suite | Tests |
|---|---|
| `use-polling-resource.test.ts` | 5 |
| `use-list-query-state.test.tsx` | 6 |
| `domain-schemas.test.ts` | 10 |
| `sources/index.test.ts` | 14 |
| `adapters/index.test.ts` | 9 |
| `simulators/queue.test.ts` | 4 |
| `simulators/pipeline.test.ts` | 4 |
| `api/index.test.ts` | 7 |
| `api/mock/routes.test.ts` | 7 |
| `dashboard-pages.test.tsx` | 10 |
| `artists-dashboard-client.test.tsx` | 5 |
| `queue-dashboard-client.test.tsx` | 6 |
| `pipeline-dashboard-client.test.tsx` | 8 |
| `library-dashboard-client.test.tsx` | 3 |
| `library-asset-detail-client.test.tsx` | 5 |
| shared component suites | 21 |
| **Total** | **154** |

---

## Remaining for Phase 5

- Full audit report detail pages and rule-hit deep dives.
- Media player in Library detail.
- Row selection and true Bulk Download for Artists.
- "View Report" link in Queue (requires report detail route).
- "Open in Library" from Pipeline for all deliverable types.
- "Resume Paused" and "Create Task" in Pipeline.
- "Grid View" toggle and "Refresh Sync" in Library.
- Real backend integration (replace mock API routes).
