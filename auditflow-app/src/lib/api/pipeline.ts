import { z } from "zod";

import { createListQuerySearchParams } from "@/lib/query/list-query";
import { pipelineDashboardResponseDtoSchema } from "@/lib/schemas/pipeline";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { PipelineDashboardResponseDto } from "@/types/pipeline";

const stopPipelineJobResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().min(1),
  message: z.string().min(1),
});

export type StopPipelineJobResponseDto = z.infer<typeof stopPipelineJobResponseSchema>;

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

export async function stopPipelineJob(options: {
  fetcher?: typeof fetch;
  jobId: string;
}): Promise<StopPipelineJobResponseDto> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher("/api/mock/pipeline/stop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jobId: options.jobId }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(typeof payload?.message === "string" ? payload.message : "Failed to stop pipeline job");
  }

  return stopPipelineJobResponseSchema.parse(payload);
}
