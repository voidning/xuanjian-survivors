/* Names and capabilities are chapter-grounded. Costs, levels and timing are adaptations. */
(function(root){'use strict';const X=typeof module!=='undefined'?require('./run-systems.js'):root.XJ;const {Run,dist,clamp,W,H}=X;
const turn=(a,b,step)=>a+clamp(Math.atan2(Math.sin(b-a),Math.cos(b-a)),-step,step);
Run.prototype.firePower=function(){return (this.item==='lamp'?1.15:1);};
Run.prototype.updateSkills=function(dt,nearest,manual=false){const p=this.p;
if(!manual&&this.lv('body')){let count=0,weight=0;this.enemies.forEach(e=>{if(e.born<=0&&dist(e,p)<170){count++;weight+=e.boss?3:e.elite?2:1;}});p.pressure=count>=2?Math.min(1,weight/5):0;p.danger=p.pressure;
if(count===0&&p.battleWounds>0){p.escape+=dt;if(p.escape>1){const n=Math.min(p.battleWounds,(2+this.lv('body'))*dt);this.heal(n);p.battleWounds-=n;}}else p.escape=0;}
const order=this.skillOrder(nearest,manual);
for(const id of order){if(this.skillBlock(id,nearest))continue;const lv=this.lv(id),cost=this.skillCost(id);if(!this.spend(cost)){if(!manual)this.skillBudget=id;break;}delete this.skillWait[id];this.skillCasts??={};this.skillCasts[id]=(this.skillCasts[id]||0)+1;p.cast=.4;this.skillSignal?.(id);
if(id==='fragrance'){const target=this.cluster(430,110+lv*15)||nearest;this.zones.add({kind:'fragrance',x:target.x,y:target.y,r:110+lv*15,life:3.2,age:0,tick:0,lv});this.cool.fragrance=10;}
if(id==='angler'){
 const target=this.cluster(430,130+lv*20)||nearest,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;
 const x=clamp(p.x+dx/d*Math.max(130,d),65,W-65),y=clamp(p.y+dy/d*Math.max(130,d),65,H-65),r=130+lv*20,life=3+lv*.5;
 this.zones.add({kind:'angler',x,y,r,life,age:0,tick:0});
 this.enemies.list().filter(e=>e.born<=0&&dist(e,{x,y})<r).sort((a,b)=>dist(a,{x,y})-dist(b,{x,y})).slice(0,24).forEach(e=>{e.lured=life*(e.boss?.25:e.elite?.55:1);e.lureX=x;e.lureY=y;e.phase='move';e.cd=Math.max(e.cd,.8);});
 this.effect('anglerCast',p.x,p.y,1,.65,{tx:x,ty:y});this.cool.angler=10;
}
if(id==='peril'){
 const bait=this.zones.list().find(z=>z.kind==='angler'&&dist(z,p)<430&&z.life-z.age>.8&&this.nearest(z,z.r));
 const target=bait||this.cluster(430,120+lv*20)||nearest,r=120+lv*20;
 this.zones.add({kind:'peril',x:target.x,y:target.y,r,life:2.6+lv*.6,age:0,tick:0,lv,linked:!!bait});
 this.enemies.forEach(e=>{if(e.born>0||dist(e,target)>=r)return;const dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy)||1,resist=e.boss?.2:e.elite?.55:1,k=Math.min(Math.max(0,d-20),(40+lv*20)*resist);e.x=clamp(e.x+dx/d*k,65,W-65);e.y=clamp(e.y+dy/d*k,65,H-65);e.root=Math.max(e.root||0,(.35+lv*.2)*resist);e.phase='move';e.cd=Math.max(e.cd,.8);});
 this.effect('perilRise',target.x,target.y,r,.65);this.cool.peril=11;
}
if(id==='spring'){this.springCharges=(this.fruits.lushui?5:4)+(lv===3?2:0);this.cool.springPower=8;this.cool.spring=7;this.effect('spring',p.x,p.y,65,.6);}
if(id==='muddle'){const target=this.cluster(450,90+lv*20)||nearest;this.enemies.forEach(e=>{if(e.born<=0&&dist(e,target)<90+lv*20){e.confused=(1.4+lv*.4)*(e.elite||e.boss?.5:1);e.phase='move';e.cd=Math.max(1,e.cd);}});this.effect('muddle',target.x,target.y,90+lv*20,.8);this.cool.muddle=9;}
if(id==='conceal'){this.lastSeen={x:p.x,y:p.y};this.cool.hidden=1.5+lv*.5;this.cool.conceal=10;if(this.fruits.lushui)this.cool.dewWard=Math.max(this.cool.dewWard||0,1);this.effect('conceal',p.x,p.y,65,1.5+lv*.5);}
if(id==='dew'){const r=110+lv*30;this.zones.forEach(z=>{if(z.kind==='hazard'&&dist(z,p)<z.r+r)this.zones.remove(z);});p.slow=0;this.cool.dewWard=1.5+lv*.5;this.cool.dew=9;this.effect('dew',p.x,p.y,r,.65);}
if(id==='gate'){let count=lv+1+(this.fruit?2:0);for(let i=0;i<count;i++)this.allies.add({x:p.x+Math.cos(i*2.4)*55,y:p.y+Math.sin(i*2.4)*55,life:7+lv,cd:i*.12,empowered:0});this.effect('gate',p.x,p.y,80,.8);this.cool.gate=9;}
if(id==='edict'){this.zones.add({kind:'edict',x:clamp(p.x+p.vx*95,65,W-65),y:clamp(p.y+p.vy*95,65,H-65),r:110+lv*25,life:5.5,age:0,tick:0});this.cool.edict=8;}
if(id==='dusk'){this.zones.add({kind:'dusk',x:p.x,y:p.y,r:190+lv*22,life:5.5+lv*.5,age:0,tick:0,playerWound:0,wounds:new Map()});this.cool.dusk=10;this.effect('dusk',p.x,p.y,190,.6);}
if(id==='light'){let r=195+lv*25;this.enemies.forEach(e=>{if(e.born<=0&&dist(e,p)<r+e.r)e.lightUntil=this.t+1.2+lv*.4;});this.area(p.x,p.y,r,14+lv*8,1.2+lv*.4,true);this.bullets.forEach(b=>{if(b.enemy&&dist(b,p)<r)this.bullets.remove(b);});this.allies.forEach(a=>{a.empowered=5;a.empoweredAt=this.t;a.cd=0;});this.effect('light',p.x,p.y,r,.7);this.cool.light=8;if(this.fruit)this.zones.forEach(z=>{if(z.kind==='edict')z.life=Math.max(z.life,z.age+5);});}
if(id==='pure'){const r=85+lv*28;this.zones.forEach(z=>{if(z.kind==='hazard'&&dist(z,p)<z.r+r)this.zones.remove(z);});this.bullets.forEach(b=>{if(b.enemy&&b.kind!=='metal'&&dist(b,p)<r)this.bullets.remove(b);});this.zones.add({kind:'suppress',x:p.x,y:p.y,r,life:1.2+lv*.4,age:0,tick:0});p.slow=0;p.guard=Math.max(p.guard,1);this.effect('pure',p.x,p.y,r,.7);this.cool.pure=11-lv*.5;}
if(id==='mountain'){nearest=this.cluster(500,75+lv*20)||nearest;this.zones.add({kind:'mountain',x:nearest.x,y:nearest.y,r:75+lv*20,life:3.5+lv*.5,age:0,tick:0});this.area(nearest.x,nearest.y,75+lv*20,20+lv*13,.5,true);this.effect('mountain',nearest.x,nearest.y,70,.7);this.cool.mountain=9;}
if(id==='thunder'){const r=215+lv*25;this.enemies.forEach(e=>{const d=dist(e,p);if(d<r&&e.born<=0){const proximity=1-d/r;this.hit(e,(22+14*lv)*(1+proximity),true);e.stun=Math.max(e.stun,.25+proximity*.9);e.phase='move';e.cd=Math.max(e.cd,1);const k=25+proximity*60;e.x=clamp(e.x+(e.x-p.x)/(d||1)*k,65,W-65);e.y=clamp(e.y+(e.y-p.y)/(d||1)*k,65,H-65);}});this.effect('thunder',p.x,p.y,r,.65);this.cool.thunder=8;}
if(id==='armor'){p.armor=24+lv*14;p.armorTime=7;this.cool.armor=11;this.effect('armor',p.x,p.y,35,.7);}
if(id==='flame'){this.zones.add({kind:'flame',x:p.x,y:p.y,r:155+lv*20,angle:Math.atan2(nearest.y-p.y,nearest.x-p.x),spread:.48+lv*.07,life:1.4+lv*.3,age:0,tick:0,lv});this.cool.flameMove=1.4+lv*.3;this.cool.flame=7;}
if(id==='rain'){nearest=(lv===3?this.zones.list().find(z=>z.kind==='peril'&&dist(z,p)<500):null)||this.cluster(500,110+lv*20)||nearest;this.zones.add({kind:'rain',x:nearest.x,y:nearest.y,r:110+lv*20,life:4+lv*.5,age:0,tick:0,lv});this.cool.rain=9;}
if(id==='grove'){this.zones.add({kind:'grove',x:p.x,y:p.y,r:95+lv*15,life:4,age:0,tick:0,lv});this.cool.grove=13;this.effect('grove',p.x,p.y,110,.65);}
}
};
// Pre-collision field interception: effects are checked at bullet positions, not a screenshot proxy.
Run.prototype.intercept=function(){this.zones.forEach(z=>{if(!['screen','fire','suppress'].includes(z.kind))return;this.bullets.forEach(b=>{if(!b.enemy||dist(b,z)>z.r)return;if(z.kind==='suppress'&&b.kind!=='metal')this.bullets.remove(b);if(z.kind==='screen'&&b.kind==='metal')b.held=Math.max(b.held||0,z.life-z.age);if(z.kind==='fire'&&b.kind==='metal'&&!b.scorched){b.damage*=.4;b.scorched=true;this.effect('melt',b.x,b.y,15,.3);}});});};
const baseBullets=Run.prototype.updateBullets;
Run.prototype.updateBullets=function(dt){if(this.item==='screen'&&!(this.cool.screenPulse>0)){const incoming=this.bullets.list().filter(b=>b.enemy&&b.kind==='metal'&&!(b.held>0)&&dist(b,this.p)<110);if(incoming.length){for(const b of incoming)b.held=.6;this.cool.screenPulse=1.5;this.p.weaponAt=this.t;this.p.weaponLife=.3;this.effect('screenPulse',this.p.x,this.p.y,110,.35);}}this.intercept();baseBullets.call(this,dt);};
const baseZones=Run.prototype.updateZones;
Run.prototype.updateZones=function(dt){this.zones.forEach(z=>{if(z.kind==='hazard')return;
if(z.kind==='fragrance'&&z.tick<=0){z.tick=.55;this.enemies.forEach(e=>{if(e.born<=0&&dist(e,z)<z.r)this.hit(e,7+z.lv*3);});}
if(z.kind==='peril'){this.enemies.forEach(e=>{const d=dist(e,z);if(e.born<=0&&d<z.r){e.slow=Math.max(e.slow,.2);if(z.lv===3&&d>24){const step=Math.min(d-24,20*dt*(e.boss?.2:e.elite?.4:1));e.x+=(z.x-e.x)/d*step;e.y+=(z.y-e.y)/d*step;}}});}
if(z.kind==='edict'){if(this.fruit){z.x+=(this.p.x-z.x)*Math.min(1,dt*5);z.y+=(this.p.y-z.y)*Math.min(1,dt*5);}this.enemies.forEach(e=>{if(dist(e,z)<z.r)e.mark=.25;});this.allies.forEach(a=>{if(dist(a,z)>z.r+40){a.x+=(z.x-a.x)*dt*2;a.y+=(z.y-a.y)*dt*2;}});}
if(z.kind==='mountain')this.enemies.forEach(e=>{if(dist(e,z)<z.r)e.slow=.25;});
if(z.kind==='dusk'){const inside=dist(this.p,z)<z.r;if(z.wasInside!==undefined&&inside!==z.wasInside)this.skillSignal?.('dusk',inside?'进入血漠 · 记伤、挪移可用':'离开血漠 · 域内挪移不可用');z.wasInside=inside;const ending=z.age+dt>=z.life;
if((ending||dist(this.p,z)>=z.r)&&(z.playerWound||0)>0){const restored=this.heal(z.playerWound);this.skillSignal?.('dusk','返还气血 +'+restored.toFixed(1));this.effect('duskLeave',this.p.x,this.p.y,35,.5);z.playerWound=0;}
if(z.wounds){const live=this.enemies.list();for(const [id,n] of z.wounds){const e=live.find(e=>e.id===id);if(!e){z.wounds.delete(id);continue;}if(ending||dist(e,z)>=z.r){e.hp=Math.min(e.max,e.hp+n);z.wounds.delete(id);}}}}
if(z.kind==='flame'){z.x=this.p.x;z.y=this.p.y;const e=this.nearest(this.p,z.r+100);if(e)z.angle=turn(z.angle,Math.atan2(e.y-z.y,e.x-z.x),dt*(this.gift==='firegift'?5:1.5));if(z.tick<=0){z.tick=.25;this.enemies.forEach(e=>{if(e.born>0)return;const a=Math.atan2(e.y-z.y,e.x-z.x);if(dist(e,z)<z.r&&Math.abs(Math.atan2(Math.sin(a-z.angle),Math.cos(a-z.angle)))<z.spread){this.hit(e,(5+z.lv*2)*this.firePower());this.effect('fireHit',e.x,e.y,12,.2);}});}}
if(z.kind==='rain'&&(this.fruits.lushui||z.lv===3)){z.x+=(this.p.x-z.x)*Math.min(1,dt*2);z.y+=(this.p.y-z.y)*Math.min(1,dt*2);}
if(z.kind==='rain'&&z.tick<=0){z.tick=.55;this.enemies.forEach(e=>{if(dist(e,z)<z.r){if(z.age>=.8)e.exposed=.8;this.hit(e,6+z.lv*3);}});}
if(z.kind==='grove'&&dist(this.p,z)<z.r)this.heal((2+z.lv)*dt);
if(z.kind==='fire'&&z.tick<=0){z.tick=.4;this.enemies.forEach(e=>{if(dist(e,z)<z.r)this.hit(e,9*this.firePower());});}
});baseZones.call(this,dt);};
Run.prototype.updateAllies=function(dt){this.allies.forEach(a=>{a.life-=dt;a.empowered=Math.max(0,a.empowered-dt);a.cd-=dt;if(a.life<=0){this.allies.remove(a);return;}let e=this.nearest(a,410);if(e){let d=dist(a,e)||1;if(d>30){a.x+=(e.x-a.x)/d*225*dt;a.y+=(e.y-a.y)/d*225*dt;}else if(a.cd<=0){a.attackAt=this.t;a.aim=Math.atan2(e.y-a.y,e.x-a.x);a.cd=a.empowered>0?.45:.8;this.hit(e,(12+this.lv('gate')*6)*(a.empowered>0?1.6:1),a.empowered>0);this.effect('allyHit',e.x,e.y,25,.22);}}else{a.x+=(this.p.x-a.x)*dt*2;a.y+=(this.p.y-a.y)*dt*2;}});};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
