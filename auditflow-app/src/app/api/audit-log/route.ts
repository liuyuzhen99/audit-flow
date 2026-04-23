import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

type BackendAuditLogItem = {
  log_id: string;
  aggregate_type: string;
  aggregate_id: string;
  action: string;
  actor_id: string;
  details: string | null;
  created_at: string;
};

type BackendAuditLogResponse = {
  items: BackendAuditLogItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  meta: {
    generated_at: string;
  };
};

export async function GET(request: NextRequest) {
  const aggregateType = request.nextUrl.searchParams.get("aggregateType");
  const aggregateId = request.nextUrl.searchParams.get("aggregateId");

  if (!aggregateType || !aggregateId) {
    return createErrorResponse(400, "missing_audit_log_query", "aggregateType and aggregateId are required");
  }

  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/audit-log`);
  backendUrl.searchParams.set("aggregate_type", aggregateType);
  backendUrl.searchParams.set("aggregate_id", aggregateId);

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = await parseBackendJson<BackendAuditLogResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "audit_log_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load audit log"),
      );
    }

    return NextResponse.json({
      items: (payload as BackendAuditLogResponse).items.map((item) => ({
        logId: item.log_id,
        aggregateType: item.aggregate_type,
        aggregateId: item.aggregate_id,
        action: item.action,
        actorId: item.actor_id,
        details: item.details,
        createdAt: normalizeBackendTimestamp(item.created_at),
      })),
      pagination: {
        page: (payload as BackendAuditLogResponse).pagination.page,
        pageSize: (payload as BackendAuditLogResponse).pagination.page_size,
        total: (payload as BackendAuditLogResponse).pagination.total,
        totalPages: (payload as BackendAuditLogResponse).pagination.total_pages,
      },
      meta: {
        generatedAt: normalizeBackendTimestamp((payload as BackendAuditLogResponse).meta.generated_at),
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "audit_log_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach audit log backend",
    );
  }
}
