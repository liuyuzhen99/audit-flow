import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePollingResource = vi.fn();

vi.mock("@/hooks/use-polling-resource", () => ({
  usePollingResource: () => mockUsePollingResource(),
}));

describe("PipelineDashboardClient", () => {
  beforeEach(() => {
    mockUsePollingResource.mockReset();
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [{ label: "Active Jobs", value: "1", hint: "Processing", tone: "info" }],
        jobs: [
          {
            id: "job-1",
            title: "Midnight City Processing",
            statusLabel: "Running",
            statusTone: "warning",
            elapsedLabel: "03:12",
            remainingLabel: "01:48",
          },
        ],
        activeJob: {
          id: "job-1",
          title: "Midnight City Processing",
          statusLabel: "Running",
          statusTone: "warning",
          elapsedLabel: "03:12",
          remainingLabel: "01:48",
          stages: [
            { id: "stage-1", label: "Transcription", statusLabel: "100%", statusTone: "success", progressLabel: "100%" },
            { id: "stage-2", label: "Translation", statusLabel: "48%", statusTone: "warning", progressLabel: "48%" },
          ],
          logs: [
            { id: "log-1", displayLine: "[10:24:00] Normalization complete", toneClassName: "text-emerald-400" },
          ],
          deliverables: [
            {
              id: "deliverable-1",
              label: "Bilingual subtitles",
              description: "Ready for internal review",
              statusLabel: "Ready",
              statusTone: "success",
            },
          ],
        },
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: null,
      isRefreshing: true,
    });
  });

  it("renders the active pipeline job and live console", async () => {
    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          jobs: [],
          activeJob: null,
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Active Jobs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Live Execution Log" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Midnight City Processing" })).toBeInTheDocument();
    expect(screen.getByText("[10:24:00] Normalization complete")).toBeInTheDocument();
    expect(screen.getByText("Refreshing")).toBeInTheDocument();
  });

  it("shows an error banner while preserving the last successful pipeline snapshot", async () => {
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        jobs: [],
        activeJob: {
          id: "job-1",
          title: "Midnight City Processing",
          statusLabel: "Running",
          statusTone: "warning",
          elapsedLabel: "03:12",
          remainingLabel: "01:48",
          stages: [],
          logs: [],
          deliverables: [],
        },
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: new Error("Refresh failed"),
      isRefreshing: false,
    });

    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          jobs: [],
          activeJob: null,
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Live updates paused")).toBeInTheDocument();
    expect(screen.getByText("Midnight City Processing")).toBeInTheDocument();
  });

  it("renders the empty state when there is no active job", async () => {
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        jobs: [],
        activeJob: null,
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });

    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          jobs: [],
          activeJob: null,
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("No active pipeline job")).toBeInTheDocument();
  });
});
