"use server";

import { AgeDecade, Sex } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/session";
import { getProfileCompletionIssues } from "@/lib/profiles/completion";
import { upsertProfileForUser } from "@/lib/profiles/repository";
import { upsertUserByEmail } from "@/lib/users/repository";
import { isValidUsZipCode } from "@/lib/validation/us-postal-code";

export type ProfileFormState = {
  issues: string[];
  values?: {
    emailAddress?: string;
    username?: string;
    displayName?: string;
    description?: string;
    zipCode?: string;
    ageDecade?: string;
    sex?: string;
    photoCount?: string;
  };
};

const onboardingSchema = z.object({
  emailAddress: z.string().trim().email("Enter a valid email address."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be 32 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only include letters, numbers, and underscores."),
  displayName: z.string().trim().min(1, "Display name is required.").max(60),
  description: z.string().trim(),
  zipCode: z
    .string()
    .trim()
    .min(1, "ZIP code is required.")
    .refine(isValidUsZipCode, "Enter a valid U.S. ZIP code."),
  ageDecade: z.nativeEnum(AgeDecade),
  sex: z.nativeEnum(Sex),
  photoCount: z.coerce.number().int().min(0).max(20),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getSubmittedValues(formData: FormData): ProfileFormState["values"] {
  return {
    emailAddress: getStringValue(formData, "emailAddress"),
    username: getStringValue(formData, "username"),
    displayName: getStringValue(formData, "displayName"),
    description: getStringValue(formData, "description"),
    zipCode: getStringValue(formData, "zipCode"),
    ageDecade: getStringValue(formData, "ageDecade"),
    sex: getStringValue(formData, "sex"),
    photoCount: getStringValue(formData, "photoCount"),
  };
}

function isDatabaseConnectionError(error: unknown) {
  return error instanceof Error && /Can't reach database|ECONNREFUSED|connect/i.test(error.message);
}

export async function saveOnboardingProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const values = getSubmittedValues(formData);
  const parsed = onboardingSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const completionIssues = getProfileCompletionIssues(parsed.data);
  if (completionIssues.length > 0) {
    return { values, issues: completionIssues };
  }

  try {
    const sessionUser = await requireCurrentUser();
    const user = await upsertUserByEmail(sessionUser.email);

    await upsertProfileForUser({
      userId: user.id,
      emailAddress: parsed.data.emailAddress,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      description: parsed.data.description,
      zipCode: parsed.data.zipCode,
      ageDecade: parsed.data.ageDecade,
      sex: parsed.data.sex,
      photoCount: parsed.data.photoCount,
      completionStatus: "complete",
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return {
        values,
        issues: [
          "Postgres is not reachable from this environment yet. The form is wired for persistence, but a database must be running to save.",
        ],
      };
    }

    if (error instanceof Error && error.message === "Authentication required.") {
      return {
        values,
        issues: ["Sign in or create an account before creating a profile."],
      };
    }

    throw error;
  }

  redirect("/settings/profile?saved=1");
}

export async function saveProfileSettings(
  previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  return saveOnboardingProfile(previousState, formData);
}
