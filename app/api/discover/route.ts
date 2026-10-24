import { owner, database } from '../../../lib/server';
import { response, structured } from '../../../lib/ai';
import { discoveryHandler } from '../../../lib/discovery-api';

export const POST = discoveryHandler({ owner, database, response, structured });
