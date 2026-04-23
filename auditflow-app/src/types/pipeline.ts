import type { PaginationMetaDto, PollingMetaDto, ResponseMetaDto, SummaryMetricDto } from "@/types/api";
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
  tick: number;
  level: PipelineLogLevel;
  message: string;
};

export type PipelineDeliverableDto = {
  id: string;
  label: string;
  status: DeliverableStatus;
  description: string;
  assetId: string | null;
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

export type PipelineDashboardResponseDto = {
  summary: SummaryMetricDto[];
  jobs: PipelineJobDto[];
  activeJob: PipelineJobDetailDto | null;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type PipelineWorkflowStatus = "discovered" | "pending_review" | "accepted" | "rejected";
export type Phase4PipelineStageStatus = "not_started" | "pending" | "approved" | "rejected";
export type TranslationWorkflowStatus = "not_started" | "pending" | "approved" | "rejected";
export type PipelineStageName =
  | "transcript_review"
  | "taste_audit"
  | "manual_review"
  | "translation_review"
  | "final_asset_approval";

export type Phase4PipelineStageDto = {
  stage: PipelineStageName;
  status: Phase4PipelineStageStatus;
};

export type Phase4PipelineItemDto = {
  candidateId: string;
  artistId: string;
  artistName: string;
  candidateTitle: string;
  workflowStatus: PipelineWorkflowStatus;
  currentStage: PipelineStageName | "completed" | "rejected";
  stages: Phase4PipelineStageDto[];
  translation: {
    status: TranslationWorkflowStatus;
    updatedAt?: string;
  };
  lastUpdatedAt: string;
};

export type Phase4PipelineDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: Phase4PipelineItemDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type PipelineStageViewModel = {
  id: string;
  label: string;
  statusLabel: string;
  statusTone: StatusTone;
};

export type PipelineRowViewModel = {
  candidateId: string;
  artistId: string;
  artistName: string;
  candidateTitle: string;
  workflowStatusLabel: string;
  workflowStatusTone: StatusTone;
  currentStageLabel: string;
  translationStatusLabel: string;
  translationStatusTone: StatusTone;
  lastUpdatedAtLabel: string;
  stages: PipelineStageViewModel[];
};

