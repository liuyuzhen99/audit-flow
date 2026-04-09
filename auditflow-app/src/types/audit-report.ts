import type { ResponseMetaDto } from "@/types/api";

export type AuditReportStatus = "completed" | "flagged" | "pending";

export type RuleHitDto = {
  id: string;
  ruleName: string;
  severity: "low" | "medium" | "high";
  description: string;
};

export type AuditTimelineEventDto = {
  id: string;
  timestamp: string;
  title: string;
  description: string;
};

export type AuditReportDto = {
  id: string;
  queueItemId: string;
  title: string;
  status: AuditReportStatus;
  createdAt: string;
  ruleHits: RuleHitDto[];
  timeline: AuditTimelineEventDto[];
};

export type ReportDetailResponseDto = {
  report: AuditReportDto;
  meta: ResponseMetaDto;
};
