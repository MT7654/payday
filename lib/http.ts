import { event, requestId } from './telemetry.ts';
export class HttpError extends Error {
  status: number;
  code: string;
  retryAfter?: number;
  constructor(status: number, message: string, code = 'request_error', retryAfter?: number) { super(message); this.status = status; this.code = code; this.retryAfter = retryAfter; }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function failure(error: unknown) {
  let status = 503, message = 'The service is temporarily unavailable. Please retry.', code = 'internal_error';
  if (error instanceof HttpError) { status = error.status; message = error.message; code = error.code; }
  else if (error instanceof Error && error.message === 'AUTH') { status = 401; message = 'Please sign in to continue.'; code = 'unauthenticated'; }
  else if (error instanceof Error && error.name === 'ZodError') { status = 400; message = 'Please check your entries and try again.'; code = 'invalid_input'; }
  event('request.failed', { status, code });
  const response = json({ error: message, code, requestId: requestId() }, status);
  if (error instanceof HttpError && error.retryAfter) response.headers.set('Retry-After', String(error.retryAfter));
  return response;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (origin !== new URL(request.url).origin || (site !== null && site !== 'same-origin')) {
    throw new HttpError(403, 'Request origin is not allowed.', 'origin_rejected');
  }
  if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'Please send JSON content.', 'unsupported_content_type');
  }
}
export async function limitedBody(request: Pick<Request, 'headers' | 'body'>, limit = 400000, timeoutMs = 10000): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > limit) {
    void request.body?.cancel().catch(() => {});
    throw new HttpError(413, 'This request is too large.', 'body_too_large');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Invalid request.', 'invalid_json');
  let timer: ReturnType<typeof setTimeout>;
  const timedOut = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(new HttpError(408, 'Request body timed out.', 'body_timeout')); void reader.cancel().catch(() => {}); }, timeoutMs);
  });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timedOut]);
      if (done) break;
      size += value.byteLength;
      if (size > limit) { void reader.cancel().catch(() => {}); throw new HttpError(413, 'This request is too large.', 'body_too_large'); }
      chunks.push(value);
    }
  } finally { clearTimeout(timer!); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new HttpError(400, 'Invalid request.', 'invalid_json'); }
}
