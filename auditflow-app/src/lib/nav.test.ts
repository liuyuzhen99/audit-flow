import { describe, expect, it } from "vitest";

import { isActivePath, PRIMARY_NAV_ITEMS } from "@/lib/nav";

describe("PRIMARY_NAV_ITEMS", () => {
  it("defines the primary routes", () => {
    expect(PRIMARY_NAV_ITEMS.map((item) => item.href)).toEqual([
      "/artists",
      "/queue",
      "/pipeline",
      "/library",
    ]);
  });
});

describe("isActivePath", () => {
  it("matches exact paths", () => {
    expect(isActivePath("/artists", "/artists")).toBe(true);
  });

  it("matches nested paths", () => {
    expect(isActivePath("/library/123", "/library")).toBe(true);
  });

  it("returns false for unrelated paths", () => {
    expect(isActivePath("/queue", "/library")).toBe(false);
  });
});
