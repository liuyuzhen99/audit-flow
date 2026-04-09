import type { ModuleSummary } from "@/types/common";
import type { LibraryAssetCardViewModel, LibraryDashboardResponseDto } from "@/types/library";

import { getLibraryStatusPresentation } from "@/lib/status/audit";

const gradientClasses = [
  "from-sky-950 via-indigo-700 to-fuchsia-500",
  "from-slate-950 via-fuchsia-900 to-orange-300",
  "from-violet-950 via-purple-700 to-fuchsia-400",
  "from-amber-950 via-orange-900 to-black",
] as const;

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDateLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function adaptCard(item: LibraryDashboardResponseDto["items"][number], index: number): LibraryAssetCardViewModel {
  const statusPresentation = getLibraryStatusPresentation(item.status);

  return {
    id: item.id,
    title: item.title,
    artistName: item.artistName,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    durationLabel: formatDuration(item.durationSeconds),
    resolutionLabel: item.resolution,
    dateLabel: formatDateLabel(item.createdAt),
    gradientClassName: gradientClasses[index % gradientClasses.length] ?? gradientClasses[0],
  };
}

export function adaptLibraryDashboard(data: LibraryDashboardResponseDto): {
  summary: ModuleSummary[];
  cards: LibraryAssetCardViewModel[];
} {
  return {
    summary: data.summary,
    cards: data.items.map(adaptCard),
  };
}
