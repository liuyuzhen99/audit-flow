import { artistsDashboardResponseDtoSchema, artistListResponseDtoSchema } from "@/lib/schemas/artist";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { artistSeedRecords } from "@/lib/mocks/data/artists";
import type { ListQueryDto } from "@/types/api";
import type { ArtistDto, ArtistsDashboardResponseDto, ArtistListResponseDto } from "@/types/artist";

function filterArtists(items: ArtistDto[], query?: Pick<ListQueryDto, "q" | "status">): ArtistDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.name.toLowerCase().includes(query.q.toLowerCase()) ||
      item.channel.name.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.auditSnapshot.status === query.status;

    return matchesQuery && matchesStatus;
  });
}

export function listArtists(query: ListQueryDto): ArtistListResponseDto {
  const filteredItems = filterArtists(artistSeedRecords, query);
  const startIndex = (query.page - 1) * query.pageSize;
  const items = filteredItems.slice(startIndex, startIndex + query.pageSize);

  return artistListResponseDtoSchema.parse({
    items,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}

export function buildArtistsDashboardResponse(query?: Pick<ListQueryDto, "q" | "status">): ArtistsDashboardResponseDto {
  const items = filterArtists(artistSeedRecords, query);

  return artistsDashboardResponseDtoSchema.parse({
    summary: [
      { id: "artists-monitored", label: "Monitored Artists", value: "1,284", hint: "+12 this week", tone: "success" },
      { id: "artists-releases", label: "New Releases", value: "86", hint: "24 awaiting manual review", tone: "info" },
      { id: "artists-pass-rate", label: "Auto-pass Rate", value: "94.2%", hint: "AI audit stable", tone: "success" },
      { id: "artists-quota", label: "API Quota", value: "8,420", hint: "YouTube Data v3", tone: "warning" },
    ],
    items,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}
