import type { StatusConfig } from "@/lib/status";
import type { ArtistAuditStatus } from "@/types/artist";
import type { LibraryStatus } from "@/types/library";
import type { AuditDecisionStatus, QueueStatus } from "@/types/queue";

const artistAuditPresentationMap: Record<ArtistAuditStatus, StatusConfig> = {
  autoApproved: { label: "Auto-approved", tone: "success" },
  manualReview: { label: "Manual review", tone: "warning" },
  autoRejected: { label: "Auto-rejected", tone: "danger" },
  monitoring: { label: "Monitoring", tone: "info" },
};

const queueStatusPresentationMap: Record<QueueStatus, StatusConfig> = {
  queued: { label: "Queued", tone: "warning" },
  downloading: { label: "Downloading", tone: "info" },
  auditing: { label: "Auditing", tone: "info" },
  autoApproved: { label: "Auto-approved", tone: "success" },
  manualReview: { label: "Manual review", tone: "warning" },
  autoRejected: { label: "Auto-rejected", tone: "danger" },
};

const auditDecisionPresentationMap: Record<AuditDecisionStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "info" },
  approved: { label: "Auto-approved", tone: "success" },
  manualReview: { label: "Manual review", tone: "warning" },
  rejected: { label: "Auto-rejected", tone: "danger" },
};

const libraryStatusPresentationMap: Record<LibraryStatus, StatusConfig> = {
  published: { label: "Published", tone: "success" },
  processing: { label: "Processing", tone: "info" },
  review: { label: "Needs review", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
};

export function getArtistAuditPresentation(status: ArtistAuditStatus): StatusConfig {
  return artistAuditPresentationMap[status];
}

export function getQueueStatusPresentation(status: QueueStatus): StatusConfig {
  return queueStatusPresentationMap[status];
}

export function getAuditDecisionPresentation(status: AuditDecisionStatus): StatusConfig {
  return auditDecisionPresentationMap[status];
}

export function getLibraryStatusPresentation(status: LibraryStatus): StatusConfig {
  return libraryStatusPresentationMap[status];
}
