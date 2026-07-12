export function normalizeCity(value: string) {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function normalizeZip(value: string) {
  return value.trim().replace(/\s+/g, "").toLocaleUpperCase("en-US");
}
