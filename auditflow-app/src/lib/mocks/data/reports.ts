import type { AuditReportDto } from "@/types/audit-report";

export const reportSeedRecords: AuditReportDto[] = [
  {
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
    ruleHits: [
      {
        id: "rule-hit-101-1",
        ruleName: "Rights fingerprint",
        severity: "low",
        description: "No duplicate ownership fingerprint detected.",
      },
      {
        id: "rule-hit-101-2",
        ruleName: "Lyric confidence",
        severity: "medium",
        description: "One slang segment was flagged for translator verification.",
      },
      {
        id: "rule-hit-101-3",
        ruleName: "Audio stabilization",
        severity: "low",
        description: "Background-noise suppression remained within the approved threshold.",
      },
    ],
    timeline: [
      {
        id: "timeline-101-1",
        timestamp: "2026-04-09T10:01:00.000Z",
        title: "Download completed",
        description: "Source assets downloaded successfully.",
      },
      {
        id: "timeline-101-2",
        timestamp: "2026-04-09T10:03:00.000Z",
        title: "Transcript reviewed",
        description: "Transcript confidence exceeded the auto-review threshold.",
      },
      {
        id: "timeline-101-3",
        timestamp: "2026-04-09T10:05:00.000Z",
        title: "Rule engine completed",
        description: "All configured policy checks completed successfully.",
      },
      {
        id: "timeline-101-4",
        timestamp: "2026-04-09T10:06:00.000Z",
        title: "Audit approved",
        description: "Track passed the automatic audit checks and was routed to publishing.",
      },
    ],
    comments: [
      {
        id: "comment-101-1",
        authorName: "QA reviewer",
        createdAt: "2026-04-09T10:03:30.000Z",
        body: "Confirmed lyric alignment and background-noise suppression.",
      },
      {
        id: "comment-101-2",
        authorName: "Translation reviewer",
        createdAt: "2026-04-09T10:04:10.000Z",
        body: "Slang wording is approved for bilingual export.",
      },
    ],
  },
  {
    id: "report-102",
    queueItemId: "queue-2",
    title: "Levitating Audit Report",
    status: "flagged",
    createdAt: "2026-04-09T10:08:00.000Z",
    summary: {
      decisionStatus: "manualReview",
      confidenceScore: 72,
      ruleSummary: "Potential crowd noise detected in the chorus section.",
      durationSeconds: 230,
      transcriptLanguage: "English",
      completedAt: "2026-04-09T10:14:00.000Z",
    },
    linkedAsset: {
      assetId: "asset-3",
      title: "Levitating (Visualizer v2)",
      artistName: "Dua Lipa",
      status: "processing",
    },
    media: {
      playbackUrl: null,
      posterUrl: null,
      mimeType: null,
    },
    ruleHits: [
      {
        id: "rule-hit-102-1",
        ruleName: "Crowd noise",
        severity: "high",
        description: "Manual verification recommended before final export.",
      },
    ],
    timeline: [
      {
        id: "timeline-102-1",
        timestamp: "2026-04-09T10:09:00.000Z",
        title: "Download completed",
        description: "Source assets downloaded successfully.",
      },
      {
        id: "timeline-102-2",
        timestamp: "2026-04-09T10:14:00.000Z",
        title: "Escalated to manual review",
        description: "The report requires a reviewer decision before publishing.",
      },
    ],
    comments: [],
  },
];
