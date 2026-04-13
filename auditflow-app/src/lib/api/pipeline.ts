import { createListQuerySearchParams } from "@/lib/query/list-query";
import { pipelineDashboardResponseDtoSchema } from "@/lib/schemas/pipeline";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { PipelineDashboardResponseDto } from "@/types/pipeline";

function buildPipelineDashboardUrl(query?: Partial<Pick<ListQueryDto, "q" | "status" | "tick">>) {
  const queryString = createListQuerySearchParams(query ?? {}, { includeTick: true }).toString();
  return queryString ? `/api/mock/pipeline?${queryString}` : "/api/mock/pipeline";
}

export async function getPipelineDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "q" | "status" | "tick">>;
}): Promise<PipelineDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildPipelineDashboardUrl(options?.query),
    schema: pipelineDashboardResponseDtoSchema,
  });
}
