'use strict';
if(!process.env.XJ_BASELINE_URL)throw new Error('Set XJ_BASELINE_URL to the unmodified source server ending in /');
const { chromium } = require('playwright');

async function bench(browser,url,label){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>window.xuanjian?.test&&window.XJ?.Run);
  const result=await page.evaluate(()=>{
    const r=new XJ.Run(73051,'sword','endless');
    for(let i=0;i<150;i++)r.spawn(0,false,i%2?90:3110,90+(i%18)*112);
    for(let i=0;i<10;i++)r.spawn(0,false,1510+(i%5)*42,1020+Math.floor(i/5)*70);
    for(let i=0;i<110;i++)r.drops.add({x:i%2?70:3130,y:80+(i%20)*100,value:2,attracted:false});
    for(let i=0;i<240;i++)r.bullets.add({x:i%2?60:3140,y:70+(i%20)*100,vx:120,vy:0,enemy:false,kind:'plain',held:0});
    for(let i=0;i<120;i++)r.fx.add({kind:'number',x:i%2?60:3140,y:70+(i%20)*100,r:0,age:.1,life:.65,text:'12'});
    r.state='paused';xuanjian.test.setRun(r);
    for(let i=0;i<12;i++)xuanjian.test.draw();
    const samples=[];
    for(let i=0;i<160;i++){const start=performance.now();xuanjian.test.draw();samples.push(performance.now()-start);}
    samples.sort((a,b)=>a-b);
    return {entities:r.summary().entities,field:XJFieldArt.metrics,medianMs:samples[80],p95Ms:samples[152],meanMs:samples.reduce((n,v)=>n+v,0)/samples.length};
  });
  await page.close();return {label,...result,errors};
}

(async()=>{const browser=await chromium.launch({headless:true});try{const results=[];results.push(await bench(browser,process.env.XJ_BASELINE_URL+'?test','原版'));results.push(await bench(browser,(process.env.XJ_URL||'http://127.0.0.1:18743/')+'?test','优化版'));console.log(JSON.stringify(results,null,2));}finally{await browser.close();}})();
