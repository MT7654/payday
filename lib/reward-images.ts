const fallback:Record<string,string>={coffee:'sample-01',pottery:'sample-06',headphones:'sample-40',bag:'sample-31',watch:'sample-32',journal:'sample-44',camera:'sample-42',trip:'sample-50',gift:'gift'};
const names:Record<string,string>={coffee:'a coffee ritual',pottery:'handmade ceramics',headphones:'wireless headphones',bag:'an everyday tote',watch:'an everyday watch',journal:'a journal',camera:'a film camera',trip:'a quiet getaway',gift:'a thoughtful gift'};
const matches:[RegExp,string,string][]=[
 [/museum|gallery|exhibition/i,'sample-13','a quiet museum visit'],
 [/botanical.*sketch|guided.*sketch|sketching.*(class|session)/i,'sample-20','a botanical sketching session'],
 [/paint|watercolou?r/i,'sample-41','watercolour supplies'],
 [/pottery.*(class|workshop|session)|wheel|clay/i,'sample-11','a pottery session'],
 [/matcha/i,'sample-02','a matcha kit'],[/tea.*(tast|collection|ceremony)/i,'sample-05','a tea tasting collection'],
 [/coffee.*(tast|workshop)/i,'sample-16','a coffee tasting session'],[/pancake/i,'sample-07','a pancake morning'],
 [/cinema|movie|film night/i,'sample-19','a cinema visit'],[/kayak/i,'sample-15','a kayak outing'],[/boulder|climbing/i,'sample-14','an indoor climbing session'],
 [/food.*(trail|tour)|tasting.*food/i,'sample-18','a neighbourhood food outing'],[/photo.*walk/i,'sample-12','a golden-hour photo walk'],
 [/embroider/i,'sample-43','an embroidery kit'],[/ukulele/i,'sample-45','a beginner ukulele'],[/calligraphy/i,'sample-49','a calligraphy set'],
 [/candle/i,'sample-25','a candle'],[/lamp/i,'sample-22','a bedside lamp'],[/blanket/i,'sample-21','a reading blanket'],[/puzzle/i,'sample-28','a jigsaw puzzle'],
 [/board game/i,'sample-47','a board game'],[/herb/i,'sample-46','an indoor herb garden'],[/plant/i,'sample-23','potted plants'],[/bookshop|reading|book bundle/i,'sample-26','a book collection'],
 [/speaker/i,'sample-27','a compact speaker'],[/pendant|necklace/i,'sample-35','a silver pendant'],[/socks/i,'sample-37','colourful socks'],[/perfume/i,'sample-17','a perfume-making session'],
 [/backpack/i,'sample-38','a day-trip backpack'],[/crossbody/i,'sample-36','a crossbody bag'],[/cardholder/i,'sample-34','a slim cardholder'],[/keyring/i,'sample-39','a keyring'],
 [/coaster/i,'sample-08','ceramic coasters'],[/cold.brew/i,'sample-04','a cold-brew bottle'],[/grinder/i,'sample-09','a coffee grinder'],[/tumbler|bottle/i,'sample-10','an insulated tumbler'],[/glass.*mug|mug.*duo/i,'sample-03','glass mugs'],
 [/cushion/i,'sample-24','linen cushions'],[/sleep mask/i,'sample-29','a sleep mask'],[/organis|organiz/i,'sample-30','a desk tray'],[/photo book/i,'sample-48','a photo book'],
];
export function rewardImage(kind='gift',name='',id?:string){
 const sample=id?.match(/^sample-(\d{2})$/);if(sample&&+sample[1]>=1&&+sample[1]<=50)return {src:`/images/rewards/${id}.webp`,subject:name||'a sample reward'};
 const match=matches.find(([re])=>re.test(name));
 return {src:`/images/rewards/${match?.[1]||fallback[kind]||'gift'}.webp`,subject:match?.[2]||names[kind]||'a thoughtful reward'};
}
