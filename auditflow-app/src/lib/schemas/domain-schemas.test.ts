import { describe, expect, it } from "vitest";

import { artistsDashboardResponseDtoSchema, artistDtoSchema } from "@/lib/schemas/artist";
import { libraryAssetDtoSchema, libraryDashboardResponseDtoSchema } from "@/lib/schemas/library";
import { pipelineDashboardResponseDtoSchema, pipelineJobDetailDtoSchema } from "@/lib/schemas/pipeline";
import { queueDashboardResponseDtoSchema, queueItemDtoSchema } from "@/lib/schemas/queue";
import { auditReportDtoSchema, reportDetailResponseDtoSchema } from "@/lib/schemas/report";

describe("artist schema", () => {
  it("parses a valid artist dto", () => {
    const parsed = artistDtoSchema.parse({
      id: "artist-1",
      name: "M83",
      avatarUrl: null,
      spotifyFollowers: 42100000,
      recentReleaseCount: 3,
      lastSyncedAt: "2026-04-09T10:00:00.000Z",
      channel: {
        id: "channel-1",
        name: "M83 Official",
        platform: "youtube",
      },
      auditSnapshot: {
        status: "autoApproved",
        lastDecisionAt: "2026-04-09T09:55:00.000Z",
        flaggedReleaseCount: 0,
      },
    });

    expect(parsed.auditSnapshot.status).toBe("autoApproved");
  });

  it("parses an artist dashboard response", () => {
    const parsed = artistsDashboardResponseDtoSchema.parse({
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
    });

    expect(parsed.items).toEqual([]);
  });
});

describe("queue schema", () => {
  it("parses a valid queue item dto", () => {
    const parsed = queueItemDtoSchema.parse({
      id: "queue-1",
      title: "Midnight City",
      artistName: "M83",
      coverArtUrl: null,
      status: "auditing",
      auditDecision: {
        status: "pending",
        confidenceScore: null,
        ruleSummary: "Scanning content fingerprints",
      },
      progress: {
        percent: 65,
        label: "Audit score 65%",
      },
      submittedAt: "2026-04-09T10:00:00.000Z",
      updatedAt: "2026-04-09T10:05:00.000Z",
    });

    expect(parsed.progress.percent).toBe(65);
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
});

describe("pipeline schema", () => {
  it("parses a valid pipeline job detail dto", () => {
    const parsed = pipelineJobDetailDtoSchema.parse({
      id: "job-1",
      title: "Midnight City (M83) - Video Generation",
      sourceTitle: "Midnight City",
      artistName: "M83",
      status: "running",
      currentStageId: "stage-2",
      elapsedSeconds: 300,
      estimatedRemainingSeconds: 120,
      stages: [
        {
          id: "stage-1",
          label: "Audio Transcode",
          status: "completed",
          progressPercent: 100,
        },
      ],
      logs: [
        {
          id: "log-1",
          timestamp: "2026-04-09T10:00:00.000Z",
          level: "info",
          message: "Task initialized",
        },
      ],
      deliverables: [
        {
          id: "asset-1",
          label: "Master Audio",
          status: "ready",
          description: "Ready for downstream access",
        },
      ],
    });

    expect(parsed.deliverables[0]?.status).toBe("ready");
  });

  it("parses a pipeline dashboard response", () => {
    const parsed = pipelineDashboardResponseDtoSchema.parse({
      summary: [],
      jobs: [],
      activeJob: null,
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
  it("parses a valid library asset dto", () => {
    const parsed = libraryAssetDtoSchema.parse({
      id: "asset-1",
      title: "Midnight City (Audited Mix)",
      artistName: "M83",
      thumbnailUrl: null,
      status: "published",
      resolution: "1080p",
      durationSeconds: 243,
      createdAt: "2026-04-09T10:00:00.000Z",
      metadata: {
        sourceStatus: "completed",
      },
      versions: [],
    });

    expect(parsed.durationSeconds).toBe(243);
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
      ruleHits: [],
      timeline: [],
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
        ruleHits: [],
        timeline: [],
      },
      meta: {
        generatedAt: "2026-04-09T10:00:00.000Z",
      },
    });

    expect(parsed.report.status).toBe("completed");
  });
});
