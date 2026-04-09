import type { ModuleSummary } from "@/types/common";
import type {
  PipelineDashboardResponseDto,
  PipelineDeliverableViewModel,
  PipelineJobViewModel,
  PipelineLogEntryViewModel,
  PipelineStageViewModel,
} from "@/types/pipeline";

import {
  getDeliverableStatusPresentation,
  getPipelineRunStatusPresentation,
  getPipelineStageStatusPresentation,
} from "@/lib/status/pipeline";

function formatDurationLabel(seconds: number | null): string {
  if (seconds === null) {
    return "--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function adaptJob(item: PipelineDashboardResponseDto["jobs"][number]): PipelineJobViewModel {
  const statusPresentation = getPipelineRunStatusPresentation(item.status);

  return {
    id: item.id,
    title: item.title,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    elapsedLabel: formatDurationLabel(item.elapsedSeconds),
    remainingLabel: formatDurationLabel(item.estimatedRemainingSeconds),
  };
}

function adaptStage(item: NonNullable<PipelineDashboardResponseDto["activeJob"]>["stages"][number]): PipelineStageViewModel {
  const statusPresentation = getPipelineStageStatusPresentation(item.status);

  return {
    id: item.id,
    label: item.label,
    statusLabel: item.status === "running" ? `${item.progressPercent}%` : statusPresentation.label,
    statusTone: statusPresentation.tone,
    progressLabel: `${item.progressPercent}%`,
  };
}

function adaptLog(item: NonNullable<PipelineDashboardResponseDto["activeJob"]>["logs"][number]): PipelineLogEntryViewModel {
  const timeLabel = new Date(item.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return {
    id: item.id,
    displayLine: `[${timeLabel}] ${item.message}`,
    toneClassName:
      item.level === "success"
        ? "text-emerald-400"
        : item.level === "warning"
          ? "text-amber-400"
          : item.level === "error"
            ? "text-rose-400"
            : "text-slate-300",
  };
}

function adaptDeliverable(item: NonNullable<PipelineDashboardResponseDto["activeJob"]>["deliverables"][number]): PipelineDeliverableViewModel {
  const statusPresentation = getDeliverableStatusPresentation(item.status);

  return {
    id: item.id,
    label: item.label,
    description: item.description,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
  };
}

export function adaptPipelineDashboard(data: PipelineDashboardResponseDto): {
  summary: ModuleSummary[];
  jobs: PipelineJobViewModel[];
  activeJob: null | {
    id: string;
    title: string;
    statusLabel: string;
    statusTone: PipelineJobViewModel["statusTone"];
    elapsedLabel: string;
    remainingLabel: string;
    stages: PipelineStageViewModel[];
    logs: PipelineLogEntryViewModel[];
    deliverables: PipelineDeliverableViewModel[];
  };
  polling: PipelineDashboardResponseDto["polling"];
} {
  return {
    summary: data.summary,
    jobs: data.jobs.map(adaptJob),
    activeJob: data.activeJob
      ? {
          id: data.activeJob.id,
          title: data.activeJob.title,
          statusLabel: getPipelineRunStatusPresentation(data.activeJob.status).label,
          statusTone: getPipelineRunStatusPresentation(data.activeJob.status).tone,
          elapsedLabel: formatDurationLabel(data.activeJob.elapsedSeconds),
          remainingLabel: formatDurationLabel(data.activeJob.estimatedRemainingSeconds),
          stages: data.activeJob.stages.map(adaptStage),
          logs: data.activeJob.logs.map(adaptLog),
          deliverables: data.activeJob.deliverables.map(adaptDeliverable),
        }
      : null,
    polling: data.polling,
  };
}
