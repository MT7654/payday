import { guideHandler } from '../../../lib/guide-api';
import { publicResearch } from '../../../lib/public-research-server';
import { structured } from '../../../lib/ai';
export const POST = guideHandler({ begin: publicResearch, structured });
