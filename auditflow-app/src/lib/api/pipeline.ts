import { pipelineDashboardResponseDtoSchema } from "@/lib/schemas/pipeline";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { PipelineDashboardResponseDto } from "@/types/pipeline";

function buildPipelineDashboardUrl(query?: Partial<Pick<ListQueryDto, "q" | "status" | "tick">>) {
  const searchParams = new URLSearchParams();

  if (query?.q) {
    searchParams.set("q", query.q);
  }

  if (query?.status) {
    searchParams.set("status", query.status);
  }

  if (query?.tick !== undefined) {
    searchParams.set("tick", String(query.tick));
  }

  const queryString = searchParams.toString();
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
