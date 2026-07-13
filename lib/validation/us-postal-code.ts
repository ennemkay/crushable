import isPostalCode from "validator/lib/isPostalCode";

export function isValidUsZipCode(value: string) {
  return isPostalCode(value.trim(), "US");
}
