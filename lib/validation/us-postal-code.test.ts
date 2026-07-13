import { describe, expect, it } from "vitest";
import { isValidUsZipCode } from "./us-postal-code";

describe("isValidUsZipCode", () => {
  it.each(["80202", "00501", "80202-1234", " 80202 "])(
    "accepts %j",
    (value) => {
      expect(isValidUsZipCode(value)).toBe(true);
    },
  );

  it.each(["", "asdf", "8020", "802020", "80202 1234", "A0202"])(
    "rejects %j",
    (value) => {
      expect(isValidUsZipCode(value)).toBe(false);
    },
  );
});
