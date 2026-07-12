import { prisma } from "@/lib/db/prisma";

export type CreateEmailLinkTokenInput = {
  userId: string;
  email: string;
  tokenHash: string;
  purpose: "sign-in" | "sign-up";
  expiresAt: Date;
};

export async function createEmailLinkToken(input: CreateEmailLinkTokenInput) {
  return prisma.emailLinkToken.create({
    data: input,
  });
}

export async function consumeEmailLinkToken(tokenHash: string) {
  const token = await prisma.emailLinkToken.findUnique({
    where: { tokenHash },
  });

  if (!token || token.consumedAt || token.expiresAt <= new Date()) {
    return null;
  }

  return prisma.emailLinkToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });
}
