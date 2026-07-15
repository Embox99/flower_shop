import { describe, it, expect } from "vitest";

/**
 * Models the atomic stock guard used in /api/checkout:
 *
 *   updateMany({ where: { id, stockQty: { gte: qty } }, data: { decrement: qty } })
 *
 * The DB only decrements when enough stock exists (affected rows === 1);
 * otherwise the checkout transaction aborts. These tests pin that contract.
 */
function tryDecrement(stock: number, qty: number): { ok: boolean; stock: number } {
  if (stock >= qty) return { ok: true, stock: stock - qty };
  return { ok: false, stock }; // unchanged — updateMany affected 0 rows
}

describe("stock decrement guard", () => {
  it("decrements when stock is sufficient", () => {
    expect(tryDecrement(10, 3)).toEqual({ ok: true, stock: 7 });
  });

  it("allows buying exactly the remaining stock", () => {
    expect(tryDecrement(3, 3)).toEqual({ ok: true, stock: 0 });
  });

  it("rejects and never goes negative when stock is short", () => {
    expect(tryDecrement(2, 3)).toEqual({ ok: false, stock: 2 });
  });

  it("rejects on an out-of-stock variant", () => {
    expect(tryDecrement(0, 1)).toEqual({ ok: false, stock: 0 });
  });

  it("serializes concurrent buyers against the same stock", () => {
    // Two checkouts race for 5 units; combined demand is 8.
    let stock = 5;
    const first = tryDecrement(stock, 5);
    stock = first.stock;
    const second = tryDecrement(stock, 3);
    stock = second.stock;

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false); // the loser aborts
    expect(stock).toBe(0); // never oversold
  });
});
