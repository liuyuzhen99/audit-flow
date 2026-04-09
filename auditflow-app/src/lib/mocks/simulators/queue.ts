import type { QueueItemDto, QueueStatus } from "@/types/queue";

import type { QueueSeedRecord } from "@/lib/mocks/data/queue";

const queueTimeline: QueueStatus[] = ["queued", "downloading", "auditing", "autoApproved"];

function getQueueStatusAtStep(seed: QueueSeedRecord, tick: number): QueueStatus {
  const step = seed.startedAtStep + tick;

  if (seed.transitionPath === "manualReview") {
    if (step <= 0) {
      return "queued";
    }

    if (step === 1) {
      return "downloading";
    }

    if (step === 2) {
      return "auditing";
    }

    return "manualReview";
  }

  if (seed.transitionPath === "rejected") {
    if (step <= 0) {
      return "queued";
    }

    if (step === 1) {
      return "downloading";
    }

    if (step === 2) {
      return "auditing";
    }

    return "autoRejected";
  }

  const normalizedStep = Math.min(Math.max(step, 0), queueTimeline.length - 1);
  return queueTimeline[normalizedStep] ?? "queued";
}

function getQueueProgress(status: QueueStatus): QueueItemDto["progress"] {
  switch (status) {
    case "queued":
      return { percent: 10, label: "Queued for download" };
    case "downloading":
      return { percent: 35, label: "Downloading source assets" };
    case "auditing":
      return { percent: 65, label: "Audit score 65%" };
    case "autoApproved":
      return { percent: 100, label: "Audit score 100%" };
    case "manualReview":
      return { percent: 100, label: "Routed to manual review" };
    case "autoRejected":
      return { percent: 100, label: "Rejected by rule engine" };
  }
}

function getAuditDecision(status: QueueStatus): QueueItemDto["auditDecision"] {
  switch (status) {
    case "queued":
    case "downloading":
    case "auditing":
      return {
        status: "pending",
        confidenceScore: null,
        ruleSummary: status === "auditing" ? "Scanning content fingerprints" : "Preparing audit inputs",
      };
    case "autoApproved":
      return {
        status: "approved",
        confidenceScore: 98,
        ruleSummary: "No rights conflicts, audio quality verified",
      };
    case "manualReview":
      return {
        status: "manualReview",
        confidenceScore: 72,
        ruleSummary: "Potential crowd noise detected",
      };
    case "autoRejected":
      return {
        status: "rejected",
        confidenceScore: 34,
        ruleSummary: "Blocked by duplicate ownership fingerprint",
      };
  }
}

function getUpdatedAt(submittedAt: string, tick: number): string {
  const submittedDate = new Date(submittedAt);
  submittedDate.setMinutes(submittedDate.getMinutes() + tick * 2);
  return submittedDate.toISOString();
}

export function simulateQueueItem(seed: QueueSeedRecord, tick: number): QueueItemDto {
  const status = getQueueStatusAtStep(seed, tick);

  return {
    id: seed.id,
    title: seed.title,
    artistName: seed.artistName,
    coverArtUrl: seed.coverArtUrl,
    status,
    auditDecision: getAuditDecision(status),
    progress: getQueueProgress(status),
    submittedAt: seed.submittedAt,
    updatedAt: getUpdatedAt(seed.submittedAt, tick),
  };
}

export function simulateQueueItems(seeds: QueueSeedRecord[], tick: number): QueueItemDto[] {
  return seeds.map((seed) => simulateQueueItem(seed, tick));
}
