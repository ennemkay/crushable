import { cookies } from "next/headers";

const DEV_SESSION_COOKIE = "crushable_dev_email";
const DEV_AUTH_SESSION_COOKIE = "crushable_dev_session";

export async function setDevSessionEmail(email: string, sessionToken?: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  if (sessionToken) {
    cookieStore.set(DEV_AUTH_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }
}

export async function getDevSessionEmail() {
  const cookieStore = await cookies();
  return cookieStore.get(DEV_SESSION_COOKIE)?.value ?? null;
}

export async function getDevAuthSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(DEV_AUTH_SESSION_COOKIE)?.value ?? null;
}
