/* 白描山野：纯展示地标，不添加碰撞与奖励，不使用战斗随机源。 */
(function(root){'use strict';
const sites=[{x:1470,y:1280,kind:'creek'},{x:970,y:730,kind:'pond'},{x:2100,y:1380,kind:'ridge'},{x:1670,y:420,kind:'stele'},{x:780,y:1660,kind:'ridge'},{x:2640,y:680,kind:'pond'}];
function ground(c,t,cam,w,h,zoom,line,oval,reduced){
 for(const s of sites){if(Math.abs(s.x-cam.x)>w/zoom/2+440||Math.abs(s.y-cam.y)>h/zoom/2+230)continue;c.save();c.translate(s.x,s.y);
  if(s.kind==='creek'){
   // An open shallow bank near the starting position; all marks remain walkable.
   c.fillStyle='#e8e9df';c.beginPath();c.moveTo(-390,-112);c.bezierCurveTo(-100,-165,85,-20,390,-64);c.lineTo(390,105);c.bezierCurveTo(100,140,-120,-15,-390,15);c.closePath();c.fill();
   c.fillStyle='#e0eae3';c.beginPath();c.moveTo(-390,-74);c.bezierCurveTo(-130,-135,80,60,390,-27);c.lineTo(390,92);c.bezierCurveTo(90,145,-110,-2,-390,50);c.closePath();c.fill();
   for(const offset of [0,7]){c.beginPath();c.moveTo(-390,-74+offset);c.bezierCurveTo(-130,-135+offset,80,60+offset,390,-27+offset);c.strokeStyle=offset?'#d0dbce':'#afc2b4';c.lineWidth=offset?.8:1.1;c.stroke();}
   for(let i=0;i<15;i++){const x=-340+i*47,y=16+Math.sin(i*.7)*20,drift=reduced?0:Math.sin(t*.4+i)*3;line([[x-18+drift,y],[x+8+drift,y-1],[x+26+drift,y]],'#b6cec3',.85,.65);}
   for(let i=0;i<18;i++){const group=i<9?-230:220,x=group+Math.sin(i*2.4)*54,y=-55+Math.cos(i*2.4)*14,sway=reduced?0:Math.sin(t*.8+i)*1.3;line([[x,y],[x-3+sway,y-17],[x+1+sway,y-28-i%3*4]],'#91a991',1,.65);line([[x,y-5],[x+9+sway,y-18]],'#a1b49b',.9,.65);}
   for(let i=0;i<6;i++){const x=-64+i*24,y=-48+i*14;const points=[[x-13,y],[x+9,y-2],[x+16,y+7],[x-10,y+10],[x-13,y]];c.beginPath();points.forEach((v,j)=>j?c.lineTo(...v):c.moveTo(...v));c.fillStyle='#e8e9df';c.fill();line(points,'#bdc6b7',1,.8);line([[x-7,y+3],[x+5,y+2]],'#cbd2c3',.8,.6);}
   for(let i=0;i<12;i++){const x=-330+i*59,y=-110+Math.sin(i)*11;oval(x,y,3+i%3,1.8,'#c8cebf');}
  }else if(s.kind==='pond'){
   c.fillStyle='#e7eeE7';c.beginPath();c.ellipse(0,0,220,90,-.16,0,Math.PI*2);c.fill();
   for(let i=0;i<6;i++){const y=-53+i*20,x=Math.sin(i*3.7)*100,drift=reduced?0:Math.sin(t*.45+i)*4;line([[x-45+drift,y],[x-12+drift,y-2],[x+32+drift,y]],'#becfc7',.9,.65);}
   for(let i=0;i<9;i++){const x=-170+i*42,y=76-Math.abs(x)*.12;line([[x,y],[x-3,y-19],[x+2,y-31]],'#a9bcae',1,.65);line([[x,y],[x+8,y-17]],'#b0c0b2',.8,.6);}
  }else if(s.kind==='ridge'){
   for(let i=0;i<3;i++){const x=-100+i*83,y=i%2*22;line([[x-56,y+24],[x-30,y-11],[x-18,y-40],[x+1,y-61],[x+27,y-13],[x+56,y+25]],'#b5c0b2',1.2,.65);line([[x+1,y-61],[x-3,y-20],[x+12,y+8]],'#c1cbbc',.8,.7);line([[x-50,y+30],[x+52,y+30]],'#d1d8cb',.8,.6);}
  }else{
   line([[-30,12],[31,12],[23,6],[-23,6],[-30,12]],'#b2beb0',1.2,.8);line([[-18,6],[-18,-56],[-12,-64],[18,-64],[18,6]],'#aab8a9',1.4,.75);line([[-11,-55],[10,-55],[10,-5],[-11,-5],[-11,-55]],'#c5cec0',.8,.7);for(let i=0;i<4;i++)line([[-4,-43+i*9],[4,-43+i*9]],'#a6b5a3',1,.6);
  }c.restore();
 }
}
function overlay(c,run,cam,w,h,zoom,line,oval,label,reduced){
 if(!run)return;
 // At most two markers; ordinary off-screen crowds remain unmarked.
 const strong=run.enemies.list().filter(e=>(e.elite||e.boss)&&e.born<=0).sort((a,b)=>Number(b.boss)-Number(a.boss)||Math.hypot(a.x-run.p.x,a.y-run.p.y)-Math.hypot(b.x-run.p.x,b.y-run.p.y));
 let count=0;for(const e of strong){const dx=(e.x-cam.x)*zoom,dy=(e.y-cam.y)*zoom,rx=Math.max(40,w/2-65),ry=Math.max(40,h/2-165);if(Math.abs(dx)<rx&&Math.abs(dy)<ry)continue;const k=Math.min(rx/(Math.abs(dx)||1),ry/(Math.abs(dy)||1)),x=w/2+dx*k,y=h/2+dy*k,a=Math.atan2(dy,dx);c.save();c.translate(x,y);c.rotate(a);line([[-7,-5],[0,0],[-7,5]],e.boss?'#9b5f50':'#927f56',1.8,.85);c.restore();label(e.boss?'首领':'精英',x,y+18,e.boss?'#9b5f50':'#857859',10);if(++count>=2)break;}
 if(run.cool.harvest>0){label('破敌收息 · 附近经验汇入',w/2,h-152,'#638474',12);}
}
root.XJFieldArt={ground,overlay};
})(window);
