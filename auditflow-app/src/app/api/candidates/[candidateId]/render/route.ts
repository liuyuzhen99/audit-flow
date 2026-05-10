import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";

type BackendRenderResponse = {
  task_id: string;
  message: string;
  candidate_id: string | null;
};

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ candidateId: string }> },
) {
  const { candidateId } = await context.params;

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/v1/candidates/${encodeURIComponent(candidateId)}/render`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
    const payload = await parseBackendJson<BackendRenderResponse | { error?: { message?: string }; detail?: string }>(
      response,
    );

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "candidate_render_failed",
        getBackendErrorMessage(payload as never, "Failed to start candidate render"),
      );
    }

    const renderPayload = payload as BackendRenderResponse;
    return NextResponse.json({
      taskId: renderPayload.task_id,
      message: renderPayload.message,
      candidateId: renderPayload.candidate_id,
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "candidate_render_failed",
      error instanceof Error ? error.message : "Failed to reach candidate render backend",
    );
  }
}
