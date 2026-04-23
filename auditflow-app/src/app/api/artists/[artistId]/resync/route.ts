import { NextRequest, NextResponse } from "next/server";

import type { ApiErrorDto } from "@/types/api";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";

function getBackendBaseUrl() {
  return (process.env.RANDY_TRANSLATION_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL).replace(/\/$/, "");
}

function createErrorResponse(status: number, code: string, message: string, details?: string) {
  const payload: ApiErrorDto = { code, message, details };
  return NextResponse.json(payload, { status });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await context.params;
  const baseUrl = getBackendBaseUrl();
  const syncUrl = new URL(`${baseUrl}/internal/phase3/spotify/sync-followed-artists`);
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/artists/${artistId}/resync`);
  const artistsLookupUrl = new URL(`${baseUrl}/v1/artists`);
  artistsLookupUrl.searchParams.set("q", artistId);
  artistsLookupUrl.searchParams.set("page_size", "1");
  artistsLookupUrl.searchParams.set("sort", "name");
  backendUrl.searchParams.set("days", request.nextUrl.searchParams.get("days") ?? "14");

  try {
    const syncResponse = await fetch(syncUrl, { method: "POST", cache: "no-store" });
    const syncPayload = (await syncResponse.json()) as Record<string, unknown> & { detail?: string };

    if (!syncResponse.ok) {
      return createErrorResponse(
        syncResponse.status,
        "artist_resync_failed",
        syncPayload.detail ?? "Failed to sync Spotify followed artists",
      );
    }

    const artistsResponse = await fetch(artistsLookupUrl, { cache: "no-store" });
    const artistsPayload = (await artistsResponse.json()) as { items?: Array<{ artist_id?: string }> } & {
      detail?: string;
    };

    if (!artistsResponse.ok) {
      return createErrorResponse(
        artistsResponse.status,
        "artist_resync_failed",
        artistsPayload.detail ?? "Failed to refresh artists after Spotify sync",
      );
    }

    const stillFollowed = (artistsPayload.items ?? []).some((item) => item.artist_id === artistId);
    if (!stillFollowed) {
      const now = new Date().toISOString();
      return NextResponse.json({
        runId: `spotify-sync-${artistId}`,
        artistId,
        status: "completed",
        discoveredCount: 0,
        startedAt: normalizeBackendTimestamp(now),
        completedAt: normalizeBackendTimestamp(now),
        channelRunId: `spotify-sync-${artistId}`,
        discoveryRunId: `spotify-sync-${artistId}`,
        artistRemoved: true,
      });
    }

    const response = await fetch(backendUrl, { method: "POST", cache: "no-store" });
    const payload = (await response.json()) as Record<string, unknown> & { detail?: string };

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "artist_resync_failed",
        payload.detail ?? "Failed to resync artist",
      );
    }

    return NextResponse.json({
      runId: payload.run_id,
      artistId: payload.artist_id,
      status: payload.status,
      discoveredCount: payload.discovered_count,
      startedAt: normalizeBackendTimestamp(payload.started_at),
      completedAt: normalizeBackendTimestamp(payload.completed_at),
      channelRunId: payload.channel_run_id,
      discoveryRunId: payload.discovery_run_id,
      artistRemoved: false,
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "artist_resync_failed",
      error instanceof Error ? error.message : "Failed to reach artist resync backend",
    );
  }
}
