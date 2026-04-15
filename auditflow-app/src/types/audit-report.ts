import type { ResponseMetaDto } from "@/types/api";

export type AuditReportStatus = "completed" | "flagged" | "pending";
export type ReportDecisionStatus = "approved" | "manualReview" | "rejected" | "pending";

export type RuleHitSeverity = "low" | "medium" | "high";

export type RuleHitDto = {
  id: string;
  ruleName: string;
  severity: RuleHitSeverity;
  description: string;
};

export type AuditTimelineEventDto = {
  id: string;
  timestamp: string;
  title: string;
  description: string;
};

export type ReportCommentDto = {
  id: string;
  authorName: string;
  createdAt: string;
  body: string;
};

export type AuditReportSummaryDto = {
  decisionStatus: ReportDecisionStatus;
  confidenceScore: number | null;
  ruleSummary: string;
  durationSeconds: number;
  transcriptLanguage: string;
  completedAt: string | null;
};

export type ReportLinkedAssetDto = {
  assetId: string;
  title: string;
  artistName: string;
  status: "published" | "processing" | "review" | "failed";
};

export type ReportMediaDto = {
  playbackUrl: string | null;
  posterUrl: string | null;
  mimeType: string | null;
};

export type AuditReportDto = {
  id: string;
  queueItemId: string;
  title: string;
  status: AuditReportStatus;
  createdAt: string;
  summary: AuditReportSummaryDto;
  linkedAsset: ReportLinkedAssetDto | null;
  media: ReportMediaDto;
  ruleHits: RuleHitDto[];
  timeline: AuditTimelineEventDto[];
  comments: ReportCommentDto[];
};

export type ReportDetailResponseDto = {
  report: AuditReportDto;
  meta: ResponseMetaDto;
};
