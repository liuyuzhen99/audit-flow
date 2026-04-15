import { NextRequest, NextResponse } from "next/server";

import { getReportDetailResponse } from "@/lib/mocks/sources/reports";
import type { ApiErrorDto } from "@/types/api";

function createErrorResponse(status: number, code: string, message: string) {
  const payload: ApiErrorDto = {
    code,
    message,
  };

  return NextResponse.json(payload, { status });
}

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get("id")?.trim();

  if (!reportId) {
    return createErrorResponse(400, "report_id_required", "A report id is required.");
  }

  try {
    return NextResponse.json(getReportDetailResponse(reportId));
  } catch (error) {
    if (error instanceof Error && error.message === "Report not found") {
      return createErrorResponse(404, "report_not_found", error.message);
    }

    return createErrorResponse(
      500,
      "report_fetch_failed",
      error instanceof Error ? error.message : "Failed to load report detail",
    );
  }
}
