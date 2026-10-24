import {productVisionHandler} from '../../../lib/product-vision-api';
import {publicResearch} from '../../../lib/public-research-server';
import {structured} from '../../../lib/ai';
export const POST=productVisionHandler({begin:publicResearch,structured});
