import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/library/asset-1",
}));

describe("LibraryAssetDetailClient", () => {
  const baseViewModel = {
    id: "asset-1",
    title: "Midnight City (Audited Mix)",
    artistName: "M83",
    statusLabel: "Published",
    statusTone: "success" as const,
    durationLabel: "04:03",
    resolutionLabel: "1080p",
    createdAtLabel: "04/09/2026",
    sourceStatusLabel: "Completed",
    gradientClassName: "from-sky-950 via-indigo-700 to-fuchsia-500",
    versions: [
      { id: "v1", label: "v1 — Initial render", createdAtLabel: "04/09/2026" },
      { id: "v2", label: "v2 — Color grade pass", createdAtLabel: "04/10/2026" },
    ],
    mediaPlayer: {
      title: "Audited media preview",
      description: "Primary review-ready export for internal playback.",
      sourceUrl: "https://example.com/media/midnight-city.mp4",
      posterUrl: "https://example.com/posters/midnight-city.jpg",
      mimeType: "video/mp4",
      fallbackTitle: "Media unavailable",
      fallbackDescription: "A playback source is not available for this asset yet.",
    },
    reportSummary: {
      title: "Audit report ready",
      decisionLabel: "Auto-approved",
      decisionTone: "success" as const,
      summaryLabel: "No rights conflicts, audio quality verified.",
      href: "/reports/report-101",
      linkLabel: "Open full report",
    },
    auditSections: {
      ruleHits: {
        title: "Rule hits",
        emptyTitle: "No rule hits",
        emptyDescription: "This asset has no triggered rules.",
        items: [
          {
            id: "rule-1",
            title: "Rights fingerprint",
            badgeLabel: "Low",
            badgeTone: "info" as const,
            description: "No duplicate ownership fingerprint detected.",
          },
        ],
      },
      timeline: {
        title: "Audit timeline",
        emptyTitle: "No audit events",
        emptyDescription: "Audit timeline events will appear here.",
        items: [
          {
            id: "timeline-1",
            timestampLabel: "Apr 09, 2026, 10:01 AM",
            title: "Download completed",
            description: "Source assets downloaded successfully.",
          },
        ],
      },
      comments: {
        title: "Reviewer comments",
        emptyTitle: "No reviewer comments",
        emptyDescription: "No reviewer comments were recorded for this report.",
        items: [
          {
            id: "comment-1",
            authorLabel: "QA reviewer",
            createdAtLabel: "Apr 09, 2026, 10:03 AM",
            body: "Confirmed lyric alignment and background-noise suppression.",
          },
        ],
      },
    },
  };

  it("renders title, artist, status, duration, resolution, source status, and created date", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(<LibraryAssetDetailClient viewModel={baseViewModel} prevId={null} nextId={null} />);

    expect(screen.getByText("Midnight City (Audited Mix)")).toBeInTheDocument();
    expect(screen.getByText("M83")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("04:03")).toBeInTheDocument();
    expect(screen.getByText("1080p")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getAllByText("04/09/2026").length).toBeGreaterThan(0);
  });

  it("renders a keyboard-accessible media player when playback is available", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(<LibraryAssetDetailClient viewModel={baseViewModel} prevId={null} nextId={null} />);

    expect(screen.getByText("Audited media preview")).toBeInTheDocument();
    expect(screen.getByLabelText(/audited media preview/i)).toBeInTheDocument();
  });

  it("renders report summary link when a linked report exists", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(<LibraryAssetDetailClient viewModel={baseViewModel} prevId={null} nextId={null} />);

    expect(screen.getByRole("link", { name: /open full report/i })).toHaveAttribute("href", "/reports/report-101");
    expect(screen.getByText("No rights conflicts, audio quality verified.")).toBeInTheDocument();
  });

  it("renders audit sections with report content", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(<LibraryAssetDetailClient viewModel={baseViewModel} prevId={null} nextId={null} />);

    expect(screen.getByText("Rule hits")).toBeInTheDocument();
    expect(screen.getByText("Audit timeline")).toBeInTheDocument();
    expect(screen.getByText("Reviewer comments")).toBeInTheDocument();
    expect(screen.getByText("Confirmed lyric alignment and background-noise suppression.")).toBeInTheDocument();
  });

  it("renders empty versions state gracefully", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(
      <LibraryAssetDetailClient
        viewModel={{ ...baseViewModel, versions: [] }}
        prevId={null}
        nextId={null}
      />,
    );

    expect(screen.getByText("No versions available yet.")).toBeInTheDocument();
  });

  it("renders deliberate fallback content when media is unavailable", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(
      <LibraryAssetDetailClient
        viewModel={{
          ...baseViewModel,
          mediaPlayer: {
            ...baseViewModel.mediaPlayer,
            sourceUrl: null,
          },
          reportSummary: null,
          auditSections: null,
        }}
        prevId={null}
        nextId={null}
      />,
    );

    expect(screen.getByText("Media unavailable")).toBeInTheDocument();
    expect(screen.queryByLabelText(/audited media preview/i)).not.toBeInTheDocument();
  });

  it("renders prev/next links when ids are provided", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(
      <LibraryAssetDetailClient viewModel={baseViewModel} prevId="asset-0" nextId="asset-2" />,
    );

    expect(screen.getByRole("link", { name: /previous asset/i })).toHaveAttribute("href", "/library/asset-0");
    expect(screen.getByRole("link", { name: /next asset/i })).toHaveAttribute("href", "/library/asset-2");
  });

  it("does not render prev/next links when ids are null", async () => {
    const { LibraryAssetDetailClient } = await import("@/components/features/library/library-asset-detail-client");

    render(<LibraryAssetDetailClient viewModel={baseViewModel} prevId={null} nextId={null} />);

    expect(screen.queryByRole("link", { name: /previous asset/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /next asset/i })).not.toBeInTheDocument();
  });
});
