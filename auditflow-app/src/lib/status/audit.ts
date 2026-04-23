import type { StatusConfig } from "@/lib/status";
import type { ArtistSyncStatus } from "@/types/artist";
import type { LibraryStatus } from "@/types/library";
import type { AuditDecisionStatus, QueueReviewStatus, QueueStatus, ReviewType } from "@/types/queue";

const artistSyncPresentationMap: Record<ArtistSyncStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "neutral" },
  processing: { label: "Processing", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  partial: { label: "Partial", tone: "warning" },
};

const legacyQueueStatusPresentationMap: Record<QueueStatus, StatusConfig> = {
  queued: { label: "Queued", tone: "warning" },
  downloading: { label: "Downloading", tone: "info" },
  auditing: { label: "Auditing", tone: "info" },
  autoApproved: { label: "Auto-approved", tone: "success" },
  manualReview: { label: "Manual review", tone: "warning" },
  autoRejected: { label: "Auto-rejected", tone: "danger" },
};

const queueStatusPresentationMap: Record<QueueReviewStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const auditDecisionPresentationMap: Record<AuditDecisionStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "info" },
  approved: { label: "Auto-approved", tone: "success" },
  manualReview: { label: "Manual review", tone: "warning" },
  rejected: { label: "Auto-rejected", tone: "danger" },
};

const reviewTypePresentationMap: Record<ReviewType, StatusConfig> = {
  transcript_review: { label: "Transcript Review", tone: "info" },
  taste_audit: { label: "Taste Audit", tone: "info" },
  manual_review: { label: "Manual Review", tone: "warning" },
  translation_review: { label: "Translation Review", tone: "info" },
  final_asset_approval: { label: "Final Asset Approval", tone: "success" },
};

const libraryStatusPresentationMap: Record<LibraryStatus, StatusConfig> = {
  published: { label: "Published", tone: "success" },
  processing: { label: "Processing", tone: "info" },
  review: { label: "Needs review", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  accepted: { label: "Accepted", tone: "success" },
};

export function getArtistAuditPresentation(status: ArtistSyncStatus): StatusConfig {
  return artistSyncPresentationMap[status];
}

export function getLegacyQueueStatusPresentation(status: QueueStatus): StatusConfig {
  return legacyQueueStatusPresentationMap[status];
}

export function getQueueStatusPresentation(status: QueueReviewStatus): StatusConfig {
  return queueStatusPresentationMap[status];
}

export function getAuditDecisionPresentation(status: AuditDecisionStatus): StatusConfig {
  return auditDecisionPresentationMap[status];
}

export function getReviewTypePresentation(type: ReviewType): StatusConfig {
  return reviewTypePresentationMap[type];
}

export function getLibraryStatusPresentation(status: LibraryStatus): StatusConfig {
  return libraryStatusPresentationMap[status];
}
