'use strict';
// Browser emulation: normal input startup followed by explicitly constructed encounters.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
async function present(p){await p.evaluate(async()=>{xuanjian.game.loop.wake();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));xuanjian.game.loop.sleep();});}
const base=process.env.XJ_URL||'http://127.0.0.1:18750/';
(async()=>{fs.mkdirSync('work/duel/browser',{recursive:true});const b=await chromium.launch({headless:true,executablePath:process.env.XJ_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const reports=[];
for(const [w,h] of [[320,568],[390,844],[844,390],[1280,800]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'?test');await p.locator('[data-item="bow"]').click();await p.locator('[data-choice="0"]').click();await p.waitForFunction(()=>xuanjian.run.state==='running');
 await p.evaluate(()=>{const r=xuanjian.run;r.t=360;r.skills.gate=3;r.dao='mingyang';r.enemies.forEach(e=>r.enemies.remove(e));r.spawnTimer=r.bossAt=r.eliteAt=1e9;const e=r.spawn(6,false,r.p.x+100,r.p.y-70);e.born=0;r.startDuelCast(e,'mountain');r.fx.forEach(f=>{if(f.kind==='bossArrival')r.fx.remove(f);});xuanjian.test.sync();xuanjian.test.draw();xuanjian.game.loop.sleep();});
 await present(p);assert(await p.locator('#bossbar').isVisible());assert.match(await p.locator('#bossbar').innerText(),/东羽山/);
 const dimensions=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,boss:(()=>{const r=document.getElementById('bossbar').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})(),notice:(()=>{const r=document.getElementById('notice').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()}));
 assert(!dimensions.overflow);assert(dimensions.boss.x>=0&&dimensions.boss.x+dimensions.boss.width<=w+1);assert(dimensions.notice.height<=60);if(w<1000)assert(dimensions.boss.height<=48);if(w>h&&h<=500)assert(dimensions.boss.y+dimensions.boss.height<75);
 await p.screenshot({path:`work/duel/browser/${w}-mountain.png`});
 await p.evaluate(()=>{const r=xuanjian.run,e=r.duelEnemy();e.duelPhase=2;e.recover=0;r.startDuelCast(e,'water');xuanjian.test.sync();xuanjian.test.draw();});await present(p);await p.screenshot({path:`work/duel/browser/${w}-water.png`});
 await p.evaluate(()=>{const r=xuanjian.run,e=r.duelEnemy();r.updateEnemies(1.3);for(let i=0;i<8;i++)r.updateBullets(.05);xuanjian.test.draw();});await present(p);await p.screenshot({path:`work/duel/browser/${w}-fish.png`});
 await p.evaluate(()=>xuanjian.game.loop.wake());await p.locator('#pause').click();assert(await p.locator('#resume').isVisible());const time=await p.evaluate(()=>xuanjian.run.t);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>xuanjian.run.t),time);await p.locator('#resume').click();
 await p.evaluate(()=>{const r=xuanjian.run;r.hit(r.duelEnemy(),1e9);r.end('主动结束');xuanjian.test.sync();});await p.locator('.duel-review summary').click();assert.match(await p.locator('#panel').innerText(),/邺桧.*击退|击退.*邺桧/s);await p.screenshot({path:`work/duel/browser/${w}-debrief.png`});
 assert.equal(errors.length,0,errors.join('\n'));reports.push({w,h,dimensions,errors});await p.close();
}
await b.close();fs.writeFileSync('work/duel/browser/results.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({method:'normal input startup; constructed boss, source only; Chromium emulation, not real-device E2E',passed:reports.length,reports},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
