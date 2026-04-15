# Phase 4 Plan Review — AuditFlow

Reviewed against: `plans/plan-v4-phase4.md`, `docs/roadmap.md`, `CLAUDE.md`, and current codebase state.

---

## What's Good

**1. Scope discipline is solid.**
The plan correctly draws a hard line at Phase 5 (media player, full report detail, real backend). Keeping Library detail as a read-only summary surface with a placeholder is the right call — it prevents scope creep that would stall the phase.

**2. Sequencing is logically ordered.**
Starting with the query layer extension (step 1) before touching Artists UI (step 5) is correct. The dependency chain is respected: data contract → source → adapter → route → client → tests.

**3. DTO → adapter → ViewModel separation is enforced.**
The plan explicitly says "no raw DTO display logic in UI components" and instructs reusing existing formatting helpers (`formatDuration`, `formatDateLabel`, gradient selection). This is consistent with what's already in `adapters/library.ts`.

**4. Dead-route awareness.**
Calling out that Queue's "View Report" should be disabled/labelled rather than a broken 404 link is a mature UX decision. Same for "Export Report" in the header.

**5. Mock data consistency constraint.**
The risk note about Pipeline `assetId` values needing to point at actual `librarySeedRecords` IDs is exactly the kind of cross-module data integrity issue that bites teams in integration. Good catch.

**6. Test scope is proportionate.**
The plan doesn't over-test (no e2e, no visual regression) and doesn't under-test (every new behavior gets a component or unit test). That matches the project's existing test pattern.

---

## Issues Found — with Adjusted Solutions

### Issue 1: `dateRange` pollutes the shared `ListQueryDto` type

**Problem:** Adding `dateRange?: "2w"` directly to `ListQueryDto` contaminates a generic shared contract with an Artists-specific filter. All four modules share this type. Future modules with different date window semantics will collide or force a growing union of unrelated values.

**Fix:** Keep `ListQueryDto` generic. Define a module-scoped `ArtistsListQueryDto` that extends `ListQueryDto` with `dateRange?: "2w"`. The Artists mock source, API route, and hook extension all operate on this narrower type. The shared `useListQueryState` exposes a generic `setFilter(key: string, value: string | undefined)` escape hatch; Artists wraps it into a typed `setDateRange` locally. No changes to `src/types/api.ts` or `src/lib/query/list-query.ts`.

---

### Issue 2: `usePollingResource` has a stale interval re-subscription bug

**Problem:** `use-polling-resource.ts:122` — the `setInterval` effect depends on `[state.data.polling.intervalMs, state.data.polling.terminal]`. Every time `intervalMs` changes in a polled response, the interval tears down and restarts, causing one missed tick. The plan adds more polling consumers without addressing this.

**Fix:** Add a prerequisite step 0 to the plan. Move `intervalMs` to a `ref` so the effect only re-runs on `terminal` change. The interval callback reads `intervalMsRef.current` dynamically. One-file fix in `use-polling-resource.ts`, covered by the existing polling hook tests.

---

### Issue 3: Bulk Download on implicit filter set is an enterprise UX anti-pattern

**Problem:** The plan scopes Bulk Download to "the current filtered result set, not row-selected assets." Operating on an invisible implicit set is dangerous and confusing for enterprise users. The plan also excludes row selection infrastructure, creating a contradiction: a bulk action with no selection model.

**Fix:** Two acceptable options — (a) remove the Bulk Download button in Phase 4 entirely and add it properly in Phase 5 alongside row selection infrastructure, or (b) keep the button but make the implicit scope explicit in the label: "Bulk Download (12)" showing the current filtered count. Option (a) is cleaner. A disabled button with tooltip "Select rows to enable" is also acceptable and primes the Phase 5 mental model.

---

### Issue 4: Library detail has no prev/next asset navigation

**Problem:** The plan creates `/library/[assetId]` with only a back link to `/library`. For an enterprise library with many assets, the list → detail → back → scroll → detail pattern is high-friction.

**Fix:** The server page already has access to the full filtered/sorted asset list from the mock source. Pass `prevId` and `nextId` as props to the detail client. Render two `Link` components (prev/next chevrons) in the detail header. Small addition, large UX improvement, fully achievable within Phase 4's mock-only scope.

---

### Issue 5: Actions column added to Queue DataTable without width/overflow strategy

**Problem:** The Queue table already has 5 columns (Track, Audit Status, Confidence, Rule Summary, Progress). Adding a 6th Actions column without width constraints will overflow or compress existing columns on standard 1280px viewports.

**Fix:** Define the Actions column with a fixed `size: 140` via TanStack Table's column sizing API. Use icon buttons (not text buttons) for row actions to minimize column width — arrow icon + tooltip for "Route to Pipeline", document icon + disabled state for "View Report". Keeps the table scannable and avoids horizontal scroll on enterprise desktop resolutions.

---

### Issue 6: "Clear Console" behavior will feel broken — logs reappear after next poll

**Problem:** The plan says Clear Console "hides current log rows until the next polled data update." So the user clears the console and 4 seconds later all the same logs reappear. This is not how any console UX works.

**Fix:** Track a `clearedAtTick` ref in the Pipeline client. On Clear Console, record `data.polling.tick`. The log render filters to only show entries where `entry.tick > clearedAtTick`. New log lines from subsequent polls appear normally; old lines stay hidden. Purely local state, no server mutation, behaves like a real console clear.

---

### Issue 7: No error boundary for the new Library detail route

**Problem:** The plan handles `notFound()` for unknown asset IDs but says nothing about what happens if the mock source throws (schema parse failure, malformed data). A single bad asset record crashes the entire page with a Next.js unhandled error screen.

**Fix:** Add `src/app/(dashboard)/library/[assetId]/error.tsx` — a Next.js App Router error boundary. Render the existing `ErrorState` component with a "Failed to load asset" message and a back link to `/library`. 10 lines. Make this the standard pattern for every new route added from Phase 4 onward.

---

## Summary

The plan is well-structured with good architectural discipline. Sequencing, scope boundaries, and test coverage approach are all sound. Issues are concentrated in three areas:

- Shared type pollution by domain-specific concerns (Issue 1)
- Two UX decisions that will feel broken to enterprise users (Issues 3, 6)
- Missing defensive patterns (Issues 2, 4, 5, 7)

All seven issues have been incorporated as adjustments into `plan-v4-phase4.md`.
