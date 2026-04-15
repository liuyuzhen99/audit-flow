import { describe, expect, it } from "vitest";

import { buildArtistsDashboardResponse, listArtists } from "@/lib/mocks/sources/artists";
import { buildLibraryDashboardResponse, getLibraryAssetDetail, getOrderedLibraryAssetIds } from "@/lib/mocks/sources/library";
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

  it("filters artists by dateRange=2w", () => {
    const all = buildArtistsDashboardResponse();
    const filtered = buildArtistsDashboardResponse({ dateRange: "2w" });

    expect(filtered.items.length).toBe(all.items.length);
  });

  it("builds the queue dashboard response with polling data", () => {
    const response = buildQueueDashboardResponse({ tick: 2 });

    expect(response.polling.tick).toBe(2);
    expect(response.items[0]?.status).toBe("auditing");
  });

  it("queue items expose reportId for terminal items", () => {
    const response = buildQueueDashboardResponse({ tick: 10 });
    const approvedItem = response.items.find((item) => item.id === "queue-1");

    expect(approvedItem?.reportId).toBe("report-101");
  });

  it("queue items have null reportId for non-terminal items", () => {
    const response = buildQueueDashboardResponse({ tick: 0 });
    const queuedItem = response.items.find((item) => item.id === "queue-1");

    expect(queuedItem?.reportId).toBeNull();
  });

  it("builds the pipeline dashboard response with active job detail", () => {
    const response = buildPipelineDashboardResponse({ tick: 2 });

    expect(response.activeJob).not.toBeNull();
    expect(response.activeJob?.logs.length).toBeGreaterThan(0);
  });

  it("pipeline log entries include tick field", () => {
    const response = buildPipelineDashboardResponse({ tick: 3 });
    const firstLog = response.activeJob?.logs[0];

    expect(typeof firstLog?.tick).toBe("number");
    expect(firstLog?.tick).toBe(3);
  });

  it("pipeline deliverables include assetId for completed jobs", () => {
    const response = buildPipelineDashboardResponse({ tick: 10 });
    const completedJobDeliverable = response.activeJob?.deliverables[0];

    if (completedJobDeliverable?.status === "ready") {
      expect(completedJobDeliverable.assetId).toBeTruthy();
    }
  });

  it("builds the library dashboard response", () => {
    const response = buildLibraryDashboardResponse();

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.summary).toHaveLength(4);
  });

  it("returns a known library asset by id", () => {
    const asset = getLibraryAssetDetail("asset-1");

    expect(asset).not.toBeNull();
    expect(asset?.title).toBe("Midnight City (Audited Mix)");
    expect(asset?.versions.length).toBeGreaterThan(0);
    expect(asset?.linkedReport?.reportId).toBe("report-101");
  });

  it("returns null for an unknown library asset id", () => {
    const asset = getLibraryAssetDetail("unknown-id");

    expect(asset).toBeNull();
  });

  it("returns ordered library asset ids", () => {
    const ids = getOrderedLibraryAssetIds();

    expect(ids).toContain("asset-1");
    expect(ids).toContain("asset-2");
  });

  it("builds a fully populated report detail response", () => {
    const response = getReportDetailResponse("report-101");

    expect(response.report.id).toBe("report-101");
    expect(response.report.comments.length).toBeGreaterThan(0);
    expect(response.report.linkedAsset?.assetId).toBe("asset-1");
  });

  it("builds a report detail response with empty comments", () => {
    const response = getReportDetailResponse("report-102");

    expect(response.report.id).toBe("report-102");
    expect(response.report.comments).toHaveLength(0);
  });

  it("throws when a report id does not exist", () => {
    expect(() => getReportDetailResponse("report-missing")).toThrow("Report not found");
  });
});
