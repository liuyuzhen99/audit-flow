import { describe, expect, it } from "vitest";

import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { adaptLibraryDashboard } from "@/lib/adapters/library";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { adaptReportDetail } from "@/lib/adapters/reports";
import { getReportDetailResponse } from "@/lib/mocks/sources/reports";

describe("dashboard adapters", () => {
  it("adapts artists dashboard data", () => {
    const viewModel = adaptArtistsDashboard({
      items: [
        {
          id: "artist-1",
          name: "M83",
          status: "active",
          youtubeChannelId: "UC_M83",
          youtubeChannelLabel: "UC_M83",
          syncStatus: "completed",
          lastSyncStartedAt: "2026-04-09T09:55:00.000Z",
          lastSyncCompletedAt: "2026-04-09T10:00:00.000Z",
          lastSyncError: null,
          candidateCount: 2,
          partialFailure: false,
          emptyState: false,
          retryMetadata: {
            canResync: true,
            latestRetryCount: 0,
            latestFailureReason: null,
          },
          sourceHealth: {},
          latestCandidate: null,
          latestRun: null,
        },
      ],
      stats: {
        totalArtists: 12,
        visibleArtists: 1,
        totalCompletedArtists: 8,
        visibleCompletedArtists: 1,
        totalFailedArtists: 2,
        visibleFailedArtists: 0,
        totalCandidates: 10,
        visibleCandidates: 2,
      },
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    });

    expect(viewModel.rows[0]?.syncStatusLabel).toBeTruthy();
    expect(viewModel.rows[0]?.candidateLabel).toBe("2 candidates");
    expect(viewModel.summary[1]).toMatchObject({
      label: "Completed in View",
      value: "1",
      hint: "1 of 8 total artists",
    });
    expect(viewModel.summary[3]).toMatchObject({
      label: "Candidates in View",
      value: "2",
      hint: "2 of 10 total candidates",
    });
  });

  it("adapts queue dashboard data for phase 4 review rows", () => {
    const viewModel = adaptQueueDashboard({
      summary: [{ id: "pending", label: "Pending Reviews", value: "1", hint: "Single-candidate smoke run", tone: "warning" }],
      items: [
        {
          reviewId: "review-1",
          artistId: "artist-1",
          artistName: "M83",
          candidateId: "candidate-1",
          candidateTitle: "Midnight City",
          reviewType: "manual_review",
          status: "pending",
          version: 2,
          queuedAt: "2026-04-09T10:05:00.000Z",
          publishedAt: "2026-04-09T09:00:00.000Z",
          sourceUrl: "https://example.com/watch?v=midnight-city",
        },
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:06:00.000Z" },
      polling: { intervalMs: 4000, tick: 2, terminal: false },
    });

    expect(viewModel.rows[0]?.reviewTypeLabel).toBe("Manual Review");
    expect(viewModel.rows[0]?.versionLabel).toBe("v2");
    expect(viewModel.polling.tick).toBe(2);
  });

  it("adapts pipeline dashboard data for phase 4 workflow rows", () => {
    const viewModel = adaptPipelineDashboard({
      summary: [{ id: "in-flight", label: "Tracked Candidates", value: "1", hint: "Single-candidate smoke run", tone: "info" }],
      items: [
        {
          candidateId: "candidate-1",
          artistId: "artist-1",
          artistName: "M83",
          candidateTitle: "Midnight City",
          workflowStatus: "pending_review",
          currentStage: "manual_review",
          stages: [
            { stage: "transcript_review", status: "approved" },
            { stage: "manual_review", status: "pending" },
          ],
          translation: { status: "pending", updatedAt: "2026-04-09T10:05:00.000Z" },
          lastUpdatedAt: "2026-04-09T10:05:00.000Z",
        },
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      meta: { generatedAt: "2026-04-09T10:06:00.000Z" },
      polling: { intervalMs: 4000, tick: 3, terminal: false },
    });

    expect(viewModel.rows[0]?.workflowStatusLabel).toBeTruthy();
    expect(viewModel.rows[0]?.stages.length).toBe(2);
    expect(viewModel.polling.tick).toBe(3);
  });

  it("adapts library dashboard data for accepted assets", () => {
    const viewModel = adaptLibraryDashboard({
      summary: [{ id: "accepted", label: "Accepted Assets", value: "1", hint: "Phase 4 library feed", tone: "success" }],
      items: [
        {
          id: "asset-1",
          artistId: "artist-1",
          artistName: "M83",
          title: "Midnight City (Approved)",
          sourceUrl: "https://example.com/watch?v=midnight-city",
          approvedAt: "2026-04-09T10:06:00.000Z",
          approvedBy: "reviewer-1",
          status: "accepted",
        },
      ],
      meta: { generatedAt: "2026-04-09T10:06:00.000Z" },
    });

    expect(viewModel.cards[0]?.statusLabel).toBe("Accepted");
    expect(viewModel.cards[0]?.approvedByLabel).toBe("reviewer-1");
    expect(viewModel.summary[0]?.value).toBe("1");
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
