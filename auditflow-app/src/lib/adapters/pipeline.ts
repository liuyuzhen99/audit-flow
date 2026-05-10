import type { ModuleSummary } from "@/types/common";
import type { Phase4PipelineDashboardResponseDto, Phase4PipelineItemDto, PipelineRowViewModel, PipelineStageName, PipelineStageViewModel, RenderJobStatus } from "@/types/pipeline";
import type { StatusTone } from "@/types/common";

import { getAsyncPipelineExecutionStatusPresentation, getPhase4PipelineStageStatusPresentation, getPipelineWorkflowStatusPresentation, getTranslationStatusPresentation } from "@/lib/status/pipeline";

function formatStageLabel(stage: PipelineStageName | "completed" | "rejected"): string {
  switch (stage) {
    case "downloading":
      return "Downloading";
    case "transcript_review":
      return "Transcript Review";
    case "transcripting":
      return "Transcripting";
    case "taste_audit":
      return "Taste Review";
    case "taste_auditing":
      return "Taste Auditing";
    case "manual_review":
      return "Manual Review";
    case "translation_review":
      return "Translation Review";
    case "translating":
      return "Translating";
    case "artifact_rendering":
      return "Artifact Rendering";
    case "final_asset_approval":
      return "Final Asset Approval";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
  }
}

const progressStageOrder: PipelineStageName[] = [
  "downloading",
  "transcripting",
  "transcript_review",
  "taste_auditing",
  "taste_audit",
  "manual_review",
  "translating",
  "translation_review",
  "artifact_rendering",
  "final_asset_approval",
];

function formatUpdatedLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function adaptStage(item: Phase4PipelineItemDto["stages"][number]): PipelineStageViewModel {
  const presentation = getPhase4PipelineStageStatusPresentation(item.status);

  return {
    id: item.stage,
    label: formatStageLabel(item.stage),
    statusLabel: presentation.label,
    statusTone: presentation.tone,
  };
}

function adaptRow(item: Phase4PipelineDashboardResponseDto["items"][number]): PipelineRowViewModel {
  const workflowPresentation = getPipelineWorkflowStatusPresentation(item.workflowStatus);
  const translationPresentation = getTranslationStatusPresentation(item.translation.status);
  const asyncPresentation = item.asyncExecution
    ? getAsyncPipelineExecutionStatusPresentation(item.asyncExecution.status)
    : null;
  const asyncDetail = item.asyncExecution
    ? `${item.asyncExecution.currentStage} · attempt ${item.asyncExecution.attempt + 1}/${item.asyncExecution.maxAttempts}${item.asyncExecution.pauseReason ? ` · ${item.asyncExecution.pauseReason.replaceAll("_", " ")}` : ""}`
    : null;
  const renderJob = item.renderJob ? adaptRenderJob(item.renderJob) : null;
  const processingActivity = item.pipelineActivity ? adaptProcessingActivity(item.pipelineActivity) : null;

  return {
    candidateId: item.candidateId,
    artistId: item.artistId,
    artistName: item.artistName,
    candidateTitle: item.candidateTitle,
    workflowStatusLabel: workflowPresentation.label,
    workflowStatusTone: workflowPresentation.tone,
    artifactStatus: item.artifactStatus,
    artifactStatusLabel: formatArtifactStatusLabel(item.artifactStatus),
    canStartRender:
      item.currentStage === "final_asset_approval" &&
      item.artifactStatus !== "ready" &&
      !(renderJob?.isActive ?? false),
    canRetryProcessing:
      item.asyncExecution?.status === "retry_scheduled" || item.asyncExecution?.status === "dlq",
    currentStageLabel: formatStageLabel(item.currentStage),
    translationStatusLabel: translationPresentation.label,
    translationStatusTone: translationPresentation.tone,
    asyncExecutionLabel: asyncPresentation?.label ?? null,
    asyncExecutionTone: asyncPresentation?.tone ?? "neutral",
    asyncExecutionDetail: asyncDetail,
    renderJob,
    processingActivity,
    lastUpdatedAtLabel: formatUpdatedLabel(item.lastUpdatedAt),
    stages: item.stages.map(adaptStage),
    progressStages: progressStageOrder.map((stage) => {
      const currentIndex = progressStageOrder.indexOf(item.currentStage as PipelineStageName);
      const index = progressStageOrder.indexOf(stage);
      return {
        id: stage,
        label: formatStageLabel(stage),
        state: index < currentIndex ? "done" : index === currentIndex ? "current" : "todo",
      };
    }),
  };
}

function adaptProcessingActivity(
  activity: NonNullable<Phase4PipelineItemDto["pipelineActivity"]>,
): NonNullable<PipelineRowViewModel["processingActivity"]> {
  const status = formatRenderJobStatus(activity.status);
  return {
    jobId: activity.jobId,
    statusLabel: status.label,
    statusTone: status.tone,
    progressLabel: activity.progress ?? null,
    currentStageLabel: activity.currentStage ? activity.currentStage.replaceAll("_", " ") : null,
    updatedAtLabel: activity.updatedAt ? formatUpdatedLabel(activity.updatedAt) : null,
    logs: activity.logs.map((log, index) => ({
      id: `${activity.jobId}-${index}-${log.timestamp ?? "queued"}`,
      timestampLabel: log.timestamp ? formatUpdatedLabel(log.timestamp) : "Queued",
      level: log.level,
      stageLabel: log.stage ? log.stage.replaceAll("_", " ") : null,
      message: log.message,
    })),
  };
}

function adaptRenderJob(job: NonNullable<Phase4PipelineItemDto["renderJob"]>): NonNullable<PipelineRowViewModel["renderJob"]> {
  const status = formatRenderJobStatus(job.status);
  return {
    jobId: job.jobId,
    statusLabel: status.label,
    statusTone: status.tone,
    progressLabel: job.progress ?? null,
    resultLabel: job.result ?? null,
    currentStageLabel: job.currentStage ? job.currentStage.replaceAll("_", " ") : null,
    updatedAtLabel: job.updatedAt ? formatUpdatedLabel(job.updatedAt) : null,
    isActive: job.status === "pending" || job.status === "processing",
  };
}

function formatRenderJobStatus(status: RenderJobStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case "pending":
      return { label: "Pending", tone: "warning" };
    case "processing":
      return { label: "Processing", tone: "info" };
    case "completed":
      return { label: "Completed", tone: "success" };
    case "failed":
      return { label: "Failed", tone: "danger" };
    case "missing":
      return { label: "Missing", tone: "neutral" };
  }
}

function formatArtifactStatusLabel(status: Phase4PipelineItemDto["artifactStatus"]): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "expired":
      return "Expired";
    case "deleted":
      return "Deleted";
    case "delete_failed":
      return "Delete Failed";
    case "missing":
      return "Missing";
  }
}

export function adaptPipelineDashboard(data: Phase4PipelineDashboardResponseDto): {
  summary: ModuleSummary[];
  rows: PipelineRowViewModel[];
  pagination: Phase4PipelineDashboardResponseDto["pagination"];
  polling: Phase4PipelineDashboardResponseDto["polling"];
} {
  return {
    summary: data.summary,
    rows: data.items.map(adaptRow),
    pagination: data.pagination,
    polling: data.polling,
  };
}
