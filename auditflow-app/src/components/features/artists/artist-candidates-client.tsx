"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { QueryPagination } from "@/components/shared/query-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { addCandidateToPipeline } from "@/lib/api/pipeline";
import type { ArtistCandidatesResponseDto, ArtistLatestCandidateDto } from "@/types/artist";

const columnHelper = createColumnHelper<ArtistLatestCandidateDto>();

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
    header: "Actions",
    cell: (info) => <CandidateActions candidate={info.row.original} />,
  }),
] as ColumnDef<ArtistLatestCandidateDto, unknown>[];

type ArtistCandidatesClientProps = {
  artistId: string;
  artistName?: string;
  response: ArtistCandidatesResponseDto;
};

export function ArtistCandidatesClient({ artistId, artistName, response }: ArtistCandidatesClientProps) {
  const { setPage, setPageSize } = useListQueryState();

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

function CandidateActions({ candidate }: { candidate: ArtistLatestCandidateDto }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasAdded, setWasAdded] = useState(false);
  const pipelineSearchParams = new URLSearchParams({
    q: candidate.candidateId,
    candidateId: candidate.candidateId,
  });
  const isInPipeline = wasAdded || candidate.status === "pending_review";

  const handleAddToPipeline = async () => {
    setMessage(null);
    setError(null);
    setIsAdding(true);
    try {
      const result = await addCandidateToPipeline({ candidateId: candidate.candidateId });
      setWasAdded(true);
      setMessage(`Queued for ${result.reviewType.replaceAll("_", " ")}`);
      startTransition(() => {
        router.push(`/pipeline?${pipelineSearchParams.toString()}`);
      });
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Failed to add candidate to pipeline.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex min-w-[9rem] flex-col items-start gap-2 text-sm">
      <Link
        className="font-semibold text-slate-500 hover:text-[var(--color-primary)]"
        href={candidate.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Watch source
      </Link>
      {candidate.status === "accepted" ? (
        <Link
          className="font-semibold text-[var(--color-primary)] hover:underline"
          href={`/library/${encodeURIComponent(candidate.candidateId)}`}
        >
          Open Library
        </Link>
      ) : isInPipeline ? (
        <Link
          className="font-semibold text-[var(--color-primary)] hover:underline"
          href={`/pipeline?${pipelineSearchParams.toString()}`}
        >
          Open Pipeline
        </Link>
      ) : (
        <button
          className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isAdding || isPending}
          onClick={() => {
            void handleAddToPipeline();
          }}
          type="button"
        >
          {isAdding || isPending ? "Adding..." : "Add to Pipeline"}
        </button>
      )}
      {message ? <p className="text-xs font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value.replace("T", " ").replace(".000Z", " UTC");
}
