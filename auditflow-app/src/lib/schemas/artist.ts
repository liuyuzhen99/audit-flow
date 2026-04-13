import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, paginationMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const artistAuditStatusSchema = z.enum(["autoApproved", "manualReview", "autoRejected", "monitoring"]);

export const artistChannelLinkDtoSchema = z.object({
  id: dtoIdSchema,
  name: z.string().trim().min(1),
  platform: z.literal("youtube"),
});

export const artistAuditSnapshotDtoSchema = z.object({
  status: artistAuditStatusSchema,
  lastDecisionAt: isoTimestampSchema,
  flaggedReleaseCount: z.number().int().nonnegative(),
});

export const artistDtoSchema = z.object({
  id: dtoIdSchema,
  name: z.string().trim().min(1),
  avatarUrl: z.string().url().nullable(),
  spotifyFollowers: z.number().int().nonnegative(),
  recentReleaseCount: z.number().int().nonnegative(),
  lastSyncedAt: isoTimestampSchema,
  channel: artistChannelLinkDtoSchema,
  auditSnapshot: artistAuditSnapshotDtoSchema,
});

export const artistListResponseDtoSchema = z.object({
  items: z.array(artistDtoSchema),
  meta: responseMetaDtoSchema,
});

export const artistsDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(artistDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
});
