import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, responseMetaDtoSchema, summaryMetricDtoSchema } from "@/lib/schemas/common";

export const libraryStatusSchema = z.literal("accepted");

export const libraryAssetDtoSchema = z.object({
  id: dtoIdSchema,
  artistId: dtoIdSchema,
  artistName: z.string().trim().min(1),
  title: z.string().trim().min(1),
  sourceUrl: z.string().url(),
  approvedAt: isoTimestampSchema.nullable(),
  approvedBy: z.string().trim().min(1).nullable(),
  status: libraryStatusSchema,
});

export const libraryDashboardResponseDtoSchema = z.object({
  summary: z.array(summaryMetricDtoSchema),
  items: z.array(libraryAssetDtoSchema),
  meta: responseMetaDtoSchema,
});

