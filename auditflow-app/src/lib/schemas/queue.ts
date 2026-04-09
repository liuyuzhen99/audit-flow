import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, pollingMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const queueStatusSchema = z.enum(["queued", "downloading", "auditing", "autoApproved", "manualReview", "autoRejected"]);
export const auditDecisionStatusSchema = z.enum(["pending", "approved", "manualReview", "rejected"]);

export const queueProgressDtoSchema = z.object({
  percent: z.number().int().min(0).max(100),
  label: z.string().trim().min(1),
});

export const auditDecisionDtoSchema = z.object({
  status: auditDecisionStatusSchema,
  confidenceScore: z.number().min(0).max(100).nullable(),
  ruleSummary: z.string().trim().min(1),
});

export const queueItemDtoSchema = z.object({
  id: dtoIdSchema,
  title: z.string().trim().min(1),
  artistName: z.string().trim().min(1),
  coverArtUrl: z.string().url().nullable(),
  status: queueStatusSchema,
  auditDecision: auditDecisionDtoSchema,
  progress: queueProgressDtoSchema,
  submittedAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const queueListResponseDtoSchema = z.object({
  items: z.array(queueItemDtoSchema),
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});

export const queueDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(queueItemDtoSchema),
  meta: responseMetaDtoSchema,
  polling: pollingMetaDtoSchema,
});
