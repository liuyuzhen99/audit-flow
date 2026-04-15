import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/queue",
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

describe("QueueDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams();
    mockUsePollingResource.mockReset();
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [{ label: "Queued", value: "3", hint: "Awaiting review", tone: "info" }],
        rows: [
          {
            id: "queue-1",
            title: "Midnight City",
            artistName: "M83",
            statusLabel: "Processing",
            statusTone: "warning",
            confidenceLabel: "82%",
            summaryLabel: "Potential crowd noise detected",
            progressLabel: "Auditing",
            progressPercent: 64,
            reportId: "report-101",
            updatedLabel: "10:24",
          },
          {
            id: "queue-2",
            title: "Starboy",
            artistName: "The Weeknd",
            statusLabel: "Manual review",
            statusTone: "warning",
            confidenceLabel: "72%",
            summaryLabel: "No report available yet",
            progressLabel: "Manual review",
            progressPercent: 100,
            reportId: null,
            updatedLabel: "10:28",
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });
  });

  it("renders queue summary and rows", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getByText("Midnight City")).toBeInTheDocument();
    expect(screen.getByText("Potential crowd noise detected")).toBeInTheDocument();
    expect(screen.getByText("Live updates")).toBeInTheDocument();
  });

  it("updates the URL when a status filter is selected", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    screen.getByRole("button", { name: "Flagged" }).click();

    expect(mockReplace).toHaveBeenCalledWith("/queue?status=manualReview");
  });

  it("updates the URL when pagination changes", async () => {
    mockNavigation.searchParams = new URLSearchParams("page=2&pageSize=10");
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        rows: [],
        pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 },
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });

    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    screen.getByRole("button", { name: "Next Page" }).click();

    expect(mockReplace).toHaveBeenCalledWith("/queue?page=3");
  });

  it("renders route-to-pipeline action as a link", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /route midnight city to pipeline/i })).toHaveAttribute("href", "/pipeline");
  });

  it("renders report action as a live link when a report exists", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /view report for midnight city/i })).toHaveAttribute("href", "/reports/report-101");
  });

  it("renders report action as disabled when no report exists", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /no report available for starboy/i })).toBeDisabled();
  });

  it("shows an error banner while preserving the last successful queue snapshot", async () => {
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [],
        rows: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        polling: { intervalMs: 4000, tick: 2, terminal: false },
      },
      error: new Error("Refresh failed"),
      isRefreshing: false,
    });

    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
          polling: { intervalMs: 4000, tick: 2, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Live updates paused")).toBeInTheDocument();
    expect(screen.getByText("Updates paused")).toBeInTheDocument();
  });
});
