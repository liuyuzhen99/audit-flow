# Phase 5 Implementation Plan

## Context

Phase 4 completed the shared dashboard foundations and shipped the module surfaces for Artists, Queue, Pipeline, and Library detail. The remaining roadmap work for Phase 5 in `auditflow-app/docs/roadmap.md` is the first full deep-detail experience: **Reports**, **media player**, and **audit timeline / rule hits / comments**. The current codebase already has the right foundations to extend rather than replace: typed DTO/schema/api layers, adapter-first UI shaping, polling for live surfaces, URL-backed query state, and an initial `/library/[assetId]` detail page with Phase 5 placeholders.

This implementation should turn the current placeholders into working detail surfaces while staying aligned with `auditflow-app/CLAUDE.md` and `auditflow-app/docs/coding-standards.md`: enterprise-grade UX, extensible structure, unified naming, necessary clear comments, and test coverage for every change.

## Architecture decisions

### 1. Keep transport models separate from page view models

Phase 5 must **not** make DTOs page-shaped. The backend/mock contract should describe report and library detail data in a reusable transport/domain shape, while adapters own page-specific formatting and display composition.

**Rule**
- DTOs and Zod schemas describe data returned by sources/APIs.
- Adapters shape that data for `ReportDetailClient` and `LibraryAssetDetailClient`.
- Route files stay orchestration-focused and do not perform presentation formatting.

### 2. Define report detail as the source of truth for audit activity

Rule hits, audit timeline, and comments are conceptually report data. Library detail may surface a report summary and may embed shared audit-detail sections when a linked report exists, but it should do so from the same report-detail model rather than a second independent implementation.

**Rule**
- `/reports/[reportId]` is the canonical full audit-detail surface.
- `/library/[assetId]` shows media-first detail and links to the related report.
- If Library detail displays rule hits/timeline/comments inline, it must use the same shared section components and adapter-shaped report-detail view models.

### 3. Phase 5 comment scope is read-only

Comments in this phase are **display-only**. There is no create/edit/delete workflow in Phase 5.

**Reason**
- This keeps the phase aligned with the roadmap scope and avoids introducing form, mutation, moderation, or optimistic-update complexity.

### 4. Reuse existing patterns instead of inventing parallel ones

The codebase already has working patterns for mock sources, API validation, adapters, App Router pages, polling, and tests. Phase 5 should extend those conventions instead of adding a second architecture.

**Existing reuse anchors**
- `auditflow-app/src/lib/api/fetcher.ts`
- `auditflow-app/src/lib/api/reports.ts`
- `auditflow-app/src/lib/adapters/*`
- `auditflow-app/src/app/api/mock/*`
- `auditflow-app/src/hooks/use-polling-resource.ts`
- `auditflow-app/src/hooks/use-list-query-state.ts`

## Non-functional requirements

### Performance and loading

- Keep route-level payloads focused on the detail surfaces being rendered.
- Prefer server-side loading for first paint, then client-side refresh only where genuinely useful.
- New detail sections must render meaningful loading states instead of blank space.
- Large lists (timeline, rule hits, comments) must use a bounded initial render with an explicit expansion pattern such as “Show more”. Do not assume these lists stay small.

### Refresh behavior

- Default Phase 5 behavior is **static-on-load** for report and library detail routes.
- Only add polling to sections whose value is expected to change during an active session.
- If polling is used, it must reuse `usePollingResource` and document the refresh trigger and stop condition in code/tests.

### Accessibility and UX

- The media player surface must be keyboard reachable and its controls must have accessible labels.
- Detail sections must preserve readable hierarchy, empty states, and responsive layout behavior.
- Error states must be actionable and visually consistent with existing dashboard patterns.

### Data trust and safety

- Comments and text fields are treated as untrusted display data and rendered as plain content, not injected HTML.
- Media sources should be treated as validated URLs from the mock/API contract, with clear fallback UI when unavailable.

## Recommended approach

### 1. Expand the report and library detail contracts first

Make the transport contracts complete enough to support report detail, library media detail, and linked navigation without forcing page-specific formatting into the DTO layer.

**Primary files**

- `auditflow-app/src/types/audit-report.ts`
- `auditflow-app/src/types/library.ts`
- `auditflow-app/src/lib/schemas/report.ts`
- `auditflow-app/src/lib/mocks/data/reports.ts`
- `auditflow-app/src/lib/mocks/data/library.ts`
- `auditflow-app/src/lib/mocks/sources/reports.ts`
- `auditflow-app/src/lib/mocks/sources/library.ts`
- `auditflow-app/src/lib/api/reports.ts`
- `auditflow-app/src/app/api/mock/reports/route.ts`

**Work**

