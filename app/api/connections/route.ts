import {json} from '../../../lib/server';
// Eligibility discovery is unavailable in this deployment. Never imply OAuth succeeded.
// Enable only after Sites returns an allowed canonical connector and hosted consent is tested.
export async function GET(){return json({gmail:{status:'unavailable',message:'Gmail connection is not enabled on this version of Payday. No emails have been accessed.'},calendar:{status:'unavailable',message:'Calendar connection is not enabled. You can still add saved plans to your calendar.'}});}
