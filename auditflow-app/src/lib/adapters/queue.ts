import type { PaginationMetaDto } from "@/types/api";
import type { ModuleSummary } from "@/types/common";
import type { QueueDashboardResponseDto, QueueTableRowViewModel } from "@/types/queue";

import { getQueueStatusPresentation } from "@/lib/status/audit";

function formatConfidenceLabel(value: number | null): string {
  return value === null ? "--%" : `${Math.round(value)}%`;
}

function formatUpdatedLabel(timestamp: string): string {
  const updatedAt = new Date(timestamp);
  return updatedAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function adaptQueueRow(item: QueueDashboardResponseDto["items"][number]): QueueTableRowViewModel {
  const statusPresentation = getQueueStatusPresentation(item.status);

  return {
    id: item.id,
    title: item.title,
    artistName: item.artistName,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    confidenceLabel: formatConfidenceLabel(item.auditDecision.confidenceScore),
    summaryLabel: item.auditDecision.ruleSummary,
    progressLabel: item.progress.label,
    progressPercent: item.progress.percent,
    updatedLabel: formatUpdatedLabel(item.updatedAt),
  };
}

export function adaptQueueDashboard(data: QueueDashboardResponseDto): {
  summary: ModuleSummary[];
  rows: QueueTableRowViewModel[];
  pagination: PaginationMetaDto;
  polling: QueueDashboardResponseDto["polling"];
} {
  return {
    summary: data.summary,
    rows: data.items.map(adaptQueueRow),
    pagination: data.pagination,
    polling: data.polling,
  };
}
