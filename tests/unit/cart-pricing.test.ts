import { describe, it, expect } from "vitest";
import { lineProblem, unitPrice, VASE_CENTS } from "../../src/lib/pricing";

const product = { id: "p1", status: "ACTIVE", basePrice: 6400 };
const variant = (priceDelta: number, productId = "p1", stockQty = 5) =>
  ({ id: "v-" + productId, productId, priceDelta, stockQty });

describe("cart pricing", () => {
  it("adds variant delta and vase upcharge", () => {
    expect(unitPrice(product, variant(1800), true)).toBe(6400 + 1800 + VASE_CENTS);
  });

  it("handles negative deltas for smaller variants", () => {
    expect(unitPrice(product, variant(-1200), false)).toBe(5200);
  });

  it("does not add vase when false", () => {
    expect(unitPrice(product, variant(0), false)).toBe(6400);
  });

  it("ignores the delta of another product's variant", () => {
    expect(unitPrice(product, variant(-4000, "p2"), false)).toBe(6400);
  });
});

describe("line validation", () => {
  it("accepts a variant of the same product", () => {
    expect(lineProblem(product, variant(0))).toBeNull();
  });

  it("rejects a variant borrowed from another product", () => {
    expect(lineProblem(product, variant(-4000, "p2"))).toBe("unavailable");
  });

  it("rejects a missing product", () => {
    expect(lineProblem(null, variant(0))).toBe("unavailable");
  });

  it("rejects products that are no longer live", () => {
    expect(lineProblem({ ...product, status: "ARCHIVED" }, variant(0))).toBe("unavailable");
    expect(lineProblem({ ...product, status: "DRAFT" }, variant(0))).toBe("unavailable");
  });

  it("rejects a line without a variant, since only variants carry stock", () => {
    expect(lineProblem(product, null)).toBe("out of stock");
  });

  it("checks the requested quantity against stock", () => {
    expect(lineProblem(product, variant(0, "p1", 3), 3)).toBeNull();
    expect(lineProblem(product, variant(0, "p1", 3), 4)).toBe("out of stock");
  });
});
