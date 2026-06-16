import type { StatusConfig } from "@/lib/status";
import type {
  DeliverableStatus,
  ReviewWorkflowStageStatus,
  AsyncPipelineExecutionStatus,
  PipelineRunStatus,
  PipelineStageStatus,
  PipelineWorkflowStatus,
  TranslationWorkflowStatus,
} from "@/types/pipeline";

const pipelineRunStatusPresentationMap: Record<PipelineRunStatus, StatusConfig> = {
  queued: { label: "Queued", tone: "warning" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const pipelineWorkflowStatusPresentationMap: Record<PipelineWorkflowStatus, StatusConfig> = {
  discovered: { label: "Discovered", tone: "neutral" },
  downloading: { label: "Downloading", tone: "info" },
  pending_review: { label: "In Review", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const pipelineStageStatusPresentationMap: Record<PipelineStageStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "neutral" },
  running: { label: "In progress", tone: "info" },
  completed: { label: "Done", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const reviewWorkflowStageStatusPresentationMap: Record<ReviewWorkflowStageStatus, StatusConfig> = {
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const asyncPipelineExecutionStatusPresentationMap: Record<AsyncPipelineExecutionStatus, StatusConfig> = {
  pending: { label: "Queued", tone: "neutral" },
  processing: { label: "Worker running", tone: "info" },
  completed: { label: "Stage done", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  retry_scheduled: { label: "Retry scheduled", tone: "warning" },
  dlq: { label: "DLQ", tone: "danger" },
};

const deliverableStatusPresentationMap: Record<DeliverableStatus, StatusConfig> = {
  ready: { label: "Ready", tone: "success" },
  processing: { label: "Processing", tone: "info" },
  blocked: { label: "Blocked", tone: "danger" },
};

const translationStatusPresentationMap: Record<TranslationWorkflowStatus, StatusConfig> = {
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
  submitted: { label: "Submitted", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export function getPipelineRunStatusPresentation(status: PipelineRunStatus): StatusConfig {
  return pipelineRunStatusPresentationMap[status];
}

export function getPipelineWorkflowStatusPresentation(status: PipelineWorkflowStatus): StatusConfig {
  return pipelineWorkflowStatusPresentationMap[status];
}

export function getPipelineStageStatusPresentation(status: PipelineStageStatus): StatusConfig {
  return pipelineStageStatusPresentationMap[status];
}

export function getReviewWorkflowStageStatusPresentation(status: ReviewWorkflowStageStatus): StatusConfig {
  return reviewWorkflowStageStatusPresentationMap[status];
}

export function getAsyncPipelineExecutionStatusPresentation(status: AsyncPipelineExecutionStatus): StatusConfig {
  return asyncPipelineExecutionStatusPresentationMap[status];
}

export function getDeliverableStatusPresentation(status: DeliverableStatus): StatusConfig {
  return deliverableStatusPresentationMap[status];
}

export function getTranslationStatusPresentation(status: TranslationWorkflowStatus): StatusConfig {
  return translationStatusPresentationMap[status];
}

export function isTerminalPipelineRunStatus(status: PipelineRunStatus): boolean {
  return status === "completed" || status === "failed";
}

export function isTerminalPipelineWorkflowStatus(status: PipelineWorkflowStatus): boolean {
  return status === "accepted" || status === "rejected";
}
