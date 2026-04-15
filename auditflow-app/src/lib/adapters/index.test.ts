import { describe, expect, it } from "vitest";

import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { adaptLibraryDashboard, adaptLibraryAssetDetail } from "@/lib/adapters/library";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { adaptReportDetail } from "@/lib/adapters/reports";
import { buildArtistsDashboardResponse } from "@/lib/mocks/sources/artists";
import { buildLibraryDashboardResponse, getLibraryAssetDetail } from "@/lib/mocks/sources/library";
import { buildPipelineDashboardResponse } from "@/lib/mocks/sources/pipeline";
import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";
import { getReportDetailResponse } from "@/lib/mocks/sources/reports";

describe("dashboard adapters", () => {
  it("adapts artists dashboard data", () => {
    const viewModel = adaptArtistsDashboard(buildArtistsDashboardResponse());

    expect(viewModel.rows[0]?.statusLabel).toBeTruthy();
    expect(viewModel.summary[0]?.label).toBeTruthy();
  });

  it("adapts queue dashboard data", () => {
    const viewModel = adaptQueueDashboard(buildQueueDashboardResponse({ tick: 2 }));

    expect(viewModel.rows[0]?.progressPercent).toBeGreaterThanOrEqual(0);
    expect(viewModel.polling.tick).toBe(2);
  });

  it("adapts queue rows with reportId", () => {
    const viewModel = adaptQueueDashboard(buildQueueDashboardResponse({ tick: 10 }));
    const approvedRow = viewModel.rows.find((row) => row.id === "queue-1");

    expect(approvedRow?.reportId).toBe("report-101");
  });

  it("adapts pipeline dashboard data", () => {
    const viewModel = adaptPipelineDashboard(buildPipelineDashboardResponse({ tick: 2 }));

    expect(viewModel.activeJob?.stages.length).toBeGreaterThan(0);
    expect(viewModel.jobs[0]?.statusLabel).toBeTruthy();
  });

  it("adapts pipeline log entries with tick field", () => {
    const viewModel = adaptPipelineDashboard(buildPipelineDashboardResponse({ tick: 3 }));
    const firstLog = viewModel.activeJob?.logs[0];

    expect(typeof firstLog?.tick).toBe("number");
  });

  it("adapts pipeline deliverables with assetId", () => {
    const viewModel = adaptPipelineDashboard(buildPipelineDashboardResponse({ tick: 2 }));
    const deliverable = viewModel.activeJob?.deliverables[0];

    expect("assetId" in (deliverable ?? {})).toBe(true);
  });

  it("adapts library dashboard data", () => {
    const viewModel = adaptLibraryDashboard(buildLibraryDashboardResponse());

    expect(viewModel.cards[0]?.statusLabel).toBeTruthy();
    expect(viewModel.summary[0]?.value).toBeTruthy();
  });

  it("adapts library asset detail with linked report and media metadata", () => {
    const asset = getLibraryAssetDetail("asset-1");
    const viewModel = adaptLibraryAssetDetail(asset!);

    expect(viewModel.title).toBe("Midnight City (Audited Mix)");
    expect(viewModel.durationLabel).toBe("04:03");
    expect(viewModel.versions.length).toBeGreaterThan(0);
    expect(viewModel.mediaPlayer.title).toBeTruthy();
    expect(viewModel.reportSummary?.href).toBe("/reports/report-101");
    expect(viewModel.auditSections).not.toBeNull();
  });

  it("adapts library asset detail with empty versions gracefully", () => {
    const asset = getLibraryAssetDetail("asset-4");
    const viewModel = adaptLibraryAssetDetail(asset!);

    expect(viewModel.versions).toHaveLength(0);
    expect(viewModel.statusLabel).toBeTruthy();
    expect(viewModel.mediaPlayer.fallbackTitle).toBeTruthy();
    expect(viewModel.reportSummary).toBeNull();
  });

  it("adapts canonical report detail sections", () => {
    const response = getReportDetailResponse("report-101");
    const viewModel = adaptReportDetail(response.report);

    expect(viewModel.header.title).toBe("Midnight City Audit Report");
    expect(viewModel.ruleHits.items.length).toBeGreaterThan(0);
    expect(viewModel.timeline.items.length).toBeGreaterThan(0);
    expect(viewModel.comments.items.length).toBeGreaterThan(0);
    expect(viewModel.relatedAsset?.href).toBe("/library/asset-1");
  });

  it("adapts report detail empty comments state", () => {
    const response = getReportDetailResponse("report-102");
    const viewModel = adaptReportDetail(response.report);

    expect(viewModel.comments.items).toHaveLength(0);
    expect(viewModel.comments.emptyDescription).toContain("No reviewer comments");
  });
});
