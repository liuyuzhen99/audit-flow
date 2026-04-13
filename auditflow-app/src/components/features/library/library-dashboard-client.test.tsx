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
  beforeEach(async () => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/library";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("renders summary cards and asset cards", async () => {
    const { LibraryDashboardClient } = await import("@/components/features/library/library-dashboard-client");

    render(
      <LibraryDashboardClient
        summary={[{ label: "Published Assets", value: "2", hint: "Synced", tone: "success" }]}
        cards={[
          {
            id: "asset-1",
            title: "Midnight City (Audited Mix)",
            artistName: "M83",
            statusLabel: "Published",
            statusTone: "success",
            durationLabel: "04:03",
            resolutionLabel: "1080p",
            dateLabel: "04/09/2026",
            gradientClassName: "from-sky-950 via-indigo-700 to-fuchsia-500",
          },
        ]}
      />,
    );

    expect(screen.getByText("Published Assets")).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Audited Mix)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Filters" })).toBeInTheDocument();
  });

  it("updates the URL when a status filter is selected", async () => {
    const { LibraryDashboardClient } = await import("@/components/features/library/library-dashboard-client");

    render(<LibraryDashboardClient summary={[]} cards={[]} />);

    screen.getByRole("button", { name: "Published" }).click();

    expect(mockReplace).toHaveBeenCalledWith("/library?status=published");
  });
});
