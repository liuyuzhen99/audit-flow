import { DEFAULT_POLLING_INTERVAL_MS } from "@/types/api";
import type { ListQueryDto } from "@/types/api";
import type { PipelineDashboardResponseDto, PipelineJobDto } from "@/types/pipeline";
import { pipelineSeedRecords } from "@/lib/mocks/data/pipeline";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { simulatePipelineJobDetail, simulatePipelineJobs } from "@/lib/mocks/simulators/pipeline";
import { pipelineDashboardResponseDtoSchema } from "@/lib/schemas/pipeline";

function filterPipelineJobs(items: PipelineJobDto[], query?: Pick<ListQueryDto, "q" | "status">): PipelineJobDto[] {
  return items.filter((item) => {
    const matchesQuery =
      !query?.q ||
      item.title.toLowerCase().includes(query.q.toLowerCase()) ||
      item.artistName.toLowerCase().includes(query.q.toLowerCase());
    const matchesStatus = !query?.status || item.status === query.status;

    return matchesQuery && matchesStatus;
  });
}

function countPipelineJobs(items: PipelineJobDto[], predicate: (item: PipelineJobDto) => boolean): string {
  return String(items.filter(predicate).length);
}

export function buildPipelineDashboardResponse(query?: Pick<ListQueryDto, "q" | "status" | "tick">): PipelineDashboardResponseDto {
  const tick = query?.tick ?? 0;
  const jobs = filterPipelineJobs(simulatePipelineJobs(pipelineSeedRecords, tick), query);
  const activeJobSeed = pipelineSeedRecords.find((seed) => seed.id === jobs.find((job) => job.status === "running")?.id) ?? null;
  const activeJob = activeJobSeed ? simulatePipelineJobDetail(activeJobSeed, tick) : null;
  const terminal = jobs.every((job) => job.status === "completed" || job.status === "failed");

  return pipelineDashboardResponseDtoSchema.parse({
    summary: [
      { id: "pipeline-running", label: "Running Jobs", value: countPipelineJobs(jobs, (job) => job.status === "running"), hint: "Latest refresh just now", tone: "info" },
      { id: "pipeline-completed", label: "Completed Today", value: countPipelineJobs(jobs, (job) => job.status === "completed"), hint: "All delivery stages synced", tone: "success" },
      { id: "pipeline-queued", label: "Queued Jobs", value: countPipelineJobs(jobs, (job) => job.status === "queued"), hint: "Awaiting GPU workers", tone: "warning" },
      { id: "pipeline-failed", label: "Failed Runs", value: countPipelineJobs(jobs, (job) => job.status === "failed"), hint: "Retry available", tone: "danger" },
    ],
    jobs,
    activeJob,
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
