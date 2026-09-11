'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const duelSource=fs.readFileSync('scripts/duel-art.js','utf8'),fills=[],lines=[],ovals=[],labels=[];
const c={save(){},restore(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},translate(){},scale(){},rotate(){},stroke(){},fill(){fills.push(this.fillStyle);}};
const line=(...args)=>lines.push(args),oval=(...args)=>ovals.push(args),label=(...args)=>labels.push(args),artWindow={};artWindow.window=artWindow;vm.runInNewContext(duelSource,artWindow);
{
 const yehui={duelId:'yehui',phase:'move',recover:0,born:0,x:100,y:100};
 assert.equal(artWindow.XJDuelArt.actor(c,yehui,1,line,oval,label,false),true);assert(labels.some(([text])=>text==='邺桧'),'existing boss keeps its actor and name');
 assert.equal(artWindow.XJDuelArt.actor(c,{...yehui,duelId:'unknown'},1,line,oval,label,false),false,'unknown named enemies fall through to ordinary art');
}
{
 lines.length=ovals.length=labels.length=fills.length=0;const e={duelId:'yumuxian',duelPhase:1,duelShield:120,phase:'move',recover:0,born:0,x:200,y:180};
 assert.equal(artWindow.XJDuelArt.actor(c,e,2,line,oval,label,false),true);assert(labels.some(([text])=>text==='郁慕仙'));assert(labels.some(([text])=>text==='法盾护身 120'));
 assert.equal(ovals.filter(a=>a[4]==='#b18b36'&&a[5]===true).length,6,'foundation phase shows six separate round shields');assert(fills.includes('#faf7e9'),'foundation actor has a white robe');
 ovals.length=labels.length=0;artWindow.XJDuelArt.actor(c,{...e,duelPhase:2,duelShield:96},2,line,oval,label,true);assert.equal(ovals.filter(a=>a[4]==='#edda8d').length,8,'second phase replaces shields with a golden lotus');assert(labels.some(([text])=>text==='金莲护身 96'));
 labels.length=0;artWindow.XJDuelArt.actor(c,{...e,duelShield:0,recover:2.5},2,line,oval,label,true);assert(labels.some(([text])=>text==='护身已破 · 趁收势追击'),'shield break exposes the recovery window');
}
{
 const shots=Array.from({length:8},(_,i)=>({x:20+i,y:40-i,ax:1,ay:0})),e={duelId:'yumuxian',duelPhase:1,duelCast:'spindles',phase:'warn',x:100,y:100,duelShots:shots};lines.length=labels.length=0;
 assert.equal(artWindow.XJDuelArt.warning(c,e,line,oval,label),true);const rails=lines.filter(([,col,w])=>col==='#ead79b'&&w===3);assert.equal(rails.length,8,'all eight locked shots receive a visible center rail');assert(rails.every(([p])=>p[1][0]-p[0][0]===481));assert(labels.some(([text])=>text==='八枚金梭 · 移出金线'));
 lines.length=0;artWindow.XJDuelArt.warning(c,{...e,duelPhase:2},line,oval,label);assert(lines.filter(([,col,w])=>col==='#ead79b'&&w===3).every(([p])=>p[1][0]-p[0][0]===533),'second-phase rails match the faster projectile range');
 fills.length=0;assert.equal(artWindow.XJDuelArt.fish(c,{kind:'duelSpindle',x:0,y:0,vx:1,vy:0},line,oval),true);assert(fills.includes('#f3dda0'),'spindle projectile is visibly gold');assert.equal(artWindow.XJDuelArt.fish(c,{kind:'ordinary',x:0,y:0,vx:1,vy:0},line,oval),false);
}
const w={};w.window=w;vm.runInNewContext(fs.readFileSync(require.resolve(process.env.XJ_DANGER_ART||'../scripts/danger-art.js'),'utf8'),w);
lines.length=0;let calls=0;w.XJDuelArt={warning(_c,e){if(e.duelId)calls++;}};
const e={type:6,duelId:'yehui',phase:'warn',x:100,y:100,r:25,ax:1,ay:0};
const r={p:{x:0,y:0},zones:{forEach(){}},enemies:{forEach(fn){fn(e);}}};
w.XJDangerArt.draw(c,r,line,()=>{},()=>{});assert(!lines.some(([points])=>points.some(([x,y])=>x===412)),'named caster must not display the old 312-unit charge rails');assert.equal(calls,1);
e.duelId=null;lines.length=0;w.XJDangerArt.draw(c,r,line,()=>{});assert(lines.some(([points])=>points.some(([x])=>x===412)),'ordinary boss retains original warning');
console.log('duel actors, shields, spindle rails/projectiles and danger overlay regression: passed');
