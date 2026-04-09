import { describe, expect, it } from "vitest";

import { simulateQueueItem, simulateQueueItems } from "@/lib/mocks/simulators/queue";

describe("queue simulator", () => {
  it("moves items forward deterministically", () => {
    const item = simulateQueueItem(
      {
        id: "queue-1",
        title: "Midnight City",
        artistName: "M83",
        coverArtUrl: null,
        startedAtStep: 0,
        transitionPath: "approved",
        submittedAt: "2026-04-09T10:00:00.000Z",
      },
      2,
    );

    expect(item.status).toBe("auditing");
    expect(item.progress.percent).toBe(65);
  });

  it("keeps terminal approved items terminal", () => {
    const item = simulateQueueItem(
      {
        id: "queue-2",
        title: "Levitating",
        artistName: "Dua Lipa",
        coverArtUrl: null,
        startedAtStep: 3,
        transitionPath: "approved",
        submittedAt: "2026-04-09T10:00:00.000Z",
      },
      5,
    );

    expect(item.status).toBe("autoApproved");
    expect(item.progress.percent).toBe(100);
  });

  it("supports manual review and rejection branches", () => {
    const manualReviewItem = simulateQueueItem(
      {
        id: "queue-3",
        title: "Starboy",
        artistName: "The Weeknd",
        coverArtUrl: null,
        startedAtStep: 2,
        transitionPath: "manualReview",
        submittedAt: "2026-04-09T10:00:00.000Z",
      },
      1,
    );

    const rejectedItem = simulateQueueItem(
      {
        id: "queue-4",
        title: "Bad Guy",
        artistName: "Billie Eilish",
        coverArtUrl: null,
        startedAtStep: 2,
        transitionPath: "rejected",
        submittedAt: "2026-04-09T10:00:00.000Z",
      },
      1,
    );

    expect(manualReviewItem.status).toBe("manualReview");
    expect(rejectedItem.status).toBe("autoRejected");
  });

  it("returns stable results for the same tick", () => {
    const items = [
      {
        id: "queue-1",
        title: "Midnight City",
        artistName: "M83",
        coverArtUrl: null,
        startedAtStep: 0,
        transitionPath: "approved" as const,
        submittedAt: "2026-04-09T10:00:00.000Z",
      },
    ];

    expect(simulateQueueItems(items, 2)).toEqual(simulateQueueItems(items, 2));
  });
});
