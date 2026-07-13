import { describe, expect, it } from "vitest";
import { firstNameVariantsOverlap, normalizeCrushIdentity } from "./duplicates";

describe("crush identity normalization", () => {
  it("normalizes identity fields and preserves enumerated values", () => {
    expect(
      normalizeCrushIdentity({
        firstNameVariants: [" Liz ", "Elizabeth", "liz"],
        fullLastName: "  Van   Buren ",
        city: " New   York ",
        ageDecade: "AGE_30_39",
        sex: "FEMALE",
      }),
    ).toEqual({
      firstNameVariants: ["elizabeth", "liz"],
      normalizedFirstNameVariantKey: "elizabeth|liz",
      normalizedFullLastName: "van buren",
      normalizedCity: "new york",
      ageDecade: "AGE_30_39",
      sex: "FEMALE",
    });
  });

  it("rejects more than five distinct first-name variants", () => {
    expect(() =>
      normalizeCrushIdentity({
        firstNameVariants: ["a", "b", "c", "d", "e", "f"],
        fullLastName: "Smith",
        city: "Denver",
        ageDecade: "AGE_30_39",
        sex: "FEMALE",
      }),
    ).toThrow("At most 5 first-name variants are allowed.");
  });
});

describe("firstNameVariantsOverlap", () => {
  it("finds normalized overlap", () => {
    expect(firstNameVariantsOverlap([" Liz ", "Beth"], ["LIZ", "Elizabeth"])).toBe(
      true,
    );
  });

  it("returns false when variants do not overlap", () => {
    expect(firstNameVariantsOverlap(["Liz"], ["Beth", "Elizabeth"])).toBe(false);
  });
});
