import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
const mockNavigation = {
  pathname: "/queue",
  searchParams: new URLSearchParams(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockNavigation.searchParams,
}));

describe("AppHeader", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockNavigation.pathname = "/queue";
    mockNavigation.searchParams = new URLSearchParams();
  });

  it("routes global search to the active dashboard", async () => {
    const { AppHeader } = await import("@/components/layout/app-header");

    render(<AppHeader />);

    const input = screen.getByRole("searchbox", { name: "Search..." });
    fireEvent.change(input, { target: { value: "Pops" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockReplace).toHaveBeenCalledWith("/queue?q=Pops");
  });

  it("falls back to artists search from non-dashboard pages", async () => {
    mockNavigation.pathname = "/reports";
    const { AppHeader } = await import("@/components/layout/app-header");

    render(<AppHeader />);

    const input = screen.getByRole("searchbox", { name: "Search..." });
    fireEvent.change(input, { target: { value: "M83" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockReplace).toHaveBeenCalledWith("/artists?q=M83");
  });
});
