import { describe, it, expect, afterEach } from "vitest";
import { clientIp, ipFromForwardedFor } from "../../src/lib/api";

const req = (headers: Record<string, string>) => new Request("http://localhost/api", { headers });

describe("ipFromForwardedFor", () => {
  it("takes the address appended by the trusted proxy, not the client's", () => {
    expect(ipFromForwardedFor("6.6.6.6, 203.0.113.7", 1)).toBe("203.0.113.7");
  });

  it("walks back one entry per trusted hop", () => {
    expect(ipFromForwardedFor("6.6.6.6, 203.0.113.7, 10.0.0.2", 2)).toBe("203.0.113.7");
  });

  it("falls back to the leftmost entry when the chain is shorter than hops", () => {
    expect(ipFromForwardedFor("203.0.113.7", 3)).toBe("203.0.113.7");
  });

  it("returns null with no trusted hops", () => {
    expect(ipFromForwardedFor("203.0.113.7", 0)).toBeNull();
  });
});

describe("clientIp", () => {
  afterEach(() => { delete process.env.TRUSTED_PROXY_HOPS; });

  it("ignores a forged leading entry by default", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("ignores proxy headers when TRUSTED_PROXY_HOPS=0", () => {
    process.env.TRUSTED_PROXY_HOPS = "0";
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "1.2.3.4" }))).toBe("unknown");
  });
});
