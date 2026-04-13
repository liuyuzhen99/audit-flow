import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "@/components/shared/search-input";

describe("SearchInput", () => {
  it("renders a search field with placeholder label", () => {
    render(<SearchInput placeholder="Search artists..." />);

    expect(screen.getByRole("searchbox", { name: "Search artists..." })).toBeInTheDocument();
  });

  it("supports controlled values and change events", () => {
    const onChange = vi.fn();

    render(<SearchInput placeholder="Search artists..." value="aurora" onChange={onChange} />);

    const input = screen.getByRole("searchbox", { name: "Search artists..." });

    expect(input).toHaveValue("aurora");

    fireEvent.change(input, { target: { value: "m83" } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
