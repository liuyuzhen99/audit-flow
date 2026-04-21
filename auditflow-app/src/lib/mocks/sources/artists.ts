import { artistsDashboardResponseDtoSchema, artistListResponseDtoSchema } from "@/lib/schemas/artist";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { artistSeedRecords } from "@/lib/mocks/data/artists";
import { DEFAULT_PAGE, type ListQueryDto, SortDirection } from "@/types/api";
import type { ArtistDto, ArtistsDashboardResponseDto, ArtistListResponseDto, ArtistsListQueryDto } from "@/types/artist";

type ArtistsDashboardQuery = Pick<ArtistsListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "dateRange">;

function filterArtists(items: ArtistDto[], query?: Pick<ArtistsListQueryDto, "q" | "status" | "dateRange">): ArtistDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.name.toLowerCase().includes(query.q.toLowerCase()) ||
      item.youtubeChannelLabel.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.syncStatus === query.status;
    const matchesDateRange = !query?.dateRange || true;

    return matchesQuery && matchesStatus && matchesDateRange;
  });
}

function sortArtists(items: ArtistDto[], sortBy?: string, sortDirection: SortDirection = "asc"): ArtistDto[] {
  const sortedItems = [...items];
  const sortMultiplier = sortDirection === "desc" ? -1 : 1;

  sortedItems.sort((left, right) => {
    switch (sortBy) {
      case "name":
        return left.name.localeCompare(right.name) * sortMultiplier;
      case "updatedAt":
        return (
          new Date(left.lastSyncCompletedAt ?? 0).getTime() -
          new Date(right.lastSyncCompletedAt ?? 0).getTime()
        ) * sortMultiplier;
      case "status":
        return left.syncStatus.localeCompare(right.syncStatus) * sortMultiplier;
      default:
        return 0;
    }
  });

  return sortedItems;
}

function paginateArtists(items: ArtistDto[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  };
}

export function listArtists(query: ListQueryDto): ArtistListResponseDto {
  const filteredItems = filterArtists(artistSeedRecords, query);
  const sortedItems = sortArtists(filteredItems, query.sortBy, query.sortDirection);
  const paginatedItems = paginateArtists(sortedItems, query.page, query.pageSize);

  return artistListResponseDtoSchema.parse({
    items: paginatedItems.items,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}

export function buildArtistsDashboardResponse(query?: Partial<ArtistsDashboardQuery>): ArtistsDashboardResponseDto {
  const filteredItems = filterArtists(artistSeedRecords, query);
  const sortedItems = sortArtists(filteredItems, query?.sortBy, query?.sortDirection);
  const paginatedItems = paginateArtists(sortedItems, query?.page ?? DEFAULT_PAGE, query?.pageSize ?? 10);

  return artistsDashboardResponseDtoSchema.parse({
    summary: [
      { id: "artists-in-view", label: "Artists in View", value: String(paginatedItems.items.length), hint: "Mock dataset", tone: "info" },
      { id: "artists-completed", label: "Completed", value: String(filteredItems.filter((item) => item.syncStatus === "completed").length), hint: "Mock sync state", tone: "success" },
      { id: "artists-failed", label: "Failed", value: String(filteredItems.filter((item) => item.syncStatus === "failed" || item.syncStatus === "partial").length), hint: "Mock failure state", tone: "warning" },
      { id: "artists-candidates", label: "Candidates", value: String(filteredItems.reduce((sum, item) => sum + item.candidateCount, 0)), hint: "Mock candidate count", tone: "info" },
    ],
    items: paginatedItems.items,
    pagination: paginatedItems.pagination,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}
