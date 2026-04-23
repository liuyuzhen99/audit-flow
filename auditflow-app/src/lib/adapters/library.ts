import type { ModuleSummary } from "@/types/common";
import type { LibraryAssetCardViewModel, Phase4LibraryDashboardResponseDto } from "@/types/library";

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
  };
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
