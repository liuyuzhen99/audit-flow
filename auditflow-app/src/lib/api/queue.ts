import { createListQuerySearchParams } from "@/lib/query/list-query";
import {
  auditLogResponseDtoSchema,
  queueDashboardResponseDtoSchema,
  reviewDecisionRequestDtoSchema,
  reviewDecisionResponseDtoSchema,
} from "@/lib/schemas/queue";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ListQueryDto } from "@/types/api";
import type { AuditLogResponseDto, Phase4QueueDashboardResponseDto, ReviewDecisionRequestDto, ReviewDecisionResponseDto } from "@/types/queue";

function resolveApiUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

function buildQueueDashboardUrl(
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>,
) {
  const queryString = createListQuerySearchParams(query ?? {}, { includeTick: true }).toString();
  return queryString ? `/api/queue?${queryString}` : "/api/queue";
}

export async function getQueueDashboard(options?: {
  baseUrl?: string;
  fetcher?: typeof fetch;
  query?: Partial<Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">>;
}): Promise<Phase4QueueDashboardResponseDto> {
  return fetchValidatedJson({
    fetcher: options?.fetcher,
    input: resolveApiUrl(buildQueueDashboardUrl(options?.query), options?.baseUrl),
    schema: queueDashboardResponseDtoSchema,
  });
}

async function sendReviewDecision(
  path: string,
  options: ReviewDecisionRequestDto & { fetcher?: typeof fetch },
): Promise<ReviewDecisionResponseDto> {
  const fetcher = options.fetcher ?? fetch;
  const payload = reviewDecisionRequestDtoSchema.parse(options);
  const response = await fetcher(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(payload.actorId ? { "X-Actor-Id": payload.actorId } : {}),
    },
    body: JSON.stringify({
      expectedVersion: payload.expectedVersion,
      comment: payload.comment,
    }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(typeof body?.message === "string" ? body.message : "Failed to submit review decision");
  }

  return reviewDecisionResponseDtoSchema.parse(body);
}

export async function approveReview(options: {
  fetcher?: typeof fetch;
  reviewId: string;
  expectedVersion: number;
  comment?: string;
  actorId?: string;
}) {
  return sendReviewDecision(`/api/reviews/${options.reviewId}/approve`, options);
}

export async function rejectReview(options: {
  fetcher?: typeof fetch;
  reviewId: string;
  expectedVersion: number;
  comment?: string;
  actorId?: string;
}) {
  return sendReviewDecision(`/api/reviews/${options.reviewId}/reject`, options);
}

export async function getAuditLog(options: {
  baseUrl?: string;
  fetcher?: typeof fetch;
  aggregateType: string;
  aggregateId: string;
}): Promise<AuditLogResponseDto> {
  const params = new URLSearchParams({
    aggregateType: options.aggregateType,
    aggregateId: options.aggregateId,
  });

  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: resolveApiUrl(`/api/audit-log?${params.toString()}`, options.baseUrl),
    schema: auditLogResponseDtoSchema,
  });
}
