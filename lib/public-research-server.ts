import { database, runtime } from './server';
import { beginPublicResearch } from './public-research';
export function publicResearch(request: Request) {
  const env = runtime();
  return beginPublicResearch(request, { database: database(), secret: env.RATE_LIMIT_SECRET || env.OPENAI_API_KEY, localPreview: import.meta.env.DEV });
}
