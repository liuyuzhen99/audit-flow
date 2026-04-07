import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatCard } from "@/components/shared/stat-card";

describe("StatCard", () => {
  it("renders the summary content", () => {
    render(<StatCard label="Active Tasks" value="24" hint="Realtime updates" tone="info" />);

    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Realtime updates")).toBeInTheDocument();
  });
});
