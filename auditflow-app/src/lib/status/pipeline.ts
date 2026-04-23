import type { StatusConfig } from "@/lib/status";
import type {
  DeliverableStatus,
  Phase4PipelineStageStatus,
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

const phase4PipelineStageStatusPresentationMap: Record<Phase4PipelineStageStatus, StatusConfig> = {
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const deliverableStatusPresentationMap: Record<DeliverableStatus, StatusConfig> = {
  ready: { label: "Ready", tone: "success" },
  processing: { label: "Processing", tone: "info" },
  blocked: { label: "Blocked", tone: "danger" },
};

const translationStatusPresentationMap: Record<TranslationWorkflowStatus, StatusConfig> = {
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
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

export function getPhase4PipelineStageStatusPresentation(status: Phase4PipelineStageStatus): StatusConfig {
  return phase4PipelineStageStatusPresentationMap[status];
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
