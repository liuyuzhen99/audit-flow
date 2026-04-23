import { LibraryDashboardClient } from "@/components/features/library/library-dashboard-client";
import { ErrorState } from "@/components/shared/error-state";
import { getLibraryDashboard } from "@/lib/api/library";
import { adaptLibraryDashboard } from "@/lib/adapters/library";
import { readListQuery } from "@/lib/query/list-query";
import { getRequestOrigin } from "@/lib/server/request-origin";

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

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const requestOrigin = await getRequestOrigin();
  let libraryLoadError: string | null = null;
  let dashboardResponse;

  try {
    dashboardResponse = await getLibraryDashboard({
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
    libraryLoadError = error instanceof Error ? error.message : "Failed to load library";
    dashboardResponse = {
      summary: [],
      items: [],
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  const dashboard = adaptLibraryDashboard(dashboardResponse);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Library</h1>
          <p className="mt-3 text-lg text-slate-500">
            Review the real accepted-asset list after a single candidate completes the workflow.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
            disabled
            title="Library detail remains outside this Phase 4 integration pass"
          >
            Detail Deferred
          </button>
          <button
            className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
            disabled
            title="Keep smoke tests focused on a single asset at a time"
          >
            One Asset Per Run
          </button>
        </div>
      </div>

      {libraryLoadError ? (
        <ErrorState
          description={`${libraryLoadError}. If you are doing local integration, make sure the Python API is running and RANDY_TRANSLATION_API_BASE_URL points to it.`}
          title="Library backend unavailable"
        />
      ) : (
        <LibraryDashboardClient cards={dashboard.cards} summary={dashboard.summary} />
      )}
    </section>
  );
}
