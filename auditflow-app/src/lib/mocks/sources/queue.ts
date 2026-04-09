import { DEFAULT_POLLING_INTERVAL_MS } from "@/types/api";
import type { ListQueryDto } from "@/types/api";
import type { QueueDashboardResponseDto, QueueItemDto } from "@/types/queue";
import { queueSeedRecords } from "@/lib/mocks/data/queue";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { simulateQueueItems } from "@/lib/mocks/simulators/queue";
import { queueDashboardResponseDtoSchema } from "@/lib/schemas/queue";

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

function countQueueItems(items: QueueItemDto[], predicate: (item: QueueItemDto) => boolean): string {
  return String(items.filter(predicate).length);
}

export function buildQueueDashboardResponse(query?: Pick<ListQueryDto, "q" | "status" | "tick">): QueueDashboardResponseDto {
  const tick = query?.tick ?? 0;
  const simulatedItems = simulateQueueItems(queueSeedRecords, tick);
  const items = filterQueueItems(simulatedItems, query);
  const terminal = items.every((item) => item.status === "autoApproved" || item.status === "manualReview" || item.status === "autoRejected");

  return queueDashboardResponseDtoSchema.parse({
    summary: [
      { id: "queue-active", label: "Active Tasks", value: countQueueItems(items, (item) => item.status === "queued" || item.status === "downloading" || item.status === "auditing"), tone: "info" },
      { id: "queue-approved", label: "Auto-approved Today", value: countQueueItems(items, (item) => item.status === "autoApproved"), tone: "success" },
      { id: "queue-manual", label: "Manual Review", value: countQueueItems(items, (item) => item.status === "manualReview"), tone: "warning" },
      { id: "queue-rejected", label: "Auto-rejected", value: countQueueItems(items, (item) => item.status === "autoRejected"), tone: "danger" },
    ],
    items,
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
