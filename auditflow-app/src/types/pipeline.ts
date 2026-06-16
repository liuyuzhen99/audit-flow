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

export type PipelineWorkflowStatus = "discovered" | "downloading" | "pending_review" | "accepted" | "rejected";
export type ReviewWorkflowStageStatus = "not_started" | "pending" | "approved" | "rejected";
export type AsyncPipelineExecutionStatus = "pending" | "processing" | "completed" | "failed" | "retry_scheduled" | "dlq";
export type RenderJobStatus = "pending" | "processing" | "completed" | "failed" | "missing";
export type TranslationWorkflowStatus = "not_started" | "pending" | "submitted" | "approved" | "rejected";
export type PipelineArtifactStatus = "ready" | "missing" | "expired" | "deleted" | "delete_failed";
export type PipelineStageName =
  | "downloading"
  | "transcripting"
  | "transcript_review"
  | "taste_auditing"
  | "taste_audit"
  | "manual_review"
  | "translating"
  | "translation_review"
  | "artifact_rendering"
  | "final_asset_approval";

export type ReviewWorkflowStageDto = {
  stage: PipelineStageName;
  status: ReviewWorkflowStageStatus;
};

export type ReviewWorkflowItemDto = {
  candidateId: string;
  artistId: string;
  artistName: string;
  candidateTitle: string;
  workflowStatus: PipelineWorkflowStatus;
  artifactStatus: PipelineArtifactStatus;
  currentStage: PipelineStageName | "completed" | "rejected";
  stages: ReviewWorkflowStageDto[];
  translation: {
    status: TranslationWorkflowStatus;
    updatedAt?: string;
  };
  asyncExecution?: {
    jobId: string;
    currentStage: string;
    status: AsyncPipelineExecutionStatus;
    attempt: number;
    maxAttempts: number;
    nextRetryAt?: string | null;
    errorMessage?: string | null;
    pauseReason?: string | null;
    updatedAt: string;
  };
  renderJob?: {
    jobId: string;
    status: RenderJobStatus;
    progress?: string | null;
    result?: string | null;
    currentStage?: string | null;
    updatedAt?: string | null;
  };
  pipelineActivity?: {
    jobId: string;
    status: RenderJobStatus;
    progress?: string | null;
    currentStage?: string | null;
    updatedAt?: string | null;
    logs: Array<{
      timestamp?: string | null;
      level: "info" | "success" | "warning" | "error";
      stage?: string | null;
      message: string;
    }>;
  };
  lastUpdatedAt: string;
};

export type ReviewWorkflowDashboardResponseDto = {
  summary: SummaryMetricDto[];
  items: ReviewWorkflowItemDto[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
  polling: PollingMetaDto;
};

export type CandidatePipelineResponseDto = {
  candidateId: string;
  candidateStatus: PipelineWorkflowStatus;
  reviewId: string;
  reviewType: PipelineStageName;
  reviewStatus: ReviewWorkflowStageStatus;
  version: number;
  taskId?: string | null;
  message?: string | null;
};

export type CandidateReviewDetailDto = {
  reviewId: string;
  reviewType: PipelineStageName;
  status: ReviewWorkflowStageStatus;
  version: number;
  decisionComment: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CandidateTranscriptSegmentDto = {
  lineIndex: number;
  startTime: number;
  endTime: number;
  text: string;
  status: string;
};

export type CandidateTranslationLineDto = {
  lineIndex: number;
  startTime: number;
  endTime: number;
  sourceText: string;
  translatedText: string | null;
  status: string;
};

export type CandidateWorkflowDetailDto = {
  candidateId: string;
  artistId: string;
  artistName: string;
  candidateTitle: string;
  sourceUrl: string;
  workflowStatus: PipelineWorkflowStatus;
  currentStage: PipelineStageName | "completed" | "rejected" | "not_started";
  reviews: CandidateReviewDetailDto[];
  transcript: {
    videoId: string;
    segmentCount: number;
    segments: CandidateTranscriptSegmentDto[];
  };
  tasteAudit: {
    decision?: string | null;
    score?: number | null;
    keyLyrics?: string[];
    comment?: string | null;
    recordedAt?: string;
    recordedBy?: string;
    rawDetails?: string | null;
  } | null;
  translation: {
    lineCount: number;
    lines: CandidateTranslationLineDto[];
  };
};

export type PipelineStageViewModel = {
  id: string;
  label: string;
  statusLabel: string;
  statusTone: StatusTone;
};

export type PipelineProgressStageViewModel = {
  id: PipelineStageName;
  label: string;
  state: "done" | "current" | "todo";
};

export type PipelineRowViewModel = {
  candidateId: string;
  artistId: string;
  artistName: string;
  candidateTitle: string;
  workflowStatusLabel: string;
  workflowStatusTone: StatusTone;
  artifactStatus: PipelineArtifactStatus;
  artifactStatusLabel: string;
  canStartRender: boolean;
  canRetryProcessing: boolean;
  currentStageLabel: string;
  translationStatusLabel: string;
  translationStatusTone: StatusTone;
  asyncExecutionLabel: string | null;
  asyncExecutionTone: StatusTone;
  asyncExecutionDetail: string | null;
  renderJob: {
    jobId: string;
    statusLabel: string;
    statusTone: StatusTone;
    progressLabel: string | null;
    resultLabel: string | null;
    currentStageLabel: string | null;
    updatedAtLabel: string | null;
    isActive: boolean;
  } | null;
  processingActivity: {
    jobId: string;
    statusLabel: string;
    statusTone: StatusTone;
    progressLabel: string | null;
    currentStageLabel: string | null;
    updatedAtLabel: string | null;
    logs: Array<{
      id: string;
      timestampLabel: string;
      level: "info" | "success" | "warning" | "error";
      stageLabel: string | null;
      message: string;
    }>;
  } | null;
  lastUpdatedAtLabel: string;
  stages: PipelineStageViewModel[];
  progressStages: PipelineProgressStageViewModel[];
};
