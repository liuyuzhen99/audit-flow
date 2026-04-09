import type { LibraryAssetDto } from "@/types/library";

export const librarySeedRecords: LibraryAssetDto[] = [
  {
    id: "asset-1",
    title: "Midnight City (Audited Mix)",
    artistName: "M83",
    thumbnailUrl: null,
    status: "published",
    resolution: "1080p",
    durationSeconds: 243,
    createdAt: "2026-04-09T08:00:00.000Z",
    metadata: {
      sourceStatus: "completed",
    },
    versions: [],
  },
  {
    id: "asset-2",
    title: "Blinding Lights - Official Audit",
    artistName: "The Weeknd",
    thumbnailUrl: null,
    status: "published",
    resolution: "1080p",
    durationSeconds: 202,
    createdAt: "2026-04-08T16:30:00.000Z",
    metadata: {
      sourceStatus: "completed",
    },
    versions: [],
  },
  {
    id: "asset-3",
    title: "Levitating (Visualizer v2)",
    artistName: "Dua Lipa",
    thumbnailUrl: null,
    status: "processing",
    resolution: "1080p",
    durationSeconds: 230,
    createdAt: "2026-04-09T09:40:00.000Z",
    metadata: {
      sourceStatus: "running",
    },
    versions: [],
  },
  {
    id: "asset-4",
    title: "Bad Guy (Bass Boosted)",
    artistName: "Billie Eilish",
    thumbnailUrl: null,
    status: "failed",
    resolution: "1080p",
    durationSeconds: 194,
    createdAt: "2026-04-09T09:10:00.000Z",
    metadata: {
      sourceStatus: "failed",
    },
    versions: [],
  },
];
