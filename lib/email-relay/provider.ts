export type RelayEmailInput = {
  connectionId: string;
  toUserId: string;
  fromUserId: string;
  subject: string;
  text: string;
  replyTo: string;
};

export type EmailRelayProvider = {
  sendRelayEmail(input: RelayEmailInput): Promise<{ providerMessageId: string }>;
  verifyInboundWebhook(headers: Headers, body: string): Promise<boolean>;
};

export const emailRelayProvider: EmailRelayProvider = {
  async sendRelayEmail() {
    throw new Error("Email relay provider adapter is not implemented yet.");
  },
  async verifyInboundWebhook() {
    throw new Error("Email relay provider adapter is not implemented yet.");
  },
};
