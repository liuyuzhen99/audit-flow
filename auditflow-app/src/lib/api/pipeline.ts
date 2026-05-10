import { createListQuerySearchParams } from "@/lib/query/list-query";
import {
  candidatePipelineResponseDtoSchema,
  candidateWorkflowDetailDtoSchema,
  pipelineDashboardResponseDtoSchema,
} from "@/lib/schemas/pipeline";
import { z } from "zod";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type {
  CandidatePipelineResponseDto,
  CandidateWorkflowDetailDto,
  Phase4PipelineDashboardResponseDto,
} from "@/types/pipeline";

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

export async function startCandidateRender(options: {
  candidateId: string;
  fetcher?: typeof fetch;
}): Promise<{ taskId: string; message: string; candidateId: string | null }> {
  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: `/api/candidates/${encodeURIComponent(options.candidateId)}/render`,
    init: { method: "POST" },
    schema: z.object({
      taskId: z.string().min(1),
      message: z.string().min(1),
      candidateId: z.string().nullable(),
    }),
  });
}

export async function addCandidateToPipeline(options: {
  candidateId: string;
  fetcher?: typeof fetch;
}): Promise<CandidatePipelineResponseDto> {
  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: `/api/candidates/${encodeURIComponent(options.candidateId)}/pipeline`,
    init: { method: "POST" },
    schema: candidatePipelineResponseDtoSchema,
  });
}

export async function retryCandidatePipeline(options: {
  candidateId: string;
  fetcher?: typeof fetch;
}): Promise<{ candidateId: string; jobId: string; stage: string; attempt: number; message: string }> {
  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: `/api/candidates/${encodeURIComponent(options.candidateId)}/pipeline/retry`,
    init: { method: "POST" },
    schema: z.object({
      candidateId: z.string().min(1),
      jobId: z.string().min(1),
      stage: z.string().min(1),
      attempt: z.number().int().nonnegative(),
      message: z.string().min(1),
    }),
  });
}

export async function getCandidateWorkflowDetail(options: {
  candidateId: string;
  fetcher?: typeof fetch;
}): Promise<CandidateWorkflowDetailDto> {
  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: `/api/candidates/${encodeURIComponent(options.candidateId)}/workflow-detail`,
    schema: candidateWorkflowDetailDtoSchema,
  });
}
