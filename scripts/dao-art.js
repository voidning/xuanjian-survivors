/* Game-native outlines. No opaque fields over hostile danger markers. */
(function(root){'use strict';
const fire='#b67b48',metal='#788c91';
function zone(c,run,z,line,oval,label,reduced){if(!['fireNet','fireMarch','metalCourt','metalBlades'].includes(z.kind))return false;c.save();const col=z.kind.startsWith('fire')?fire:metal;
 if(z.kind==='fireNet'){
  for(let k=1;k<=3;k++){const rr=z.r*k/3,alpha=z.age>k*.5?.6:.25;oval(z.x,z.y,rr,rr,col,true,1);for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr],[z.x+Math.cos(a+Math.PI/3)*rr,z.y+Math.sin(a+Math.PI/3)*rr]],col,1,alpha);}}
 }else if(z.kind==='fireMarch'){
  c.setLineDash([12,7]);oval(z.x,z.y,z.r,z.r,col,true,1.4);c.setLineDash([]);line([[z.x,z.y-40],[z.x,z.y+8]],col,2,.6);line([[z.x,z.y-40],[z.x+27,z.y-34],[z.x,z.y-21]],col,1.6,.8);
 }else if(z.kind==='metalCourt'){
  c.setLineDash([26,13]);oval(z.x,z.y,z.r,z.r,col,true,1.4);c.setLineDash([]);
  for(let i=0;i<10;i++){const a=i*Math.PI/5+(reduced?0:z.age*.15),rr=z.r*.73,x=z.x+Math.cos(a)*rr,y=z.y+Math.sin(a)*rr;line([[x-8,y-3],[x+8,y+3],[x+2,y-7],[x-8,y-3]],col,1,.55);}
 }else{
  for(let i=0;i<16;i++){const a=i*Math.PI/8,q=reduced?1:Math.max(.12,1-((z.age+.25*(i%4))%.65)/.65),rr=z.r*q,x=z.x+Math.cos(a)*rr,y=z.y+Math.sin(a)*rr;line([[x+Math.cos(a)*18,y+Math.sin(a)*18],[x,y],[x+Math.cos(a+.5)*10,y+Math.sin(a+.5)*10]],col,1.6,.8);}
 }
 label(root.XJ.SKILLS.find(s=>s.id===z.kind)?.name||'',z.x,z.y-z.r-9,col,11);c.restore();return true;
}
function effect(c,run,f,line,oval,label,reduced){if(['daoEmber','daoMark','daoBlades'].includes(f.kind)){c.save();c.globalAlpha=Math.max(0,1-f.age/f.life);const col=f.kind==='daoEmber'||f.id==='fireNet'?fire:metal,q=reduced?0:f.age/f.life;if(f.kind==='daoBlades'){const n=f.rank===2?4:2;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=f.r*(1-q*.6);line([[f.x+Math.cos(a)*(r+15),f.y+Math.sin(a)*(r+15)],[f.x+Math.cos(a)*r,f.y+Math.sin(a)*r]],col,2);}}else if(f.kind==='daoEmber'){for(let i=0;i<(f.rank===3?7:3);i++){const x=f.x+(i-1)*12;line([[x-6,f.y+6],[x-9,f.y-7],[x-2,f.y-4],[x+2,f.y-21],[x+7,f.y+6]],col,1.5);}oval(f.x,f.y,f.r,f.r*.6,col,true,1);}else{oval(f.x,f.y,f.r,f.r,col,true,1.3);if(f.rank===2)oval(f.x,f.y,f.r*.6,f.r*.6,col,true,1);line([[f.x-f.r*.6,f.y],[f.x+f.r*.6,f.y]],col,1);}c.restore();return true;}if(!['metalEdge','fireNetClose'].includes(f.kind))return false;c.save();c.globalAlpha=Math.max(0,1-f.age/f.life);if(f.kind==='metalEdge'){const a=f.angle,dx=Math.cos(a),dy=Math.sin(a);line([[f.x,f.y-15],[f.x+dx*f.r,f.y+dy*f.r-15]],metal,3,.8);for(const side of [-1,1])line([[f.x-dy*side*12,f.y+dx*side*12-15],[f.x+dx*f.r,f.y+dy*f.r-15]],'#c8d8d2',1,.85);}else oval(f.x,f.y,reduced?f.r:f.r*(1-f.age/f.life),reduced?f.r:f.r*(1-f.age/f.life),fire,true,2);c.restore();return true;}
function sense(c,run,line,oval,label){const e=run.sensedEnemy?.();if(!e)return;c.save();const x=e.x,y=e.y-62;line([[x-18,y+8],[x-18,y-5],[x-8,y-5]],metal,1.5);line([[x+18,y+8],[x+18,y-5],[x+8,y-5]],metal,1.5);label('金窍 · '+(run.lv('metalHeart')===3?e.title+' '+Math.ceil(e.hp)+'/'+Math.ceil(e.max):'蓄势威胁'),x,y-10,metal,11);c.restore();}
root.XJDaoArt={zone,effect,sense};
})(window);
