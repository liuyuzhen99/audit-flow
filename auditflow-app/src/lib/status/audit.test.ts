import { describe, expect, it } from "vitest";

import {
  getAuditDecisionPresentation,
  getArtistAuditPresentation,
  getLibraryStatusPresentation,
  getQueueStatusPresentation,
} from "@/lib/status/audit";

describe("audit status presentation", () => {
  it("maps artist audit statuses", () => {
    expect(getArtistAuditPresentation("autoApproved")).toEqual({
      label: "Auto-approved",
      tone: "success",
    });
  });

  it("maps queue statuses", () => {
    expect(getQueueStatusPresentation("manualReview")).toEqual({
      label: "Manual review",
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
