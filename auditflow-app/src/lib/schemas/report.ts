import { z } from "zod";

import { dtoIdSchema, isoTimestampSchema, responseMetaDtoSchema } from "@/lib/schemas/common";

export const auditReportStatusSchema = z.enum(["completed", "flagged", "pending"]);
export const ruleSeveritySchema = z.enum(["low", "medium", "high"]);

export const ruleHitDtoSchema = z.object({
  id: dtoIdSchema,
  ruleName: z.string().trim().min(1),
  severity: ruleSeveritySchema,
  description: z.string().trim().min(1),
});

export const auditTimelineEventDtoSchema = z.object({
  id: dtoIdSchema,
  timestamp: isoTimestampSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const auditReportDtoSchema = z.object({
  id: dtoIdSchema,
  queueItemId: dtoIdSchema,
  title: z.string().trim().min(1),
  status: auditReportStatusSchema,
  createdAt: isoTimestampSchema,
  ruleHits: z.array(ruleHitDtoSchema),
  timeline: z.array(auditTimelineEventDtoSchema),
});

export const reportDetailResponseDtoSchema = z.object({
  report: auditReportDtoSchema,
  meta: responseMetaDtoSchema,
});
