import type { AuditReportDto, ReportDecisionStatus, RuleHitSeverity } from "@/types/audit-report";
import type {
  ReportCommentsSectionViewModel,
  ReportRuleHitsSectionViewModel,
  ReportTimelineSectionViewModel,
} from "@/types/library";
import type { StatusTone } from "@/types/common";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDateLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateTimeLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDecisionLabel(status: ReportDecisionStatus): string {
  switch (status) {
    case "approved":
      return "Auto-approved";
    case "manualReview":
      return "Manual review";
    case "rejected":
      return "Auto-rejected";
    case "pending":
      return "Pending";
  }
}

function getDecisionTone(status: ReportDecisionStatus): StatusTone {
  switch (status) {
    case "approved":
      return "success";
    case "manualReview":
      return "warning";
    case "rejected":
      return "danger";
    case "pending":
      return "info";
  }
}

function formatReportStatusLabel(status: AuditReportDto["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "flagged":
      return "Flagged";
    case "pending":
      return "Pending";
  }
}

function getReportStatusTone(status: AuditReportDto["status"]): StatusTone {
  switch (status) {
    case "completed":
      return "success";
    case "flagged":
      return "warning";
    case "pending":
      return "info";
  }
}

function formatSeverityLabel(severity: RuleHitSeverity): string {
  switch (severity) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}

function getSeverityTone(severity: RuleHitSeverity): Exclude<StatusTone, "neutral"> {
  switch (severity) {
    case "low":
      return "info";
    case "medium":
      return "warning";
    case "high":
      return "danger";
  }
}

function adaptRuleHitsSection(report: AuditReportDto): ReportRuleHitsSectionViewModel {
  return {
    title: "Rule hits",
    emptyTitle: "No rule hits",
    emptyDescription: "This report has no triggered rules.",
    items: report.ruleHits.map((item) => ({
      id: item.id,
      title: item.ruleName,
      badgeLabel: formatSeverityLabel(item.severity),
      badgeTone: getSeverityTone(item.severity),
      description: item.description,
    })),
  };
}

function adaptTimelineSection(report: AuditReportDto): ReportTimelineSectionViewModel {
  return {
    title: "Audit timeline",
    emptyTitle: "No audit events",
    emptyDescription: "Audit timeline events will appear here when available.",
    items: report.timeline.map((item) => ({
      id: item.id,
      timestampLabel: formatDateTimeLabel(item.timestamp),
      title: item.title,
      description: item.description,
    })),
  };
}

function adaptCommentsSection(report: AuditReportDto): ReportCommentsSectionViewModel {
  return {
    title: "Reviewer comments",
    emptyTitle: "No reviewer comments",
    emptyDescription: "No reviewer comments were recorded for this report.",
    items: report.comments.map((item) => ({
      id: item.id,
      authorLabel: item.authorName,
      createdAtLabel: formatDateTimeLabel(item.createdAt),
      body: item.body,
    })),
  };
}

export function adaptReportDetail(report: AuditReportDto) {
  return {
    header: {
      title: report.title,
      subtitle: report.linkedAsset
        ? `${report.linkedAsset.artistName} · Queue task ${report.queueItemId}`
        : `Queue task ${report.queueItemId}`,
      statusLabel: formatReportStatusLabel(report.status),
      statusTone: getReportStatusTone(report.status),
      createdAtLabel: formatDateLabel(report.createdAt),
      completedAtLabel: report.summary.completedAt ? formatDateTimeLabel(report.summary.completedAt) : "In progress",
      confidenceLabel:
        report.summary.confidenceScore === null ? "Confidence pending" : `${Math.round(report.summary.confidenceScore)}% confidence`,
      ruleSummary: report.summary.ruleSummary,
      transcriptLanguageLabel: report.summary.transcriptLanguage,
      durationLabel: formatDuration(report.summary.durationSeconds),
    },
    relatedAsset: report.linkedAsset
      ? {
          href: `/library/${report.linkedAsset.assetId}`,
          label: "Open linked asset",
          title: report.linkedAsset.title,
          description: `${formatDecisionLabel(report.summary.decisionStatus)} · ${report.linkedAsset.status}`,
        }
      : null,
    decision: {
      label: formatDecisionLabel(report.summary.decisionStatus),
      tone: getDecisionTone(report.summary.decisionStatus),
    },
    ruleHits: adaptRuleHitsSection(report),
    timeline: adaptTimelineSection(report),
    comments: adaptCommentsSection(report),
  };
}
