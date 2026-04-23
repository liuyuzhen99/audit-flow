import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, nonEmptyStringSchema, paginationMetaDtoSchema, pollingMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const reviewTypeSchema = z.enum([
  "transcript_review",
  "taste_audit",
  "manual_review",
  "translation_review",
  "final_asset_approval",
]);

export const queueReviewStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const candidateWorkflowStatusSchema = z.enum(["discovered", "pending_review", "accepted", "rejected"]);

export const queueItemDtoSchema = z.object({
  reviewId: dtoIdSchema,
  artistId: dtoIdSchema,
  artistName: nonEmptyStringSchema,
  candidateId: dtoIdSchema,
  candidateTitle: nonEmptyStringSchema,
  reviewType: reviewTypeSchema,
  status: queueReviewStatusSchema,
  version: z.number().int().positive(),
  queuedAt: isoTimestampSchema,
  publishedAt: isoTimestampSchema.nullable(),
  sourceUrl: z.string().url(),
});

export const queueDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(queueItemDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});

export const reviewDecisionRequestDtoSchema = z.object({
  expectedVersion: z.number().int().positive(),
  comment: z.string().trim().min(1).max(1000).optional(),
  actorId: nonEmptyStringSchema.optional(),
});

export const reviewDecisionResponseDtoSchema = z.object({
  reviewId: dtoIdSchema,
  status: queueReviewStatusSchema,
  version: z.number().int().positive(),
  subjectId: dtoIdSchema,
  candidateStatus: candidateWorkflowStatusSchema,
  nextReviewId: dtoIdSchema.nullable(),
  nextReviewType: reviewTypeSchema.nullable(),
  decidedAt: isoTimestampSchema.nullable(),
});

export const auditLogEntryDtoSchema = z.object({
  logId: dtoIdSchema,
  aggregateType: nonEmptyStringSchema,
  aggregateId: dtoIdSchema,
  action: nonEmptyStringSchema,
  actorId: nonEmptyStringSchema,
  details: z.string().nullable(),
  createdAt: isoTimestampSchema,
});

export const auditLogResponseDtoSchema = z.object({
  items: z.array(auditLogEntryDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
});

