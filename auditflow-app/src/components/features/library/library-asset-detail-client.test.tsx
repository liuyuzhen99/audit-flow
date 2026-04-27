import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAssetDetailClient } from "@/components/features/library/library-asset-detail-client";
import type { LibraryAssetDetailViewModel } from "@/types/library";

const baseDetail: LibraryAssetDetailViewModel = {
  id: "asset-1",
  title: "Midnight City",
  artistName: "M83",
  sourceUrl: "https://example.com/source",
  approvedAtLabel: "Apr 09, 10:01 AM",
  approvedByLabel: "System",
  artifactStatus: "ready",
  artifactStatusLabel: "Ready",
  primaryArtifactLabel: "final_video v1",
  previewUrl: "/api/artifacts/artifact-1/download",
  fallbackDownloadUrl: "/api/artifacts/artifact-1/download",
  artifacts: [
    {
      artifactId: "artifact-1",
      artifactType: "final_video",
      objectUri: "oss://bucket/pipeline/job/final_video/v1/final.mp4",
      contentType: "video/mp4",
      sizeBytes: 2048,
      checksumSha256: "abc",
      lifecycleStatus: "ready",
      version: 1,
      createdAt: "2026-04-09T10:01:00",
      expiresAt: null,
    },
  ],
};

describe("LibraryAssetDetailClient", () => {
  it("renders a playable preview when the final artifact is ready", () => {
    render(<LibraryAssetDetailClient detail={baseDetail} />);

    expect(screen.getByText("Midnight City")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/i })).toHaveAttribute(
      "href",
      "/api/artifacts/artifact-1/download",
    );
  });

  it("renders a missing-artifact fallback without a broken player", () => {
    render(
      <LibraryAssetDetailClient
        detail={{
          ...baseDetail,
          artifactStatus: "missing",
          artifactStatusLabel: "Missing",
          previewUrl: null,
          fallbackDownloadUrl: null,
          artifacts: [],
        }}
      />,
    );

    expect(screen.getAllByText("Missing")).toHaveLength(2);
    expect(screen.getByText(/has not been produced/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /download/i })).not.toBeInTheDocument();
  });
});
