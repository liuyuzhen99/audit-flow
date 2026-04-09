import { PageToolbar } from "@/components/shared/page-toolbar";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { adaptLibraryDashboard } from "@/lib/adapters/library";
import { buildLibraryDashboardResponse } from "@/lib/mocks/sources/library";

export default async function LibraryPage() {
  const dashboard = adaptLibraryDashboard(buildLibraryDashboardResponse());

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Library</h1>
          <p className="mt-3 text-lg text-slate-500">
            Search, preview, and manage processed media assets ready for internal distribution.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700">
            Grid View
          </button>
          <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Refresh Sync
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboard.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <PageToolbar
        left={
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">
              Artist: All
            </button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">
              Last 30 days
            </button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">
              Status: Published
            </button>
          </div>
        }
        right={<button className="text-sm font-semibold text-[var(--color-primary)]">Reset Filters</button>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.cards.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div
              className={`flex aspect-video items-end bg-gradient-to-br ${asset.gradientClassName} p-4 text-right text-white`}
            >
              <div className="ml-auto rounded-lg bg-black/55 px-3 py-1 text-xs font-semibold">
                {asset.resolutionLabel} · {asset.durationLabel}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{asset.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{asset.artistName}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <StatusBadge label={asset.statusLabel} tone={asset.statusTone} />
                <span className="text-sm text-slate-500">{asset.dateLabel}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
