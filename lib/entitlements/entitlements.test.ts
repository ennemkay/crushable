import { describe, expect, it } from "vitest";
import {
  canSearchCrushes,
  canViewCrushDetails,
  getActiveProfileLinkLimit,
} from "./entitlements";

describe("plan entitlements", () => {
  it("applies free-plan restrictions", () => {
    expect(canSearchCrushes("free")).toEqual({
      allowed: false,
      reason: "Crush search requires a paid plan.",
    });
    expect(canViewCrushDetails("free")).toEqual({
      allowed: false,
      reason: "Crush details require a paid plan.",
    });
    expect(getActiveProfileLinkLimit("free")).toBe(5);
  });

  it("applies paid-plan access and limits", () => {
    expect(canSearchCrushes("paid")).toEqual({ allowed: true });
    expect(canViewCrushDetails("paid")).toEqual({ allowed: true });
    expect(getActiveProfileLinkLimit("paid")).toBe(20);
  });
});
