import type { AuditReportDto } from "@/types/audit-report";

export const reportSeedRecords: AuditReportDto[] = [
  {
    id: "report-1",
    queueItemId: "queue-1",
    title: "Midnight City Audit Report",
    status: "completed",
    createdAt: "2026-04-09T10:00:00.000Z",
    ruleHits: [
      {
        id: "rule-hit-1",
        ruleName: "Rights fingerprint",
        severity: "low",
        description: "No duplicate ownership fingerprint detected.",
      },
    ],
    timeline: [
      {
        id: "timeline-1",
        timestamp: "2026-04-09T10:01:00.000Z",
        title: "Download completed",
        description: "Source assets downloaded successfully.",
      },
      {
        id: "timeline-2",
        timestamp: "2026-04-09T10:05:00.000Z",
        title: "Audit approved",
        description: "Track passed automatic audit checks.",
      },
    ],
  },
];
