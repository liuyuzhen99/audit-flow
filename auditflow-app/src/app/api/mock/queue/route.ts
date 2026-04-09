import { NextRequest, NextResponse } from "next/server";

import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";
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

    return NextResponse.json(buildQueueDashboardResponse(query));
  } catch (error) {
    return createErrorResponse(
      500,
      "queue_fetch_failed",
      error instanceof Error ? error.message : "Failed to load queue dashboard",
    );
  }
}
