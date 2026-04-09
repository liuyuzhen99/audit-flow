import type { ArtistDto } from "@/types/artist";

export const artistSeedRecords: ArtistDto[] = [
  {
    id: "artist-1",
    name: "The Weeknd",
    avatarUrl: null,
    spotifyFollowers: 42100000,
    recentReleaseCount: 3,
    lastSyncedAt: "2026-04-09T08:10:00.000Z",
    channel: {
      id: "youtube-1",
      name: "The Weeknd Official",
      platform: "youtube",
    },
    auditSnapshot: {
      status: "autoApproved",
      lastDecisionAt: "2026-04-09T08:12:00.000Z",
      flaggedReleaseCount: 0,
    },
  },
  {
    id: "artist-2",
    name: "Dua Lipa",
    avatarUrl: null,
    spotifyFollowers: 31800000,
    recentReleaseCount: 1,
    lastSyncedAt: "2026-04-09T07:55:00.000Z",
    channel: {
      id: "youtube-2",
      name: "Dua Lipa YT",
      platform: "youtube",
    },
    auditSnapshot: {
      status: "manualReview",
      lastDecisionAt: "2026-04-09T07:58:00.000Z",
      flaggedReleaseCount: 1,
    },
  },
  {
    id: "artist-3",
    name: "Travis Scott",
    avatarUrl: null,
    spotifyFollowers: 28700000,
    recentReleaseCount: 5,
    lastSyncedAt: "2026-04-09T07:40:00.000Z",
    channel: {
      id: "youtube-3",
      name: "Cactus Jack",
      platform: "youtube",
    },
    auditSnapshot: {
      status: "autoRejected",
      lastDecisionAt: "2026-04-09T07:45:00.000Z",
      flaggedReleaseCount: 2,
    },
  },
  {
    id: "artist-4",
    name: "M83",
    avatarUrl: null,
    spotifyFollowers: 4900000,
    recentReleaseCount: 2,
    lastSyncedAt: "2026-04-09T08:20:00.000Z",
    channel: {
      id: "youtube-4",
      name: "M83 Official",
      platform: "youtube",
    },
    auditSnapshot: {
      status: "monitoring",
      lastDecisionAt: "2026-04-09T08:21:00.000Z",
      flaggedReleaseCount: 0,
    },
  },
];
