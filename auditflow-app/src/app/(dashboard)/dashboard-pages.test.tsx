import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/artists",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/lib/api/artists", () => ({
  getArtistsDashboard: vi.fn(async ({ query }: { query?: Record<string, unknown> }) => {
    const q = typeof query?.q === "string" ? query.q.toLowerCase() : "";
    if (q === "fail") {
      throw new Error("connect ECONNREFUSED 127.0.0.1:8000");
    }
    const page = typeof query?.page === "number" ? query.page : 1;
    const pageSize = typeof query?.pageSize === "number" ? query.pageSize : 10;
    const sourceItems = [
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
      {
        id: "artist-2",
        name: "M83",
        status: "active",
        youtubeChannelId: "UC_M83",
        youtubeChannelLabel: "UC_M83",
        syncStatus: "failed",
        lastSyncStartedAt: "2026-04-09T09:55:00.000Z",
        lastSyncCompletedAt: "2026-04-09T10:00:00.000Z",
        lastSyncError: "RSS timeout",
        candidateCount: 0,
        partialFailure: false,
        emptyState: true,
        retryMetadata: { canResync: true, latestRetryCount: 1, latestFailureReason: "RSS timeout" },
        sourceHealth: {},
        latestCandidate: null,
        latestRun: null,
      },
      {
        id: "artist-3",
        name: "Travis Scott",
        status: "active",
        youtubeChannelId: "UC_TRAVIS",
        youtubeChannelLabel: "UC_TRAVIS",
        syncStatus: "processing",
        lastSyncStartedAt: "2026-04-09T09:55:00.000Z",
        lastSyncCompletedAt: "2026-04-09T10:00:00.000Z",
        lastSyncError: null,
        candidateCount: 1,
        partialFailure: false,
        emptyState: false,
        retryMetadata: { canResync: true, latestRetryCount: 0, latestFailureReason: null },
        sourceHealth: {},
        latestCandidate: null,
        latestRun: null,
      },
    ];
    const filtered = sourceItems.filter((item) => (q ? item.name.toLowerCase().includes(q) : true));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return {
      items: paged,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
      },
      meta: { generatedAt: "2026-04-09T10:00:00.000Z" },
    };
  }),
}));

import ArtistsPage from "@/app/(dashboard)/artists/page";
import LibraryPage from "@/app/(dashboard)/library/page";
import PipelinePage from "@/app/(dashboard)/pipeline/page";
import QueuePage from "@/app/(dashboard)/queue/page";

describe("dashboard pages", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("renders artists page from typed data", async () => {
    mockNavigation.pathname = "/artists";

    render(await ArtistsPage({}));

    expect(screen.getByRole("heading", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByText("The Weeknd")).toBeInTheDocument();
  });

  it("applies artists query params on the server render", async () => {
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams("q=M83");

    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ q: "M83" }),
      }),
    );

    expect(screen.getByText("M83")).toBeInTheDocument();
    expect(screen.queryByText("The Weeknd")).not.toBeInTheDocument();
  });

  it("applies artists pagination params on the server render", async () => {
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams("page=2&pageSize=2");

    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ page: "2", pageSize: "2" }),
      }),
    );

    expect(screen.getByText("Travis Scott")).toBeInTheDocument();
    expect(screen.queryByText("The Weeknd")).not.toBeInTheDocument();
  });

  it("applies artists sorting params on the server render", async () => {
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams("sortBy=name&sortDirection=desc");

    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ sortBy: "name", sortDirection: "desc" }),
      }),
    );

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("The Weeknd");
  });

  it("renders an error state when artists backend is unavailable", async () => {
    mockNavigation.pathname = "/artists";

    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ q: "fail" }),
      }),
    );

    expect(screen.getByText("Artists backend unavailable")).toBeInTheDocument();
    expect(screen.getByText(/RANDY_TRANSLATION_API_BASE_URL/)).toBeInTheDocument();
  });

  it("applies queue query params on the server render", async () => {
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams("status=manualReview");

    render(
      await QueuePage({
        searchParams: Promise.resolve({ status: "manualReview" }),
      }),
    );

    expect(screen.getByText("Potential crowd noise detected")).toBeInTheDocument();
    expect(screen.queryByText("No rights conflicts, audio quality verified")).not.toBeInTheDocument();
  });

  it("applies queue pagination params on the server render", async () => {
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams("page=2&pageSize=1&sortBy=title&sortDirection=asc");

    render(
      await QueuePage({
        searchParams: Promise.resolve({ page: "2", pageSize: "1", sortBy: "title", sortDirection: "asc" }),
      }),
    );

    expect(screen.getByText("Scanning content fingerprints")).toBeInTheDocument();
    expect(screen.queryByText("Potential crowd noise detected")).not.toBeInTheDocument();
  });

  it("applies queue sorting params on the server render", async () => {
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams("sortBy=title&sortDirection=desc");

    render(
      await QueuePage({
        searchParams: Promise.resolve({ sortBy: "title", sortDirection: "desc" }),
      }),
    );

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Starboy (Live)");
  });

  it("renders library page from typed data", async () => {
    render(await LibraryPage());

    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Audited Mix)")).toBeInTheDocument();
  });

  it("renders pipeline page from typed data", async () => {
    render(await PipelinePage());

    expect(screen.getByRole("heading", { name: "Pipeline" })).toBeInTheDocument();
    expect(screen.getByText("Live Execution Log")).toBeInTheDocument();
  });
});
