import type { ResponseMetaDto, SummaryMetricDto } from "@/types/api";
import type { StatusTone } from "@/types/common";
import type {
  AuditReportSummaryDto,
  ReportCommentDto,
  ReportLinkedAssetDto,
  ReportMediaDto,
  RuleHitDto,
  AuditTimelineEventDto,
} from "@/types/audit-report";

export type LibraryStatus = "published" | "processing" | "review" | "failed" | "accepted";

export type AssetVersionDto = {
  id: string;
  label: string;
  createdAt: string;
};

export type AssetMetadataDto = {
  sourceStatus: "queued" | "running" | "completed" | "failed";
};

export type LibraryLinkedReportDto = {
  reportId: string;
  title: string;
  summary: AuditReportSummaryDto;
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
  media: ReportMediaDto;
  linkedReport: LibraryLinkedReportDto | null;
  linkedReportAsset: ReportLinkedAssetDto | null;
  reportRuleHits: RuleHitDto[];
  reportTimeline: AuditTimelineEventDto[];
  reportComments: ReportCommentDto[];
  versions: AssetVersionDto[];
};

export type LibraryDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: LibraryAssetDto[];
  meta: ResponseMetaDto;
};

export type Phase4LibraryAssetDto = {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  sourceUrl: string;
  approvedAt: string | null;
  approvedBy: string | null;
  status: "accepted";
  artifactStatus: ArtifactAvailabilityStatus;
  artifacts: ArtifactSummaryDto[];
};

export type ArtifactAvailabilityStatus = "ready" | "missing" | "expired" | "deleted" | "delete_failed";

export type ArtifactSummaryDto = {
  artifactId: string;
  artifactType: string;
  objectUri: string;
  contentType: string | null;
  sizeBytes: number;
  checksumSha256: string;
  lifecycleStatus: string;
  version: number;
  createdAt: string;
  expiresAt: string | null;
};

export type LibraryAssetDetailDto = Phase4LibraryAssetDto & {
  primaryArtifact: ArtifactSummaryDto | null;
  previewUrl: string | null;
  previewUrlExpiresInSeconds: number | null;
  fallbackDownloadUrl: string | null;
};

export type Phase4LibraryDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: Phase4LibraryAssetDto[];
  meta: ResponseMetaDto;
};

export type LibraryAssetCardViewModel = {
  id: string;
  title: string;
  artistName: string;
  statusLabel: string;
  statusTone: StatusTone;
  approvedAtLabel: string;
  approvedByLabel: string;
  sourceUrl: string;
  artifactStatusLabel: string;
};

export type LibraryAssetDetailViewModel = {
  id: string;
  title: string;
  artistName: string;
  sourceUrl: string;
  approvedAtLabel: string;
  approvedByLabel: string;
  artifactStatus: ArtifactAvailabilityStatus;
  artifactStatusLabel: string;
  primaryArtifactLabel: string;
  previewUrl: string | null;
  fallbackDownloadUrl: string | null;
  artifacts: ArtifactSummaryDto[];
};

export type ReportSectionItemTone = Exclude<StatusTone, "neutral">;

export type ReportRuleHitItemViewModel = {
  id: string;
  title: string;
  badgeLabel: string;
  badgeTone: ReportSectionItemTone;
  description: string;
};

export type ReportTimelineItemViewModel = {
  id: string;
  timestampLabel: string;
  title: string;
  description: string;
};

export type ReportCommentItemViewModel = {
  id: string;
  authorLabel: string;
  createdAtLabel: string;
  body: string;
};

export type ReportRuleHitsSectionViewModel = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ReportRuleHitItemViewModel[];
};

export type ReportTimelineSectionViewModel = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ReportTimelineItemViewModel[];
};

export type ReportCommentsSectionViewModel = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ReportCommentItemViewModel[];
};
