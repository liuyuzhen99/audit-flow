import { artistsDashboardResponseDtoSchema, artistListResponseDtoSchema } from "@/lib/schemas/artist";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { artistSeedRecords } from "@/lib/mocks/data/artists";
import { DEFAULT_PAGE, type ListQueryDto, SortDirection } from "@/types/api";
import type { ArtistDto, ArtistsDashboardResponseDto, ArtistListResponseDto, ArtistsListQueryDto } from "@/types/artist";

// Cutoff date for "Recent 2 Weeks" filter — deterministic, not Date.now()
const TWO_WEEKS_CUTOFF = new Date("2026-03-31T00:00:00.000Z");

type ArtistsDashboardQuery = Pick<ArtistsListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "dateRange">;

function filterArtists(items: ArtistDto[], query?: Pick<ArtistsListQueryDto, "q" | "status" | "dateRange">): ArtistDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.name.toLowerCase().includes(query.q.toLowerCase()) ||
      item.channel.name.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.auditSnapshot.status === query.status;
    // dateRange=2w: only include artists synced within the last two weeks
    const matchesDateRange =
      !query?.dateRange || new Date(item.lastSyncedAt) >= TWO_WEEKS_CUTOFF;

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
      case "spotifyFollowers":
        return (left.spotifyFollowers - right.spotifyFollowers) * sortMultiplier;
      case "recentReleaseCount":
        return (left.recentReleaseCount - right.recentReleaseCount) * sortMultiplier;
      case "status":
        return left.auditSnapshot.status.localeCompare(right.auditSnapshot.status) * sortMultiplier;
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
      { id: "artists-monitored", label: "Monitored Artists", value: "1,284", hint: "+12 this week", tone: "success" },
      { id: "artists-releases", label: "New Releases", value: "86", hint: "24 awaiting manual review", tone: "info" },
      { id: "artists-pass-rate", label: "Auto-pass Rate", value: "94.2%", hint: "AI audit stable", tone: "success" },
      { id: "artists-quota", label: "API Quota", value: "8,420", hint: "YouTube Data v3", tone: "warning" },
    ],
    items: paginatedItems.items,
    pagination: paginatedItems.pagination,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}
