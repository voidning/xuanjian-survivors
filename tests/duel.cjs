'use strict';
// Constructed combat contracts; no natural-play claims.
const assert=require('node:assert/strict'),X=require('../scripts/field-event.js'),{Run,Duel,dist}=X,results=[];
function test(name,fn){try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}}
function run(){const r=new Run(42,'bow','standard');r.skills.rain=3;r.dao='lushui';r.t=360;r.spawnTimer=r.eliteAt=r.bossAt=1e9;return r;}
function boss(r){const e=r.spawn(6,false,r.p.x+240,r.p.y);e.born=0;return e;}
function clear(r){r.enemies.forEach(e=>r.enemies.remove(e));}
function enemies(r,seconds){for(let i=0;i<Math.round(seconds/.05);i++)r.updateEnemies(.05);}
test('six-minute boss requires a manifested power, occurs once, uses a real boss slot',()=>{
 const r=new Run(42,'bow','standard');r.t=360;let e=r.spawn(6);assert(!e.duelId);r.enemies.remove(e);r.skills.rain=3;e=r.spawn(6);assert.equal(e.duelId,Duel.id);assert.equal(e.max,2100);assert.equal(r.duelHistory.length,1);r.enemies.remove(e);assert(!r.spawn(6).duelId);
 const early=run();early.t=359;assert(!early.spawn(6).duelId);const late=run();late.t=675;assert(!late.spawn(6).duelId);
});
test('normal scheduled spawning configures the boss and respects an occupied slot',()=>{
 const r=run();r.t=359.99;r.bossAt=360;const old=r.spawn(6);r.step(.05,{});assert(!r.duelSeen);assert.equal(r.bossAt,540);r.enemies.remove(old);r.t=539.99;r.step(.05,{});assert(r.duelEnemy());assert.equal(r.enemies.list().filter(e=>e.boss).length,1);
});
test('mountain telegraph locks position and cannot hit before warning completes',()=>{
 const r=run(),e=boss(r);r.startDuelCast(e,'mountain');const q={...e.duelTargets[0]},hp=r.p.hp;r.p.x+=200;enemies(r,1.4);assert.equal(r.zones.count,0);assert.equal(r.p.hp,hp);enemies(r,.1);const z=r.zones.list()[0];assert.equal(z.x,q.x);assert.equal(z.y,q.y);r.updateZones(.05);assert.equal(r.p.hp,hp);r.p.x=z.x;r.p.y=z.y;r.updateZones(.05);assert(r.p.hp<hp);assert.equal(r.damageLog.at(-1).name,'邺桧 · 东羽山');
});
test('fish cast has locked direction and source; existing dispelling removes it',()=>{
 const r=run(),e=boss(r);r.startDuelCast(e,'water');const a=Math.atan2(e.ay,e.ax);r.p.y+=200;enemies(r,1.3);const bs=r.bullets.list().filter(b=>b.kind==='duelFish');assert.equal(bs.length,3);assert(Math.abs(Math.atan2(bs[1].vy,bs[1].vx)-a)<1e-8);assert(bs.every(b=>b.source.name==='邺桧 · 南惆水'&&b.duelId===e.id));r.lightPulse(e.x,e.y,100,3);assert.equal(r.bullets.count,0);
});
test('half HP changes cadence once, cancels old tell, leaves a vulnerable recovery',()=>{
 const r=run(),e=boss(r);r.startDuelCast(e,'mountain');e.hp=e.max*.5;r.updateEnemies(.05);assert.equal(e.duelPhase,2);assert.equal(e.phase,'move');assert.equal(e.duelTargets.length,0);assert.equal(e.recover,2);assert.equal(r.duelHistory[0].phase,2);const before=e.hp;r.hit(e,10);assert(e.hp<before);enemies(r,2.1);r.startDuelCast(e,'water');enemies(r,1.3);assert.equal(r.bullets.list().filter(b=>b.kind==='duelFish').length,5);
});
test('existing muddle interrupt cancels pending mountain without phantom hit',()=>{
 const r=run(),e=boss(r);r.skills.muddle=3;r.cool.muddle=0;r.startDuelCast(e,'mountain');r.updateSkills(0,e);assert.equal(e.phase,'move');enemies(r,1.6);assert.equal(r.zones.list().filter(z=>z.kind==='hazard').length,0);
});
test('pause and choice freeze warning, phase, history, and projectiles',()=>{
 for(const state of ['paused','choice','ended']){const r=run(),e=boss(r);r.startDuelCast(e,'water');r.state=state;const before=JSON.stringify({t:r.t,timer:e.timer,history:r.duelHistory});r.step(.05,{});assert.equal(JSON.stringify({t:r.t,timer:e.timer,history:r.duelHistory}),before);assert.equal(r.bullets.count,0);}
});
test('defeat cleans only own spells, rewards once and snapshots do not mutate on continuation',()=>{
 const r=run(),e=boss(r);r.startDuelCast(e,'water');enemies(r,1.3);r.hazard(100,100);const before=r.rerolls;r.hit(e,1e9);assert.equal(r.rerolls,before+2);assert.equal(r.bosses,1);assert.equal(r.duelHistory[0].defeatedAt,360);assert.equal(r.bullets.count,0);assert.equal(r.zones.count,1);r.hit(e,1e9);assert.equal(r.rerolls,before+2);r.end('破阵功成');const saved=JSON.stringify(r.result.duelHistory);const result=r.result;assert(r.continueEndless());r.duelHistory[0].phase=2;assert.equal(JSON.stringify(result.duelHistory),saved);
});
test('terminal retires undefeated named opponent without false victory or leaking spells',()=>{
 const r=run(),e=boss(r);r.startDuelCast(e,'water');enemies(r,1.3);r.t=674.99;r.step(.05,{});const final=r.enemies.list().find(e=>e.final);assert(final);assert(!final.duelId);assert(!e.active);assert.equal(r.bosses,0);assert.equal(r.duelHistory[0].defeatedAt,null);assert(!r.bullets.list().some(b=>b.duelId===e.id));assert.equal(final.max,4800);
});
test('two replacement formations are bounded and identifiable; duel suppresses extra elites',()=>{
 const r=run();r.t=305;r.spawnPack();assert.equal(r.duelFormations[0],0);assert(r.enemies.list().some(e=>e.duelFormation==='crossfire'));clear(r);r.t=330;r.spawnPack();assert.deepEqual(r.duelFormations,[0,1]);assert(r.enemies.list().some(e=>e.duelFormation==='screened'));clear(r);r.t=360;const e=boss(r);r.eliteAt=1;r.spawnTimer=0;r.startDuelCast(e,'water');r.step(.05,{});assert.equal(r.enemies.count,1);assert.equal(r.elites,0);
});
test('all four paths can walk out of mountain and fish with no defensive powers or dash',()=>{
 for(const dao of ['mingyang','lushui','lihuo','duijin']){const r=run(),e=boss(r);r.dao=dao;r.skills={};r.startDuelCast(e,'mountain');const hp=r.p.hp;for(let i=0;i<32;i++){r.p.y+=180*.05;r.updateEnemies(.05);r.updateZones(.05);}assert.equal(r.p.hp,hp,dao);r.p.x=e.x-240;r.p.y=e.y;e.phase='move';e.recover=0;r.startDuelCast(e,'water');for(let i=0;i<70;i++){r.p.y+=180*.05;r.updateEnemies(.05);r.updateBullets(.05);}assert.equal(r.p.hp,hp,dao);}
});
console.log(JSON.stringify({suite:'duel constructed contracts',passed:results.filter(r=>r.pass).length,total:results.length,results},null,2));process.exitCode=results.every(r=>r.pass)?0:1;
