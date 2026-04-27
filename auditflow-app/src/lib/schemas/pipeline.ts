import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, paginationMetaDtoSchema, pollingMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const pipelineWorkflowStatusSchema = z.enum(["discovered", "pending_review", "accepted", "rejected"]);
export const pipelineStageStatusSchema = z.enum(["not_started", "pending", "approved", "rejected"]);
export const asyncPipelineExecutionStatusSchema = z.enum(["pending", "processing", "completed", "failed", "retry_scheduled", "dlq"]);
export const translationWorkflowStatusSchema = z.enum(["not_started", "pending", "approved", "rejected"]);
export const pipelineStageNameSchema = z.enum([
  "transcript_review",
  "taste_audit",
  "manual_review",
  "translation_review",
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
  lastUpdatedAt: isoTimestampSchema,
});

export const pipelineDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(pipelineItemDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});
