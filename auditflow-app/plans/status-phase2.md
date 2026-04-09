# Phase 2 status

Phase 2 is implemented in `auditflow-app`.

## What’s done

### Typed contracts and validation
- Shared API/query/polling/error contracts in `src/types/api.ts`
- Module DTOs and view-model types for:
  - `src/types/artist.ts`
  - `src/types/queue.ts`
  - `src/types/pipeline.ts`
  - `src/types/library.ts`
  - `src/types/audit-report.ts`
- Zod schemas for common and module payloads in `src/lib/schemas/*`

### Mock platform
- Structured mock seed data in `src/lib/mocks/data/*`
- Deterministic simulators for queue and pipeline progression:
  - `src/lib/mocks/simulators/queue.ts`
  - `src/lib/mocks/simulators/pipeline.ts`
- Shared source/query functions for dashboard payloads:
  - `src/lib/mocks/sources/artists.ts`
  - `src/lib/mocks/sources/queue.ts`
  - `src/lib/mocks/sources/pipeline.ts`
  - `src/lib/mocks/sources/library.ts`
  - `src/lib/mocks/sources/reports.ts`

### HTTP and client data layer
- Thin mock App Router handlers:
  - `src/app/api/mock/artists/route.ts`
  - `src/app/api/mock/queue/route.ts`
  - `src/app/api/mock/pipeline/route.ts`
  - `src/app/api/mock/library/route.ts`
  - `src/app/api/mock/reports/route.ts`
- Typed fetch layer in `src/lib/api/*`
- Shared validated JSON fetch helper in `src/lib/api/fetcher.ts`

### UI adaptation and async states
- Adapter layer for dashboard view models:
  - `src/lib/adapters/artists.ts`
  - `src/lib/adapters/queue.ts`
  - `src/lib/adapters/pipeline.ts`
  - `src/lib/adapters/library.ts`
- Shared async-state components in `src/components/shared/loading-state.tsx`
- Re-export entry files:
  - `src/components/shared/error-state.tsx`
  - `src/components/shared/empty-state.tsx`
  - `src/components/shared/section-skeleton.tsx`
- Stable polling hook in `src/hooks/use-polling-resource.ts`

### Dashboard page integration
The Phase 1 inline page constants have been replaced with typed source + adapter data for all four dashboard pages:
- `src/app/(dashboard)/artists/page.tsx`
- `src/app/(dashboard)/queue/page.tsx`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/library/page.tsx`

### Build stability update
- Removed Google font runtime dependency from `src/app/layout.tsx`
- Switched theme font variables to local/system fallbacks in `src/app/globals.css`
- This was needed so production build works reliably in the current environment without external font fetches

## Validation passed
- `npm run lint` ✅
- `npm run test` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Current outcome
Phase 2 now provides a reusable, validated, test-covered mock data platform that supports the current dashboard modules without page-local hardcoded arrays.

## Remaining note
A possible follow-up is to wire queue and pipeline screens to the typed client fetch layer plus `usePollingResource` for client-side live polling behavior. That is optional follow-on integration, not a blocker for the Phase 2 status above.
