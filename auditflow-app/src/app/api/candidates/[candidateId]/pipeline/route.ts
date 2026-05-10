import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";

type BackendCandidatePipelineResponse = {
  candidate_id: string;
  candidate_status: string;
  review_id: string;
  review_type: string;
  review_status: string;
  version: number;
  task_id?: string | null;
  message?: string | null;
};

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ candidateId: string }> },
) {
  const { candidateId } = await context.params;

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/v1/candidates/${encodeURIComponent(candidateId)}/pipeline`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "X-Actor-Id": "frontend-user-1" },
      },
    );
    const payload = await parseBackendJson<BackendCandidatePipelineResponse | { error?: { message?: string }; detail?: string }>(
      response,
    );

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "candidate_pipeline_add_failed",
        getBackendErrorMessage(payload as never, "Failed to add candidate to pipeline"),
      );
    }

    const result = payload as BackendCandidatePipelineResponse;
    return NextResponse.json({
      candidateId: result.candidate_id,
      candidateStatus: result.candidate_status,
      reviewId: result.review_id,
      reviewType: result.review_type,
      reviewStatus: result.review_status,
      version: result.version,
      taskId: result.task_id ?? null,
      message: result.message ?? null,
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "candidate_pipeline_add_failed",
      error instanceof Error ? error.message : "Failed to reach candidate pipeline backend",
    );
  }
}
