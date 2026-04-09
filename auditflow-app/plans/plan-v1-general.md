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



