export type QueueSeedRecord = {
  id: string;
  title: string;
  artistName: string;
  coverArtUrl: string | null;
  startedAtStep: number;
  transitionPath: "approved" | "manualReview" | "rejected";
  submittedAt: string;
};

export const queueSeedRecords: QueueSeedRecord[] = [
  {
    id: "queue-1",
    title: "Midnight City (Remix)",
    artistName: "M83",
    coverArtUrl: null,
    startedAtStep: 0,
    transitionPath: "approved",
    submittedAt: "2026-04-09T10:00:00.000Z",
  },
  {
    id: "queue-2",
    title: "Levitating",
    artistName: "Dua Lipa",
    coverArtUrl: null,
    startedAtStep: 1,
    transitionPath: "manualReview",
    submittedAt: "2026-04-09T09:58:00.000Z",
  },
  {
    id: "queue-3",
    title: "Starboy (Live)",
    artistName: "The Weeknd",
    coverArtUrl: null,
    startedAtStep: 2,
    transitionPath: "rejected",
    submittedAt: "2026-04-09T09:55:00.000Z",
  },
];
