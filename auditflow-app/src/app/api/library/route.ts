import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, getBackendBaseUrl, getBackendErrorMessage, parseBackendJson } from "@/app/api/backend";
import { normalizeBackendTimestamp } from "@/app/api/artists/timestamps";
import { parseListQueryParams } from "@/types/api";

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

type BackendLibraryResponse = {
  items: BackendLibraryItem[];
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

function buildSummary(items: BackendLibraryItem[]) {
  return [
    { id: "library-assets", label: "Accepted Assets", value: String(items.length), hint: "Visible in the real library feed", tone: "success" as const },
  ];
}

function sortItems(items: BackendLibraryItem[], sortBy?: string, sortDirection?: "asc" | "desc") {
  const direction = sortDirection === "asc" ? 1 : -1;
  const sorted = [...items];

  sorted.sort((left, right) => {
    const leftValue =
      sortBy === "artistName"
        ? left.artist_name
        : sortBy === "approvedAt"
          ? left.approved_at ?? ""
          : left.title;
    const rightValue =
      sortBy === "artistName"
        ? right.artist_name
        : sortBy === "approvedAt"
          ? right.approved_at ?? ""
          : right.title;

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });

  return sorted;
}

export async function GET(request: NextRequest) {
  const query = parseListQueryParams(request.nextUrl.searchParams);
  const backendUrl = new URL(`${getBackendBaseUrl()}/v1/library`);

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = await parseBackendJson<BackendLibraryResponse | { error?: { message?: string }; detail?: string }>(response);

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        "library_fetch_failed",
        getBackendErrorMessage(payload as never, "Failed to load library"),
      );
    }

    const rawItems = (payload as BackendLibraryResponse).items;
    const filteredItems = rawItems.filter((item) => {
      const matchesQuery =
        !query.q ||
        item.title.toLowerCase().includes(query.q.toLowerCase()) ||
        item.artist_name.toLowerCase().includes(query.q.toLowerCase());
      const matchesStatus = !query.status || item.curation_status === query.status;
      return matchesQuery && matchesStatus;
    });
    const sortedItems = sortItems(filteredItems, query.sortBy, query.sortDirection);
    const start = (query.page - 1) * query.pageSize;
    const pageItems = sortedItems.slice(start, start + query.pageSize);

    return NextResponse.json({
      summary: buildSummary(sortedItems),
      items: pageItems.map((item) => ({
        id: item.asset_id,
        artistId: item.artist_id,
        artistName: item.artist_name,
        title: item.title,
        sourceUrl: item.source_url,
        approvedAt: normalizeBackendTimestamp(item.approved_at),
        approvedBy: item.approved_by,
        status: item.curation_status,
        artifactStatus: item.artifact_status ?? "missing",
        artifacts: (item.artifacts ?? []).map(mapBackendArtifact),
      })),
      meta: {
        generatedAt: normalizeBackendTimestamp((payload as BackendLibraryResponse).meta.generated_at),
      },
    });
  } catch (error) {
    return createErrorResponse(
      502,
      "library_fetch_failed",
      error instanceof Error ? error.message : "Failed to reach library backend",
    );
  }
}
