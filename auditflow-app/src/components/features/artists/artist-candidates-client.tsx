"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import type { ArtistCandidatesResponseDto, ArtistLatestCandidateDto } from "@/types/artist";

const columnHelper = createColumnHelper<ArtistLatestCandidateDto>();

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Discovered", value: "discovered" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
] as const;

const columns = [
  columnHelper.accessor("title", {
    header: "Candidate",
    cell: (info) => (
      <div>
        <p className="text-base font-semibold text-slate-900">{info.getValue()}</p>
        <p className="mt-1 text-sm text-slate-500">{info.row.original.videoId}</p>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Review Status",
    cell: (info) => <StatusBadge label={info.getValue().replaceAll("_", " ")} tone="info" />,
  }),
  columnHelper.accessor("ingestionStatus", {
    header: "Ingestion",
    cell: (info) => <StatusBadge label={info.getValue()} tone={info.getValue() === "completed" ? "success" : "warning"} />,
  }),
  columnHelper.accessor("publishedAt", {
    header: "Published",
    cell: (info) => <span className="text-sm text-slate-700">{formatTimestamp(info.getValue())}</span>,
  }),
  columnHelper.accessor("sourceKind", {
    header: "Source",
    cell: (info) => <span className="text-sm text-slate-700">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: "link",
    header: "Open",
    cell: (info) => (
      <Link
        className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
        href={info.row.original.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Watch source
      </Link>
    ),
  }),
] as ColumnDef<ArtistLatestCandidateDto, any>[];

type ArtistCandidatesClientProps = {
  artistId: string;
  artistName?: string;
  response: ArtistCandidatesResponseDto;
};

export function ArtistCandidatesClient({ artistId, artistName, response }: ArtistCandidatesClientProps) {
  const { query, setPage, setPageSize, setStatus } = useListQueryState();

  return (
    <section className="space-y-6">
      <PageToolbar
        left={
          <div>
            <p className="text-sm font-medium text-slate-400">Artist / Candidate Discovery</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{artistName ?? artistId}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review the latest candidate videos discovered for this artist.
            </p>
          </div>
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

      <DataTable
        columns={columns}
        data={response.items}
        emptyState={
          <EmptyState
            description="Run a resync from the artists dashboard to discover new videos for this artist."
            title="No candidates found"
          />
        }
        getRowId={(row) => row.candidateId}
      />

      <QueryPagination
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={response.pagination.page}
        pageSize={response.pagination.pageSize}
        total={response.pagination.total}
        totalPages={response.pagination.totalPages}
      />
    </section>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value.replace("T", " ").replace(".000Z", " UTC");
}
