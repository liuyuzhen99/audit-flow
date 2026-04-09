import { describe, expect, it } from "vitest";

import { simulatePipelineJobDetail, simulatePipelineJobs } from "@/lib/mocks/simulators/pipeline";

describe("pipeline simulator", () => {
  it("advances stages deterministically", () => {
    const detail = simulatePipelineJobDetail(
      {
        id: "job-1",
        title: "Midnight City (M83) - Video Generation",
        sourceTitle: "Midnight City",
        artistName: "M83",
        startedAtStep: 0,
        failAtStep: null,
        startedAt: "2026-04-09T10:00:00.000Z",
      },
      2,
    );

    expect(detail.status).toBe("running");
    expect(detail.currentStageId).toBe("job-1-stage-3");
    expect(detail.logs).toHaveLength(3);
  });

  it("stops completed jobs from moving backward", () => {
    const detail = simulatePipelineJobDetail(
      {
        id: "job-2",
        title: "Complete Job",
        sourceTitle: "Complete Job",
        artistName: "M83",
        startedAtStep: 5,
        failAtStep: null,
        startedAt: "2026-04-09T10:00:00.000Z",
      },
      10,
    );

    expect(detail.status).toBe("completed");
    expect(detail.stages.at(-1)?.status).toBe("completed");
  });

  it("supports deterministic failure branches", () => {
    const detail = simulatePipelineJobDetail(
      {
        id: "job-3",
        title: "Failed Job",
        sourceTitle: "Failed Job",
        artistName: "M83",
        startedAtStep: 1,
        failAtStep: 3,
        startedAt: "2026-04-09T10:00:00.000Z",
      },
      2,
    );

    expect(detail.status).toBe("failed");
    expect(detail.deliverables[0]?.status).toBe("blocked");
  });

  it("returns stable results for the same tick", () => {
    const jobs = [
      {
        id: "job-1",
        title: "Midnight City (M83) - Video Generation",
        sourceTitle: "Midnight City",
        artistName: "M83",
        startedAtStep: 0,
        failAtStep: null,
        startedAt: "2026-04-09T10:00:00.000Z",
      },
    ];

    expect(simulatePipelineJobs(jobs, 3)).toEqual(simulatePipelineJobs(jobs, 3));
  });
});
