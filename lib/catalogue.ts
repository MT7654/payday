import type { Product } from './rewards';
export type Sample = Product & { mood:string; tags:string[]; description:string; color:string };
// Authored concepts: illustrative SGD prices, no merchant claims or endorsements.
const rows:[string,string,number,string,string,string,string][]=[
 ['Slow-morning pour-over set','Daily rituals',48,'coffee','Everyday upgrade','A slower start, one lovely cup at a time.','Needs filters and your favourite coffee beans.'],
 ['Matcha moment starter kit','Daily rituals',42,'coffee','Everyday upgrade','Turn your afternoon break into a small ceremony.','Whisk care takes a little practice.'],
 ['Double-wall glass mug duo','Daily rituals',28,'coffee','A little comfort','Keep your favourite drink close and your hands comfortable.','Glass needs gentler handling.'],
 ['Cold-brew bottle','Daily rituals',35,'coffee','Everyday upgrade','Tomorrow’s coffee, ready before you are.','Allow overnight brewing time.'],
 ['Tea tasting collection','Daily rituals',24,'coffee','Try something new','Find a new favourite in a flight of loose-leaf teas.','Check ingredients for sensitivities.'],
 ['Hand-thrown breakfast bowl','Daily rituals',38,'pottery','A little comfort','Make even a weekday breakfast feel considered.','Each handmade piece varies slightly.'],
 ['Sunday pancake kit','Daily rituals',22,'coffee','A little comfort','Give yourself a reason to stay in a little longer.','Ingredients are perishable.'],
 ['Ceramic desk coaster set','Daily rituals',18,'pottery','Everyday upgrade','A small detail that makes your desk feel yours.','Check the base protects delicate surfaces.'],
 ['Pocket coffee grinder','Daily rituals',69,'coffee','Try something new','Freshly ground coffee, wherever your morning begins.','Manual grinding takes effort.'],
 ['Insulated everyday tumbler','Daily rituals',32,'coffee','Everyday upgrade','A reliable companion for your daily coffee run.','Check it fits your bag and cup holder.'],
 ['Intro to pottery afternoon','Experiences',75,'pottery','Make a memory','Get your hands messy and make something wonderfully imperfect.','Firing and collection may be separate.'],
 ['Golden-hour photo walk','Experiences',45,'camera','Make a memory','See familiar streets in a completely new light.','Weather can change the experience.'],
 ['Solo museum date','Experiences',25,'trip','A little comfort','A quiet afternoon following your own curiosity.','Exhibition availability varies.'],
 ['Beginner bouldering session','Experiences',38,'trip','Try something new','Trade your usual routine for a playful new challenge.','Rental shoes may cost extra.'],
 ['Sunrise kayak outing','Experiences',85,'trip','Make a memory','A little fresh air and a different view of the city.','Check swimming requirements and weather.'],
 ['Coffee tasting workshop','Experiences',65,'coffee','Try something new','Learn to name the flavours you already love.','Expect caffeine; check decaf availability.'],
 ['Make-your-own perfume session','Experiences',98,'gift','Make a memory','Create a scent with your own story behind it.','Fragrance sensitivities need consideration.'],
 ['Neighbourhood food trail','Experiences',55,'trip','Make a memory','Follow your appetite somewhere outside your routine.','Confirm dietary needs with the host.'],
 ['Small cinema night for one','Experiences',20,'camera','A little comfort','A good film, your favourite seat, and no coordinating.','Snacks are an extra cost.'],
 ['Botanical sketching class','Experiences',58,'journal','Try something new','Notice the little details and put them on paper.','Check whether materials are provided.'],
 ['Soft Sunday reading blanket','Home & comfort',59,'gift','A little comfort','Make a cosy corner for your next chapter.','Check fabric care instructions.'],
 ['Warm-glow bedside lamp','Home & comfort',68,'gift','A little comfort','Swap harsh overhead lighting for a softer evening.','Check plug type and bulb compatibility.'],
 ['Low-maintenance plant duo','Home & comfort',34,'pottery','Everyday upgrade','A little green company for your desk or windowsill.','Light needs and pet safety vary by plant.'],
 ['Linen cushion cover pair','Home & comfort',45,'gift','Everyday upgrade','Refresh a familiar space with a softer texture.','Cushion inserts are not included.'],
 ['Evening wind-down candle','Home & comfort',29,'pottery','A little comfort','A warm scent for the part of the day that is yours.','Never leave a candle unattended.'],
 ['Bookshop discovery bundle','Home & comfort',48,'journal','Try something new','Three unexpected reads for your next quiet weekend.','You may already own a selected title.'],
 ['Compact bedside speaker','Home & comfort',89,'headphones','Everyday upgrade','Give your morning playlist a dedicated home.','Sound quality depends on room size.'],
 ['1000-piece weekend puzzle','Home & comfort',30,'gift','A little comfort','Something satisfying to finish at your own pace.','Needs a clear table for several sessions.'],
 ['Cotton sleep mask','Home & comfort',18,'gift','A little comfort','A soft little addition to your evening routine.','Fit and fabric feel are personal.'],
 ['Desktop organiser tray','Home & comfort',26,'pottery','Everyday upgrade','Give the little things a place to land.','Measure your available desk space.'],
 ['Everyday lightweight tote','Style & carry',42,'bag','Everyday upgrade','Room for daily essentials without the extra bulk.','Check pocket layout before buying.'],
 ['Minimal everyday watch','Style & carry',120,'watch','Mark a milestone','A quiet reminder of a moment you earned.','Try the case size on your wrist.'],
 ['Personalised journal cover','Style & carry',55,'journal','Mark a milestone','A little keepsake for ideas worth keeping.','Personalised items may not be returnable.'],
 ['Slim cardholder','Style & carry',38,'bag','Everyday upgrade','Carry just what you need in a smaller footprint.','Limited space for cash and coins.'],
 ['Silver everyday pendant','Style & carry',95,'watch','Mark a milestone','A subtle piece to wear with your everyday story.','Check materials and chain length.'],
 ['Weekend crossbody bag','Style & carry',65,'bag','Everyday upgrade','Keep your hands free on small adventures.','Check phone and wallet dimensions.'],
 ['Colour-pop everyday socks','Style & carry',16,'gift','A little comfort','A tiny lift hiding under your everyday outfit.','Check sizing and fibre composition.'],
 ['Packable day-trip backpack','Style & carry',58,'bag','Make a memory','Ready when a spontaneous afternoon turns into a day out.','Lightweight straps offer less support.'],
 ['Engraved keyring','Style & carry',24,'gift','Mark a milestone','Keep a meaningful date or word close by.','Double-check spelling before personalising.'],
 ['Everyday wireless headphones','Style & carry',135,'headphones','Everyday upgrade','Make a little space for your music on the commute.','Comfort and noise isolation vary.'],
 ['Watercolour pocket studio','Hobbies',45,'journal','Try something new','Start small: one brush, a few colours, your next idea.','Paper quality affects results.'],
 ['Film photography starter camera','Hobbies',79,'camera','Try something new','Slow down and make each frame count.','Film and development are ongoing costs.'],
 ['Beginner embroidery kit','Hobbies',28,'gift','Try something new','A calm hands-on project you can pick up anytime.','Detailed work needs good lighting.'],
 ['Pocket travel journal','Hobbies',22,'journal','Make a memory','Keep the little moments that photos sometimes miss.','Choose a size you will actually carry.'],
 ['Beginner ukulele','Hobbies',88,'gift','Try something new','Learn a first song and make your own background music.','Tuning and regular practice take time.'],
 ['Indoor herb garden kit','Hobbies',36,'pottery','Try something new','Grow something you can enjoy in your next meal.','Needs suitable light and regular watering.'],
 ['Weekend board game','Hobbies',49,'gift','Make a memory','Give your next catch-up a playful new ritual.','Check player count and session length.'],
 ['Personal milestone photo book','Hobbies',62,'camera','Mark a milestone','Bring your favourite chapter out of your camera roll.','Allow time to choose and arrange photos.'],
 ['Calligraphy discovery set','Hobbies',32,'journal','Try something new','Turn a few words into a satisfying creative practice.','Ink and paper refills add ongoing cost.'],
 ['Solo staycation inspiration fund','Experiences',150,'trip','Mark a milestone','Set aside a little budget for a change of scenery.','A planning concept, not a hotel booking or quoted rate.'],
];
const palettes=['#eee9dc','#e4ede4','#f5e2d7','#e8e3ef','#e1eaf0'];
export const catalogue:Sample[]=rows.map((r,i)=>({id:`sample-${String(i+1).padStart(2,'0')}`,name:r[0],category:r[1],price:r[2],art:r[3],mood:r[4],description:r[5],reason:r[5],tradeoff:r[6],tags:[r[1],r[4],r[3]],color:palettes[i%palettes.length],merchant:'Sample recommendation',url:'',checkedAt:'',sources:[],mode:'demo',totalCostKnown:false}));
export function sampleMatches(budget:number,direction:string,excluded='',reactions:string[]=[]):Sample[]{
 const terms=excluded.toLowerCase().split(/[,;\n]/).map(t=>t.trim()).filter(Boolean);
 const words=`${direction} ${reactions.join(' ')}`.toLowerCase().split(/\W+/).filter(w=>w.length>3);
 return catalogue.filter(p=>p.price<=budget&&!terms.some(t=>`${p.name} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(t))).map(p=>({p,score:words.reduce((n,w)=>n+Number(`${p.name} ${p.category} ${p.mood} ${p.description}`.toLowerCase().includes(w)),0)})).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.p);
}

export function shortlist(mood:string,budget:number){const preferred=['sample-01','sample-40','sample-06'];const candidates=catalogue.filter(p=>p.price<=budget&&(mood==='Anything'||p.mood===mood));return candidates.sort((a,b)=>{const rank=(p:Sample)=>preferred.includes(p.id)?preferred.indexOf(p.id):-1;return (rank(a)<0?99:rank(a))-(rank(b)<0?99:rank(b));}).slice(0,3);}
