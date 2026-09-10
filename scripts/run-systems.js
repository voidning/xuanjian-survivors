/* Run policies: candidate fairness and automatic casting. Effects stay in content.js. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./dao-data.js'):root.XJ;
const {Run,SKILLS,RECIPES,dist}=X;
const costs=Object.freeze({fireNet:26,fireMarch:24,metalCourt:24,metalBlades:28,metalEdge:22,zhiming:30,dali:26,fragrance:24,angler:26,peril:28,spring:22,muddle:20,conceal:18,dew:22,gate:26,edict:14,dusk:20,light:26,pure:18,mountain:24,thunder:28,armor:20,flame:18,rain:22,grove:24});
const active=Object.keys(costs).filter(id=>SKILLS.some(s=>s.id===id));
X.Rules=Object.freeze({costs,rarity:Object.freeze({S:.35,A:.7,B:1}),pityMisses:3,finalAt:675,finalHP:4800,finalCarryCap:2400,version:'0.10.2'});
// Standard challenge has a fixed time-based budget; never scales from player power.
const balance=Object.freeze({version:'0.10.2',normalPlateauAt:360,specialEarly:8,specialMid:14,specialLate:20,threat:Object.freeze([0,1,2,3,3,3,6,1,4,3,2,3,1]),eliteExtra:3});
X.Balance=balance;
Run.prototype.enemyHealthFactor=function(type,elite){const time=this.mode==='standard'&&type!==6&&!elite?Math.min(this.t,balance.normalPlateauAt):this.t;return 1+Math.min(3,time/300)+Math.max(0,time-900)/1200;};
Run.prototype.enemyThreat=function(type,elite=false){return (balance.threat[type]||0)+(elite?balance.eliteExtra:0);};
Run.prototype.threatBudget=function(){return this.t<180?balance.specialEarly:this.t<360?balance.specialMid:balance.specialLate;};
Run.prototype.canSpawnThreat=function(type,elite=false){if(this.mode!=='standard'||type===6)return true;const cost=this.enemyThreat(type,elite);if(!cost)return true;let used=0;this.enemies.forEach(e=>used+=this.enemyThreat(e.type,e.elite));return used+cost<=this.threatBudget();};
Run.prototype.enemyDamageMultiplier=function(e,ignore=false){if(ignore)return 1;return Math.min(e.shield&&!(e.exposed>0)&&!(e.rainBroken>0)?.4:1,e.type===5?.6:1);};

Run.prototype.finalRules=function(){return X.Rules;};
Run.prototype.skillCost=function(id){return costs[id]||0;};
const baseValid=Run.prototype.valid;
Run.prototype.valid=function(){const pool=baseValid.call(this).filter(id=>this.item!=='screen'||!['gold','spring'].includes(id));for(const id of ['heal','mana','ward'])if(pool.length<3&&!pool.includes(id))pool.push(id);return pool;};
Run.prototype.choiceFit=function(id,gift=false){
 if(gift&&id==='firegift')return this.lv('flame')?{tone:'good',text:'已有雉离行 · 吐焰转向更灵活'}:{tone:'caution',text:'尚未学雉离行 · 当前无战斗收益，之后需另行学会'};
 if(!gift&&this.item==='screen'&&id==='spring')return {tone:'caution',text:'持屏无伤害普攻 · 助击无法生效，不进入候选'};
 if(!gift&&this.item==='screen'&&id==='gold')return {tone:'caution',text:'持屏无伤害普攻 · 锐气与破护无法生效'};
 if(!gift&&this.item==='screen'&&id==='edict')return {tone:'caution',text:'持屏不触发普攻追加打击；有谒天门时可召回甲兵'};
 return null;
};
Run.prototype.canPrimary=function(id){return this.lv(id)>0&&active.includes(id)&&id!==this.manualSkill&&!(this.item==='screen'&&id==='spring');};
Run.prototype.setPrimary=function(id){if(!['running','paused','choice'].includes(this.state)||(id!==null&&!this.canPrimary(id)))return false;this.primarySkill=id;this.primaryConfigured=true;return true;};
const baseManual=Run.prototype.setManual;
Run.prototype.setManual=function(id){const changed=baseManual.call(this,id);if(changed&&id!==null&&id===this.primarySkill)this.primarySkill=null;return changed;};
// Rarity gates discovery, not investment in a learned skill. Pity keeps a reserved slot.
Run.prototype.skillOfferWeight=function(id){const s=SKILLS.find(s=>s.id===id);if(!s)return .8;if(this.lv(id))return 1.25;const r=RECIPES.find(r=>r.ids.includes(id));return (X.Rules.rarity[s.grade]||1)*(r&&r.ids.some(x=>this.lv(x))?1.45:1);};
Run.prototype.offer=function(dao=null,previous=[]){
 let pool=this.valid();if(dao){const chosen=pool.filter(id=>SKILLS.find(s=>s.id===id)?.dao===dao);if(chosen.length>=3)pool=chosen;}
 // Ordinary upgrades expose one cultivation option without displacing two available skills.
 const isSkill=id=>SKILLS.some(s=>s.id===id),skillPool=pool.filter(isSkill),trainingPool=pool.filter(id=>!isSkill(id));
 const cultivation=this.choiceKind!=='event'&&this.choiceKind!=='opening'&&trainingPool.length>0&&this.level>=2;
 if(this.choiceKind==='event'&&skillPool.length>=3)pool=skillPool;
 const weight=id=>this.skillOfferWeight(id);
 const draw=items=>{let n=this.random()*items.reduce((sum,id)=>sum+weight(id),0);for(const id of items){n-=weight(id);if(n<0)return id;}return items[items.length-1];};
 // Every growth offer reserves one available learned skill for refinement.
 const out=[],learned=skillPool.filter(id=>this.lv(id)>0);
 if(learned.length){const fresh=learned.filter(id=>!previous.includes(id));out.push(draw(fresh.length?fresh:learned));}
 if(cultivation){const fresh=trainingPool.filter(id=>!previous.includes(id));out.push(draw(fresh.length?fresh:trainingPool));}
 while(out.length<3){const needSkills=Math.min(2,skillPool.length),remaining=pool.filter(id=>!out.includes(id)&&(!(cultivation&&out.filter(isSkill).length<needSkills)||isSkill(id)));if(!remaining.length)break;const fresh=remaining.filter(id=>!previous.includes(id));out.push(draw(fresh.length?fresh:remaining));}
 return cultivation?[...out.filter(isSkill),...out.filter(id=>!isSkill(id))]:out;
};
Run.prototype.openChoice=function(kind='upgrade',dao=null){this.state='choice';this.choiceKind=kind;this.choiceDao=dao;this.choices=kind==='gift'?X.GIFTS.filter(s=>s.id!=='firegift'||this.lv('flame')||SKILLS.filter(k=>this.lv(k.id)).length<this.skillLimit).map(s=>s.id):this.offer(dao);if(['upgrade','event'].includes(kind)){this.offerMisses??={};for(const r of RECIPES){const missing=this.fruitProgress(r.id).targets;if(!r.ids.some(id=>this.lv(id))||!missing.length)this.offerMisses[r.id]=0;else this.offerMisses[r.id]=this.choices.some(id=>missing.includes(id))?0:(this.offerMisses[r.id]||0)+1;}}};
Run.prototype.reroll=function(){if(this.state!=='choice'||['gift','opening'].includes(this.choiceKind)||this.rerolls<=0)return false;this.choices=this.offer(this.choiceDao,this.choices);this.rerolls--;return true;};
Run.prototype.skillBlock=function(id,nearest){const p=this.p;if(this.item==='screen'&&id==='spring')return '持屏无普攻 · 助击停用';if(!this.lv(id))return '尚未修习';if(this.cool[id]>0)return '冷却 '+this.cool[id].toFixed(1)+'s';
 if(!nearest&&!['dew','angler','peril'].includes(id))return '等待目标';
 if(['angler','peril'].includes(id)&&!this.nearest(p,430))return '目标不在范围';
 if(id==='zhiming'&&!this.nearest(p,280))return '等待灰焰近敌';
 if(id==='dali'&&!this.nearest(p,70+this.lv(id)*15))return '等待心火近敌';
 if(id==='fragrance'&&!this.nearest(p,430))return '目标不在范围';
 if(id==='spring'&&this.cool.springPower>0&&this.springCharges>0)return '泉势尚有余击';
 if(id==='conceal'&&!this.nearest(p,230))return '尚无近身威胁';
 if(id==='dew'&&!(p.slow>0)&&!this.zones.list().some(z=>z.kind==='hazard'&&dist(z,p)<z.r+60))return '暂无地面威胁';
 if(id==='gate'&&this.allies.count>=Math.min(8,this.lv(id)+1+(this.lv(id)===3?2:0)))return '甲兵已足';
 if(id==='thunder'&&!this.nearest(p,175))return '等待近敌';
 if(id==='light'&&!this.nearest(p,195+this.lv(id)*25)&&!this.allies.count)return '等待敌情';
 if(id==='flame'&&!this.nearest(p,155+this.lv(id)*20))return '目标不在焰幅';
 if(id==='armor'&&p.armor>12&&p.armorTime>1)return '金胄仍有效';
 if(['zhiming','dali','fragrance','edict','dusk','rain','flame','angler','peril'].includes(id)){if(this.zones.count>=this.zones.max)return '法域已满';if(this.zones.list().some(z=>z.kind===id&&z.life-z.age>.25))return '法域仍有效';}
 return '';
};
Run.prototype.skillOrder=function(nearest,manual=false){this.skillWait??={};if(!manual)this.skillBudget=null;const candidates=[];
 for(const id of active){if(manual?id!==this.manualSkill:id===this.manualSkill)continue;if(this.skillBlock(id,nearest)){delete this.skillWait[id];continue;}this.skillWait[id]??=this.t;candidates.push(id);}
 const score=id=>{const urgent=id==='dew'||(id==='conceal'&&this.p.hp<this.maxHP*.45)||(id==='armor'&&this.p.hp<this.maxHP*.45);return (urgent?100:0)+(id===this.primarySkill?30:0)+this.lv(id)*1.5+Math.min(12,this.t-this.skillWait[id])+(id==='peril'&&this.zones.list().some(z=>z.kind==='angler')?2:0);};
 return candidates.sort((a,b)=>score(b)-score(a)||active.indexOf(a)-active.indexOf(b));
};
Run.prototype.castManual=function(){if(this.state!=='running'||!this.manualSkill)return false;const id=this.manualSkill,nearest=this.nearest(this.p,500),reason=this.skillBlock(id,nearest);if(reason){this.notice(SKILLS.find(s=>s.id===id).name+' · '+reason);return false;}if(this.p.mp<this.skillCost(id)){this.notice('法力不足 · 还差 '+Math.ceil(this.skillCost(id)-this.p.mp));return false;}const before=this.cool[id]||0;this.updateSkills(0,nearest,true);return (this.cool[id]||0)>before;};
// The first learned damage source is protected by default; opting into balanced/manual stays explicit.
const damageStarters=new Set(['gate','light','rain','flame','thunder','zhiming','dali','fragrance','fireNet','fireMarch','metalCourt','metalBlades','metalEdge']);
Run.prototype.loopLog=function(){return this.coreLoop??={decisions:[],samples:[],routes:{},manaWait:0,lastManaWaitAt:-Infinity,formedAt:{}};};
Run.prototype.loopSummary=function(){const d=this.loopLog();return JSON.parse(JSON.stringify(d));};
Run.prototype.reserveSkill=function(id){return id===this.primarySkill||id==='dew'||(['conceal','armor'].includes(id)&&this.p.hp<this.maxHP*.45)||this.t-(this.skillWait?.[id]??this.t)>=1;};
const chooseBeforeLoop=Run.prototype.choose;
Run.prototype.choose=function(index){
 const id=this.choices[index],kind=this.choiceKind,at=this.t,offered=this.choices.slice(),before={...this.fruits};
 const routes=RECIPES.filter(r=>!this.fruits[r.id]&&r.ids.some(x=>this.lv(x))).map(r=>({id:r.id,targets:this.fruitProgress(r.id).targets}));
 const ok=chooseBeforeLoop.call(this,index);if(!ok)return false;
 if(!this.primaryConfigured&&!this.primarySkill&&damageStarters.has(id)&&this.canPrimary(id))this.primarySkill=id;
 const d=this.loopLog();d.decisions.push({at,kind,id,offered,level:this.level,kills:this.kills,xp:this.xpPicked,primary:this.primarySkill||null,casts:{...this.skillCasts}});if(d.decisions.length>96)d.decisions.shift();
 if(['upgrade','event'].includes(kind))for(const r of routes){const m=d.routes[r.id]??={opportunities:0,trainingDeferrals:0,otherDeferrals:0,offersWithoutTarget:0,dry:0,longestDry:0};const opportunity=offered.some(x=>r.targets.includes(x));if(opportunity){m.opportunities++;m.dry=0;if(!r.targets.includes(id)){if(X.TRAINING.some(x=>x.id===id))m.trainingDeferrals++;else m.otherDeferrals++;}}else{m.offersWithoutTarget++;m.dry++;m.longestDry=Math.max(m.longestDry,m.dry);}}
 for(const r of RECIPES)if(this.fruits[r.id]&&!before[r.id])d.formedAt[r.id]=at;
 return true;
};
const stepBeforeLoop=Run.prototype.step;
Run.prototype.step=function(dt,input){const before=this.t;stepBeforeLoop.call(this,dt,input);if(this.t===before)return;const d=this.loopLog(),last=d.samples.at(-1);if(!last||this.t-last.at>=15){d.samples.push({at:this.t,kills:this.kills,xp:this.xpPicked,hp:this.p.hp,mp:this.p.mp,level:this.level,wait:d.manaWait,casts:{...this.skillCasts}});if(d.samples.length>80)d.samples.shift();}};
const endBeforeLoop=Run.prototype.end;
Run.prototype.end=function(reason){if(this.state==='ended')return;this.loopLog();endBeforeLoop.call(this,reason);this.result.loop=this.loopSummary();};
if(typeof module!=='undefined')module.exports=X;
})(typeof window!=='undefined'?window:globalThis);
