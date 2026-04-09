# Review of `plan-v2-phase2.md`

## Overall assessment

This is a strong and much more implementation-ready plan than the earlier version.

It gets the big architectural direction right:
- clear separation between DTOs, schemas, adapters, fetchers, and page consumers
- mock-first but production-minded contract design
- deterministic simulator intent for queue/pipeline
- good emphasis on test coverage and keeping pages thin
- scope is mostly controlled and the sequencing is sensible

My opinion: **the plan is about 80–85% complete**, and it is good enough to start implementation **only after a few important corrections are made**.

The biggest issue is not general quality. The biggest issue is that a few details are still underspecified in places where they will directly affect correctness and refactor cost.

---

## What is already strong

### 1. The architecture direction is correct
The split between:
- transport DTOs
- zod validation
- mock platform
- adapter/view-model layer
- typed fetch layer
- page integration

is the right shape for this codebase.

That is especially important because the current pages are still page-local mock UIs:
- `src/app/(dashboard)/artists/page.tsx`
- `src/app/(dashboard)/queue/page.tsx`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/library/page.tsx`

So the plan correctly targets the real current problem.

### 2. The plan respects the current roadmap
It aligns well with:
- `plans/status-phase1.md`
- `docs/roadmap.md`
- `CLAUDE.md`

In particular, it correctly keeps:
- real backend integration out of scope
- large interaction systems mostly for later phases
- the current prototype-aligned shell intact

### 3. The testing mindset is good
The plan is appropriately strict about testing and boundary validation.
That matches the project instruction in `CLAUDE.md` that code must be verified by testing.

### 4. The server-first direction is correct
Section 4.1 is a good decision. Keeping `page.tsx` server-first by default is the right move in App Router.

---

## Main gaps and risks

## High-priority issue 1 — the page payloads are still underspecified
The plan talks mostly in terms of generic list/data contracts, but the **actual current pages are not all simple list pages**.

Current UI shape by module:
- `artists/page.tsx`: stat cards + table rows
- `queue/page.tsx`: stat cards + table rows + progress bars
- `pipeline/page.tsx`: stat cards + active job console + stage list + live log + deliverables
- `library/page.tsx`: stat cards + grid cards

That means "list response" alone is not enough to migrate the real UI.

### What is missing
The plan should explicitly define contracts for:
- summary metric payloads used by all four pages
- pipeline log entries
- pipeline deliverables
- pipeline active-stage / active-run detail payload
- library card-ready media presentation fields
- any page-level grouped response shape needed to avoid over-fetching from multiple endpoints

### Why this matters
Without this, implementation will drift in one of two bad directions:
1. page files keep some inline mock constants because the plan does not cover them fully, or
2. engineers improvise ad hoc response shapes during implementation

Both outcomes weaken the point of Phase 2.

### Concrete advice
Add explicit contracts such as:
- `SummaryMetricDto`
- `PipelineLogEntryDto`
- `PipelineDeliverableDto`
- `PipelineJobDetailDto` or `PipelineConsoleDto`

And define module response shapes more concretely, for example:
- artists: `summary + items + filtersMeta`
- queue: `summary + items + pollingMeta`
- pipeline: `summary + jobs + activeJobDetail`
- library: `summary + items + filtersMeta`

---

## High-priority issue 2 — do not make server pages fetch their own API routes
The plan includes:
- App Router mock route handlers
- typed fetchers in `src/lib/api/*`
- server-first pages

That combination is good in principle, but there is one architectural trap here:
**server-rendered pages should not rely on internal HTTP requests to the same app when they can call the underlying data source directly**.

### Why this is a risk
In Next.js App Router, calling your own route handlers from server components often creates:
- avoidable extra hops
- awkward base URL handling
- duplicated caching/revalidation concerns
- harder tests

### Concrete advice
Define one internal source-of-truth function per module that assembles validated DTO data.
Then:
- server pages call that source directly
- route handlers wrap that source in HTTP
- client polling can use the route handlers via fetch/SWR

In other words:
- **route handlers are the network boundary**
- **module source functions are the domain boundary**

If you do not add this rule, the implementation will likely end up with server pages fetching `/api/mock/*`, which is not the best design here.

---

## High-priority issue 3 — mutable in-memory simulator state is a reliability risk
The plan allows handler-level in-memory state for polling demos.
That is the single biggest reliability concern in the document.

### Why this is risky
In-memory mutable state inside route handlers is fragile because it can behave inconsistently across:
- hot reloads
- test runs
- parallel requests
- future deployment environments
- serverless or multi-instance execution

It can also make deterministic tests harder than expected.

### Better approach
Make progression deterministic from explicit inputs rather than process memory.

Good options:
- derive progression from `tick` or `cursor` query params
- derive progression from a stable seed + request count passed in by caller
- use pure transition helpers over immutable seed records
- keep a simulator clock abstraction in tests

### Recommended rule
Prefer:
- **pure simulation functions**
- **request-derived deterministic progression**

Avoid:
- shared mutable state in handlers

If temporary mutable state is kept for demo realism, it should be:
- dev-only
- isolated behind one module
- clearly documented as non-production behavior

---

## High-priority issue 4 — response contract standardization is still too vague
The plan says "stable response shape conventions" and mentions query params like `page`, `q`, `status`.
That is directionally correct, but it is still too loose for a contract phase.

### What is missing
You should explicitly standardize:
- pagination shape
- filter shape
- sort shape
- error shape
- metadata shape

### Concrete additions
Define common contracts such as:
- `PagedResponseDto<T>`
- `ListQueryDto`
- `SortDirection`
- `ApiErrorResponseDto`
- `ResponseMetaDto`

At minimum, list responses should consistently decide whether they use:
- page/pageSize/total
nor
- cursor/nextCursor

Do not leave that ambiguous.

Also define whether module summaries live inside the same response or are returned separately.

### Why this matters
If pagination/filter/error contracts are not frozen now, Phase 3 table/query-state work will force a second contract refactor.

---

## High-priority issue 5 — polling behavior needs a real contract, not just a hook mention
The plan mentions `use-polling-resource.ts`, but the behavioral contract is still incomplete.

### Missing polling details
You should explicitly define:
- poll interval per module
- whether polling pauses on hidden tabs
- whether polling stops on terminal states
- deduping behavior when a previous request is still inflight
- stale response protection / race handling
- error retry behavior
- whether timestamps/log sequences are stable between ticks

### Why this matters
Queue and pipeline are the two most failure-prone areas in this phase.
If polling semantics are vague, the UI can easily become flaky or visually inconsistent.

### Concrete advice
Document a simple rule set now, for example:
- queue and pipeline poll every N seconds
- terminal items stop changing
- active items only advance forward, never backward
- client ignores out-of-order responses
- polling pauses when the document is hidden

This can stay lightweight, but it should be explicit.

---

## High-priority issue 6 — reports are at risk of premature overdesign
The plan is correct to make reports contract-ready only.
That said, `AuditReportDto`, `RuleHitDto`, and `AuditTimelineEventDto` can easily become speculative if over-modeled too early.

### Advice
Keep reports minimal in Phase 2:
- only fields already implied by upcoming UI/prototype needs
- avoid deep nested structures unless they are truly required soon
- avoid inventing backend semantics that are not yet stable

This is the one area where under-design is safer than over-design.

---

## Medium-priority missing perspectives

## 1. Summary card contracts need to be explicit
Every current page uses summary cards, and `src/types/common.ts` already has a UI-oriented `ModuleSummary` type.

That should not automatically become the transport contract.

### Advice
Treat current `ModuleSummary` as a view-model/UI type.
Add a DTO-level summary metric contract and adapt into the existing UI shape.

Otherwise you blur DTOs and view models on day one.

---

## 2. Status ownership should be stricter
The plan says status mapping should be centralized by domain, which is correct, but it should go one step further.

### Add explicit rules
For each domain, define:
- the canonical status union
- allowed transitions
- which layer owns tone/label mapping
- which layer owns progress derivation

For example:
- DTO owns raw machine status
- adapter owns display label and tone
- simulator owns transition legality

This will reduce status drift.

---

## 3. Raw timestamps vs formatted strings should be frozen now
The plan mentions date display formatting in adapters, which is good.

### Advice
Be explicit that:
- DTOs always carry raw ISO timestamps
- adapters derive display strings
- UI never parses ad hoc timestamp formats

This is a small point, but it prevents future inconsistency fast.

---

## 4. Test strategy should separate pure logic from route tests
The testing section is strong, but I would make one implementation rule more explicit:

### Advice
Most complexity should be tested at the pure-function level:
- schemas
n- simulators
- adapters
- source/query assembly functions

Route handler tests should stay thin and mostly verify:
- HTTP status
- query parsing
- response envelope

This keeps the test suite faster and more stable.

---

## 5. Async state UX should include accessibility basics
This is not a blocker for the plan, but it is missing.
Once loading/error/empty states are introduced, the shared components should also define:
- accessible headings/messages
- meaningful retry CTA patterns where applicable
- non-color-only status signaling
- sensible skeleton usage without layout jump

You do not need a full accessibility phase here, but these shared components should not be purely visual.

---

## Specific places where the plan and current UI do not fully line up

### Pipeline is the clearest mismatch
`src/app/(dashboard)/pipeline/page.tsx` is not really a plain list page.
It currently renders:
- summary cards
- one active task panel
- stage progression
- live execution log
- deliverables list

But the plan mainly describes `PipelineListResponseDto` plus stages and run metadata.

### Recommendation
The pipeline contract should explicitly support the current page shape, not just a future generic list.
Otherwise the page migration in Workstream G will either be partial or require undocumented additions.

### Library also needs card-oriented view support
`src/app/(dashboard)/library/page.tsx` is a grid card page, not a table page.
The plan is mostly okay here, but make sure the contract includes enough asset presentation metadata to avoid leaking formatting logic back into the page.

---

## Recommended changes to the plan before implementation

## Change 1 — add common contracts
Add explicit common contracts for:
- `SummaryMetricDto`
- `PagedResponseDto<T>` or a clearly named list response base
- `ApiErrorResponseDto`
- `ListQueryDto`
- `SortSpecDto` or equivalent
- shared metadata contract

## Change 2 — add pipeline-specific detail contracts
Add:
- `PipelineLogEntryDto`
- `PipelineDeliverableDto`
- `PipelineJobDetailDto` or equivalent grouped response

## Change 3 — clarify the domain-source rule
Document this rule explicitly:
- server pages should call domain/mock source functions directly
- API routes wrap the same source functions for client fetching and parity
- avoid server components fetching their own route handlers unless there is a very specific reason

## Change 4 — tighten simulator rules
Replace vague in-memory state allowance with a preference order:
1. pure deterministic simulator
2. request-derived progression
3. isolated temporary in-memory demo state only if absolutely necessary

## Change 5 — define polling semantics
Document:
- interval
- stop conditions
- retry behavior
- race handling
- hidden-tab behavior
- terminal-state behavior

## Change 6 — make module response shapes page-aware
Do not only define entity-level DTOs.
Also define page/module-level response composition so the current UI can be fully migrated.

## Change 7 — keep reports minimal
Mark reports explicitly as:
- contract-ready
- minimal
- non-speculative

---

## Suggested refinement to workstreams

### Workstream C
Good overall, but add explicit guidance that simulators should be pure and deterministic from stable inputs.

### Workstream E
Add error response conventions and standard query parsing rules.

### Workstream F
Clarify that fetch clients are mainly for:
- client components
- polling surfaces
- future SWR hooks

Do not force server pages to consume them if direct source functions are cleaner.

### Workstream G
Expand this section to describe the actual target UI shape for each page, especially pipeline.

---

## Suggested acceptance criteria additions

I would add these acceptance criteria:

11. Server-rendered pages do not depend on avoidable internal HTTP fetches to their own mock routes.
12. Shared response contracts explicitly define pagination/filter/sort/error metadata.
13. Queue and pipeline progression is deterministic without relying on fragile shared mutable handler state.
14. Pipeline page data fully replaces current inline stage/log/deliverable constants.
15. Summary card data for all dashboard modules comes from typed DTOs or typed page-level response contracts.

---

## Bottom line

This is a **good plan** and much closer to implementation quality than a generic roadmap.

My judgment:
- **Architecture direction:** strong
- **Completeness:** good but not fully locked
- **Reliability:** good if simulator/state rules are tightened
- **Risk level:** moderate, mostly because of polling/state and page-shape underspecification
- **Biggest missing perspective:** current page surfaces are not all simple list screens, especially pipeline

## Final recommendation

**Do not rewrite the plan from scratch.**
Just make the following concrete corrections before implementation starts:
1. add page-aware response contracts, especially for pipeline and summary metrics
2. forbid server pages from depending on internal mock route fetches as the default path
3. remove reliance on shared mutable in-memory handler state as the primary simulator strategy
4. standardize pagination/filter/sort/error contracts now
5. define explicit polling behavior rules
6. keep reports intentionally minimal

If those changes are made, this becomes a solid Phase 2 execution plan with a much lower chance of mid-phase refactor.
