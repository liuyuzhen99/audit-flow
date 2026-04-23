import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";
import { parseListQueryParams } from "@/types/api";

type BackendPipelineItem = {
  candidate_id: string;
  artist_id: string;
  artist_name: string;
  candidate_title: string;
  workflow_status: string;
  current_stage: string;
  stages: Array<{
    stage: string;
    status: string;
  }>;
  translation: {
    status: string;
    updated_at?: string;
  };
  last_updated_at: string;
};

type BackendPipelineResponse = {
  items: BackendPipelineItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  meta: {
    generated_at: string;
    refresh_hint_seconds?: number;
  };
};

function buildSummary(items: BackendPipelineItem[]) {
  const inReviewCount = items.length;
  const transcriptCount = items.filter((item) => item.current_stage === "transcript_review").length;
  const finalApprovalCount = items.filter((item) => item.current_stage === "final_asset_approval").length;

  return [
    { id: "pipeline-review", label: "In Review", value: String(inReviewCount), hint: "Active workflow items only", tone: "warning" as const },
    { id: "pipeline-transcript", label: "Transcript", value: String(transcriptCount), hint: "Currently at transcript review", tone: "info" as const },
    { id: "pipeline-final", label: "Final", value: String(finalApprovalCount), hint: "Awaiting final asset approval", tone: "success" as const },
  ];
}

function sortItems(items: BackendPipelineItem[], sortBy?: string, sortDirection?: "asc" | "desc") {
  const direction = sortDirection === "asc" ? 1 : -1;
  const sorted = [...items];

  sorted.sort((left, right) => {
    const leftValue =
      sortBy === "artistName"
        ? left.artist_name
        : sortBy === "workflowStatus"
          ? left.workflow_status
          : sortBy === "currentStage"
            ? left.current_stage
            : sortBy === "lastUpdatedAt"
              ? left.last_updated_at
              : left.candidate_title;
    const rightValue =
      sortBy === "artistName"
        ? right.artist_name
        : sortBy === "workflowStatus"
          ? right.workflow_status
          : sortBy === "currentStage"
            ? right.current_stage
            : sortBy === "lastUpdatedAt"
              ? right.last_updated_at
              : right.candidate_title;

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });

  return sorted;
}

export async function GET(request: NextRequest) {
  const query = parseListQueryParams(request.nextUrl.searchParams);
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/pipeline`);

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = await parseBackendJson<BackendPipelineResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "pipeline_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load pipeline"),
      );
    }

    const rawItems = (payload as BackendPipelineResponse).items;
    const inReviewItems = rawItems.filter((item) => item.workflow_status === "pending_review");
    const filteredItems = inReviewItems.filter((item) => {
      const matchesQuery =
        !query.q ||
        item.candidate_title.toLowerCase().includes(query.q.toLowerCase()) ||
        item.artist_name.toLowerCase().includes(query.q.toLowerCase()) ||
        item.candidate_id.toLowerCase().includes(query.q.toLowerCase());
      const matchesStage = !query.status || item.current_stage === query.status;
      return matchesQuery && matchesStage;
    });
    const sortedItems = sortItems(filteredItems, query.sortBy, query.sortDirection);
    const total = sortedItems.length;
    const start = (query.page - 1) * query.pageSize;
    const pageItems = sortedItems.slice(start, start + query.pageSize);

    return NextResponse.json({
      summary: buildSummary(sortedItems),
      items: pageItems.map((item) => ({
        candidateId: item.candidate_id,
        artistId: item.artist_id,
        artistName: item.artist_name,
        candidateTitle: item.candidate_title,
        workflowStatus: item.workflow_status,
        currentStage: item.current_stage,
        stages: item.stages.map((stage) => ({
          stage: stage.stage,
          status: stage.status,
        })),
        translation: {
          status: item.translation.status,
          ...(item.translation.updated_at ? { updatedAt: normalizeBackendTimestamp(item.translation.updated_at) } : {}),
        },
        lastUpdatedAt: normalizeBackendTimestamp(item.last_updated_at),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / query.pageSize), 1),
      },
      meta: {
        generatedAt: normalizeBackendTimestamp((payload as BackendPipelineResponse).meta.generated_at),
      },
      polling: {
        intervalMs: (((payload as BackendPipelineResponse).meta.refresh_hint_seconds ?? 15) * 1000),
        tick: query.tick ?? 0,
        terminal: false,
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "pipeline_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach pipeline backend",
    );
  }
}
