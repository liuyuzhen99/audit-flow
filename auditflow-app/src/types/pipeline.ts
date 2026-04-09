import type { PollingMetaDto, ResponseMetaDto, SummaryMetricDto } from "@/types/api";
import type { StatusTone } from "@/types/common";

export type PipelineRunStatus = "queued" | "running" | "completed" | "failed";
export type PipelineStageStatus = "pending" | "running" | "completed" | "failed";
export type PipelineLogLevel = "info" | "success" | "warning" | "error";
export type DeliverableStatus = "ready" | "processing" | "blocked";

export type PipelineStageDto = {
  id: string;
  label: string;
  status: PipelineStageStatus;
  progressPercent: number;
};

export type PipelineLogEntryDto = {
  id: string;
  timestamp: string;
  level: PipelineLogLevel;
  message: string;
};

export type PipelineDeliverableDto = {
  id: string;
  label: string;
  status: DeliverableStatus;
  description: string;
};

export type PipelineJobDto = {
  id: string;
  title: string;
  sourceTitle: string;
  artistName: string;
  status: PipelineRunStatus;
  currentStageId: string | null;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number | null;
};

export type PipelineJobDetailDto = PipelineJobDto & {
  stages: PipelineStageDto[];
  logs: PipelineLogEntryDto[];
  deliverables: PipelineDeliverableDto[];
};

export type PipelineListResponseDto = {
  jobs: PipelineJobDto[];
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type PipelineDashboardResponseDto = {
  summary: SummaryMetricDto[];
  jobs: PipelineJobDto[];
  activeJob: PipelineJobDetailDto | null;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type PipelineJobViewModel = {
  id: string;
  title: string;
  statusLabel: string;
  statusTone: StatusTone;
  elapsedLabel: string;
  remainingLabel: string;
};

export type PipelineStageViewModel = {
  id: string;
  label: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "info" | "neutral";
  progressLabel: string;
};

export type PipelineLogEntryViewModel = {
  id: string;
  displayLine: string;
  toneClassName: string;
};

export type PipelineDeliverableViewModel = {
  id: string;
  label: string;
  description: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "info" | "neutral";
};
