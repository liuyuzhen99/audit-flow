import { fireEvent, render, screen } from "@testing-library/react";
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

describe("ArtistsDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("renders rows with pagination controls", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[
          {
            id: "artist-1",
            name: "M83",
            followerLabel: "4.9M",
            channelLabel: "M83 Official",
            releasesLabel: "2 new tracks",
            statusLabel: "Monitoring",
            statusTone: "info",
            freshnessLabel: "Updated 1h ago",
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

  it("toggles Recent 2 Weeks in the URL", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[]}
        pagination={{ page: 1, pageSize: 10, total: 0, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Recent 2 Weeks" }));

    expect(mockReplace).toHaveBeenCalledWith("/artists?dateRange=2w");
  });

  it("updates status filter in the URL", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[]}
        pagination={{ page: 1, pageSize: 10, total: 0, totalPages: 1 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(mockReplace).toHaveBeenCalledWith("/artists?status=manualReview");
  });

  it("renders Bulk Download as a disabled Phase 5 action", async () => {
    const { ArtistsDashboardClient } = await import("@/components/features/artists/artists-dashboard-client");

    render(
      <ArtistsDashboardClient
        rows={[]}
        pagination={{ page: 1, pageSize: 10, total: 0, totalPages: 1 }}
      />,
    );

    expect(screen.getByRole("button", { name: "Bulk Download (Phase 5)" })).toBeDisabled();
  });
});
