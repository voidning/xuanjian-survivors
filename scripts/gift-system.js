/* 季越人《玄鉴仙族》。章节依据与战斗数值分列；每人一箓。 */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./dasheng.js'):root.XJ;
const {Run,dist}=X;
const additions=[
 {id:'might',name:'力贯千钧',tier:'灰箓',category:'兵器',role:'强弓重击',desc:'剑、弓、枪、戟的普通攻击基础伤害提高 30%，亦强化穿云箭与戟的实体重扫；不增幅术法与附加法术。',fact:'气血与体魄强大，可凭肉身碎石、驾驭更强的弓。',source:'季越人《玄鉴仙族》：求箓、旦夕之祸',boundary:'30% 为游戏数值；不把千钧之力解释为全部法术增伤。'},
 {id:'omen',name:'避死延生',tier:'灰箓',category:'生存',role:'知险避祸',desc:'脚边显示一个迫近飞弹、冲锋或地面险区的方向；提示按紧迫程度更新，需自行走位。',fact:'李项平能察知临近祸患与死兆，仍有避无可避之时。',source:'季越人《玄鉴仙族》：避死延生、避无可避',boundary:'本作取已核实的危险感知；不提供复活、自动闪避或无敌。'},
 {id:'rainbow',name:'彩彻云衢',tier:'白箓',category:'术法',role:'行法解术',desc:'主动术法成功施放后，开启 0.8 秒解术窗口，化去身边 90 范围内最多 2 枚敌方飞弹；每 6 秒可触发一次。',fact:'保全心力、振奋心神，较容易化解他人法术；久修能增益法术。',source:'季越人《玄鉴仙族》：余地、彩彻云衢',boundary:'范围、数量与冷却是战斗抽象；不消除首领阵地，不将多年修行直接换成暴涨修为。'},
 {id:'frostpine',name:'明霜松岭',tier:'白箓',category:'生存',role:'忍痛守心',desc:'受创时保持身形稳定；地面法区造成的受创迟滞由 1.2 秒缩短到 0.45 秒。伤害照常承受，钩索拖拽不受影响。',fact:'李曦峻运转此箓，排除疼痛与情绪的干扰，继续近身斗法。',source:'季越人《玄鉴仙族》：得手、侠义（上）',boundary:'减轻受创迟滞是痛苦控制的战斗抽象；不是抗火、减伤、免控或冰雪攻击。'},
 {id:'greed',name:'贪罟玄离',tier:'青箓',category:'离火',role:'性命感应 · 心火',desc:'南明心火成就三重后可受：心火伤害提高 30%，心火击杀每秒至多额外获得 1 点参悟经验。',fact:'感应性命、夺取他灵；他人性命只能辅助修行，不能化为自己的性命；可增益大离书南明心火。',source:'季越人《玄鉴仙族》：贪罟玄离（2）',boundary:'只实现已核实的心火增益与助修；不吸血、不即死、不增加寿数，不凭空授予玄擭法或灵物。'}
];
const baseMeta={
 whale:['白箓','法力','法力深厚、回复充裕。','收获镜面'],
 life:['白箓','爆发','消耗性命换取法力与短时战力。','收获镜面'],
 sparrow:['灰箓','游走','行气灵巧、见血悍勇、气血加持，善斗法驾风。','杀妖受箓'],
 sunseal:['青箓','成长','现有强敌击杀收益保留；名称及完整原著边界持续复核。','现有版本考据'],
 cloud:['白箓','游走','修行精进、操纵云雾与飞行。','杀妖受箓']
};
for(const d of X.GIFTS){const m=baseMeta[d.id];if(m)Object.assign(d,{tier:m[0],category:m[1],fact:m[2],source:'季越人《玄鉴仙族》：'+m[3],boundary:'数值与持续时间为局内战斗抽象。'});}
Object.assign(X.GIFTS.find(d=>d.id==='sparrow'),{role:'见血悍勇 · 腾挪',desc:'常态移速 +6%；自身受伤或对 150 范围内敌人造成有效伤害，激发 5 秒悍勇：移速 +20%、伤害 +25%。每 8 秒至多触发一次。'});
for(const d of additions)X.GIFTS.push(d);
const retained=['whale','life','sparrow','rainbow','frostpine','greed'];
const historical=X.GIFTS.filter(d=>d.id!=='firegift');
const definitions=historical.filter(d=>retained.includes(d.id));
function available(run,d){if(typeof d==='string')d=definitions.find(x=>x.id===d);if(!d||d.pending||!retained.includes(d.id))return false;if(d.id==='might')return ['sword','bow','spear','dasheng'].includes(run.item);if(d.id==='greed')return run.dao==='lihuo'&&run.lv('dali')===3;return true;}
X.GiftSystem={definitions,entries:definitions,get:id=>historical.find(d=>d.id===id),available,summary(run){if(!run.gift)return '尚未受箓 · 每局一箓';const d=this.get(run.gift);return d?d.name+' · '+d.desc:'';},stats(run){return {...(run.giftStats||{})};}};
Run.prototype.deferGift=function(){if(this.state!=='choice'||this.choiceKind!=='gift'||this.gift)return false;this.choices=[];this.choiceKind=null;this.giftPending=false;this.state='running';this.p.inv=Math.max(this.p.inv,.65);this.notice('暂缓受箓 · 下次击败精英或首领时再选');this.nextChoice();return true;};
Run.prototype.giftPulse=function(id,x=this.p.x,y=this.p.y){this.effect('giftPulse',x,y,30,.45,{gift:id});};
Run.prototype.giftCount=function(key,n=1){this.giftStats??={};this.giftStats[key]=(this.giftStats[key]||0)+n;};
Run.prototype.weaponGiftScale=function(){return this.gift==='might'?1.3:1;};
Run.prototype.heartfireGiftDamage=function(e,n){const live=e.active&&e.born<=0;this.hit(e,n*(this.gift==='greed'?1.3:1));if(this.gift==='greed'&&live&&!e.active&&!(this.cool.greedHarvest>0)){this.cool.greedHarvest=1;this.getXP(1);this.giftCount('心火助修');this.giftPulse('greed',e.x,e.y);}};
const open=Run.prototype.openChoice;
Run.prototype.openChoice=function(kind='upgrade',dao=null){open.call(this,kind,dao);if(kind==='gift')this.choices=definitions.filter(d=>available(this,d)).map(d=>d.id);};
const choose=Run.prototype.choose;
Run.prototype.choose=function(index){const gift=this.choiceKind==='gift'&&this.state==='choice';const id=this.choices[index];if(gift&&(this.gift||!available(this,id)))return false;const ok=choose.call(this,index);if(ok&&gift)this.giftPulse(id);return ok;};
Run.prototype.triggerBravery=function(){if(this.gift!=='sparrow'||this.cool.giftBrave>0)return;this.cool.brave=5;this.cool.giftBrave=8;this.giftCount('悍勇');this.giftPulse('sparrow');};
const autoAttack=Run.prototype.autoAttack;
Run.prototype.autoAttack=function(target){const shots=this.attacks;autoAttack.call(this,target);if(this.gift==='might'&&this.attacks>shots&&!(this.cool.giftMight>0)){this.cool.giftMight=1;this.giftPulse('might');}};
const hit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore=false){const before=e.hp,live=e.active&&e.born<=0;hit.call(this,e,n,ignore);if(live&&e.hp<before&&dist(e,this.p)<150&&this.state==='running')this.triggerBravery();};
const hurt=Run.prototype.hurt;
Run.prototype.hurt=function(...args){const before=this.p.hp;const result=hurt.apply(this,args);if(this.p.hp<before&&this.state==='running'){this.triggerBravery();if(this.gift==='frostpine'){this.p.recoil=0;this.giftCount('守心');this.giftPulse('frostpine');}}return result;};
Run.prototype.giftCast=function(){if(this.gift!=='rainbow'||this.cool.giftRainbow>0||this.state!=='running')return;this.cool.giftRainbow=6;this.cool.giftUnweave=.8;this.giftUnweaveLeft=2;this.giftPulse('rainbow');};
const growth=Run.prototype.growthSignal;
Run.prototype.growthSignal=function(id,...args){growth.call(this,id,...args);if(['gate','edict','muddle','conceal','rain','light','dali','fireNet','metalEdge','metalCourt','metalBlades'].includes(id))this.giftCast();};
const bullets=Run.prototype.updateBullets;
Run.prototype.updateBullets=function(dt){if(this.gift==='rainbow'&&this.cool.giftUnweave>0&&this.giftUnweaveLeft>0)this.bullets.forEach(b=>{if(b.enemy&&this.giftUnweaveLeft>0&&dist(b,this.p)<90){this.bullets.remove(b);this.giftUnweaveLeft--;this.giftCount('化解飞弹');this.giftPulse('rainbow',b.x,b.y);}});bullets.call(this,dt);};
Run.prototype.updateGiftThreat=function(){this.giftThreat=null;if(this.gift!=='omen')return;let soon=Infinity;const p=this.p;const offer=(x,y,t,kind)=>{if(t<soon){soon=t;this.giftThreat={x,y,kind};}};
 this.bullets.forEach(b=>{if(!b.enemy)return;const dx=p.x-b.x,dy=p.y-b.y,v2=b.vx*b.vx+b.vy*b.vy;if(!v2)return;const t=(dx*b.vx+dy*b.vy)/v2;if(t>=0&&t<=.9&&Math.hypot(dx-b.vx*t,dy-b.vy*t)<32)offer(b.x,b.y,t,'飞弹');});
 this.zones.forEach(z=>{if(z.kind==='hazard'&&dist(p,z)<z.r+35)offer(z.x,z.y,Math.max(0,z.warn-z.age),'地面险区');});
 this.enemies.forEach(e=>{if(!['warn','charge'].includes(e.phase)||dist(e,p)>380)return;const dx=p.x-e.x,dy=p.y-e.y,along=dx*e.ax+dy*e.ay;if(along>=0&&Math.abs(dx*e.ay-dy*e.ax)<e.r+32)offer(e.x,e.y,e.phase==='charge'?.1:.5,'冲锋');});
};
const step=Run.prototype.step;
Run.prototype.step=function(dt,input={}){step.call(this,dt,input);if(this.state!=='running')return;if(this.gift==='omen'&&!(this.cool.giftSense>0)){this.cool.giftSense=.15;this.updateGiftThreat();}};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
