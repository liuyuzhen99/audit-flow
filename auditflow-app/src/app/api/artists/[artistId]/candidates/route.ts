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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await context.params;
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/artists/${artistId}/candidates`);

  backendUrl.searchParams.set("page", request.nextUrl.searchParams.get("page") ?? "1");
  backendUrl.searchParams.set("page_size", request.nextUrl.searchParams.get("pageSize") ?? "10");

  const status = request.nextUrl.searchParams.get("status");
  if (status) {
    backendUrl.searchParams.set("status", status);
  }

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = (await response.json()) as Record<string, unknown> & { detail?: string };

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "artist_candidates_fetch_failed",
        payload.detail ?? "Failed to load artist candidates",
      );
    }

    return NextResponse.json({
      artistId: payload.artist_id,
      items: Array.isArray(payload.items)
        ? payload.items.map((item) => {
            const candidate = item as Record<string, unknown>;
            return {
              candidateId: candidate.candidate_id,
              videoId: candidate.video_id,
              title: candidate.title,
              status: candidate.status,
              ingestionStatus: candidate.ingestion_status,
              channelId: candidate.channel_id,
              sourceUrl: candidate.source_url,
              sourceKind: candidate.source_kind,
              publishedAt: normalizeBackendTimestamp(candidate.published_at),
              firstSeenAt: normalizeBackendTimestamp(candidate.first_seen_at),
              lastSeenAt: normalizeBackendTimestamp(candidate.last_seen_at),
              discoveryRunId: candidate.discovery_run_id,
              failureReason: candidate.failure_reason,
            };
          })
        : [],
      pagination: {
        page: (payload.pagination as Record<string, number>).page,
        pageSize: (payload.pagination as Record<string, number>).page_size,
        total: (payload.pagination as Record<string, number>).total,
        totalPages: (payload.pagination as Record<string, number>).total_pages,
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "artist_candidates_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach artist candidates backend",
    );
  }
}
