import { NextRequest } from "next/server";

import { createErrorResponse, getBackendBaseUrl } from "@/app/api/backend";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await params;
  const backendUrl = `${getBackendBaseUrl()}/v1/artifacts/${encodeURIComponent(artifactId)}/download`;

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    if (!response.ok || response.body === null) {
      return createErrorResponse(response.status || 502, "artifact_download_failed", "Failed to download artifact");
    }
    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/octet-stream",
        "content-disposition": response.headers.get("content-disposition") ?? "attachment",
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "artifact_download_failed",
      error instanceof Error ? error.message : "Failed to reach artifact backend",
    );
  }
}
