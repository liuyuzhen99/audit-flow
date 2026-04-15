import type { ModuleSummary, StatusTone } from "@/types/common";
import type {
  LibraryAssetCardViewModel,
  LibraryAssetDetailViewModel,
  LibraryDashboardResponseDto,
  LibraryAssetDto,
  SharedAuditSectionsViewModel,
  ReportRuleHitItemViewModel,
  ReportTimelineItemViewModel,
  ReportCommentItemViewModel,
} from "@/types/library";
import type { ReportDecisionStatus, RuleHitSeverity } from "@/types/audit-report";

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

function formatDateTimeLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSourceStatusLabel(status: LibraryAssetDto["metadata"]["sourceStatus"]): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
  }
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

function getGradientClassName(index: number): string {
  return gradientClasses[index % gradientClasses.length] ?? gradientClasses[0];
}

function adaptRuleHitItems(items: LibraryAssetDto["reportRuleHits"]): ReportRuleHitItemViewModel[] {
  return items.map((item) => ({
    id: item.id,
    title: item.ruleName,
    badgeLabel: formatSeverityLabel(item.severity),
    badgeTone: getSeverityTone(item.severity),
    description: item.description,
  }));
}

function adaptTimelineItems(items: LibraryAssetDto["reportTimeline"]): ReportTimelineItemViewModel[] {
  return items.map((item) => ({
    id: item.id,
    timestampLabel: formatDateTimeLabel(item.timestamp),
    title: item.title,
    description: item.description,
  }));
}

function adaptCommentItems(items: LibraryAssetDto["reportComments"]): ReportCommentItemViewModel[] {
  return items.map((item) => ({
    id: item.id,
    authorLabel: item.authorName,
    createdAtLabel: formatDateTimeLabel(item.createdAt),
    body: item.body,
  }));
}

function adaptSharedAuditSections(item: LibraryAssetDto): SharedAuditSectionsViewModel | null {
  if (!item.linkedReport) {
    return null;
  }

  return {
    ruleHits: {
      title: "Rule hits",
      emptyTitle: "No rule hits",
      emptyDescription: "This report has no triggered rules.",
      items: adaptRuleHitItems(item.reportRuleHits),
    },
    timeline: {
      title: "Audit timeline",
      emptyTitle: "No audit events",
      emptyDescription: "Audit timeline events will appear here when available.",
      items: adaptTimelineItems(item.reportTimeline),
    },
    comments: {
      title: "Reviewer comments",
      emptyTitle: "No reviewer comments",
      emptyDescription: "No reviewer comments were recorded for this report.",
      items: adaptCommentItems(item.reportComments),
    },
  };
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
    gradientClassName: getGradientClassName(index),
  };
}

export function adaptLibraryAssetDetail(item: LibraryAssetDto, index = 0): LibraryAssetDetailViewModel {
  const statusPresentation = getLibraryStatusPresentation(item.status);
  const reportSummary = item.linkedReport
    ? {
        title: "Audit report ready",
        decisionLabel: formatDecisionLabel(item.linkedReport.summary.decisionStatus),
        decisionTone: getDecisionTone(item.linkedReport.summary.decisionStatus),
        summaryLabel: item.linkedReport.summary.ruleSummary,
        href: `/reports/${item.linkedReport.reportId}`,
        linkLabel: "Open full report",
      }
    : null;

  return {
    id: item.id,
    title: item.title,
    artistName: item.artistName,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    durationLabel: formatDuration(item.durationSeconds),
    resolutionLabel: item.resolution,
    createdAtLabel: formatDateLabel(item.createdAt),
    sourceStatusLabel: formatSourceStatusLabel(item.metadata.sourceStatus),
    gradientClassName: getGradientClassName(index),
    mediaPlayer: {
      title: "Audited media preview",
      description: "Primary review-ready export for internal playback.",
      sourceUrl: item.media.playbackUrl,
      posterUrl: item.media.posterUrl,
      mimeType: item.media.mimeType,
      fallbackTitle: "Media unavailable",
      fallbackDescription: "A playback source is not available for this asset yet.",
    },
    reportSummary,
    auditSections: adaptSharedAuditSections(item),
    versions: item.versions.map((version) => ({
      id: version.id,
      label: version.label,
      createdAtLabel: formatDateLabel(version.createdAt),
    })),
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
