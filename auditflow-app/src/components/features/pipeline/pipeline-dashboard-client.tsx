"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getPipelineDashboard } from "@/lib/api/pipeline";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { usePollingResource } from "@/hooks/use-polling-resource";

type PipelineDashboardViewModel = ReturnType<typeof adaptPipelineDashboard>;

type PipelineDashboardClientProps = {
  initialDashboard: PipelineDashboardViewModel;
  initialExpandedCandidateId?: string | null;
};

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Transcript", value: "transcript_review" },
  { label: "Taste", value: "taste_audit" },
  { label: "Manual", value: "manual_review" },
  { label: "Translation", value: "translation_review" },
  { label: "Final", value: "final_asset_approval" },
] as const;

export function PipelineDashboardClient({
  initialDashboard,
  initialExpandedCandidateId = null,
}: PipelineDashboardClientProps) {
  const { query, searchValue, setPage, setPageSize, setSearchValue, setStatus } = useListQueryState();
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(initialExpandedCandidateId);
  const { data, error, isRefreshing } = usePollingResource({
    initialData: initialDashboard,
    load: async (nextTick) =>
      adaptPipelineDashboard(
        await getPipelineDashboard({
          query: {
            page: query.page,
            pageSize: query.pageSize,
            q: query.q,
            status: query.status,
            sortBy: query.sortBy,
            sortDirection: query.sortDirection,
            tick: nextTick,
          },
        }),
      ),
    paused: isSearchPending,
    resetKey: `${query.page}|${query.pageSize}|${query.q ?? ""}|${query.status ?? ""}|${query.sortBy ?? ""}|${query.sortDirection ?? ""}`,
  });

  const rows = useMemo(() => data.rows, [data.rows]);
  const pagination = data.pagination;

  useEffect(() => {
    if (!initialExpandedCandidateId) {
      return;
    }
    setExpandedCandidateId(initialExpandedCandidateId);
  }, [initialExpandedCandidateId]);

  useEffect(() => {
    if (expandedCandidateId && !rows.some((row) => row.candidateId === expandedCandidateId)) {
      setExpandedCandidateId(null);
    }
  }, [expandedCandidateId, rows]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {data.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <PageToolbar
          className="rounded-b-none border-x-0 border-t-0 px-0 pb-4 pt-0 shadow-none"
          left={
            <SearchInput
              className="xl:max-w-2xl"
              debounceMs={400}
              onPendingChange={setIsSearchPending}
              onValueChange={setSearchValue}
              placeholder="Search candidate title or artist..."
              value={searchValue}
            />
          }
          right={
            <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => {
              const isActive = (query.status ?? undefined) === option.value;

              return (
                <button
                  className={isActive
                    ? "rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
                    : "rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700"
                  }
                  key={option.label}
                  onClick={() => setStatus(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
            <span className="self-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {isSearchPending ? "Typing…" : error ? "Updates paused" : isRefreshing ? "Refreshing" : "Live updates"}
            </span>
            </div>
          }
        />

        <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-slate-50 p-4 text-sm text-slate-500">
          Pipeline only shows candidates that are still in review. Accepted items move to Library, and rejected items
          remain visible from Audit Queue history.
        </div>

        {error ? (
          <ErrorState
            className="mt-4"
            description="Showing the last successful workflow snapshot while background refresh retries continue."
            title="Live updates paused"
          />
        ) : null}

        {!rows.length ? (
          <div className="mt-6">
            <EmptyState
              title="No workflow items found"
              description="Try a different status filter or sync a single artist candidate before rerunning the smoke test."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {rows.map((row) => (
              <article key={row.candidateId} className="rounded-[24px] border border-[var(--color-border)] bg-slate-50">
                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{row.candidateTitle}</h2>
                    <p className="mt-1 text-sm text-slate-500">{row.artistName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={row.workflowStatusLabel} tone={row.workflowStatusTone} />
                      <StatusBadge label={`Translation: ${row.translationStatusLabel}`} tone={row.translationStatusTone} />
                      {row.asyncExecutionLabel ? (
                        <StatusBadge label={`Worker: ${row.asyncExecutionLabel}`} tone={row.asyncExecutionTone} />
                      ) : null}
                    </div>
                    <button
                      aria-controls={`pipeline-details-${row.candidateId}`}
                      aria-expanded={expandedCandidateId === row.candidateId}
                      aria-label={expandedCandidateId === row.candidateId ? `Hide details for ${row.candidateTitle}` : `Show details for ${row.candidateTitle}`}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                      onClick={() =>
                        setExpandedCandidateId((currentCandidateId) =>
                          currentCandidateId === row.candidateId ? null : row.candidateId,
                        )
                      }
                      type="button"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expandedCandidateId === row.candidateId ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {expandedCandidateId === row.candidateId ? (
                  <div
                    className="border-t border-[var(--color-border)] px-5 pb-5 pt-4"
                    id={`pipeline-details-${row.candidateId}`}
                  >
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Current Stage</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{row.currentStageLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Last Updated</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{row.lastUpdatedAtLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Audit Trail</p>
                        <a
                          className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)] hover:opacity-80"
                          href={`/api/audit-log?aggregateType=candidate&aggregateId=${row.candidateId}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open raw audit log
                        </a>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 lg:col-span-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Worker Execution</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {row.asyncExecutionDetail ?? "No async worker execution recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      {row.stages.map((stage) => (
                        <div key={stage.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                          <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                          <div className="mt-2">
                            <StatusBadge label={stage.statusLabel} tone={stage.statusTone} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            <QueryPagination
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
            />
          </div>
        )}
      </section>
    </section>
  );
}