- Extend `AuditReportDto` beyond the current minimal `ruleHits` + `timeline` shape to include reusable transport fields for:
  - report header/summary metadata
  - linked asset metadata
  - media-related metadata needed by report-linked surfaces
  - read-only comments
- Extend library asset detail types with media source information and linked report metadata.
- Keep route handling thin and continue validating responses with Zod.
- Ensure report and library contracts stay transport-oriented rather than page-shaped.

**Acceptance criteria**

- DTOs and schemas support all Phase 5 detail surfaces without presentation-only fields.
- API/schema tests cover required fields, optional fields, and absent linked-report/media scenarios.
- Mock data includes at least:
  - one fully populated report
  - one report with empty comments
  - one asset with linked report
  - one asset without playable media or without linked report

**Reuse**

- `fetchValidatedJson` in `auditflow-app/src/lib/api/fetcher.ts`
- Existing Zod response parsing pattern in `auditflow-app/src/lib/api/reports.ts`
- Existing mock source pattern used across `src/lib/mocks/sources/*`

### 2. Add dedicated adapters for report detail and enriched library detail

Create explicit adapter boundaries so report detail and library detail share display language without duplicating formatting logic.

**Primary files**

- `auditflow-app/src/lib/adapters/reports.ts` (new)
- `auditflow-app/src/lib/adapters/library.ts`
- `auditflow-app/src/lib/adapters/index.test.ts`

**Work**

- Introduce a report adapter that returns a report-detail view model for summary/header information, rule hits, timeline, comments, and related links.
- Extend `adaptLibraryAssetDetail` so the library page can render:
  - media player view data
  - report summary/link state
  - optional shared audit-detail section inputs when a linked report is present
- Keep formatting, labels, grouping, and empty-state messaging in adapters instead of routes.

**Acceptance criteria**

- Report detail and Library detail both consume adapter-shaped view models.
- Shared audit sections receive normalized inputs regardless of entry route.
- Adapter tests cover full, partial, and empty data cases.

### 3. Build reusable audit-detail sections with bounded list behavior

Implement shared, display-focused sections for audit activity. These must be reusable by both report detail and library detail and must handle larger datasets cleanly.

**Primary files**

- `auditflow-app/src/components/features/reports/report-rule-hits-section.tsx` (new)
- `auditflow-app/src/components/features/reports/report-timeline-section.tsx` (new)
- `auditflow-app/src/components/features/reports/report-comments-section.tsx` (new)
- `auditflow-app/src/components/features/reports/*test.tsx` (new)
- `auditflow-app/src/components/features/library/library-asset-detail-client.tsx`

**Work**

- Extract composable sections for:
  - rule hits
  - audit timeline
  - comments
- Keep these sections display-focused and feed them adapter-shaped view models.
- Use a bounded initial render plus explicit expansion pattern when list lengths exceed the default visible count.
- Treat comments as read-only in Phase 5.
- If any section genuinely needs refresh behavior, reuse `usePollingResource` rather than custom timers.

**Acceptance criteria**

- The same section components can render inside Reports and Library without route-specific branching.
- Sections support loading, empty, partial, and populated states.
- Long lists do not dump the entire dataset by default.

### 4. Add a dedicated report detail route as the canonical audit-detail page

Build a proper report detail page that Queue and Library can both link to.

**Primary files**

- `auditflow-app/src/app/(dashboard)/reports/[reportId]/page.tsx` (new)
- `auditflow-app/src/app/(dashboard)/reports/[reportId]/error.tsx` (new)
- `auditflow-app/src/components/features/reports/report-detail-client.tsx` (new)

**Work**

- Create a route-level server component that loads the report by id and handles not-found/error states cleanly.
- Render a detail layout with:
  - summary/header information
  - related asset/library navigation
  - rule hits
  - timeline
  - read-only comments
- Keep the page canonical for full audit detail.

**Acceptance criteria**

- Valid `reportId` renders the full detail experience.
- Missing `reportId` data produces the correct not-found behavior.
- Error states match existing dashboard error patterns.
- The page does not duplicate adapter logic or section-level formatting.

**Reuse**

- Library detail route pattern from `auditflow-app/src/app/(dashboard)/library/[assetId]/page.tsx`
- Error handling pattern from `auditflow-app/src/app/(dashboard)/library/[assetId]/error.tsx`
- Shared presentation components already used in dashboard clients (`StatusBadge`, `ErrorState`, `EmptyState`, `StatCard` where useful)

### 5. Turn Library detail into the Phase 5 media hub

Replace the current Phase 5 placeholders in the asset detail page with a real media-focused detail experience while keeping Reports as the canonical audit-detail destination.

**Primary files**

