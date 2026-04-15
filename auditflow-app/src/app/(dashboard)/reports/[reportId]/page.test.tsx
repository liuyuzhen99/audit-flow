import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReportPage from "@/app/(dashboard)/reports/[reportId]/page";

describe("report detail page", () => {
  it("renders report detail for a valid report id", async () => {
    render(
      await ReportPage({
        params: Promise.resolve({ reportId: "report-101" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Midnight City Audit Report" })).toBeInTheDocument();
    expect(screen.getByText("Rule hits")).toBeInTheDocument();
    expect(screen.getByText("Reviewer comments")).toBeInTheDocument();
  });

  it("throws notFound for an unknown report id", async () => {
    await expect(
      ReportPage({
        params: Promise.resolve({ reportId: "report-missing" }),
      }),
    ).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK") });
  });
});
