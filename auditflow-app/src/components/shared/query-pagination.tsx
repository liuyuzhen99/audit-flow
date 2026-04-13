"use client";

import { DEFAULT_PAGE_SIZE } from "@/types/api";

type QueryPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const pageSizeOptions = [10, 20, 50] as const;

export function QueryPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: QueryPaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-600">Showing {startItem}-{endItem} of {total}</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span>Rows Per Page</span>
          <select
            aria-label="Rows Per Page"
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-slate-700"
            onChange={(event) => onPageSizeChange(Number(event.target.value) || DEFAULT_PAGE_SIZE)}
            value={String(pageSize)}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          Previous Page
        </button>
        <button
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Next Page
        </button>
      </div>
    </section>
  );
}
