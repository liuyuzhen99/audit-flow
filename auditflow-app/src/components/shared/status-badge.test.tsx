import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders the provided label", () => {
    render(<StatusBadge label="Operational" tone="success" />);

    expect(screen.getByText("Operational")).toBeInTheDocument();
  });
});
