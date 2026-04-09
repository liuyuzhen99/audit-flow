import type { ModuleSummary } from "@/types/common";
import type { ArtistsDashboardResponseDto, ArtistTableRowViewModel } from "@/types/artist";

import { getArtistAuditPresentation } from "@/lib/status/audit";

function formatFollowerCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

function formatReleaseCount(value: number): string {
  return value === 1 ? "1 new track" : `${value} new tracks`;
}

function formatFreshnessLabel(timestamp: string): string {
  const syncedAt = new Date(timestamp);
  const minutesAgo = Math.max(Math.round((Date.now() - syncedAt.getTime()) / 60_000), 1);

  if (minutesAgo < 60) {
    return `Updated ${minutesAgo}m ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);
  return `Updated ${hoursAgo}h ago`;
}

function adaptArtistRow(item: ArtistsDashboardResponseDto["items"][number]): ArtistTableRowViewModel {
  const statusPresentation = getArtistAuditPresentation(item.auditSnapshot.status);

  return {
    id: item.id,
    name: item.name,
    followerLabel: formatFollowerCount(item.spotifyFollowers),
    channelLabel: item.channel.name,
    releasesLabel: formatReleaseCount(item.recentReleaseCount),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    freshnessLabel: formatFreshnessLabel(item.lastSyncedAt),
  };
}

export function adaptArtistsDashboard(data: ArtistsDashboardResponseDto): {
  summary: ModuleSummary[];
  rows: ArtistTableRowViewModel[];
} {
  return {
    summary: data.summary,
    rows: data.items.map(adaptArtistRow),
  };
}
