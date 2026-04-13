import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type HeaderContext,
  type Row,
  type RowData,
} from "@tanstack/react-table";

import type { SortDirection } from "@/types/api";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    sortKey?: string;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

type SortChange = {
  sortBy?: string;
  sortDirection?: SortDirection;
};

type DataTableProps<TData extends object, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  emptyState?: ReactNode;
  isLoading?: boolean;
  loadingState?: ReactNode;
  error?: string;
  errorState?: ReactNode;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (nextSort: SortChange) => void;
  className?: string;
};

export function DataTable<TData extends object, TValue>({
  className,
  columns,
  data,
  emptyState,
  error,
  errorState,
  getRowId,
  isLoading = false,
  loadingState,
  onSortChange,
  sortBy,
  sortDirection,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  if (isLoading) {
    return <div className={className}>{loadingState ?? null}</div>;
  }

  if (error) {
    return <div className={className}>{errorState ?? null}</div>;
  }

  if (table.getRowModel().rows.length === 0) {
    return <div className={className}>{emptyState ?? null}</div>;
  }

  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-sm", className)}>
      <table className="min-w-full border-collapse text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortKey = header.column.columnDef.meta?.sortKey;
                const isSortedColumn = sortKey !== undefined && sortKey === sortBy;
                const nextSortDirection = isSortedColumn && sortDirection === "asc" ? "desc" : "asc";

                return (
                  <th className="px-5 py-4 font-semibold" key={header.id} scope="col">
                    {header.isPlaceholder ? null : sortKey && onSortChange ? (
                      <button
                        aria-label={getSortButtonLabel(header.getContext())}
                        className="inline-flex items-center gap-2 text-left text-inherit transition hover:text-slate-900"
                        onClick={() => onSortChange({ sortBy: sortKey, sortDirection: nextSortDirection })}
                        type="button"
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <span
                          aria-hidden="true"
                          className="text-[10px] font-semibold normal-case tracking-normal text-slate-400"
                        >
                          {isSortedColumn ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="border-t border-slate-100 align-top" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="px-5 py-4" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getSortButtonLabel<TData, TValue>(context: HeaderContext<TData, TValue>) {
  const headerContent = flexRender(context.column.columnDef.header, context);
  return typeof headerContent === "string" ? `Sort by ${headerContent}` : "Sort column";
}
