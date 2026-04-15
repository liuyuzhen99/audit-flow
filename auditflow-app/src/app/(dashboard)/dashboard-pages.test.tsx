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

    render(await ArtistsPage());

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

    expect(screen.getByText("M83")).toBeInTheDocument();
    expect(screen.queryByText("The Weeknd")).not.toBeInTheDocument();
  });

  it("applies artists dateRange params on the server render", async () => {
    mockNavigation.pathname = "/artists";
    mockNavigation.searchParams = new URLSearchParams("dateRange=2w");

    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ dateRange: "2w" }),
      }),
    );

    // All seed artists are within the 2-week window — verify the page renders without error
    expect(screen.getByRole("heading", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByText("M83")).toBeInTheDocument();
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
    expect(rows[1]).toHaveTextContent("Travis Scott");
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
