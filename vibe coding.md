vibe coding.md


------------------first prompt----------------------
I want to start in Plan Mode. We are building 'AuditFlow'. it's a totally empty folder without anything. Based on the 7 attached screenshots, please output a detailed Technical Implementation Plan。
Requirements for the Plan:
Folder Structure: How to organize /components, /hooks, and /types.
Feature Breakdown: List 4 main modules (Artists, Queue, Pipeline, Library).
State Strategy: How to handle the real-time 'Progress Bar' and 'Audit Status' (e.g., using SWR or simple polling mocks).
technical stack: Next.js + Tailwind + Shadcn UI
Component Specs: For the 'Spectrogram' and 'Video Player' components.
DO NOT write any implementation code yet. Just output the Markdown plan."


------------------draft plan----------------------
# AuditFlow Technical Implementation Plan

## Context
AuditFlow is starting from an empty workspace and needs a clean frontend foundation for a media-audit workflow product built with Next.js, Tailwind CSS, and shadcn/ui. Based on the provided UI set, the product centers on four primary operational areas: Artist monitoring, audit/download queue management, pipeline job visibility, and a searchable media library with detail views. The goal of the first implementation pass is to establish a scalable app structure, define reusable UI boundaries, and support believable real-time status behavior with mock data before any backend integration.

Because the repo is currently empty, there are no existing functions or utilities to reuse yet. The plan should therefore optimize for: (1) fast scaffolding, (2) consistent component reuse across the 4 modules, and (3) a state model that can later swap mock polling for real APIs with minimal refactor.

## Recommended Technical Stack
- **Framework:** Next.js App Router
- **Styling:** Tailwind CSS
- **UI primitives:** shadcn/ui
- **Icons:** lucide-react
- **Data/state for MVP:** SWR with polling against mock data sources
- **Mocking approach:** local mock dataset + lightweight route handlers or in-memory client adapters
- **Charts/visualization:** custom SVG/canvas for spectrogram/waveform-style panels (avoid heavy charting dependency in v1)

## Proposed App Structure

### Top-level structure
```text
/app
  /(dashboard)
    /artists
    /queue
    /pipeline
    /library
    /library/[assetId]
    /reports/[reportId]
    /settings
    layout.tsx
    page.tsx
  /api
    /mock
      /artists
      /queue
      /pipeline
      /library
      /reports
  globals.css
  layout.tsx

/components
  /layout
    app-shell.tsx
    app-sidebar.tsx
    app-header.tsx
    page-toolbar.tsx
    status-footer.tsx
  /shared
    stat-card.tsx
    filter-bar.tsx
    search-input.tsx
    status-badge.tsx
    progress-cell.tsx
    empty-state.tsx
    pagination-controls.tsx
  /tables
    data-table.tsx
    table-toolbar.tsx
  /media
    video-player.tsx
    spectrogram-panel.tsx
    waveform-preview.tsx
    asset-version-card.tsx
    metadata-grid.tsx
  /activity
    audit-timeline.tsx
    comment-composer.tsx
    rule-hit-list.tsx
  /features
    /artists
      artist-list-table.tsx
      artist-row-actions.tsx
      artist-kpi-cards.tsx
    /queue
      queue-list-table.tsx
      queue-filters.tsx
      queue-progress-summary.tsx
    /pipeline
      pipeline-job-table.tsx
      pipeline-status-board.tsx
      pipeline-run-actions.tsx
    /library
      library-grid.tsx
      library-filter-panel.tsx
      library-asset-header.tsx
      library-asset-tabs.tsx
      library-side-panel.tsx

/hooks
  use-dashboard-search.ts
  use-pagination.ts
  use-polling-resource.ts
  use-queue-progress.ts
  use-audit-status.ts
  use-library-filters.ts
  use-player-state.ts
  use-spectrogram-selection.ts

/types
  artist.ts
  queue.ts
  pipeline.ts
  library.ts
  audit-report.ts
  media.ts
  common.ts

/lib
  mock-data.ts
  mock-generators.ts
  formatters.ts
  constants.ts
  nav.ts
```

## Folder Organization Guidance

### `/components`
Organize by **shared UI first**, then by **domain feature**.
- `layout/` holds the persistent shell seen across all screenshots: left sidebar, top header, footer/system status.
- `shared/` holds reusable dashboard atoms used in every module: stat cards, badges, progress cells, search/filter controls.
- `media/` isolates rich preview components like Video Player, Spectrogram, version cards, and metadata panels.
- `activity/` contains audit-history, comments, and rule-hit presentation used in report/detail screens.
- `features/` contains module-specific assemblies so Artists, Queue, Pipeline, and Library can evolve independently without bloating shared folders.

