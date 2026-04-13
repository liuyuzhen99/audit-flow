import { describe, expect, it } from "vitest";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, type ListQueryDto } from "@/types/api";
import { applyListQueryPatch, createListQuerySearchParams, readListQuery } from "@/lib/query/list-query";

describe("list query utilities", () => {
  it("reads canonical query params from search params input", () => {
    const query = readListQuery(new URLSearchParams("page=2&pageSize=20&q=m83&status=processing&sortBy=updatedAt&sortDirection=desc"));

    expect(query).toEqual({
      page: 2,
      pageSize: 20,
      q: "m83",
      status: "processing",
      sortBy: "updatedAt",
      sortDirection: "desc",
    });
  });

  it("serializes canonical params and omits defaults plus tick by default", () => {
    const searchParams = createListQuerySearchParams({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      q: "midnight",
      status: "queued",
      sortBy: "updatedAt",
      sortDirection: "desc",
      tick: 4,
    });

    expect(searchParams.toString()).toBe("q=midnight&status=queued&sortBy=updatedAt&sortDirection=desc");
  });

  it("includes tick only when explicitly requested", () => {
    const searchParams = createListQuerySearchParams(
      {
        q: "midnight",
        tick: 3,
      },
      { includeTick: true },
    );

    expect(searchParams.toString()).toBe("q=midnight&tick=3");
  });

  it("resets page when filtering and sorting fields change", () => {
    const current: ListQueryDto = {
      page: 4,
      pageSize: 10,
      q: "existing",
      status: "queued",
      sortBy: "updatedAt",
      sortDirection: "desc",
    };

    expect(applyListQueryPatch(current, { q: "fresh" }).page).toBe(1);
    expect(applyListQueryPatch(current, { status: "completed" }).page).toBe(1);
    expect(applyListQueryPatch(current, { sortBy: "title" }).page).toBe(1);
    expect(applyListQueryPatch(current, { sortDirection: "asc" }).page).toBe(1);
    expect(applyListQueryPatch(current, { pageSize: 20 }).page).toBe(1);
  });

  it("keeps explicit page updates and trims empty values", () => {
    const current: ListQueryDto = {
      page: 2,
      pageSize: 10,
      q: "existing",
    };

    expect(applyListQueryPatch(current, { page: 3 }).page).toBe(3);
    expect(applyListQueryPatch(current, { q: "   " }).q).toBeUndefined();
  });
});
