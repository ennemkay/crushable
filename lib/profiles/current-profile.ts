import { getCurrentUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/profiles/repository";
import { upsertUserByEmail } from "@/lib/users/repository";

export type CurrentProfileResult =
  | { status: "signed-out" }
  | { status: "db-unavailable"; email: string }
  | { status: "loaded"; email: string; profile: Awaited<ReturnType<typeof getProfileByUserId>> };

function isDatabaseConnectionError(error: unknown) {
  return error instanceof Error && /Can't reach database|ECONNREFUSED|connect/i.test(error.message);
}

export async function getCurrentProfile(): Promise<CurrentProfileResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { status: "signed-out" };

  try {
    const user = await upsertUserByEmail(sessionUser.email);
    const profile = await getProfileByUserId(user.id);
    return { status: "loaded", email: sessionUser.email, profile };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { status: "db-unavailable", email: sessionUser.email };
    }
    throw error;
  }
}
