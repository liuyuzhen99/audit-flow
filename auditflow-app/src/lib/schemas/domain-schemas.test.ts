import { describe, expect, it } from "vitest";

import { artistsDashboardResponseDtoSchema, artistDtoSchema } from "@/lib/schemas/artist";
import { libraryAssetDtoSchema, libraryDashboardResponseDtoSchema } from "@/lib/schemas/library";
import { pipelineDashboardResponseDtoSchema, pipelineItemDtoSchema } from "@/lib/schemas/pipeline";
import { queueDashboardResponseDtoSchema, queueItemDtoSchema, reviewDecisionResponseDtoSchema } from "@/lib/schemas/queue";
import { auditReportDtoSchema, reportDetailResponseDtoSchema } from "@/lib/schemas/report";

describe("artist schema", () => {
  it("parses a valid artist dto", () => {
    const parsed = artistDtoSchema.parse({
      id: "artist-1",
      name: "M83",
      status: "active",
      youtubeChannelId: "UC_M83",
      youtubeChannelLabel: "UC_M83",
      syncStatus: "completed",
      lastSyncStartedAt: "2026-04-09T09:55:00.000Z",
      lastSyncCompletedAt: "2026-04-09T10:00:00.000Z",
      lastSyncError: null,
      candidateCount: 3,
      partialFailure: false,
      emptyState: false,
      retryMetadata: {
        canResync: true,
        latestRetryCount: 0,
        latestFailureReason: null,
      },
      sourceHealth: {
        youtube_rss: {
          status: "completed",
          retryCount: 0,
          failureReason: null,
          startedAt: "2026-04-09T09:55:00.000Z",
          completedAt: "2026-04-09T10:00:00.000Z",
          discoveredCount: 3,
        },
      },
      latestCandidate: null,
      latestRun: null,
    });

    expect(parsed.syncStatus).toBe("completed");
  });

  it("parses an artist dashboard response", () => {
    const parsed = artistsDashboardResponseDtoSchema.parse({
      stats: {
        totalArtists: 12,
        visibleArtists: 0,
        totalCompletedArtists: 8,
        visibleCompletedArtists: 0,
        totalFailedArtists: 2,
        visibleFailedArtists: 0,
        totalCandidates: 10,
        visibleCandidates: 0,
      },
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
      },
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
    });

    expect(parsed.items).toEqual([]);
  });
});

describe("queue schema", () => {
  it("parses a valid phase 4 queue item dto", () => {
    const parsed = queueItemDtoSchema.parse({
      reviewId: "review-1",
      artistId: "artist-1",
      artistName: "M83",
      candidateId: "candidate-1",
      candidateTitle: "Midnight City",
      reviewType: "manual_review",
      status: "pending",
      version: 3,
      queuedAt: "2026-04-09T10:00:00.000Z",
      publishedAt: "2026-04-09T09:30:00.000Z",
      sourceUrl: "https://example.com/watch?v=midnight-city",
    });

    expect(parsed.version).toBe(3);
  });

  it("parses a queue dashboard response", () => {
    const parsed = queueDashboardResponseDtoSchema.parse({
      summary: [],
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
      },
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
      polling: {
        intervalMs: 4000,
        tick: 1,
        terminal: false,
      },
    });

    expect(parsed.polling.tick).toBe(1);
  });

  it("parses a review decision response", () => {
    const parsed = reviewDecisionResponseDtoSchema.parse({
      reviewId: "review-1",
      status: "approved",
      version: 4,
      subjectId: "candidate-1",
      candidateStatus: "accepted",
      nextReviewId: null,
      nextReviewType: null,
      decidedAt: "2026-04-09T10:06:00.000Z",
    });

    expect(parsed.status).toBe("approved");
  });
});

describe("pipeline schema", () => {
  it("parses a valid phase 4 pipeline item dto", () => {
    const parsed = pipelineItemDtoSchema.parse({
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
      translation: {
        status: "pending",
        updatedAt: "2026-04-09T10:05:00.000Z",
      },
      lastUpdatedAt: "2026-04-09T10:05:00.000Z",
    });

    expect(parsed.translation.status).toBe("pending");
  });

  it("parses a pipeline dashboard response", () => {
    const parsed = pipelineDashboardResponseDtoSchema.parse({
      summary: [],
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
      },
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
      polling: {
        intervalMs: 4000,
        tick: 2,
        terminal: false,
      },
    });

    expect(parsed.polling.tick).toBe(2);
  });
});

describe("library schema", () => {
  it("parses a valid phase 4 library asset dto", () => {
    const parsed = libraryAssetDtoSchema.parse({
      id: "asset-1",
      artistId: "artist-1",
      artistName: "M83",
      title: "Midnight City (Accepted)",
      sourceUrl: "https://example.com/watch?v=midnight-city",
      approvedAt: "2026-04-09T10:00:00.000Z",
      approvedBy: "reviewer-1",
      status: "accepted",
      artifactStatus: "ready",
      artifacts: [],
    });

    expect(parsed.status).toBe("accepted");
  });

  it("parses a library dashboard response", () => {
    const parsed = libraryDashboardResponseDtoSchema.parse({
      summary: [],
      items: [],
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
    });

    expect(parsed.summary).toEqual([]);
  });
});

describe("report schema", () => {
  it("parses a minimal audit report dto", () => {
    const parsed = auditReportDtoSchema.parse({
      id: "report-1",
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
        completedAt: null,
      },
      linkedAsset: null,
      media: {
        playbackUrl: null,
        posterUrl: null,
        mimeType: null,
      },
      ruleHits: [],
      timeline: [],
      comments: [],
    });

    expect(parsed.id).toBe("report-1");
  });

  it("parses a report detail response", () => {
    const parsed = reportDetailResponseDtoSchema.parse({
      report: {
        id: "report-1",
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
        linkedAsset: null,
        media: {
          playbackUrl: null,
          posterUrl: null,
          mimeType: null,
        },
        ruleHits: [],
        timeline: [],
        comments: [],
      },
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
    });

    expect(parsed.report.summary.decisionStatus).toBe("approved");
  });
});
