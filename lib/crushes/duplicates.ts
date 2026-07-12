import { normalizeCity } from "@/lib/normalization/location";
import { normalizeFirstNameVariants, normalizeName } from "@/lib/normalization/names";

export type CrushIdentityInput = {
  firstNameVariants: string[];
  fullLastName: string;
  city: string;
  ageDecade: string;
  sex: string;
};

export function normalizeCrushIdentity(input: CrushIdentityInput) {
  const firstNameVariants = normalizeFirstNameVariants(input.firstNameVariants);
  if (firstNameVariants.length > 5) {
    throw new Error("At most 5 first-name variants are allowed.");
  }

  return {
    firstNameVariants,
    normalizedFirstNameVariantKey: firstNameVariants.join("|"),
    normalizedFullLastName: normalizeName(input.fullLastName),
    normalizedCity: normalizeCity(input.city),
    ageDecade: input.ageDecade,
    sex: input.sex,
  };
}

export function firstNameVariantsOverlap(left: string[], right: string[]) {
  const normalizedRight = new Set(normalizeFirstNameVariants(right));
  return normalizeFirstNameVariants(left).some((name) => normalizedRight.has(name));
}
