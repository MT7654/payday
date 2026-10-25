import type {BrowserInterest} from './browser-interests';
import type {Product} from './rewards';
// Payday's mock catalogue accepts the exact shortlisted item. This is never
// presented as a scraped merchant offer, availability check or real price.
export function shortlistProduct(item:BrowserInterest,budget:number):Product{
 return {id:'shortlist-'+item.id,name:item.name,category:'Browser shortlist',price:Math.min(79,Math.max(1,budget)),merchant:'Payday',url:item.url,reason:'The exact item you added to your Payday shortlist.',tradeoff:'Mock catalogue listing. Price and availability are not verified.',checkedAt:'',sources:[],mode:'demo',totalCostKnown:false,art:'gift'};
}
