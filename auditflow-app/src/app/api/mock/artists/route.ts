import { NextRequest, NextResponse } from "next/server";

import { buildArtistsDashboardResponse } from "@/lib/mocks/sources/artists";
import { parseListQueryParams, type ApiErrorDto } from "@/types/api";

function createErrorResponse(status: number, code: string, message: string) {
  const payload: ApiErrorDto = {
    code,
    message,
  };

  return NextResponse.json(payload, { status });
}

export async function GET(request: NextRequest) {
  try {
    const query = parseListQueryParams(request.nextUrl.searchParams);
    // dateRange is Artists-scoped — read separately, not via shared parseListQueryParams
    const rawDateRange = request.nextUrl.searchParams.get("dateRange");
    const dateRange = rawDateRange === "2w" ? "2w" : undefined;

    return NextResponse.json(buildArtistsDashboardResponse({ ...query, dateRange }));
  } catch (error) {
    return createErrorResponse(
      500,
      "artists_fetch_failed",
      error instanceof Error ? error.message : "Failed to load artists dashboard",
    );
  }
}
