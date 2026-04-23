"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
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
  const [hiddenArtistIds, setHiddenArtistIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const currentRowIds = new Set(rows.map((row) => row.id));
    setHiddenArtistIds((currentIds) => {
      const nextIds = new Set(Array.from(currentIds).filter((id) => currentRowIds.has(id)));
      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [rows]);

  const visibleRows = useMemo(
    () => rows.filter((row) => !hiddenArtistIds.has(row.id)),
    [hiddenArtistIds, rows],
  );
  const effectiveSortBy = query.sortBy ?? "candidateCount";
  const effectiveSortDirection = query.sortDirection ?? "desc";
  const hiddenCount = rows.length - visibleRows.length;
  const effectivePagination = useMemo(
    () => ({
      ...pagination,
      total: Math.max(pagination.total - hiddenCount, 0),
      totalPages: Math.max(Math.ceil(Math.max(pagination.total - hiddenCount, 0) / pagination.pageSize), 1),
    }),
    [hiddenCount, pagination],
  );

  const handleResync = async (artistId: string) => {
    setResyncError(null);
    setPendingArtistId(artistId);
    try {
      const result = await resyncArtist({ artistId, days: 14 });
      if (result.artistRemoved) {
        setHiddenArtistIds((currentIds) => new Set(currentIds).add(artistId));
      }
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
      meta: { sortKey: "name", width: "108px" },
      cell: (info) => (
        <div className="min-w-0 max-w-[10rem]">
          <p className="truncate text-base font-semibold text-slate-900">{info.row.original.name}</p>
          <p className="truncate text-sm text-slate-500">{info.row.original.freshnessLabel}</p>
        </div>
      ),
    }),
    columnHelper.accessor("channelLabel", {
      header: "YouTube Channel",
      meta: { width: "180px" },
      cell: (info) => <span className="block max-w-[11rem] truncate text-sm text-slate-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor("candidateLabel", {
      header: "Candidates",
      meta: { sortKey: "candidateCount", width: "118px" },
      cell: (info) => <span className="text-sm font-medium text-indigo-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("syncStatusLabel", {
      header: "Sync Status",
      meta: { sortKey: "syncStatus", width: "114px" },
      cell: (info) => <StatusBadge label={info.getValue()} tone={info.row.original.syncStatusTone} />,
    }),
    columnHelper.accessor("freshnessLabel", {
      header: "Last Sync",
      meta: { sortKey: "updatedAt", width: "132px" },
      cell: (info) => (
        <div className="min-w-0 max-w-[9rem]">
          <p className="truncate text-sm font-medium text-slate-800">{info.getValue()}</p>
          {info.row.original.errorLabel ? (
            <p className="mt-1 truncate text-xs text-rose-600">{info.row.original.errorLabel}</p>
          ) : null}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      meta: { width: "104px" },
      cell: (info) => {
        const row = info.row.original;
        const isRowPending = isPending && pendingArtistId === row.id;

        return (
          <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              href={`/artists/${row.id}?artistName=${encodeURIComponent(row.name)}`}
            >
              View
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
  ] as ColumnDef<ArtistTableRowViewModel, unknown>[];

  return (
    <section className="space-y-6">
      <PageToolbar
        left={
          <SearchInput
            onValueChange={setSearchValue}
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
        bodyCellClassName="px-2.5 py-3"
        headerCellClassName="px-2.5 py-3"
        tableClassName="w-full"
        columns={columns}
        data={visibleRows}
        getRowId={(row) => row.id}
        onSortChange={setSort}
        sortBy={effectiveSortBy}
        sortDirection={effectiveSortDirection}
      />

      <QueryPagination
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={effectivePagination.page}
        pageSize={effectivePagination.pageSize}
        total={effectivePagination.total}
        totalPages={effectivePagination.totalPages}
      />
    </section>
  );
}
