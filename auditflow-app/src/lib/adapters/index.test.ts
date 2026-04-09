import { describe, expect, it } from "vitest";

import { adaptArtistsDashboard } from "@/lib/adapters/artists";
import { adaptLibraryDashboard } from "@/lib/adapters/library";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { buildArtistsDashboardResponse } from "@/lib/mocks/sources/artists";
import { buildLibraryDashboardResponse } from "@/lib/mocks/sources/library";
import { buildPipelineDashboardResponse } from "@/lib/mocks/sources/pipeline";
import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";

describe("dashboard adapters", () => {
  it("adapts artists dashboard data", () => {
    const viewModel = adaptArtistsDashboard(buildArtistsDashboardResponse());

    expect(viewModel.rows[0]?.statusLabel).toBeTruthy();
    expect(viewModel.summary[0]?.label).toBeTruthy();
  });

  it("adapts queue dashboard data", () => {
    const viewModel = adaptQueueDashboard(buildQueueDashboardResponse({ tick: 2 }));

    expect(viewModel.rows[0]?.progressPercent).toBeGreaterThanOrEqual(0);
    expect(viewModel.polling.tick).toBe(2);
  });

  it("adapts pipeline dashboard data", () => {
    const viewModel = adaptPipelineDashboard(buildPipelineDashboardResponse({ tick: 2 }));

    expect(viewModel.activeJob?.stages.length).toBeGreaterThan(0);
    expect(viewModel.jobs[0]?.statusLabel).toBeTruthy();
  });

  it("adapts library dashboard data", () => {
    const viewModel = adaptLibraryDashboard(buildLibraryDashboardResponse());

    expect(viewModel.cards[0]?.statusLabel).toBeTruthy();
    expect(viewModel.summary[0]?.value).toBeTruthy();
  });
});
