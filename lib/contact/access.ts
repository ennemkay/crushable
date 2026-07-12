export type ContactAccessInput = {
  signedIn: boolean;
  hasActiveProfile: boolean;
  entitlementAllowed: boolean;
  blocked: boolean;
  hasRequiredContext: boolean;
};

export function canUseContactRoute(input: ContactAccessInput) {
  if (!input.signedIn) return { allowed: false, reason: "Sign in required." };
  if (!input.hasActiveProfile) return { allowed: false, reason: "Active profile required." };
  if (!input.entitlementAllowed) return { allowed: false, reason: "Contact limit reached." };
  if (input.blocked) return { allowed: false, reason: "Contact is blocked." };
  if (!input.hasRequiredContext) return { allowed: false, reason: "Contact context required." };
  return { allowed: true };
}
