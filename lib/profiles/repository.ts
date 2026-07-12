import { AgeDecade, ProfileVisibilityStatus, Sex } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type UpsertProfileInput = {
  userId: string;
  emailAddress: string;
  username: string;
  displayName: string;
  description: string;
  zipCode: string;
  ageDecade: AgeDecade;
  sex: Sex;
  photoCount: number;
  completionStatus: string;
};

function buildPlaceholderPhotos(profileId: string, photoCount: number) {
  return Array.from({ length: photoCount }, (_, index) => ({
    profileId,
    position: index,
    storageKey: `placeholder://${profileId}/${index}`,
    status: "placeholder",
  }));
}

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: { photos: true },
  });
}

export async function upsertProfileForUser(input: UpsertProfileInput) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        emailAddress: input.emailAddress,
        username: input.username,
        displayName: input.displayName,
        description: input.description,
        zipCode: input.zipCode,
        ageDecade: input.ageDecade,
        sex: input.sex,
        completionStatus: input.completionStatus,
        visibilityStatus:
          input.completionStatus === "complete"
            ? ProfileVisibilityStatus.ACTIVE
            : ProfileVisibilityStatus.DRAFT,
      },
      update: {
        emailAddress: input.emailAddress,
        username: input.username,
        displayName: input.displayName,
        description: input.description,
        zipCode: input.zipCode,
        ageDecade: input.ageDecade,
        sex: input.sex,
        completionStatus: input.completionStatus,
        visibilityStatus:
          input.completionStatus === "complete"
            ? ProfileVisibilityStatus.ACTIVE
            : ProfileVisibilityStatus.DRAFT,
      },
    });

    await tx.profilePhoto.deleteMany({ where: { profileId: profile.id } });

    if (input.photoCount > 0) {
      await tx.profilePhoto.createMany({
        data: buildPlaceholderPhotos(profile.id, input.photoCount),
      });
    }

    return tx.profile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { photos: true },
    });
  });
}
