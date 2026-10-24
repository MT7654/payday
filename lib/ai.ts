import { runtime } from './server';
import { aiClient } from './ai-client';
export async function response(input: string, schema?: unknown, search = false, signal?: AbortSignal) {
  return aiClient(runtime()).response(input, schema, search, signal);
}
export async function structured(input: string, schema: unknown, signal?: AbortSignal) {
  return aiClient(runtime()).structured(input, schema, signal);
}
