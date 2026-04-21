"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PaginationMetaDto } from "@/types/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { resyncArtist } from "@/lib/api/artists";
import type { ArtistTableRowViewModel } from "@/types/artist";

const columnHelper = createColumnHelper<ArtistTableRowViewModel>();

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Partial", value: "partial" },
] as const;

type ArtistsDashboardClientProps = {
  rows: ArtistTableRowViewModel[];
  pagination: PaginationMetaDto;
};

export function ArtistsDashboardClient({ rows, pagination }: ArtistsDashboardClientProps) {
  const router = useRouter();
  const { query, searchValue, setPage, setPageSize, setSearchValue, setSort, setStatus } = useListQueryState();
  const [resyncError, setResyncError] = useState<string | null>(null);
  const [pendingArtistId, setPendingArtistId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleResync = async (artistId: string) => {
    setResyncError(null);
    setPendingArtistId(artistId);
    try {
      await resyncArtist({ artistId, days: 14 });
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setResyncError(error instanceof Error ? error.message : "Failed to resync artist");
    } finally {
      setPendingArtistId(null);
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Artist",
      meta: { sortKey: "name" },
      cell: (info) => (
        <div>
          <p className="text-lg font-semibold text-slate-900">{info.row.original.name}</p>
          <p className="text-sm text-slate-500">{info.row.original.freshnessLabel}</p>
        </div>
      ),
    }),
    columnHelper.accessor("channelLabel", {
      header: "YouTube Channel",
      cell: (info) => <span className="text-base text-slate-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor("candidateLabel", {
      header: "Candidates",
      cell: (info) => <span className="text-base font-medium text-indigo-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("syncStatusLabel", {
      header: "Sync Status",
      cell: (info) => <StatusBadge label={info.getValue()} tone={info.row.original.syncStatusTone} />,
    }),
    columnHelper.accessor("freshnessLabel", {
      header: "Last Sync",
      meta: { sortKey: "updatedAt" },
      cell: (info) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{info.getValue()}</p>
          {info.row.original.errorLabel ? (
            <p className="mt-1 text-xs text-rose-600">{info.row.original.errorLabel}</p>
          ) : null}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        const isRowPending = isPending && pendingArtistId === row.id;

        return (
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              href={`/artists/${row.id}?artistName=${encodeURIComponent(row.name)}`}
            >
              View
            </Link>
            <button
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              disabled={!row.canResync || isRowPending}
              onClick={() => {
                void handleResync(row.id);
              }}
              type="button"
            >
              {isRowPending ? "Resyncing..." : "Resync"}
            </button>
          </div>
        );
      },
    }),
  ] as ColumnDef<ArtistTableRowViewModel, any>[];

  return (
    <section className="space-y-6">
      <PageToolbar
        left={
          <SearchInput
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search artists or YouTube channels..."
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
          </>
        }
      />

      {resyncError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {resyncError}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        onSortChange={setSort}
        sortBy={query.sortBy}
        sortDirection={query.sortDirection}
      />

      <QueryPagination
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
      />
    </section>
  );
}
