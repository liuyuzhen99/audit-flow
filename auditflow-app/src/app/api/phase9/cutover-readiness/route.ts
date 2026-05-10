import { NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";

type BackendPhase9Gate = {
  name?: unknown;
  passed?: unknown;
  details?: unknown;
};

type BackendPhase9Report = {
  generated_at?: unknown;
  read_source?: unknown;
  stability_window_days?: unknown;
  ready_for_cutover?: unknown;
  gates?: unknown;
};

type BackendPhase9Response = {
  report?: BackendPhase9Report;
  error?: { message?: string };
  detail?: string;
};

function normalizeGate(gate: BackendPhase9Gate) {
  return {
    name: typeof gate.name === "string" ? gate.name : "unknown",
    passed: gate.passed === true,
    details:
      gate.details && typeof gate.details === "object" && !Array.isArray(gate.details)
        ? gate.details as Record<string, unknown>
        : {},
  };
}

function normalizeReport(report: BackendPhase9Report) {
  const gates = Array.isArray(report.gates) ? report.gates.map((gate) => normalizeGate(gate as BackendPhase9Gate)) : [];

  return {
    generatedAt: typeof report.generated_at === "string" ? report.generated_at : new Date().toISOString(),
    readSource: typeof report.read_source === "string" ? report.read_source : "unknown",
    stabilityWindowDays:
      typeof report.stability_window_days === "number" && Number.isFinite(report.stability_window_days)
        ? report.stability_window_days
        : 0,
    readyForCutover: report.ready_for_cutover === true,
    gates,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/internal/phase9/cutover-readiness`, {
      cache: "no-store",
    });
    const payload = await parseBackendJson<BackendPhase9Response>(response);

    if (!response.ok || !payload.report) {
      return createErrorResponse(
        response.ok ? 502 : response.status,
        "phase9_cutover_readiness_failed",
        getBackendErrorMessage(payload, "Failed to load Phase 9 cutover readiness"),
      );
    }

    return NextResponse.json({ report: normalizeReport(payload.report) });
  } catch (error) {
    return createErrorResponse(
      502,
      "phase9_cutover_readiness_failed",
      error instanceof Error ? error.message : "Failed to reach Phase 9 backend",
    );
  }
}
