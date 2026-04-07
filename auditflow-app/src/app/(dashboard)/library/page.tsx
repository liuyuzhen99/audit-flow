import type { ModuleSummary } from "@/types/common";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";

const libraryStats: ModuleSummary[] = [
  { label: "Published Assets", value: "24", hint: "8 visible in this view", tone: "success" },
  { label: "Processing", value: "3", hint: "Awaiting renders", tone: "info" },
  { label: "Needs Review", value: "1", hint: "One failed audit package", tone: "warning" },
  { label: "Recent Sync", value: "2m", hint: "Library refreshed recently", tone: "info" },
];

const assets = [
  { title: "Midnight City (Audited Mix)", artist: "M83", status: "Published", tone: "success" as const, duration: "04:03" },
  { title: "Blinding Lights - Official Audit", artist: "The Weeknd", status: "Published", tone: "success" as const, duration: "03:22" },
  { title: "Levitating (Visualizer v2)", artist: "Dua Lipa", status: "Processing", tone: "info" as const, duration: "03:50" },
  { title: "Bad Guy (Bass Boosted)", artist: "Billie Eilish", status: "Failed", tone: "danger" as const, duration: "03:14" },
];

export default function LibraryPage() {
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
          <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700">Grid View</button>
          <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">Refresh Sync</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {libraryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <PageToolbar
        left={
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">Artist: All</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">Last 30 days</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">Status: Published</button>
          </div>
        }
        right={<button className="text-sm font-semibold text-[var(--color-primary)]">Reset Filters</button>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {assets.map((asset, index) => (
          <article key={asset.title} className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className={`flex aspect-video items-end bg-gradient-to-br ${index % 4 === 0 ? "from-sky-950 via-indigo-700 to-fuchsia-500" : index % 4 === 1 ? "from-slate-950 via-fuchsia-900 to-orange-300" : index % 4 === 2 ? "from-violet-950 via-purple-700 to-fuchsia-400" : "from-amber-950 via-orange-900 to-black"} p-4 text-right text-white`}>
              <div className="ml-auto rounded-lg bg-black/55 px-3 py-1 text-xs font-semibold">
                1080p · {asset.duration}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{asset.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{asset.artist}</p>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge label={asset.status} tone={asset.tone} />
                <span className="text-sm text-slate-500">2024-03-2{index}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
