/* Allied fields have one presentation owner. Combat geometry is unchanged. */
(function(root){'use strict';
const kinds=new Set(['dusk','edict','rain','angler','peril','fragrance','screen','suppress','mountain','grove']);
function zone(c,run,z,line,oval,label,reduced){if(!kinds.has(z.kind))return false;const t=reduced?0:z.age,r=z.r,fade=Math.min(1,Math.max(0,(z.life-z.age)*2));c.save();c.globalAlpha*=fade;
// Clip textures to their true footprint; a clipping path is never stroked.
c.beginPath();c.arc(z.x,z.y,r,0,Math.PI*2);c.clip();
if(z.kind==='rain'){const n=reduced?12:z.fruitRain?26:17;for(let i=0;i<n;i++){const a=i*2.399,rr=Math.sqrt((i+.5)/n)*r*.94,x=z.x+Math.cos(a)*rr,y=z.y+Math.sin(a)*rr+(t*47+i*11)%23-11;line([[x+3,y-9],[x-1,y+3]],z.fruitRain?'#397975':'#649591',z.fruitRain?1.5:1,.55);} }
if(z.kind==='dusk'){c.globalAlpha*=.05;oval(z.x,z.y,r,r,'#aa766a');c.globalAlpha/= .05;for(let i=0;i<6;i++){const a=i*2.399,x=z.x+Math.cos(a)*r*.68,y=z.y+Math.sin(a)*r*.68;line([[x-10,y+3],[x-3,y],[x+9,y+2]],'#ac8277',1,.35);}}
if(z.kind==='edict'){const x=z.x,y=z.y;line([[x,y+2],[x,y-55]],'#8d7846',1.8,.8);line([[x,y-53],[x+24,y-47],[x+20,y-30],[x,y-36]],'#ac9154',2,.85);label('令',x+10,y-39,'#857044',10);}
if(z.kind==='angler'){line([[z.x,z.y-46],[z.x,z.y-17],[z.x+4,z.y-13],[z.x+8,z.y-18]],'#628391',1.5,.85);oval(z.x,z.y-8,5,6,'#faf7e9');line([[z.x-9,z.y+4],[z.x,z.y+6],[z.x+9,z.y+4]],'#628391',1,.5);}
if(['peril','mountain'].includes(z.kind)){for(let i=0;i<4;i++){const a=i*Math.PI/2+.7,x=z.x+Math.cos(a)*r*.72,y=z.y+Math.sin(a)*r*.72;line([[x-17,y+5],[x-6,y-20],[x+1,y-7],[x+8,y-13],[x+19,y+5]],'#72898b',1.5,.7);line([[x-6,y-20],[x-3,y+1]],'#9baaa0',1,.5);}}
if(z.kind==='fragrance'){for(let i=0;i<5;i++){const a=i*2.399,x=z.x+Math.cos(a)*r*.65,y=z.y+Math.sin(a)*r*.65,w=Math.sin(t*2+i)*3;const p=[[x-6,y+8],[x+w,y-4],[x-3,y-16],[x+3,y-24]];line(p,'#827e93',2.8,.6);line(p,'#faf7ed',1.3,.9);}}
if(z.kind==='screen'){for(let i=0;i<8;i++){const x=z.x-88+i*25,y=z.y-26+Math.abs(i-3.5)*5;line([[x,y+30],[x,y-35],[x+23,y-35],[x+23,y+30]],'#709292',1.5,.7);line([[x+4,y+8],[x+11,y-10],[x+18,y+4]],'#709292',1,.6);}}
if(z.kind==='grove'){for(let i=0;i<5;i++){const a=i*2.4,x=z.x+Math.cos(a)*r*.6,y=z.y+Math.sin(a)*r*.6;line([[x,y+8],[x,y-19],[x+8,y-26]],'#789679',1.3,.65);}}
if(z.kind==='suppress'){for(let i=0;i<4;i++){const a=i*Math.PI/2;line([[z.x+Math.cos(a)*r*.65,z.y+Math.sin(a)*r*.65],[z.x+Math.cos(a)*r*.8,z.y+Math.sin(a)*r*.8]],'#83917b',1,.5);}}
c.restore();
// Dusk is an actionable edge (return wounds / blink). Keep one exact outline.
if(z.kind==='dusk'){const d=Math.hypot(run.p.x-z.x,run.p.y-z.y),near=Math.abs(d-r)<65;c.save();c.globalAlpha*=fade*(near?.85:.45);oval(z.x,z.y,r,r,'#9d655b',true,near?1.7:1);c.restore();}
return true;}
root.XJClearArt={zone};
})(window);
