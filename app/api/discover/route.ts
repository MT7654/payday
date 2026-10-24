import { publicDiscoveryHandler } from '../../../lib/public-discovery-api';
import { publicResearch } from '../../../lib/public-research-server';
import { response, structured } from '../../../lib/ai';
export const POST = publicDiscoveryHandler({ begin: publicResearch, response, structured });
