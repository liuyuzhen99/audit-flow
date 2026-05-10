import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";

type BackendCandidatePipelineRetryResponse = {
  candidate_id: string;
  job_id: string;
  stage: string;
  attempt: number;
  message: string;
  dispatch?: unknown;
};

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ candidateId: string }> },
) {
  const { candidateId } = await context.params;

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/v1/candidates/${encodeURIComponent(candidateId)}/pipeline/retry`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
    const payload = await parseBackendJson<
      BackendCandidatePipelineRetryResponse | { error?: { message?: string }; detail?: string }
    >(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "candidate_pipeline_retry_failed",
        getBackendErrorMessage(payload as never, "Failed to retry candidate pipeline"),
      );
    }

    const result = payload as BackendCandidatePipelineRetryResponse;
    return NextResponse.json({
      candidateId: result.candidate_id,
      jobId: result.job_id,
      stage: result.stage,
      attempt: result.attempt,
      message: result.message,
      dispatch: result.dispatch ?? null,
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "candidate_pipeline_retry_failed",
      error instanceof Error ? error.message : "Failed to reach candidate pipeline retry backend",
    );
  }
}
