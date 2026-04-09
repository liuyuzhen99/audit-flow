import { queueDashboardResponseDtoSchema } from "@/lib/schemas/queue";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { QueueDashboardResponseDto } from "@/types/queue";

function buildQueueDashboardUrl(query?: Partial<Pick<ListQueryDto, "q" | "status" | "tick">>) {
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
  return queryString ? `/api/mock/queue?${queryString}` : "/api/mock/queue";
}

export async function getQueueDashboard(options?: {
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "q" | "status" | "tick">>;
}): Promise<QueueDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: buildQueueDashboardUrl(options?.query),
    schema: queueDashboardResponseDtoSchema,
  });
}
