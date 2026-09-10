'use strict';
const assert=require('node:assert/strict'),X=require(require('node:path').join(process.env.XJ_GAME_ROOT||require('node:path').resolve(__dirname,'..'),'scripts/field-event.js'));
function heart(){const r=new X.Run(42,'bow');r.opening();r.choose(r.choices.indexOf('dali'));r.skills.dali=3;r.cool.dali=0;return r;}
// Normal automatic casting must not spend on a target outside the actual damaging radius.
const r=heart(),e=r.spawn(0,false,r.p.x+160,r.p.y);e.born=0;e.hp=e.max=1000;
r.updateSkills(.05,e);assert.equal(r.p.mp,100);assert.equal(r.zones.count,0);
e.x=r.p.x+110;r.updateSkills(.05,e);assert.equal(r.p.mp,74);r.updateZones(.05);assert(e.hp<1000);
// Manual uses the same eligibility; the fix does not grant ranged heart fire.
const m=heart(),far=m.spawn(0,false,m.p.x+160,m.p.y);far.born=0;assert(m.setManual('dali'));assert(!m.castManual());assert.equal(m.p.mp,100);
// Training heals only running, living actors, caps at max HP, and resets on a new run.
const h=new X.Run(7,'bow');h.p.hp=50;h.training.recovery=3;h.spawnTimer=999;
for(let i=0;i<200;i++)h.step(.05);assert(Math.abs(h.p.hp-57.5)<1e-7);
h.pause();const hp=h.p.hp;h.step(.05);assert.equal(h.p.hp,hp);
h.pause();h.p.hp=99.99;h.step(.05);assert.equal(h.p.hp,100);
h.p.hp=0;h.state='ended';h.step(.05);assert.equal(h.p.hp,0);assert.equal(new X.Run(7).healthRegen,0);
console.log(JSON.stringify({suite:'casting range and optional sustain regression',passed:4,total:4}));
