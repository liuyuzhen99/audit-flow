import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QueryPagination } from "@/components/shared/query-pagination";

describe("QueryPagination", () => {
  it("renders current range and disables boundary buttons", () => {
    render(
      <QueryPagination
        page={1}
        pageSize={10}
        total={4}
        totalPages={1}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Showing 1-4 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous Page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
  });

  it("emits page and page-size changes", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <QueryPagination
        page={2}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous Page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
    fireEvent.change(screen.getByLabelText("Rows Per Page"), { target: { value: "20" } });

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
