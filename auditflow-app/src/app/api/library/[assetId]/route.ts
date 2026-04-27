import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";

type BackendArtifactSummary = {
  artifact_id: string;
  artifact_type: string;
  object_uri: string;
  content_type: string | null;
  size_bytes: number;
  checksum_sha256: string;
  lifecycle_status: string;
  version: number;
  created_at: string;
  expires_at: string | null;
};

function mapBackendArtifact(artifact: BackendArtifactSummary) {
  return {
    artifactId: artifact.artifact_id,
    artifactType: artifact.artifact_type,
    objectUri: artifact.object_uri,
    contentType: artifact.content_type,
    sizeBytes: artifact.size_bytes,
    checksumSha256: artifact.checksum_sha256,
    lifecycleStatus: artifact.lifecycle_status,
    version: artifact.version,
    createdAt: normalizeBackendTimestamp(artifact.created_at),
    expiresAt: normalizeBackendTimestamp(artifact.expires_at),
  };
}

type BackendLibraryItem = {
  asset_id: string;
  artist_id: string;
  artist_name: string;
  title: string;
  source_url: string;
  approved_at: string | null;
  approved_by: string | null;
  curation_status: "accepted";
  artifact_status?: "ready" | "missing" | "expired" | "deleted" | "delete_failed";
  artifacts?: BackendArtifactSummary[];
};

type BackendLibraryResponse = {
  items: BackendLibraryItem[];
  meta: {
    generated_at: string;
  };
};

type BackendArtifactDetail = {
  artifact_id: string;
  status: "ready" | "missing" | "expired" | "deleted" | "delete_failed";
  preview_url: string | null;
  preview_url_expires_in_seconds: number | null;
  fallback_download_url: string | null;
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const decodedAssetId = decodeURIComponent(assetId);
  const libraryUrl = new URL(`${getBackendBaseUrl()}/v1/library`);

  try {
    const response = await fetch(libraryUrl, { cache: "no-store" });
    const payload = await parseBackendJson<BackendLibraryResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "library_asset_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load library asset"),
      );
    }

    const item = (payload as BackendLibraryResponse).items.find((candidate) => candidate.asset_id === decodedAssetId);
    if (!item) {
      return createErrorResponse(404, "library_asset_not_found", "Library asset not found");
    }

    const artifacts = item.artifacts ?? [];
    const primaryArtifact =
      artifacts.find((artifact) => artifact.artifact_type === "final_video") ?? artifacts[0] ?? null;
    let previewUrl: string | null = null;
    let previewUrlExpiresInSeconds: number | null = null;
    let fallbackDownloadUrl: string | null = null;
    let artifactStatus = item.artifact_status ?? (primaryArtifact ? "ready" : "missing");

    if (primaryArtifact && artifactStatus === "ready") {
      const artifactUrl = new URL(`${getBackendBaseUrl()}/v1/artifacts/${encodeURIComponent(primaryArtifact.artifact_id)}`);
      artifactUrl.searchParams.set("expires_in_seconds", "900");
      const artifactResponse = await fetch(artifactUrl, { cache: "no-store" });
      const artifactPayload = await parseBackendJson<BackendArtifactDetail | { error?: { message?: string }; detail?: string }>(artifactResponse);
      if (artifactResponse.ok) {
        const detail = artifactPayload as BackendArtifactDetail;
        artifactStatus = detail.status;
        fallbackDownloadUrl = detail.fallback_download_url
          ? `/api/artifacts/${encodeURIComponent(primaryArtifact.artifact_id)}/download`
          : null;
        previewUrl = detail.preview_url?.startsWith("/")
          ? fallbackDownloadUrl
          : (detail.preview_url ?? fallbackDownloadUrl);
        previewUrlExpiresInSeconds = detail.preview_url_expires_in_seconds;
      } else {
        artifactStatus = "expired";
      }
    }

    return NextResponse.json({
      id: item.asset_id,
      artistId: item.artist_id,
      artistName: item.artist_name,
      title: item.title,
      sourceUrl: item.source_url,
      approvedAt: normalizeBackendTimestamp(item.approved_at),
      approvedBy: item.approved_by,
      status: item.curation_status,
      artifactStatus,
      artifacts: artifacts.map(mapBackendArtifact),
      primaryArtifact: primaryArtifact ? mapBackendArtifact(primaryArtifact) : null,
      previewUrl,
      previewUrlExpiresInSeconds,
      fallbackDownloadUrl,
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "library_asset_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach library backend",
    );
  }
}
