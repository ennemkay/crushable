import { describe, expect, it } from "vitest";
import { normalizeCity } from "./location";

describe("location normalization", () => {
  it("normalizes city spacing and case", () => {
    expect(normalizeCity("  New   York ")).toBe("new york");
  });
});
