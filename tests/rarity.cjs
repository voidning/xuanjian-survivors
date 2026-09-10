'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const X=require(path.join(process.env.XJ_GAME_ROOT||path.resolve(__dirname,'..'),'scripts/field-event.js')),UI=require('../scripts/experience-ui.js');
const results=[],samples={};const grade=id=>X.SKILLS.find(s=>s.id===id)?.grade;
function test(name,f){try{f();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
function sample(kind){const counts={S:0,A:0,B:0};for(let seed=1;seed<=10000;seed++){const r=new X.Run(seed*7919,'sword','standard');r.level=2;if(kind==='opening')r.opening();else r.openChoice(kind);for(const id of r.choices)if(grade(id))counts[grade(id)]++;}return counts;}
for(const kind of ['opening','upgrade','event'])samples[kind]=sample(kind);
if(!process.env.XJ_GAME_ROOT){
 test('unlearned S is scarcer than A and B per skill across ordinary offers',()=>{const c=samples.upgrade;const per=g=>c[g]/X.SKILLS.filter(s=>s.grade===g).length;assert(per('S')<per('A')*.7);assert(per('A')<per('B')*.85);});
 test('learned skills retain equal upgrade weights irrespective of grade',()=>{const r=new X.Run(42);r.skills=Object.fromEntries(X.SKILLS.map(s=>[s.id,1]));for(const s of X.SKILLS)assert.equal(r.skillOfferWeight(s.id),1.25);});
 test('rare last missing component and mastery remain guaranteed with a training slot',()=>{for(const recipe of X.RECIPES)for(const target of recipe.ids)for(let seed=1;seed<=100;seed++){const r=new X.Run(seed);r.level=2;r.skills=Object.fromEntries(recipe.ids.filter(id=>id!==target).map(id=>[id,1]));r.offerMisses={[recipe.id]:3};r.openChoice();assert(r.choices.includes(target));assert.equal(r.choices.filter(id=>grade(id)).length,2);r.skills[target]=1;r.offerMisses[recipe.id]=3;r.openChoice();assert(r.choices.some(id=>recipe.ids.includes(id)));}});
 test('all openings unique, screen-compatible and never empty',()=>{for(const item of X.ITEMS)for(let seed=1;seed<=1000;seed++){const r=new X.Run(seed*7919,item.id);r.opening();assert.equal(new Set(r.choices).size,3);assert(r.choices.every(id=>grade(id)));if(item.id==='screen')assert(r.choices.every(id=>['gate','light','rain','thunder','flame','fragrance'].includes(id)));}});
 test('every skill grade visible before collapsed details; gifts and training ungraded',()=>{const r=new X.Run(42);for(const s of X.SKILLS){const html=UI.card(r,s.id,0,()=>'',{},{}).split('<details')[0];assert(html.includes(s.grade+'级'));}r.choiceKind='gift';for(const s of X.GIFTS)assert(!UI.card(r,s.id,0,()=>'',{},{}).includes('skill-grade'));r.choiceKind='upgrade';for(const s of X.TRAINING)assert(!UI.card(r,s.id,0,()=>'',{},{}).includes('skill-grade'));});
}
console.log(JSON.stringify({samples,results,passed:results.filter(x=>x.pass).length,total:results.length},null,2));if(results.some(x=>!x.pass))process.exitCode=1;
