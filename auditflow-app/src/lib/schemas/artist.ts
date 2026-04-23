import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, paginationMetaDtoSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

const nullableIsoTimestampSchema = isoTimestampSchema.nullable();

export const artistSyncStatusSchema = z.enum(["pending", "processing", "completed", "failed", "partial"]);

export const artistSourceHealthDtoSchema = z.object({
  status: artistSyncStatusSchema,
  retryCount: z.number().int().nonnegative(),
  failureReason: z.string().nullable(),
  startedAt: nullableIsoTimestampSchema,
  completedAt: nullableIsoTimestampSchema,
  discoveredCount: z.number().int().nonnegative(),
});

export const artistLatestCandidateDtoSchema = z.object({
  candidateId: dtoIdSchema,
  videoId: dtoIdSchema,
  title: z.string().trim().min(1),
  status: z.string().trim().min(1),
  ingestionStatus: artistSyncStatusSchema,
  channelId: z.string().trim().min(1).nullable(),
  sourceUrl: z.string().url(),
  sourceKind: z.string().trim().min(1),
  publishedAt: nullableIsoTimestampSchema,
  firstSeenAt: nullableIsoTimestampSchema,
  lastSeenAt: nullableIsoTimestampSchema,
  discoveryRunId: z.string().trim().min(1).nullable(),
  failureReason: z.string().nullable(),
});

export const artistLatestRunDtoSchema = z.object({
  runId: dtoIdSchema,
  status: artistSyncStatusSchema,
  sourceKind: z.string().trim().min(1),
  discoveredCount: z.number().int().nonnegative(),
  failureReason: z.string().nullable(),
  startedAt: nullableIsoTimestampSchema,
  completedAt: nullableIsoTimestampSchema,
});

export const artistRetryMetadataDtoSchema = z.object({
  canResync: z.boolean(),
  latestRetryCount: z.number().int().nonnegative(),
  latestFailureReason: z.string().nullable(),
});

export const artistDtoSchema = z.object({
  id: dtoIdSchema,
  name: z.string().trim().min(1),
  status: z.string().trim().min(1),
  youtubeChannelId: z.string().trim().min(1).nullable(),
  youtubeChannelLabel: z.string(),
  syncStatus: artistSyncStatusSchema,
  lastSyncStartedAt: nullableIsoTimestampSchema,
  lastSyncCompletedAt: nullableIsoTimestampSchema,
  lastSyncError: z.string().nullable(),
  candidateCount: z.number().int().nonnegative(),
  partialFailure: z.boolean(),
  emptyState: z.boolean(),
  retryMetadata: artistRetryMetadataDtoSchema,
  sourceHealth: z.record(z.string(), artistSourceHealthDtoSchema),
  latestCandidate: artistLatestCandidateDtoSchema.nullable(),
  latestRun: artistLatestRunDtoSchema.nullable(),
});

export const artistsDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema).optional(),
  stats: z
    .object({
      totalArtists: z.number().int().nonnegative(),
      visibleArtists: z.number().int().nonnegative(),
      totalCompletedArtists: z.number().int().nonnegative(),
      visibleCompletedArtists: z.number().int().nonnegative(),
      totalFailedArtists: z.number().int().nonnegative(),
      visibleFailedArtists: z.number().int().nonnegative(),
      totalCandidates: z.number().int().nonnegative(),
      visibleCandidates: z.number().int().nonnegative(),
    })
    .optional(),
  items: z.array(artistDtoSchema),
  pagination: paginationMetaDtoSchema,
  meta: responseMetaDtoSchema,
});

export const artistListResponseDtoSchema = z.object({
  items: z.array(artistDtoSchema),
  meta: responseMetaDtoSchema,
});

export const artistCandidatesResponseDtoSchema = z.object({
  artistId: dtoIdSchema,
  items: z.array(artistLatestCandidateDtoSchema),
  pagination: paginationMetaDtoSchema,
});

export const artistResyncResponseDtoSchema = z.object({
  runId: dtoIdSchema,
  artistId: dtoIdSchema,
  status: artistSyncStatusSchema,
  discoveredCount: z.number().int().nonnegative(),
  startedAt: isoTimestampSchema,
  completedAt: isoTimestampSchema,
  channelRunId: dtoIdSchema,
  discoveryRunId: dtoIdSchema,
  artistRemoved: z.boolean().optional(),
});
