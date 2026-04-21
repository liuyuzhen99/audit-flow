# Artist Smoke Test Status

**Date:** 2026-04-21
**Branch:** master
**Scope:** `artists` real backend integration smoke test

---

## Current status

The artists flow is no longer only validated by mock routes and local unit tests. A real smoke test has now been completed across:

- Phase 3 backend data ingestion
- Next.js artists BFF routes
- SSR page rendering for `/artists`
- SSR page rendering for `/artists/[artistId]`

This means the artists module has moved from "contract aligned and ready for integration" to "real backend, BFF, and SSR page flow verified locally".

---

## Smoke test results

### Backend data plane

- Local Postgres schema was upgraded from `20260415_220500` to `20260419_120000`.
- Python API was started successfully on `127.0.0.1:8000`.
- `create_phase3_catalog_service()` was confirmed to be available.
- `POST /internal/phase3/spotify/sync-followed-artists`
  - `200 OK`
  - `synced_count=625`
  - `created_count=625`
  - `updated_count=0`
- `POST /internal/phase3/catalog/resync-active-artists?days=14&limit=20`
  - `200 OK`
  - `requested=20`
  - `refreshed=20`
  - `failed=0`
- `GET /v1/artists?page=1&page_size=5&sort=last_synced_desc`
  - `200 OK`
  - `total=625`
  - verified that at least one artist has real candidates

### BFF routes

- `GET /api/artists` passes against the real backend.
- `GET /api/artists/[artistId]/candidates` passes against the real backend.
- `POST /api/artists/[artistId]/resync?days=7` passes against the real backend.

### SSR pages

- `GET /artists` returns `200` and renders the real artists list.
- `GET /artists/[artistId]` returns `200` and renders real candidate detail content.
- When the backend is stopped, `GET /api/artists` returns:
  - `502`
  - `{"code":"artists_fetch_failed","message":"fetch failed"}`
- The page-level fallback states remain intact instead of crashing the whole page render.

---

## Issues found during the smoke test

### 1. SSR could not fetch relative `/api/...` URLs

Observed behavior:

- `/artists` and `/artists/[artistId]` returned page shells but fell into error UI.

Root cause:

- Server-rendered page code reached relative `/api/...` paths.
- In the Next.js server context, those relative URLs could not be parsed.

Fix:

- Resolve request origin from headers during SSR.
- Convert relative API paths to absolute URLs before fetching.

### 2. Artist time fields failed schema validation

Observed behavior:

- After fixing SSR URL handling, artists pages could still render error states.

Root cause:

- Backend datetime strings were not always normalized to the format expected by the frontend schema.
- Artists BFF routes forwarded those raw values into strict schema validation.

Fix:

- Normalize backend timestamps in artists-related BFF routes before returning DTOs to the frontend.

---

## Representative verification sample

- Verified detail route using:
  - `artistId=6zfh3gWQe8WsPAA2XrUh2g`
  - `name=A.M.`

This also surfaced a real data-quality issue:

- the current candidate set for `A.M.` resolves to `Coast to Coast AM` content

That is not a page plumbing bug. It is a discovery-quality problem and should guide the next round of work.

---

## What this changes about next steps

The highest-value next work is no longer "finish connecting the artists page". That part is done.

The next priorities are:

1. Improve channel lookup precision.
2. Tighten candidate relevance filtering.
3. Handle ambiguous artist names more safely.
4. Preserve the smoke-test flow as a repeatable integration playbook.

---

## Exit criteria status

| Criterion | Status |
|---|---|
| Phase 3 backend ingestion endpoints run with real data | ✅ |
| `/v1/artists` returns real data from local backend | ✅ |
| Next BFF artists routes work against real backend | ✅ |
| `/artists` SSR renders real list data | ✅ |
| `/artists/[artistId]` SSR renders real candidate data | ✅ |
| Backend-down fallback behavior is explicit and non-fatal | ✅ |
| Candidate quality is production-ready | not yet |
| Ambiguous-name handling is reliable | not yet |
