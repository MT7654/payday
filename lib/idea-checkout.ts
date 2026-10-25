import type {Brief,Idea} from './journey';
import type {Product} from './rewards';

// A mock catalogue listing preserves the chosen concept; it is never an
// invented merchant result or evidence of availability.
export function ideaCheckout(idea:Idea|null,brief:Brief):Product {
 if(!Number.isFinite(brief.budget)||brief.budget<1||brief.budget>100000)throw Error('Choose a valid treat budget.');
 const estimate=idea?.minCost;
 const price=Math.round(Math.min(brief.budget,typeof estimate==='number'&&Number.isFinite(estimate)&&estimate>0?estimate:Math.min(49,brief.budget))*100)/100;
 return {id:'mock-idea-'+(idea?.id||encodeURIComponent(brief.situation||brief.query||'reward')),name:idea?.title||brief.situation||brief.query||'Your chosen reward',category:brief.format==='do'?'Experiences':'Payday catalogue',price,merchant:'Payday',url:'',reason:idea?.reason||'The direction you chose.',tradeoff:'Illustrative listing and price for mock checkout. No stock or merchant offer is verified.',checkedAt:'',sources:[],mode:'demo',totalCostKnown:false,art:idea?.art||'gift'};
}
