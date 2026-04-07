import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchInput } from "@/components/shared/search-input";

describe("SearchInput", () => {
  it("renders a search field with placeholder label", () => {
    render(<SearchInput placeholder="Search artists..." />);

    expect(screen.getByRole("searchbox", { name: "Search artists..." })).toBeInTheDocument();
  });
});
