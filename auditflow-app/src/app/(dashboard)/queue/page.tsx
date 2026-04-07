import type { ModuleSummary } from "@/types/common";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";

const queueStats: ModuleSummary[] = [
  { label: "Active Tasks", value: "24", tone: "info" },
  { label: "Auto-approved Today", value: "142", tone: "success" },
  { label: "Manual Review", value: "12", tone: "warning" },
  { label: "Auto-rejected", value: "5", tone: "danger" },
];

const queueRows = [
  { title: "Midnight City (Remix)", artist: "M83", status: "Auto-approved", tone: "success" as const, confidence: "98%", summary: "No rights conflicts, audio quality verified", progress: "Audit score 100%" },
  { title: "Levitating", artist: "Dua Lipa", status: "Auditing", tone: "info" as const, confidence: "--%", summary: "Scanning content fingerprints...", progress: "Audit score 65%" },
  { title: "Starboy (Live)", artist: "The Weeknd", status: "Manual review", tone: "warning" as const, confidence: "72%", summary: "Potential crowd noise detected", progress: "Audit score 100%" },
];

export default function QueuePage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Audit Queue</h1>
          <p className="mt-3 text-lg text-slate-500">
            Track download progress, AI audit status, and manual review routing in one operational view.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700">Export Report</button>
          <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">Route to Pipeline</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {queueStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <PageToolbar
          className="rounded-b-none border-x-0 border-t-0 shadow-none"
          left={<SearchInput placeholder="Search songs, artists, or task IDs..." />}
          right={
            <>
              <button className="rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">All</button>
              <button className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700">Processing</button>
              <button className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700">Flagged</button>
              <button className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700">Completed</button>
            </>
          }
        />

        <div className="grid grid-cols-[1.8fr_1.1fr_1fr_1.6fr_1.1fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 text-sm font-semibold text-slate-500">
          <span>Track</span>
          <span>Audit Status</span>
          <span>Confidence</span>
          <span>Rule Summary</span>
          <span>Progress</span>
        </div>

        <div>
          {queueRows.map((row) => (
            <div key={row.title} className="grid grid-cols-[1.8fr_1.1fr_1fr_1.6fr_1.1fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 last:border-b-0">
              <div>
                <p className="text-lg font-semibold text-slate-900">{row.title}</p>
                <p className="text-sm text-slate-500">{row.artist}</p>
              </div>
              <StatusBadge label={row.status} tone={row.tone} />
              <p className="text-base font-semibold text-slate-800">{row.confidence}</p>
              <p className="text-sm text-slate-600">{row.summary}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">{row.progress}</p>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-3/4 rounded-full bg-[var(--color-primary)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
