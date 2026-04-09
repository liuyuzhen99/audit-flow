import type { StatusConfig } from "@/lib/status";
import type { DeliverableStatus, PipelineRunStatus, PipelineStageStatus } from "@/types/pipeline";

const pipelineRunStatusPresentationMap: Record<PipelineRunStatus, StatusConfig> = {
  queued: { label: "Queued", tone: "warning" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const pipelineStageStatusPresentationMap: Record<PipelineStageStatus, StatusConfig> = {
  pending: { label: "Pending", tone: "neutral" },
  running: { label: "In progress", tone: "info" },
  completed: { label: "Done", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const deliverableStatusPresentationMap: Record<DeliverableStatus, StatusConfig> = {
  ready: { label: "Ready", tone: "success" },
  processing: { label: "Processing", tone: "info" },
  blocked: { label: "Blocked", tone: "danger" },
};

export function getPipelineRunStatusPresentation(status: PipelineRunStatus): StatusConfig {
  return pipelineRunStatusPresentationMap[status];
}

export function getPipelineStageStatusPresentation(status: PipelineStageStatus): StatusConfig {
  return pipelineStageStatusPresentationMap[status];
}

export function getDeliverableStatusPresentation(status: DeliverableStatus): StatusConfig {
  return deliverableStatusPresentationMap[status];
}

export function isTerminalPipelineRunStatus(status: PipelineRunStatus): boolean {
  return status === "completed" || status === "failed";
}
