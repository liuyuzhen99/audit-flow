import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArtistCandidatesClient } from "@/components/features/artists/artist-candidates-client";
import { ErrorState } from "@/components/shared/error-state";
import { getArtistCandidates } from "@/lib/api/artists";
import { readListQuery } from "@/lib/query/list-query";
import { getRequestOrigin } from "@/lib/server/request-origin";

type ArtistCandidatesPageProps = {
  params: Promise<{ artistId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(rawSearchParams: Record<string, string | string[] | undefined> | undefined) {
  const searchParams = new URLSearchParams();

  if (!rawSearchParams) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export default async function ArtistCandidatesPage({ params, searchParams }: ArtistCandidatesPageProps) {
  const { artistId } = await params;
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const artistName = resolvedSearchParams.get("artistName") ?? undefined;
  const requestOrigin = await getRequestOrigin();
  let response;
  let candidatesLoadError: string | null = null;

  try {
    response = await getArtistCandidates({
      artistId,
      baseUrl: requestOrigin,
      query: {
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
      },
    });
  } catch (error) {
    candidatesLoadError = error instanceof Error ? error.message : "Failed to load artist candidates";
    response = {
      artistId,
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
    };
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          href="/artists"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Artists
        </Link>
      </div>

      {candidatesLoadError ? (
        <ErrorState
          description={`${candidatesLoadError}. Make sure the Python API is running before opening candidate details.`}
          title="Artist candidates unavailable"
        />
      ) : (
        <ArtistCandidatesClient artistId={artistId} artistName={artistName} response={response} />
      )}
    </section>
  );
}
