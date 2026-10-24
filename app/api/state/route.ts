import { owner, database, runtime } from '../../../lib/server';
import { stateHandlers } from '../../../lib/state-api';
export const { GET, PUT, DELETE } = stateHandlers({ owner, database, configured: () => !!runtime().OPENAI_API_KEY });
