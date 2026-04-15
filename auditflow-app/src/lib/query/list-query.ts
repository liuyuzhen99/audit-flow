import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, type ListQueryDto, type SortDirection, parseListQueryParams } from "@/types/api";

type CreateListQuerySearchParamsOptions = {
  includeTick?: boolean;
  extraEntries?: Array<[key: string, value: string]>;
};

type ListQueryPatch = Partial<ListQueryDto>;

const PAGE_RESET_KEYS = ["q", "status", "sortBy", "sortDirection", "pageSize"] as const;

export function readListQuery(searchParams: URLSearchParams): ListQueryDto {
  return parseListQueryParams(searchParams);
}

export function createListQuerySearchParams(
  query: Partial<ListQueryDto>,
  options: CreateListQuerySearchParamsOptions = {},
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (query.page !== undefined && query.page !== DEFAULT_PAGE) {
    searchParams.set("page", String(query.page));
  }

  if (query.pageSize !== undefined && query.pageSize !== DEFAULT_PAGE_SIZE) {
    searchParams.set("pageSize", String(query.pageSize));
  }

  if (query.q) {
    searchParams.set("q", query.q);
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.sortBy) {
    searchParams.set("sortBy", query.sortBy);
  }

  if (query.sortDirection) {
    searchParams.set("sortDirection", query.sortDirection);
  }

  if (options.includeTick && query.tick !== undefined) {
    searchParams.set("tick", String(query.tick));
  }

  // Append module-specific extra params (e.g. dateRange for Artists)
  if (options.extraEntries) {
    for (const [key, value] of options.extraEntries) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export function applyListQueryPatch(current: ListQueryDto, patch: ListQueryPatch): ListQueryDto {
  const nextQuery: ListQueryDto = {
    page: current.page,
    pageSize: current.pageSize,
    q: normalizeOptionalString(current.q),
    status: normalizeOptionalString(current.status),
    sortBy: normalizeOptionalString(current.sortBy),
    sortDirection: current.sortDirection,
    tick: current.tick,
  };

  if (patch.page !== undefined) {
    nextQuery.page = normalizePositiveInteger(patch.page, current.page);
  }

  if (patch.pageSize !== undefined) {
    nextQuery.pageSize = normalizePositiveInteger(patch.pageSize, current.pageSize);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "q")) {
    nextQuery.q = normalizeOptionalString(patch.q);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "status")) {
    nextQuery.status = normalizeOptionalString(patch.status);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "sortBy")) {
    nextQuery.sortBy = normalizeOptionalString(patch.sortBy);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "sortDirection")) {
    nextQuery.sortDirection = normalizeSortDirection(patch.sortDirection);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "tick")) {
    nextQuery.tick = normalizeTick(patch.tick);
  }

  if (shouldResetPage(current, nextQuery, patch)) {
    nextQuery.page = DEFAULT_PAGE;
  }

  return nextQuery;
}

function shouldResetPage(current: ListQueryDto, next: ListQueryDto, patch: ListQueryPatch): boolean {
  if (patch.page !== undefined) {
    return false;
  }

  return PAGE_RESET_KEYS.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) {
      return false;
    }

    return current[key] !== next[key];
  });
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizeSortDirection(value: SortDirection | undefined): SortDirection | undefined {
  return value === "asc" || value === "desc" ? value : undefined;
}

function normalizeTick(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Number.isInteger(value) && value >= 0 ? value : undefined;
}