- `auditflow-app/src/types/library.ts`
- `auditflow-app/src/lib/mocks/sources/library.ts`
- `auditflow-app/src/lib/adapters/library.ts`
- `auditflow-app/src/components/features/library/library-asset-detail-client.tsx`
- `auditflow-app/src/app/(dashboard)/library/[assetId]/page.tsx`

**Work**

- Replace the hero placeholder with a media player surface.
- Define the player UI around available source metadata only; if media is unavailable, render a clear non-broken fallback state instead of an empty shell.
- Surface linked report summary/navigation in the asset detail view.
- Optionally render shared rule-hit/timeline/comment sections inline when linked report data exists and the layout remains media-first.
- Keep prev/next asset navigation intact.

**Media player minimum requirements**

- Show title/context metadata near the player.
- Support keyboard-accessible controls.
- Handle unavailable media with a clear empty/error state.
- Preserve responsive layout behavior without breaking the surrounding detail page.

**Acceptance criteria**

- A playable asset renders a media-first detail experience.
- An asset without playable media renders a deliberate fallback state.
- Linked report navigation is obvious when a report exists.
- Prev/next asset navigation continues to work.

**Reuse**

- `adaptLibraryAssetDetail` in `auditflow-app/src/lib/adapters/library.ts`
- Existing card/detail visual language already established in the current Library detail client

### 6. Wire Phase 4 placeholders into real navigation

Connect the existing Phase 4 gated actions to the new Phase 5 surfaces.

**Primary files**

- `auditflow-app/src/components/features/queue/queue-dashboard-client.tsx`
- `auditflow-app/src/components/features/pipeline/pipeline-dashboard-client.tsx`
- `auditflow-app/src/components/features/library/library-asset-detail-client.tsx`
- `auditflow-app/src/lib/mocks/data/queue.ts`
- `auditflow-app/src/lib/adapters/queue.ts`

**Work**

- Replace Queue’s disabled “View Report” action with a real link when `reportId` exists.
- Keep a deliberate disabled/empty behavior when `reportId` is absent.
- Surface report access from Library detail where relevant.
- Keep Pipeline’s “Open in Library” behavior aligned with the richer Library detail experience.
- Handle stale/missing linked report targets with graceful navigation outcomes.

**Acceptance criteria**

- Queue rows with `reportId` navigate to `/reports/[reportId]`.
- Queue rows without `reportId` do not present a broken action.
- Library and Pipeline navigation continue to feel consistent after Phase 5 changes.

## Execution order

1. Extend report/library DTOs and schemas.
2. Update mock data + source functions + API route/client tests.
3. Add report and enriched library detail adapters.
4. Build shared audit-detail sections with loading/empty/expanded-list behavior.
5. Implement `/reports/[reportId]` as the canonical audit-detail route.
6. Upgrade `/library/[assetId]` into the media hub and optionally embed shared audit sections from linked report data.
7. Replace Phase 4 disabled report navigation with live links and graceful fallback behavior.

## Verification

### Automated

Run and update targeted suites first, then the full project verification.

**Contracts and schemas**
- report API / route tests under `auditflow-app/src/lib/api/index.test.ts` and `auditflow-app/src/app/api/mock/routes.test.ts`
- schema coverage for expanded report/library detail contracts

**Adapters**
- `auditflow-app/src/lib/adapters/index.test.ts`
- add explicit coverage for the new report adapter and expanded library detail adapter

**Feature/UI tests**
- `auditflow-app/src/components/features/library/library-asset-detail-client.test.tsx`
- `auditflow-app/src/components/features/queue/queue-dashboard-client.test.tsx`
- new report feature tests for:
  - report detail client
  - rule hits section
  - timeline section
  - comments section
- route tests for report detail success, not-found, and error behavior
- edge-case tests for:
  - missing media
  - missing linked report
  - empty comments
  - long timeline/rule-hit/comment lists

**Project-wide checks**
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

### Manual UI verification

From `auditflow-app`:

- Open a Queue row with `reportId` and confirm it reaches the report detail page.
- Open a Queue row without `reportId` and confirm the action is deliberately unavailable rather than broken.
- Open Library detail and verify the media player or fallback state renders correctly.
- Verify linked report summary/navigation from Library detail.
- Verify rule hits, timeline, and comments render consistently anywhere they appear.
- Verify loading, empty, and error states for both report and library detail routes.
- Verify responsive behavior, keyboard access, and visual consistency for the new deep-detail surfaces.

## Done definition

Phase 5 is complete when:

- Report detail exists as the canonical audit-detail route.
- Library detail is upgraded into a media-first experience.
- Shared audit-detail sections are reusable across Reports and Library.
- Cross-module navigation from Queue/Pipeline/Library reaches the correct deep-detail surfaces.
- Empty, missing, and error states are intentionally handled.
- Tests and required project-wide checks pass.
