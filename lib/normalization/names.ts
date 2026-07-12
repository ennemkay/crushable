export function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function normalizeFirstNameVariants(values: string[]) {
  return [...new Set(values.map(normalizeName).filter(Boolean))].sort();
}

export function createFirstNameVariantKey(values: string[]) {
  return normalizeFirstNameVariants(values).join("|");
}
