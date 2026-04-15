"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Film, Layers, Calendar, FileText } from "lucide-react";

import { ReportCommentsSection } from "@/components/features/reports/report-comments-section";
import { ReportRuleHitsSection } from "@/components/features/reports/report-rule-hits-section";
import { ReportTimelineSection } from "@/components/features/reports/report-timeline-section";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { LibraryAssetDetailViewModel } from "@/types/library";

type LibraryAssetDetailClientProps = {
  viewModel: LibraryAssetDetailViewModel;
  prevId: string | null;
  nextId: string | null;
};

export function LibraryAssetDetailClient({ viewModel, prevId, nextId }: LibraryAssetDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{viewModel.title}</h1>
          <p className="mt-2 text-lg text-slate-500">{viewModel.artistName}</p>
          <div className="mt-3">
            <StatusBadge label={viewModel.statusLabel} tone={viewModel.statusTone} />
          </div>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center gap-2">
          {prevId ? (
            <Link
              aria-label="Previous asset"
              className="flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              href={`/library/${prevId}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Link>
          ) : (
            <span className="flex cursor-not-allowed select-none items-center gap-1.5 rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-slate-300">
              <ChevronLeft className="h-4 w-4" />
              Prev
            </span>
          )}
          {nextId ? (
            <Link
              aria-label="Next asset"
              className="flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              href={`/library/${nextId}`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex cursor-not-allowed select-none items-center gap-1.5 rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-slate-300">
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            {viewModel.mediaPlayer.sourceUrl ? (
              <div className="space-y-4 p-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{viewModel.mediaPlayer.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{viewModel.mediaPlayer.description}</p>
                </div>
                {/* The media element is the accessible playback surface for Phase 5. */}
                <video
                  aria-label={viewModel.mediaPlayer.title}
                  className={`aspect-video w-full rounded-[20px] bg-gradient-to-br ${viewModel.gradientClassName} object-cover`}
                  controls
                  playsInline
                  poster={viewModel.mediaPlayer.posterUrl ?? undefined}
                  preload="metadata"
                >
                  <source src={viewModel.mediaPlayer.sourceUrl} type={viewModel.mediaPlayer.mimeType ?? undefined} />
                </video>
              </div>
            ) : (
              <EmptyState
                className="m-4"
                description={viewModel.mediaPlayer.fallbackDescription}
                title={viewModel.mediaPlayer.fallbackTitle}
              />
            )}
          </section>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetaCard icon={<Clock className="h-4 w-4" />} label="Duration" value={viewModel.durationLabel} />
            <MetaCard icon={<Film className="h-4 w-4" />} label="Resolution" value={viewModel.resolutionLabel} />
            <MetaCard icon={<Layers className="h-4 w-4" />} label="Source" value={viewModel.sourceStatusLabel} />
            <MetaCard icon={<Calendar className="h-4 w-4" />} label="Created" value={viewModel.createdAtLabel} />
          </div>

          {viewModel.auditSections ? (
            <div className="space-y-5">
              <ReportRuleHitsSection section={viewModel.auditSections.ruleHits} />
              <ReportTimelineSection section={viewModel.auditSections.timeline} />
              <ReportCommentsSection section={viewModel.auditSections.comments} />
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Versions</h2>
            {viewModel.versions.length === 0 ? (
              <p className="text-sm text-slate-400">No versions available yet.</p>
            ) : (
              <ul className="space-y-3">
                {viewModel.versions.map((version) => (
                  <li
                    key={version.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-slate-800">{version.label}</span>
                    <span className="shrink-0 text-xs text-slate-400">{version.createdAtLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {viewModel.reportSummary ? (
            <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{viewModel.reportSummary.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{viewModel.reportSummary.summaryLabel}</p>
                </div>
                <StatusBadge label={viewModel.reportSummary.decisionLabel} tone={viewModel.reportSummary.decisionTone} />
              </div>
              <Link
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                href={viewModel.reportSummary.href}
              >
                <FileText className="h-4 w-4" />
                {viewModel.reportSummary.linkLabel}
              </Link>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-slate-50 p-5">
              <h2 className="mb-2 text-base font-semibold text-slate-900">Audit Activity</h2>
              <p className="text-sm text-slate-400">No linked report is available for this asset yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
      <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">{icon}</div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
