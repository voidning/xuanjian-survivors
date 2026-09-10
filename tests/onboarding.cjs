'use strict';
const assert=require('node:assert/strict'),X=require('../scripts/field-event.js'),UI=require('../scripts/experience-ui.js');
let count=0;
for(const path of X.Cultivation.routes){
 const r=new X.Run(11,'sword');r.opening();assert(UI.pathIntroduction(path.id).includes(UI.pathAdvice[path.id].style));
 for(const id of path.ids){const html=UI.card(r,id,r.choices.indexOf(id),()=>'',{},{});assert(!/undefined|NaN/.test(html));assert(html.includes(UI.foundationPlain[id]));assert(html.includes('数值与修行说明'));assert(html.includes('未来三重'));assert(html.includes('三重神通：'));assert(UI.growth(r,id,{}));count++;}
}
const r=new X.Run(2);assert(UI.trainingInfo(r,'recovery').stat(3).includes('0.75'));
console.log(JSON.stringify({suite:'four-path onboarding integration',passed:count+1,total:count+1}));
