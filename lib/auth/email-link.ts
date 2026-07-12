"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { setDevSessionEmail } from "@/lib/auth/dev-session";
import { createAuthSession } from "@/lib/auth/repository/auth-session-repository";
import { createEmailLinkToken } from "@/lib/auth/repository/email-link-token-repository";
import { addDays, addMinutes, createOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { isDatabaseConnectionError } from "@/lib/db/errors";
import { upsertUserByEmail } from "@/lib/users/repository";

const emailSchema = z.string().trim().email();

function parseEmail(formData: FormData) {
  const result = emailSchema.safeParse(formData.get("email"));
  if (!result.success) {
    redirect("/sign-in?error=invalid-email");
  }
  return result.data.toLocaleLowerCase("en-US");
}

async function requestEmailLink(email: string, mode: "sign-in" | "sign-up") {
  let persistence = "fallback";

  try {
    const user = await upsertUserByEmail(email);
    const emailLinkToken = createOpaqueToken();
    const sessionToken = createOpaqueToken();

    await createEmailLinkToken({
      userId: user.id,
      email,
      purpose: mode,
      tokenHash: hashToken(emailLinkToken),
      expiresAt: addMinutes(new Date(), 15),
    });

    await createAuthSession({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: addDays(new Date(), 30),
    });

    await setDevSessionEmail(email, sessionToken);
    persistence = "database";
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    await setDevSessionEmail(email);
  }

  // Provider integration will send the actual email link here. The scaffold
  // creates a dev session immediately so onboarding can be reviewed locally.
  redirect(
    `/sign-in/check-email?mode=${mode}&email=${encodeURIComponent(email)}&persistence=${persistence}`,
  );
}

export async function requestSignInLink(formData: FormData) {
  const email = parseEmail(formData);
  await requestEmailLink(email, "sign-in");
}

export async function requestSignUpLink(formData: FormData) {
  const email = parseEmail(formData);
  await requestEmailLink(email, "sign-up");
}
