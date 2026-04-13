import { createListQuerySearchParams } from "@/lib/query/list-query";
import { artistsDashboardResponseDtoSchema } from "@/lib/schemas/artist";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { ArtistsDashboardResponseDto } from "@/types/artist";

function buildArtistsDashboardUrl(
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>,
) {
  const queryString = createListQuerySearchParams(query ?? {}).toString();
  return queryString ? `/api/mock/artists?${queryString}` : "/api/mock/artists";
}

export async function getArtistsDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection">>;
}): Promise<ArtistsDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildArtistsDashboardUrl(options?.query),
    schema: artistsDashboardResponseDtoSchema,
  });
}
