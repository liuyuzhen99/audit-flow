import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionSkeleton } from "@/components/shared/section-skeleton";

describe("async state components", () => {
  it("renders loading state", () => {
    render(<LoadingState title="Loading queue" description="Fetching queue data" />);

    expect(screen.getByText("Loading queue")).toBeInTheDocument();
    expect(screen.getByText("Fetching queue data")).toBeInTheDocument();
  });

  it("renders error state with retry action", () => {
    render(<ErrorState title="Queue unavailable" description="Try again shortly" retryLabel="Retry" />);

    expect(screen.getByText("Queue unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<EmptyState title="No assets yet" description="Processed assets will appear here" />);

    expect(screen.getByText("No assets yet")).toBeInTheDocument();
  });

  it("renders section skeleton blocks", () => {
    const { container } = render(<SectionSkeleton sections={3} />);

    expect(container.querySelectorAll("[data-testid='section-skeleton-block']")).toHaveLength(3);
  });
});
