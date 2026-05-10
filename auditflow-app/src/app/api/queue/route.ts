import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";
import { parseListQueryParams } from "@/types/api";

type BackendQueueItem = {
  review_id: string;
  artist_id: string;
  artist_name: string;
  candidate_id: string;
  candidate_title: string;
  review_type: string;
  status: string;
  version: number;
  decided_by?: string | null;
  decided_at?: string | null;
  decision_comment?: string | null;
  queued_at: string;
  published_at: string | null;
  source_url: string;
};

type BackendQueueResponse = {
  items: BackendQueueItem[];
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

function buildSummary(items: MappedQueueItem[]) {
  const pendingCount = items.filter((item) => item.status === "pending").length;
  const manualCount = items.filter((item) => item.reviewType === "manual_review").length;
  const finalApprovalCount = items.filter((item) => item.reviewType === "final_asset_approval").length;

  return [
    { id: "queue-pending", label: "Pending Reviews", value: String(pendingCount), hint: "Awaiting human action", tone: "warning" as const },
    { id: "queue-manual", label: "Manual Review", value: String(manualCount), hint: "Manual checkpoint items", tone: "info" as const },
    { id: "queue-final", label: "Final Approval", value: String(finalApprovalCount), hint: "Ready for curation decision", tone: "success" as const },
  ];
}

type MappedQueueItem = {
  reviewId: string;
  artistId: string;
  artistName: string;
  candidateId: string;
  candidateTitle: string;
  reviewType: string;
  status: string;
  statusLabel: string;
  version: number;
  decidedBy: string | null;
  decidedAt: unknown;
  decisionComment: string | null;
  queuedAt: unknown;
  publishedAt: unknown;
  sourceUrl: string;
};

function getLatestQueuedItem(items: MappedQueueItem[]) {
  return items.reduce<MappedQueueItem | null>((latest, item) => {
    if (latest === null) {
      return item;
    }

    return String(item.queuedAt).localeCompare(String(latest.queuedAt)) > 0 ? item : latest;
  }, null);
}

function selectQueueItems(items: MappedQueueItem[], requestedStatus?: string) {
  const grouped = new Map<string, MappedQueueItem[]>();

  for (const item of items) {
    const candidateItems = grouped.get(item.candidateId) ?? [];
    candidateItems.push(item);
    grouped.set(item.candidateId, candidateItems);
  }

  return Array.from(grouped.values()).flatMap((candidateItems) => {
    const pendingItem = candidateItems.find((item) => item.status === "pending");
    const latestApprovedItem = getLatestQueuedItem(candidateItems.filter((item) => item.status === "approved"));
    const latestRejectedItem = getLatestQueuedItem(candidateItems.filter((item) => item.status === "rejected"));
    const selectedItem =
      requestedStatus === "pending"
        ? pendingItem
        : requestedStatus === "approved"
          ? latestApprovedItem
          : requestedStatus === "rejected"
            ? latestRejectedItem
            : pendingItem;

    return selectedItem ? [selectedItem] : [];
  });
}

function sortItems(
  items: MappedQueueItem[],
  sortBy?: string,
  sortDirection?: "asc" | "desc",
  prioritizePending = false,
) {
  const direction = sortDirection === "asc" ? 1 : -1;
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (prioritizePending) {
      const leftPriority = left.status === "pending" ? 0 : 1;
      const rightPriority = right.status === "pending" ? 0 : 1;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return String(right.queuedAt).localeCompare(String(left.queuedAt));
    }

    const leftValue =
      sortBy === "artistName"
        ? left.artistName
        : sortBy === "reviewType"
          ? left.reviewType
          : sortBy === "version"
            ? left.version
            : sortBy === "queuedAt"
              ? left.queuedAt
              : left.candidateTitle;
    const rightValue =
      sortBy === "artistName"
        ? right.artistName
        : sortBy === "reviewType"
          ? right.reviewType
          : sortBy === "version"
            ? right.version
            : sortBy === "queuedAt"
              ? right.queuedAt
              : right.candidateTitle;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });

  return sorted;
}

function getQueueStatusLabel(item: {
  status: string;
  decidedBy: string | null;
}) {
  if (item.status === "pending") {
    return "Pending";
  }

  const actor = item.decidedBy?.toLowerCase() ?? "";
  const actorLabel = actor.startsWith("ai-") ? "AI" : "Manual";
  return `${actorLabel} ${item.status === "approved" ? "Approved" : "Rejected"}`;
}

export async function GET(request: NextRequest) {
  const query = parseListQueryParams(request.nextUrl.searchParams);
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/audit-queue`);
  const normalizedStatus = query.status?.toLowerCase();
  if (normalizedStatus) {
    backendUrl.searchParams.set("status", normalizedStatus);
  }

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = await parseBackendJson<BackendQueueResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "queue_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load audit queue"),
      );
    }

    const mappedItems = (payload as BackendQueueResponse).items.map((item) => ({
      reviewId: item.review_id,
      artistId: item.artist_id,
      artistName: item.artist_name,
      candidateId: item.candidate_id,
      candidateTitle: item.candidate_title,
      reviewType: item.review_type,
      status: item.status,
      statusLabel: getQueueStatusLabel({
        status: item.status,
        decidedBy: item.decided_by ?? null,
      }),
      version: item.version,
      decidedBy: item.decided_by ?? null,
      decidedAt: normalizeBackendTimestamp(item.decided_at ?? null),
      decisionComment: item.decision_comment ?? null,
      queuedAt: normalizeBackendTimestamp(item.queued_at),
      publishedAt: normalizeBackendTimestamp(item.published_at),
      sourceUrl: item.source_url,
    }));

    const selectedItems = selectQueueItems(mappedItems, normalizedStatus);
    const filteredItems = selectedItems.filter((item) => {
      const matchesQuery =
        !query.q ||
        item.candidateId.toLowerCase().includes(query.q.toLowerCase()) ||
        item.candidateTitle.toLowerCase().includes(query.q.toLowerCase()) ||
        item.artistName.toLowerCase().includes(query.q.toLowerCase());
      return matchesQuery;
    });
    const sortedItems = sortItems(filteredItems, query.sortBy, query.sortDirection, !normalizedStatus && !query.sortBy);
    const total = sortedItems.length;
    const pageSize = query.pageSize;
    const page = query.page;
    const start = (page - 1) * pageSize;
    const pageItems = sortedItems.slice(start, start + pageSize);

    return NextResponse.json({
      summary: buildSummary(sortedItems),
      items: pageItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
      meta: {
        generatedAt: normalizeBackendTimestamp((payload as BackendQueueResponse).meta.generated_at),
      },
      polling: {
        intervalMs: (((payload as BackendQueueResponse).meta.refresh_hint_seconds ?? 15) * 1000),
        tick: query.tick ?? 0,
        terminal: false,
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "queue_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach audit queue backend",
    );
  }
}
