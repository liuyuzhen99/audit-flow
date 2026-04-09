import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as getArtistsRoute } from "@/app/api/mock/artists/route";
import { GET as getLibraryRoute } from "@/app/api/mock/library/route";
import { GET as getPipelineRoute } from "@/app/api/mock/pipeline/route";
import { GET as getQueueRoute } from "@/app/api/mock/queue/route";
import { GET as getReportsRoute } from "@/app/api/mock/reports/route";

describe("mock api routes", () => {
  it("returns artists dashboard data", async () => {
    const response = await getArtistsRoute(new NextRequest("http://localhost/api/mock/artists?q=M83"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("returns queue dashboard data", async () => {
    const response = await getQueueRoute(new NextRequest("http://localhost/api/mock/queue?tick=2"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.polling.tick).toBe(2);
  });

  it("returns pipeline dashboard data", async () => {
    const response = await getPipelineRoute(new NextRequest("http://localhost/api/mock/pipeline?tick=2"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.activeJob).toBeTruthy();
  });

  it("returns library dashboard data", async () => {
    const response = await getLibraryRoute(new NextRequest("http://localhost/api/mock/library"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("returns report detail data", async () => {
    const response = await getReportsRoute(new NextRequest("http://localhost/api/mock/reports?id=report-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.report.id).toBe("report-1");
  });
});
