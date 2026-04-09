import type { ListQueryDto } from "@/types/api";
import type { LibraryAssetDto, LibraryDashboardResponseDto } from "@/types/library";
import { libraryDashboardResponseDtoSchema } from "@/lib/schemas/library";
import { librarySeedRecords } from "@/lib/mocks/data/library";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";

function filterLibraryAssets(items: LibraryAssetDto[], query?: Pick<ListQueryDto, "q" | "status">): LibraryAssetDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.title.toLowerCase().includes(query.q.toLowerCase()) ||
      item.artistName.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.status === query.status;

    return matchesQuery && matchesStatus;
  });
}

function countLibraryAssets(items: LibraryAssetDto[], predicate: (item: LibraryAssetDto) => boolean): string {
  return String(items.filter(predicate).length);
}

export function buildLibraryDashboardResponse(query?: Pick<ListQueryDto, "q" | "status">): LibraryDashboardResponseDto {
  const items = filterLibraryAssets(librarySeedRecords, query);

  return libraryDashboardResponseDtoSchema.parse({
    summary: [
      { id: "library-published", label: "Published Assets", value: countLibraryAssets(items, (item) => item.status === "published"), hint: "8 visible in this view", tone: "success" },
      { id: "library-processing", label: "Processing", value: countLibraryAssets(items, (item) => item.status === "processing"), hint: "Awaiting renders", tone: "info" },
      { id: "library-review", label: "Needs Review", value: countLibraryAssets(items, (item) => item.status === "review"), hint: "One failed audit package", tone: "warning" },
      { id: "library-refresh", label: "Recent Sync", value: "2m", hint: "Library refreshed recently", tone: "info" },
    ],
    items,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}
