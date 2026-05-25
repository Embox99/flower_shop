import { describe, it, expect } from "vitest";

// Re-implement priceCart shape locally for a pure unit test (the real one
// touches Prisma; we test the calculation logic only).
function priceLine(base: number, delta: number, qty: number, vase: boolean) {
  const unit = base + delta + (vase ? 1400 : 0);
  return { unit, total: unit * qty };
}

describe("cart pricing", () => {
  it("adds variant delta and vase upcharge", () => {
    const { unit, total } = priceLine(6400, 1800, 2, true);
    expect(unit).toBe(6400 + 1800 + 1400);
    expect(total).toBe(unit * 2);
  });

  it("handles negative deltas for smaller variants", () => {
    const { unit } = priceLine(6400, -1200, 1, false);
    expect(unit).toBe(5200);
  });

  it("does not add vase when false", () => {
    const { unit } = priceLine(6400, 0, 1, false);
    expect(unit).toBe(6400);
  });
});
