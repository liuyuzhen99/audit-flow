"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { getPhase9CutoverReadiness } from "@/lib/api/phase9";
import type { Phase9CutoverReadinessReportDto } from "@/types/phase9";

type Phase9ControlPanelProps = {
  initialError?: string | null;
  initialReport: Phase9CutoverReadinessReportDto | null;
};

function formatGateName(name: string) {
  return name
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeDetails(details: Record<string, unknown>) {
  if ("reason" in details && typeof details.reason === "string") {
    return details.reason;
  }
  if ("error" in details && typeof details.error === "string") {
    return details.error;
  }
  if ("required" in details) {
    return `Required: ${String(details.required)}`;
  }
  if ("is_within_threshold" in details && details.is_within_threshold === false) {
    return "dual-write report is outside threshold or unavailable";
  }
  if ("is_consistent" in details && details.is_consistent === false) {
    return "consistency evidence is not passing";
  }
  if (Object.keys(details).length === 0) {
    return "No gate evidence available";
  }
  return "";
}

export function Phase9ControlPanel({ initialError = null, initialReport }: Phase9ControlPanelProps) {
  const [report, setReport] = useState(initialReport);
  const [error, setError] = useState(initialError);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const blockedGates = report?.gates.filter((gate) => !gate.passed) ?? [];

  const refreshReadiness = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await getPhase9CutoverReadiness();
      setReport(response.report);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Failed to refresh Phase 9 readiness");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Phase 9 Cutover</p>
            {report ? (
              <StatusBadge
                label={report.readyForCutover ? "Ready" : "Blocked"}
                tone={report.readyForCutover ? "success" : "warning"}
              />
            ) : (
              <StatusBadge label="Unavailable" tone="danger" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>
              Read source: <strong className="font-semibold text-slate-900">{report?.readSource ?? "unknown"}</strong>
            </span>
            <span>
              Stability:{" "}
              <strong className="font-semibold text-slate-900">{report?.stabilityWindowDays ?? 0}d</strong>
            </span>
          </div>
          {blockedGates.length ? (
            <p className="mt-2 text-sm text-amber-700">
              Blocked gates: {blockedGates.map((gate) => formatGateName(gate.name)).join(", ")}
            </p>
          ) : null}
          {error ? <p className="mt-2 text-sm font-medium text-rose-700">{error}</p> : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing}
            onClick={() => {
              void refreshReadiness();
            }}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Checking" : "Run readiness check"}
          </button>
          <a
            className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white"
            href="/api/phase9/cutover-readiness"
            rel="noreferrer"
            target="_blank"
          >
            Open raw report
          </a>
        </div>
      </div>

      {report?.gates.length ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {report.gates.map((gate) => {
            const summary = summarizeDetails(gate.details);
            return (
              <div key={gate.name} className="rounded-xl border border-[var(--color-border)] bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-slate-700">{formatGateName(gate.name)}</p>
                  <StatusBadge label={gate.passed ? "Pass" : "Block"} tone={gate.passed ? "success" : "warning"} />
                </div>
                {summary ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{summary}</p> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
