import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportRuleHitsSection } from "@/components/features/reports/report-rule-hits-section";

describe("ReportRuleHitsSection", () => {
  const items = [
    { id: "rule-1", title: "Rights fingerprint", badgeLabel: "Low", badgeTone: "info" as const, description: "No duplicate ownership fingerprint detected." },
    { id: "rule-2", title: "Lyric confidence", badgeLabel: "Medium", badgeTone: "warning" as const, description: "One slang segment needs translator verification." },
    { id: "rule-3", title: "Crowd noise", badgeLabel: "High", badgeTone: "danger" as const, description: "Manual verification recommended for chorus section." },
    { id: "rule-4", title: "Export checksum", badgeLabel: "Low", badgeTone: "info" as const, description: "Export package checksum completed successfully." },
  ];

  it("renders populated rule hits", () => {
    render(
      <ReportRuleHitsSection
        section={{
          title: "Rule hits",
          emptyTitle: "No rule hits",
          emptyDescription: "No triggered rules were recorded.",
          items,
        }}
      />,
    );

    expect(screen.getByText("Rule hits")).toBeInTheDocument();
    expect(screen.getByText("Rights fingerprint")).toBeInTheDocument();
    expect(screen.getByText("Lyric confidence")).toBeInTheDocument();
  });

  it("bounds the initial render and expands on demand", () => {
    render(
      <ReportRuleHitsSection
        defaultVisibleCount={2}
        section={{
          title: "Rule hits",
          emptyTitle: "No rule hits",
          emptyDescription: "No triggered rules were recorded.",
          items,
        }}
      />,
    );

    expect(screen.queryByText("Crowd noise")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show 2 more rule hits/i }));

    expect(screen.getByText("Crowd noise")).toBeInTheDocument();
    expect(screen.getByText("Export checksum")).toBeInTheDocument();
  });

  it("renders an empty state when no rule hits exist", () => {
    render(
      <ReportRuleHitsSection
        section={{
          title: "Rule hits",
          emptyTitle: "No rule hits",
          emptyDescription: "No triggered rules were recorded.",
          items: [],
        }}
      />,
    );

    expect(screen.getByText("No rule hits")).toBeInTheDocument();
  });

  it("renders a loading state when requested", () => {
    render(
      <ReportRuleHitsSection
        isLoading
        section={{
          title: "Rule hits",
          emptyTitle: "No rule hits",
          emptyDescription: "No triggered rules were recorded.",
          items: [],
        }}
      />,
    );

    expect(screen.getByText("Loading rule hits")).toBeInTheDocument();
  });
});
