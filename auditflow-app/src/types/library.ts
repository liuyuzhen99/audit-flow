import type { ResponseMetaDto, SummaryMetricDto } from "@/types/api";
import type { StatusTone } from "@/types/common";

export type LibraryStatus = "published" | "processing" | "review" | "failed";

export type AssetVersionDto = {
  id: string;
  label: string;
  createdAt: string;
};

export type AssetMetadataDto = {
  sourceStatus: "queued" | "running" | "completed" | "failed";
};

export type LibraryAssetDto = {
  id: string;
  title: string;
  artistName: string;
  thumbnailUrl: string | null;
  status: LibraryStatus;
  resolution: string;
  durationSeconds: number;
  createdAt: string;
  metadata: AssetMetadataDto;
  versions: AssetVersionDto[];
};

export type LibraryListResponseDto = {
  items: LibraryAssetDto[];
  meta: ResponseMetaDto;
};

export type LibraryDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: LibraryAssetDto[];
  meta: ResponseMetaDto;
};

export type LibraryAssetCardViewModel = {
  id: string;
  title: string;
  artistName: string;
  statusLabel: string;
  statusTone: StatusTone;
  durationLabel: string;
  resolutionLabel: string;
  dateLabel: string;
  gradientClassName: string;
};
