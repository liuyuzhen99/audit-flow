import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockResyncArtist = vi.fn();
const mockNavigation = {
  pathname: "/artists",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => mockNavigation.searchParams,
}));

vi.mock("@/lib/api/artists", () => ({
  resyncArtist: (...args: unknown[]) => mockResyncArtist(...args),
}));

describe("ArtistsDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockResyncArtist.mockReset();
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams();
    mockResyncArtist.mockResolvedValue({
      runId: "run-1",
      artistId: "artist-1",
      status: "completed",
      discoveredCount: 2,
      startedAt: "2026-04-09T10:00:00.000Z",
      completedAt: "2026-04-09T10:02:00.000Z",
      channelRunId: "channel-1",
      discoveryRunId: "discovery-1",
      artistRemoved: false,
    });
  });

  it("renders rows with pagination controls", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            channelLabel: "UC_M83",
            candidateLabel: "2 candidates",
            syncStatusLabel: "Completed",
            syncStatusTone: "success",
            freshnessLabel: "Synced 1h ago",
            errorLabel: null,
            canResync: true,
          },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 4, totalPages: 1 }}
      />,
    );

    expect(screen.getByText("M83")).toBeInTheDocument();
    expect(screen.getByText("Showing 1-4 of 4")).toBeInTheDocument();
  });

  it("updates the URL when pagination changes", async () => {
    mockNavigation.searchParams = new URLSearchParams("page=2&pageSize=10");

    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[]}
        pagination={{ page: 2, pageSize: 10, total: 25, totalPages: 3 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
    expect(mockReplace).toHaveBeenCalledWith("/artists?page=3");

    fireEvent.change(screen.getByLabelText("Rows Per Page"), { target: { value: "20" } });
    expect(mockReplace).toHaveBeenLastCalledWith("/artists?pageSize=20");
  });

  it("updates status filter in the URL", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[]}
        pagination={{ page: 1, pageSize: 10, total: 0, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Completed" }));

    expect(mockReplace).toHaveBeenCalledWith("/artists?status=completed");
  });

  it("triggers artist resync", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            channelLabel: "UC_M83",
            candidateLabel: "2 candidates",
            syncStatusLabel: "Completed",
            syncStatusTone: "success",
            freshnessLabel: "Synced 1h ago",
            errorLabel: null,
            canResync: true,
          },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resync" }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("removes the row immediately when resync reports the artist was removed", async () => {
    mockResyncArtist.mockResolvedValueOnce({
      runId: "run-1",
      artistId: "artist-1",
      status: "completed",
      discoveredCount: 0,
      startedAt: "2026-04-09T10:00:00.000Z",
      completedAt: "2026-04-09T10:02:00.000Z",
      channelRunId: "channel-1",
      discoveryRunId: "discovery-1",
      artistRemoved: true,
    });

    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            channelLabel: "UC_M83",
            candidateLabel: "2 candidates",
            syncStatusLabel: "Completed",
            syncStatusTone: "success",
            freshnessLabel: "Synced 1h ago",
            errorLabel: null,
            canResync: true,
          },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resync" }));

    await waitFor(() => {
      expect(screen.queryByText("M83")).not.toBeInTheDocument();
    });
  });

  it("updates the URL when candidates and sync status sorting are selected", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            channelLabel: "UC_M83",
            candidateLabel: "2 candidates",
            syncStatusLabel: "Completed",
            syncStatusTone: "success",
            freshnessLabel: "Synced 1h ago",
            errorLabel: null,
            canResync: true,
          },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort by Candidates" }));
    expect(mockReplace).toHaveBeenCalledWith("/artists?sortBy=candidateCount&sortDirection=asc");

    fireEvent.click(screen.getByRole("button", { name: "Sort by Sync Status" }));
    expect(mockReplace).toHaveBeenLastCalledWith("/artists?sortBy=syncStatus&sortDirection=asc");
  });

  it("renders a view link for candidate details", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            channelLabel: "UC_M83",
            candidateLabel: "2 candidates",
            syncStatusLabel: "Completed",
            syncStatusTone: "success",
            freshnessLabel: "Synced 1h ago",
            errorLabel: null,
            canResync: true,
          },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }}
      />,
    );

    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute("href", "/artists/artist-1?artistName=M83");
  });
});
