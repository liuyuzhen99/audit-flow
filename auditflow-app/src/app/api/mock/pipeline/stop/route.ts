import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import type { ApiErrorDto } from "@/types/api";

/** Typed response for the stop-job mock action */
export const stopPipelineJobResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().min(1),
  message: z.string().min(1),
});

export type StopPipelineJobResponseDto = z.infer<typeof stopPipelineJobResponseSchema>;

function createErrorResponse(status: number, code: string, message: string) {
  const payload: ApiErrorDto = { code, message };
  return NextResponse.json(payload, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const jobId = typeof body?.jobId === "string" && body.jobId.trim() ? body.jobId.trim() : null;

    if (!jobId) {
      return createErrorResponse(400, "missing_job_id", "jobId is required");
    }

    const payload: StopPipelineJobResponseDto = {
      success: true,
      jobId,
      message: `Job ${jobId} has been requested to stop.`,
    };

    return NextResponse.json(stopPipelineJobResponseSchema.parse(payload));
  } catch (error) {
    return createErrorResponse(
      500,
      "stop_job_failed",
      error instanceof Error ? error.message : "Failed to stop pipeline job",
    );
  }
}
