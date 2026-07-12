export function isDatabaseConnectionError(error: unknown) {
  return error instanceof Error && /Can't reach database|ECONNREFUSED|connect/i.test(error.message);
}
