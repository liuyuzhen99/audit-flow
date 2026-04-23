import { describe, expect, it } from "vitest";

import {
  getAuditDecisionPresentation,
  getArtistAuditPresentation,
  getLibraryStatusPresentation,
  getLegacyQueueStatusPresentation,
  getQueueStatusPresentation,
  getReviewTypePresentation,
} from "@/lib/status/audit";

describe("audit status presentation", () => {
  it("maps artist audit statuses", () => {
    expect(getArtistAuditPresentation("completed")).toEqual({
      label: "Completed",
      tone: "success",
    });
  });

  it("maps queue statuses", () => {
    expect(getQueueStatusPresentation("pending")).toEqual({
      label: "Pending",
      tone: "warning",
    });
  });

  it("maps legacy queue statuses for mock surfaces", () => {
    expect(getLegacyQueueStatusPresentation("manualReview")).toEqual({
      label: "Manual review",
      tone: "warning",
    });
  });

  it("maps review types", () => {
    expect(getReviewTypePresentation("manual_review")).toEqual({
      label: "Manual Review",
      tone: "warning",
    });
  });

  it("maps audit decision statuses", () => {
    expect(getAuditDecisionPresentation("rejected")).toEqual({
      label: "Auto-rejected",
      tone: "danger",
    });
  });

  it("maps library statuses", () => {
    expect(getLibraryStatusPresentation("processing")).toEqual({
      label: "Processing",
      tone: "info",
    });
  });
});
