import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPhase9CutoverReadiness = vi.fn();

vi.mock("@/lib/api/phase9", () => ({
  getPhase9CutoverReadiness: () => mockGetPhase9CutoverReadiness(),
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

describe("Phase9ControlPanel", () => {
  beforeEach(() => {
    mockGetPhase9CutoverReadiness.mockReset();
  });

  it("renders blocked readiness with gate reasons and raw report link", async () => {
    const { Phase9ControlPanel } = await import("@/components/features/phase9/phase9-control-panel");

    render(<Phase9ControlPanel initialReport={blockedReport} />);

    expect(screen.getByText("Phase 9 Cutover")).toBeInTheDocument();
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText(/Blocked gates: Schema Freeze, Dual Write, Shadow Traffic/i)).toBeInTheDocument();
    expect(screen.getByText("dual-write report is outside threshold or unavailable")).toBeInTheDocument();
    expect(screen.getByText("shadow traffic report unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open raw report" })).toHaveAttribute(
      "href",
      "/api/phase9/cutover-readiness",
    );
  });

  it("refreshes readiness report on demand", async () => {
    mockGetPhase9CutoverReadiness.mockResolvedValue({ report: readyReport });
    const { Phase9ControlPanel } = await import("@/components/features/phase9/phase9-control-panel");

    render(<Phase9ControlPanel initialReport={blockedReport} />);

    fireEvent.click(screen.getByRole("button", { name: "Run readiness check" }));

    expect(screen.getByRole("button", { name: "Checking" })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeInTheDocument();
    });
    expect(screen.getByText(/Read source:/i).parentElement).toHaveTextContent("postgres");
  });

  it("keeps the previous report visible when refresh fails", async () => {
    mockGetPhase9CutoverReadiness.mockRejectedValue(new Error("backend unavailable"));
    const { Phase9ControlPanel } = await import("@/components/features/phase9/phase9-control-panel");

    render(<Phase9ControlPanel initialReport={blockedReport} />);

    fireEvent.click(screen.getByRole("button", { name: "Run readiness check" }));

    await waitFor(() => {
      expect(screen.getByText("backend unavailable")).toBeInTheDocument();
    });
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("renders backend unavailable state without an initial report", async () => {
    const { Phase9ControlPanel } = await import("@/components/features/phase9/phase9-control-panel");

    render(<Phase9ControlPanel initialError="Phase 9 backend unavailable" initialReport={null} />);

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Phase 9 backend unavailable")).toBeInTheDocument();
  });
});
