"use client";

import type { PaginationMetaDto } from "@/types/api";
import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import type { ArtistTableRowViewModel } from "@/types/artist";

const columnHelper = createColumnHelper<ArtistTableRowViewModel>();

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
  columnHelper.accessor("followerLabel", {
    header: "Spotify Followers",
    meta: { sortKey: "spotifyFollowers" },
    cell: (info) => <span className="text-base font-semibold text-slate-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor("channelLabel", {
    header: "YouTube Channel",
    cell: (info) => <span className="text-base text-slate-700">{info.getValue()}</span>,
  }),
  columnHelper.accessor("releasesLabel", {
    header: "Recent Releases",
    meta: { sortKey: "recentReleaseCount" },
    cell: (info) => <span className="text-base font-medium text-indigo-600">{info.getValue()}</span>,
  }),
  columnHelper.accessor("statusLabel", {
    header: "Audit Status",
    meta: { sortKey: "status" },
    cell: (info) => <StatusBadge label={info.getValue()} tone={info.row.original.statusTone} />,
  }),
];

type ArtistsDashboardClientProps = {
  rows: ArtistTableRowViewModel[];
  pagination: PaginationMetaDto;
};

export function ArtistsDashboardClient({ rows, pagination }: ArtistsDashboardClientProps) {
  const { query, searchValue, setPage, setPageSize, setSearchValue, setSort } = useListQueryState();

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
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">
              Recent 2 Weeks
            </button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700">
              Filter
            </button>
            <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">
              Bulk Download
            </button>
          </>
        }
      />

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
