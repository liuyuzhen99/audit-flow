import { describe, expect, it, vi } from "vitest";

import { getArtistCandidates, getArtistsDashboard } from "@/lib/api/artists";
import { getLibraryDashboard } from "@/lib/api/library";
import { getPipelineDashboard, stopPipelineJob } from "@/lib/api/pipeline";
import { getQueueDashboard } from "@/lib/api/queue";
import { getReportDetail } from "@/lib/api/reports";

function createFetchMock(payload: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
}

describe("module api clients", () => {
  it("fetches artists dashboard data", async () => {
    const fetchMock = createFetchMock({
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    });

    await getArtistsDashboard({ fetcher: fetchMock, query: { q: "M83", status: "completed", sortBy: "updatedAt", sortDirection: "desc" } });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/artists?q=M83&status=completed&sortBy=updatedAt&sortDirection=desc",
      undefined,
    );
  });

  it("fetches artists dashboard data with an absolute base url for SSR", async () => {
    const fetchMock = createFetchMock({
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    });

    await getArtistsDashboard({
      baseUrl: "http://127.0.0.1:3000",
      fetcher: fetchMock,
      query: { q: "M83" },
    });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:3000/api/artists?q=M83", undefined);
  });

  it("fetches artist candidates with pagination and status filters", async () => {
    const fetchMock = createFetchMock({
      artistId: "artist-1",
      items: [],
      pagination: { page: 2, pageSize: 20, total: 0, totalPages: 1 },
    });

    await getArtistCandidates({
      fetcher: fetchMock,
      artistId: "artist-1",
      query: { page: 2, pageSize: 20, status: "pending_review" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/artists/artist-1/candidates?page=2&pageSize=20&status=pending_review",
      undefined,
    );
  });

  it("fetches artist candidates with an absolute base url for SSR", async () => {
    const fetchMock = createFetchMock({
      artistId: "artist-1",
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
    });

    await getArtistCandidates({
      artistId: "artist-1",
      baseUrl: "https://auditflow.test",
      fetcher: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledWith("https://auditflow.test/api/artists/artist-1/candidates", undefined);
  });

  it("fetches queue dashboard data with filters and tick", async () => {
    const fetchMock = createFetchMock({
      summary: [],
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
      polling: { intervalMs: 4000, tick: 2, terminal: false },
    });

    await getQueueDashboard({ fetcher: fetchMock, query: { q: "M83", status: "manualReview", tick: 2 } });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/queue?q=M83&status=manualReview&tick=2", undefined);
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

  it("fetches report detail data with expanded phase 5 fields", async () => {
    const fetchMock = createFetchMock({
      report: {
        id: "report-101",
        queueItemId: "queue-1",
        title: "Midnight City Audit Report",
        status: "completed",
        createdAt: "2026-04-09T10:00:00.000Z",
        summary: {
          decisionStatus: "approved",
          confidenceScore: 98,
          ruleSummary: "No rights conflicts, audio quality verified.",
          durationSeconds: 243,
          transcriptLanguage: "English",
          completedAt: "2026-04-09T10:06:00.000Z",
        },
        linkedAsset: {
          assetId: "asset-1",
          title: "Midnight City (Audited Mix)",
          artistName: "M83",
          status: "published",
        },
        media: {
          playbackUrl: "https://example.com/media/midnight-city.mp4",
          posterUrl: "https://example.com/posters/midnight-city.jpg",
          mimeType: "video/mp4",
        },
        ruleHits: [],
        timeline: [],
        comments: [],
      },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    });

    await getReportDetail({ fetcher: fetchMock, reportId: "report-101" });

    expect(fetchMock).toHaveBeenCalledWith("/api/mock/reports?id=report-101", undefined);
  });

  it("throws when report detail fetch returns a non-ok response", async () => {
    const fetchMock = createFetchMock({ message: "Report not found" }, false);

    await expect(getReportDetail({ fetcher: fetchMock, reportId: "report-missing" })).rejects.toThrow("Report not found");
  });

  it("posts stop pipeline job and returns typed response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, jobId: "job-1", message: "Job job-1 has been requested to stop." }),
    });

    const result = await stopPipelineJob({ fetcher: fetchMock, jobId: "job-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mock/pipeline/stop",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ jobId: "job-1" }) }),
    );
    expect(result.success).toBe(true);
    expect(result.jobId).toBe("job-1");
  });

  it("throws when stop pipeline job returns a non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Job not found" }),
    });

    await expect(stopPipelineJob({ fetcher: fetchMock, jobId: "job-99" })).rejects.toThrow("Job not found");
  });
});
