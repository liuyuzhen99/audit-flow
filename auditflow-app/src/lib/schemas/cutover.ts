import { z } from "zod";

export const cutoverGateDtoSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const cutoverReadinessReportDtoSchema = z.object({
  generatedAt: z.string(),
  readSource: z.string(),
  stabilityWindowDays: z.number().int().nonnegative(),
  readyForCutover: z.boolean(),
  gates: z.array(cutoverGateDtoSchema),
});

export const cutoverReadinessResponseDtoSchema = z.object({
  report: cutoverReadinessReportDtoSchema,
});
