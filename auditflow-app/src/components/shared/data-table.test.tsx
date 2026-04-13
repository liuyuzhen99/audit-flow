import { fireEvent, render, screen } from "@testing-library/react";
import { createColumnHelper } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "@/components/shared/data-table";

type TestRow = {
  id: string;
  name: string;
  status: string;
};

const columnHelper = createColumnHelper<TestRow>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: {
      sortKey: "name",
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue(),
  }),
];

describe("DataTable", () => {
  it("renders rows and headers", () => {
    render(
      <DataTable
        columns={columns}
        data={[
          { id: "artist-1", name: "M83", status: "Queued" },
          { id: "artist-2", name: "Aurora", status: "Completed" },
        ]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("M83")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders empty state when there are no rows", () => {
    render(<DataTable columns={columns} data={[]} emptyState={<div>No rows found</div>} />);

    expect(screen.getByText("No rows found")).toBeInTheDocument();
  });

  it("renders loading state before rows", () => {
    render(<DataTable columns={columns} data={[]} isLoading loadingState={<div>Loading rows</div>} />);

    expect(screen.getByText("Loading rows")).toBeInTheDocument();
  });

  it("renders error state before rows", () => {
    render(<DataTable columns={columns} data={[]} error="Request failed" errorState={<div>Load failed</div>} />);

    expect(screen.getByText("Load failed")).toBeInTheDocument();
  });

  it("emits controlled sort changes from sortable headers", () => {
    const onSortChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={[{ id: "artist-1", name: "M83", status: "Queued" }]}
        onSortChange={onSortChange}
        sortBy="name"
        sortDirection="asc"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort by Name" }));

    expect(onSortChange).toHaveBeenCalledWith({ sortBy: "name", sortDirection: "desc" });
  });
});
