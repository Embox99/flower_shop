import { describe, it, expect } from "vitest";
import { deliveryFee, deliveryFees } from "../../src/lib/pricing";

const cfg = { feeCents: 600, freeOverCents: 5000 };

describe("delivery fee", () => {
  it("charges the configured fee for same-day", () => {
    expect(deliveryFee("today", 3000, cfg)).toBe(600);
  });

  it("charges less for scheduled runs", () => {
    expect(deliveryFee("tomorrow", 3000, cfg)).toBe(400);
    expect(deliveryFee("date", 3000, cfg)).toBe(400);
  });

  it("never makes scheduled dearer than same-day", () => {
    expect(deliveryFee("tomorrow", 3000, { feeCents: 300, freeOverCents: null })).toBe(300);
  });

  it("is free for letterbox and pickup", () => {
    expect(deliveryFee("letterbox", 3000, cfg)).toBe(0);
    expect(deliveryFee("pickup", 3000, cfg)).toBe(0);
  });

  it("is free above the threshold and for an empty cart", () => {
    expect(deliveryFees(5000, cfg)).toEqual({ today: 0, tomorrow: 0, date: 0, letterbox: 0, pickup: 0 });
    expect(deliveryFee("today", 0, cfg)).toBe(0);
  });
});
