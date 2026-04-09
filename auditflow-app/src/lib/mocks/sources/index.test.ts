import { describe, expect, it } from "vitest";

import { buildArtistsDashboardResponse, listArtists } from "@/lib/mocks/sources/artists";
import { buildLibraryDashboardResponse } from "@/lib/mocks/sources/library";
import { buildPipelineDashboardResponse } from "@/lib/mocks/sources/pipeline";
import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";
import { getReportDetailResponse } from "@/lib/mocks/sources/reports";

describe("mock sources", () => {
  it("builds the artists dashboard response", () => {
    const response = buildArtistsDashboardResponse();

    expect(response.summary).toHaveLength(4);
    expect(response.items.length).toBeGreaterThan(0);
  });

  it("filters artists lists by query", () => {
    const response = listArtists({ page: 1, pageSize: 10, q: "Weeknd" });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.name).toBe("The Weeknd");
  });

  it("builds the queue dashboard response with polling data", () => {
    const response = buildQueueDashboardResponse({ tick: 2 });

    expect(response.polling.tick).toBe(2);
    expect(response.items[0]?.status).toBe("auditing");
  });

  it("builds the pipeline dashboard response with active job detail", () => {
    const response = buildPipelineDashboardResponse({ tick: 2 });

    expect(response.activeJob).not.toBeNull();
    expect(response.activeJob?.logs.length).toBeGreaterThan(0);
  });

  it("builds the library dashboard response", () => {
    const response = buildLibraryDashboardResponse();

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.summary).toHaveLength(4);
  });

  it("builds the report detail response", () => {
    const response = getReportDetailResponse("report-1");

    expect(response.report.id).toBe("report-1");
  });
});
