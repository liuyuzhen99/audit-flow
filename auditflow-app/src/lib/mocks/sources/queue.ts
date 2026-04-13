import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_POLLING_INTERVAL_MS } from "@/types/api";
import type { ListQueryDto, SortDirection } from "@/types/api";
import type { QueueDashboardResponseDto, QueueItemDto } from "@/types/queue";
import { queueSeedRecords } from "@/lib/mocks/data/queue";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { simulateQueueItems } from "@/lib/mocks/simulators/queue";
import { queueDashboardResponseDtoSchema } from "@/lib/schemas/queue";

type QueueDashboardQuery = Pick<ListQueryDto, "page" | "pageSize" | "q" | "status" | "sortBy" | "sortDirection" | "tick">;

function filterQueueItems(items: QueueItemDto[], query?: Pick<ListQueryDto, "q" | "status">): QueueItemDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.title.toLowerCase().includes(query.q.toLowerCase()) ||
      item.artistName.toLowerCase().includes(query.q.toLowerCase()) ||
      item.id.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.status === query.status;

    return matchesQuery && matchesStatus;
  });
}

function sortQueueItems(items: QueueItemDto[], sortBy?: string, sortDirection: SortDirection = "asc"): QueueItemDto[] {
  const sortedItems = [...items];
  const sortMultiplier = sortDirection === "desc" ? -1 : 1;

  sortedItems.sort((left, right) => {
    switch (sortBy) {
      case "title":
        return left.title.localeCompare(right.title) * sortMultiplier;
      case "status":
        return left.status.localeCompare(right.status) * sortMultiplier;
      case "confidence":
        return ((left.auditDecision.confidenceScore ?? -1) - (right.auditDecision.confidenceScore ?? -1)) * sortMultiplier;
      case "progress":
        return (left.progress.percent - right.progress.percent) * sortMultiplier;
      default:
        return 0;
    }
  });

  return sortedItems;
}

function paginateQueueItems(items: QueueItemDto[], page: number, pageSize: number) {
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

function countQueueItems(items: QueueItemDto[], predicate: (item: QueueItemDto) => boolean): string {
  return String(items.filter(predicate).length);
}

export function buildQueueDashboardResponse(query?: Partial<QueueDashboardQuery>): QueueDashboardResponseDto {
  const tick = query?.tick ?? 0;
  const simulatedItems = simulateQueueItems(queueSeedRecords, tick);
  const filteredItems = filterQueueItems(simulatedItems, query);
  const sortedItems = sortQueueItems(filteredItems, query?.sortBy, query?.sortDirection);
  const paginatedItems = paginateQueueItems(sortedItems, query?.page ?? DEFAULT_PAGE, query?.pageSize ?? DEFAULT_PAGE_SIZE);
  const terminal = sortedItems.every(
    (item) => item.status === "autoApproved" || item.status === "manualReview" || item.status === "autoRejected",
  );

  return queueDashboardResponseDtoSchema.parse({
    summary: [
      { id: "queue-active", label: "Active Tasks", value: countQueueItems(sortedItems, (item) => item.status === "queued" || item.status === "downloading" || item.status === "auditing"), tone: "info" },
      { id: "queue-approved", label: "Auto-approved Today", value: countQueueItems(sortedItems, (item) => item.status === "autoApproved"), tone: "success" },
      { id: "queue-manual", label: "Manual Review", value: countQueueItems(sortedItems, (item) => item.status === "manualReview"), tone: "warning" },
      { id: "queue-rejected", label: "Auto-rejected", value: countQueueItems(sortedItems, (item) => item.status === "autoRejected"), tone: "danger" },
    ],
    items: paginatedItems.items,
    pagination: paginatedItems.pagination,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
    polling: {
      intervalMs: DEFAULT_POLLING_INTERVAL_MS,
      tick,
      terminal,
    },
  });
}
