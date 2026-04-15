import type {
  PipelineDeliverableDto,
  PipelineJobDetailDto,
  PipelineJobDto,
  PipelineLogEntryDto,
  PipelineRunStatus,
  PipelineStageDto,
  PipelineStageStatus,
} from "@/types/pipeline";

import { isTerminalPipelineRunStatus } from "@/lib/status/pipeline";

import type { PipelineSeedRecord } from "@/lib/mocks/data/pipeline";

const pipelineStageLabels = [
  "Audio Transcode",
  "Normalization",
  "Visual Assets Fetch",
  "Video Rendering",
  "MP4 Muxing",
] as const;

function getPipelineRunStatus(seed: PipelineSeedRecord, tick: number): PipelineRunStatus {
  const step = seed.startedAtStep + tick;

  if (seed.failAtStep !== null && step >= seed.failAtStep) {
    return "failed";
  }

  if (step <= 0) {
    return "queued";
  }

  if (step >= pipelineStageLabels.length) {
    return "completed";
  }

  return "running";
}

function getStageStatus(stageIndex: number, activeStageIndex: number, runStatus: PipelineRunStatus): PipelineStageStatus {
  if (runStatus === "failed" && stageIndex === activeStageIndex) {
    return "failed";
  }

  if (stageIndex < activeStageIndex) {
    return "completed";
  }

  if (stageIndex === activeStageIndex && runStatus === "running") {
    return "running";
  }

  if (runStatus === "completed") {
    return "completed";
  }

  return "pending";
}

function getCurrentStageIndex(seed: PipelineSeedRecord, tick: number): number {
  const step = seed.startedAtStep + tick;

  if (seed.failAtStep !== null && step >= seed.failAtStep) {
    return Math.min(seed.failAtStep - 1, pipelineStageLabels.length - 1);
  }

  return Math.min(Math.max(step, 0), pipelineStageLabels.length - 1);
}

function buildStages(seed: PipelineSeedRecord, tick: number, runStatus: PipelineRunStatus): PipelineStageDto[] {
  const activeStageIndex = getCurrentStageIndex(seed, tick);

  return pipelineStageLabels.map((label, index) => {
    const status = getStageStatus(index, activeStageIndex, runStatus);
    const progressPercent =
      status === "completed" ? 100 : status === "running" ? 45 : status === "failed" ? 45 : 0;

    return {
      id: `${seed.id}-stage-${index + 1}`,
      label,
      status,
      progressPercent,
    };
  });
}

function buildLogs(seed: PipelineSeedRecord, tick: number, runStatus: PipelineRunStatus): PipelineLogEntryDto[] {
  const logMessages = [
    `Task initialized: ${seed.id}`,
    `Source audio: ${seed.sourceTitle.replaceAll(" ", "_")}.wav`,
    "Transcoding to 320kbps MP3 completed.",
    "LUFS analysis finished. Applying gain normalization.",
    "Fetching artist metadata and high-res cover art.",
    "Rendering frame 450/12000...",
  ];

  const maxLogCount = Math.min(logMessages.length, Math.max(seed.startedAtStep + tick + 1, 1));

  return logMessages.slice(0, maxLogCount).map((message, index) => {
    const timestamp = new Date(seed.startedAt);
    timestamp.setSeconds(timestamp.getSeconds() + index * 12);

    return {
      id: `${seed.id}-log-${index + 1}`,
      timestamp: timestamp.toISOString(),
      // tick matches the global poll tick so "Clear Console" can filter by cutoff
      tick,
      level:
        runStatus === "failed" && index === maxLogCount - 1
          ? "error"
          : index === 2
            ? "success"
            : "info",
      message:
        runStatus === "failed" && index === maxLogCount - 1
          ? "Render worker exited unexpectedly."
          : message,
    };
  });
}

function buildDeliverables(seed: PipelineSeedRecord, runStatus: PipelineRunStatus): PipelineDeliverableDto[] {
  const blocked = runStatus === "failed";
  const ready = isTerminalPipelineRunStatus(runStatus) && !blocked;

  return [
    {
      id: `${seed.id}-deliverable-audio`,
      label: "Master Audio",
      status: blocked ? "blocked" : ready ? "ready" : "processing",
      description: blocked ? "Awaiting rerun after failure" : "Ready for downstream access",
      assetId: ready ? seed.assetId : null,
    },
    {
      id: `${seed.id}-deliverable-video`,
      label: "Video Render (V1)",
      status: blocked ? "blocked" : ready ? "ready" : "processing",
      description: blocked ? "Render output unavailable" : "Ready for downstream access",
      assetId: ready ? seed.assetId : null,
    },
    {
      id: `${seed.id}-deliverable-metadata`,
      label: "Metadata JSON",
      status: blocked ? "blocked" : ready ? "ready" : "processing",
      description: blocked ? "Metadata blocked by failed run" : "Ready for downstream access",
      assetId: ready ? seed.assetId : null,
    },
  ];
}

export function simulatePipelineJobDetail(seed: PipelineSeedRecord, tick: number): PipelineJobDetailDto {
  const status = getPipelineRunStatus(seed, tick);
  const stages = buildStages(seed, tick, status);
  const currentStage = stages.find((stage) => stage.status === "running" || stage.status === "failed") ?? null;
  const elapsedSeconds = Math.max(seed.startedAtStep + tick, 0) * 75;
  const estimatedRemainingSeconds =
    status === "running" ? (pipelineStageLabels.length - 1 - getCurrentStageIndex(seed, tick)) * 75 : null;

  return {
    id: seed.id,
    title: seed.title,
    sourceTitle: seed.sourceTitle,
    artistName: seed.artistName,
    status,
    currentStageId: currentStage?.id ?? null,
    elapsedSeconds,
    estimatedRemainingSeconds,
    stages,
    logs: buildLogs(seed, tick, status),
    deliverables: buildDeliverables(seed, status),
  };
}

export function simulatePipelineJobs(seeds: PipelineSeedRecord[], tick: number): PipelineJobDto[] {
  return seeds.map((seed) => {
    const detail = simulatePipelineJobDetail(seed, tick);

    return {
      id: detail.id,
      title: detail.title,
      sourceTitle: detail.sourceTitle,
      artistName: detail.artistName,
      status: detail.status,
      currentStageId: detail.currentStageId,
      elapsedSeconds: detail.elapsedSeconds,
      estimatedRemainingSeconds: detail.estimatedRemainingSeconds,
    };
  });
}
