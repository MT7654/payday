export function preparedInterests(){return [
 {slug:'coffee',name:'A better morning coffee',category:'Everyday rituals',note:'A coffee grinder and a slower start to the day.',symbol:'☕',intent:'me'},
 {slug:'pottery',name:'An afternoon at the pottery wheel',category:'Try something new',note:'A hands-on class, with everything ready when you arrive.',symbol:'◉',intent:'me'},
 {slug:'weekend',name:'A quiet weekend away',category:'A change of scene',note:'Somewhere nearby, with time to unwind.',symbol:'☀',intent:'me'},
 {slug:'headphones',name:'Wireless headphones',category:'A thoughtful gift',note:'Keep gift ideas separate from your own next treat.',symbol:'♫',intent:'gift'},
 ].map(x=>({...x,id:'https://example.com/payday/'+x.slug,url:'https://example.com/payday/'+x.slug,source:'Prepared interest',kind:'prepared',shared:false,seenAt:'2026-10-25T00:00:00.000Z'}));}
