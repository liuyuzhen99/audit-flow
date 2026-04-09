# AuditFlow Phase 2 Plan (Revised)

## Document purpose
This document defines the executable implementation plan for **Phase 2: Data Contract + Mock Platform**.

It is based on:
- current implementation status in `./plans/status-phase1.md`
- roadmap phase definitions in `./docs/roadmap.md`
- project guidance in `./CLAUDE.md`
- code quality guidance in `./docs/coding-standards.md`
- the current source structure already implemented under `./src`
- review feedback captured in `./plans/review-v2.md`

This plan is written against the **actual current codebase**, not an empty-repo assumption.

---

## 1. Current baseline

### Phase 1 already completed
The project currently has:
- Next.js App Router foundation
- Tailwind-based theme tokens and dashboard shell
- route skeletons for `/artists`, `/queue`, `/pipeline`, `/library`
- shared layout and primitive components
- strict TypeScript, ESLint, Vitest
- tested shared utilities/components

### Current implementation gap
The current dashboard pages still render from **page-local inline mock constants** instead of a reusable typed mock/data platform.

Current examples:
- `src/app/(dashboard)/artists/page.tsx`
- `src/app/(dashboard)/queue/page.tsx`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/library/page.tsx`

### Important reality about the current UI
These pages are not all simple list pages:
- `artists` = summary cards + table rows
- `queue` = summary cards + rows + progress display
- `pipeline` = summary cards + active job panel + stage list + live log + deliverables
- `library` = summary cards + media asset cards

That means Phase 2 must define not only entity DTOs, but also **page-aware response contracts** that can fully replace current inline page constants.

### Why Phase 2 matters now
Without Phase 2, later phases will create repeated refactors because:
- data shape will leak into page components
- mock behavior will be inconsistent by module
- route handlers and SWR will have no stable contract
- server/client boundaries will become muddy
- polling features will become flaky
- testing will stay too shallow

---

## 2. Phase 2 objective

Build a **production-minded data foundation** that supports the current dashboard modules with:
1. typed domain contracts
2. explicit common API/list/query/error contracts
3. runtime validation via zod
4. deterministic mock fixtures and simulators
5. shared mock source/query functions used by both server pages and route handlers
6. App Router mock API route handlers
7. adapter/view-model transformation layer
8. typed fetch layer ready for SWR consumption
9. full tests for every exported function introduced in this phase

At the end of Phase 2, the UI should still look close to the current Phase 1 shell, but page data should come from a validated reusable platform instead of inline literals.

---

## 3. Phase 2 scope

## In scope

### 3.1 Common data contracts
Create explicit shared contracts for:
- pagination metadata
- list query params
- filter/sort metadata where needed
- API error shape
- summary metrics
- polling metadata

### 3.2 Module contracts
Create explicit transport contracts for:
- artists
- queue
- pipeline
- library
- reports (minimal contract-ready only)

### 3.3 Schema validation
Add zod schemas for:
- common contracts
- module DTOs
- list/page response shapes
- status enums
- error/polling wrappers

### 3.4 Mock platform
Build a structured mock system with:
- static seed fixtures
- factories for repetitive record generation
- deterministic simulators for queue/pipeline progression
- shared source/query functions that assemble validated module responses
- App Router handlers that wrap those source/query functions

### 3.5 Adapter layer
Add a dedicated transformation layer that maps:
- validated DTOs
- page-level response payloads
- UI-friendly view models used by pages/components

### 3.6 Fetch layer
Create typed API client functions for client-side usage so future SWR hooks and real backend endpoints can reuse the same signatures.

### 3.7 Page integration
Refactor the current Phase 1 pages to consume the new platform instead of inline hardcoded arrays.

### 3.8 Shared async state components
Add standardized loading, error, empty, and skeleton presentation components for data-driven pages.

### 3.9 Testing and validation
Add unit/integration tests for every exported function introduced in this phase and ensure the full validation suite passes.

## Out of scope
The following are **not** core Phase 2 deliverables:
- final TanStack data table implementation
- full URL query-state sync in the browser
- full report detail page UI
- video player implementation
- comments/audit timeline UI
- e2e coverage beyond minimal smoke if needed
- real backend integration
- websocket or SSE real-time transport
- global state management

These belong mainly to later phases.

---

## 4. Phase 2 architecture decisions

## 4.1 Server/client and data-access boundary
Keep route pages as **Server Components by default**.
Use client-side fetching only where interaction/polling is required.

### Rules
- `page.tsx` files remain server-first unless polling or local UI interaction requires client composition
- data parsing, simulation, and adaptation stay outside React components
- no broad `"use client"` page conversions just to access data
- **server-rendered pages should call shared module source/query functions directly when possible**
- **route handlers should wrap the same source/query functions instead of becoming the only source of data**
- typed fetchers in `src/lib/api/*` are primarily for client surfaces, polling flows, and future SWR usage

### Why this rule matters
This avoids an unnecessary anti-pattern where server components fetch their own internal `/api/mock/*` routes. That would add extra hops, awkward configuration, and duplicated caching logic.

### Target pattern
- source/query function = module/domain boundary
- route handler = HTTP boundary
- adapter = UI boundary
- page = composition layer

---

## 4.2 DTOs vs view models
This distinction is mandatory in Phase 2.

### DTO layer
Represents the mock/API transport format.
Examples:
- `ArtistDto`
- `QueueItemDto`
- `PipelineJobDto`
- `LibraryAssetDto`
- `SummaryMetricDto`

### Page response layer
Represents module-level payloads needed by the current dashboard screens.
Examples:
- `ArtistsDashboardResponseDto`
- `QueueDashboardResponseDto`
- `PipelineDashboardResponseDto`
- `LibraryDashboardResponseDto`

### View-model layer
Represents component-ready data.
Examples:
- `ArtistTableRowViewModel`
- `QueueTableRowViewModel`
- `PipelineJobCardViewModel`
- `PipelineLogEntryViewModel`
- `LibraryAssetCardViewModel`

### Rule
Pages and feature components consume **view models**, not raw DTOs.
Route handlers and source/query functions return DTO/page response shapes, not JSX-oriented display strings.

---

## 4.3 Validation strategy
Use **zod** at the boundaries.

### Validate at these points
- mock fixture assembly into source/query functions
- source/query results before route handler return
- client fetch responses before adaptation
- query param parsing where route handlers support filters/search/pagination

### Do not
- scatter ad hoc defensive checks inside components
- duplicate schema logic in multiple layers
- mix UI fallback logic into transport schemas

---

## 4.4 Standardized common response contracts
Phase 2 must standardize shared response shapes now so Phase 3 does not force a second contract refactor.

### Required common contracts
Create shared DTOs/types for:
- `SummaryMetricDto`
- `ResponseMetaDto`
- `PaginationMetaDto`
- `ListQueryDto`
- `SortSpecDto` or equivalent minimal sort contract
- `PollingMetaDto`
- `ApiErrorDto`
- `ApiSuccessResponseDto<T>` only if it clearly improves consistency
- `PagedResponseDto<T>` only if it reduces repetition without hiding important domain differences

### Contract rules
- raw timestamps use ISO strings
- pagination shape must be explicit and consistent
- supported query params should be intentional, not ad hoc
- error shape should be stable across mock routes
- module summaries should have a defined location in each page response contract

### Recommendation
Use page/pageSize/total for this phase unless there is a strong reason to introduce cursor pagination now.

---

## 4.5 Deterministic simulation strategy
Queue and pipeline need realistic progression, but reliability matters more than visual novelty.

### Required behavior
Queue should support transitions like:
- `queued -> downloading -> auditing -> autoApproved`
- `auditing -> manualReview`
- `auditing -> autoRejected`

Pipeline should support transitions like:
- `queued -> running -> completed`
- `running -> failed`
- stage progress increasing per tick
- terminal stages remaining terminal

### Preferred implementation order
1. pure deterministic transition helpers
2. request-derived deterministic progression (for example via stable tick/cursor/query inputs)
3. isolated temporary in-memory demo state only if absolutely necessary

### Rule
Do **not** rely on shared mutable handler state as the primary simulator strategy.
If temporary in-memory state is used for demo realism, it must be:
- isolated behind the simulator/source layer
- documented clearly as non-production behavior
- covered by direct tests
- easy to remove later

### Why this matters
Mutable in-memory state becomes fragile under hot reload, parallel requests, tests, and future deployment changes.

---

## 4.6 Polling contract
Phase 2 must define polling semantics explicitly, even if the implementation stays thin.

### Required polling rules
For queue and pipeline:
- polling interval must be defined in one place
- active items only move forward, never backward
- terminal states stop changing
- repeated polls must produce deterministic output for the same progression input
- client polling should ignore stale/out-of-order responses
- polling should pause when the page is hidden if a polling hook is introduced
- retry behavior after transient failure should be defined and limited
- log ordering must remain stable across ticks

### Ownership
- simulator/source layer owns progression rules
- fetch/polling hook owns request scheduling and stale-response protection
- adapters own display formatting only

---

## 4.7 Status ownership
Status behavior must be owned by the correct layer.

### Rules
- DTOs own canonical raw status unions
- simulators own allowed status transitions
- adapters own UI labels, tones, and display-oriented status text
- components consume mapped labels/tones but should not invent status logic

### Why this matters
Without this, status meaning will drift between transport, simulation, and UI.

---

## 4.8 Reports should stay minimal in Phase 2
Reports are only contract-ready in this phase.

### Rule
Do not overdesign report structures.
Only add fields that are already implied by the upcoming report/detail surfaces.

### Why this matters
Reports are the easiest area to turn speculative too early.

---

## 5. Target file structure for Phase 2

```text
src/
  app/
    api/
      mock/
        artists/route.ts
        queue/route.ts
        pipeline/route.ts
        library/route.ts
        reports/route.ts
  components/
    features/
      artists/
      queue/
      pipeline/
      library/
    shared/
      empty-state.tsx
      error-state.tsx
      loading-state.tsx
      section-skeleton.tsx
  hooks/
    use-polling-resource.ts
  lib/
    api/
      artists.ts
      queue.ts
      pipeline.ts
      library.ts
      reports.ts
      fetcher.ts
    adapters/
      artists.ts
      queue.ts
      pipeline.ts
      library.ts
    mocks/
      data/
        artists.ts
        queue.ts
        pipeline.ts
        library.ts
        reports.ts
      factories/
        artists.ts
        queue.ts
        pipeline.ts
        library.ts
      simulators/
        queue.ts
        pipeline.ts
      sources/
        artists.ts
        queue.ts
        pipeline.ts
        library.ts
        reports.ts
      handlers/
        artists.ts
        queue.ts
        pipeline.ts
        library.ts
        reports.ts
    schemas/
      common.ts
      artist.ts
      queue.ts
      pipeline.ts
      library.ts
      report.ts
    status/
      audit.ts
      pipeline.ts
  types/
    api.ts
    common.ts
    artist.ts
    queue.ts
    pipeline.ts
    library.ts
    audit-report.ts
```

### Notes on structure
- keep `src/lib/utils.ts` and `src/lib/constants.ts`
- keep `src/lib/nav.ts` as navigation metadata
- `sources/` are the shared module assembly functions used by server pages and route handlers
- `handlers/` stay thin and HTTP-oriented
- do not create extra abstraction layers beyond this structure unless implementation proves they are necessary

---

## 6. Common contract planning

## 6.1 Shared/common DTOs
Create explicit common contracts for:
- `SummaryMetricDto`
- `ResponseMetaDto`
- `PaginationMetaDto`
- `ListQueryDto`
- `SortSpecDto`
- `PollingMetaDto`
- `ApiErrorDto`
- `FilterOptionDto` only if a module truly needs option metadata in this phase

### Common rules
- IDs are strings
- timestamps are ISO strings
- display labels do not belong in base DTOs unless they are real transport data
- response metadata should be small and explicit

---

## 6.2 Artists module

### Data required
- artist identity
- avatar / fallback image
- spotify follower count
- youtube channel name/id
- recent release count over period
- capture freshness / last synced time
- current audit snapshot summary
- dashboard summary metrics

### Primary types to define
- `ArtistDto`
- `ArtistChannelLinkDto`
- `ArtistAuditSnapshotDto`
- `ArtistListResponseDto`
- `ArtistsDashboardResponseDto`
- `ArtistTableRowViewModel`

### Recommended page response shape
`ArtistsDashboardResponseDto` should explicitly support:
- `summary`
- `items`
- `meta`
- optional `filters` metadata only if needed for this phase

### UI mapping needs
Map raw data into:
- follower display string
- release badge label
- audit badge label/tone
- freshness text

---

## 6.3 Queue module

### Data required
- task id
- song title
- artist
- cover art
- queue state
- audit decision state
- confidence score
- rule summary
- submitted/updated timestamps
- progress percentage + progress label
- dashboard summary metrics
- polling metadata

### Primary types to define
- `QueueItemDto`
- `QueueProgressDto`
- `AuditDecisionDto`
- `QueueListResponseDto`
- `QueueDashboardResponseDto`
- `QueueTableRowViewModel`

### Required response shape
`QueueDashboardResponseDto` should explicitly support:
- `summary`
- `items`
- `meta`
- `polling`

### Special requirement
Queue must support deterministic polling updates suitable for tests and demos.

### UI mapping needs
Map raw data into:
- badge label/tone
- progress percentage and display text
- confidence display string
- row summary and timestamp formatting

---

## 6.4 Pipeline module

### Important note
The current pipeline page is **not just a list**. The contract must support the actual Phase 1 UI shape.

### Data required
- job id
- source asset/task title
- run status
- stage list
- current active stage
- elapsed time / estimated remaining
- dashboard summary metrics
- active job detail
- live log entries
- deliverables summary
- polling metadata

### Primary types to define
- `PipelineJobDto`
- `PipelineStageDto`
- `PipelineRunDto`
- `PipelineLogEntryDto`
- `PipelineDeliverableDto`
- `PipelineJobDetailDto`
- `PipelineListResponseDto`
- `PipelineDashboardResponseDto`
- `PipelineJobViewModel`
- `PipelineLogEntryViewModel`

### Required response shape
`PipelineDashboardResponseDto` should explicitly support:
- `summary`
- `jobs`
- `activeJob`
- `meta`
- `polling`

### Special requirement
Pipeline mock data must support:
- stage-by-stage progress updates
- failure branches
- stable log ordering
- stable deliverable visibility for terminal states

---

## 6.5 Library module

### Data required
- asset id
- title
- artist
- thumbnail/poster
- resolution
- duration
- created/published date
- library status
- source processing metadata summary
- dashboard summary metrics

### Primary types to define
- `LibraryAssetDto`
- `AssetVersionDto` (contract-ready)
- `AssetMetadataDto` (contract-ready)
- `LibraryListResponseDto`
- `LibraryDashboardResponseDto`
- `LibraryAssetCardViewModel`

### Required response shape
`LibraryDashboardResponseDto` should explicitly support:
- `summary`
- `items`
- `meta`

### Note
Even if detail UI is not built in this phase, the contract should be ready enough to avoid future restructuring.

---

## 6.6 Reports module

### Data required in this phase
Only establish minimal contract readiness for upcoming report pages.

### Primary types to define
- `AuditReportDto`
- `RuleHitDto`
- `AuditTimelineEventDto`
- `ReportDetailResponseDto`

### Rule
Keep this contract minimal and non-speculative.
Do not invent deep nesting or workflow semantics that are not needed yet.

---

## 7. Implementation workstreams

## Workstream A — normalize common and domain types

### Goal
Move transport/page contracts out of page files and into reusable typed modules.

### Deliverables
Create:
- `src/types/api.ts`
- `src/types/artist.ts`
- `src/types/queue.ts`
- `src/types/pipeline.ts`
- `src/types/library.ts`
- `src/types/audit-report.ts`

### Requirements
- define common query/meta/error contracts first
- keep enums/string unions explicit
- avoid `any`
- use consistent naming for DTOs vs dashboard response DTOs vs view models
- keep current UI helper types in `src/types/common.ts` only if they are truly UI-facing

### Testing
Type-only structures do not need runtime tests, but helpers created alongside them must be tested.

---

## Workstream B — add zod schemas

### Goal
Create runtime-safe validation for every transport contract used in sources, handlers, and fetchers.

### Deliverables
Create:
- `src/lib/schemas/common.ts`
- `src/lib/schemas/artist.ts`
- `src/lib/schemas/queue.ts`
- `src/lib/schemas/pipeline.ts`
- `src/lib/schemas/library.ts`
- `src/lib/schemas/report.ts`

### Requirements
- define reusable primitive schemas for IDs, timestamps, status enums, query params, pagination metadata, polling metadata, and error payloads
- keep schema names aligned with DTO names
- validate page-level response shapes, not only item-level DTOs

### Testing
Add tests for:
- valid payload acceptance
- invalid payload rejection
- status enum parsing
- query param parsing
- response wrapper/page response parsing

---

## Workstream C — build the mock data platform

### Goal
Separate static fixture content from generated behavior, progression logic, and module response assembly.

### Deliverables
Create:
- `src/lib/mocks/data/*.ts`
- `src/lib/mocks/factories/*.ts`
- `src/lib/mocks/simulators/queue.ts`
- `src/lib/mocks/simulators/pipeline.ts`
- `src/lib/mocks/sources/*.ts`
- `src/lib/mocks/handlers/*.ts`

### Design rules
- `data/` contains base seed content and representative records
- `factories/` create DTOs or expand repetitive seeded records when necessary
- `simulators/` own pure transition rules and deterministic progression
- `sources/` assemble validated module dashboard/list/detail responses
- `handlers/` map HTTP query input to source calls and wrap them in route-safe responses

### Important
- prefer pure simulation over mutable module state
- do not keep mutable shared state in page components
- if temporary handler/source memory is used, it must not be the primary correctness model

### Testing
Add tests for:
- queue transition rules
- pipeline stage progression rules
- deterministic outputs across repeated runs/ticks
- source/query response validity
- terminal-state stability
- log ordering stability

---

## Workstream D — add adapter layer

### Goal
Transform validated DTOs and dashboard payloads into UI-safe, module-specific view models.

### Deliverables
Create:
- `src/lib/adapters/artists.ts`
- `src/lib/adapters/queue.ts`
- `src/lib/adapters/pipeline.ts`
- `src/lib/adapters/library.ts`

### Responsibilities
Adapters should handle:
- status text mapping
- tone mapping
- display label formatting
- progress label construction
- date display formatting needed by current UI
- empty fallback values safe for rendering
- pipeline-specific card/log/deliverable presentation mapping where needed

### Rules
- adapters are pure functions
- no React imports
- no fetch calls
- no side effects
- DTO timestamps stay raw; adapters produce display strings

### Testing
Every exported adapter function must have unit tests.

---

## Workstream E — add mock API route handlers

### Goal
Expose consistent mock endpoints under App Router without making them the only internal data-access path.

### Deliverables
Create:
- `src/app/api/mock/artists/route.ts`
- `src/app/api/mock/queue/route.ts`
- `src/app/api/mock/pipeline/route.ts`
- `src/app/api/mock/library/route.ts`
- `src/app/api/mock/reports/route.ts`

### Endpoint behavior
- `artists`: stable dashboard/list response
- `queue`: dashboard/list response supporting deterministic progression
- `pipeline`: dashboard response supporting active job, stages, logs, and deliverables
- `library`: stable dashboard/list response
- `reports`: contract-valid minimal detail response

### Requirements
- all responses validated before return
- query parsing must be explicit and schema-backed where supported
- use stable response and error shape conventions
- support only the query params that the module truly needs in this phase (`page`, `pageSize`, `q`, `status`, etc.)
- handlers should remain thin and delegate to source/query functions

### Testing
Add tests for:
- response status and payload structure
- query param handling for supported filters
- schema validation at route boundary
- error response shape correctness

---

## Workstream F — add typed fetch layer

### Goal
Create a reusable client fetch abstraction that later SWR hooks can consume without changing contracts.

### Deliverables
Create:
- `src/lib/api/fetcher.ts`
- `src/lib/api/artists.ts`
- `src/lib/api/queue.ts`
- `src/lib/api/pipeline.ts`
- `src/lib/api/library.ts`
- `src/lib/api/reports.ts`

### Design
`fetcher.ts` should provide a small validated fetch helper that:
- fetches JSON
- checks response status
- parses with zod schema
- returns typed data or a stable typed error

Module files should expose clean entry points such as:
- `getArtistsDashboard()`
- `getQueueDashboard()`
- `getPipelineDashboard()`
- `getLibraryDashboard()`
- `getReportDetail()`

### Rules
- keep the fetch layer small
- do not introduce unnecessary abstraction layers
- these functions primarily serve client components, polling surfaces, and future SWR hooks
- server pages should still be allowed to use source/query functions directly where cleaner

### Testing
Add tests for:
- successful parsing
- failed parsing
- non-OK response handling
- stale/outdated polling response handling if a shared helper is added there

---

## Workstream G — refactor Phase 1 pages to use the new platform

### Goal
Remove inline mock arrays/constants from route pages and connect them to the Phase 2 data architecture.

### Target files to modify
- `src/app/(dashboard)/artists/page.tsx`
- `src/app/(dashboard)/queue/page.tsx`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/library/page.tsx`

### Integration approach
- `artists` and `library`: prefer server-side source/query access and adapter mapping
- `queue` and `pipeline`: use thin client composition only where polling is required
- if a polling hook is introduced, keep it narrow in `src/hooks/use-polling-resource.ts`
- do not leave page-local summary, log, stage, or deliverable constants behind as the primary source of truth

### Required outcome by page
- `artists`: summary cards and table rows come from typed dashboard payloads
- `queue`: summary cards, row data, and progress state come from typed dashboard payloads
- `pipeline`: summary cards, active job panel, stage list, live logs, and deliverables all come from typed dashboard payloads
- `library`: summary cards and asset cards come from typed dashboard payloads

### Testing
- component/page render tests for transformed data output
- polling behavior tests if a hook is introduced
- ensure pages remain visually aligned with the current prototype direction

---

## Workstream H — shared async state presentation components

### Goal
Add the minimum shared components needed for realistic data-driven states in later phases.

### Deliverables
Create:
- `src/components/shared/loading-state.tsx`
- `src/components/shared/error-state.tsx`
- `src/components/shared/empty-state.tsx`
- `src/components/shared/section-skeleton.tsx`

### Requirements
- components should be visually consistent with the current dashboard shell
- messaging should be accessible and clear
- error state should support a consistent retry action pattern where appropriate
- avoid layout jump where skeletons are used

### Testing
Each non-trivial component should have render tests.

---

## 8. Recommended execution order

### Step 1
Create common contracts and domain/page response types.

### Step 2
Add zod schemas and schema tests.

### Step 3
Build mock seed data, factories, deterministic simulators, and source/query functions.

### Step 4
Create adapter layer and tests.

### Step 5
Create App Router mock route handlers and tests.

### Step 6
Create typed fetcher/API client layer and tests.

### Step 7
Refactor the four dashboard pages to use the new data flow.

### Step 8
Add shared loading/error/empty state components.

### Step 9
Run validation:
- tests
- lint
- typecheck
- production build

This order keeps common contracts stable before page migration and reduces rework.

---

## 9. Coding rules for Phase 2

These rules should be enforced throughout implementation.

### Naming
- components: `PascalCase`
- functions/variables: `camelCase`
- constants: `UPPER_SNAKE_CASE` only for true constants
- zod schemas should mirror DTO names clearly
- avoid inconsistent abbreviations
- distinguish clearly between `Dto`, `ResponseDto`, and `ViewModel`

### Comments
- add comments only where logic is not obvious
- simulator rules and non-obvious status mapping should be documented clearly
- do not add noisy comments to self-explanatory code

### Reuse and consistency
- status mapping should be centralized by domain
- shared formatting logic should not be repeated in multiple adapters
- page files should stay focused on composition, not data shaping
- route handlers should stay thin and HTTP-specific

### Performance
- keep mock handlers and adapters lightweight
- avoid heavy client-side state or unnecessary rerenders
- preserve server-first rendering where possible
- avoid avoidable internal HTTP fetches from server-rendered pages

### Dependency discipline
- only add dependencies if Phase 2 truly requires them
- do not add large libraries for simple formatting or mock behavior needs
- solve package conflicts directly and safely

---

## 10. Testing strategy for Phase 2

The project rule is explicit: **every exported function introduced in this phase must be tested**.

### Required test coverage categories

#### Schema tests
- parse valid data
- reject invalid data
- validate query params
- validate page response shapes
- validate error shapes

#### Adapter tests
- correct view-model mapping
- correct status label/tone mapping
- correct fallback behavior
- correct date/progress formatting

#### Simulator tests
- deterministic progress increments
- correct terminal transitions
- correct failure-path behavior
- no backward progress for active items
- stable repeated output for the same deterministic input

#### Source/query tests
- valid response assembly
- correct summary/item composition
- correct pagination/filter behavior where supported
- stable pipeline log/deliverable composition

#### Handler tests
- valid response structure
- filter/query handling
- route boundary correctness
- stable error response shape

#### Fetch layer tests
- successful validated fetch
- parsing failure behavior
- HTTP error behavior
- polling helper behavior if introduced

#### Page/component tests
- renders transformed module data
- renders empty/loading/error states correctly
- pipeline page renders typed stage/log/deliverable data correctly
- polling view behavior if introduced

### Testing strategy rule
Most complexity should be tested at the pure-function level:
- schemas
- simulators
- sources
- adapters

Route tests should stay relatively thin.

### Validation commands
All of the following must pass before Phase 2 is considered complete:
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

---

## 11. Acceptance criteria

Phase 2 is complete only if all of the following are true:

1. No dashboard route relies on page-local hardcoded arrays/constants as its primary data source.
2. All module data comes through typed DTOs/page response DTOs validated by zod.
3. Shared response contracts explicitly define pagination/query/error/polling metadata.
4. Queue and pipeline mock data support deterministic progression suitable for polling demos.
5. Queue and pipeline progression does not rely on fragile shared mutable handler state as the primary correctness model.
6. A reusable adapter layer exists for all current dashboard modules.
7. Shared source/query functions exist and are used by server pages and route handlers where appropriate.
8. App Router mock endpoints exist for artists, queue, pipeline, library, and reports.
9. Typed fetch client functions exist and are ready for SWR consumption.
10. Shared loading/error/empty state components exist for future data-driven pages.
11. Every exported function introduced in Phase 2 has tests.
12. Lint, typecheck, tests, and production build all pass.
13. The pipeline page no longer depends on inline stage/log/deliverable constants.
14. Summary card data for all dashboard modules comes from typed contracts.
15. The UI remains visually aligned with the current prototype direction while moving to real architecture underneath.

---

## 12. Risks and mitigations

## Risk: overbuilding the data layer
If too many abstractions are added, the project becomes harder to extend.

### Mitigation
Prefer one clear layer per concern:
- schema
- mock source data
- simulator
- source/query assembly
- route handler
- adapter
- fetcher
- page consumer

Do not add generic frameworks around them.

---

## Risk: mock behavior diverges from future backend shape

### Mitigation
Use DTO + zod schema design now, and keep route responses realistic and stable.
Document assumptions in schema/source code where needed.
Keep reports especially minimal.

---

## Risk: queue/pipeline simulation becomes flaky

### Mitigation
Use deterministic progression rules, stable inputs, and pure transition helpers with direct tests.
Do not depend primarily on shared mutable process memory.

---

## Risk: page migration becomes partial
This is most likely to happen on `pipeline` because its current UI shape is richer than a simple list page.

### Mitigation
Define page-aware dashboard response contracts before page refactoring starts.
Treat pipeline logs, stages, and deliverables as first-class contract concerns.

---

## Risk: route handlers become too smart

### Mitigation
Keep handlers thin and push data assembly into source/query functions.
This improves testability and keeps server-page usage clean.

---

## Risk: polling introduces stale UI behavior

### Mitigation
Define forward-only progression, stable ordering, hidden-tab pause behavior, and stale-response protection up front.

---

## 13. Suggested deliverable slices

To keep implementation reviewable, execute Phase 2 in these slices:

### Slice 1 — contracts and schemas
- common types
- module DTOs
- page response DTOs
- zod schemas
- tests

### Slice 2 — mock platform core
- fixtures
- factories
- simulators
- source/query functions
- tests

### Slice 3 — adapters and fetch layer
- adapters
- fetcher
- module API clients
- tests

### Slice 4 — route handlers and page migration
- mock routes
- page refactor to data-driven rendering
- async state components
- tests

### Slice 5 — final validation and cleanup
- naming consistency pass
- comment quality pass
- lint/typecheck/test/build

---

## 14. Phase 2 exit status summary

When Phase 2 is done, the project should have this architectural posture:
- shell and route foundation from Phase 1 remains intact
- the app is backed by a reusable validated mock data platform
- page-level data no longer lives as inline constants
- server/client data-access boundaries stay clear
- queue and pipeline are ready for realistic deterministic polling behavior
- artists and library are ready for richer table/filter integration next
- reports contract is minimally ready for later detail surfaces

---

## 15. Recommended next phase after completion

After this plan is implemented, the next priority should still be **Phase 3: Shared interaction system**, specifically:
- TanStack Table foundation
- reusable table toolbar/filter system
- progress cells and async presentation states
- URL query-state sync
- richer module interaction patterns

This sequencing remains the lowest-risk path for keeping the codebase enterprise-grade, scalable, and easy to extend.
