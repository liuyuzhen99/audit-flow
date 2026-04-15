import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportDetailClient } from "@/components/features/reports/report-detail-client";

describe("ReportDetailClient", () => {
  const viewModel = {
    header: {
      title: "Midnight City Audit Report",
      subtitle: "M83 · Queue task queue-1",
      statusLabel: "Completed",
      statusTone: "success" as const,
      createdAtLabel: "Apr 09, 2026",
      completedAtLabel: "Apr 09, 2026, 10:06 AM",
      confidenceLabel: "98% confidence",
      ruleSummary: "No rights conflicts, audio quality verified.",
      transcriptLanguageLabel: "English",
      durationLabel: "04:03",
    },
    relatedAsset: {
      href: "/library/asset-1",
      label: "Open linked asset",
      title: "Midnight City (Audited Mix)",
      description: "Auto-approved · published",
    },
    decision: {
      label: "Auto-approved",
      tone: "success" as const,
    },
    ruleHits: {
      title: "Rule hits",
      emptyTitle: "No rule hits",
      emptyDescription: "No triggered rules were recorded.",
      items: [
        { id: "rule-1", title: "Rights fingerprint", badgeLabel: "Low", badgeTone: "info" as const, description: "No duplicate ownership fingerprint detected." },
      ],
    },
    timeline: {
      title: "Audit timeline",
      emptyTitle: "No audit events",
      emptyDescription: "Audit events will appear here.",
      items: [
        { id: "timeline-1", timestampLabel: "Apr 09, 2026, 10:01 AM", title: "Download completed", description: "Source assets downloaded successfully." },
      ],
    },
    comments: {
      title: "Reviewer comments",
      emptyTitle: "No reviewer comments",
      emptyDescription: "No reviewer comments were recorded for this report.",
      items: [
        { id: "comment-1", authorLabel: "QA reviewer", createdAtLabel: "Apr 09, 2026, 10:03 AM", body: "Confirmed lyric alignment and background-noise suppression." },
      ],
    },
  };

  it("renders canonical report detail content", () => {
    render(<ReportDetailClient viewModel={viewModel} />);

    expect(screen.getByRole("heading", { name: "Midnight City Audit Report" })).toBeInTheDocument();
    expect(screen.getByText("M83 · Queue task queue-1")).toBeInTheDocument();
    expect(screen.getByText("98% confidence")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open linked asset/i })).toHaveAttribute("href", "/library/asset-1");
    expect(screen.getByText("Rule hits")).toBeInTheDocument();
    expect(screen.getByText("Audit timeline")).toBeInTheDocument();
    expect(screen.getByText("Reviewer comments")).toBeInTheDocument();
  });

  it("renders without a related asset link when none exists", () => {
    render(<ReportDetailClient viewModel={{ ...viewModel, relatedAsset: null }} />);

    expect(screen.queryByRole("link", { name: /open linked asset/i })).not.toBeInTheDocument();
  });
});
