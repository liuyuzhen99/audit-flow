import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, paginationMetaDtoSchema, pollingMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const pipelineWorkflowStatusSchema = z.enum(["discovered", "downloading", "pending_review", "accepted", "rejected"]);
export const pipelineStageStatusSchema = z.enum(["not_started", "pending", "approved", "rejected"]);
export const asyncPipelineExecutionStatusSchema = z.enum(["pending", "processing", "completed", "failed", "retry_scheduled", "dlq"]);
export const renderJobStatusSchema = z.enum(["pending", "processing", "completed", "failed", "missing"]);
export const translationWorkflowStatusSchema = z.enum(["not_started", "pending", "submitted", "approved", "rejected"]);
export const pipelineArtifactStatusSchema = z.enum(["ready", "missing", "expired", "deleted", "delete_failed"]);
export const pipelineStageNameSchema = z.enum([
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
]);

export const pipelineStageDtoSchema = z.object({
  stage: pipelineStageNameSchema,
  status: pipelineStageStatusSchema,
});

export const pipelineItemDtoSchema = z.object({
  candidateId: dtoIdSchema,
  artistId: dtoIdSchema,
  artistName: z.string().trim().min(1),
  candidateTitle: z.string().trim().min(1),
  workflowStatus: pipelineWorkflowStatusSchema,
  artifactStatus: pipelineArtifactStatusSchema,
  currentStage: z.union([pipelineStageNameSchema, z.literal("completed"), z.literal("rejected")]),
  stages: z.array(pipelineStageDtoSchema),
  translation: z.object({
    status: translationWorkflowStatusSchema,
    updatedAt: isoTimestampSchema.optional(),
  }),
  asyncExecution: z.object({
    jobId: dtoIdSchema,
    currentStage: z.string().trim().min(1),
    status: asyncPipelineExecutionStatusSchema,
    attempt: z.number().int().nonnegative(),
    maxAttempts: z.number().int().positive(),
    nextRetryAt: isoTimestampSchema.nullish(),
    errorMessage: z.string().nullable().optional(),
    pauseReason: z.string().nullable().optional(),
    updatedAt: isoTimestampSchema,
  }).optional(),
  renderJob: z.object({
    jobId: dtoIdSchema,
    status: renderJobStatusSchema,
    progress: z.string().nullable().optional(),
    result: z.string().nullable().optional(),
    currentStage: z.string().nullable().optional(),
    updatedAt: isoTimestampSchema.nullish(),
  }).optional(),
  pipelineActivity: z.object({
    jobId: dtoIdSchema,
    status: renderJobStatusSchema,
    progress: z.string().nullable().optional(),
    currentStage: z.string().nullable().optional(),
    updatedAt: isoTimestampSchema.nullish(),
    logs: z.array(z.object({
      timestamp: isoTimestampSchema.nullish(),
      level: z.enum(["info", "success", "warning", "error"]),
      stage: z.string().nullable().optional(),
      message: z.string().trim().min(1),
    })),
  }).optional(),
  lastUpdatedAt: isoTimestampSchema,
});

export const pipelineDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(pipelineItemDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});

export const candidatePipelineResponseDtoSchema = z.object({
  candidateId: dtoIdSchema,
  candidateStatus: pipelineWorkflowStatusSchema,
  reviewId: dtoIdSchema,
  reviewType: pipelineStageNameSchema,
  reviewStatus: pipelineStageStatusSchema,
  version: z.number().int().positive(),
  taskId: dtoIdSchema.nullish(),
  message: z.string().nullable().optional(),
});

export const candidateWorkflowDetailDtoSchema = z.object({
  candidateId: dtoIdSchema,
  artistId: dtoIdSchema,
  artistName: z.string().trim().min(1),
  candidateTitle: z.string().trim().min(1),
  sourceUrl: z.string().trim().min(1),
  workflowStatus: pipelineWorkflowStatusSchema,
  currentStage: z.union([
    pipelineStageNameSchema,
    z.literal("completed"),
    z.literal("rejected"),
    z.literal("not_started"),
  ]),
  reviews: z.array(z.object({
    reviewId: dtoIdSchema,
    reviewType: pipelineStageNameSchema,
    status: pipelineStageStatusSchema,
    version: z.number().int().positive(),
    decisionComment: z.string().nullable(),
    decidedBy: z.string().nullable(),
    decidedAt: isoTimestampSchema.nullable(),
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })),
  transcript: z.object({
    videoId: dtoIdSchema,
    segmentCount: z.number().int().nonnegative(),
    segments: z.array(z.object({
      lineIndex: z.number().int().nonnegative(),
      startTime: z.number(),
      endTime: z.number(),
      text: z.string(),
      status: z.string(),
    })),
  }),
  tasteAudit: z.object({
    decision: z.string().nullable().optional(),
    score: z.number().nullable().optional(),
    keyLyrics: z.array(z.string()).optional(),
    comment: z.string().nullable().optional(),
    recordedAt: isoTimestampSchema.optional(),
    recordedBy: z.string().optional(),
    rawDetails: z.string().nullable().optional(),
  }).nullable(),
  translation: z.object({
    lineCount: z.number().int().nonnegative(),
    lines: z.array(z.object({
      lineIndex: z.number().int().nonnegative(),
      startTime: z.number(),
      endTime: z.number(),
      sourceText: z.string(),
      translatedText: z.string().nullable(),
      status: z.string(),
    })),
  }),
});
