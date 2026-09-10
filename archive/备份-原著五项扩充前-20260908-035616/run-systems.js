/* Run policies: candidate fairness and automatic casting. Effects stay in content.js. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./engine.js'):root.XJ;
const {Run,SKILLS,RECIPES,dist}=X;
const costs=Object.freeze({angler:26,peril:28,spring:22,muddle:20,conceal:18,dew:22,gate:26,edict:14,dusk:20,light:26,pure:18,mountain:24,thunder:28,armor:20,flame:18,rain:22,grove:24});
const active=Object.keys(costs).filter(id=>SKILLS.some(s=>s.id===id));
X.Rules=Object.freeze({costs,pityMisses:3,finalHP:4800,finalCarryCap:2400,version:'0.10.2'});
// Standard challenge has a fixed time-based budget; never scales from player power.
const balance=Object.freeze({version:'0.10.2',normalPlateauAt:360,specialEarly:8,specialMid:14,specialLate:20,threat:Object.freeze([0,1,2,3,3,3,6,1,4,3,2,3,1]),eliteExtra:3});
X.Balance=balance;
Run.prototype.enemyHealthFactor=function(type,elite){const time=this.mode==='standard'&&type!==6&&!elite?Math.min(this.t,balance.normalPlateauAt):this.t;return 1+Math.min(3,time/300)+Math.max(0,time-900)/1200;};
Run.prototype.enemyThreat=function(type,elite=false){return (balance.threat[type]||0)+(elite?balance.eliteExtra:0);};
Run.prototype.threatBudget=function(){return this.t<180?balance.specialEarly:this.t<360?balance.specialMid:balance.specialLate;};
Run.prototype.canSpawnThreat=function(type,elite=false){if(this.mode!=='standard'||type===6)return true;const cost=this.enemyThreat(type,elite);if(!cost)return true;let used=0;this.enemies.forEach(e=>used+=this.enemyThreat(e.type,e.elite));return used+cost<=this.threatBudget();};
Run.prototype.enemyDamageMultiplier=function(e,ignore=false){if(ignore)return 1;return Math.min(e.shield&&!(e.exposed>0)?.4:1,e.type===5?.6:1);};

Run.prototype.finalRules=function(){return X.Rules;};
Run.prototype.skillCost=function(id){return costs[id]||0;};
Run.prototype.offer=function(dao=null,previous=[]){
 let pool=this.valid();if(dao){const chosen=pool.filter(id=>SKILLS.find(s=>s.id===id)?.dao===dao);if(chosen.length>=3)pool=chosen;}
 const weight=id=>{if(!SKILLS.some(s=>s.id===id))return .8;const r=RECIPES.find(r=>r.ids.includes(id));return this.lv(id)?1.25:r&&r.ids.some(x=>this.lv(x))?1.45:1;};
 const draw=items=>{let n=this.random()*items.reduce((sum,id)=>sum+weight(id),0);for(const id of items){n-=weight(id);if(n<0)return id;}return items[items.length-1];};
 const out=[],routes=RECIPES.filter(r=>r.ids.some(id=>this.lv(id))&&r.ids.some(id=>!this.lv(id)&&pool.includes(id))).sort((a,b)=>(this.offerMisses?.[b.id]||0)-(this.offerMisses?.[a.id]||0)||b.ids.filter(id=>this.lv(id)).length-a.ids.filter(id=>this.lv(id)).length);
 const route=routes.find(r=>(this.offerMisses?.[r.id]||0)>=X.Rules.pityMisses);
 if(route){const missing=route.ids.filter(id=>!this.lv(id)&&pool.includes(id)),fresh=missing.filter(id=>!previous.includes(id));out.push(draw(fresh.length?fresh:missing));}
 while(out.length<3){const remaining=pool.filter(id=>!out.includes(id));if(!remaining.length)break;const fresh=remaining.filter(id=>!previous.includes(id));out.push(draw(fresh.length?fresh:remaining));}
 return out;
};
Run.prototype.openChoice=function(kind='upgrade',dao=null){this.state='choice';this.choiceKind=kind;this.choiceDao=dao;this.choices=kind==='gift'?X.GIFTS.map(s=>s.id):this.offer(dao);if(['upgrade','event'].includes(kind)){this.offerMisses??={};for(const r of RECIPES){const missing=r.ids.filter(id=>!this.lv(id));if(!r.ids.some(id=>this.lv(id))||!missing.length)this.offerMisses[r.id]=0;else this.offerMisses[r.id]=this.choices.some(id=>missing.includes(id))?0:(this.offerMisses[r.id]||0)+1;}}};
Run.prototype.reroll=function(){if(this.state!=='choice'||['gift','opening'].includes(this.choiceKind)||this.rerolls<=0)return false;this.choices=this.offer(this.choiceDao,this.choices);this.rerolls--;return true;};
Run.prototype.skillBlock=function(id,nearest){const p=this.p;if(!this.lv(id))return '尚未修习';if(this.cool[id]>0)return '冷却 '+this.cool[id].toFixed(1)+'s';
 if(!nearest&&!['dew','angler','peril'].includes(id))return '等待目标';
 if(['angler','peril'].includes(id)&&!this.nearest(p,430))return '目标不在范围';
 if(id==='spring'&&this.cool.springPower>0&&this.springCharges>0)return '泉势尚有余击';
 if(id==='conceal'&&!this.nearest(p,230))return '尚无近身威胁';
 if(id==='dew'&&!(p.slow>0)&&!this.zones.list().some(z=>z.kind==='hazard'&&dist(z,p)<z.r+60))return '暂无地面威胁';
 if(id==='gate'&&this.allies.count>=Math.min(8,this.lv(id)+1+(this.fruit?2:0)))return '甲兵已足';
 if(id==='thunder'&&!this.nearest(p,175))return '等待近敌';
 if(id==='light'&&!this.nearest(p,195+this.lv(id)*25)&&!this.allies.count)return '等待敌情';
 if(id==='flame'&&!this.nearest(p,155+this.lv(id)*20))return '目标不在焰幅';
 if(id==='armor'&&p.armor>12&&p.armorTime>1)return '金胄仍有效';
 if(['edict','dusk','rain','flame','angler','peril'].includes(id)){if(this.zones.count>=this.zones.max)return '法域已满';if(this.zones.list().some(z=>z.kind===id&&z.life-z.age>.25))return '法域仍有效';}
 return '';
};
Run.prototype.skillOrder=function(nearest,manual=false){this.skillWait??={};this.skillBudget=null;const candidates=[];
 for(const id of active){if(manual?id!==this.manualSkill:id===this.manualSkill)continue;if(this.skillBlock(id,nearest)){delete this.skillWait[id];continue;}this.skillWait[id]??=this.t;candidates.push(id);}
 const score=id=>{const urgent=id==='dew'||(id==='conceal'&&this.p.hp<this.maxHP*.45)||(id==='armor'&&this.p.hp<this.maxHP*.45);return (urgent?100:0)+this.lv(id)*1.5+Math.min(12,this.t-this.skillWait[id])+(id==='peril'&&this.zones.list().some(z=>z.kind==='angler')?2:0);};
 return candidates.sort((a,b)=>score(b)-score(a)||active.indexOf(a)-active.indexOf(b));
};
Run.prototype.castManual=function(){if(this.state!=='running'||!this.manualSkill)return false;const id=this.manualSkill,nearest=this.nearest(this.p,500),reason=this.skillBlock(id,nearest);if(reason){this.notice(SKILLS.find(s=>s.id===id).name+' · '+reason);return false;}if(this.p.mp<this.skillCost(id)){this.notice('法力不足 · 还差 '+Math.ceil(this.skillCost(id)-this.p.mp));return false;}const before=this.cool[id]||0;this.updateSkills(0,nearest,true);return (this.cool[id]||0)>before;};
if(typeof module!=='undefined')module.exports=X;
})(typeof window!=='undefined'?window:globalThis);
