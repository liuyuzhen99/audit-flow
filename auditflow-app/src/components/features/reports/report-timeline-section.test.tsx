import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportTimelineSection } from "@/components/features/reports/report-timeline-section";

describe("ReportTimelineSection", () => {
  const items = [
    { id: "timeline-1", timestampLabel: "Apr 09, 2026, 10:01 AM", title: "Download completed", description: "Source assets downloaded successfully." },
    { id: "timeline-2", timestampLabel: "Apr 09, 2026, 10:03 AM", title: "Transcript reviewed", description: "Transcript confidence exceeded the auto-review threshold." },
    { id: "timeline-3", timestampLabel: "Apr 09, 2026, 10:05 AM", title: "Rule engine completed", description: "All configured policy checks completed." },
    { id: "timeline-4", timestampLabel: "Apr 09, 2026, 10:06 AM", title: "Audit approved", description: "The report reached an auto-approved terminal state." },
  ];

  it("renders populated timeline events", () => {
    render(
      <ReportTimelineSection
        section={{
          title: "Audit timeline",
          emptyTitle: "No audit events",
          emptyDescription: "Audit events will appear here.",
          items,
        }}
      />,
    );

    expect(screen.getByText("Audit timeline")).toBeInTheDocument();
    expect(screen.getByText("Download completed")).toBeInTheDocument();
  });

  it("bounds the initial render and expands on demand", () => {
    render(
      <ReportTimelineSection
        defaultVisibleCount={2}
        section={{
          title: "Audit timeline",
          emptyTitle: "No audit events",
          emptyDescription: "Audit events will appear here.",
          items,
        }}
      />,
    );

    expect(screen.queryByText("Rule engine completed")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show 2 more timeline events/i }));

    expect(screen.getByText("Rule engine completed")).toBeInTheDocument();
    expect(screen.getByText("Audit approved")).toBeInTheDocument();
  });

  it("renders an empty state when no timeline events exist", () => {
    render(
      <ReportTimelineSection
        section={{
          title: "Audit timeline",
          emptyTitle: "No audit events",
          emptyDescription: "Audit events will appear here.",
          items: [],
        }}
      />,
    );

    expect(screen.getByText("No audit events")).toBeInTheDocument();
  });
});
