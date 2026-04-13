import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useListQueryState } from "@/hooks/use-list-query-state";

const mockReplace = vi.fn();
const mockSearchParams = {
  current: new URLSearchParams("page=3&pageSize=20&q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc"),
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/artists",
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams.current,
}));

describe("useListQueryState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReplace.mockReset();
    mockSearchParams.current = new URLSearchParams(
      "page=3&pageSize=20&q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc",
    );
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("reads query state from the current URL", () => {
    const { result } = renderHook(() => useListQueryState({ debounceMs: 300 }));

    expect(result.current.query.page).toBe(3);
    expect(result.current.query.pageSize).toBe(20);
    expect(result.current.query.q).toBe("midnight");
    expect(result.current.query.status).toBe("queued");
    expect(result.current.searchValue).toBe("midnight");
  });

  it("debounces search updates and resets page", () => {
    const { result } = renderHook(() => useListQueryState({ debounceMs: 300 }));

    act(() => {
      result.current.setSearchValue("aurora");
      vi.advanceTimersByTime(299);
    });

    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=aurora&status=queued&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("updates status and resets page immediately", () => {
    const { result } = renderHook(() => useListQueryState({ debounceMs: 300 }));

    act(() => {
      result.current.setStatus("completed");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=midnight&status=completed&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("cancels pending search writes when an immediate filter update happens", () => {
    const { result } = renderHook(() => useListQueryState({ debounceMs: 300 }));

    act(() => {
      result.current.setSearchValue("aurora");
      result.current.setStatus("completed");
      vi.advanceTimersByTime(300);
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=midnight&status=completed&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("clears optional filters back to the canonical URL", () => {
    const { result } = renderHook(() => useListQueryState({ debounceMs: 300 }));

    act(() => {
      result.current.resetFilters();
    });

    expect(mockReplace).toHaveBeenCalledWith("/artists?pageSize=20");
  });
});
