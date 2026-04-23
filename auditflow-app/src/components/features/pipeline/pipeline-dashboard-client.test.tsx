import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/pipeline",
  searchParams: new URLSearchParams(),
};

const mockUsePollingResource = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/hooks/use-polling-resource", () => ({
  usePollingResource: () => mockUsePollingResource(),
}));

describe("PipelineDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/pipeline";
    mockNavigation.searchParams = new URLSearchParams();
    mockUsePollingResource.mockReset();
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
            currentStageLabel: "Taste Audit",
            translationStatusLabel: "Not started",
            translationStatusTone: "neutral",
            lastUpdatedAtLabel: "Apr 21, 10:24",
            stages: [
              { id: "transcript_review", label: "Transcript Review", statusLabel: "Approved", statusTone: "success" },
              { id: "taste_audit", label: "Taste Audit", statusLabel: "Pending", statusTone: "warning" },
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

  it("renders workflow rows and phase 4 scoped messaging", async () => {
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
    expect(screen.getByRole("button", { name: /show details/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next Page" })).toBeInTheDocument();
    expect(screen.queryByText("Current Stage")).not.toBeInTheDocument();
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

    expect(screen.getAllByText("Taste Audit").length).toBeGreaterThan(0);
    expect(screen.getByText("Current Stage")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open raw audit log" })).toHaveAttribute(
      "href",
      "/api/audit-log?aggregateType=candidate&aggregateId=candidate-1",
    );
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
