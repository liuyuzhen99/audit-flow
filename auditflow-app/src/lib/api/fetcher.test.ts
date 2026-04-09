import { describe, expect, it, vi } from "vitest";

import { fetchValidatedJson } from "@/lib/api/fetcher";

describe("fetchValidatedJson", () => {
  it("returns validated json on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: "ok" }),
    });

    const result = await fetchValidatedJson({
      fetcher: fetchMock,
      input: "/api/test",
      schema: {
        parse: (value: unknown) => value as { value: string },
      },
    });

    expect(result.value).toBe("ok");
  });

  it("throws on non-ok responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server error" }),
    });

    await expect(
      fetchValidatedJson({
        fetcher: fetchMock,
        input: "/api/test",
        schema: {
          parse: (value: unknown) => value,
        },
      }),
    ).rejects.toThrow("Server error");
  });

  it("throws on schema parsing failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: "ok" }),
    });

    await expect(
      fetchValidatedJson({
        fetcher: fetchMock,
        input: "/api/test",
        schema: {
          parse: () => {
            throw new Error("Invalid payload");
          },
        },
      }),
    ).rejects.toThrow("Invalid payload");
  });
});
