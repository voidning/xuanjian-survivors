/* Small world-space seals. No additional particles or full-screen glow. */
(function(root){'use strict';
const colors={might:'#87684b',omen:'#ac7447',rainbow:'#84957b',greed:'#967250',frostpine:'#688f85',sparrow:'#997a66',life:'#965d60',whale:'#567e8f',cloud:'#799b9b',sunseal:'#b09759'};
function draw(c,run,line,oval,reduced=false){
 c.save();run.fx.forEach(f=>{if(f.kind!=='giftPulse')return;const q=Math.min(1,f.age/f.life),r=reduced?20:12+q*20,col=colors[f.gift]||'#78918a';c.globalAlpha=(1-q)*.75;
 if(f.gift==='rainbow'){for(let i=0;i<3;i++){c.beginPath();c.strokeStyle=['#7999a5','#a1927d','#809477'][i];c.lineWidth=1.4;c.arc(f.x,f.y-20,r+i*4,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
 else if(f.gift==='greed'){for(let i=0;i<3;i++){const a=i*Math.PI*2/3,rr=reduced?16:30-q*18;line([[f.x+Math.cos(a)*rr,f.y-20+Math.sin(a)*rr],[f.x+Math.cos(a+.5)*(rr+6),f.y-20+Math.sin(a+.5)*(rr+6)]],col,1.8);}}
 else if(f.gift==='frostpine'){line([[f.x,f.y-30],[f.x,f.y-42]],col,1.5);for(let i=0;i<3;i++){const y=f.y-32-i*4;line([[f.x-5,y+2],[f.x,y-1],[f.x+5,y+2]],col,1.3);}}
 else if(f.gift==='might'){for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;line([[f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.45],[f.x+Math.cos(a+.1)*(r+7),f.y+Math.sin(a+.1)*(r+7)*.45]],col,2);}}
 else if(f.gift==='sparrow'||f.gift==='cloud'){line([[f.x-r,f.y],[f.x-r*.45,f.y-5],[f.x,f.y-2]],col,1.6);line([[f.x+r,f.y],[f.x+r*.45,f.y-5],[f.x,f.y-2]],col,1.6);}
 else {line([[f.x-7,f.y-r],[f.x,f.y-r-5],[f.x+7,f.y-r]],col,1.8);oval(f.x,f.y+3,r,r*.25,col,true,1.3);}
 });c.globalAlpha=1;
 if(run.gift==='omen'&&run.giftThreat){const p=run.p,t=run.giftThreat,a=Math.atan2(t.y-p.y,t.x-p.x),ux=Math.cos(a),uy=Math.sin(a),x=p.x+ux*34,y=p.y+uy*34;const points=[[x-uy*5-ux*4,y+ux*5-uy*4],[x+ux*4,y+uy*4],[x+uy*5-ux*4,y-ux*5-uy*4]];line(points,'#faf4dc',4);line(points,colors.omen,2);}
 c.restore();
}
root.XJGiftArt={draw};
})(window);
