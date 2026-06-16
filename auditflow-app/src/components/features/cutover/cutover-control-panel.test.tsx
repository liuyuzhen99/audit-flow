import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCutoverReadiness = vi.fn();

vi.mock("@/lib/api/cutover", () => ({
  getCutoverReadiness: () => mockGetCutoverReadiness(),
}));

const blockedReport = {
  generatedAt: "2026-04-29T12:00:00.000Z",
  readSource: "legacy",
  stabilityWindowDays: 7,
  readyForCutover: false,
  gates: [
    { name: "schema_freeze", passed: false, details: { required: true } },
    { name: "rollback_window", passed: true, details: { required: "rollback must remain enabled during cutover" } },
    { name: "dual_write", passed: false, details: { is_within_threshold: false } },
    { name: "shadow_traffic", passed: false, details: { reason: "shadow traffic report unavailable" } },
  ],
};

const readyReport = {
  ...blockedReport,
  readSource: "postgres",
  readyForCutover: true,
  gates: blockedReport.gates.map((gate) => ({ ...gate, passed: true, details: {} })),
};

describe("CutoverControlPanel", () => {
  beforeEach(() => {
    mockGetCutoverReadiness.mockReset();
  });

  it("renders blocked readiness with gate reasons and raw report link", async () => {
    const { CutoverControlPanel } = await import("@/components/features/cutover/cutover-control-panel");

    render(<CutoverControlPanel initialReport={blockedReport} />);

    expect(screen.getByText("Cutover Readiness")).toBeInTheDocument();
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText(/Blocked gates: Schema Freeze, Dual Write, Shadow Traffic/i)).toBeInTheDocument();
    expect(screen.getByText("dual-write report is outside threshold or unavailable")).toBeInTheDocument();
    expect(screen.getByText("shadow traffic report unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open raw report" })).toHaveAttribute(
      "href",
      "/api/cutover/readiness",
    );
  });

  it("refreshes readiness report on demand", async () => {
    mockGetCutoverReadiness.mockResolvedValue({ report: readyReport });
    const { CutoverControlPanel } = await import("@/components/features/cutover/cutover-control-panel");

    render(<CutoverControlPanel initialReport={blockedReport} />);

    fireEvent.click(screen.getByRole("button", { name: "Run readiness check" }));

    expect(screen.getByRole("button", { name: "Checking" })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeInTheDocument();
    });
    expect(screen.getByText(/Read source:/i).parentElement).toHaveTextContent("postgres");
  });

  it("keeps the previous report visible when refresh fails", async () => {
    mockGetCutoverReadiness.mockRejectedValue(new Error("backend unavailable"));
    const { CutoverControlPanel } = await import("@/components/features/cutover/cutover-control-panel");

    render(<CutoverControlPanel initialReport={blockedReport} />);

    fireEvent.click(screen.getByRole("button", { name: "Run readiness check" }));

    await waitFor(() => {
      expect(screen.getByText("backend unavailable")).toBeInTheDocument();
    });
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("renders backend unavailable state without an initial report", async () => {
    const { CutoverControlPanel } = await import("@/components/features/cutover/cutover-control-panel");

    render(<CutoverControlPanel initialError="cutover backend unavailable" initialReport={null} />);

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("cutover backend unavailable")).toBeInTheDocument();
  });
});
