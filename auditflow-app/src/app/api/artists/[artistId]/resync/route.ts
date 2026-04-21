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
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/artists/${artistId}/resync`);
  backendUrl.searchParams.set("days", request.nextUrl.searchParams.get("days") ?? "14");

  try {
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
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "artist_resync_failed",
      error instanceof Error ? error.message : "Failed to reach artist resync backend",
    );
  }
}
