import { owner, database, runtime } from '../../../lib/server';
import { stateHandlers } from '../../../lib/state-api';

const handlers = stateHandlers({ owner, database, configured: () => !!runtime().OPENAI_API_KEY });
export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
