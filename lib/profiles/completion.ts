import { isProfileDescriptionAllowed } from "@/lib/validation/profile";

export type ProfileCompletionInput = {
  photoCount: number;
  description: string;
  zipCode: string;
  ageDecade?: string;
  sex?: string;
  emailAddress: string;
  username: string;
  displayName: string;
};

export function getProfileCompletionIssues(profile: ProfileCompletionInput) {
  const issues: string[] = [];

  if (profile.photoCount < 3) issues.push("At least 3 photos are required.");
  if (profile.photoCount > 9) issues.push("No more than 9 photos are allowed.");
  if (profile.description.trim().length < 80) {
    issues.push("Description must be at least 80 characters.");
  }
  if (!isProfileDescriptionAllowed(profile.description)) {
    issues.push("Description cannot include direct contact info or social handles.");
  }
  if (!profile.zipCode.trim()) issues.push("ZIP code is required.");
  if (!profile.ageDecade) issues.push("Age decade is required.");
  if (!profile.sex) issues.push("Sex is required.");
  if (!profile.emailAddress.trim()) issues.push("Email address is required.");
  if (!profile.username.trim()) issues.push("Username is required.");
  if (!profile.displayName.trim()) issues.push("Display name is required.");

  return issues;
}
