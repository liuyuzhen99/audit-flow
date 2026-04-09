import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { buildArtistsDashboardResponse } from "@/lib/mocks/sources/artists";

export default async function ArtistsPage() {
  const dashboard = adaptArtistsDashboard(buildArtistsDashboardResponse());

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
        {dashboard.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
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
          {dashboard.rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1.8fr_1.1fr_1.4fr_1fr_1.2fr] gap-4 border-b border-[var(--color-border)] px-6 py-5 last:border-b-0">
              <div>
                <p className="text-lg font-semibold text-slate-900">{row.name}</p>
                <p className="text-sm text-slate-500">{row.freshnessLabel}</p>
              </div>
              <p className="text-base font-semibold text-slate-800">{row.followerLabel}</p>
              <p className="text-base text-slate-700">{row.channelLabel}</p>
              <p className="text-base font-medium text-indigo-600">{row.releasesLabel}</p>
              <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
