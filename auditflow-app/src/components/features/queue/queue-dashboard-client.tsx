"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { approveReview, getQueueDashboard, rejectReview } from "@/lib/api/queue";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { usePollingResource } from "@/hooks/use-polling-resource";
import type { QueueTableRowViewModel } from "@/types/queue";

const columnHelper = createColumnHelper<QueueTableRowViewModel>();

const columns: ColumnDef<QueueTableRowViewModel, string>[] = [
  columnHelper.accessor("candidateTitle", {
    header: "Candidate",
    meta: { sortKey: "candidateTitle" },
    cell: (info) => (
      <div>
        <p className="text-base font-semibold text-slate-900">{info.row.original.candidateTitle}</p>
        <a
          className="text-sm text-slate-500 hover:text-[var(--color-primary)]"
          href={info.row.original.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open source video
        </a>
      </div>
    ),
  }),
  columnHelper.accessor("artistName", {
    header: "Artist",
    meta: { sortKey: "artistName" },
    cell: (info) => <span className="text-sm font-medium text-slate-700">{info.getValue()}</span>,
  }),
  columnHelper.accessor("reviewTypeLabel", {
    header: "Review Type",
    meta: { sortKey: "reviewType" },
  }),
  columnHelper.accessor("statusLabel", {
    header: "Status",
    meta: { sortKey: "status" },
    cell: (info) => <StatusBadge label={info.getValue()} tone={info.row.original.statusTone} />,
  }),
  columnHelper.accessor("versionLabel", {
    header: "Version",
    meta: { sortKey: "version" },
  }),
  columnHelper.accessor("queuedAtLabel", {
    header: "Queued At",
    meta: { sortKey: "queuedAt" },
  }),
];

type QueueDashboardViewModel = ReturnType<typeof adaptQueueDashboard>;

type QueueDashboardClientProps = {
  initialDashboard: QueueDashboardViewModel;
};

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

export function QueueDashboardClient({ initialDashboard }: QueueDashboardClientProps) {
  const router = useRouter();
  const { query, searchValue, setPage, setPageSize, setSearchValue, setSort, setStatus } = useListQueryState();
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [actionState, setActionState] = useState<{
    reviewId: string | null;
    kind: "approve" | "reject" | null;
    message: string | null;
    error: string | null;
  }>({ reviewId: null, kind: null, message: null, error: null });

  const { data, error, isRefreshing } = usePollingResource({
    initialData: initialDashboard,
    load: async (nextTick) =>
      adaptQueueDashboard(
        await getQueueDashboard({
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

  const handleDecision = async (row: QueueTableRowViewModel, kind: "approve" | "reject") => {
    const comment = window.prompt(
      kind === "approve" ? "Optional approval comment" : "Optional rejection comment",
      "",
    );

    setActionState({ reviewId: row.reviewId, kind, message: null, error: null });

    try {
      const result =
        kind === "approve"
          ? await approveReview({
              reviewId: row.reviewId,
              expectedVersion: row.version,
              comment: comment || undefined,
              actorId: "frontend-user-1",
            })
          : await rejectReview({
              reviewId: row.reviewId,
              expectedVersion: row.version,
              comment: comment || undefined,
              actorId: "frontend-user-1",
            });

      setActionState({
        reviewId: row.reviewId,
        kind,
        message:
          kind === "approve"
            ? `Approved ${row.candidateTitle}. ${result.nextReviewType ? `Next step: ${result.nextReviewType}.` : "Workflow advanced."}`
            : `Rejected ${row.candidateTitle}. Candidate status is now ${result.candidateStatus}.`,
        error: null,
      });
      if (typeof router.refresh === "function") {
        router.refresh();
      }
    } catch (decisionError) {
      setActionState({
        reviewId: row.reviewId,
        kind,
        message: null,
        error:
          decisionError instanceof Error
            ? decisionError.message
            : "Review decision failed. Refresh and try again.",
      });
    }
  };

  const actionColumn: ColumnDef<QueueTableRowViewModel, string> = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const row = info.row.original;
      const isPending = actionState.reviewId === row.reviewId && actionState.kind !== null;
      const canDecide = row.status === "pending";
      const canOpenPipeline = row.status === "pending" || (row.status === "approved" && row.reviewType !== "final_asset_approval");
      const pipelineSearchParams = new URLSearchParams({
        q: row.candidateId,
        candidateId: row.candidateId,
      });

      return (
        <div className="flex flex-col items-start gap-2">
          {canDecide ? (
            <div className="flex gap-2">
              <button
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={() => handleDecision(row, "approve")}
                type="button"
              >
                Approve
              </button>
              <button
                className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={() => handleDecision(row, "reject")}
                type="button"
              >
                Reject
              </button>
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500">Decision recorded</p>
          )}
          <div className="flex gap-3 text-xs">
            {canOpenPipeline ? (
              <Link
                className="text-slate-500 hover:text-[var(--color-primary)]"
                href={`/pipeline?${pipelineSearchParams.toString()}`}
              >
                Open Pipeline
              </Link>
            ) : null}
            <a
              className="text-slate-500 hover:text-[var(--color-primary)]"
              href={`/api/audit-log?aggregateType=candidate&aggregateId=${row.candidateId}`}
              rel="noreferrer"
              target="_blank"
            >
              Audit Log
            </a>
          </div>
        </div>
      );
    },
  });

  const tableColumns: ColumnDef<QueueTableRowViewModel, string>[] = [...columns, actionColumn];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {data.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <PageToolbar
          className="rounded-b-none border-x-0 border-t-0 shadow-none"
          left={
            <SearchInput
              debounceMs={400}
              onPendingChange={setIsSearchPending}
              onValueChange={setSearchValue}
              placeholder="Search candidate title or artist..."
              value={searchValue}
            />
          }
          right={
            <>
              {statusOptions.map((option) => {
                const isActive = (query.status ?? undefined) === option.value;

                return (
                  <button
                    className={isActive
                      ? "rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
                      : "rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700"
                    }
                    key={option.label}
                    onClick={() => setStatus(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {isSearchPending ? "Typing…" : error ? "Updates paused" : isRefreshing ? "Refreshing" : "Live updates"}
              </span>
            </>
          }
        />

        {error ? (
          <ErrorState
            className="mx-4 mt-4"
            description="Showing the last successful review queue snapshot while background refresh retries continue."
            title="Live updates paused"
          />
        ) : null}

        {actionState.error ? (
          <ErrorState
            className="mx-4 mt-4"
            description="If this was a stale-version conflict, refresh the queue and retry with the latest version."
            title={actionState.error}
          />
        ) : null}

        {actionState.message ? <p className="mx-4 mt-4 text-sm text-emerald-700">{actionState.message}</p> : null}

        <DataTable
          className="rounded-t-none border-0 shadow-none"
          columns={tableColumns}
          data={data.rows}
          getRowId={(row) => row.reviewId}
          onSortChange={setSort}
          sortBy={query.sortBy}
          sortDirection={query.sortDirection}
        />

        <div className="px-4 pb-4">
          <QueryPagination
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            page={data.pagination.page}
            pageSize={data.pagination.pageSize}
            total={data.pagination.total}
            totalPages={data.pagination.totalPages}
          />
        </div>
      </section>
    </section>
  );
}
