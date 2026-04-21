import { NextRequest, NextResponse } from "next/server";

import type { ApiErrorDto } from "@/types/api";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";

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

function createErrorResponse(status: number, code: string, message: string, details?: string) {
  const payload: ApiErrorDto = { code, message, details };
  return NextResponse.json(payload, { status });
}

function getBackendBaseUrl() {
  return (process.env.RANDY_TRANSLATION_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL).replace(/\/$/, "");
}

function mapSort(sortBy?: string | null, sortDirection?: string | null) {
  if (sortBy === "updatedAt") {
    return "last_synced_desc";
  }

  return "name";
}

function mapArtistsResponse(payload: BackendArtistsResponse) {
  return {
    items: payload.items.map((item) => ({
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
    })),
    pagination: {
      page: payload.pagination.page,
      pageSize: payload.pagination.page_size,
      total: payload.pagination.total,
      totalPages: payload.pagination.total_pages,
    },
    meta: {
      generatedAt: normalizeBackendTimestamp(payload.meta.generated_at),
    },
  };
}

export async function GET(request: NextRequest) {
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/artists`);
  backendUrl.searchParams.set("page", request.nextUrl.searchParams.get("page") ?? "1");
  backendUrl.searchParams.set("page_size", request.nextUrl.searchParams.get("pageSize") ?? "10");

  const query = request.nextUrl.searchParams.get("q");
  const status = request.nextUrl.searchParams.get("status");
  const sortBy = request.nextUrl.searchParams.get("sortBy");
  const sortDirection = request.nextUrl.searchParams.get("sortDirection");

  if (query) {
    backendUrl.searchParams.set("q", query);
  }

  if (status) {
    backendUrl.searchParams.set("sync_status", status);
  }

  backendUrl.searchParams.set("sort", mapSort(sortBy, sortDirection));

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = (await response.json()) as BackendArtistsResponse | { detail?: string };

    if (!response.ok) {
      const message = "detail" in payload && payload.detail ? payload.detail : "Failed to load artists";
      return createErrorResponse(response.status, "artists_fetch_failed", message);
    }

    return NextResponse.json(mapArtistsResponse(payload as BackendArtistsResponse));
  } catch (error) {
    return createErrorResponse(
      502,
      "artists_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach artists backend",
    );
  }
}
