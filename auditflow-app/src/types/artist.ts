import type { SummaryMetricDto, ResponseMetaDto } from "@/types/api";
import type { StatusTone } from "@/types/common";

export type ArtistAuditStatus = "autoApproved" | "manualReview" | "autoRejected" | "monitoring";

export type ArtistChannelLinkDto = {
  id: string;
  name: string;
  platform: "youtube";
};

export type ArtistAuditSnapshotDto = {
  status: ArtistAuditStatus;
  lastDecisionAt: string;
  flaggedReleaseCount: number;
};

export type ArtistDto = {
  id: string;
  name: string;
  avatarUrl: string | null;
  spotifyFollowers: number;
  recentReleaseCount: number;
  lastSyncedAt: string;
  channel: ArtistChannelLinkDto;
  auditSnapshot: ArtistAuditSnapshotDto;
};

export type ArtistListResponseDto = {
  items: ArtistDto[];
  meta: ResponseMetaDto;
};

export type ArtistsDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: ArtistDto[];
  meta: ResponseMetaDto;
};

export type ArtistTableRowViewModel = {
  id: string;
  name: string;
  followerLabel: string;
  channelLabel: string;
  releasesLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
  freshnessLabel: string;
};
