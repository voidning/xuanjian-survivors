'use strict';
const assert=require('node:assert/strict'),X=require('../scripts/field-event.js');let passed=0;
const ids=X.Cultivation.routes.slice(2).flatMap(r=>r.ids);
function setup(id,l){const r=new X.Run(4,'bow');r.opening();assert(r.choose(r.choices.indexOf(id)));r.skills[id]=l;r.state='running';r.p.inv=0;r.spawnTimer=999;r.cool[id]=0;const e=r.spawn(0,false,r.p.x+70,r.p.y);e.born=0;e.hp=e.max=1000;return {r,e};}
for(const id of ids)for(const l of [1,2,3]){const {r,e}=setup(id,l);r.p.mp=50;
 if(id==='fireMarch'&&l<3){e.hp=1;r.hit(e,10);assert(r.daoAdvance);r.autoAttack(e);assert(r.cool.attack<.57);}
 else if(id==='liMandate'){r.hit(e,1);assert.equal(r.p.mp,50+[0,2,3,6][l]);r.hit(e,1);assert.equal(r.p.mp,50+[0,2,3,6][l]);}
 else if(id==='fireWhole'){for(let j=0;j<3;j++)r.hit(e,1);assert(e.hp<997);assert.equal(r.telemetry.foundationTriggers.fireWhole,1);}
 else if(id==='metalHeart'){e.phase='warn';assert.equal(r.sensedEnemy(),e);r.autoAttack(e);assert(r.cool.attack<.57);assert.equal(r.telemetry.foundationTriggers.metalHeart,1);}
 else if(id==='metalTrust'){e.phase='warn';r.updateSkills(.01,e);r.p.y+=70;e.phase='move';r.t=1.6;r.updateSkills(.01,e);assert(r.daoCounter);r.autoAttack(e);assert(r.cool.attack<.57);}
 else {r.updateSkills(.01,e);if(l===3){for(let j=0;j<105;j++)r.updateZones(.05);}assert(e.hp<1000,id+' '+l);assert(r.p.mp<50);if(l<3)assert(r.telemetry.foundationTriggers[id]);}
 assert(Number.isFinite(r.p.mp));assert(r.p.mp>=0);passed++;
}
// No target means no low-rank resource drain; out-of-range short edge must not spend.
for(const id of ids){const {r,e}=setup(id,1);r.enemies.remove(e);r.updateSkills(.05,null);assert.equal(r.p.mp,100);passed++;}
{const {r,e}=setup('metalEdge',1);e.x=r.p.x+230;r.updateSkills(.05,e);assert.equal(r.p.mp,100);assert.equal(e.hp,1000);passed++;}
// Injury cancels evasion; echo cannot recursively proc itself.
{const {r,e}=setup('metalTrust',3);e.phase='warn';r.updateSkills(.01,e);r.p.y+=80;r.damageTaken++;e.phase='move';r.t=1.6;r.updateSkills(.01,e);assert(!r.daoCounter);passed++;}
// Fields are unique and capacity-limited, with cooldown/mana/manual contracts.
for(const id of ['fireNet','fireMarch','metalCourt','metalBlades','metalEdge']){const {r,e}=setup(id,3);assert(r.setManual(id));r.p.mp=0;assert(!r.castManual());r.p.mp=100;assert(r.castManual());assert(!r.castManual());assert.equal(r.skillCasts[id],1);passed++;}
{const {r,e}=setup('liMandate',3);r.hit(e,1);assert.equal(r.daoManaReserve,6);r.spend(10);assert.equal(r.p.mp,96);assert.equal(r.daoManaReserve,0);passed++;}
console.log(JSON.stringify({suite:'new dao constructed combat',passed,total:passed}));
