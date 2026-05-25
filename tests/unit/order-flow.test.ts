import { describe, it, expect } from "vitest";

describe("order status flow", () => {
  const flow = ["NEW", "TYING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

  function next(status: string): string | null {
    const i = flow.indexOf(status);
    return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
  }

  it("advances through every step", () => {
    expect(next("NEW")).toBe("TYING");
    expect(next("TYING")).toBe("READY");
    expect(next("READY")).toBe("OUT_FOR_DELIVERY");
    expect(next("OUT_FOR_DELIVERY")).toBe("DELIVERED");
  });

  it("stops at DELIVERED", () => {
    expect(next("DELIVERED")).toBeNull();
  });

  it("returns null for unknown states", () => {
    expect(next("CANCELED")).toBeNull();
    expect(next("WHATEVER")).toBeNull();
  });
});
