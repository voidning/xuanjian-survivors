/* Optional mountain encounters: game scenarios, never new canonical abilities. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./dasheng.js'):root.XJ;
const {Run,dist}=X;
const sites=Object.freeze([{id:'pine',name:'松亭',x:1250,y:1100},{id:'stele',name:'残碑',x:1840,y:940},{id:'creek',name:'溪岸',x:1650,y:1515}]);
const kinds=Object.freeze({
 trial:{name:'山场试阵',task:'靠近迎战，击败三名旗记守卫',reward:'重抽 +1',duration:50,radius:180,goal:3},
 cache:{name:'散落行囊',task:'圈内连续停留 2 秒，离圈重新计时',reward:'参悟选择 ×1',duration:35,radius:48,goal:2},
 hold:{name:'据地御敌',task:'圈内累计守住 10 秒，离圈保留进度',reward:'参悟选择 ×1 · 重抽 +1',duration:50,radius:100,goal:10},
 chase:{name:'截下携物敌修',task:'靠近惊动携物敌修，限时追击旗记目标',reward:'参悟选择 ×1 · 经验 +8',duration:45,radius:180,goal:1}
});
// Four former timed insights become four optional encounters, not extra stacked rewards.
const schedule=Object.freeze([{at:50,kind:'cache'},{at:90,kind:'trial'},{at:240,kind:'hold'},{at:425,kind:'chase'},{at:610,kind:'cache'}]);
const live=e=>e&&['available','active'].includes(e.status);
const info=e=>kinds[e?.kind||'trial'];
const snapshot=e=>({site:e.site,kind:e.kind||'trial',status:e.status,kills:e.kills||0,progress:e.progress||0,at:e.at||90});
X.FieldEvent=Object.freeze({sites,kinds,schedule,startsAt:90,duration:50,triggerRadius:180,reward:1,live,info});
Run.prototype.closeFieldEvent=function(status){
 const e=this.fieldEvent;if(!live(e))return false;e.status=status;
 this.fieldHistory??=[];this.fieldHistory.push(snapshot(e));if(this.fieldHistory.length>48)this.fieldHistory.shift();
 this.enemies.forEach(q=>{if(q.fieldEventId===e.id)q.fieldCourier=false;});return true;
};
Run.prototype.completeFieldEvent=function(){
 const e=this.fieldEvent;if(!live(e)||this.state!=='running'||this.t>=e.deadline||(e.progress||0)<info(e).goal)return false;
 this.closeFieldEvent('completed');const kind=e.kind||'trial';
 if(kind==='trial'||kind==='hold')this.rerolls++;
 if(kind!=='trial'){this.pending.push({dao:null,source:kind});this.fieldRewards=(this.fieldRewards||0)+1;}
 if(kind==='chase')this.getXP(8);
 this.notice(info(e).name+'完成 · '+info(e).reward);
 return true;
};
Run.prototype.beginFieldEvent=function(kind,at,id){
 if(live(this.fieldEvent)||!kinds[kind])return false;
 const ordered=sites.map((_,i)=>sites[(i+this.seed%sites.length+id)%sites.length]);
 const options=ordered.filter(s=>dist(s,this.p)>=320);
 const site=(options.length?options:ordered).slice().sort((a,b)=>dist(a,this.p)-dist(b,this.p))[0];
 this.fieldEvent={id,kind,site:site.id,name:site.name,x:site.x,y:site.y,at,status:'available',deadline:at+kinds[kind].duration,kills:0,progress:0,spawnIn:2.5};
 this.notice(kinds[kind].name+' · '+site.name+'有异动');return true;
};
Run.prototype.updateFieldEvent=function(dt=0){
 if(this.state!=='running')return;
 if(this.mode==='standard'&&this.finalStarted){if(live(this.fieldEvent))this.closeFieldEvent('expired');return;}
 if(live(this.fieldEvent)&&this.t>=this.fieldEvent.deadline){this.closeFieldEvent('expired');this.notice('机缘时限已过 · 未扣资源，已惊动敌人仍在场');}
 if(!live(this.fieldEvent)){
  this.fieldSeen??=[];
  const windows=schedule.map((s,i)=>({...s,id:i}));
  if(this.mode==='endless'&&this.t>=780){const n=Math.floor((this.t-780)/185);windows.push({at:780+n*185,kind:['hold','chase','cache'][(n+this.seed)%3],id:5+n});}
  const slot=windows.find(s=>this.t>=s.at&&this.t<s.at+kinds[s.kind].duration&&!this.fieldSeen.includes(s.id));
  if(!slot)return;this.fieldSeen.push(slot.id);this.beginFieldEvent(slot.kind,slot.at,slot.id);
 }
 const e=this.fieldEvent,def=info(e),d=dist(this.p,e);
 if(e.kind==='cache'){
  e.status=d<def.radius?'active':'available';e.progress=d<def.radius?Math.min(def.goal,e.progress+dt):0;
  if(e.progress>=def.goal)this.completeFieldEvent();
 }else if(e.kind==='hold'){
  if(d<def.radius)e.status='active';
  if(e.status==='active'){
   if(d<def.radius)e.progress=Math.min(def.goal,e.progress+dt);
   e.spawnIn-=dt;
   if(e.spawnIn<=0&&d<200){e.spawnIn=2.5;for(let i=0;i<2;i++){const a=(i*Math.PI)+this.t*.4;this.spawn(0,false,e.x+Math.cos(a)*225,e.y+Math.sin(a)*225);}}
   if(e.progress>=def.goal)this.completeFieldEvent();
  }
 }else if(e.status==='available'&&d<def.radius){
  const count=e.kind==='chase'?1:3;if(this.enemies.max-this.enemies.count<count)return;
  const spawned=[];
  for(let i=0;i<count;i++){const a=i*Math.PI*2/3,q=this.spawn(e.kind==='chase'?0:i,false,e.x+Math.cos(a)*70,e.y+Math.sin(a)*70);if(q){q.fieldGuard=true;q.fieldEventId=e.id;spawned.push(q);}}
  if(spawned.length!==count){for(const q of spawned)this.enemies.remove(q);return;}
  if(e.kind==='chase'){const q=spawned[0];q.fieldCourier=true;q.title='携物敌修';q.speed=105;q.hp=q.max=q.max*2;e.targetId=q.id;}
  e.status='active';this.notice(e.kind==='chase'?'携物敌修欲退 · 追击旗记目标':'守卫已惊动 · 击破三名旗记守卫');
 }
 if(e.kind==='chase'&&e.status==='active'){const q=this.enemies.list().find(q=>q.id===e.targetId);if(q){e.x=q.x;e.y=q.y;}}
};
Run.prototype.abandonFieldEvent=function(){
 if(!['running','paused'].includes(this.state)||!this.closeFieldEvent('abandoned'))return false;
 this.notice('已放弃机缘 · 未扣资源，已惊动敌人仍在场');return true;
};
const baseStep=Run.prototype.step;
Run.prototype.step=function(dt,input={}){
 const before=this.t;baseStep.call(this,dt,input);
 if(this.t!==before){this.updateFieldEvent(this.t-before);if(this.state==='running')this.nextChoice();}
};
const baseHit=Run.prototype.hit;
Run.prototype.hit=function(q,n,ignore=false){
 const wasAlive=q.active&&q.born<=0;baseHit.call(this,q,n,ignore);const e=this.fieldEvent;
 if(!wasAlive||q.active||!q.fieldGuard||!e||q.fieldEventId!==e.id||e.status!=='active'||this.state!=='running')return;
 if(this.t>=e.deadline){this.closeFieldEvent('expired');return;}
 if(!['trial','chase'].includes(e.kind||'trial'))return;
 e.kills++;e.progress=e.kills;if(e.kills>=info(e).goal)this.completeFieldEvent();
};
const baseEnd=Run.prototype.end;
Run.prototype.end=function(reason){
 if(this.state==='ended')return;baseEnd.call(this,reason);this.result.version='0.31.0';this.result.primarySkill=this.primarySkill||null;
 this.result.fieldEvent=this.fieldEvent?snapshot(this.fieldEvent):null;
 this.result.fieldHistory=[...(this.fieldHistory||[])];if(live(this.fieldEvent))this.result.fieldHistory.push(snapshot(this.fieldEvent));
};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
