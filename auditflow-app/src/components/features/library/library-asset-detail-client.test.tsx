import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAssetDetailClient } from "@/components/features/library/library-asset-detail-client";

describe("LibraryAssetDetailClient", () => {
  it("renders the phase 4 deferred detail message with the asset id", () => {
    render(<LibraryAssetDetailClient assetId="asset-1" />);

    expect(screen.getByRole("heading", { name: "Library Detail Deferred" })).toBeInTheDocument();
    expect(screen.getByText(/asset-1/)).toBeInTheDocument();
    expect(screen.getByText(/outside this integration pass/i)).toBeInTheDocument();
  });

  it("renders links back to the list and audit log", () => {
    render(<LibraryAssetDetailClient assetId="asset-42" />);

    expect(screen.getByRole("link", { name: /back to library/i })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: /open audit log/i })).toHaveAttribute(
      "href",
      "/api/audit-log?aggregateType=candidate&aggregateId=asset-42",
    );
  });
});
