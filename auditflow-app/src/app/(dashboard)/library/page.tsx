import { LibraryDashboardClient } from "@/components/features/library/library-dashboard-client";
import { adaptLibraryDashboard } from "@/lib/adapters/library";
import { buildLibraryDashboardResponse } from "@/lib/mocks/sources/library";
import { readListQuery } from "@/lib/query/list-query";

type LibraryPageProps = {
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

export default async function LibraryPage({ searchParams }: LibraryPageProps = {}) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const dashboard = adaptLibraryDashboard(buildLibraryDashboardResponse(query));

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

      <LibraryDashboardClient cards={dashboard.cards} summary={dashboard.summary} />
    </section>
  );
}
