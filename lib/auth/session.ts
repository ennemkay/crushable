import { getDevAuthSessionToken, getDevSessionEmail } from "@/lib/auth/dev-session";
import { getActiveAuthSession } from "@/lib/auth/repository/auth-session-repository";
import { hashToken } from "@/lib/auth/tokens";
import { isDatabaseConnectionError } from "@/lib/db/errors";

export type AppUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const sessionToken = await getDevAuthSessionToken();
  if (sessionToken) {
    try {
      const session = await getActiveAuthSession(hashToken(sessionToken));
      if (session) {
        return {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        };
      }
    } catch (error) {
      if (!isDatabaseConnectionError(error)) {
        throw error;
      }
    }
  }

  const email = await getDevSessionEmail();
  if (!email) return null;

  // This development session keeps UI flows moving before the real auth provider
  // is wired. Persistence actions should resolve the database User by email.
  return {
    id: `dev:${email}`,
    email,
    role: "USER",
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required.");
  }
  return user;
}
