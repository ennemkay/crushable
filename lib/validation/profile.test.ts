import { describe, expect, it } from "vitest";
import {
  findProhibitedProfileDescriptionPattern,
  isProfileDescriptionAllowed,
} from "./profile";

describe("profile description contact policy", () => {
  it.each([
    "Email me at person@example.com",
    "Call me at (303) 555-0123",
    "Text +1 303-555-0123",
    "Find me @person",
    "Message me on Instagram",
    "My profile is on x.com",
    "Reach me through WhatsApp",
  ])("rejects direct contact text: %s", (description) => {
    expect(isProfileDescriptionAllowed(description)).toBe(false);
    expect(findProhibitedProfileDescriptionPattern(description)).toBeDefined();
  });

  it.each([
    "I enjoy photography, live music, and trying new restaurants.",
    "A big fan of weekend hikes and quiet mornings.",
    "I value good conversation and time with kind people.",
  ])("allows ordinary profile text: %s", (description) => {
    expect(isProfileDescriptionAllowed(description)).toBe(true);
    expect(findProhibitedProfileDescriptionPattern(description)).toBeUndefined();
  });
});
