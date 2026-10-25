import {productAssessmentHandler} from '../../../lib/product-assessment-api';
import {publicResearch} from '../../../lib/public-research-server';
import {structured} from '../../../lib/ai';
export const POST=productAssessmentHandler({begin:publicResearch,structured});
