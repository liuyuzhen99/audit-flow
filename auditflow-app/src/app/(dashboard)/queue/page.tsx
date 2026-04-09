import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";

export default async function QueuePage() {
  const dashboard = adaptQueueDashboard(buildQueueDashboardResponse({ tick: 0 }));

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
        {dashboard.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
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
          {dashboard.rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1.8fr_1.1fr_1fr_1.6fr_1.1fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 last:border-b-0">
              <div>
                <p className="text-lg font-semibold text-slate-900">{row.title}</p>
                <p className="text-sm text-slate-500">{row.artistName}</p>
              </div>
              <StatusBadge label={row.statusLabel} tone={row.statusTone} />
              <p className="text-base font-semibold text-slate-800">{row.confidenceLabel}</p>
              <div>
                <p className="text-sm text-slate-600">{row.summaryLabel}</p>
                <p className="mt-2 text-xs text-slate-400">Updated {row.updatedLabel}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">{row.progressLabel}</p>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${row.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
