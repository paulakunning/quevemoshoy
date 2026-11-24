import { describe, expect, it, vi } from "vitest";
import { dailyLimit, hashIp, ipFromHeaders, toQuota } from "./rate-limit";

// Only works inside Next, so the test replaces it with an empty version
vi.mock("server-only", () => ({}));

describe("toQuota", () => {
  it.each([
    // ipCount, total, ceiling → left, global
    [0, 0, 60, 5, false],
    [3, 10, 60, 2, false],
    [2, 58, 60, 2, false],
    [2, 59, 60, 1, false],
    [5, 10, 60, 0, false],
    [1, 60, 60, 0, true],
    [1, 61, 60, 0, true],
  ])(
    "with %i searches from this IP and %i in total (ceiling %i) leaves %i",
    (ipCount, total, ceiling, left, global) => {
      expect(toQuota(ipCount, total, ceiling)).toEqual({ left, global });
    },
  );
});

describe("dailyLimit", () => {
  it.each([[undefined], [""], ["abc"], ["0"], ["-5"], ["2.5"]])(
    "uses 60 for %j",
    (value) => {
      expect(dailyLimit(value)).toBe(60);
    },
  );

  it("uses a positive whole number", () => {
    expect(dailyLimit("80")).toBe(80);
  });
});

describe("ipFromHeaders", () => {
  it("takes the first IP when there are several", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    expect(ipFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("trims the spaces", () => {
    const headers = new Headers({ "x-forwarded-for": " 1.2.3.4 " });
    expect(ipFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("uses 'local' without the header", () => {
    expect(ipFromHeaders(new Headers())).toBe("local");
  });
});

describe("hashIp", () => {
  it("gives 64 hex characters that don't contain the IP", () => {
    const hash = hashIp("1.2.3.4", "a");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("1.2.3.4");
  });

  it("gives the same hash with the same salt", () => {
    expect(hashIp("1.2.3.4", "a")).toBe(hashIp("1.2.3.4", "a"));
  });

  it("gives another hash with another salt", () => {
    expect(hashIp("1.2.3.4", "a")).not.toBe(hashIp("1.2.3.4", "b"));
  });
});
