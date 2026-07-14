/**
 * Shared API utility functions.
 *
 * - `withTimeout`: Wrap any promise with a timeout (AbortController or timer).
 * - `retryOnFail`: Retry an async function on failure.
 * - `errorResponse`: Standard error response builder.
 */

/**
 * Wraps a fetch-style promise with a timeout that rejects after `ms` milliseconds.
 * Works with any promise — not just fetch.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label?: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(label ? `Timeout after ${ms}ms: ${label}` : `Timeout after ${ms}ms`));
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Retry an async function on failure.
 * Only retries on network errors and 5xx server errors.
 * Does NOT retry on 4xx client errors or Zod validation errors.
 */
export async function retryOnFail<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 1000, label = 'operation' } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry client errors or validation failures
      if (err instanceof SyntaxError || err instanceof TypeError) {
        throw err;
      }

      // Don't retry HTTP 4xx errors
      if (err && typeof err === 'object' && 'status' in err && typeof (err as any).status === 'number' && (err as any).status >= 400 && (err as any).status < 500) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[retry] ${label}: attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Build a standardized error response.
 */
export function errorResponse(message: string, status: number = 500, details?: Record<string, unknown>) {
  const body: Record<string, unknown> = { error: message };
  if (details && Object.keys(details).length > 0) {
    body.details = details;
  }
  return Response.json(body, { status });
}
