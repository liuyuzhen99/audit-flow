import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    mockReplace.mockReset();
    mockSearchParams.current = new URLSearchParams(
      "page=3&pageSize=20&q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("reads query state from the current URL", () => {
    const { result } = renderHook(() => useListQueryState());

    expect(result.current.query.page).toBe(3);
    expect(result.current.query.pageSize).toBe(20);
    expect(result.current.query.q).toBe("midnight");
    expect(result.current.query.status).toBe("queued");
    expect(result.current.searchValue).toBe("midnight");
  });

  it("updates search immediately when the debounced input commits a value", () => {
    const { result } = renderHook(() => useListQueryState());

    act(() => {
      result.current.setSearchValue("aurora");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=aurora&status=queued&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("updates status and resets page immediately", () => {
    const { result } = renderHook(() => useListQueryState());

    act(() => {
      result.current.setStatus("completed");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=midnight&status=completed&sortBy=updatedAt&sortDirection=desc",
    );
  });

  it("clears optional filters back to the canonical URL", () => {
    const { result } = renderHook(() => useListQueryState());

    act(() => {
      result.current.resetFilters();
    });

    expect(mockReplace).toHaveBeenCalledWith("/artists?pageSize=20");
  });

  it("updates a module-specific filter and resets page", () => {
    mockSearchParams.current = new URLSearchParams(
      "page=3&pageSize=20&q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc",
    );

    const { result } = renderHook(() => useListQueryState());

    act(() => {
      result.current.setFilter("dateRange", "2w");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/artists?pageSize=20&q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc&dateRange=2w",
    );
  });
});
