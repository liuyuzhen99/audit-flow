import { describe, expect, it } from "vitest";

import { getHealthStatusConfig } from "@/lib/status";

describe("getHealthStatusConfig", () => {
  it("maps operational status", () => {
    expect(getHealthStatusConfig("operational")).toEqual({
      label: "Operational",
      tone: "success",
    });
  });

  it("maps degraded status", () => {
    expect(getHealthStatusConfig("degraded")).toEqual({
      label: "Degraded",
      tone: "warning",
    });
  });

  it("maps offline status", () => {
    expect(getHealthStatusConfig("offline")).toEqual({
      label: "Offline",
      tone: "danger",
    });
  });
});
