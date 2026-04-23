import { NextRequest, NextResponse } from "next/server";

import type { ApiErrorDto } from "@/types/api";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";
import { parseListQueryParams } from "@/types/api";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";
const BACKEND_PAGE_SIZE = 100;

type BackendArtistsItem = {
  artist_id: string;
  name: string;
  status: string;
  youtube_channel_id: string | null;
  sync_status: "pending" | "processing" | "completed" | "failed" | "partial";
  last_sync_started_at: string | null;
  last_sync_completed_at: string | null;
  last_sync_error: string | null;
  candidate_count: number;
  partial_failure: boolean;
  empty_state: boolean;
  retry_metadata: {
    can_resync: boolean;
    latest_retry_count: number;
    latest_failure_reason: string | null;
  };
  source_health: Record<
    string,
    {
      status: "pending" | "processing" | "completed" | "failed" | "partial";
      retry_count: number;
      failure_reason: string | null;
      started_at: string | null;
      completed_at: string | null;
      discovered_count: number;
    }
  >;
  latest_candidate: {
    candidate_id: string;
    video_id: string;
    title: string;
    status: string;
    ingestion_status: "pending" | "processing" | "completed" | "failed" | "partial";
    channel_id: string | null;
    source_url: string;
    source_kind: string;
    published_at: string | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
    discovery_run_id: string | null;
    failure_reason: string | null;
  } | null;
  latest_run: {
    run_id: string;
    status: "pending" | "processing" | "completed" | "failed" | "partial";
    source_kind: string;
    discovered_count: number;
    failure_reason: string | null;
    started_at: string | null;
    completed_at: string | null;
  } | null;
};

type BackendArtistsResponse = {
  items: BackendArtistsItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  meta: {
    generated_at: string;
  };
};

type MappedArtistItem = ReturnType<typeof mapArtistsItem>;

function createErrorResponse(status: number, code: string, message: string, details?: string) {
  const payload: ApiErrorDto = { code, message, details };
  return NextResponse.json(payload, { status });
}

function getBackendBaseUrl() {
  return (process.env.RANDY_TRANSLATION_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL).replace(/\/$/, "");
}

function mapSort(sortBy?: string | null, sortDirection?: string | null) {
  const direction = sortDirection === "asc" ? "asc" : "desc";

  if (sortBy === "updatedAt") {
    return direction === "asc" ? "last_synced_asc" : "last_synced_desc";
  }

  if (sortBy === "candidateCount") {
    return direction === "asc" ? "candidate_count_asc" : "candidate_count_desc";
  }

  if (sortBy === "syncStatus") {
    return direction === "asc" ? "sync_status_asc" : "sync_status_desc";
  }

  if (sortBy === "name") {
    return direction === "asc" ? "name" : "name_desc";
  }

  return "candidate_count_desc";
}

function mapArtistsItem(item: BackendArtistsItem) {
  return {
    id: item.artist_id,
    name: item.name,
    status: item.status,
    youtubeChannelId: item.youtube_channel_id,
    youtubeChannelLabel: item.youtube_channel_id ?? "Unresolved",
    syncStatus: item.sync_status,
    lastSyncStartedAt: normalizeBackendTimestamp(item.last_sync_started_at),
    lastSyncCompletedAt: normalizeBackendTimestamp(item.last_sync_completed_at),
    lastSyncError: item.last_sync_error,
    candidateCount: item.candidate_count,
    partialFailure: item.partial_failure,
    emptyState: item.empty_state,
    retryMetadata: {
      canResync: item.retry_metadata.can_resync,
      latestRetryCount: item.retry_metadata.latest_retry_count,
      latestFailureReason: item.retry_metadata.latest_failure_reason,
    },
    sourceHealth: Object.fromEntries(
      Object.entries(item.source_health).map(([sourceKind, sourceState]) => [
        sourceKind,
        {
          status: sourceState.status,
          retryCount: sourceState.retry_count,
          failureReason: sourceState.failure_reason,
          startedAt: normalizeBackendTimestamp(sourceState.started_at),
          completedAt: normalizeBackendTimestamp(sourceState.completed_at),
          discoveredCount: sourceState.discovered_count,
        },
      ]),
    ),
    latestCandidate: item.latest_candidate
      ? {
          candidateId: item.latest_candidate.candidate_id,
          videoId: item.latest_candidate.video_id,
          title: item.latest_candidate.title,
          status: item.latest_candidate.status,
          ingestionStatus: item.latest_candidate.ingestion_status,
          channelId: item.latest_candidate.channel_id,
          sourceUrl: item.latest_candidate.source_url,
          sourceKind: item.latest_candidate.source_kind,
          publishedAt: normalizeBackendTimestamp(item.latest_candidate.published_at),
          firstSeenAt: normalizeBackendTimestamp(item.latest_candidate.first_seen_at),
          lastSeenAt: normalizeBackendTimestamp(item.latest_candidate.last_seen_at),
          discoveryRunId: item.latest_candidate.discovery_run_id,
          failureReason: item.latest_candidate.failure_reason,
        }
      : null,
    latestRun: item.latest_run
      ? {
          runId: item.latest_run.run_id,
          status: item.latest_run.status,
          sourceKind: item.latest_run.source_kind,
          discoveredCount: item.latest_run.discovered_count,
          failureReason: item.latest_run.failure_reason,
          startedAt: normalizeBackendTimestamp(item.latest_run.started_at),
          completedAt: normalizeBackendTimestamp(item.latest_run.completed_at),
        }
      : null,
  };
}

