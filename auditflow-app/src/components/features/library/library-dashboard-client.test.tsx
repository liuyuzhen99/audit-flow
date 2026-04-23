import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/library",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

describe("LibraryDashboardClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/library";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("renders summary cards and accepted asset cards", async () => {
    const { LibraryDashboardClient } = await import("@/components/features/library/library-dashboard-client");

    render(
      <LibraryDashboardClient
        summary={[{ label: "Accepted Assets", value: "1", hint: "Visible in the real library feed", tone: "success" }]}
        cards={[
          {
            id: "asset-1",
            title: "Midnight City (Official Video)",
            artistName: "M83",
            statusLabel: "Accepted",
            statusTone: "success",
            approvedAtLabel: "Apr 21, 10:24",
            approvedByLabel: "frontend-user-1",
            sourceUrl: "https://example.com/watch?v=1",
          },
        ]}
      />,
    );

    expect(screen.getByText("Accepted Assets")).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Official Video)")).toBeInTheDocument();
    expect(screen.getByText(/Library detail pages remain outside this Phase 4 integration pass/i)).toBeInTheDocument();
  });

  it("updates the URL when the accepted filter is selected", async () => {
    const { LibraryDashboardClient } = await import("@/components/features/library/library-dashboard-client");

    render(<LibraryDashboardClient summary={[]} cards={[]} />);

    screen.getByRole("button", { name: "Accepted" }).click();

    expect(mockReplace).toHaveBeenCalledWith("/library?status=accepted");
  });

  it("renders source video link for each accepted asset", async () => {
    const { LibraryDashboardClient } = await import("@/components/features/library/library-dashboard-client");

    render(
      <LibraryDashboardClient
        summary={[]}
        cards={[
          {
            id: "asset-1",
            title: "Midnight City (Official Video)",
            artistName: "M83",
            statusLabel: "Accepted",
            statusTone: "success",
            approvedAtLabel: "Apr 21, 10:24",
            approvedByLabel: "frontend-user-1",
            sourceUrl: "https://example.com/watch?v=1",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Open source video" })).toHaveAttribute(
      "href",
      "https://example.com/watch?v=1",
    );
  });
});

