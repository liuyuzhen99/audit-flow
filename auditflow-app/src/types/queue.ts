import type { PaginationMetaDto, PollingMetaDto, ResponseMetaDto, SummaryMetricDto } from "@/types/api";
import type { StatusTone } from "@/types/common";

export type QueueStatus = "queued" | "downloading" | "auditing" | "autoApproved" | "manualReview" | "autoRejected";
export type AuditDecisionStatus = "pending" | "approved" | "manualReview" | "rejected";

export type QueueProgressDto = {
  percent: number;
  label: string;
};

export type AuditDecisionDto = {
  status: AuditDecisionStatus;
  confidenceScore: number | null;
  ruleSummary: string;
};

export type QueueItemDto = {
  id: string;
  title: string;
  artistName: string;
  coverArtUrl: string | null;
  status: QueueStatus;
  auditDecision: AuditDecisionDto;
  progress: QueueProgressDto;
  reportId: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type QueueListResponseDto = {
  items: QueueItemDto[];
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type QueueDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: QueueItemDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type ReviewType =
  | "transcript_review"
  | "taste_audit"
  | "manual_review"
  | "translation_review"
  | "final_asset_approval";

export type QueueReviewStatus = "pending" | "approved" | "rejected";

export type Phase4QueueItemDto = {
  reviewId: string;
  artistId: string;
  artistName: string;
  candidateId: string;
  candidateTitle: string;
  reviewType: ReviewType;
  status: QueueReviewStatus;
  version: number;
  queuedAt: string;
  publishedAt: string | null;
  sourceUrl: string;
};

export type Phase4QueueDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: Phase4QueueItemDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type ReviewDecisionRequestDto = {
  expectedVersion: number;
  comment?: string;
  actorId?: string;
};

export type ReviewDecisionResponseDto = {
  reviewId: string;
  status: QueueReviewStatus;
  version: number;
  subjectId: string;
  candidateStatus: "discovered" | "pending_review" | "accepted" | "rejected";
  nextReviewId: string | null;
  nextReviewType: ReviewType | null;
  decidedAt: string | null;
};

export type AuditLogEntryDto = {
  logId: string;
  aggregateType: string;
  aggregateId: string;
  action: string;
  actorId: string;
  details: string | null;
  createdAt: string;
};

export type AuditLogResponseDto = {
  items: AuditLogEntryDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
};

export type QueueTableRowViewModel = {
  reviewId: string;
  artistId: string;
  artistName: string;
  candidateId: string;
  candidateTitle: string;
  reviewType: ReviewType;
  reviewTypeLabel: string;
  status: QueueReviewStatus;
  statusLabel: string;
  statusTone: StatusTone;
  version: number;
  versionLabel: string;
  queuedAtLabel: string;
  sourceUrl: string;
};

