import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StatusFooter } from "@/components/layout/status-footer";

describe("StatusFooter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows degraded readiness check names from the backend", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "degraded",
        checks: {
          db: { status: "ok" },
          rabbitmq: { status: "skipped" },
          oss: { status: "failed" },
          qdrant: { status: "failed" },
        },
      }),
    } as Response);

    render(await StatusFooter());

    expect(screen.getByText(/Backend:/i).parentElement).toHaveTextContent(
      "rabbitmq skipped, oss failed, qdrant failed",
    );
  });
});
