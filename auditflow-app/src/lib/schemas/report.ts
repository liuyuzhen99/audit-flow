import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, nonEmptyStringSchema, responseMetaDtoSchema } from "@/lib/schemas/common";

export const auditReportStatusSchema = z.enum(["completed", "flagged", "pending"]);
export const reportDecisionStatusSchema = z.enum(["approved", "manualReview", "rejected", "pending"]);
export const ruleSeveritySchema = z.enum(["low", "medium", "high"]);

export const ruleHitDtoSchema = z.object({
  id: dtoIdSchema,
  ruleName: nonEmptyStringSchema,
  severity: ruleSeveritySchema,
  description: nonEmptyStringSchema,
});

export const auditTimelineEventDtoSchema = z.object({
  id: dtoIdSchema,
  timestamp: isoTimestampSchema,
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
});

export const reportCommentDtoSchema = z.object({
  id: dtoIdSchema,
  authorName: nonEmptyStringSchema,
  createdAt: isoTimestampSchema,
  body: nonEmptyStringSchema,
});

export const auditReportSummaryDtoSchema = z.object({
  decisionStatus: reportDecisionStatusSchema,
  confidenceScore: z.number().min(0).max(100).nullable(),
  ruleSummary: nonEmptyStringSchema,
  durationSeconds: z.number().int().nonnegative(),
  transcriptLanguage: nonEmptyStringSchema,
  completedAt: isoTimestampSchema.nullable(),
});

export const reportLinkedAssetDtoSchema = z.object({
  assetId: dtoIdSchema,
  title: nonEmptyStringSchema,
  artistName: nonEmptyStringSchema,
  status: z.enum(["published", "processing", "review", "failed"]),
});

export const reportMediaDtoSchema = z.object({
  playbackUrl: z.string().url().nullable(),
  posterUrl: z.string().url().nullable(),
  mimeType: z.string().trim().min(1).nullable(),
});

export const auditReportDtoSchema = z.object({
  id: dtoIdSchema,
  queueItemId: dtoIdSchema,
  title: nonEmptyStringSchema,
  status: auditReportStatusSchema,
  createdAt: isoTimestampSchema,
  summary: auditReportSummaryDtoSchema,
  linkedAsset: reportLinkedAssetDtoSchema.nullable(),
  media: reportMediaDtoSchema,
  ruleHits: z.array(ruleHitDtoSchema),
  timeline: z.array(auditTimelineEventDtoSchema),
  comments: z.array(reportCommentDtoSchema),
});

export const reportDetailResponseDtoSchema = z.object({
  report: auditReportDtoSchema,
  meta: responseMetaDtoSchema,
});
