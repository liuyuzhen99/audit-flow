import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageToolbar } from "@/components/shared/page-toolbar";

describe("PageToolbar", () => {
  it("renders left and right content", () => {
    render(<PageToolbar left={<span>Filters</span>} right={<button type="button">Apply</button>} />);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });
});
