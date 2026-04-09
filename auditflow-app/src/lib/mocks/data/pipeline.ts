export type PipelineSeedRecord = {
  id: string;
  title: string;
  sourceTitle: string;
  artistName: string;
  startedAtStep: number;
  failAtStep: number | null;
  startedAt: string;
};

export const pipelineSeedRecords: PipelineSeedRecord[] = [
  {
    id: "job-101",
    title: "Midnight City (M83) - Video Generation",
    sourceTitle: "Midnight City",
    artistName: "M83",
    startedAtStep: 0,
    failAtStep: null,
    startedAt: "2026-04-09T10:00:00.000Z",
  },
  {
    id: "job-102",
    title: "Blinding Lights - Official Audit",
    sourceTitle: "Blinding Lights",
    artistName: "The Weeknd",
    startedAtStep: 2,
    failAtStep: null,
    startedAt: "2026-04-09T09:54:00.000Z",
  },
  {
    id: "job-103",
    title: "Levitating (Visualizer v2)",
    sourceTitle: "Levitating",
    artistName: "Dua Lipa",
    startedAtStep: 1,
    failAtStep: 3,
    startedAt: "2026-04-09T09:57:00.000Z",
  },
];
