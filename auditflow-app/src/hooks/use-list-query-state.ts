"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_PAGE_SIZE, type ListQueryDto, type SortDirection } from "@/types/api";
import { applyListQueryPatch, createListQuerySearchParams, readListQuery } from "@/lib/query/list-query";

type UseListQueryStateOptions = {
  debounceMs?: number;
};

type SortChange = {
  sortBy?: string;
  sortDirection?: SortDirection;
};

export function useListQueryState({ debounceMs = 300 }: UseListQueryStateOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo(() => readListQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [pendingSearchValue, setPendingSearchValue] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const queryRef = useRef(query);
  const searchValue = pendingSearchValue ?? (query.q ?? "");

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cancelPendingSearch = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPendingSearchValue(null);
  };

  const navigate = (nextQuery: ListQueryDto) => {
    const canonicalQuery: ListQueryDto = {
      ...nextQuery,
      pageSize: nextQuery.pageSize ?? DEFAULT_PAGE_SIZE,
    };
    const extraEntries = Array.from(extraFiltersRef.current.entries()) as Array<[string, string]>;
    const nextSearchParams = createListQuerySearchParams(canonicalQuery, { extraEntries });
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const setSearchValue = (value: string) => {
    setPendingSearchValue(value);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      navigate(applyListQueryPatch(queryRef.current, { q: value }));
      setPendingSearchValue(null);
      timeoutRef.current = null;
    }, debounceMs);
  };

  const setStatus = (status: string | undefined) => {
    cancelPendingSearch();
    navigate(applyListQueryPatch(queryRef.current, { status }));
  };

  const setPage = (page: number) => {
    cancelPendingSearch();
    navigate(applyListQueryPatch(queryRef.current, { page }));
  };

  const setPageSize = (pageSize: number) => {
    cancelPendingSearch();
    navigate(applyListQueryPatch(queryRef.current, { pageSize }));
  };

  const setSort = ({ sortBy, sortDirection }: SortChange) => {
    cancelPendingSearch();
    navigate(applyListQueryPatch(queryRef.current, { sortBy, sortDirection }));
  };

  const resetFilters = () => {
    cancelPendingSearch();
    extraFiltersRef.current.clear();
    navigate({ page: 1, pageSize: queryRef.current.pageSize ?? DEFAULT_PAGE_SIZE });
  };

  /**
   * Generic escape hatch for module-specific filter params not in ListQueryDto.
   * Resets page on change. Pass undefined to clear the filter.
   */
  const setFilter = (key: string, value: string | undefined) => {
    cancelPendingSearch();
    if (value === undefined) {
      extraFiltersRef.current.delete(key);
    } else {
      extraFiltersRef.current.set(key, value);
    }
    navigate(applyListQueryPatch(queryRef.current, { page: 1 }));
  };

  return {
    query,
    searchValue,
    setPage,
    setPageSize,
    setSearchValue,
    setSort,
    setStatus,
    setFilter,
    resetFilters,
  };
}
