'use strict';
const path=require('path'),assert=require('node:assert/strict');
const root=process.env.XJ_GAME_ROOT||path.resolve(__dirname,'..');
const {Run,ITEMS,SKILLS,TRAINING,dist,FieldEvent}=require(path.join(root,'scripts/field-event.js'));
const fourOnly=false;
const policy=process.env.XJ_POLICY||'baseline';
const seeds=(process.env.XJ_SEEDS||'42,907').split(',').map(Number);
const daos=(process.env.XJ_DAOS||'mingyang,lushui,lihuo,duijin').split(',');
const runs=[],limit=800, rainAware=process.env.XJ_RAIN_AWARE==='1';
function instrument(r){
 r.audit={damageByPhase:{},hurtBySource:{},healing:0,zoneSeconds:{},occupiedSeconds:{},peakEnemies:0};
 let phase='other';
 for(const name of ['autoAttack','itemUse','updateSkills','updateZones','updateAllies','updateBullets']){const fn=r[name];r[name]=function(...args){const prev=phase;phase=name;try{return fn.apply(this,args);}finally{phase=prev;}};}
 const hit=r.hit;r.hit=function(e,...args){const hp=e.hp,live=e.active&&e.born<=0;const out=hit.call(this,e,...args);if(live){const n=Math.max(0,hp-e.hp);this.audit.damageByPhase[phase]=(this.audit.damageByPhase[phase]||0)+n;}return out;};
 const hurt=r.hurt;r.hurt=function(n,ground,source){const hp=this.p.hp;const out=hurt.call(this,n,ground,source);const amount=hp-this.p.hp;if(amount>0){const key=source?.kind||(ground?'ground':this.enemySource?.kind||'contact');this.audit.hurtBySource[key]=(this.audit.hurtBySource[key]||0)+amount;}return out;};
 const heal=r.heal;r.heal=function(...args){const hp=this.p.hp;const out=heal.apply(this,args);this.audit.healing+=Math.max(0,this.p.hp-hp);return out;};
 const step=r.step;r.step=function(dt,input){const t=this.t;step.call(this,dt,input);if(t===this.t)return;this.audit.peakEnemies=Math.max(this.audit.peakEnemies,this.enemies.count);for(const z of this.zones.list()){if(z.kind==='hazard')continue;this.audit.zoneSeconds[z.kind]=(this.audit.zoneSeconds[z.kind]||0)+dt;if(this.enemies.list().some(e=>e.born<=0&&dist(e,z)<z.r))this.audit.occupiedSeconds[z.kind]=(this.audit.occupiedSeconds[z.kind]||0)+dt;}};
}
function steer(r){let target=r.drops.list().sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0]||{x:1600,y:1100};const field=r.fieldEvent;if(FieldEvent.live(field)&&(policy==='baseline'||r.p.hp>r.maxHP*.8&&['cache','chase'].includes(field.kind)))target=r.enemies.list().filter(e=>e.fieldGuard&&e.fieldEventId===field.id).sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0]||field;if(r.p.hp<r.maxHP*.65){const bag=(r.medicineBags||[]).slice().sort((a,b)=>dist(a,r.p)-dist(b,r.p))[0];if(bag)target=bag;}let best={score:-Infinity};for(let i=-1;i<16;i++){const a=i*Math.PI/8,x=i<0?0:Math.cos(a),y=i<0?0:Math.sin(a),q={x:r.p.x+x*65,y:r.p.y+y*65};let score=-dist(q,target)*.11;if((rainAware||policy==='adapted')&&r.dao==='lushui'){const rain=r.zones.list().find(z=>z.kind==='rain'&&z.age<z.life-1);if(rain){const d=dist(q,rain);score-=Math.max(0,d-rain.r*.75)*.18;}}if(policy==='adapted'){
 const area=r.zones.list().find(z=>['fireNet','fireMarch','metalCourt'].includes(z.kind)&&z.life-z.age>1);
 if(area)score-=Math.max(0,dist(q,area)-area.r*.65)*.18;
 if(r.dao==='lihuo'&&r.lv('dali')===3&&r.cool.daliStride>0){const e=r.nearest(q,300);if(e)score-=Math.max(0,dist(q,e)-95)*.09;}
 for(const b of r.bullets.list()){if(!b.enemy)continue;const next={x:b.x+b.vx*.25,y:b.y+b.vy*.25},d=dist(q,next);if(d<55)score-=(55-d)*.9;}
 }
 if(q.x<130||q.x>3070||q.y<130||q.y>2070)score-=200;for(const e of r.enemies.list()){const d=dist(e,q);if(d<105)score-=(105-d)*.65;if(e.phase==='warn'&&[1,6,7,12].includes(e.type)){const dx=q.x-e.x,dy=q.y-e.y;if(dx*e.ax+dy*e.ay>0&&Math.abs(dx*e.ay-dy*e.ax)<40)score-=80;}}for(const z of r.zones.list())if(z.kind==='hazard'&&dist(z,q)<z.r+12)score-=100;if(score>best.score)best={score,x,y};}return best;}
