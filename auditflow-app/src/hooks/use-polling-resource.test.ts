import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePollingResource } from "@/hooks/use-polling-resource";

describe("usePollingResource", () => {
  it("updates data on each polling tick", async () => {
    vi.useFakeTimers();

    const load = vi
      .fn()
      .mockResolvedValueOnce({ value: "tick-1", polling: { intervalMs: 1000, tick: 1, terminal: false } })
      .mockResolvedValueOnce({ value: "tick-2", polling: { intervalMs: 1000, tick: 2, terminal: false } });

    const { result } = renderHook(() =>
      usePollingResource({
        initialData: { value: "initial", polling: { intervalMs: 1000, tick: 0, terminal: false } },
        load,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.data.value).toBe("tick-1");

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.data.value).toBe("tick-2");
    vi.useRealTimers();
  });

  it("ignores stale out-of-order responses", async () => {
    vi.useFakeTimers();

    let resolveSlow: ((value: { value: string; polling: { intervalMs: number; tick: number; terminal: boolean } }) => void) | undefined;
    let resolveFast: ((value: { value: string; polling: { intervalMs: number; tick: number; terminal: boolean } }) => void) | undefined;

    const load = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSlow = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFast = resolve;
          }),
      );

    const { result } = renderHook(() =>
      usePollingResource({
        initialData: { value: "initial", polling: { intervalMs: 1000, tick: 0, terminal: false } },
        load,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
      resolveFast?.({ value: "newer", polling: { intervalMs: 1000, tick: 2, terminal: false } });
      await Promise.resolve();
      resolveSlow?.({ value: "older", polling: { intervalMs: 1000, tick: 1, terminal: false } });
      await Promise.resolve();
    });

    expect(result.current.data.value).toBe("newer");
    vi.useRealTimers();
  });
});
