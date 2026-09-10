/* Foundation incubation -> manifested powers. Numeric ranks/thresholds are game rules. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./medicine.js'):root.XJ;
const {Run,SKILLS,TRAINING}=X;
const routes=[{id:'mingyang',name:'明阳',ids:['gate','body','edict','dusk','light']},{id:'lushui',name:'渌水',ids:['spring','muddle','conceal','rain','dew']},{id:'lihuo',name:'离火',ids:['dali','fireNet','fireMarch','liMandate','fireWhole']},{id:'duijin',name:'兑金',ids:['metalEdge','metalCourt','metalBlades','metalHeart','metalTrust']}];
X.Cultivation=Object.freeze({version:'0.31.0',routes:routes.map(r=>Object.freeze({...r,ids:Object.freeze(r.ids)})),requirements:Object.freeze([7,11,15,20,24])});
Run.prototype.pathSkills=function(){const ids=routes.filter(r=>!this.dao||r.id===this.dao).flatMap(r=>r.ids);return ids.map(id=>SKILLS.find(s=>s.id===id));};
Run.prototype.masteredCount=function(){return this.pathSkills().filter(s=>this.lv(s.id)===3).length;};
Run.prototype.breakthroughNeed=function(){return X.Cultivation.requirements[Math.min(4,this.masteredCount())];};
Run.prototype.skillStage=function(id){const n=this.lv(id);return n===3?'神通':n===2?'仙基二重':n===1?'仙基一重':'未修';};
// Low-rank actions below are explicit game adaptations, not claimed novel stage facts.
const growth={
 gate:['落门镇敌：范围75，停顿0.6秒；8法力 / 9秒','范围75→95，停顿0.6→0.8秒；消耗不变'],
 body:['受击削去2伤害；不耗法力 / 5秒','削伤2→4；冷却5→4秒'],
 edict:['缚住一名近敌0.45秒；6法力 / 7秒','束缚0.45→0.8秒；仍为单体'],
 dusk:['受击后2秒返还至多2点本次战伤；不救致死；不耗法力 / 8秒','返还上限2→4；冷却8→7秒'],
 light:['拦下一枚近身敌弹；6法力 / 10秒','拦截距离75→95；冷却10→8秒；仍为一枚'],
 spring:['命中敌人且受伤时回复2气血；不耗法力 / 8秒','回复2→3；冷却8→7秒；不恢复寿元'],
 muddle:['近敌准备出手时打断一名，停顿0.35秒；6法力 / 8秒','停顿0.35→0.6秒；冷却8→7秒'],
 conceal:['近敌追击时隐去气息0.5秒，敌人追向旧位置；6法力 / 9秒','藏息0.5→0.9秒；不提供无敌'],
 rain:['一滴青雨击中一敌，伤害8；5法力 / 4秒','伤害8→12；冷却4→3.5秒；不形成雨域'],
 dew:['受击削去1伤害，地面伤害改削4；不耗法力 / 7秒','普通削伤1→2，地面削伤4→7；冷却7→6秒']
};
X.FoundationGrowth=growth;
Run.prototype.foundationGain=function(id,rank){return growth[id]?.[Math.min(1,Math.max(0,rank-1))]||'';};
Run.prototype.foundationDescription=function(id){return '一重：'+this.foundationGain(id,1)+'。二重：'+this.foundationGain(id,2)+'。低重机制为游戏改编；三重改用完整神通。';};
Run.prototype.growthSignal=function(id,target,text){this.telemetry.foundationTriggers??={};this.telemetry.foundationTriggers[id]=(this.telemetry.foundationTriggers[id]||0)+1;this.effect('growthLocal',target.x,target.y-28,16,.55,{text,id,rank:this.lv(id)});};
const low=(r,id)=>r.lv(id)>0&&r.lv(id)<3;
Run.prototype.growthReady=function(id,cost,cd){if(!low(this,id)||(this.cool['growth_'+id]||0)>0||this.p.mp<cost)return false;this.p.mp-=cost;this.cool['growth_'+id]=cd;return true;};
const oldHit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore){const before=e.hp,eligible=e.active&&e.born<=0;oldHit.call(this,e,n,ignore);if(eligible&&e.hp<before&&this.state==='running'&&this.p.hp<this.maxHP&&this.growthReady('spring',0,9-this.lv('spring'))){const amount=this.heal(1+this.lv('spring'));this.growthSignal('spring',this.p,'泉息 +'+amount);}};
const oldHurt=Run.prototype.hurt;
Run.prototype.hurt=function(n,ground=false,source=null){if(this.state!=='running'||this.victoryPending||this.p.inv>0||(ground&&(this.cool.cloud>0||this.cool.dewWard>0||this.p.guard>0)))return oldHurt.call(this,n,ground,source);
 if(this.growthReady('body',0,6-this.lv('body'))){const cut=Math.min(n,2*this.lv('body'));n-=cut;this.growthSignal('body',this.p,'抵挡 '+cut);}
 if(n>0&&this.growthReady('dew',0,8-this.lv('dew'))){const cut=Math.min(n,ground?1+3*this.lv('dew'):this.lv('dew'));n-=cut;this.growthSignal('dew',this.p,'洗伤 '+cut);}
 const hp=this.p.hp,result=oldHurt.call(this,n,ground,source),lost=hp-this.p.hp;
 if(lost>0&&this.p.hp>0&&this.state==='running'&&this.growthReady('dusk',0,9-this.lv('dusk'))){this.growthWound={amount:Math.min(lost,2*this.lv('dusk')),at:this.t+2};this.growthSignal('dusk',this.p,'记伤');}return result;};
const oldUpdate=Run.prototype.updateSkills;
Run.prototype.updateSkills=function(dt,nearest,manual=false){oldUpdate.call(this,dt,nearest,manual);if(manual||this.state!=='running')return;
 if(this.growthWound&&this.t>=this.growthWound.at){const w=this.growthWound;this.growthWound=null;const amount=this.heal(w.amount);if(amount>0)this.growthSignal('dusk',this.p,'返伤 +'+amount);}
 const target=this.nearest(this.p,260),resist=e=>e.boss?.25:e.elite?.5:1;
 if(target&&this.growthReady('edict',6,7)){target.root=Math.max(target.root||0,(this.lv('edict')===1?.45:.8)*resist(target));this.growthSignal('edict',target,'缚');}
 const poised=this.enemies.list().find(e=>e.born<=0&&X.dist(e,this.p)<180&&e.phase==='warn');
 if(poised&&this.growthReady('muddle',6,9-this.lv('muddle'))){poised.phase='move';poised.stun=Math.max(poised.stun||0,(this.lv('muddle')===1?.35:.6)*resist(poised));poised.cd=Math.max(poised.cd,.7);this.growthSignal('muddle',poised,'断势');}
 if(this.nearest(this.p,150)&&this.growthReady('conceal',6,9)){this.lastSeen={x:this.p.x,y:this.p.y};this.cool.hidden=this.lv('conceal')===1?.5:.9;this.growthSignal('conceal',this.p,'藏息');}
 if(target&&this.growthReady('rain',5,this.lv('rain')===1?4:3.5)){this.hit(target,this.lv('rain')===1?8:12);this.growthSignal('rain',target,'青雨');}
 const bullet=this.bullets.list().find(b=>b.enemy&&X.dist(b,this.p)<(this.lv('light')===1?75:95));
 if(bullet&&this.growthReady('light',6,this.lv('light')===1?10:8)){this.growthSignal('light',bullet,'消弹');this.bullets.remove(bullet);}
};
Run.prototype.canCultivate=function(id){return this.pathSkills().some(s=>s.id===id)&&this.lv(id)<3&&(this.lv(id)<2||this.level>=this.breakthroughNeed());};
Run.prototype.valid=function(){const a=this.pathSkills().filter(s=>this.canCultivate(s.id)).map(s=>s.id);if(this.level>=2||!a.length){for(const d of TRAINING)if(this.trainingLv(d.id)<d.max&&!(this.item==='screen'&&['haste','weapon'].includes(d.id)))a.push(d.id);}for(const id of ['heal','mana','ward'])if(a.length<3)a.push(id);return a;};
// Early stages have no falsely attributed full supernatural effects.
const block=Run.prototype.skillBlock;
Run.prototype.skillBlock=function(id,nearest){if(id!=='gate'&&this.lv(id)>0&&this.lv(id)<3)return '仙基局部作用 · '+this.foundationGain(id,this.lv(id));return block.call(this,id,nearest);};
const cost=Run.prototype.skillCost;
Run.prototype.skillCost=function(id){return id==='gate'&&this.lv(id)<3?8:cost.call(this,id);};
const primary=Run.prototype.canPrimary;
Run.prototype.canPrimary=function(id){return this.lv(id)===3&&primary.call(this,id);};
const manual=Run.prototype.setManual;
Run.prototype.setManual=function(id){if(id!==null&&this.lv(id)!==3)return false;return manual.call(this,id);};
Run.prototype.opening=function(){if(this.item==='screen'){this.state='ended';this.notice('此版筑基起步需要伤害普攻，重明洞玄屏暂未开放');return false;}this.state='choice';this.choiceKind='opening';this.choiceDao=null;this.choices=this.pathSkills().map(s=>s.id);return true;};
const offer=Run.prototype.offer;
Run.prototype.offer=function(dao=null,previous=[]){const choices=offer.call(this,null,previous);if(!this.masteredCount()&&this.foundationStarter&&this.canCultivate(this.foundationStarter)&&!choices.includes(this.foundationStarter)){const i=choices.findIndex(id=>SKILLS.some(s=>s.id===id));choices[i<0?0:i]=this.foundationStarter;}return choices;};
const open=Run.prototype.openChoice;
Run.prototype.openChoice=function(kind='upgrade',dao=null){open.call(this,kind,null);if(kind==='gift')this.choices=this.choices.filter(id=>id!=='firegift');};
Run.prototype.updateRealm=function(){const n=this.masteredCount(),name=n>=5?'五法圆满':n>=4?'大真人':n>=3?'紫府中期':n>=1?'紫府':'筑基';if(name===this.realm)return;this.realm=name;this.realmHistory??=[];this.realmHistory.push({realm:name,at:this.t,count:n});this.effect('realmRise',this.p.x,this.p.y,65,1.6,{title:name,dao:this.dao,count:n});this.notice(name+' · '+n+' 道神通成就');};
const choose=Run.prototype.choose;
Run.prototype.choose=function(i){const id=this.choices[i],kind=this.choiceKind,isSkill=SKILLS.some(s=>s.id===id);if(kind==='opening'&&(!isSkill||!this.canCultivate(id)))return false;
 const oldDao=this.dao;if(isSkill&&!this.dao)this.dao=routes.find(r=>r.ids.includes(id))?.id||null;
 const ok=choose.call(this,i);if(!ok){this.dao=oldDao;return false;}
 if(kind==='opening')this.foundationStarter=id;this.updateRealm();return true;
};
const end=Run.prototype.end;
Run.prototype.end=function(reason){if(this.state==='ended')return;end.call(this,reason);Object.assign(this.result,{dao:this.dao,realm:this.realm,masteredCount:this.masteredCount(),realmHistory:(this.realmHistory||[]).map(x=>({...x})),version:'0.31.0'});};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
