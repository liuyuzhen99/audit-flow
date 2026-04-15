import { ArtistsDashboardClient } from "@/components/features/artists/artists-dashboard-client";
import { StatCard } from "@/components/shared/stat-card";
import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { buildArtistsDashboardResponse } from "@/lib/mocks/sources/artists";
import { readListQuery } from "@/lib/query/list-query";

type ArtistsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(rawSearchParams: Record<string, string | string[] | undefined> | undefined) {
  const searchParams = new URLSearchParams();

  if (!rawSearchParams) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps = {}) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  // dateRange is Artists-scoped — read separately, not via shared parseListQueryParams
  const rawDateRange = resolvedSearchParams.get("dateRange");
  const dateRange = rawDateRange === "2w" ? "2w" : undefined;
  const dashboard = adaptArtistsDashboard(buildArtistsDashboardResponse({ ...query, dateRange }));

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

      <ArtistsDashboardClient pagination={dashboard.pagination} rows={dashboard.rows} />
    </section>
  );
}
