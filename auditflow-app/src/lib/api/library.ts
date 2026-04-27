import { createListQuerySearchParams } from "@/lib/query/list-query";
import { libraryAssetDetailDtoSchema, libraryDashboardResponseDtoSchema } from "@/lib/schemas/library";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { LibraryAssetDetailDto, Phase4LibraryDashboardResponseDto } from "@/types/library";

function resolveApiUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

function buildLibraryDashboardUrl(query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>) {
  const queryString = createListQuerySearchParams(query ?? {}).toString();
  return queryString ? `/api/library?${queryString}` : "/api/library";
}

export async function getLibraryDashboard(options?: {
  baseUrl?: string;
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>;
}): Promise<Phase4LibraryDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: resolveApiUrl(buildLibraryDashboardUrl(options?.query), options?.baseUrl),
    schema: libraryDashboardResponseDtoSchema,
  });
}

export async function getLibraryAssetDetail(options: {
  assetId: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
}): Promise<LibraryAssetDetailDto> {
  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: resolveApiUrl(`/api/library/${encodeURIComponent(options.assetId)}`, options.baseUrl),
    schema: libraryAssetDetailDtoSchema,
  });
}
