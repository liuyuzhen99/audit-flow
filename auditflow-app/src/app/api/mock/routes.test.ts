import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as getArtistsRoute } from "@/app/api/mock/artists/route";
import { GET as getLibraryRoute } from "@/app/api/mock/library/route";
import { GET as getPipelineRoute } from "@/app/api/mock/pipeline/route";
import { POST as postPipelineStopRoute } from "@/app/api/mock/pipeline/stop/route";
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

  it("returns report detail data with phase 5 detail sections", async () => {
    const response = await getReportsRoute(new NextRequest("http://localhost/api/mock/reports?id=report-101"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.report.id).toBe("report-101");
    expect(data.report.comments).toBeDefined();
    expect(data.report.summary).toBeDefined();
    expect(data.report.linkedAsset).toBeDefined();
  });

  it("returns not found for a missing report", async () => {
    const response = await getReportsRoute(new NextRequest("http://localhost/api/mock/reports?id=report-missing"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe("report_not_found");
  });

  it("requires a report id for report detail", async () => {
    const response = await getReportsRoute(new NextRequest("http://localhost/api/mock/reports"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("report_id_required");
  });

  it("returns pipeline stop action response", async () => {
    const response = await postPipelineStopRoute(
      new NextRequest("http://localhost/api/mock/pipeline/stop", {
        method: "POST",
        body: JSON.stringify({ jobId: "job-1" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe("job-1");
    expect(data.message).toContain("job-1");
  });

  it("validates pipeline stop action request body", async () => {
    const response = await postPipelineStopRoute(
      new NextRequest("http://localhost/api/mock/pipeline/stop", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("missing_job_id");
  });
});
