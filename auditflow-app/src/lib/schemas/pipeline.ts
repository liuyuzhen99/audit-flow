import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, pollingMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const pipelineRunStatusSchema = z.enum(["queued", "running", "completed", "failed"]);
export const pipelineStageStatusSchema = z.enum(["pending", "running", "completed", "failed"]);
export const pipelineLogLevelSchema = z.enum(["info", "success", "warning", "error"]);
export const deliverableStatusSchema = z.enum(["ready", "processing", "blocked"]);

export const pipelineStageDtoSchema = z.object({
  id: dtoIdSchema,
  label: z.string().trim().min(1),
  status: pipelineStageStatusSchema,
  progressPercent: z.number().int().min(0).max(100),
});

export const pipelineLogEntryDtoSchema = z.object({
  id: dtoIdSchema,
  timestamp: isoTimestampSchema,
  level: pipelineLogLevelSchema,
  message: z.string().trim().min(1),
});

export const pipelineDeliverableDtoSchema = z.object({
  id: dtoIdSchema,
  label: z.string().trim().min(1),
  status: deliverableStatusSchema,
  description: z.string().trim().min(1),
});

export const pipelineJobDtoSchema = z.object({
  id: dtoIdSchema,
  title: z.string().trim().min(1),
  sourceTitle: z.string().trim().min(1),
  artistName: z.string().trim().min(1),
  status: pipelineRunStatusSchema,
  currentStageId: dtoIdSchema.nullable(),
  elapsedSeconds: z.number().int().nonnegative(),
  estimatedRemainingSeconds: z.number().int().nonnegative().nullable(),
});

export const pipelineJobDetailDtoSchema = pipelineJobDtoSchema.extend({
  stages: z.array(pipelineStageDtoSchema),
  logs: z.array(pipelineLogEntryDtoSchema),
  deliverables: z.array(pipelineDeliverableDtoSchema),
});

export const pipelineListResponseDtoSchema = z.object({
  jobs: z.array(pipelineJobDtoSchema),
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});

export const pipelineDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  jobs: z.array(pipelineJobDtoSchema),
  activeJob: pipelineJobDetailDtoSchema.nullable(),
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});
