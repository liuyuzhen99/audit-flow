"use client";

import { useSearchParams } from "next/navigation";
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

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Approved", value: "autoApproved" },
  { label: "Review", value: "manualReview" },
  { label: "Rejected", value: "autoRejected" },
  { label: "Monitoring", value: "monitoring" },
] as const;

type ArtistsDashboardClientProps = {
  rows: ArtistTableRowViewModel[];
  pagination: PaginationMetaDto;
};

export function ArtistsDashboardClient({ rows, pagination }: ArtistsDashboardClientProps) {
  const { query, searchValue, setPage, setPageSize, setSearchValue, setSort, setStatus, setFilter } = useListQueryState();
  // Read module-specific dateRange from URL — lives outside shared ListQueryDto
  const searchParams = useSearchParams();
  const isDateRangeActive = searchParams.get("dateRange") === "2w";

  const toggleDateRange = () => {
    setFilter("dateRange", isDateRangeActive ? undefined : "2w");
  };

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
            {/* Date range toggle */}
            <button
              className={isDateRangeActive
                ? "rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
                : "rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700"
              }
              onClick={toggleDateRange}
              type="button"
            >
              Recent 2 Weeks
            </button>

            {/* Status filter buttons */}
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

            {/* Bulk Download — gated to Phase 5 until row selection is available */}
            <button
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
              disabled
              title="Row selection will be added in Phase 5. Bulk Download requires an explicit selection to avoid operating on an invisible filter set."
              type="button"
            >
              Bulk Download (Phase 5)
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
