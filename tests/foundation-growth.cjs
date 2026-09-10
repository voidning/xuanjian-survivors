'use strict';
const assert=require('node:assert/strict'),X=require('../scripts/field-event.js');
let count=0;
function run(id,rank=1){const r=new X.Run(12,'bow');r.opening();r.choose(r.choices.indexOf(id));r.skills[id]=rank;r.state='running';r.spawnTimer=999;r.cool[id]=0;r.p.inv=0;r.p.guard=0;return r;}
function enemy(r){const e=r.spawn(0,false,r.p.x+70,r.p.y);e.born=0;e.hp=e.max=1000;return e;}
for(const rank of [1,2])for(const id of X.Cultivation.routes.slice(0,2).flatMap(r=>r.ids)){
 const r=run(id,rank),e=enemy(r);r.p.hp=70;
 if(id==='light')r.shoot(r.p.x+30,r.p.y,r.p.x,r.p.y,10,true);
 if(id==='muddle')e.phase='warn';
 if(['body','dusk','dew'].includes(id))r.hurt(10,id==='dew');
 else if(id==='spring')r.hit(e,5);
 else r.updateSkills(.01,e);
 if(id==='dusk'){r.t+=2;r.updateSkills(.01,e);assert.equal(r.p.hp,60+rank*2);}
 if(id==='body')assert.equal(r.p.hp,60+rank*2);
 if(id==='dew')assert.equal(r.p.hp,61+rank*3);
 if(id==='spring')assert.equal(r.p.hp,71+rank);
 if(id==='gate')assert(e.stun>0);
 if(id==='edict')assert(e.root>0);
 if(id==='muddle'){assert.equal(e.phase,'move');assert(e.stun>0);}
 if(id==='conceal')assert(r.cool.hidden>0);
 if(id==='rain')assert(e.hp<1000);
 if(id==='light')assert.equal(r.bullets.count,0);
 if(id!=='gate')assert(r.telemetry.foundationTriggers[id]>0);
 assert.equal(r.zones.count,0);assert.equal(r.allies.count,0);assert(r.p.mp>=92);count++;
}
// No targets / no injury must not burn mana or show a false trigger.
for(const id of X.Cultivation.routes.slice(0,2).flatMap(r=>r.ids)){const r=run(id);r.updateSkills(.05,null);assert.equal(r.p.mp,100);assert.equal(r.telemetry.foundationTriggers?.[id]||0,0);count++;}
// Cooldowns prevent hit-rate scaling; paused updates and lethal hits cannot heal.
{const r=run('spring'),e=enemy(r);r.p.hp=50;for(let i=0;i<20;i++)r.hit(e,1);assert.equal(r.p.hp,52);count++;}
{const r=run('dusk');r.p.hp=1;r.hurt(100);assert.equal(r.p.hp,0);assert(!r.growthWound);count++;}
{const r=run('rain'),e=enemy(r);r.state='paused';r.updateSkills(.05,e);assert.equal(e.hp,1000);count++;}
// Rank three disables the low-stage proc, leaving full power behavior intact.
for(const id of ['body','dew','spring']){const r=run(id,3),e=enemy(r);r.p.hp=50;r.hit(e,1);r.hurt(10);assert.equal(r.telemetry.foundationTriggers?.[id]||0,0);count++;}
console.log(JSON.stringify({suite:'constructed foundation growth',passed:count,total:count}));
