import { ArtistsDashboardClient } from "@/components/features/artists/artists-dashboard-client";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { getArtistsDashboard } from "@/lib/api/artists";
import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { readListQuery } from "@/lib/query/list-query";
import { getRequestOrigin } from "@/lib/server/request-origin";

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

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const requestOrigin = await getRequestOrigin();
  let dashboardResponse;
  let artistsLoadError: string | null = null;

  try {
    dashboardResponse = await getArtistsDashboard({
      baseUrl: requestOrigin,
      query: {
        page: query.page,
        pageSize: query.pageSize,
        q: query.q,
        status: query.status,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      },
    });
  } catch (error) {
    artistsLoadError = error instanceof Error ? error.message : "Failed to load artists dashboard";
    dashboardResponse = {
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  const dashboard = adaptArtistsDashboard(dashboardResponse);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Dashboard / Artist Monitoring</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-slate-950">Artists</h1>
          <p className="mt-3 text-lg text-slate-500">
            Monitor artist sync health, channel resolution, and newly discovered candidate videos.
          </p>
        </div>
        <div className="pt-2 text-sm font-medium text-slate-500">Snapshot {dashboardResponse.meta.generatedAt}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboard.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      {artistsLoadError ? (
        <ErrorState
          description={`${artistsLoadError}. If you are doing local integration, make sure the Python API is running and RANDY_TRANSLATION_API_BASE_URL points to it.`}
          title="Artists backend unavailable"
        />
      ) : (
        <ArtistsDashboardClient pagination={dashboard.pagination} rows={dashboard.rows} />
      )}
    </section>
  );
}
