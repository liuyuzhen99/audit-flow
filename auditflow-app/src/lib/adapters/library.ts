import type { ModuleSummary } from "@/types/common";
import type {
  ArtifactAvailabilityStatus,
  LibraryAssetCardViewModel,
  LibraryAssetDetailDto,
  LibraryAssetDetailViewModel,
  Phase4LibraryDashboardResponseDto,
} from "@/types/library";

import { getLibraryStatusPresentation } from "@/lib/status/audit";

function formatApprovedAtLabel(timestamp: string | null): string {
  if (!timestamp) {
    return "Pending timestamp";
  }

  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function adaptCard(item: Phase4LibraryDashboardResponseDto["items"][number]): LibraryAssetCardViewModel {
  const statusPresentation = getLibraryStatusPresentation(item.status);

  return {
    id: item.id,
    title: item.title,
    artistName: item.artistName,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    approvedAtLabel: formatApprovedAtLabel(item.approvedAt),
    approvedByLabel: item.approvedBy ?? "System",
    sourceUrl: item.sourceUrl,
    artifactStatusLabel: formatArtifactStatusLabel(item.artifactStatus),
  };
}

function formatArtifactStatusLabel(status: ArtifactAvailabilityStatus): string {
  const labels: Record<ArtifactAvailabilityStatus, string> = {
    ready: "Ready",
    missing: "Missing",
    expired: "Expired",
    deleted: "Deleted",
    delete_failed: "Delete failed",
  };
  return labels[status];
}

export function adaptLibraryDashboard(data: Phase4LibraryDashboardResponseDto): {
  summary: ModuleSummary[];
  cards: LibraryAssetCardViewModel[];
} {
  return {
    summary: data.summary,
    cards: data.items.map(adaptCard),
  };
}

export function adaptLibraryAssetDetail(data: LibraryAssetDetailDto): LibraryAssetDetailViewModel {
  return {
    id: data.id,
    title: data.title,
    artistName: data.artistName,
    sourceUrl: data.sourceUrl,
    approvedAtLabel: formatApprovedAtLabel(data.approvedAt),
    approvedByLabel: data.approvedBy ?? "System",
    artifactStatus: data.artifactStatus,
    artifactStatusLabel: formatArtifactStatusLabel(data.artifactStatus),
    primaryArtifactLabel: data.primaryArtifact
      ? `${data.primaryArtifact.artifactType} v${data.primaryArtifact.version}`
      : "No final artifact",
    previewUrl: data.previewUrl,
    fallbackDownloadUrl: data.fallbackDownloadUrl,
    artifacts: data.artifacts,
  };
}
