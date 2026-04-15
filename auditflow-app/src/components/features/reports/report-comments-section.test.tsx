import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportCommentsSection } from "@/components/features/reports/report-comments-section";

describe("ReportCommentsSection", () => {
  const items = [
    { id: "comment-1", authorLabel: "QA reviewer", createdAtLabel: "Apr 09, 2026, 10:03 AM", body: "Confirmed lyric alignment and background-noise suppression." },
    { id: "comment-2", authorLabel: "Translation reviewer", createdAtLabel: "Apr 09, 2026, 10:04 AM", body: "Check slang translation in verse two before final export." },
    { id: "comment-3", authorLabel: "Policy reviewer", createdAtLabel: "Apr 09, 2026, 10:05 AM", body: "<script>alert('xss')</script> should render as plain text." },
  ];

  it("renders populated comments as plain text", () => {
    render(
      <ReportCommentsSection
        section={{
          title: "Reviewer comments",
          emptyTitle: "No reviewer comments",
          emptyDescription: "No reviewer comments were recorded for this report.",
          items,
        }}
      />,
    );

    expect(screen.getByText("Reviewer comments")).toBeInTheDocument();
    expect(screen.getByText("QA reviewer")).toBeInTheDocument();
    expect(screen.getByText("<script>alert('xss')</script> should render as plain text.")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("bounds the initial render and expands on demand", () => {
    render(
      <ReportCommentsSection
        defaultVisibleCount={2}
        section={{
          title: "Reviewer comments",
          emptyTitle: "No reviewer comments",
          emptyDescription: "No reviewer comments were recorded for this report.",
          items,
        }}
      />,
    );

    expect(screen.queryByText(/plain text\./i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show 1 more comment/i }));

    expect(screen.getByText(/plain text\./i)).toBeInTheDocument();
  });

  it("renders an empty state when no comments exist", () => {
    render(
      <ReportCommentsSection
        section={{
          title: "Reviewer comments",
          emptyTitle: "No reviewer comments",
          emptyDescription: "No reviewer comments were recorded for this report.",
          items: [],
        }}
      />,
    );

    expect(screen.getByText("No reviewer comments")).toBeInTheDocument();
  });
});
