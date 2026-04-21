import type { StatusConfig } from "@/lib/status";
import type { ArtistSyncStatus } from "@/types/artist";
import type { LibraryStatus } from "@/types/library";
import type { AuditDecisionStatus, QueueStatus } from "@/types/queue";

const artistSyncPresentationMap: Record<ArtistSyncStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "neutral" },
  processing: { label: "Processing", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  partial: { label: "Partial", tone: "warning" },
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

export function getArtistAuditPresentation(status: ArtistSyncStatus): StatusConfig {
  return artistSyncPresentationMap[status];
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
