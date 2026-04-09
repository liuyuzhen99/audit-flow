import { describe, expect, it } from "vitest";

import {
  getDeliverableStatusPresentation,
  getPipelineRunStatusPresentation,
  getPipelineStageStatusPresentation,
  isTerminalPipelineRunStatus,
} from "@/lib/status/pipeline";

describe("pipeline status presentation", () => {
  it("maps run statuses", () => {
    expect(getPipelineRunStatusPresentation("running")).toEqual({
      label: "Running",
      tone: "info",
    });
  });

  it("maps stage statuses", () => {
    expect(getPipelineStageStatusPresentation("completed")).toEqual({
      label: "Done",
      tone: "success",
    });
  });

  it("maps deliverable statuses", () => {
    expect(getDeliverableStatusPresentation("blocked")).toEqual({
      label: "Blocked",
      tone: "danger",
    });
  });

  it("identifies terminal run states", () => {
    expect(isTerminalPipelineRunStatus("completed")).toBe(true);
    expect(isTerminalPipelineRunStatus("failed")).toBe(true);
    expect(isTerminalPipelineRunStatus("running")).toBe(false);
  });
});
