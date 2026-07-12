import { prisma } from "@/lib/db/prisma";

export async function upsertUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });
}