for(const dao of daos)for(const item of ITEMS.filter(x=>x.id!=='screen'&&(!process.env.XJ_ITEMS||process.env.XJ_ITEMS.split(',').includes(x.id))))for(const seed of seeds){
 const r=new Run(seed,item.id,'standard');r.opening();instrument(r);let input={},nextMove=0,maxSkills=0;const decisions=[];
 while(r.t<limit&&r.state!=='ended'){
  if(r.state==='choice'){
   assert(r.choices.length>0,'no valid growth choices');
   const rank=id=>{if(fourOnly&&r.masteredCount()>=4&&r.lv(id)===2)return -1000;if(r.choiceKind==='opening')return id===((process.env.XJ_STARTER||({mingyang:'gate',lushui:'rain',lihuo:'dali',duijin:'metalEdge'})[dao]))?1000:0;if(r.choiceKind==='gift')return id==='whale'?100:0;
    if(policy==='adapted'){
 if(id==='recovery'&&r.trainingLv(id)<3)return 90;
 if(id==='vigor'&&r.p.hp<r.maxHP*.75)return 100;
 if(id==='weapon'&&r.trainingLv(id)<2&&r.masteredCount()>0)return 75;
 }
 if(id==='vigor')return r.p.hp<r.maxHP*.65?80:8;
    if(id==='recovery')return r.trainingLv(id)<2?22:8;
    if(id==='weapon')return 20;
    if(id==='power')return 14;
    if(id==='heal')return r.p.hp<r.maxHP*.5?90:1;
    const s=SKILLS.find(s=>s.id===id);if(!s)return 8;
    return (r.lv(id)?45:0)+({dali:26,metalEdge:26,fireNet:24,metalCourt:24,rain:26,gate:25,light:24,gold:23,thunder:20,flame:18,armor:16,body:14,dew:13,spring:12}[id]||10);
   };
   const selected=r.choices.slice().sort((a,b)=>rank(b)-rank(a))[0];decisions.push({at:r.t,kind:r.choiceKind,offered:r.choices.slice(),selected});
   assert(r.choose(r.choices.indexOf(selected)));maxSkills=Math.max(maxSkills,Object.keys(r.skills).length);continue;
  }
  if(r.t>=nextMove){input=steer(r);nextMove=r.t+.25;}
  if(!r.cool.dash&&r.enemies.list().some(e=>e.born<=0&&dist(e,r.p)<65)){
   const len=Math.hypot(input.x||0,input.y||0);if(len){const q={x:r.p.x+input.x/len*140,y:r.p.y+input.y/len*140};if(q.x>70&&q.x<3130&&q.y>70&&q.y<2130&&!r.enemies.list().some(e=>e.born<=0&&dist(e,q)<35)&&!r.zones.list().some(z=>z.kind==='hazard'&&dist(z,q)<z.r+12))r.dash(input.x,input.y);}
  }
  r.step(.05,input);
 }
 runs.push({dao,realm:r.realm,realmHistory:r.realmHistory,item:item.id,seed,time:+r.t.toFixed(1),reason:r.result?.reason||'time limit',kills:r.kills,level:r.level,maxSkills,skills:r.skills,training:r.trainingSnapshot(),fruits:r.fruits,damageTaken:r.damageTaken,healed:r.healed,casts:r.skillCasts||{},manaWait:r.loopSummary().manaWait,damageLog:r.damageLog,metrics:r.audit,decisions});
 process.stderr.write(dao+' '+item.id+' '+seed+': '+r.t.toFixed(1)+'s '+(r.result?.reason||'limit')+' skills='+maxSkills+'\n');
}
assert(runs.every(r=>r.maxSkills<=5&&Object.keys(r.fruits).length===0));
console.log(JSON.stringify({policy,seeds,rainAware,fourOnly,method:'Input-only deterministic simulation, Selected routes, weapons and seeds. Metrics observe actual HP changes without mutating combat state. Natural health, experience, offers, enemy timing. No injected progression. Not browser or human E2E.',root,runs},null,2));
