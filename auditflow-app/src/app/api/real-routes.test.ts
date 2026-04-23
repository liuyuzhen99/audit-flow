import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getArtistsRoute } from "@/app/api/artists/route";
import { GET as getQueueRoute } from "@/app/api/queue/route";

describe("real api routes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sorts artists by candidate count descending across backend pages by default", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              artist_id: "artist-a",
              name: "Alpha",
              status: "active",
              youtube_channel_id: "UC_ALPHA",
              sync_status: "completed",
              last_sync_started_at: "2026-04-22T09:00:00.000Z",
              last_sync_completed_at: "2026-04-22T10:00:00.000Z",
              last_sync_error: null,
              candidate_count: 0,
              partial_failure: false,
              empty_state: true,
              retry_metadata: {
                can_resync: true,
                latest_retry_count: 0,
                latest_failure_reason: null,
              },
              source_health: {},
              latest_candidate: null,
              latest_run: null,
            },
          ],
          pagination: { page: 1, page_size: 100, total: 2, total_pages: 2 },
          meta: { generated_at: "2026-04-23T12:00:00.000Z" },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              artist_id: "artist-z",
              name: "Zulu",
              status: "active",
              youtube_channel_id: "UC_ZULU",
              sync_status: "completed",
              last_sync_started_at: "2026-04-22T09:00:00.000Z",
              last_sync_completed_at: "2026-04-22T10:00:00.000Z",
              last_sync_error: null,
              candidate_count: 3,
              partial_failure: false,
              empty_state: false,
              retry_metadata: {
                can_resync: true,
                latest_retry_count: 0,
                latest_failure_reason: null,
              },
              source_health: {},
              latest_candidate: null,
              latest_run: null,
            },
          ],
          pagination: { page: 2, page_size: 100, total: 2, total_pages: 2 },
          meta: { generated_at: "2026-04-23T12:00:00.000Z" },
        }),
      } as Response);

    const response = await getArtistsRoute(new NextRequest("http://localhost/api/artists?page=1&pageSize=10"));
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(payload.items.map((item: { id: string }) => item.id)).toEqual(["artist-z", "artist-a"]);
  });

  it("keeps only the latest approved queue item per candidate", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            review_id: "review-1",
            artist_id: "artist-1",
            artist_name: "M83",
            candidate_id: "candidate-1",
            candidate_title: "Midnight City",
            review_type: "transcript_review",
            status: "approved",
            version: 1,
            queued_at: "2026-04-20T10:00:00.000Z",
            published_at: null,
            source_url: "https://example.com/1",
          },
          {
            review_id: "review-2",
            artist_id: "artist-1",
            artist_name: "M83",
            candidate_id: "candidate-1",
            candidate_title: "Midnight City",
            review_type: "translation_review",
            status: "approved",
            version: 1,
            queued_at: "2026-04-21T10:00:00.000Z",
            published_at: null,
            source_url: "https://example.com/1",
          },
        ],
        pagination: { page: 1, page_size: 2, total: 2, total_pages: 1 },
        meta: { generated_at: "2026-04-23T12:00:00.000Z" },
      }),
    } as Response);

    const response = await getQueueRoute(new NextRequest("http://localhost/api/queue?status=approved"));
    const payload = await response.json();

    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      reviewId: "review-2",
      reviewType: "translation_review",
      candidateId: "candidate-1",
    });
  });
});
