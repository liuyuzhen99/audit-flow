import { describe, expect, it, vi } from "vitest";

import { getArtistsDashboard } from "@/lib/api/artists";
import { getLibraryDashboard } from "@/lib/api/library";
import { getPipelineDashboard } from "@/lib/api/pipeline";
import { getQueueDashboard } from "@/lib/api/queue";
import { getReportDetail } from "@/lib/api/reports";

function createFetchMock(payload: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => payload,
  });
}

describe("module api clients", () => {
  it("fetches artists dashboard data", async () => {
    const fetchMock = createFetchMock({ summary: [], items: [], meta: { generatedAt: "2026-04-09T10:00:00.000Z" } });

    await getArtistsDashboard({ fetcher: fetchMock, query: { q: "M83" } });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/artists?q=M83", undefined);
  });

  it("fetches queue dashboard data with tick", async () => {
    const fetchMock = createFetchMock({
      summary: [],
      items: [],
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
      polling: { intervalMs: 4000, tick: 2, terminal: false },
    });

    await getQueueDashboard({ fetcher: fetchMock, query: { tick: 2 } });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/queue?tick=2", undefined);
  });

  it("fetches pipeline dashboard data with tick", async () => {
    const fetchMock = createFetchMock({
      summary: [],
      jobs: [],
      activeJob: null,
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
      polling: { intervalMs: 4000, tick: 2, terminal: false },
    });

    await getPipelineDashboard({ fetcher: fetchMock, query: { tick: 2 } });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/pipeline?tick=2", undefined);
  });

  it("fetches library dashboard data", async () => {
    const fetchMock = createFetchMock({ summary: [], items: [], meta: { generatedAt: "2026-04-09T10:00:00.000Z" } });

    await getLibraryDashboard({ fetcher: fetchMock });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/library", undefined);
  });

  it("fetches report detail data", async () => {
    const fetchMock = createFetchMock({
      report: {
        id: "report-1",
        queueItemId: "queue-1",
        title: "Midnight City Audit Report",
        status: "completed",
        createdAt: "2026-04-09T10:00:00.000Z",
        ruleHits: [],
        timeline: [],
      },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    });

    await getReportDetail({ fetcher: fetchMock, reportId: "report-1" });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/reports?id=report-1", undefined);
  });
});
