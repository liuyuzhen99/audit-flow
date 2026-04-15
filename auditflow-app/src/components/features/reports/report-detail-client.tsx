"use client";

import Link from "next/link";

import { ReportCommentsSection } from "@/components/features/reports/report-comments-section";
import { ReportRuleHitsSection } from "@/components/features/reports/report-rule-hits-section";
import { ReportTimelineSection } from "@/components/features/reports/report-timeline-section";
import { StatusBadge } from "@/components/shared/status-badge";

type ReportDetailClientProps = {
  viewModel: ReturnType<typeof import("@/lib/adapters/reports").adaptReportDetail>;
};

export function ReportDetailClient({ viewModel }: ReportDetailClientProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{viewModel.header.title}</h1>
              <StatusBadge label={viewModel.header.statusLabel} tone={viewModel.header.statusTone} />
            </div>
            <p className="text-lg text-slate-500">{viewModel.header.subtitle}</p>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">{viewModel.header.ruleSummary}</p>
          </div>

          {viewModel.relatedAsset ? (
            <Link
              className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              href={viewModel.relatedAsset.href}
            >
              {viewModel.relatedAsset.label}
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Created" value={viewModel.header.createdAtLabel} />
          <MetricCard label="Completed" value={viewModel.header.completedAtLabel} />
          <MetricCard label="Confidence" value={viewModel.header.confidenceLabel} />
          <MetricCard label="Duration" value={viewModel.header.durationLabel} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Transcript" value={viewModel.header.transcriptLanguageLabel} />
          <MetricCard label="Decision" value={viewModel.decision.label} tone={viewModel.decision.tone} />
          {viewModel.relatedAsset ? (
            <MetricCard label="Linked asset" value={viewModel.relatedAsset.title} />
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ReportRuleHitsSection section={viewModel.ruleHits} />
        <ReportTimelineSection section={viewModel.timeline} />
      </div>

      <ReportCommentsSection section={viewModel.comments} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={tone ? "mt-2 text-sm font-semibold text-slate-900" : "mt-2 text-sm font-semibold text-slate-900"}>{value}</p>
    </div>
  );
}