### `/hooks`
Keep hooks thin and purpose-specific.
- Cross-page hooks: pagination, search sync, polling wrapper.
- Domain hooks: queue progress updates, audit status normalization, library filters, media player state.
- Hooks should return transformed UI-ready state, not raw mock payloads, so future API swaps stay localized.

### `/types`
Define types by domain, plus a shared common file.
- `artist.ts`: monitored artist, linked channels, sync state.
- `queue.ts`: queue item lifecycle, review state, progress breakdown.
- `pipeline.ts`: job, stage, run history, operational health.
- `library.ts`: asset card, asset detail, versions, technical metadata.
- `audit-report.ts`: report summary, confidence score, rule hits, reviewer notes.
- `media.ts`: player source, poster, waveform/spectrogram frames.
- `common.ts`: pagination, filter options, status enums, API response wrappers.

## Feature Breakdown

## 1. Artists Module
**Purpose:** monitor tracked artists/channels and detect new releases entering the audit system.

**Screens implied:** artist monitoring list.

**Primary UI blocks:**
- KPI row: monitored artist count, new tracks this week, auto-pass rate, API quota.
- Artist table with avatar, follower counts, linked YouTube channel, recent release count, audit status.
- Search, date range filter, list/grid toggle, bulk download/sync actions.

**Primary data entities:**
- `Artist`
- `ArtistChannelLink`
- `ArtistAuditSnapshot`

**Key interactions:**
- Search artists/channel names.
- Filter by recent activity and status.
- Drill into artist details or queue relevant tracks.
- Trigger bulk sync/download.

## 2. Queue Module
**Purpose:** show active download + automated audit work with progress and final routing.

**Screens implied:** download & auto-audit queue.

**Primary UI blocks:**
- KPI cards: active tasks, auto-approved today, pending manual review, auto-rejected.
- Filter tabs: all / processing / flagged / completed.
- Queue table with item info, audit status, confidence score, rule summary, timestamps, progress bar, row actions.

**Primary data entities:**
- `QueueItem`
- `QueueProgress`
- `AuditDecision`

**Key interactions:**
- Live progress updates per row.
- Search by song, artist, or task ID.
- Filter by processing state.
- Route item into pipeline or review report.

## 3. Pipeline Module
**Purpose:** operational view of ingest/audit/export jobs and retry actions.

**Screens implied:** pipeline jobs + pipeline-linked asset detail workflow.

**Primary UI blocks:**
- Job table/board by state.
- Batch actions for restart/retrigger.
- Health indicators for backend and AI audit services.
- Optional stage chips: ingest, fingerprint, content audit, packaging, export.

**Primary data entities:**
- `PipelineJob`
- `PipelineStage`
- `PipelineRun`

**Key interactions:**
- Retry failed runs.
- Inspect stage-level progress.
- Jump from a pipeline job to asset detail / report.

## 4. Library Module
**Purpose:** searchable archive of approved/processed media assets with playback, metadata, versions, and audit history.

**Screens implied:** video library grid/list and detailed asset preview page.

**Primary UI blocks:**
- Grid/list asset browser.
- Asset detail header with title, breadcrumbs, actions.
- Video preview area.
- Version selector/download cards.
- Metadata/specification card.
- Audit trail/comments side panel.
- Tabs for asset details, rule hits, render logs.

**Primary data entities:**
- `LibraryAsset`
- `AssetVersion`
- `AssetMetadata`
- `AuditTimelineEvent`

**Key interactions:**
- Search and filter assets.
- Preview different versions.
- Download masters/renditions.
- View audit history and leave reviewer notes.

## State Strategy

### Recommended approach
Use **SWR as the default data layer** with **short polling intervals** for queue and pipeline views, backed by mock endpoints in `/app/api/mock/*` for the MVP.

### Why this is the right fit
- The UI clearly has **near-real-time operational indicators** (progress bars, audit statuses, backend/AI health).
- SWR keeps data fetching lightweight and easy to replace later.
- Polling is sufficient for prototype realism without introducing WebSocket complexity too early.
- The same hook signatures can later switch from mock routes to real backend endpoints.

