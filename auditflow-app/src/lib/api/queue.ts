import { createListQuerySearchParams } from "@/lib/query/list-query";
import { queueDashboardResponseDtoSchema } from "@/lib/schemas/queue";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { QueueDashboardResponseDto } from "@/types/queue";

function buildQueueDashboardUrl(
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>,
) {
  const queryString = createListQuerySearchParams(query ?? {}, { includeTick: true }).toString();
  return queryString ? `/api/mock/queue?${queryString}` : "/api/mock/queue";
}

export async function getQueueDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>;
}): Promise<QueueDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildQueueDashboardUrl(options?.query),
    schema: queueDashboardResponseDtoSchema,
  });
}
