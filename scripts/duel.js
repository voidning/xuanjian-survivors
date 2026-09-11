/* Chapter-grounded opponent; encounter, geometry and timing are game adaptations. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./gift-system.js'):root.XJ;
const {Run,dist,clamp,W,H}=X;
X.Duel=Object.freeze({id:'yehui',name:'邺桧',
 story:'白邺都仙道真人，修都卫。此处取他与李家因玄岳局势交锋的时期；山场相逢为改编斗法，击退不代表原著陨落。',
 chapter:'季越人《玄鉴仙族》：《都仙事》（部分目录第715章）、《一符一箓》（第757章）、《飞举山落》（第906章）；章号或有差异，以章名为准。',
 guide:'东羽山：离开白山下的橙色落点。南惆水：沿紫色鱼潮射线侧移；天下明、彩彻云衢可按现有规则消解鱼潮飞弹。半血后两法交替更紧，收势时靠近反击。所有道统均可用走位避开，不要求指定神通。',
 boundary:'只取白气飞山镇压、紫水人首鱼及两法配合。定点落山、扇形鱼潮、伤害、半血转段与施法空档是游戏抽象；不实现西天塬、太虚封锁、雷火符箓，不把灵器能力归给神通。',
 at:360,hp:2100,phaseAt:.5,formations:Object.freeze([{id:'crossfire',name:'远射夹阵',types:[2,0,9,0]},{id:'screened',name:'护持逼近',types:[4,0,1,0]}])});
X.FoundationDuel=Object.freeze({id:'yumuxian',name:'郁慕仙',
 story:'元乌峰修士，筑基后期，修金销洞仙基。取其与李家冲突时期的成套法器斗法；山中拦路是游戏遭遇，不复刻洞天围杀或改变原著结局。',
 chapter:'季越人《玄鉴仙族》：第467章《交战（上）》、第468章《交战（下）》、第469章《剑斩》；章号或有差异，以章名为准。',
 guide:'筑基修为达到5级、尚未成就神通时可能遇见，替代本局三分钟首领位。持续攻击打破六面法盾，趁收势追击；八枚菱形法器从两侧交叉射来，预警锁定后移出金色射线。半血以金莲护身，再次破防可反击。战中突破不受限制。',
 boundary:'金销洞是体内蕴养法器的仙基，不是紫府神通。六面法盾、八枚菱形法器、金莲护身取自原文；护盾耐久、交叉弹道、半血转段及收势是游戏抽象。未实现翠勾动法、止戈、另一件灵器或符箓疗伤，不把六面法盾命名为六石云盘。',
 level:5,hp:560,shield:120,lotus:96,phaseAt:.5});
X.Duels=Object.freeze([X.FoundationDuel,X.Duel]);
Run.prototype.duelDefinition=function(e){return X.Duels.find(d=>d.id===(typeof e==='string'?e:e?.duelId))||null;};
Run.prototype.duelEnemy=function(){return this.enemies.list().find(e=>this.duelDefinition(e)&&!e.final)||null;};
Run.prototype.updateFoundationDuel=function(){
 if(this.state!=='running'||this.foundationDuelSeen||this.level<X.FoundationDuel.level||!this.dao||this.masteredCount()||this.t>=180||this.enemies.list().some(e=>e.boss))return;
 const e=this.spawn(6);if(!e?.boss)return;
 this.foundationDuelSeen=true;this.bossAt=Math.max(this.bossAt,360);
 e.duelId=X.FoundationDuel.id;e.title='郁慕仙 · 筑基后期';e.hp=e.max=X.FoundationDuel.hp;e.duelShield=X.FoundationDuel.shield;e.duelPhase=1;e.duelTurn=0;e.cd=3;e.speed=48;e.duelCast=null;
 this.duelHistory??=[];e.duelRecord=this.duelHistory.length;this.duelHistory.push({id:e.duelId,at:this.t,defeatedAt:null,phase:1});
 this.fx.forEach(f=>{if(f.kind==='bossArrival'&&f.x===e.x&&f.y===e.y)f.title='郁慕仙 · 金销藏器';});
 this.notice('郁慕仙拦路 · 六盾护身，破盾后追击');
};
Run.prototype.prepareDuel=function(e){
 if(!e||!e.boss||this.duelSeen||this.t<X.Duel.at||this.mode==='standard'&&this.t>=this.finalRules().finalAt||!this.masteredCount())return;
 this.duelSeen=true;e.duelId=X.Duel.id;e.title='邺桧 · 都卫斗法';e.hp=e.max=X.Duel.hp;e.duelPhase=1;e.duelTurn=0;e.cd=2.5;e.speed=42;e.duelCast=null;
 this.duelHistory??=[];this.duelHistory.push({id:X.Duel.id,at:this.t,defeatedAt:null,phase:1});
 this.duelRecord=this.duelHistory.length-1;e.duelRecord=this.duelRecord;
 this.fx.forEach(f=>{if(f.kind==='bossArrival'&&f.x===e.x&&f.y===e.y)f.title='邺桧 · 白山紫水';});
 this.notice('邺桧入场 · 白山紫水拦路，留意落点与鱼潮');
};
Run.prototype.duelStatus=function(e=this.duelEnemy(),compact=false){
 if(!e)return '';
 if(e.duelId===X.FoundationDuel.id){const guard=e.duelShield>0?(e.duelPhase===2?'金莲':'六盾')+' '+Math.ceil(e.duelShield):'护身已破';
  return guard+' · '+(e.phase==='warn'?(compact?'金梭·侧移':'八枚金梭 · 移出金线'):e.recover>0?'收势·追击':'换位');
 }
 if(compact)return (e.duelPhase===2?'合势·':'')+(e.phase==='warn'?(e.duelCast==='mountain'?'东羽山·避圈':'南惆水·侧移'):e.recover>0?'收势·反击':'换位');
 const prefix=e.duelPhase===2?'合势':'试锋';
 return prefix+' · '+(e.phase==='warn'?(e.duelCast==='mountain'?'东羽山 · 离开橙圈':'南惆水 · 侧移避鱼潮'):e.recover>0?'收势 · 可近身反击':'换位');
};
// Replaces two midgame packs, retaining the standard threat budget and pool caps.
const pack=Run.prototype.spawnPack;
Run.prototype.spawnPack=function(){
 const boss=this.duelEnemy();
 if(boss){this.spawnTimer=5;if(boss.phase!=='warn'&&this.enemies.count<28){this.spawn(0);this.spawn(0);}return;}
 this.duelFormations??=[];
 const slot=this.t>=325?1:this.t>=300?0:-1;
 if(slot>=0&&this.t<360&&!this.duelFormations.includes(slot)&&this.battlePhase!=='喘息拾取'){
  const f=X.Duel.formations[slot];
  if(this.enemies.max-this.enemies.count<f.types.length){this.spawnTimer=1;return;}
  const angle=Math.atan2(this.p.vy,this.p.vx),radius=Math.max(460,Math.min(720,Math.hypot(this.viewport.w,this.viewport.h)/2+40));
  f.types.forEach((type,i)=>{const a=angle+(i-(f.types.length-1)/2)*.28;const x=clamp(this.p.x+Math.cos(a)*radius,80,W-80),y=clamp(this.p.y+Math.sin(a)*radius,80,H-80);const q=dist({x,y},this.p)<300?this.spawn(type):this.spawn(type,false,x,y);if(q){q.duelFormation=f.id;q.title=f.name+' · '+q.title;}});
  this.duelFormations.push(slot);this.spawnTimer=4;this.notice(f.name+' · '+(slot?'绕开冲锋，靠近护持者破阵':'先看符区留隙，再侧移避远射'));return;
 }
 pack.call(this);
};
Run.prototype.startDuelCast=function(e,kind){
 if(e.duelId===X.FoundationDuel.id){
  e.duelCast='spindles';e.phase='warn';e.timer=1.5;
  const aim=this.cool.hidden>0&&this.lastSeen?this.lastSeen:this.p,d=dist(aim,e)||1,a=Math.atan2(aim.y-e.y,aim.x-e.x);
  e.ax=(aim.x-e.x)/d;e.ay=(aim.y-e.y)/d;e.duelShots=[];
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const x=e.x-e.ay*side*65,y=e.y+e.ax*side*65,angle=a-side*.18+(i-1.5)*.12;
   e.duelShots.push({x,y,ax:Math.cos(angle),ay:Math.sin(angle)});
  }
  this.telemetry.duelCasts??={};this.telemetry.duelCasts.spindles=(this.telemetry.duelCasts.spindles||0)+1;return;
 }
 e.duelCast=kind;e.phase='warn';e.timer=kind==='mountain'?1.45:1.25;
 const aim=this.cool.hidden>0&&this.lastSeen?this.lastSeen:this.p,d=dist(aim,e)||1;
 e.ax=(aim.x-e.x)/d;e.ay=(aim.y-e.y)/d;
 e.duelTargets=kind==='mountain'?[{x:clamp(aim.x,100,W-100),y:clamp(aim.y,100,H-100),r:72}]:[];
 this.telemetry.duelCasts??={};this.telemetry.duelCasts[kind]=(this.telemetry.duelCasts[kind]||0)+1;
};
Run.prototype.updateDuelEnemy=function(e,dt){
 if(!e.duelId||e.final)return false;
 if(e.duelId===X.FoundationDuel.id)return this.updateFoundationEnemy(e,dt);
 if(e.duelPhase===1&&e.hp<=e.max*X.Duel.phaseAt){
  e.duelPhase=2;e.phase='move';e.duelCast=null;e.duelTargets=[];e.recover=2;e.cd=2;
  const record=this.duelHistory?.[e.duelRecord];if(record)record.phase=2;
  this.notice('邺桧合势 · 白山紫水交替，收势时反击');return true;
 }
 if(e.phase==='warn'){
  e.timer-=dt;
  if(e.timer<=0){
   if(e.duelCast==='mountain'){
    for(const q of e.duelTargets||[]){const z=this.zones.add({kind:'hazard',x:q.x,y:q.y,r:q.r,warn:0,life:1.25,age:0,tick:0,duelId:e.id,duelArt:'mountain',source:{name:'邺桧 · 东羽山',kind:'ground'}});if(z)this.telemetry.hazards++;}
   }else{
    const count=e.duelPhase===2?5:3;
    for(let i=0;i<count;i++){const a=Math.atan2(e.ay,e.ax)+(i-(count-1)/2)*.3;
     const b=this.shoot(e.x,e.y,e.x+Math.cos(a),e.y+Math.sin(a),14,true,0,205,2.7,'duelFish');
     if(b){b.duelId=e.id;b.source={name:'邺桧 · 南惆水',kind:'projectile'};this.telemetry.enemyShots++;}
    }
   }
   e.duelTurn++;e.phase='move';e.duelCast=null;e.duelTargets=[];e.recover=e.duelPhase===2?1.25:1.8;e.cd=e.recover+(e.duelPhase===2?.8:1.2);
  }
  return true;
 }
 const aim=this.cool.hidden>0&&this.lastSeen?this.lastSeen:this.p,d=dist(e,aim)||1;
 if(e.cd<=0&&d<620&&!(this.cool.hidden>0)){this.startDuelCast(e,e.duelTurn%2===0?'mountain':'water');return true;}
 // Approach only: close-range weapons can reach the caster; no endless kiting.
 if(d>100){const speed=e.speed*(e.slow>0?.35:1);e.x=clamp(e.x+(aim.x-e.x)/d*speed*dt,65,W-65);e.y=clamp(e.y+(aim.y-e.y)/d*speed*dt,65,H-65);}
 if(dist(e,this.p)<e.r+14&&e.contact<=0){this.hurt(16,false,{name:'邺桧 · 近身',kind:'contact'});e.contact=.8;}
 return true;
};
Run.prototype.updateFoundationEnemy=function(e,dt){
 if(e.duelPhase===1&&e.hp<=e.max*X.FoundationDuel.phaseAt){
  this.clearDuelSpells(e);e.duelPhase=2;e.duelShield=X.FoundationDuel.lotus;e.phase='move';e.recover=2;e.cd=2;
  const record=this.duelHistory?.[e.duelRecord];if(record)record.phase=2;
  this.notice('郁慕仙结莲护身 · 破开金莲，再寻攻势');return true;
 }
 if(e.phase==='warn'){
  e.timer-=dt;if(e.timer<=0){
   for(const q of e.duelShots||[]){const b=this.shoot(q.x,q.y,q.x+q.ax,q.y+q.ay,9,true,0,e.duelPhase===2?205:185,2.6,'duelSpindle');
    if(b){b.duelId=e.id;b.source={name:'郁慕仙 · 菱形法器',kind:'projectile'};this.telemetry.enemyShots++;}
   }
   e.duelTurn++;e.phase='move';e.duelCast=null;e.duelShots=[];e.recover=e.duelPhase===2?1.8:2.3;e.cd=e.recover+1.5;
  }return true;
 }
 const aim=this.cool.hidden>0&&this.lastSeen?this.lastSeen:this.p,d=dist(e,aim)||1;
 if(e.cd<=0&&d<560&&!(this.cool.hidden>0)){this.startDuelCast(e,'spindles');return true;}
 if(d>100){const speed=e.speed*(e.slow>0?.35:1);e.x=clamp(e.x+(aim.x-e.x)/d*speed*dt,65,W-65);e.y=clamp(e.y+(aim.y-e.y)/d*speed*dt,65,H-65);}
 if(dist(e,this.p)<e.r+14&&e.contact<=0){this.hurt(11,false,{name:'郁慕仙 · 近身',kind:'contact'});e.contact=.8;}
 return true;
};
Run.prototype.clearDuelSpells=function(e){this.bullets.forEach(b=>{if(b.duelId===e.id)this.bullets.remove(b);});this.zones.forEach(z=>{if(z.duelId===e.id)this.zones.remove(z);});e.duelTargets=[];e.duelShots=[];e.duelCast=null;};
Run.prototype.retireDuel=function(){const e=this.duelEnemy();if(!e)return;this.clearDuelSpells(e);this.enemies.remove(e);this.notice(this.duelDefinition(e).name+'收法退去 · 终阵将开');};
const hit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore){const alive=e.active&&e.born<=0,definition=this.duelDefinition(e),isDuel=!!definition;
 if(alive&&e.duelId===X.FoundationDuel.id&&e.duelShield>0){
  const damage=n*this.power*this.enemyDamageMultiplier(e,ignore),absorbed=Math.min(e.duelShield,Math.max(0,damage));
  if(absorbed>0){e.duelShield-=absorbed;n*=1-absorbed/damage;
   if(!e.duelShieldAt||this.t>=e.duelShieldAt){this.effect('growthLocal',e.x,e.y-45,16,.55,{text:e.duelPhase===2?'金莲抵挡':'法盾抵挡'});e.duelShieldAt=this.t+.5;}
   if(e.duelShield<=0){this.clearDuelSpells(e);e.phase='move';e.recover=2.5;e.cd=2.5;this.notice('郁慕仙护身已破 · 趁收势追击');}
  }
 }
 hit.call(this,e,n,ignore);
 if(alive&&isDuel&&!e.active){this.clearDuelSpells(e);const record=this.duelHistory?.[e.duelRecord];if(record)record.defeatedAt=this.t;
  this.fx.forEach(f=>{if(f.kind==='bossDefeat'&&f.x===e.x&&f.y===e.y)f.title=definition.name+'退去';});
  this.notice(definition.name+'已退 · 重抽 +2，斗法见闻已记下');
 }
};
const end=Run.prototype.end;
Run.prototype.end=function(reason){if(this.state==='ended')return;end.call(this,reason);this.result.duelHistory=(this.duelHistory||[]).map(r=>({...r}));};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
