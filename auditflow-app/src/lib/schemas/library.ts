import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const libraryStatusSchema = z.literal("accepted");
export const artifactAvailabilityStatusSchema = z.enum(["ready", "missing", "expired", "deleted", "delete_failed"]);

export const artifactSummaryDtoSchema = z.object({
  artifactId: dtoIdSchema,
  artifactType: z.string().trim().min(1),
  objectUri: z.string().trim().min(1),
  contentType: z.string().trim().min(1).nullable(),
  sizeBytes: z.number().int().nonnegative(),
  checksumSha256: z.string(),
  lifecycleStatus: z.string().trim().min(1),
  version: z.number().int().positive(),
  createdAt: isoTimestampSchema,
  expiresAt: isoTimestampSchema.nullable(),
});

export const libraryAssetDtoSchema = z.object({
  id: dtoIdSchema,
  artistId: dtoIdSchema,
  artistName: z.string().trim().min(1),
  title: z.string().trim().min(1),
  sourceUrl: z.string().url(),
  approvedAt: isoTimestampSchema.nullable(),
  approvedBy: z.string().trim().min(1).nullable(),
  status: libraryStatusSchema,
  artifactStatus: artifactAvailabilityStatusSchema,
  artifacts: z.array(artifactSummaryDtoSchema),
});

export const libraryAssetDetailDtoSchema = libraryAssetDtoSchema.extend({
  primaryArtifact: artifactSummaryDtoSchema.nullable(),
  previewUrl: z.string().trim().min(1).nullable(),
  previewUrlExpiresInSeconds: z.number().int().positive().nullable(),
  fallbackDownloadUrl: z.string().trim().min(1).nullable(),
});

export const libraryDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(libraryAssetDtoSchema),
  meta: responseMetaDtoSchema,
});
