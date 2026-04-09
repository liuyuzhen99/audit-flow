import { describe, expect, it } from "vitest";

import { DEFAULT_PAGE_SIZE, DEFAULT_POLLING_INTERVAL_MS, parseListQueryParams } from "@/types/api";
import { summaryMetricDtoSchema, listQueryDtoSchema, pollingMetaDtoSchema, responseMetaDtoSchema } from "@/lib/schemas/common";

describe("common contracts", () => {
  it("parses a valid summary metric dto", () => {
    const parsed = summaryMetricDtoSchema.parse({
      id: "metric-1",
      label: "Active Tasks",
      value: "24",
      hint: "Realtime updates",
      tone: "info",
    });

    expect(parsed.label).toBe("Active Tasks");
    expect(parsed.tone).toBe("info");
  });

  it("rejects an invalid summary metric tone", () => {
    expect(() =>
      summaryMetricDtoSchema.parse({
        id: "metric-1",
        label: "Active Tasks",
        value: "24",
        tone: "purple",
      }),
    ).toThrow();
  });

  it("parses valid list query params with defaults", () => {
    const parsed = parseListQueryParams(new URLSearchParams("q=midnight&status=running"));

    expect(parsed).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      q: "midnight",
      status: "running",
    });
  });

  it("normalizes invalid list query params to safe defaults", () => {
    const parsed = parseListQueryParams(new URLSearchParams("page=0&pageSize=999&q=   "));

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(parsed.q).toBeUndefined();
  });

  it("accepts explicit query dto values", () => {
    const parsed = listQueryDtoSchema.parse({
      page: 2,
      pageSize: 10,
      q: "m83",
      status: "completed",
      sortBy: "updatedAt",
      sortDirection: "desc",
      tick: 3,
    });

    expect(parsed.page).toBe(2);
    expect(parsed.sortDirection).toBe("desc");
    expect(parsed.tick).toBe(3);
  });

  it("rejects invalid response meta timestamps", () => {
    expect(() =>
      responseMetaDtoSchema.parse({
        generatedAt: "not-an-iso-date",
      }),
    ).toThrow();
  });

  it("parses polling metadata", () => {
    const parsed = pollingMetaDtoSchema.parse({
      intervalMs: DEFAULT_POLLING_INTERVAL_MS,
      tick: 2,
      terminal: false,
    });

    expect(parsed.intervalMs).toBe(DEFAULT_POLLING_INTERVAL_MS);
    expect(parsed.tick).toBe(2);
    expect(parsed.terminal).toBe(false);
  });
});