### Polling model
- **Queue progress:** refresh every 2–3 seconds.
- **Pipeline jobs:** refresh every 3–5 seconds.
- **Artists and Library lists:** fetch on load + manual refresh/filter changes; no aggressive polling needed.
- **Detail pages:** refresh report/activity data every 5 seconds while page is focused.

### Hook plan
- `use-polling-resource(key, fetcher, interval)` — generic wrapper for SWR refresh logic.
- `use-queue-progress()` — maps raw queue payload into table-ready progress percentages, labels, and bar states.
- `use-audit-status()` — centralizes badge colors, display text, and terminal/non-terminal states.

### Mock-state behavior
For MVP demos, mock data should simulate realistic transitions:
- `downloading -> auditing -> auto-approved`
- `auditing -> manual-review`
- `auditing -> auto-rejected`
- `pipeline-running -> completed/failed`

Progress should move deterministically per tick so UI behavior is stable during demos.

## Shared UI / Layout System
- Persistent **App Shell** used on every dashboard page.
- Left sidebar navigation with module sections and playlist/filter groups.
- Top header with search, notification/settings icons, and profile avatar.
- Bottom system footer for operational health indicators.
- Standard page composition:
  1. Breadcrumb/title row
  2. KPI/stat cards
  3. Toolbar with search/filter/actions
  4. Main content area (table/grid/detail)
  5. Optional right-side contextual panel for audit trail or versions

## Component Specs

## `components/media/video-player.tsx`
**Purpose:** render the main preview for video assets on the Library detail page.

**Responsibilities:**
- Show poster/thumbnail before playback.
- Support play/pause, scrubber, time display, mute/volume, fullscreen.
- Allow version/source switching from adjacent asset version cards.
- Expose playback time for timeline-linked annotations later.
- Handle loading/error/disabled states cleanly.

**Suggested props:**
- `src: string`
- `poster?: string`
- `title: string`
- `duration?: number`
- `status?: 'ready' | 'processing' | 'error'`
- `markers?: { time: number; label: string; severity?: 'info' | 'warning' | 'critical' }[]`
- `onTimeUpdate?: (time: number) => void`
- `onEnded?: () => void`

**UI behavior:**
- Large 16:9 player area.
- Center play button overlay when idle.
- Skeleton while source loads.
- If asset is still processing, show non-interactive preview with status badge instead of active controls.
- Markers can appear on scrubber in future iterations without changing base API.

**Dependencies:**
- shadcn `Button`, `Slider`, `Tooltip`, `Badge`, `Card`.
- `use-player-state` hook for local control state.

## `components/media/spectrogram-panel.tsx`
**Purpose:** display audio-analysis visuals and metrics on audit/report screens.

**Responsibilities:**
- Render a lightweight spectrogram or waveform-like panel from mock frame data.
- Pair the visualization with metric bars such as dynamic range, true peak, energy, stereo width.
- Support segment highlighting for flagged audit moments later.
- Stay performant inside report/detail layouts.

**Suggested props:**
- `frames: number[] | { x: number; y: number; intensity: number }[]`
- `metrics: { label: string; value: string | number; normalized?: number }[]`
- `title?: string`
- `annotations?: { start: number; end: number; label: string; severity: 'warning' | 'critical' }[]`
- `interactive?: boolean`
- `onSelectRange?: (range: { start: number; end: number }) => void`

**UI behavior:**
- Left side: stacked metric bars with labels and values.
- Right side: visualization panel in SVG/canvas.
- Default to read-only for MVP.
- If no data exists yet, render a placeholder state rather than an empty chart.

**Implementation note:**
Keep this component self-contained and data-driven so it can later switch from mock arrays to server-generated analysis data without layout changes.

## Route-to-Screen Mapping
- `/artists` → artist monitoring list
- `/queue` → download & audit queue
- `/pipeline` → pipeline jobs overview
- `/library` → library browser/grid/list
- `/library/[assetId]` → video asset detail/player screen
- `/reports/[reportId]` → auto-audit report detail with spectrogram and rule hits
- `/settings` → operational settings / configuration screen

