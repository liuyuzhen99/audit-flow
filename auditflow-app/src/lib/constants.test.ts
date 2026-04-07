import { describe, expect, it } from "vitest";

import { FOOTER_LINKS, SIDEBAR_SECTIONS } from "@/lib/constants";

describe("SIDEBAR_SECTIONS", () => {
  it("provides two sidebar groups", () => {
    expect(SIDEBAR_SECTIONS).toHaveLength(2);
  });

  it("includes playlist labels", () => {
    expect(SIDEBAR_SECTIONS[1]?.items).toContain("Trending Pop 2024");
  });
});

describe("FOOTER_LINKS", () => {
  it("includes support links", () => {
    expect(FOOTER_LINKS).toEqual(["Documentation", "Support"]);
  });
});
