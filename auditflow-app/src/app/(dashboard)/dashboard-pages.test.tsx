import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockGetArtistsDashboard = vi.fn(async ({ query }: { query?: Record<string, unknown> }) => {
  const q = typeof query?.q === "string" ? query.q.toLowerCase() : "";
  if (q === "fail") {
    throw new Error("connect ECONNREFUSED 127.0.0.1:8000");
  }

  return {
    items: [
      {
        id: "artist-1",
        name: "The Weeknd",
        status: "active",
        youtubeChannelId: "UC_THE_WEEKND",
        youtubeChannelLabel: "UC_THE_WEEKND",
        syncStatus: "completed",
        lastSyncStartedAt: "2026-04-09T09:55:00.000Z",
        lastSyncCompletedAt: "2026-04-09T10:00:00.000Z",
        lastSyncError: null,
        candidateCount: 2,
        partialFailure: false,
        emptyState: false,
        retryMetadata: { canResync: true, latestRetryCount: 0, latestFailureReason: null },
        sourceHealth: {},
        latestCandidate: null,
        latestRun: null,
      },
    ].filter((item) => (q ? item.name.toLowerCase().includes(q) : true)),
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
  };
});
const mockNavigation = {
  pathname: "/artists",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/lib/server/request-origin", () => ({
  getRequestOrigin: vi.fn(async () => "http://127.0.0.1:3000"),
}));

vi.mock("@/lib/api/artists", () => ({
  getArtistsDashboard: (...args: unknown[]) => mockGetArtistsDashboard(...args),
}));

vi.mock("@/lib/api/queue", () => ({
  getQueueDashboard: vi.fn(async () => ({
    summary: [{ id: "queue-pending", label: "Pending Reviews", value: "1", hint: "Awaiting human action", tone: "warning" }],
    items: [
      {
        reviewId: "review-1",
        artistId: "artist-1",
        artistName: "M83",
        candidateId: "candidate-1",
        candidateTitle: "Midnight City (Official Video)",
        reviewType: "transcript_review",
        status: "pending",
        version: 1,
        queuedAt: "2026-04-21T10:24:00.000Z",
        publishedAt: null,
        sourceUrl: "https://example.com/watch?v=1",
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    meta: { generatedAt: "2026-04-21T10:24:00.000Z" },
    polling: { intervalMs: 15000, tick: 0, terminal: false },
  })),
}));

vi.mock("@/lib/api/pipeline", () => ({
  getPipelineDashboard: vi.fn(async () => ({
    summary: [{ id: "pipeline-review", label: "In Review", value: "1", hint: "Candidates moving through checkpoints", tone: "warning" }],
    items: [
      {
        candidateId: "candidate-1",
        artistId: "artist-1",
        artistName: "M83",
        candidateTitle: "Midnight City (Official Video)",
        workflowStatus: "pending_review",
        currentStage: "taste_audit",
        stages: [
          { stage: "transcript_review", status: "approved" },
          { stage: "taste_audit", status: "pending" },
        ],
        translation: { status: "not_started" },
        lastUpdatedAt: "2026-04-21T10:24:00.000Z",
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    meta: { generatedAt: "2026-04-21T10:24:00.000Z" },
    polling: { intervalMs: 15000, tick: 0, terminal: false },
  })),
}));

vi.mock("@/lib/api/library", () => ({
  getLibraryDashboard: vi.fn(async () => ({
    summary: [{ id: "library-assets", label: "Accepted Assets", value: "1", hint: "Visible in the real library feed", tone: "success" }],
    items: [
      {
        id: "candidate-1",
        artistId: "artist-1",
        artistName: "M83",
        title: "Midnight City (Official Video)",
        sourceUrl: "https://example.com/watch?v=1",
        approvedAt: "2026-04-21T10:24:00.000Z",
        approvedBy: "frontend-user-1",
        status: "accepted",
      },
    ],
    meta: { generatedAt: "2026-04-21T10:24:00.000Z" },
  })),
}));

import ArtistsPage from "@/app/(dashboard)/artists/page";
import LibraryPage from "@/app/(dashboard)/library/page";
import PipelinePage from "@/app/(dashboard)/pipeline/page";
import QueuePage from "@/app/(dashboard)/queue/page";

describe("dashboard pages", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockGetArtistsDashboard.mockClear();
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("renders artists page from typed data", async () => {
    render(await ArtistsPage({}));

    expect(screen.getByRole("heading", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByText("The Weeknd")).toBeInTheDocument();
    expect(mockGetArtistsDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          sortBy: "candidateCount",
          sortDirection: "desc",
        }),
      }),
    );
  });

  it("renders an error state when artists backend is unavailable", async () => {
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ q: "fail" }),
      }),
    );

    expect(screen.getByText("Artists backend unavailable")).toBeInTheDocument();
  });

  it("renders queue page from real phase 4 data", async () => {
    render(await QueuePage({}));

    expect(screen.getByRole("heading", { name: "Audit Queue" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
  });

  it("renders pipeline page from real phase 4 workflow data", async () => {
    render(await PipelinePage({}));

    expect(screen.getByRole("heading", { name: "Pipeline" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show details/i })).toBeInTheDocument();
  });

  it("renders library page from accepted assets data", async () => {
    render(await LibraryPage({}));

    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
  });
});
