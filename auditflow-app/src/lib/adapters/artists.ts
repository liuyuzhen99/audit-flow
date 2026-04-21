import type { PaginationMetaDto } from "@/types/api";
import type { ModuleSummary } from "@/types/common";
import type { ArtistsDashboardResponseDto, ArtistTableRowViewModel } from "@/types/artist";

import { getArtistAuditPresentation } from "@/lib/status/audit";

function formatCandidateCount(value: number): string {
  return value === 1 ? "1 candidate" : `${value} candidates`;
}

function formatFreshnessLabel(timestamp: string | null): string {
  if (!timestamp) {
    return "Not synced yet";
  }

  const syncedAt = new Date(timestamp);
  const minutesAgo = Math.max(Math.round((Date.now() - syncedAt.getTime()) / 60_000), 1);

  if (minutesAgo < 60) {
    return `Synced ${minutesAgo}m ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `Synced ${hoursAgo}h ago`;
  }

  const daysAgo = Math.round(hoursAgo / 24);
  return `Synced ${daysAgo}d ago`;
}

function adaptArtistRow(item: ArtistsDashboardResponseDto["items"][number]): ArtistTableRowViewModel {
  const statusPresentation = getArtistAuditPresentation(item.syncStatus);

  return {
    id: item.id,
    name: item.name,
    channelLabel: item.youtubeChannelLabel || item.youtubeChannelId || "Unresolved",
    candidateLabel: formatCandidateCount(item.candidateCount),
    syncStatusLabel: statusPresentation.label,
    syncStatusTone: statusPresentation.tone,
    freshnessLabel: formatFreshnessLabel(item.lastSyncCompletedAt),
    errorLabel: item.lastSyncError ?? item.retryMetadata.latestFailureReason,
    canResync: item.retryMetadata.canResync,
  };
}

export function adaptArtistsDashboard(data: ArtistsDashboardResponseDto): {
  summary: ModuleSummary[];
  rows: ArtistTableRowViewModel[];
  pagination: PaginationMetaDto;
} {
  const completedCount = data.items.filter((item) => item.syncStatus === "completed").length;
  const failedCount = data.items.filter((item) => item.syncStatus === "failed" || item.syncStatus === "partial").length;
  const candidateTotal = data.items.reduce((sum, item) => sum + item.candidateCount, 0);

  return {
    summary: [
      {
        label: "Artists in View",
        value: String(data.items.length),
        hint: `${data.pagination.total} total artists`,
        tone: "info",
      },
      {
        label: "Completed",
        value: String(completedCount),
        hint: "Latest sync completed",
        tone: "success",
      },
      {
        label: "Failed",
        value: String(failedCount),
        hint: "Failed or partial syncs",
        tone: failedCount > 0 ? "warning" : "success",
      },
      {
        label: "Candidates",
        value: String(candidateTotal),
        hint: "Candidates on this page",
        tone: "info",
      },
    ],
    rows: data.items.map(adaptArtistRow),
    pagination: data.pagination,
  };
}
