import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArtistsPage from "@/app/(dashboard)/artists/page";
import LibraryPage from "@/app/(dashboard)/library/page";
import PipelinePage from "@/app/(dashboard)/pipeline/page";
import QueuePage from "@/app/(dashboard)/queue/page";

describe("dashboard pages", () => {
  it("renders artists page from typed data", async () => {
    render(await ArtistsPage());

    expect(screen.getByRole("heading", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByText("The Weeknd")).toBeInTheDocument();
  });

  it("renders queue page from typed data", async () => {
    render(await QueuePage());

    expect(screen.getByRole("heading", { name: "Audit Queue" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Remix)")).toBeInTheDocument();
  });

  it("renders pipeline page from typed data", async () => {
    render(await PipelinePage());

    expect(screen.getByRole("heading", { name: "Pipeline" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (M83) - Video Generation")).toBeInTheDocument();
  });

  it("renders library page from typed data", async () => {
    render(await LibraryPage());

    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();
    expect(screen.getByText("Midnight City (Audited Mix)")).toBeInTheDocument();
  });
});
