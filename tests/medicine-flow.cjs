'use strict';
// Input-only, deterministic policy; never inject progression, health, RNG or time.
const path=require('path');
const root=process.env.XJ_GAME_ROOT||path.resolve(__dirname,'..');
const {Run,ITEMS,RECIPES,TRAINING,dist,FieldEvent}=require(path.join(root,'scripts/field-event.js'));
const limit=Number(process.env.XJ_SMOKE_SECONDS)||800,runs=[];
const training=new Set(TRAINING.map(x=>x.id));
const weights={gate:9,light:8,gold:8,thunder:7,armor:6,flame:6,rain:8,body:5,dew:6,conceal:5,muddle:4,spring:4,vigor:7,power:6,recovery:6,focus:5,reach:4,stride:3};
function progress(r,route){if(r.fruitProgress)return r.fruitProgress(route.id);const missing=route.ids.filter(id=>!r.lv(id));return {missing,mastered:route.ids.some(id=>r.lv(id)>=3),ready:!missing.length,targets:missing};}
function rank(r,id,targets){return (targets.includes(id)?1000+(!r.lv(id)?100:r.lv(id)*20):0)+(weights[id]||1)+(r.lv(id)?2:0);}
function steer(r){let target=r.drops.list().sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0]||{x:1600,y:1100};const field=r.fieldEvent;if(FieldEvent.live(field))target=r.enemies.list().filter(e=>e.fieldGuard&&e.fieldEventId===field.id).sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0]||field;if(r.p.hp<r.maxHP*.65){const bag=(r.medicineBags||[]).slice().sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0];if(bag)target=bag;}let best={score:-Infinity};for(let i=-1;i<16;i++){const a=i*Math.PI/8,x=i<0?0:Math.cos(a),y=i<0?0:Math.sin(a),q={x:r.p.x+x*65,y:r.p.y+y*65};let score=-dist(q,target)*.11;if(q.x<130||q.x>3070||q.y<130||q.y>2070)score-=200;for(const e of r.enemies.list()){const d=dist(e,q);if(d<105)score-=(105-d)*.65;if(e.phase==='warn'&&[1,6,7,12].includes(e.type)){const dx=q.x-e.x,dy=q.y-e.y;if(dx*e.ax+dy*e.ay>0&&Math.abs(dx*e.ay-dy*e.ax)<40)score-=80;}}for(const z of r.zones.list())if(z.kind==='hazard'&&dist(z,q)<z.r+12)score-=100;if(score>best.score)best={score,x,y};}return best;}

for(const gift of ['whale','cloud'])for(const route of RECIPES)for(const item of ITEMS.filter(i=>['bow','sword','screen'].includes(i.id)))for(const seed of [42,907])for(const strategy of ['route','balanced']){
 const r=new Run(seed,item.id,'standard');r.opening();let input={},nextMove=0,upgrades=0,trainingChoices=0,skipped=0,rerolls=0,streak=0,longest=0,formedAt=null,fiveAt=null;const choices=[];
 while(r.t<limit&&r.state!=='ended'){
  if(r.state==='choice'){
   const kind=r.choiceKind;let p=progress(r,route),initial=r.choices.slice(),targets=p.targets;
   if(kind==='upgrade'){upgrades++;if(targets.length){streak=initial.some(id=>targets.includes(id))?0:streak+1;longest=Math.max(longest,streak);}}
   const preferTraining=strategy==='balanced'&&kind==='upgrade'&&upgrades%3===0;
   let used=0;
   if(!preferTraining&&targets.length&&!['gift','opening'].includes(kind))while(!r.choices.some(id=>targets.includes(id))&&r.rerolls>0&&used<2){if(!r.reroll())break;used++;rerolls++;}
   let eligible=preferTraining?r.choices.filter(id=>training.has(id)):[];if(!eligible.length)eligible=r.choices;
   const selected=kind==='gift'?gift:eligible.slice().sort((a,b)=>rank(r,b,targets)-rank(r,a,targets))[0];
   const opportunity=r.choices.some(id=>targets.includes(id));
   if(training.has(selected)){trainingChoices++;if(opportunity)skipped++;}
   const was=!!r.fruits[route.id];const offered=r.choices.slice();
   if(!r.choose(r.choices.indexOf(selected)))throw Error('Rejected normal choice '+selected);
   if(!was&&r.fruits[route.id])formedAt=+r.t.toFixed(2);
   if(fiveAt===null&&route.ids.every(id=>r.lv(id)>0))fiveAt=+r.t.toFixed(2);
   choices.push({t:+r.t.toFixed(2),kind,initial,offered,selected,rerolls:used,opportunity,targets});

   continue;
  }
  if(r.t>=nextMove){input=steer(r);nextMove=r.t+.25;}if(r.hasFruitActive?.()&&r.fruitActiveEnergy()>=100&&r.enemies.list().filter(e=>e.born<=0&&dist(e,r.p)<300).length>=3)r.castFruitActive();if(!r.cool.dash&&r.enemies.list().some(e=>e.born<=0&&dist(e,r.p)<65)){const len=Math.hypot(input.x||0,input.y||0);if(len){const q={x:r.p.x+input.x/len*140,y:r.p.y+input.y/len*140};if(q.x>70&&q.x<3130&&q.y>70&&q.y<2130&&!r.enemies.list().some(e=>e.born<=0&&dist(e,q)<35)&&!r.zones.list().some(z=>z.kind==='hazard'&&dist(z,q)<z.r+12))r.dash(input.x,input.y);}}r.step(.05,input);
 }
 const p=progress(r,route);runs.push({medicine:{dropped:r.telemetry.medicineDropped||0,picked:r.telemetry.medicinePicked||0,healed:r.telemetry.medicineHealing||0},gift,loop:r.loopSummary?.()||null,dashes:r.telemetry.dashes||0,route:route.id,item:item.id,seed,strategy,time:+r.t.toFixed(2),reason:r.result?.reason||'time limit',hp:+r.p.hp.toFixed(2),won:r.result?.reason==='破阵功成',formedAt,fiveAt,activeUses:r.telemetry.fruitActives||0,trainingChoices,routeOpportunitySkippedForTraining:skipped,longestFreshUpgradeWithoutProgressOpportunity:longest,rerollsUsed:rerolls,rerollsLeft:r.rerolls,upgrades,level:r.level,kills:r.kills,events:r.fieldHistory||[],eventChoices:r.fieldRewards||0,primary:r.primarySkill||null,missing:p.missing,needsMastery:!p.mastered,skills:r.skills,training:r.trainingSnapshot(),fruits:r.fruits,lastDamage:r.result?.lastDamage||[],choices});
 process.stderr.write(`${runs.length}/48 ${route.id} ${item.id} ${seed} ${strategy}: ${r.t.toFixed(1)}s fruit=${formedAt} ${r.result?.reason||'limit'}\n`);
}
console.log(JSON.stringify({root,method:'Input-only deterministic simulation, not browser or human E2E. Natural opening/offers/XP/HP/time. Same avoidance policy as encounters-smoke. Seek nearest medicine below 65% HP using same danger avoidance; Gift whale/cloud; default casting priority; safe dash when near enemies; max 2 rerolls per decision with no target, except every third ordinary upgrade in balanced chooses training if available. Route targets prefer missing skills, then highest rank toward mastery only where fruitProgress exists. Initial-offer drought counts ordinary upgrade screens before rerolls while targets remain. Deaths retained.',limit,runs},null,2));
