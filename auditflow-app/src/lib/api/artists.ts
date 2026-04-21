import { createListQuerySearchParams } from "@/lib/query/list-query";
import { artistCandidatesResponseDtoSchema, artistResyncResponseDtoSchema, artistsDashboardResponseDtoSchema } from "@/lib/schemas/artist";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { ArtistCandidatesResponseDto, ArtistResyncResponseDto, ArtistsDashboardResponseDto } from "@/types/artist";

function buildArtistsDashboardUrl(
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>,
) {
  const queryString = createListQuerySearchParams(query ?? {}).toString();
  return queryString ? `/api/artists?${queryString}` : "/api/artists";
}

function resolveApiUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

export async function getArtistsDashboard(options?: {
  baseUrl?: string;
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>;
}): Promise<ArtistsDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: resolveApiUrl(buildArtistsDashboardUrl(options?.query), options?.baseUrl),
    schema: artistsDashboardResponseDtoSchema,
  });
}

export async function getArtistCandidates(options: {
  artistId: string;
  baseUrl?: string;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "status">>;
  fetcher?: typeof fetch;
}): Promise<ArtistCandidatesResponseDto> {
  const searchParams = new URLSearchParams();

  if (options.query?.page !== undefined) {
    searchParams.set("page", String(options.query.page));
  }

  if (options.query?.pageSize !== undefined) {
    searchParams.set("pageSize", String(options.query.pageSize));
  }

  if (options.query?.status) {
    searchParams.set("status", options.query.status);
  }

  const queryString = searchParams.toString();

  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: resolveApiUrl(
      queryString ? `/api/artists/${options.artistId}/candidates?${queryString}` : `/api/artists/${options.artistId}/candidates`,
      options.baseUrl,
    ),
    schema: artistCandidatesResponseDtoSchema,
  });
}

export async function resyncArtist(options: {
  artistId: string;
  days?: number;
  fetcher?: typeof fetch;
}): Promise<ArtistResyncResponseDto> {
  const searchParams = new URLSearchParams();
  if (options.days !== undefined) {
    searchParams.set("days", String(options.days));
  }

  const queryString = searchParams.toString();
  return fetchValidatedJson({
    fetcher: options.fetcher,
    init: { method: "POST" },
    input: queryString ? `/api/artists/${options.artistId}/resync?${queryString}` : `/api/artists/${options.artistId}/resync`,
    schema: artistResyncResponseDtoSchema,
  });
}
