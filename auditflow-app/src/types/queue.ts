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

export type QueueTableRowViewModel = {
  id: string;
  title: string;
  artistName: string;
  statusLabel: string;
  statusTone: StatusTone;
  confidenceLabel: string;
  summaryLabel: string;
  progressLabel: string;
  progressPercent: number;
  reportId: string | null;
  updatedLabel: string;
};
