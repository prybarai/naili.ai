/**
 * Structured API logging helpers.
 *
 * Use these in API routes instead of raw console.log/console.error
 * to get consistent, debuggable output in production.
 */

export function logApi(
  route: string,
  event: string,
  data?: Record<string, unknown>
) {
  console.log(
    `[${new Date().toISOString()}] [${route}] ${event}`,
    data ? JSON.stringify(data).slice(0, 500) : ''
  );
}

export function logApiError(
  route: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(
    `[${new Date().toISOString()}] [${route}] ERROR: ${msg}`,
    context ? JSON.stringify(context).slice(0, 500) : ''
  );
}
