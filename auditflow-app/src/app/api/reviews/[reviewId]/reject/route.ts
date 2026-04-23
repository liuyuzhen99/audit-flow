import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

type BackendReviewDecisionResponse = {
  review_id: string;
  status: "pending" | "approved" | "rejected";
  version: number;
  subject_id: string;
  candidate_status: "discovered" | "pending_review" | "accepted" | "rejected";
  next_review_id: string | null;
  next_review_type: string | null;
  decided_at: string | null;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> },
) {
  const { reviewId } = await context.params;
  const body = (await request.json()) as {
    expectedVersion?: number;
    comment?: string;
  };

  if (!Number.isInteger(body.expectedVersion) || (body.expectedVersion ?? 0) <= 0) {
    return createErrorResponse(400, "missing_expected_version", "expectedVersion must be a positive integer");
  }

  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/reviews/${reviewId}/reject`);

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("X-Actor-Id") ? { "X-Actor-Id": request.headers.get("X-Actor-Id")! } : {}),
      },
      body: JSON.stringify({
        expected_version: body.expectedVersion,
        comment: body.comment,
      }),
    });
    const payload = await parseBackendJson<BackendReviewDecisionResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "review_reject_failed",
        getBackendErrorMessage(payload as never, "Failed to reject review"),
      );
    }

    return NextResponse.json({
      reviewId: (payload as BackendReviewDecisionResponse).review_id,
      status: (payload as BackendReviewDecisionResponse).status,
      version: (payload as BackendReviewDecisionResponse).version,
      subjectId: (payload as BackendReviewDecisionResponse).subject_id,
      candidateStatus: (payload as BackendReviewDecisionResponse).candidate_status,
      nextReviewId: (payload as BackendReviewDecisionResponse).next_review_id,
      nextReviewType: (payload as BackendReviewDecisionResponse).next_review_type,
      decidedAt: normalizeBackendTimestamp((payload as BackendReviewDecisionResponse).decided_at),
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "review_reject_failed",
      error instanceof Error ? error.message : "Failed to reach reject review backend",
    );
  }
}
