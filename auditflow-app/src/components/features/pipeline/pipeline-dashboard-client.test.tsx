import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/pipeline",
  searchParams: new URLSearchParams(),
};

const mockUsePollingResource = vi.fn();
const mockStartCandidateRender = vi.fn();
const mockRetryCandidatePipeline = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/hooks/use-polling-resource", () => ({
  usePollingResource: () => mockUsePollingResource(),
}));

vi.mock("@/lib/api/pipeline", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/pipeline")>("@/lib/api/pipeline");
  return {
    ...actual,
    retryCandidatePipeline: (...args: unknown[]) => mockRetryCandidatePipeline(...args),
    startCandidateRender: (...args: unknown[]) => mockStartCandidateRender(...args),
  };
});

describe("PipelineDashboardClient", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
    mockReplace.mockReset();
    mockNavigation.pathname = "/pipeline";
    mockNavigation.searchParams = new URLSearchParams();
    mockUsePollingResource.mockReset();
    mockStartCandidateRender.mockReset();
    mockRetryCandidatePipeline.mockReset();
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [{ label: "In Review", value: "1", hint: "Candidates moving through checkpoints", tone: "warning" }],
        rows: [
          {
            candidateId: "candidate-1",
            artistId: "artist-1",
            artistName: "M83",
            candidateTitle: "Midnight City (Official Video)",
            workflowStatusLabel: "In Review",
            workflowStatusTone: "warning",
            artifactStatus: "missing",
            artifactStatusLabel: "Missing",
            canStartRender: false,
            canRetryProcessing: false,
            currentStageLabel: "Taste Audit",
            translationStatusLabel: "Not started",
            translationStatusTone: "neutral",
            asyncExecutionLabel: "Stage done",
            asyncExecutionTone: "success",
            asyncExecutionDetail: "manual_review · attempt 1/3 · manual review pending",
            renderJob: null,
            processingActivity: null,
            lastUpdatedAtLabel: "Apr 21, 10:24",
            stages: [
              { id: "transcript_review", label: "Transcript Review", statusLabel: "Approved", statusTone: "success" },
              { id: "taste_audit", label: "Taste Review", statusLabel: "Pending", statusTone: "warning" },
            ],
            progressStages: [
              { id: "transcripting", label: "Transcripting", state: "done" },
              { id: "transcript_review", label: "Transcript Review", state: "done" },
              { id: "taste_auditing", label: "Taste Auditing", state: "done" },
              { id: "taste_audit", label: "Taste Review", state: "current" },
            ],
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 11, totalPages: 2 },
        polling: { intervalMs: 15000, tick: 0, terminal: false },
      },
      error: null,
      isRefreshing: true,
    });
  });

  it("renders workflow rows and review workflow scoped messaging", async () => {
    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Candidates moving through checkpoints")).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
    expect(screen.getByText(/Pipeline only shows candidates that are still in review/i)).toBeInTheDocument();
    expect(screen.getByText("Refreshing")).toBeInTheDocument();
    expect(screen.getByText("Last worker: Stage done")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show details/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next Page" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current Stage")).toBeInTheDocument();
  });

  it("reveals workflow detail cards after expanding a row", async () => {
    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    expect(screen.getAllByText("Taste Review").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Current Stage").length).toBeGreaterThan(1);
    expect(screen.getByText("Last Worker Execution")).toBeInTheDocument();
    expect(screen.getByText("No ready final artifact (Missing)")).toBeInTheDocument();
    expect(screen.getByText("manual_review · attempt 1/3 · manual review pending")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open raw audit log" })).toHaveAttribute(
      "href",
      "/api/audit-log?aggregateType=candidate&aggregateId=candidate-1",
    );
    expect(screen.queryByText("passes taste")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });
    });
  });

  it("starts a render job for final approval rows with missing artifact", async () => {
    mockStartCandidateRender.mockResolvedValue({
      taskId: "job-1",
      message: "queued",
      candidateId: "candidate-1",
    });
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        rows: [
          {
            candidateId: "candidate-1",
            artistId: "artist-1",
            artistName: "M83",
            candidateTitle: "Midnight City (Official Video)",
            workflowStatusLabel: "In Review",
            workflowStatusTone: "warning",
            artifactStatus: "missing",
            artifactStatusLabel: "Missing",
            canStartRender: true,
            canRetryProcessing: false,
            currentStageLabel: "Final Asset Approval",
            translationStatusLabel: "Approved",
            translationStatusTone: "success",
            asyncExecutionLabel: null,
            asyncExecutionTone: "neutral",
            asyncExecutionDetail: null,
            renderJob: null,
            processingActivity: {
              jobId: "job-1",
              statusLabel: "Processing",
              statusTone: "info",
              progressLabel: "异步执行阶段: transcribe",
              currentStageLabel: "transcribe",
              updatedAtLabel: "Apr 21, 10:24",
              logs: [
                {
                  id: "job-1-0",
                  timestampLabel: "Apr 21, 10:24",
                  level: "info",
                  stageLabel: "transcribe",
                  message: "transcribe: processing",
                },
              ],
            },
            lastUpdatedAtLabel: "Apr 21, 10:24",
            stages: [
              { id: "final_asset_approval", label: "Final Asset Approval", statusLabel: "Pending", statusTone: "warning" },
            ],
            progressStages: [
              { id: "final_asset_approval", label: "Final Asset Approval", state: "current" },
            ],
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        polling: { intervalMs: 15000, tick: 0, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });

    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
        initialExpandedCandidateId="candidate-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start render job" }));

    expect(await screen.findByText("Render job queued: job-1")).toBeInTheDocument();
    expect(mockStartCandidateRender).toHaveBeenCalledWith({ candidateId: "candidate-1" });
    expect(screen.getByText("Processing Logs")).toBeInTheDocument();
    expect(screen.getByText(/transcribe: processing/)).toBeInTheDocument();
  });

  it("renders current stage filter as a checkbox popover", async () => {
    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Current Stage"));

    expect(screen.getByRole("button", { name: "All stages" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transcript Review" })).toBeInTheDocument();
  });

  it("queues a manual retry for failed pipeline stages", async () => {
    mockRetryCandidatePipeline.mockResolvedValue({
      candidateId: "candidate-1",
      jobId: "job-1",
      stage: "download",
      attempt: 1,
      message: "queued",
    });
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        rows: [
          {
            candidateId: "candidate-1",
            artistId: "artist-1",
            artistName: "Kehlani",
            candidateTitle: "Call Me Back",
            workflowStatusLabel: "In Review",
            workflowStatusTone: "warning",
            artifactStatus: "missing",
            artifactStatusLabel: "Missing",
            canStartRender: false,
            canRetryProcessing: true,
            currentStageLabel: "Transcript Review",
            translationStatusLabel: "Not started",
            translationStatusTone: "neutral",
            asyncExecutionLabel: "Retry scheduled",
            asyncExecutionTone: "warning",
            asyncExecutionDetail: "download · attempt 1/3",
            renderJob: null,
            processingActivity: {
              jobId: "job-1",
              statusLabel: "Processing",
              statusTone: "info",
              progressLabel: "异步执行阶段: download",
              currentStageLabel: "download",
              updatedAtLabel: "Apr 21, 10:24",
              logs: [
                {
                  id: "job-1-0",
                  timestampLabel: "Apr 21, 10:24",
                  level: "error",
                  stageLabel: "download",
                  message: "Sign in to confirm you’re not a bot",
                },
              ],
            },
            lastUpdatedAtLabel: "Apr 21, 10:24",
            stages: [
              { id: "transcript_review", label: "Transcript Review", statusLabel: "Pending", statusTone: "warning" },
            ],
            progressStages: [
              { id: "transcripting", label: "Transcripting", state: "current" },
            ],
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        polling: { intervalMs: 15000, tick: 0, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });

    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
        initialExpandedCandidateId="candidate-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry failed stage" }));

    expect(await screen.findByText("Retry queued: job-1 · download attempt 2")).toBeInTheDocument();
    expect(mockRetryCandidatePipeline).toHaveBeenCalledWith({ candidateId: "candidate-1" });
  });

  it("renders empty state when there are no workflow rows", async () => {
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        rows: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        polling: { intervalMs: 15000, tick: 0, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });

    const { PipelineDashboardClient } = await import("@/components/features/pipeline/pipeline-dashboard-client");

    render(
      <PipelineDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("No workflow items found")).toBeInTheDocument();
  });
});