## Critical Files To Create In Implementation
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/artists/page.tsx`
- `app/(dashboard)/queue/page.tsx`
- `app/(dashboard)/pipeline/page.tsx`
- `app/(dashboard)/library/page.tsx`
- `app/(dashboard)/library/[assetId]/page.tsx`
- `app/(dashboard)/reports/[reportId]/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `components/layout/app-shell.tsx`
- `components/media/video-player.tsx`
- `components/media/spectrogram-panel.tsx`
- `components/features/artists/artist-list-table.tsx`
- `components/features/queue/queue-list-table.tsx`
- `components/features/pipeline/pipeline-job-table.tsx`
- `components/features/library/library-grid.tsx`
- `hooks/use-polling-resource.ts`
- `hooks/use-queue-progress.ts`
- `hooks/use-audit-status.ts`
- `types/artist.ts`
- `types/queue.ts`
- `types/pipeline.ts`
- `types/library.ts`
- `types/audit-report.ts`
- `lib/mock-data.ts`
- `lib/nav.ts`

## Implementation Phases
1. **Scaffold foundation**
   - Initialize Next.js app with Tailwind and shadcn/ui.
   - Create App Shell, nav config, typography, spacing, and dashboard layout primitives.

2. **Build shared system**
   - Implement stat cards, search/filter bars, badges, tables, pagination, progress cells.
   - Define all domain types and mock datasets.

3. **Implement module pages**
   - Artists list
   - Queue list with live progress
   - Pipeline jobs overview
   - Library browser/detail

4. **Implement deep detail views**
   - Auto-audit report page
   - Video player page
   - Activity trail, comments, rule hit panels, asset version cards

5. **Polish interactions**
   - Polling refresh behavior
   - Loading/empty/error states
   - Responsive behavior for 1440px desktop first, then tablet degradation

## Verification Plan
- Run the Next.js app locally and confirm each route renders from the shared dashboard shell.
- Verify the sidebar/topbar/footer remain consistent across Artists, Queue, Pipeline, Library, Report, and Settings.
- Confirm queue and pipeline polling update progress bars/status badges without page reload.
- Confirm library detail supports video preview state, version switching UI, metadata panel, and audit trail panel.
- Confirm report detail renders spectrogram panel, audit summary cards, rule-hit records, and review action area.
- Check loading, empty, and error states on at least one page per module.
- Validate Tailwind + shadcn spacing, button variants, cards, tables, and tabs remain visually consistent with the screenshot direction.

------------------draft plan review----------------------
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



------------------phases----------------------
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

------------------phase 1 status----------------------
Phase 1 is implemented in auditflow-app.                                                                                                                                                                             
  What’s done:                                                                                                 
  - Next.js App Router foundation with Tailwind, strict TypeScript, lint, Vitest, and tested shared            
  utilities/components                                                                                         
  - Shared AuditFlow shell matching your prototype direction:                                                  
    - header/nav: src/components/layout/app-header.tsx                                                         
    - sidebar: src/components/layout/app-sidebar.tsx                                                           
    - footer health bar: src/components/layout/status-footer.tsx                                               
    - shell wrapper: src/components/layout/app-shell.tsx                                                       
  - Shared primitives:                                                                                         
    - src/components/shared/stat-card.tsx                                                                      
    - src/components/shared/search-input.tsx                                                                   
    - src/components/shared/status-badge.tsx                                                                   
    - src/components/shared/page-toolbar.tsx                                                                   
  - Route skeletons:                                                                                           
    - src/app/(dashboard)/artists/page.tsx                                                                     
    - src/app/(dashboard)/queue/page.tsx                                                                       
    - src/app/(dashboard)/pipeline/page.tsx                                                                    
    - src/app/(dashboard)/library/page.tsx                                                                     
  - Foundation utilities/config:                                                                               
    - src/lib/nav.ts                                                                                           
    - src/lib/status.ts                                                                                        
    - src/lib/constants.ts                                                                                     
    - src/lib/utils.ts                                                                                         
    - src/types/common.ts                                                                                      
                                                                                                               
  Validation passed:                                                                                           
  - tests: 16 passed                                                                                           
  - lint: passed                                                                                               
  - typecheck: passed                                                                                          
  - production build: passed                                                                                   
                                                                                                               
  One dependency/setup issue came up during scaffold:                                                          
  - npm cache permission conflict                                                                              
  - I resolved it by switching installs to a project-local npm cache instead of forcing anything               
                                                                                                               
  Notes:                                                                                                       
  - the app is under auditflow-app, not the repo root                                                          
  - this is phase-1 foundation, so the pages are prototype-aligned skeletons, not full feature modules yet     
                                                                                                               
  If you want, next I can start phase 2:                                                                       
  1. data contracts + mock platform                                                                            
  2. richer shared table/filter system                                                                         
  3. artists module real implementation first
  claude --resume 19c30b8e-b741-4eb8-976c-2ed48f9c4642