import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchInput } from "@/components/shared/search-input";

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders a search field with placeholder label", () => {
    render(<SearchInput placeholder="Search artists..." />);

    expect(screen.getByRole("searchbox", { name: "Search artists..." })).toBeInTheDocument();
  });

  it("debounces change events inside the input instead of firing on every keystroke", () => {
    const onValueChange = vi.fn();

    render(<SearchInput debounceMs={400} placeholder="Search artists..." value="aurora" onValueChange={onValueChange} />);

    const input = screen.getByRole("searchbox", { name: "Search artists..." });

    expect(input).toHaveValue("aurora");

    fireEvent.change(input, { target: { value: "m83" } });

    expect(onValueChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);

    expect(onValueChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onValueChange).toHaveBeenCalledWith("m83");
  });

  it("waits for composition end before syncing IME input", () => {
    const onValueChange = vi.fn();

    render(<SearchInput debounceMs={400} placeholder="Search artists..." onValueChange={onValueChange} />);

    const input = screen.getByRole("searchbox", { name: "Search artists..." });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "zhong" } });

    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input, { data: "中" });

    vi.advanceTimersByTime(400);

    expect(onValueChange).toHaveBeenCalledWith("zhong");
  });
});
