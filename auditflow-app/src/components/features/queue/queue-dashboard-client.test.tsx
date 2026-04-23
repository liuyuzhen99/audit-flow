import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/queue",
  searchParams: new URLSearchParams(),
};

const mockUsePollingResource = vi.fn();
const mockApproveReview = vi.fn();
const mockRejectReview = vi.fn();

vi.stubGlobal("prompt", vi.fn(() => "looks good"));

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/hooks/use-polling-resource", () => ({
  usePollingResource: () => mockUsePollingResource(),
}));

vi.mock("@/lib/api/queue", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/queue")>("@/lib/api/queue");
  return {
    ...actual,
    approveReview: (...args: unknown[]) => mockApproveReview(...args),
    rejectReview: (...args: unknown[]) => mockRejectReview(...args),
  };
});

describe("QueueDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams();
    mockUsePollingResource.mockReset();
    mockApproveReview.mockReset();
    mockRejectReview.mockReset();
    mockUsePollingResource.mockReturnValue({
      data: {
        summary: [{ label: "Pending Reviews", value: "1", hint: "Awaiting human action", tone: "warning" }],
        rows: [
          {
            reviewId: "review-1",
            artistId: "artist-1",
            artistName: "M83",
            candidateId: "candidate-1",
            candidateTitle: "Midnight City (Official Video)",
            reviewType: "transcript_review",
            reviewTypeLabel: "Transcript Review",
            status: "pending",
            statusLabel: "Pending",
            statusTone: "warning",
            version: 1,
            versionLabel: "v1",
            queuedAtLabel: "Apr 21, 10:24",
            sourceUrl: "https://example.com/watch?v=1",
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        polling: { intervalMs: 15000, tick: 0, terminal: false },
      },
      error: null,
      isRefreshing: false,
    });
  });

  it("renders queue summary and review rows", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    expect(screen.getByText("Pending Reviews")).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
    expect(screen.getByText("Transcript Review")).toBeInTheDocument();
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
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    screen.getByRole("button", { name: "Rejected" }).click();

    expect(mockReplace).toHaveBeenCalledWith("/queue?status=rejected");
  });

  it("submits approve action with expected version and actor id", async () => {
    mockApproveReview.mockResolvedValue({
      reviewId: "review-1",
      status: "approved",
      version: 2,
      subjectId: "candidate-1",
      candidateStatus: "pending_review",
      nextReviewId: "review-2",
      nextReviewType: "taste_audit",
      decidedAt: "2026-04-21T10:30:00.000Z",
    });

    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(mockApproveReview).toHaveBeenCalledWith({
        reviewId: "review-1",
        expectedVersion: 1,
        comment: "looks good",
        actorId: "frontend-user-1",
      });
    });

    expect(screen.getByText(/Next step: taste_audit/i)).toBeInTheDocument();
  });

  it("renders audit log action as a raw json link", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Audit Log" })).toHaveAttribute(
      "href",
      "/api/audit-log?aggregateType=candidate&aggregateId=candidate-1",
    );
  });

  it("opens pipeline with the candidate-specific query instead of the generic page", async () => {
    const { QueueDashboardClient } = await import("@/components/features/queue/queue-dashboard-client");

    render(
      <QueueDashboardClient
        initialDashboard={{
          summary: [],
          rows: [],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          polling: { intervalMs: 15000, tick: 0, terminal: false },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Open Pipeline" })).toHaveAttribute(
      "href",
      "/pipeline?q=candidate-1&candidateId=candidate-1",
    );
  });
});
