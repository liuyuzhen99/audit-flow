import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockPush = vi.fn();
const mockAddCandidateToPipeline = vi.fn();
const mockNavigation = {
  pathname: "/artists/artist-1",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/lib/api/pipeline", () => ({
  addCandidateToPipeline: (...args: unknown[]) => mockAddCandidateToPipeline(...args),
}));

describe("ArtistCandidatesClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockPush.mockReset();
    mockAddCandidateToPipeline.mockReset();
    mockAddCandidateToPipeline.mockResolvedValue({
      candidateId: "candidate-1",
      candidateStatus: "pending_review",
      reviewId: "review-1",
      reviewType: "transcript_review",
      reviewStatus: "pending",
      version: 1,
    });
  });

  it("adds a discovered candidate to the review pipeline", async () => {
    const { ArtistCandidatesClient } = await import("@/components/features/artists/artist-candidates-client");

    render(
      <ArtistCandidatesClient
        artistId="artist-1"
        artistName="M83"
        response={{
          artistId: "artist-1",
          items: [
            {
              candidateId: "candidate-1",
              videoId: "video-1",
              title: "Midnight City",
              status: "discovered",
              ingestionStatus: "completed",
              channelId: "channel-1",
              sourceUrl: "https://youtube.test/watch?v=video-1",
              sourceKind: "youtube_rss",
              publishedAt: "2026-04-21T10:00:00.000Z",
              firstSeenAt: "2026-04-21T10:01:00.000Z",
              lastSeenAt: "2026-04-21T10:01:00.000Z",
              discoveryRunId: "run-1",
              failureReason: null,
            },
          ],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to Pipeline" }));

    await waitFor(() => {
      expect(mockAddCandidateToPipeline).toHaveBeenCalledWith({ candidateId: "candidate-1" });
    });
    expect(mockPush).toHaveBeenCalledWith("/pipeline?q=candidate-1&candidateId=candidate-1");
    expect(screen.queryByText("Review Status")).not.toBeInTheDocument();
  });
});
