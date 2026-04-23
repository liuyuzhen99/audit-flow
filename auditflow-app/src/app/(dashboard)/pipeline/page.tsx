import { PipelineDashboardClient } from "@/components/features/pipeline/pipeline-dashboard-client";
import { ErrorState } from "@/components/shared/error-state";
import { getPipelineDashboard } from "@/lib/api/pipeline";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { readListQuery } from "@/lib/query/list-query";
import { getRequestOrigin } from "@/lib/server/request-origin";

type PipelinePageProps = {
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

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const initialExpandedCandidateId = resolvedSearchParams.get("candidateId");
  const requestOrigin = await getRequestOrigin();
  let pipelineLoadError: string | null = null;
  let dashboardResponse;

  try {
    dashboardResponse = await getPipelineDashboard({
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
    pipelineLoadError = error instanceof Error ? error.message : "Failed to load pipeline";
    dashboardResponse = {
      summary: [],
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
      meta: { generatedAt: new Date().toISOString() },
      polling: { intervalMs: 15000, tick: 0, terminal: false },
    };
  }

  const dashboard = adaptPipelineDashboard(dashboardResponse);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Pipeline</h1>
          <p className="mt-3 text-lg text-slate-500">
            Monitor only in-review Phase 4 candidates and focus on the current workflow stage for a single song.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
            disabled
            title="Keep each smoke test constrained to one candidate"
          >
            One Candidate Per Run
          </button>
          <button
            className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
            disabled
            title="Console-style pipeline controls are not backed by the current Phase 4 API"
          >
            Console Controls Deferred
          </button>
        </div>
      </div>

      {pipelineLoadError ? (
        <ErrorState
          description={`${pipelineLoadError}. If you are doing local integration, make sure the Python API is running and RANDY_TRANSLATION_API_BASE_URL points to it.`}
          title="Pipeline backend unavailable"
        />
      ) : (
        <PipelineDashboardClient
          initialDashboard={dashboard}
          initialExpandedCandidateId={initialExpandedCandidateId}
        />
      )}
    </section>
  );
}
