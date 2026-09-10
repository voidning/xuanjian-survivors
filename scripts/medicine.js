/* Shared survival supplies: game pickups, not a canonical supernatural ability. */
(function(root){'use strict';
const X=typeof module!=='undefined'?require('./fruit-active.js'):root.XJ;
const {Run,dist,rng}=X;
X.Medicine=Object.freeze({heal:15,cooldown:45,chance:.04,pity:40,lowPity:8,lowRatio:.35,capacity:3,pickupRadius:28});
Run.prototype.tryMedicineDrop=function(e){
 const rules=X.Medicine;this.medicineBags??=[];this.medicineProgress??={kills:0,lastDrop:0};
 const p=this.medicineProgress;p.kills=Math.min(rules.pity,p.kills+1);
 if(this.medicineBags.length>=rules.capacity||this.t-p.lastDrop<rules.cooldown)return false;
 // Separate random stream: supplies never consume offer/spawn/combat randomness.
 this.medicineRandom??=rng((this.seed^0x6d2b79f5)>>>0);
 const guaranteed=p.kills>=rules.pity||(this.p.hp/this.maxHP<=rules.lowRatio&&p.kills>=rules.lowPity);
 if(!guaranteed&&this.medicineRandom()>=rules.chance)return false;
 this.medicineBags.push({x:e.x,y:e.y,heal:rules.heal});p.kills=0;p.lastDrop=this.t;
 this.telemetry.medicineDropped=(this.telemetry.medicineDropped||0)+1;
 this.notice('药囊落地 · 受伤时靠近拾取，回复气血');return true;
};
const hit=Run.prototype.hit;
Run.prototype.hit=function(e,n,ignore=false){const eligible=this.state==='running'&&e.active&&e.born<=0&&!e.summoned&&!e.elite&&!e.boss;hit.call(this,e,n,ignore);if(eligible&&!e.active&&this.state==='running')this.tryMedicineDrop(e);};
const step=Run.prototype.step;
Run.prototype.step=function(dt,input){const before=this.t;step.call(this,dt,input);if(this.t===before||this.state!=='running'||this.p.hp<=0||this.p.hp>=this.maxHP)return;
 const bags=this.medicineBags||[];
 for(let i=0;i<bags.length&&this.p.hp<this.maxHP;){const bag=bags[i];if(dist(bag,this.p)>=X.Medicine.pickupRadius){i++;continue;}const actual=this.heal(bag.heal);if(actual<=0){i++;continue;}bags.splice(i,1);this.telemetry.medicinePicked=(this.telemetry.medicinePicked||0)+1;this.telemetry.medicineHealing=(this.telemetry.medicineHealing||0)+actual;this.effect('medicineHeal',this.p.x,this.p.y-48,0,.9,{text:'气血 +'+Number(actual.toFixed(1))});this.notice('拾取药囊 · 气血 +'+Number(actual.toFixed(1)));}
};
const end=Run.prototype.end;
Run.prototype.end=function(reason){if(this.state==='ended')return;end.call(this,reason);this.result.medicine={dropped:this.telemetry.medicineDropped||0,picked:this.telemetry.medicinePicked||0,healed:this.telemetry.medicineHealing||0,left:this.medicineBags?.length||0};};
if(typeof module!=='undefined')module.exports=X;
})(typeof globalThis!=='undefined'?globalThis:this);
