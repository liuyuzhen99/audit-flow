import type { ModuleSummary } from "@/types/common";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";

const artistStats: ModuleSummary[] = [
  { label: "Monitored Artists", value: "1,284", hint: "+12 this week", tone: "success" },
  { label: "New Releases", value: "86", hint: "24 awaiting manual review", tone: "info" },
  { label: "Auto-pass Rate", value: "94.2%", hint: "AI audit stable", tone: "success" },
  { label: "API Quota", value: "8,420", hint: "YouTube Data v3", tone: "warning" },
];

const artistRows = [
  { name: "The Weeknd", channel: "The Weeknd Official", releases: "3 new tracks", status: "Auto-approved", tone: "success" as const },
  { name: "Dua Lipa", channel: "Dua Lipa YT", releases: "1 new track", status: "Manual review", tone: "warning" as const },
  { name: "Travis Scott", channel: "Cactus Jack", releases: "5 new tracks", status: "Auto-rejected", tone: "danger" as const },
];

export default function ArtistsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Dashboard / Artist Monitoring</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-slate-950">Artists</h1>
          <p className="mt-3 text-lg text-slate-500">
            Monitor channels and discover newly published tracks entering the audit workflow.
          </p>
        </div>
        <div className="pt-2 text-sm font-medium text-emerald-600">24 live capture jobs active</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {artistStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <PageToolbar
        left={<SearchInput placeholder="Search artists or YouTube channels..." />}
        right={
          <>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">Recent 2 Weeks</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">Filter</button>
            <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">Bulk Download</button>
          </>
        }
      />

      <section className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-[1.8fr_1.1fr_1.4fr_1fr_1.2fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 text-sm font-semibold text-slate-500">
          <span>Artist</span>
          <span>Spotify Followers</span>
          <span>YouTube Channel</span>
          <span>Recent Releases</span>
          <span>Audit Status</span>
        </div>
        <div>
          {artistRows.map((row) => (
            <div key={row.name} className="grid grid-cols-[1.8fr_1.1fr_1.4fr_1fr_1.2fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 last:border-b-0">
              <div>
                <p className="text-lg font-semibold text-slate-900">{row.name}</p>
                <p className="text-sm text-slate-500">Last updated within the last few hours</p>
              </div>
              <p className="text-base font-semibold text-slate-800">42.1M</p>
              <p className="text-base text-slate-700">{row.channel}</p>
              <p className="text-base font-medium text-indigo-600">{row.releases}</p>
              <StatusBadge label={row.status} tone={row.tone} />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
