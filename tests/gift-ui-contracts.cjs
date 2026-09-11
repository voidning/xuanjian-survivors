const assert=require('node:assert/strict'),X=require('../scripts/field-event.js');
const expected=['whale','life','sparrow','rainbow','frostpine','greed'];assert.deepEqual(X.GiftSystem.definitions.map(x=>x.id),expected);
const r=new X.Run(3,'bow');r.openChoice('gift');assert.equal(r.choices.length,5);assert(!r.choices.includes('greed'));for(const id of ['might','omen','sunseal','cloud']){assert(X.GiftSystem.get(id));assert(!X.GiftSystem.available(r,id));r.choices=[id];assert.equal(r.choose(0),false);}
r.dao='lihuo';r.skills.dali=3;r.openChoice('gift');assert.deepEqual(r.choices,expected);assert(r.choose(5));assert.equal(r.gift,'greed');console.log('six retained gifts, gated heartfire and historical IDs: passed');
