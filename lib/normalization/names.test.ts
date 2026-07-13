import { describe, expect, it } from "vitest";
import {
  createFirstNameVariantKey,
  normalizeFirstNameVariants,
  normalizeName,
} from "./names";

describe("name normalization", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalizeName("  Mary   Jane  ")).toBe("mary jane");
  });

  it("deduplicates, removes blanks, and sorts first-name variants", () => {
    expect(normalizeFirstNameVariants([" Liz ", "Elizabeth", "liz", " "])).toEqual([
      "elizabeth",
      "liz",
    ]);
  });

  it("creates a stable variant key", () => {
    expect(createFirstNameVariantKey(["Liz", "Elizabeth", "liz"])).toBe(
      "elizabeth|liz",
    );
  });
});
