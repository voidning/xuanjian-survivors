/* Fruit presentation: bounded deterministic brush geometry; no simulation writes.
 * All entry points use world coordinates and must run outside actor transforms.
 * Formation duration is owned by the caller (recommended fruit life: 2.8 s).
 */
(function(root){'use strict';
const TAU=Math.PI*2,GOLD='#ad8941',PALE='#fff4cd',INK='#645d49',JADE='#467f7b',WATER='#a1c3b6';
const clamp=v=>Math.max(0,Math.min(1,v));
function arc(c,x,y,r,a,b,col,w=1,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();c.arc(x,y,Math.max(0,r),a,b);c.strokeStyle=col;c.lineWidth=w;c.stroke();c.restore();}
function fill(c,p,col,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=col;c.fill();c.restore();}
function gate(c,line,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);
fill(c,[[-19,-21],[0,-28],[19,-21],[15,-17],[-15,-17]],INK,.82);
line([[-23,-22],[0,-29],[23,-22]],GOLD,2);line([[-17,-19],[17,-19]],PALE,1.6);
for(const side of [-1,1]){fill(c,[[side*15,-17],[side*10,-17],[side*10,17],[side*16,20]],GOLD,.8);line([[side*12,-16],[side*12,16]],PALE,1.3);line([[side*19,20],[side*7,20]],INK,1.6);}
line([[-10,-12],[10,-12]],GOLD,1.2);line([[-5,-9],[-5,-1],[5,-1],[5,-9]],PALE,1.2);c.restore();}
function seal(c,line,x,y,col,s=1){c.save();c.translate(x,y);c.scale(s,s);line([[0,-7],[6,0],[0,7],[-6,0],[0,-7]],col,1.1);line([[-3,0],[3,0],[0,-3],[0,3]],col,1);c.restore();}
function effect(c,run,f,line,oval,label,reduced){
 if(f.kind==='dashengSweep'||f.kind==='dashengEcho'){
 const q=clamp(f.age/f.life),a=f.angle||0,half=f.half||1.3,col=f.kind==='dashengEcho'?'#c7b984':'#a28a50';c.save();c.globalAlpha*=Math.max(0,1-q)*.65;
 arc(c,f.x,f.y-16,f.r,a-half,a+half,col,f.strong?3:1.8,.75);
 const t=reduced?a:a-half+half*2*q;line([[f.x,f.y-16],[f.x+Math.cos(t)*f.r,f.y-16+Math.sin(t)*f.r]],col,2,.5);c.restore();return true;}

 if(f.kind==='foundationGate'){
  const q=clamp((f.age||0)/(f.life||1)),r=Math.max(0,f.r||0),size=Math.min(.72,r/42),drop=reduced?0:(1-clamp(q*4))*8;
  c.save();c.globalAlpha*=reduced?.5:Math.min(1,q*8,(1-q)*4)*.58;
  c.save();c.translate(f.x,f.y-8-drop);c.scale(size,size);
  line([[-23,-22],[0,-29],[23,-22]],GOLD,1.5);line([[-18,-18],[18,-18]],PALE,1.2);
  for(const side of [-1,1])line([[side*15,-18],[side*15,18],[side*8,18]],GOLD,1.4);
  line([[-9,-12],[9,-12]],GOLD,1);c.restore();
  for(const side of [-1,1])line([[f.x+side*17*size,f.y+11*size],[f.x+side*17*size,f.y+18*size],[f.x+side*12*size,f.y+14*size]],GOLD,1,.6);
  c.restore();return true;
 }
 if(f.kind==='realmRise')return realmRise(c,run,f,line,oval,label,reduced);
 if(!['fruit','sixfoldEdict','rainBreak'].includes(f.kind))return false;
 const q=clamp((f.age||0)/(f.life||1)),open=reduced?1:1-Math.pow(1-clamp(q*2.9),3),fade=Math.min(1,(1-q)*4),x=f.x,y=f.y,r=Math.max(20,f.r||86);
 c.save();c.globalAlpha*=fade;
 if(f.kind==='fruit'){
  const water=f.dao==='渌水',col=water?JADE:GOLD,R=Math.min(r,170)*(.68+.32*open);
  c.globalAlpha*=reduced?.85:clamp(q*10);
  // The open centre preserves bodies and projectiles; ink lives on the perimeter.
  if(!water){
   for(let i=0;i<6;i++){const a=i*TAU/6-Math.PI/2,xx=x+Math.cos(a)*R,yy=y+Math.sin(a)*R*.63;seal(c,line,xx,yy,GOLD,1.2);line([[xx,yy-22],[xx,yy-40]],PALE,2,.8);}
   line([[x-18,y-69],[x-12,y-81],[x,y-72],[x+12,y-81],[x+18,y-69]],GOLD,2);
  }else{
   for(let i=0;i<4;i++){const rr=R*(.53+i*.15),phase=reduced?0:q*.3;arc(c,x,y,rr,i*.9+phase,i*.9+phase+2.2,JADE,1.2,.52);arc(c,x,y,rr-3,i*.9+.12+phase,i*.9+1.6+phase,WATER,2,.72);}
   for(let i=0;i<18;i++){const a=i*2.399,rr=R*(.58+.36*((i%5)/4)),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.7,drop=reduced?0:(1-open)*28;line([[xx+3,yy-16-drop],[xx-2,yy-4-drop]],JADE,1.2,.7);if(i%3===0)oval(xx-2,yy,10,2.8,WATER,true,1);}
   for(const side of [-1,1]){line([[x+side*17,y-73],[x+side*31,y-80],[x+side*46,y-77],[x+side*55,y-83]],JADE,1.4,.8);line([[x+side*20,y-69],[x+side*41,y-72]],WATER,1.8);}
   seal(c,line,x,y-80,JADE,1.1);
  }
  label(f.title||(water?'渌水成果':'明阳成果'),x,y-Math.min(R*.63+49,151),col,18);
  label('五法同参 · 果位成型',x,y-Math.min(R*.63+31,133),col,10);
 }
 if(f.kind==='sixfoldEdict'){
  const spread=reduced?1:open;
  for(let i=0;i<6;i++){const a=i*TAU/6,dx=Math.cos(a),dy=Math.sin(a),near=r*.45,far=r*(.72+.28*spread);line([[x+dx*near,y+dy*near],[x+dx*far,y+dy*far]],GOLD,2.2,.7);line([[x+dx*far-dy*8,y+dy*far+dx*8],[x+dx*(far+8),y+dy*(far+8)],[x+dx*far+dy*8,y+dy*far-dx*8]],PALE,1.5,.9);}
  seal(c,line,x,y-64,GOLD,1.3);
 }
 if(f.kind==='rainBreak'){
  for(let i=0;i<6;i++){const a=i*TAU/6,rr=18+(reduced?7:open*13);c.save();c.translate(x+Math.cos(a)*rr,y-19+Math.sin(a)*rr);c.rotate(a);line([[-3,-5],[1,0],[-3,5]],JADE,1.6);c.restore();}
  line([[x-8,y-44],[x-2,y-30],[x-6,y-21],[x+4,y-12]],WATER,2);label('雨蚀 · 破护',x,y-57,JADE,10);
 }
 c.restore();return true;
}
function zone(c,run,z,line,oval,label,reduced){
 if(z.kind!=='rain'||!z.fruitRain)return false;
 const r=Math.max(0,z.r||0),age=z.age||0,remaining=Number.isFinite(z.life)?clamp((z.life-age)*2):1;
 c.save();c.globalAlpha*=remaining;
 // Exact circular combat boundary. Clip every drop and ripple to that boundary.
 c.beginPath();c.arc(z.x,z.y,r,0,TAU);c.fillStyle='#60978e';c.save();c.globalAlpha*=.055;c.fill();c.restore();c.strokeStyle=JADE;c.lineWidth=1.5;c.stroke();c.clip();
 for(let i=0;i<3;i++){const rr=r*(.4+i*.2),phase=reduced?0:age*.1;arc(c,z.x,z.y,rr,i*1.9+phase,i*1.9+phase+1.55,WATER,1.3,.6);}
 const n=reduced?20:38;
 for(let i=0;i<n;i++){const a=i*2.399,rr=Math.sqrt((i+.5)/n)*r*.94,xx=z.x+Math.cos(a)*rr,yy=z.y+Math.sin(a)*rr+(reduced?0:(age*58+i*11)%29-14);line([[xx+3,yy-9],[xx-1,yy+3]],i%4?JADE:WATER,i%4?1:1.6,.48);if(i%7===0)oval(xx-1,yy+6,7,2,WATER,true,1);}
 c.restore();c.save();c.globalAlpha*=remaining;
 for(let i=0;i<8;i++){const a=i*TAU/8;arc(c,z.x,z.y,r,a-.055,a+.055,WATER,3,.9);}
 label('渌水 · 雨蚀护持',z.x,z.y+r-13,JADE,10);c.restore();return true;
}
function ally(){return false;}
// Realm presentation depends only on attained same-dao ranks, never fruit powers.
function realmStyle(dao){if(dao==='lihuo')return {col:'#b77b43',edge:'#e7b36f',water:false};if(dao==='duijin')return {col:'#8e999c',edge:'#d5ded8',water:false};return dao==='lushui'?{col:'#769e8c',edge:WATER,water:true}:{col:'#bba46b',edge:'#dfc990',water:false};}
function realmMark(c,line,x,y,style){
 if(style.water){line([[x-3,y-3],[x,y-6],[x+3,y-3],[x,y+3],[x-3,y-3]],style.col,1.1);line([[x-4,y+5],[x,y+6],[x+4,y+5]],style.edge,1);}
 else{line([[x,y-5],[x+4,y],[x,y+5],[x-4,y],[x,y-5]],style.col,1.1);line([[x-2,y],[x+2,y]],style.edge,1);}
}
function realmLayers(c,line,oval,x,y,count,style,scale=1){
 const r=31*scale;
 // A narrow, unfilled circle sits behind the body, above the ground hazard plane.
 if(count>0){arc(c,x,y-27,r,0,TAU,style.col,1,.33);arc(c,x,y-27,r-3,-2.6,-.55,style.edge,1,.25);}
 if(count>=3){
  const n=count>=5?5:count>=4?4:3,points=[];
  for(let i=0;i<n;i++){const a=-Math.PI/2+i*TAU/n;points.push([x+Math.cos(a)*(r+5),y-27+Math.sin(a)*(r+5)]);}
  if(count>=4)line([...points,points[0]],style.col,.8,.24);
  c.save();c.globalAlpha*=.65;points.forEach(([xx,yy])=>realmMark(c,line,xx,yy,style));c.restore();
  if(count>=5)arc(c,x,y-27,r+10,0,TAU,style.edge,1,.48);
 }
}
function giftMark(c,run,p,line,oval,reduced){
 const id=run.gift;if(!id||id==='cloud')return;
 const colors={whale:'#578d9d',life:'#a76254',sparrow:'#a97845',sunseal:'#b89948'};if(!colors[id])return;
 const x=p.x+23,y=p.y-36,col=colors[id];c.save();c.globalAlpha*=run.cool?.hidden>0?.35:.85;
 if(!reduced&&((id==='life'&&run.cool.burst>0)||(id==='sparrow'&&run.cool.brave>0)))c.globalAlpha*=.8+.2*Math.sin(run.t*3);
 if(id==='whale'){for(let i=0;i<3;i++)line([[x-7,y+i*4],[x-3,y-2+i*4],[x+2,y+1+i*4],[x+7,y-1+i*4]],col,1.3);}
 if(id==='life'){line([[x,y-7],[x+6,y],[x,y+8],[x-6,y],[x,y-7]],col,1.4);line([[x-2,y-3],[x+2,y],[x-2,y+3]],col,1.2);}
 if(id==='sparrow'){line([[x-10,y-5],[x-5,y+3],[x,y],[x+5,y+3],[x+10,y-5]],col,1.5);line([[x,y],[x,y+7]],col,1.2);}
 if(id==='sunseal'){oval(x-3,y,5,5,col,true,1.2);arc(c,x+5,y,5,-1.3,1.3,col,1.4);}
 c.restore();
}
function aura(c,run,p,line,oval,label,reduced){
 for(const l of run.dashengLights||[]){c.save();c.globalAlpha*=Math.min(1,l.life)*.8;const a=l.angle||0,x=l.x,y=l.y-16;line([[x-Math.cos(a)*12,y-Math.sin(a)*12],[x+Math.cos(a)*12,y+Math.sin(a)*12]],'#c7b77c',2);arc(c,x,y,9,a-.8,a+.8,'#e1d3a3',2);c.restore();}
 giftMark(c,run,p,line,oval,reduced);
 if(!['mingyang','lushui','lihuo','duijin'].includes(run.dao))return false;
 const count=typeof run.masteredCount==='function'?Math.max(0,Math.min(5,run.masteredCount())):0,style=realmStyle(run.dao);
 c.save();if(run.cool?.hidden>0)c.globalAlpha*=.48;
 // Only foundation breath shifts slightly; reduced motion fixes both shape and opacity.
 const breath=reduced?0:Math.sin((run.t||0)*1.3);
 for(const side of [-1,1])arc(c,p.x,p.y-25,23+breath*.6,side<0?2.35:-.8,side<0?3.95:.8,style.col,1.3,.18+breath*.025);
 realmLayers(c,line,oval,p.x,p.y,count,style);c.restore();return true;
}
function realmRise(c,run,f,line,oval,label,reduced){
 const q=clamp((f.age||0)/(f.life||1)),style=realmStyle(f.dao||run.dao),count=Math.max(1,Math.min(5,f.count||1));
 // One small expansion and return; reduced motion is a static seal for its lifetime.
 const spread=reduced?0:Math.sin(q*Math.PI),fade=reduced?1:Math.min(1,q*7,(1-q)*5);
 c.save();c.globalAlpha*=fade*.62;
 realmLayers(c,line,oval,f.x,f.y,count,style,1+spread*.16);
 arc(c,f.x,f.y-27,43+spread*7,-Math.PI*.9,-Math.PI*.1,style.edge,1,.7);
 label(f.title||run.realm||'境界提升',f.x,f.y-82,style.col,13);
 c.restore();return true;
}
function enemy(c,run,e,line,oval,label,reduced){
 // No shield => no visual assertion of rain suppression, regardless of stale data.
 if(!e.shield)return false;
 const pressure=clamp(e.rainPressure||0),broken=e.rainBroken>0;if(!pressure&&!broken)return false;
 c.save();c.globalAlpha*=broken?.82:.35+pressure*.5;
 if(broken){for(const side of [-1,1])line([[e.x+side*17,e.y-41],[e.x+side*23,e.y-32],[e.x+side*18,e.y-25]],JADE,1.7);line([[e.x-5,e.y-45],[e.x+1,e.y-35],[e.x-3,e.y-27]],WATER,1.7);}
 else{arc(c,e.x,e.y-19,27,-Math.PI/2,-Math.PI/2+TAU*pressure,JADE,1.7);for(let i=0;i<3;i++)line([[e.x-9+i*9,e.y-52],[e.x-11+i*9,e.y-45]],JADE,1.2);}
 c.restore();return true;
}
root.XJFruitArt={effect,zone,ally,aura,enemy};
})(window);
