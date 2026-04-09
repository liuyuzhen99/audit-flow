import { artistsDashboardResponseDtoSchema } from "@/lib/schemas/artist";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { ArtistsDashboardResponseDto } from "@/types/artist";

function buildArtistsDashboardUrl(query?: Partial<Pick<ListQueryDto, "q" | "status">>) {
  const searchParams = new URLSearchParams();

  if (query?.q) {
    searchParams.set("q", query.q);
  }

  if (query?.status) {
    searchParams.set("status", query.status);
  }

  const queryString = searchParams.toString();
  return queryString ? `/api/mock/artists?${queryString}` : "/api/mock/artists";
}

export async function getArtistsDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "q" | "status">>;
}): Promise<ArtistsDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildArtistsDashboardUrl(options?.query),
    schema: artistsDashboardResponseDtoSchema,
  });
}
