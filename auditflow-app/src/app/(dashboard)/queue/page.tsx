import { QueueDashboardClient } from "@/components/features/queue/queue-dashboard-client";
import { ErrorState } from "@/components/shared/error-state";
import { getQueueDashboard } from "@/lib/api/queue";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { readListQuery } from "@/lib/query/list-query";
import { getRequestOrigin } from "@/lib/server/request-origin";

type QueuePageProps = {
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

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const requestOrigin = await getRequestOrigin();
  let queueLoadError: string | null = null;
  let dashboardResponse;

  try {
    dashboardResponse = await getQueueDashboard({
      baseUrl: requestOrigin,
      query: {
        page: query.page,
        pageSize: query.pageSize,
        q: query.q,
        status: query.status,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        tick: query.tick ?? 0,
      },
    });
  } catch (error) {
    queueLoadError = error instanceof Error ? error.message : "Failed to load audit queue";
    dashboardResponse = {
      summary: [],
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: new Date().toISOString() },
      polling: { intervalMs: 15000, tick: 0, terminal: false },
    };
  }

  const dashboard = adaptQueueDashboard(dashboardResponse);

  return (
    <section className="space-y-6">
      <div>
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Audit Queue</h1>
          <p className="mt-3 text-lg text-slate-500">
            Review one candidate at a time through the real review workflow approval checkpoints.
          </p>
        </div>
      </div>

      {queueLoadError ? (
        <ErrorState
          description={`${queueLoadError}. If you are doing local integration, make sure the Python API is running and RANDY_TRANSLATION_API_BASE_URL points to it.`}
          title="Audit queue backend unavailable"
        />
      ) : (
        <QueueDashboardClient initialDashboard={dashboard} />
      )}
    </section>
  );
}
