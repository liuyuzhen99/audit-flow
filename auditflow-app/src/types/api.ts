import type { StatusTone } from "@/types/common";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_POLLING_INTERVAL_MS = 4_000;

export type SortDirection = "asc" | "desc";

export type SummaryMetricDto = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: Exclude<StatusTone, "neutral">;
};

export type ResponseMetaDto = {
  generatedAt: string;
};

export type PaginationMetaDto = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SortSpecDto = {
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type ListQueryDto = {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  tick?: number;
};

export type PollingMetaDto = {
  intervalMs: number;
  tick: number;
  terminal: boolean;
};

export type ApiErrorDto = {
  code: string;
  message: string;
  details?: string;
};

export type PagedResponseDto<T> = {
  items: T[];
  pagination: PaginationMetaDto;
  meta: ResponseMetaDto;
};

export function parseListQueryParams(searchParams: URLSearchParams): ListQueryDto {
  const pageValue = Number(searchParams.get("page"));
  const pageSizeValue = Number(searchParams.get("pageSize"));
  const qValue = searchParams.get("q")?.trim();
  const statusValue = searchParams.get("status")?.trim();
  const sortByValue = searchParams.get("sortBy")?.trim();
  const sortDirectionValue = searchParams.get("sortDirection");
  const rawTickValue = searchParams.get("tick");
  const tickValue = rawTickValue === null ? undefined : Number(rawTickValue);

  return {
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : DEFAULT_PAGE,
    pageSize:
      Number.isInteger(pageSizeValue) && pageSizeValue > 0 && pageSizeValue <= MAX_PAGE_SIZE
        ? pageSizeValue
        : DEFAULT_PAGE_SIZE,
    q: qValue ? qValue : undefined,
    status: statusValue ? statusValue : undefined,
    sortBy: sortByValue ? sortByValue : undefined,
    sortDirection:
      sortDirectionValue === "asc" || sortDirectionValue === "desc"
        ? sortDirectionValue
        : undefined,
    tick:
      tickValue !== undefined && Number.isInteger(tickValue) && tickValue >= 0
        ? tickValue
        : undefined,
  };
}
