import { describe, expect, it } from "vitest";
import { normalizeCity, normalizeZip } from "./location";

describe("location normalization", () => {
  it("normalizes city spacing and case", () => {
    expect(normalizeCity("  New   York ")).toBe("new york");
  });

  it("trims a valid ZIP+4 value", () => {
    expect(normalizeZip(" 80202-1234 ")).toBe("80202-1234");
  });
});
