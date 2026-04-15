import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePollingResource = vi.fn();

const mockStopPipelineJob = vi.fn();

vi.mock("@/lib/api/pipeline", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/pipeline")>("@/lib/api/pipeline");
  return {
    ...actual,
    stopPipelineJob: (...args: unknown[]) => mockStopPipelineJob(...args),
  };
});

vi.mock("@/hooks/use-polling-resource", () => ({
  usePollingResource: () => mockUsePollingResource(),
}));

describe("PipelineDashboardClient", () => {
  beforeEach(() => {
    mockUsePollingResource.mockReset();
    mockStopPipelineJob.mockReset();
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
            { id: "log-1", tick: 2, displayLine: "[10:24:00] Normalization complete", toneClassName: "text-emerald-400" },
          ],
          deliverables: [
            {
              id: "deliverable-1",
              label: "Bilingual subtitles",
              description: "Ready for internal review",
              statusLabel: "Ready",
              statusTone: "success",
              assetId: null,
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

  it("renders Open in Library as disabled when there is no linked asset", async () => {
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

    expect(screen.getByRole("button", { name: "Open in Library" })).toBeDisabled();
  });

  it("renders Open in Library as a link when deliverables provide an assetId", async () => {
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
          deliverables: [
            {
              id: "deliverable-1",
              label: "Master Audio",
              description: "Ready",
              statusLabel: "Ready",
              statusTone: "success",
              assetId: "asset-1",
            },
          ],
        },
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

    expect(screen.getByRole("link", { name: "Open in Library" })).toHaveAttribute("href", "/library/asset-1");
  });

  it("clears the console locally until new log lines arrive", async () => {
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

    expect(screen.getByText("[10:24:00] Normalization complete")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Clear Console" }));
    });

    expect(screen.queryByText("[10:24:00] Normalization complete")).not.toBeInTheDocument();
    expect(screen.getByText("Console cleared. New log lines will appear here.")).toBeInTheDocument();
  });

  it("stops the current task and shows the returned message", async () => {
    mockStopPipelineJob.mockResolvedValue({
      success: true,
      jobId: "job-1",
      message: "Stop request queued. The current stage will finish before shutting down.",
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

    fireEvent.click(screen.getByRole("button", { name: "Stop Current Task" }));

    await waitFor(() => {
      expect(mockStopPipelineJob).toHaveBeenCalledWith({ jobId: "job-1" });
    });

    expect(screen.getByText("Stop request queued. The current stage will finish before shutting down.")).toBeInTheDocument();
  });

  it("shows a friendly error message when stopping the current task fails", async () => {
    mockStopPipelineJob.mockRejectedValue(new Error("Stop failed"));

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

    fireEvent.click(screen.getByRole("button", { name: "Stop Current Task" }));

    expect(await screen.findByText("Stop failed")).toBeInTheDocument();
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
