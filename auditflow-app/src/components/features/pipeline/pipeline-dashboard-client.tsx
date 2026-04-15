"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getPipelineDashboard, stopPipelineJob } from "@/lib/api/pipeline";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { usePollingResource } from "@/hooks/use-polling-resource";

type PipelineDashboardViewModel = ReturnType<typeof adaptPipelineDashboard>;

type PipelineDashboardClientProps = {
  initialDashboard: PipelineDashboardViewModel;
};

export function PipelineDashboardClient({ initialDashboard }: PipelineDashboardClientProps) {
  const [stopState, setStopState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [stopMessage, setStopMessage] = useState<string>("");
  // Keep the latest clear-console cutoff without triggering re-renders on every poll
  const clearedAtTickRef = useRef<number>(-1);
  const [renderCount, forceRender] = useState(0);

  const { data, error, isRefreshing } = usePollingResource({
    initialData: initialDashboard,
    load: async (nextTick) => adaptPipelineDashboard(await getPipelineDashboard({ query: { tick: nextTick } })),
    resetKey: "pipeline",
  });

  const activeJob = data.activeJob;

  const openInLibraryHref = useMemo(() => {
    const linkedDeliverable = activeJob?.deliverables.find((item) => item.assetId);
    return linkedDeliverable?.assetId ? `/library/${linkedDeliverable.assetId}` : null;
  }, [activeJob]);

  const visibleLogs = useMemo(() => {
    if (!activeJob) {
      return [];
    }

    return activeJob.logs.filter((line) => line.tick > clearedAtTickRef.current);
    // renderCount is included so the memo re-runs after Clear Console updates the ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob, data.polling.tick, renderCount]);

  const handleClearConsole = () => {
    clearedAtTickRef.current = data.polling.tick;
    forceRender((value) => value + 1);
  };

  const handleStopCurrentTask = async () => {
    if (!activeJob || stopState === "pending") {
      return;
    }

    setStopState("pending");
    setStopMessage("");

    try {
      const response = await stopPipelineJob({ jobId: activeJob.id });
      setStopState("success");
      setStopMessage(response.message);
    } catch (stopError) {
      setStopState("error");
      setStopMessage(stopError instanceof Error ? stopError.message : "Failed to stop pipeline job");
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {data.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      {error ? (
        <ErrorState
          description="Showing the last successful pipeline snapshot while background refresh retries continue."
          title="Live updates paused"
        />
      ) : null}

      {activeJob ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4 rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Task List</p>
                <h2 className="text-2xl font-semibold text-slate-900">{activeJob.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {isRefreshing ? "Refreshing" : "Live updates"}
                </span>
                <StatusBadge label={activeJob.statusLabel} tone={activeJob.statusTone} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-[var(--color-border)] bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-400">Elapsed</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.elapsedLabel}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--color-border)] bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-400">Remaining</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.remainingLabel}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[24px] border border-[var(--color-border)] bg-slate-50 px-5 py-6">
              {activeJob.stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-4">
                  <span className="h-4 w-4 rounded-full border-2 border-current text-[var(--color-primary)]" />
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-800">{stage.label}</p>
                    <StatusBadge label={stage.statusLabel} tone={stage.statusTone} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500">Queued & Recent Jobs</p>
              {data.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Elapsed {job.elapsedLabel} · Remaining {job.remainingLabel}
                    </p>
                  </div>
                  <StatusBadge label={job.statusLabel} tone={job.statusTone} />
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_250px]">
            <section className="rounded-[28px] bg-[#0d1117] p-6 text-sm text-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex items-center justify-between text-white">
                <h2 className="text-lg font-semibold">Live Execution Log</h2>
                <button className="text-sm text-slate-400 hover:text-slate-200" onClick={handleClearConsole} type="button">
                  Clear Console
                </button>
              </div>
              <div className="space-y-3 font-mono">
                {visibleLogs.map((line) => (
                  <p key={line.id} className={line.toneClassName}>
                    {line.displayLine}
                  </p>
                ))}
                {!visibleLogs.length ? <p className="text-slate-500">Console cleared. New log lines will appear here.</p> : null}
                {!data.polling.terminal ? <p className="text-indigo-400">• Streaming realtime console data...</p> : null}
              </div>
            </section>

            <section className="space-y-4 rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-semibold text-slate-900">Deliverables</h2>
              <div className="space-y-3">
                {activeJob.deliverables.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--color-border)] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <StatusBadge label={item.statusLabel} tone={item.statusTone} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>

              {openInLibraryHref ? (
                <Link
                  className="block w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  href={openInLibraryHref}
                >
                  Open in Library
                </Link>
              ) : (
                <button
                  className="w-full cursor-not-allowed rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
                  disabled
                  type="button"
                >
                  Open in Library
                </button>
              )}

              <button
                className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={stopState === "pending"}
                onClick={handleStopCurrentTask}
                type="button"
              >
                {stopState === "pending" ? "Stopping..." : "Stop Current Task"}
              </button>

              {stopMessage ? (
                <p className={stopState === "error" ? "text-sm text-rose-600" : "text-sm text-emerald-600"}>{stopMessage}</p>
              ) : null}
            </section>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No active pipeline job"
          description="All pipeline runs are complete. Create a new task to start another processing flow."
        />
      )}
    </section>
  );
}
