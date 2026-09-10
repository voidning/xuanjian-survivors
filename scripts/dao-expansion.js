/* Two same-dao paths. Rank gates remain in cultivation.js. */
(function(root){'use strict';const X=typeof module!=='undefined'?require('./cultivation.js'):root.XJ;const {Run,dist}=X;
const active=['fireNet','fireMarch','metalCourt','metalBlades','metalEdge'];
Run.prototype.isPassive=function(id){return ['body','gold',...X.DaoExpansion.passives].includes(id);};
const manual=Run.prototype.setManual;
Run.prototype.setManual=function(id){if(id&&this.isPassive(id))return false;return manual.call(this,id);};
const block=Run.prototype.skillBlock;
Run.prototype.skillBlock=function(id,nearest){
 if(this.isPassive(id)&&this.lv(id)===3)return '被动生效';
 const reason=block.call(this,id,nearest);if(reason)return reason;
 if(active.includes(id)){
  if(!this.nearest(this.p,id==='metalEdge'?420:460))return '等待范围内目标';
  if(id!=='metalEdge'&&(this.zones.count>=this.zones.max||this.zones.list().some(z=>z.kind===id)))return '法域仍有效';
 }
 return '';
};
Run.prototype.castDaoPower=function(id,nearest){if(!active.includes(id))return false;
 const target=this.cluster(id==='metalEdge'?420:460,id==='metalBlades'?95:170)||nearest;
 if(id==='metalEdge'){
  const a=Math.atan2(target.y-this.p.y,target.x-this.p.x),ux=Math.cos(a),uy=Math.sin(a);
  this.enemies.list().forEach(e=>{const dx=e.x-this.p.x,dy=e.y-this.p.y,d=dx*ux+dy*uy;if(e.born<=0&&d>=0&&d<=420&&Math.abs(dx*uy-dy*ux)<=28+e.r)this.hit(e,86);});
  this.effect('metalEdge',this.p.x,this.p.y,420,.5,{angle:a});this.cool[id]=7;return true;
 }
 const spec={fireNet:[170,5,10],fireMarch:[175,5,9],metalCourt:[180,5,10],metalBlades:[95,1.4,8]}[id];
 this.zones.add({kind:id,x:target.x,y:target.y,r:spec[0],life:spec[1],age:0,tick:0,next:id==='metalBlades'?.35:0,pulses:0,extended:0});this.cool[id]=spec[2];return true;
};
const zones=Run.prototype.updateZones;
Run.prototype.updateZones=function(dt){
 this.zones.list().forEach(z=>{
  if(!active.includes(z.kind)||z.kind==='metalEdge')return;
  const elapsed=z.age+dt;
  if(z.kind==='fireNet'){
   z.dwell??=new Map();this.enemies.forEach(e=>{if(e.born<=0&&dist(e,z)<z.r){const stay=(z.dwell.get(e.id)||0)+dt;z.dwell.set(e.id,stay);if(stay>=.5)e.slow=Math.max(e.slow||0,.18);if(stay>=1.5)e.root=Math.max(e.root||0,Math.min(.3,dt*1.3)*(e.boss?.25:e.elite?.5:1));}else z.dwell.delete(e.id);});
   if(elapsed>=z.life&&!z.closed){z.closed=true;this.area(z.x,z.y,z.r,70,0,false);this.effect('fireNetClose',z.x,z.y,z.r,.6);}
  }else{
   const interval=z.kind==='fireMarch'?1:z.kind==='metalBlades'?.25:.5,damage=z.kind==='fireMarch'?28:z.kind==='metalBlades'?24:18;
   while(z.next<Math.min(elapsed,z.life)&&!(z.kind==='metalBlades'&&z.pulses>=4)){
    z.next+=interval;z.pulses++;
    this.enemies.list().forEach(e=>{if(e.born<=0&&dist(e,z)<z.r){if(z.kind==='metalCourt')e.slow=Math.max(e.slow||0,.55);this.hit(e,damage);}});
   }
  }
 });zones.call(this,dt);
};
const hit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore=false){const alive=e.active;hit.call(this,e,n,ignore);if(!alive||e.active)return;this.zones.forEach(z=>{if(z.kind==='fireMarch'&&z.extended<2&&dist(e,z)<z.r){const extra=Math.min(.35,2-z.extended);z.extended+=extra;z.life+=extra;}});};
// Stage effects are game adaptations. All procs have independent cooldowns.
Object.assign(X.FoundationGrowth,{
 dali:['近敌引起一簇心火，范围65、伤害10；5法力 / 5秒','范围65→85、伤害10→15；冷却5→4.5秒'],
 fireNet:['近敌脚下离网：伤害6、束缚0.35秒；5法力 / 6秒','伤害6→9、束缚0.35→0.6秒；范围45→65'],
 fireMarch:['击杀后4秒内，下一次普攻提前0.15秒；不耗法力 / 5秒','提前0.15→0.25秒；冷却5→4秒'],
 liMandate:['命中时凝回2法力；法力未满才触发 / 6秒','凝回2→3法力；冷却6→5秒'],
 fireWhole:['命中积累3次引发余焰，附伤6；不耗法力 / 5秒','附伤6→10；冷却5→4秒'],
 metalEdge:['向近敌发出短锋，长180、宽24、伤害12；5法力 / 5秒','长度180→260、宽24→32、伤害12→18'],
 metalCourt:['近敌脚下锋隙，范围50，伤害6并迟缓0.4秒；5法力 / 6秒','范围50→75、伤害6→10、迟缓0.4→0.7秒'],
 metalBlades:['两道锋刃汇击近敌，合计伤害12；5法力 / 5秒','两刃→四刃，合计伤害12→20'],
 metalHeart:['标出260范围内蓄势敌人；普攻瞄准该威胁时提前0.1秒 / 6秒','感知260→380；普攻提前0.1→0.16秒'],
 metalTrust:['离开近敌蓄势处60距离且1.5秒未受伤：下次普攻提前0.2秒 / 8秒','普攻提前0.2→0.3秒；冷却8→6秒']
});
const ready=(r,id,cd)=>{if(!r.lv(id)||(r.cool['dao_'+id]||0)>0)return false;r.cool['dao_'+id]=cd;return true;};
Run.prototype.daoLine=function(target,length,width,damage){const angle=Math.atan2(target.y-this.p.y,target.x-this.p.x),ux=Math.cos(angle),uy=Math.sin(angle);this.enemies.list().forEach(e=>{const dx=e.x-this.p.x,dy=e.y-this.p.y,d=dx*ux+dy*uy;if(e.born<=0&&d>=0&&d<=length&&Math.abs(dx*uy-dy*ux)<width/2+e.r)this.hit(e,damage);});this.effect('metalEdge',this.p.x,this.p.y,length,.4,{angle});};
const stageHit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore){const hp=e.hp,alive=e.active;stageHit.call(this,e,n,ignore);if(this.state!=='running'||!alive||!(e.hp<hp)||this.daoEcho)return;
 const m=this.lv('liMandate');if(m&&(this.p.mp<this.maxMP||m===3&&!this.daoManaReserve)&&ready(this,'liMandate',7-m)){const gain=Math.min(this.maxMP-this.p.mp,[0,2,3,6][m]);this.p.mp+=gain;if(m===3&&gain===0)this.daoManaReserve=6;this.growthSignal('liMandate',this.p,gain?'定火 +'+gain+'法力':'定火 · 储法6');}
 const f=this.lv('fireWhole');if(f&&(this.cool.dao_fireWhole||0)<=0){this.daoEmbers=(this.daoEmbers||0)+1;if(this.daoEmbers>=3){this.daoEmbers=0;ready(this,'fireWhole',6-f);this.daoEcho=true;try{if(f===3)this.area(e.x,e.y,85,20,0,false);else if(e.active)stageHit.call(this,e,f===1?6:10,false);}finally{this.daoEcho=false;}this.effect('daoEmber',e.x,e.y,f===3?85:18,.5,{rank:f});this.growthSignal('fireWhole',e,'余焰');}}
 const march=this.lv('fireMarch');if(march&&march<3&&!e.active&&ready(this,'fireMarch',6-march)){this.daoAdvance={amount:march===1?.15:.25,until:this.t+4};this.growthSignal('fireMarch',this.p,'得胜 · 下击提前');}
};
Run.prototype.sensedEnemy=function(){const rank=this.lv('metalHeart');if(!rank)return null;const es=this.enemies.list().filter(e=>e.born<=0&&dist(e,this.p)<[0,260,380,600][rank]).sort((a,b)=>dist(a,this.p)-dist(b,this.p));return es.find(e=>e.phase==='warn')||(rank===3?es.find(e=>e.elite||e.boss)||es[0]:null)||null;};
const spend=Run.prototype.spend;
Run.prototype.spend=function(n){const ok=spend.call(this,n);if(ok&&n>0&&this.daoManaReserve){const gain=Math.min(n,this.daoManaReserve);this.p.mp=Math.min(this.maxMP,this.p.mp+gain);this.daoManaReserve=0;this.growthSignal('liMandate',this.p,'储法返还 +'+gain);}return ok;};
const attack=Run.prototype.autoAttack;
Run.prototype.autoAttack=function(target){const sensed=this.sensedEnemy();if(this.lv('metalHeart')===3&&sensed&&dist(sensed,this.p)<(this.item==='dasheng'?200:this.item==='spear'?235:this.item==='bow'?510:this.item==='thunderseal'?420+this.weaponTraining*45:375)+this.precision*12)target=sensed;attack.call(this,target);
 if(target===sensed&&ready(this,'metalHeart',6)){this.cool.attack=Math.max(.08,this.cool.attack-[0,.1,.16,.24][this.lv('metalHeart')]);this.growthSignal('metalHeart',target,'辨势');}
 if(this.daoAdvance){if(this.daoAdvance.until>=this.t){this.cool.attack=Math.max(.08,this.cool.attack-this.daoAdvance.amount);this.effect('daoEmber',this.p.x,this.p.y,22,.35);}this.daoAdvance=null;}
 if(this.daoCounter){if(this.daoCounter.until>=this.t){this.cool.attack=Math.max(.08,this.cool.attack-this.daoCounter.amount);this.growthSignal('metalTrust',this.p,'应势');}if(--this.daoCounter.hits<=0||this.daoCounter.until<this.t)this.daoCounter=null;}
};
const stageUpdate=Run.prototype.updateSkills;
Run.prototype.updateSkills=function(dt,nearest,manual=false){stageUpdate.call(this,dt,nearest,manual);if(manual||this.state!=='running')return;
 const target=this.nearest(this.p,260),resist=e=>e.boss?.25:e.elite?.5:1;
 if(target){for(const id of ['dali','fireNet','metalEdge','metalCourt','metalBlades']){const l=this.lv(id);if(!l||l===3)continue;if(id==='dali'&&dist(target,this.p)>110||id==='metalEdge'&&l===1&&dist(target,this.p)>180)continue;if(!this.growthReady(id,5,id==='dali'?(l===1?5:4.5):['fireNet','metalCourt'].includes(id)?6:5))continue;
  if(id==='metalEdge')this.daoLine(target,l===1?180:260,l===1?24:32,l===1?12:18);
  if(id==='dali'){this.area(target.x,target.y,l===1?65:85,l===1?10:15,0,false);this.effect('daoEmber',target.x,target.y,l===1?65:85,.5,{rank:l});}
  if(['fireNet','metalCourt'].includes(id)){const radius=id==='fireNet'?(l===1?45:65):(l===1?50:75);this.enemies.list().forEach(e=>{if(e.born<=0&&dist(e,target)<radius){this.hit(e,l===1?6:id==='fireNet'?9:10);if(id==='fireNet')e.root=Math.max(e.root||0,(l===1?.35:.6)*resist(e));else e.slow=Math.max(e.slow||0,l===1?.4:.7);}});this.effect('daoMark',target.x,target.y,radius,.5,{id,rank:l});}
  if(id==='metalBlades'){this.hit(target,l===1?12:20);this.effect('daoBlades',target.x,target.y,35,.45,{rank:l});}
  this.growthSignal(id,target,id==='dali'?'心火':id==='fireNet'?'离网':id==='metalCourt'?'锋隙':id==='metalBlades'?'汇击':'短锋');
 }}
 const trust=this.lv('metalTrust');if(trust){if(!this.daoEvade&&(this.cool.dao_metalTrust||0)<=0){const e=this.enemies.list().find(e=>e.phase==='warn'&&e.born<=0&&dist(e,this.p)<220);if(e)this.daoEvade={e,at:this.t,x:this.p.x,y:this.p.y,damage:this.damageTaken};}
 if(this.daoEvade&&this.t-this.daoEvade.at>=1.5){const w=this.daoEvade;this.daoEvade=null;if(w.e.active&&w.e.phase!=='warn'&&this.damageTaken===w.damage&&dist(w,this.p)>=60&&ready(this,'metalTrust',10-2*trust)){this.daoCounter={amount:[0,.2,.3,.4][trust],until:this.t+4,hits:trust===3?2:1};this.growthSignal('metalTrust',this.p,'脱势 · 下击提前');}}}
};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
