export const MOCK_ORDERS_KEY='payday-mock-orders-v1';
export type MockOrder={id:string;kind:'mock';productId:string;name:string;quantity:number;total:number;createdAt:string;fulfilment:'delivery'|'booking'};
export function checkoutTotal(price:number,quantity:number,budget:number){
 if(!Number.isFinite(price)||price<=0||price>100000||!Number.isInteger(quantity)||quantity<1||quantity>5||!Number.isFinite(budget)||budget<=0)throw Error('This item needs a valid price and budget before checkout.');
 const cents=Math.round(price*100)*quantity;
 if(cents>Math.round(budget*100))throw Error('This total is above your treat budget. Reduce the quantity or choose another reward.');
 return cents/100;
}
export function saveMockOrder(storage:Pick<Storage,'getItem'|'setItem'>,order:MockOrder){
 let orders:MockOrder[]=[];const raw=storage.getItem(MOCK_ORDERS_KEY);
 if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))orders=parsed.filter(x=>x?.kind==='mock'&&typeof x.id==='string');}catch{/* Replace unreadable mock-only history. */}}
 storage.setItem(MOCK_ORDERS_KEY,JSON.stringify([order,...orders.filter(x=>x.id!==order.id)].slice(0,20)));
}
