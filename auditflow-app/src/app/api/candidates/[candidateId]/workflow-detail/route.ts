import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

type BackendCandidateWorkflowDetail = {
  candidate_id: string;
  artist_id: string;
  artist_name: string;
  candidate_title: string;
  source_url: string;
  workflow_status: string;
  current_stage: string;
  reviews: Array<{
    review_id: string;
    review_type: string;
    status: string;
    version: number;
    decision_comment: string | null;
    decided_by: string | null;
    decided_at: string | null;
    created_at: string;
    updated_at: string;
  }>;
  transcript: {
    video_id: string;
    segment_count: number;
    segments: Array<{
      line_index: number;
      start_time: number;
      end_time: number;
      text: string;
      status: string;
    }>;
  };
  taste_audit: {
    decision?: string | null;
    score?: number | null;
    key_lyrics?: string[];
    comment?: string | null;
    recorded_at?: string;
    recorded_by?: string;
    raw_details?: string | null;
  } | null;
  translation: {
    line_count: number;
    lines: Array<{
      line_index: number;
      start_time: number;
      end_time: number;
      source_text: string;
      translated_text: string | null;
      status: string;
    }>;
  };
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ candidateId: string }> },
) {
  const { candidateId } = await context.params;

  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/v1/candidates/${encodeURIComponent(candidateId)}/workflow-detail`,
      { cache: "no-store" },
    );
    const payload = await parseBackendJson<BackendCandidateWorkflowDetail | { error?: { message?: string }; detail?: string }>(
      response,
    );

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "candidate_workflow_detail_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load candidate workflow detail"),
      );
    }

    const detail = payload as BackendCandidateWorkflowDetail;
    return NextResponse.json({
      candidateId: detail.candidate_id,
      artistId: detail.artist_id,
      artistName: detail.artist_name,
      candidateTitle: detail.candidate_title,
      sourceUrl: detail.source_url,
      workflowStatus: detail.workflow_status,
      currentStage: detail.current_stage,
      reviews: detail.reviews.map((review) => ({
        reviewId: review.review_id,
        reviewType: review.review_type,
        status: review.status,
        version: review.version,
        decisionComment: review.decision_comment,
        decidedBy: review.decided_by,
        decidedAt: normalizeBackendTimestamp(review.decided_at),
        createdAt: normalizeBackendTimestamp(review.created_at),
        updatedAt: normalizeBackendTimestamp(review.updated_at),
      })),
      transcript: {
        videoId: detail.transcript.video_id,
        segmentCount: detail.transcript.segment_count,
        segments: detail.transcript.segments.map((segment) => ({
          lineIndex: segment.line_index,
          startTime: segment.start_time,
          endTime: segment.end_time,
          text: segment.text,
          status: segment.status,
        })),
      },
      tasteAudit: detail.taste_audit
        ? {
            decision: detail.taste_audit.decision ?? null,
            score: detail.taste_audit.score ?? null,
            keyLyrics: detail.taste_audit.key_lyrics ?? [],
            comment: detail.taste_audit.comment ?? null,
            recordedAt: normalizeBackendTimestamp(detail.taste_audit.recorded_at),
            recordedBy: detail.taste_audit.recorded_by,
            rawDetails: detail.taste_audit.raw_details ?? null,
          }
        : null,
      translation: {
        lineCount: detail.translation.line_count,
        lines: detail.translation.lines.map((line) => ({
          lineIndex: line.line_index,
          startTime: line.start_time,
          endTime: line.end_time,
          sourceText: line.source_text,
          translatedText: line.translated_text,
          status: line.status,
        })),
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "candidate_workflow_detail_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach candidate workflow backend",
    );
  }
}
