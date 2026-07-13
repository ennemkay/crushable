import { describe, expect, it } from "vitest";
import { canUseContactRoute, type ContactAccessInput } from "./access";

const allowedInput: ContactAccessInput = {
  signedIn: true,
  hasActiveProfile: true,
  entitlementAllowed: true,
  blocked: false,
  hasRequiredContext: true,
};

describe("canUseContactRoute", () => {
  it("allows contact when every gate passes", () => {
    expect(canUseContactRoute(allowedInput)).toEqual({ allowed: true });
  });

  it.each([
    ["signedIn", false, "Sign in required."],
    ["hasActiveProfile", false, "Active profile required."],
    ["entitlementAllowed", false, "Contact limit reached."],
    ["blocked", true, "Contact is blocked."],
    ["hasRequiredContext", false, "Contact context required."],
  ] satisfies Array<[keyof ContactAccessInput, boolean, string]>)(
    "denies contact when %s is %s",
    (field, value, reason) => {
      expect(canUseContactRoute({ ...allowedInput, [field]: value })).toEqual({
        allowed: false,
        reason,
      });
    },
  );

  it("reports the first failed gate", () => {
    expect(
      canUseContactRoute({
        ...allowedInput,
        signedIn: false,
        blocked: true,
      }),
    ).toEqual({ allowed: false, reason: "Sign in required." });
  });
});
