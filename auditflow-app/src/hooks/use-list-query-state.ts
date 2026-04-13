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

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

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
    const nextSearchParams = createListQuerySearchParams(canonicalQuery);
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
    navigate({ page: 1, pageSize: queryRef.current.pageSize ?? DEFAULT_PAGE_SIZE });
  };

  return {
    query,
    searchValue,
    setPage,
    setPageSize,
    setSearchValue,
    setSort,
    setStatus,
    resetFilters,
  };
}
