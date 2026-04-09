import { z } from "zod";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_POLLING_INTERVAL_MS, MAX_PAGE_SIZE } from "@/types/api";

const isoTimestampMessage = "Invalid ISO timestamp";

export const isoTimestampSchema = z.iso.datetime({ message: isoTimestampMessage });
export const nonEmptyStringSchema = z.string().trim().min(1);
export const dtoIdSchema = nonEmptyStringSchema;
export const statusToneSchema = z.enum(["neutral", "success", "warning", "danger", "info"]);
export const metricToneSchema = z.enum(["success", "warning", "danger", "info"]);

export const summaryMetricDtoSchema = z.object({
  id: dtoIdSchema,
  label: nonEmptyStringSchema,
  value: nonEmptyStringSchema,
  hint: nonEmptyStringSchema.optional(),
  tone: metricToneSchema.optional(),
});

export const responseMetaDtoSchema = z.object({
  generatedAt: isoTimestampSchema,
});

export const paginationMetaDtoSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(MAX_PAGE_SIZE),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});

export const listQueryDtoSchema = z.object({
  page: z.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  q: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  sortBy: z.string().trim().min(1).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  tick: z.number().int().nonnegative().optional(),
});

export const pollingMetaDtoSchema = z.object({
  intervalMs: z.number().int().positive().default(DEFAULT_POLLING_INTERVAL_MS),
  tick: z.number().int().nonnegative(),
  terminal: z.boolean(),
});

export const apiErrorDtoSchema = z.object({
  code: nonEmptyStringSchema,
  message: nonEmptyStringSchema,
  details: nonEmptyStringSchema.optional(),
});
