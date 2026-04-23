"use client";

import { startTransition, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_PAGE_SIZE, type ListQueryDto, type SortDirection } from "@/types/api";
import { applyListQueryPatch, createListQuerySearchParams, readListQuery } from "@/lib/query/list-query";

type SortChange = {
  sortBy?: string;
  sortDirection?: SortDirection;
};

export function useListQueryState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo(() => readListQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const queryRef = useRef(query);

  // Track extra module-specific filter params (e.g. dateRange for Artists)
  const extraFiltersRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    const nextExtraFilters = new Map<string, string>();
    const currentSearchParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of currentSearchParams.entries()) {
      if (
        key !== "page" &&
        key !== "pageSize" &&
        key !== "q" &&
        key !== "status" &&
        key !== "sortBy" &&
        key !== "sortDirection" &&
        key !== "tick"
      ) {
        nextExtraFilters.set(key, value);
      }
    }

    extraFiltersRef.current = nextExtraFilters;
  }, [searchParams]);

  const navigate = (nextQuery: ListQueryDto) => {
    const canonicalQuery: ListQueryDto = {
      ...nextQuery,
      pageSize: nextQuery.pageSize ?? DEFAULT_PAGE_SIZE,
    };
    const extraEntries = Array.from(extraFiltersRef.current.entries()) as Array<[string, string]>;
    const nextSearchParams = createListQuerySearchParams(canonicalQuery, { extraEntries });
    const queryString = nextSearchParams.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const setSearchValue = (value: string) => {
    navigate(applyListQueryPatch(queryRef.current, { q: value }));
  };

  const setStatus = (status: string | undefined) => {
    navigate(applyListQueryPatch(queryRef.current, { status }));
  };

  const setPage = (page: number) => {
    navigate(applyListQueryPatch(queryRef.current, { page }));
  };

  const setPageSize = (pageSize: number) => {
    navigate(applyListQueryPatch(queryRef.current, { pageSize }));
  };

  const setSort = ({ sortBy, sortDirection }: SortChange) => {
    navigate(applyListQueryPatch(queryRef.current, { sortBy, sortDirection }));
  };

  const resetFilters = () => {
    extraFiltersRef.current.clear();
    navigate({ page: 1, pageSize: queryRef.current.pageSize ?? DEFAULT_PAGE_SIZE });
  };

  /**
   * Generic escape hatch for module-specific filter params not in ListQueryDto.
   * Resets page on change. Pass undefined to clear the filter.
   */
  const setFilter = (key: string, value: string | undefined) => {
    if (value === undefined) {
      extraFiltersRef.current.delete(key);
    } else {
      extraFiltersRef.current.set(key, value);
    }
    navigate(applyListQueryPatch(queryRef.current, { page: 1 }));
  };

  return {
    query,
    searchValue: query.q ?? "",
    setPage,
    setPageSize,
    setSearchValue,
    setSort,
    setStatus,
    setFilter,
    resetFilters,
  };
}