function getSortRankForSyncStatus(status: string) {
  switch (status) {
    case "failed":
      return 0;
    case "partial":
      return 1;
    case "processing":
      return 2;
    case "pending":
      return 3;
    case "completed":
      return 4;
    default:
      return 5;
  }
}

function sortArtistItems(items: MappedArtistItem[], sortBy?: string, sortDirection?: string | null) {
  const direction = sortDirection === "asc" ? 1 : -1;
  const sorted = [...items];

  sorted.sort((left, right) => {
    const leftValue =
      sortBy === "updatedAt"
        ? left.lastSyncCompletedAt ?? ""
        : sortBy === "syncStatus"
          ? getSortRankForSyncStatus(left.syncStatus)
          : sortBy === "name"
            ? left.name
            : left.candidateCount;
    const rightValue =
      sortBy === "updatedAt"
        ? right.lastSyncCompletedAt ?? ""
        : sortBy === "syncStatus"
          ? getSortRankForSyncStatus(right.syncStatus)
          : sortBy === "name"
            ? right.name
            : right.candidateCount;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      if (leftValue !== rightValue) {
        return (leftValue - rightValue) * direction;
      }
      return left.name.localeCompare(right.name);
    }

    const valueComparison = String(leftValue).localeCompare(String(rightValue));
    if (valueComparison !== 0) {
      return valueComparison * direction;
    }
    return left.name.localeCompare(right.name);
  });

  return sorted;
}

async function fetchArtistsPage(backendUrl: URL) {
  const response = await fetch(backendUrl, { cache: "no-store" });
  const payload = (await response.json()) as BackendArtistsResponse | { detail?: string };

  if (!response.ok) {
    const message = "detail" in payload && payload.detail ? payload.detail : "Failed to load artists";
    throw new Error(message);
  }

  return payload as BackendArtistsResponse;
}

export async function GET(request: NextRequest) {
  const query = parseListQueryParams(request.nextUrl.searchParams);
  const effectiveSortBy = query.sortBy ?? "candidateCount";
  const effectiveSortDirection = query.sortDirection ?? "desc";

  try {
    const firstPageUrl = new URL(`${getBackendBaseUrl()}/v1/artists`);
    firstPageUrl.searchParams.set("page", "1");
    firstPageUrl.searchParams.set("page_size", String(BACKEND_PAGE_SIZE));
    firstPageUrl.searchParams.set("sort", mapSort(query.sortBy, query.sortDirection));
    if (query.q) {
      firstPageUrl.searchParams.set("q", query.q);
    }
    if (query.status) {
      firstPageUrl.searchParams.set("sync_status", query.status);
    }

    const firstPagePayload = await fetchArtistsPage(firstPageUrl);
    const pagePromises: Promise<BackendArtistsResponse>[] = [];

    for (let page = 2; page <= firstPagePayload.pagination.total_pages; page += 1) {
      const nextPageUrl = new URL(firstPageUrl);
      nextPageUrl.searchParams.set("page", String(page));
      pagePromises.push(fetchArtistsPage(nextPageUrl));
    }

    const remainingPages = await Promise.all(pagePromises);
    const allPayloads = [firstPagePayload, ...remainingPages];
    const allItems = allPayloads.flatMap((payload) => payload.items).map(mapArtistsItem);
    const sortedItems = sortArtistItems(allItems, effectiveSortBy, effectiveSortDirection);
    const start = (query.page - 1) * query.pageSize;
    const pageItems = sortedItems.slice(start, start + query.pageSize);

    return NextResponse.json({
      stats: {
        totalArtists: sortedItems.length,
        visibleArtists: pageItems.length,
        totalCompletedArtists: sortedItems.filter((item) => item.syncStatus === "completed").length,
        visibleCompletedArtists: pageItems.filter((item) => item.syncStatus === "completed").length,
        totalFailedArtists: sortedItems.filter((item) => item.syncStatus === "failed" || item.syncStatus === "partial").length,
        visibleFailedArtists: pageItems.filter((item) => item.syncStatus === "failed" || item.syncStatus === "partial").length,
        totalCandidates: sortedItems.reduce((sum, item) => sum + item.candidateCount, 0),
        visibleCandidates: pageItems.reduce((sum, item) => sum + item.candidateCount, 0),
      },
      items: pageItems,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: sortedItems.length,
        totalPages: Math.max(Math.ceil(sortedItems.length / query.pageSize), 1),
      },
      meta: {
        generatedAt: normalizeBackendTimestamp(firstPagePayload.meta.generated_at),
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "artists_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach artists backend",
    );
  }
}
