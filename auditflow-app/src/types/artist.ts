import type { ListQueryDto, PaginationMetaDto, ResponseMetaDto, SummaryMetricDto } from "@/types/api";
import type { StatusTone } from "@/types/common";

export type ArtistSyncStatus = "pending" | "processing" | "completed" | "failed" | "partial";

export type ArtistSourceHealthDto = {
  status: ArtistSyncStatus;
  retryCount: number;
  failureReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
  discoveredCount: number;
};

export type ArtistLatestCandidateDto = {
  candidateId: string;
  videoId: string;
  title: string;
  status: string;
  ingestionStatus: ArtistSyncStatus;
  channelId: string | null;
  sourceUrl: string;
  sourceKind: string;
  publishedAt: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  discoveryRunId: string | null;
  failureReason: string | null;
};

export type ArtistLatestRunDto = {
  runId: string;
  status: ArtistSyncStatus;
  sourceKind: string;
  discoveredCount: number;
  failureReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type ArtistRetryMetadataDto = {
  canResync: boolean;
  latestRetryCount: number;
  latestFailureReason: string | null;
};

export type ArtistDto = {
  id: string;
  name: string;
  status: string;
  youtubeChannelId: string | null;
  youtubeChannelLabel: string;
  syncStatus: ArtistSyncStatus;
  lastSyncStartedAt: string | null;
  lastSyncCompletedAt: string | null;
  lastSyncError: string | null;
  candidateCount: number;
  partialFailure: boolean;
  emptyState: boolean;
  retryMetadata: ArtistRetryMetadataDto;
  sourceHealth: Record<string, ArtistSourceHealthDto>;
  latestCandidate: ArtistLatestCandidateDto | null;
  latestRun: ArtistLatestRunDto | null;
};

export type ArtistsDashboardResponseDto = {
  summary?: SummaryMetricDto[];
  items: ArtistDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
};

export type ArtistListResponseDto = {
  items: ArtistDto[];
  meta: ResponseMetaDto;
};

export type ArtistTableRowViewModel = {
  id: string;
  name: string;
  channelLabel: string;
  candidateLabel: string;
  syncStatusLabel: string;
  syncStatusTone: StatusTone;
  freshnessLabel: string;
  errorLabel: string | null;
  canResync: boolean;
};

export type ArtistCandidatesResponseDto = {
  artistId: string;
  items: ArtistLatestCandidateDto[];
  pagination: PaginationMetaDto;
};

export type ArtistResyncResponseDto = {
  runId: string;
  artistId: string;
  status: ArtistSyncStatus;
  discoveredCount: number;
  startedAt: string;
  completedAt: string;
  channelRunId: string;
  discoveryRunId: string;
};

export type ArtistsListQueryDto = ListQueryDto & {
  dateRange?: "2w";
};
