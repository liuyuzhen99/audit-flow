import { createListQuerySearchParams } from "@/lib/query/list-query";
import { libraryDashboardResponseDtoSchema } from "@/lib/schemas/library";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { LibraryDashboardResponseDto } from "@/types/library";

function buildLibraryDashboardUrl(query?: Partial<Pick<ListQueryDto, "q" | "status">>) {
  const queryString = createListQuerySearchParams(query ?? {}).toString();
  return queryString ? `/api/mock/library?${queryString}` : "/api/mock/library";
}

export async function getLibraryDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "q" | "status">>;
}): Promise<LibraryDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildLibraryDashboardUrl(options?.query),
    schema: libraryDashboardResponseDtoSchema,
  });
}
