import { z } from "zod";

export const phase9CutoverGateDtoSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const phase9CutoverReadinessReportDtoSchema = z.object({
  generatedAt: z.string(),
  readSource: z.string(),
  stabilityWindowDays: z.number().int().nonnegative(),
  readyForCutover: z.boolean(),
  gates: z.array(phase9CutoverGateDtoSchema),
});

export const phase9CutoverReadinessResponseDtoSchema = z.object({
  report: phase9CutoverReadinessReportDtoSchema,
});
