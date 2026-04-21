import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/artists/artist-1",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/artists", () => ({
  getArtistCandidates: vi.fn(async () => ({
    artistId: "artist-1",
    items: [
      {
        candidateId: "candidate-1",
        videoId: "video-1",
        title: "M83 official drop",
        status: "pending_review",
        ingestionStatus: "completed",
        channelId: "UC_M83",
        sourceUrl: "https://youtube.test/watch?v=video-1",
        sourceKind: "youtube_rss",
        publishedAt: "2026-04-09T10:00:00.000Z",
        firstSeenAt: "2026-04-09T10:00:00.000Z",
        lastSeenAt: "2026-04-09T10:00:00.000Z",
        discoveryRunId: "run-1",
        failureReason: null,
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
  })),
}));

import ArtistCandidatesPage from "@/app/(dashboard)/artists/[artistId]/page";

describe("artist candidates page", () => {
  it("renders artist candidates detail", async () => {
    render(
      await ArtistCandidatesPage({
        params: Promise.resolve({ artistId: "artist-1" }),
        searchParams: Promise.resolve({ artistName: "M83" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "M83" })).toBeInTheDocument();
    expect(screen.getByText("M83 official drop")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Artists" })).toBeInTheDocument();
  });
});
