export type CheckoutSessionInput = {
  userId: string;
  plan: "free" | "paid";
  successUrl: string;
  cancelUrl: string;
};

export type BillingProvider = {
  createCheckoutSession(input: CheckoutSessionInput): Promise<{ url: string }>;
  createBillingPortalSession(userId: string): Promise<{ url: string }>;
};

export const billingProvider: BillingProvider = {
  async createCheckoutSession() {
    throw new Error("Billing provider adapter is not implemented yet.");
  },
  async createBillingPortalSession() {
    throw new Error("Billing provider adapter is not implemented yet.");
  },
};
