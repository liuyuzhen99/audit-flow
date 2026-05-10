# Phase 9 Four-Screen Joint Test

Use this checklist for local or staging validation when Playwright is not installed. Keep the Python API and Next app pointed at the same backend data source.

## Setup

1. Start the backend API.
2. Start the frontend with `RANDY_TRANSLATION_API_BASE_URL` pointing to the backend.
3. Open `/queue` and confirm the footer does not hide readiness details when backend status is degraded.

## Artists

- Open `/artists`.
- Search for an artist with known data, such as `6LACK`.
- Confirm the URL becomes `/artists?q=6LACK` and the table only shows matching artists.
- Click `Pending`, `Processing`, and `Completed`; confirm each status updates the URL and table content.
- Change rows per page and sort a table column; confirm URL and visible rows remain consistent.

## Queue

- Open `/queue`.
- Confirm pending reviews appear before approved/rejected historical items in the default `All` view.
- Click `Pending`; confirm URL includes `status=pending` and only actionable pending rows are shown.
- Search by candidate or artist; confirm URL includes `q=` and list content follows it.
- For a pending row, confirm `Open Pipeline` links to `/pipeline?q=<candidateId>&candidateId=<candidateId>`.
- Confirm the Phase 9 Cutover panel shows read source, readiness state, gate badges, `Run readiness check`, and `Open raw report`.
- Click `Run readiness check`; confirm the panel refreshes without hiding blocked gate reasons.

## Pipeline

- Open `/pipeline`.
- Open a candidate from Queue with `candidateId`; confirm the matching workflow row expands automatically.
- Click each stage filter, especially `Final`; confirm URL and empty/non-empty states are correct.
- Expand a row and confirm the detail label is `Last Worker Execution`, not a current-stage claim.
- Confirm the Phase 9 Cutover panel behaves the same as Queue and does not expose cutover or rollback mutation controls.

## Library

- Open `/library`.
- Confirm Ready assets show `Open preview`.
- Confirm Missing assets show `View missing artifact`, not `Open preview`.
- Open a Ready asset and verify preview/download controls are available.
- Open a Missing asset and verify the page states no final artifact is attached.
- Search for an accepted asset title or artist and confirm URL/list synchronization.

## Footer Readiness Detail

- Run with one degraded backend dependency, such as OSS, RabbitMQ, or Qdrant.
- Confirm the footer shows the degraded component names, for example `oss degraded`.
- Confirm four-screen data still loads when degraded readiness is non-blocking.
