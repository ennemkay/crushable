import { describe, expect, it } from "vitest";
import {
  getProfileCompletionIssues,
  type ProfileCompletionInput,
} from "./completion";

const validProfile: ProfileCompletionInput = {
  photoCount: 3,
  description:
    "I enjoy thoughtful conversations, trying new restaurants, weekend walks, live music, and small adventures around the city.",
  zipCode: "80202",
  ageDecade: "AGE_30_39",
  sex: "FEMALE",
  emailAddress: "person@example.com",
  username: "person",
  displayName: "Person",
};

describe("getProfileCompletionIssues", () => {
  it("accepts a complete profile", () => {
    expect(getProfileCompletionIssues(validProfile)).toEqual([]);
  });

  it.each([
    ["too few photos", { photoCount: 2 }, "At least 3 photos are required."],
    ["too many photos", { photoCount: 10 }, "No more than 9 photos are allowed."],
    ["short description", { description: "Too short" }, "Description must be at least 80 characters."],
    [
      "direct contact details",
      { description: `${validProfile.description} Email me at person@example.com.` },
      "Description cannot include direct contact info or social handles.",
    ],
    ["missing ZIP", { zipCode: " " }, "ZIP code is required."],
    ["invalid ZIP", { zipCode: "asdf" }, "Enter a valid U.S. ZIP code."],
    ["missing age decade", { ageDecade: undefined }, "Age decade is required."],
    ["missing sex", { sex: undefined }, "Sex is required."],
    ["missing email", { emailAddress: " " }, "Email address is required."],
    ["missing username", { username: " " }, "Username is required."],
    ["missing display name", { displayName: " " }, "Display name is required."],
  ] satisfies Array<[string, Partial<ProfileCompletionInput>, string]>)(
    "reports %s",
    (_name, changes, expectedIssue) => {
      expect(getProfileCompletionIssues({ ...validProfile, ...changes })).toContain(
        expectedIssue,
      );
    },
  );
});
