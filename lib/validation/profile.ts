const directContactPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
  /(?:^|\s)@[a-z0-9_.]{2,}/i,
  /\b(?:instagram|insta|ig|snapchat|snap|tiktok|twitter|x\.com|telegram|whatsapp)\b/i,
];

export function findProhibitedProfileDescriptionPattern(description: string) {
  return directContactPatterns.find((pattern) => pattern.test(description));
}

export function isProfileDescriptionAllowed(description: string) {
  return !findProhibitedProfileDescriptionPattern(description);
}
