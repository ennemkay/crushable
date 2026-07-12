import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function main() {
  const runId = crypto.randomUUID();
  const email = `db-smoke-${runId}@example.test`;
  let userId;

  try {
    await prisma.$connect();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
        },
      });

      const emailLinkToken = await tx.emailLinkToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(`email-link-${runId}`),
          purpose: "sign-in",
          email,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const authSession = await tx.authSession.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(`session-${runId}`),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          emailAddress: email,
          username: `smoke-${runId.slice(0, 8)}`,
          displayName: "Smoke Test",
          description: "Temporary profile used by the database smoke check.",
          zipCode: "80202",
          ageDecade: "AGE_30_39",
          sex: "OTHER",
          completionStatus: "complete",
          visibilityStatus: "ACTIVE",
          photos: {
            create: [
              {
                position: 0,
                storageKey: `placeholder://${runId}/0`,
                status: "placeholder",
              },
            ],
          },
        },
        include: {
          photos: true,
        },
      });

      return { user, emailLinkToken, authSession, profile };
    });

    userId = result.user.id;

    const persisted = await prisma.user.findUnique({
      where: { id: result.user.id },
      include: {
        emailLinkTokens: true,
        authSessions: true,
        profile: {
          include: { photos: true },
        },
      },
    });

    assert(persisted, "Expected user to persist");
    assert(persisted.email === email, "Expected persisted email to match");
    assert(persisted.emailLinkTokens.length === 1, "Expected one email-link token");
    assert(persisted.authSessions.length === 1, "Expected one auth session");
    assert(persisted.profile, "Expected profile to persist");
    assert(persisted.profile.completionStatus === "complete", "Expected complete profile");
    assert(persisted.profile.photos.length === 1, "Expected one profile photo row");

    console.log("Database smoke check passed");
    console.log(`Created and verified temporary user ${email}`);
  } finally {
    if (userId) {
      const profile = await prisma.profile.findUnique({ where: { userId } }).catch(() => null);

      if (profile) {
        await prisma.profilePhoto.deleteMany({ where: { profileId: profile.id } }).catch(() => {});
        await prisma.profile.delete({ where: { id: profile.id } }).catch(() => {});
      }

      await prisma.emailLinkToken.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.authSession.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }

    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error("Database smoke check failed");
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
