import { discoveryHandler } from '../../../lib/discovery-api';
import { discoveryState } from '../../../lib/discovery-state';
import { getChatGPTUser } from '../../chatgpt-auth';
import { database } from '../../../lib/server';
import { publicResearch } from '../../../lib/public-research-server';
import { response, structured } from '../../../lib/ai';
export const POST = discoveryHandler({ begin: publicResearch, loadState: discoveryState(getChatGPTUser, database), response, structured });
