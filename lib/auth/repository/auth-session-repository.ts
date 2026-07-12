import { prisma } from "@/lib/db/prisma";

export type CreateAuthSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export async function createAuthSession(input: CreateAuthSessionInput) {
  return prisma.authSession.create({
    data: input,
  });
}

export async function getActiveAuthSession(tokenHash: string) {
  const session = await prisma.authSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  return session;
}

export async function revokeAuthSession(tokenHash: string) {
  return prisma.authSession.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}
