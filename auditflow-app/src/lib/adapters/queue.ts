import type { PaginationMetaDto } from "@/types/api";
import type { ModuleSummary } from "@/types/common";
import type { Phase4QueueDashboardResponseDto, QueueTableRowViewModel, ReviewType } from "@/types/queue";

import { getQueueStatusPresentation, getReviewTypePresentation } from "@/lib/status/audit";

function formatQueuedLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatReviewTypeLabel(reviewType: ReviewType): string {
  return getReviewTypePresentation(reviewType).label;
}

function adaptQueueRow(item: Phase4QueueDashboardResponseDto["items"][number]): QueueTableRowViewModel {
  const statusPresentation = getQueueStatusPresentation(item.status);

  return {
    reviewId: item.reviewId,
    artistId: item.artistId,
    artistName: item.artistName,
    candidateId: item.candidateId,
    candidateTitle: item.candidateTitle,
    reviewType: item.reviewType,
    reviewTypeLabel: formatReviewTypeLabel(item.reviewType),
    status: item.status,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    version: item.version,
    versionLabel: `v${item.version}`,
    queuedAtLabel: formatQueuedLabel(item.queuedAt),
    sourceUrl: item.sourceUrl,
  };
}

export function adaptQueueDashboard(data: Phase4QueueDashboardResponseDto): {
  summary: ModuleSummary[];
  rows: QueueTableRowViewModel[];
  pagination: PaginationMetaDto;
  polling: Phase4QueueDashboardResponseDto["polling"];
} {
  return {
    summary: data.summary,
    rows: data.items.map(adaptQueueRow),
    pagination: data.pagination,
    polling: data.polling,
  };
}
