import type { ModuleSummary } from "@/types/common";
import type { Phase4PipelineDashboardResponseDto, Phase4PipelineItemDto, PipelineRowViewModel, PipelineStageName, PipelineStageViewModel } from "@/types/pipeline";

import { getAsyncPipelineExecutionStatusPresentation, getPhase4PipelineStageStatusPresentation, getPipelineWorkflowStatusPresentation, getTranslationStatusPresentation } from "@/lib/status/pipeline";

function formatStageLabel(stage: PipelineStageName | "completed" | "rejected"): string {
  switch (stage) {
    case "transcript_review":
      return "Transcript Review";
    case "taste_audit":
      return "Taste Audit";
    case "manual_review":
      return "Manual Review";
    case "translation_review":
      return "Translation Review";
    case "final_asset_approval":
      return "Final Asset Approval";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
  }
}

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

  return {
    candidateId: item.candidateId,
    artistId: item.artistId,
    artistName: item.artistName,
    candidateTitle: item.candidateTitle,
    workflowStatusLabel: workflowPresentation.label,
    workflowStatusTone: workflowPresentation.tone,
    currentStageLabel: formatStageLabel(item.currentStage),
    translationStatusLabel: translationPresentation.label,
    translationStatusTone: translationPresentation.tone,
    asyncExecutionLabel: asyncPresentation?.label ?? null,
    asyncExecutionTone: asyncPresentation?.tone ?? "neutral",
    asyncExecutionDetail: asyncDetail,
    lastUpdatedAtLabel: formatUpdatedLabel(item.lastUpdatedAt),
    stages: item.stages.map(adaptStage),
  };
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
