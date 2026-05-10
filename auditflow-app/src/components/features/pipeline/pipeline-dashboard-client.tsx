"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Filter } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getPipelineDashboard, retryCandidatePipeline, startCandidateRender } from "@/lib/api/pipeline";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { usePollingResource } from "@/hooks/use-polling-resource";

type PipelineDashboardViewModel = ReturnType<typeof adaptPipelineDashboard>;

type PipelineDashboardClientProps = {
  initialDashboard: PipelineDashboardViewModel;
  initialExpandedCandidateId?: string | null;
};

const statusOptions = [
  { label: "Downloading", value: "downloading" },
  { label: "Transcripting", value: "transcripting" },
  { label: "Transcript Review", value: "transcript_review" },
  { label: "Taste Auditing", value: "taste_auditing" },
  { label: "Taste Review", value: "taste_audit" },
  { label: "Manual Review", value: "manual_review" },
  { label: "Translating", value: "translating" },
  { label: "Translation Review", value: "translation_review" },
  { label: "Artifact Rendering", value: "artifact_rendering" },
  { label: "Final Asset Approval", value: "final_asset_approval" },
] as const;

export function PipelineDashboardClient({
  initialDashboard,
  initialExpandedCandidateId = null,
}: PipelineDashboardClientProps) {
  const { query, searchValue, setPage, setPageSize, setSearchValue, setStatus } = useListQueryState();
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [renderAction, setRenderAction] = useState<{
    candidateId: string | null;
    message: string | null;
    error: string | null;
  }>({ candidateId: null, message: null, error: null });
  const [retryAction, setRetryAction] = useState<{
    candidateId: string | null;
    message: string | null;
    error: string | null;
  }>({ candidateId: null, message: null, error: null });
  const [isStageFilterOpen, setIsStageFilterOpen] = useState(false);
  const stageFilterRef = useRef<HTMLDivElement | null>(null);
  const [manualExpandedCandidateId, setManualExpandedCandidateId] = useState<string | null | undefined>(undefined);
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

  useEffect(() => {
    if (!isStageFilterOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!stageFilterRef.current?.contains(event.target as Node)) {
        setIsStageFilterOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStageFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStageFilterOpen]);

  const rows = useMemo(() => data.rows, [data.rows]);
  const pagination = data.pagination;
  const requestedExpandedCandidateId =
    manualExpandedCandidateId !== undefined ? manualExpandedCandidateId : initialExpandedCandidateId;
  const expandedCandidateId =
    requestedExpandedCandidateId && rows.some((row) => row.candidateId === requestedExpandedCandidateId)
      ? requestedExpandedCandidateId
      : null;
  const selectedStageValues = useMemo(() => (query.status ?? "").split(",").filter(Boolean), [query.status]);
  const selectedStageLabels = statusOptions
    .filter((option) => selectedStageValues.includes(option.value))
    .map((option) => option.label);

  const handleStartRender = async (candidateId: string) => {
    setRenderAction({ candidateId, message: null, error: null });
    try {
      const result = await startCandidateRender({ candidateId });
      setRenderAction({
        candidateId,
        message: `Render job queued: ${result.taskId}`,
        error: null,
      });
    } catch (error) {
      setRenderAction({
        candidateId,
        message: null,
        error: error instanceof Error ? error.message : "Failed to start render job.",
      });
    }
  };

  const handleRetryPipeline = async (candidateId: string) => {
    setRetryAction({ candidateId, message: null, error: null });
    try {
      const result = await retryCandidatePipeline({ candidateId });
      setRetryAction({
        candidateId,
        message: `Retry queued: ${result.jobId} · ${result.stage} attempt ${result.attempt + 1}`,
        error: null,
      });
    } catch (error) {
      setRetryAction({
        candidateId,
        message: null,
        error: error instanceof Error ? error.message : "Failed to queue pipeline retry.",
      });
    }
  };

  const handleToggleDetails = (candidateId: string) => {
    const nextCandidateId = (manualExpandedCandidateId ?? expandedCandidateId) === candidateId ? null : candidateId;
    setManualExpandedCandidateId(nextCandidateId);
    setIsStageFilterOpen(false);
  };

  const handleToggleStageFilter = (value: string) => {
    const nextValues = selectedStageValues.includes(value)
      ? selectedStageValues.filter((item) => item !== value)
      : [...selectedStageValues, value];
    setStatus(nextValues.length ? nextValues.join(",") : undefined);
  };

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
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative" ref={stageFilterRef}>
                <button
                  aria-expanded={isStageFilterOpen}
                  aria-label="Current Stage"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300"
                  onClick={() => setIsStageFilterOpen((value) => !value)}
                  type="button"
                >
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span>Current Stage</span>
                  <span className="max-w-48 truncate text-xs font-medium text-slate-500">
                    {selectedStageLabels.length ? selectedStageLabels.join(", ") : "All"}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isStageFilterOpen ? "rotate-180" : ""}`} />
                </button>
                {isStageFilterOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-xl">
                    <button
                      className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setStatus(undefined)}
                      type="button"
                    >
                      All stages
                      {!selectedStageValues.length ? <Check className="h-4 w-4 text-[var(--color-primary)]" /> : null}
                    </button>
                    {statusOptions.map((option) => {
                      const selected = selectedStageValues.includes(option.value);
                      return (
                        <button
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          key={option.value}
                          onClick={() => handleToggleStageFilter(option.value)}
                          type="button"
                        >
                          {option.label}
                          {selected ? <Check className="h-4 w-4 text-[var(--color-primary)]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
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
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {row.progressStages.map((stage) => (
                        <span
                          className={
                            stage.state === "current"
                              ? "rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[11px] font-semibold text-white"
                              : stage.state === "done"
                                ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                                : "rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-400"
                          }
                          key={stage.id}
                        >
                          {stage.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={row.workflowStatusLabel} tone={row.workflowStatusTone} />
                      <StatusBadge label={`Translation: ${row.translationStatusLabel}`} tone={row.translationStatusTone} />
                      {row.asyncExecutionLabel ? (
                        <StatusBadge label={`Last worker: ${row.asyncExecutionLabel}`} tone={row.asyncExecutionTone} />
                      ) : null}
                    </div>
                    <button
                      aria-controls={`pipeline-details-${row.candidateId}`}
                      aria-expanded={expandedCandidateId === row.candidateId}
                      aria-label={expandedCandidateId === row.candidateId ? `Hide details for ${row.candidateTitle}` : `Show details for ${row.candidateTitle}`}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                      onClick={() => handleToggleDetails(row.candidateId)}
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
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Last Worker Execution</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {row.asyncExecutionDetail ?? "No async worker execution recorded"}
                        </p>
                      </div>
                      {row.processingActivity ? (
                        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 lg:col-span-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Processing Logs</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-700">
                                  {row.processingActivity.jobId}
                                </span>
                                <StatusBadge
                                  label={row.processingActivity.statusLabel}
                                  tone={row.processingActivity.statusTone}
                                />
                                {row.processingActivity.currentStageLabel ? (
                                  <span className="text-xs text-slate-500">
                                    Stage: {row.processingActivity.currentStageLabel}
                                  </span>
                                ) : null}
                              </div>
                              {row.processingActivity.progressLabel ? (
                                <p className="mt-2 text-xs text-slate-600">{row.processingActivity.progressLabel}</p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {row.processingActivity.updatedAtLabel ? (
                                <span className="text-xs font-medium text-slate-400">
                                  Updated {row.processingActivity.updatedAtLabel}
                                </span>
                              ) : null}
                              {row.canRetryProcessing ? (
                                <button
                                  className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={retryAction.candidateId === row.candidateId && !retryAction.error}
                                  onClick={() => handleRetryPipeline(row.candidateId)}
                                  type="button"
                                >
                                  Retry failed stage
                                </button>
                              ) : null}
                            </div>
                          </div>
                          {retryAction.candidateId === row.candidateId && retryAction.message ? (
                            <p className="mt-3 text-xs font-medium text-emerald-700">{retryAction.message}</p>
                          ) : null}
                          {retryAction.candidateId === row.candidateId && retryAction.error ? (
                            <p className="mt-3 text-xs font-medium text-rose-700">{retryAction.error}</p>
                          ) : null}
                          <div className="mt-4 max-h-56 overflow-auto rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-100">
                            {row.processingActivity.logs.length ? (
                              row.processingActivity.logs.map((log) => (
                                <div
                                  className={
                                    log.level === "error"
                                      ? "text-rose-200"
                                      : log.level === "warning"
                                        ? "text-amber-200"
                                        : log.level === "success"
                                          ? "text-emerald-200"
                                          : "text-slate-100"
                                  }
                                  key={log.id}
                                >
                                  <span className="text-slate-400">{log.timestampLabel}</span>
                                  {log.stageLabel ? <span className="text-cyan-200"> [{log.stageLabel}]</span> : null}
                                  <span> {log.message}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-400">No processing log entries yet.</div>
                            )}
                          </div>
                        </div>
                      ) : null}
                      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 lg:col-span-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Final Artifact</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                            {row.artifactStatusLabel === "Ready"
                                ? "Ready for final approval"
                                : `No ready final artifact (${row.artifactStatusLabel})`}
                            </p>
                            {row.renderJob ? (
                              <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-slate-700">{row.renderJob.jobId}</span>
                                  <StatusBadge label={row.renderJob.statusLabel} tone={row.renderJob.statusTone} />
                                  {row.renderJob.updatedAtLabel ? (
                                    <span className="text-xs text-slate-500">Updated {row.renderJob.updatedAtLabel}</span>
                                  ) : null}
                                </div>
                                {row.renderJob.progressLabel ? (
                                  <p className="mt-2 text-xs text-slate-600">{row.renderJob.progressLabel}</p>
                                ) : null}
                                {row.renderJob.currentStageLabel ? (
                                  <p className="mt-1 text-xs text-slate-500">Stage: {row.renderJob.currentStageLabel}</p>
                                ) : null}
                                {row.renderJob.resultLabel ? (
                                  <p className="mt-1 text-xs text-slate-500">Result: {row.renderJob.resultLabel}</p>
                                ) : null}
                              </div>
                            ) : null}
                            {renderAction.candidateId === row.candidateId && renderAction.message ? (
                              <p className="mt-2 text-xs font-medium text-emerald-700">{renderAction.message}</p>
                            ) : null}
                            {renderAction.candidateId === row.candidateId && renderAction.error ? (
                              <p className="mt-2 text-xs font-medium text-rose-700">{renderAction.error}</p>
                            ) : null}
                          </div>
                          {row.canStartRender ? (
                            <button
                              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={renderAction.candidateId === row.candidateId && !renderAction.error}
                              onClick={() => handleStartRender(row.candidateId)}
                              type="button"
                            >
                              Start render job
                            </button>
                          ) : null}
                        </div>
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
