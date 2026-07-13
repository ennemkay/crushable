import { describe, expect, it } from "vitest";
import { normalizeCity, normalizeZip } from "./location";

describe("location normalization", () => {
  it("normalizes city spacing and case", () => {
    expect(normalizeCity("  New   York ")).toBe("new york");
  });

  it("removes ZIP whitespace and uppercases characters", () => {
    expect(normalizeZip(" 80 202-abcd ")).toBe("80202-ABCD");
  });
});
