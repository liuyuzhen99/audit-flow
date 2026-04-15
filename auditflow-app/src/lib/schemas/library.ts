import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";
import { auditReportSummaryDtoSchema, reportCommentDtoSchema, reportLinkedAssetDtoSchema, reportMediaDtoSchema, ruleHitDtoSchema, auditTimelineEventDtoSchema } from "@/lib/schemas/report";

export const libraryStatusSchema = z.enum(["published", "processing", "review", "failed"]);
export const assetSourceStatusSchema = z.enum(["queued", "running", "completed", "failed"]);

export const assetVersionDtoSchema = z.object({
  id: dtoIdSchema,
  label: z.string().trim().min(1),
  createdAt: isoTimestampSchema,
});

export const assetMetadataDtoSchema = z.object({
  sourceStatus: assetSourceStatusSchema,
});

export const libraryLinkedReportDtoSchema = z.object({
  reportId: dtoIdSchema,
  title: z.string().trim().min(1),
  summary: auditReportSummaryDtoSchema,
});

export const libraryAssetDtoSchema = z.object({
  id: dtoIdSchema,
  title: z.string().trim().min(1),
  artistName: z.string().trim().min(1),
  thumbnailUrl: z.string().url().nullable(),
  status: libraryStatusSchema,
  resolution: z.string().trim().min(1),
  durationSeconds: z.number().int().nonnegative(),
  createdAt: isoTimestampSchema,
  metadata: assetMetadataDtoSchema,
  media: reportMediaDtoSchema,
  linkedReport: libraryLinkedReportDtoSchema.nullable(),
  linkedReportAsset: reportLinkedAssetDtoSchema.nullable(),
  reportRuleHits: z.array(ruleHitDtoSchema),
  reportTimeline: z.array(auditTimelineEventDtoSchema),
  reportComments: z.array(reportCommentDtoSchema),
  versions: z.array(assetVersionDtoSchema),
});

export const libraryListResponseDtoSchema = z.object({
  items: z.array(libraryAssetDtoSchema),
  meta: responseMetaDtoSchema,
});

export const libraryDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(libraryAssetDtoSchema),
  meta: responseMetaDtoSchema,
});
