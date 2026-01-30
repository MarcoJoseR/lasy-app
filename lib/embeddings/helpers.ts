export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 500
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const backoff = delayMs * Math.pow(2, i);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  throw lastError;
}
