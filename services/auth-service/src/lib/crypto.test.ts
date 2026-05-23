import { describe, expect, it } from "vitest";
import { createOpaqueToken, sha256 } from "./crypto.js";

describe("crypto helpers", () => {
  it("hashes deterministically without returning the raw value", () => {
    const value = "refresh-token";
    expect(sha256(value)).toBe(sha256(value));
    expect(sha256(value)).not.toBe(value);
  });

  it("creates high-entropy opaque tokens", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(40);
  });
});
