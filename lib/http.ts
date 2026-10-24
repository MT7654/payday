export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof Error && error.message === 'AUTH') return json({ error: 'Please sign in to continue.' }, 401);
  if (error instanceof Error && error.name === 'ZodError') return json({ error: 'Please check your entries and try again.' }, 400);
  return json({ error: 'The service is temporarily unavailable. Please retry.' }, 503);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, 'Request origin is not allowed.');
}
export async function limitedBody(request: Request, limit = 400000): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > limit) throw new HttpError(413, 'This request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Invalid request.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'This request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new HttpError(400, 'Invalid request.'); }
}
