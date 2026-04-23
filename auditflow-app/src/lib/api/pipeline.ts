import { createListQuerySearchParams } from "@/lib/query/list-query";
import { pipelineDashboardResponseDtoSchema } from "@/lib/schemas/pipeline";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { Phase4PipelineDashboardResponseDto } from "@/types/pipeline";

function resolveApiUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

function buildPipelineDashboardUrl(
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>,
) {
  const queryString = createListQuerySearchParams(query ?? {}, { includeTick: true }).toString();
  return queryString ? `/api/pipeline?${queryString}` : "/api/pipeline";
}

export async function getPipelineDashboard(options?: {
  baseUrl?: string;
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>;
}): Promise<Phase4PipelineDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: resolveApiUrl(buildPipelineDashboardUrl(options?.query), options?.baseUrl),
    schema: pipelineDashboardResponseDtoSchema,
  });
}
