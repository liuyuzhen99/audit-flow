"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";

import { getQueueDashboard } from "@/lib/api/queue";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<QueueTableRowViewModel, any>[] = [
  columnHelper.accessor("title", {
    header: "Track",
    meta: { sortKey: "title" },
    cell: (info) => (
      <div>
        <p className="text-lg font-semibold text-slate-900">{info.row.original.title}</p>
        <p className="text-sm text-slate-500">{info.row.original.artistName}</p>
      </div>
    ),
  }),
  columnHelper.accessor("statusLabel", {
    header: "Audit Status",
    meta: { sortKey: "status" },
    cell: (info) => <StatusBadge label={info.getValue()} tone={info.row.original.statusTone} />,
  }),
  columnHelper.accessor("confidenceLabel", {
    header: "Confidence",
    meta: { sortKey: "confidence" },
    cell: (info) => <span className="text-base font-semibold text-slate-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor("summaryLabel", {
    header: "Rule Summary",
    cell: (info) => (
      <div>
        <p className="text-sm text-slate-600">{info.getValue()}</p>
        <p className="mt-2 text-xs text-slate-400">Updated {info.row.original.updatedLabel}</p>
      </div>
    ),
  }),
  columnHelper.accessor("progressLabel", {
    header: "Progress",
    meta: { sortKey: "progress" },
    cell: (info) => (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-600">{info.getValue()}</p>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-[var(--color-primary)]"
            style={{ width: `${info.row.original.progressPercent}%` }}
          />
        </div>
      </div>
    ),
  }),
  // Actions column — fixed width to prevent overflow on 1280px viewports
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 140,
    cell: (info) => {
      const row = info.row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Route to Pipeline — always available */}
          <Link
            aria-label={`Route ${row.title} to Pipeline`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border)] text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            href="/pipeline"
            title="Route to Pipeline"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* View Report — live when a report exists */}
          {row.reportId ? (
            <Link
              aria-label={`View report for ${row.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border)] text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              href={`/reports/${row.reportId}`}
              title="View report"
            >
              <FileText className="h-4 w-4" />
            </Link>
          ) : (
            <button
              aria-label={`No report available for ${row.title}`}
              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-xl border border-[var(--color-border)] text-slate-200"
              disabled
              title="No report available"
              type="button"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  }),
];

type QueueDashboardViewModel = ReturnType<typeof adaptQueueDashboard>;

type QueueDashboardClientProps = {
  initialDashboard: QueueDashboardViewModel;
};

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Processing", value: "auditing" },
  { label: "Flagged", value: "manualReview" },
  { label: "Completed", value: "autoApproved" },
] as const;

export function QueueDashboardClient({ initialDashboard }: QueueDashboardClientProps) {
  const { query, searchValue, setPage, setPageSize, setSearchValue, setSort, setStatus } = useListQueryState();
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
    resetKey: `${query.page}|${query.pageSize}|${query.q ?? ""}|${query.status ?? ""}|${query.sortBy ?? ""}|${query.sortDirection ?? ""}`,
  });

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {data.summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <PageToolbar
          className="rounded-b-none border-x-0 border-t-0 shadow-none"
          left={
            <SearchInput
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search songs, artists, or task IDs..."
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
                {error ? "Updates paused" : isRefreshing ? "Refreshing" : "Live updates"}
              </span>
            </>
          }
        />

        {error ? (
          <ErrorState
            className="mx-4 mt-4"
            description="Showing the last successful queue snapshot while background refresh retries continue."
            title="Live updates paused"
          />
        ) : null}

        <DataTable
          className="rounded-t-none border-0 shadow-none"
          columns={columns}
          data={data.rows}
          getRowId={(row) => row.id}
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
