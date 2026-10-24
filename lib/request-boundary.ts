import { event, requestId, withRequestContext } from './telemetry.ts';
import { failure } from './http.ts';

export async function requestBoundary(request: Request, run: () => Promise<Response>, sink?: (event: Record<string, unknown>) => void) {
  return withRequestContext(request, async () => {
    const started = performance.now();
    let response: Response;
    try { response = await run(); }
    catch (error) { response = failure(error); }
    const headers = new Headers(response.headers);
    headers.set('X-Request-Id', requestId()!);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Compatible with Vinext's inline hydration and the host's embedding policy.
    // Do not replace any stronger policy supplied by the hosting gateway.
    if (!headers.has('Content-Security-Policy')) headers.set('Content-Security-Policy', "object-src 'none'; base-uri 'self'; form-action 'self'");
    if (new URL(request.url).protocol === 'https:') headers.set('Strict-Transport-Security', 'max-age=31536000');
    if (new URL(request.url).pathname.startsWith('/api/')) headers.set('Cache-Control', 'no-store');
    event('request.completed', { status: response.status, durationMs: performance.now() - started });
    // Preserve response streams (including RSC); duration measures time to headers.
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }, sink);
}
