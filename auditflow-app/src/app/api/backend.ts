import { NextResponse } from "next/server";

import type { ApiErrorDto } from "@/types/api";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";

type BackendErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    status_code?: number;
  };
  detail?: string;
};

export function getBackendBaseUrl() {
  return (process.env.RANDY_TRANSLATION_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL).replace(/\/$/, "");
}

export function createErrorResponse(status: number, code: string, message: string, details?: string) {
  const payload: ApiErrorDto = { code, message, details };
  return NextResponse.json(payload, { status });
}

export async function parseBackendJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function getBackendErrorMessage(
  payload: BackendErrorEnvelope | null | undefined,
  fallback: string,
) {
  if (payload?.error?.message) {
    return payload.error.message;
  }

  if (payload?.detail) {
    return payload.detail;
  }

  return fallback;
}

