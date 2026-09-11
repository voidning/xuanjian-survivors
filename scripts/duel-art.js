/* Read-only procedural presentation; no simulation state is modified here. */
(function(root){'use strict';
const ink='#40596c',purple='#846595',danger='#b36c42',gold='#b18b36',paleGold='#ead79b';
function shape(c,points,fill,edge=ink){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=edge;c.lineWidth=1.5;c.stroke();}
function mountain(c,x,y,s,line,oval,alpha=1){c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;
 shape(c,[[-30,8],[-14,-13],[-6,-8],[5,-32],[18,-6],[31,8]],'#e8e9e1','#727d88');
 shape(c,[[-4,-15],[5,-32],[11,-15],[5,-19]],'#fffef7','#9fa9ad');
 for(const side of [-1,1])line([[side*20,0],[side*37,-12],[side*46,-10],[side*31,8]],'#8d99a1',1.5);
 oval(0,10,36,5,'#aab3b7',true,1);c.restore();}
function yehuiActor(c,e,t,line,oval,label,reduced){
 c.save();c.translate(e.x,e.y);c.globalAlpha=e.born>0?.4:1;
 oval(0,3,22,6,'#40596c30');const stride=e.phase==='move'&&e.recover<=0&&!reduced?Math.sin(t*7)*3:0;
 line([[-7,-15],[-10-stride,1]],ink,3);line([[7,-15],[10+stride,1]],ink,3);
 shape(c,[[-9,-51],[-20,-39],[-17,-25],[-23,-5],[-5,-9],[0,-18],[9,-7],[24,-6],[16,-28],[20,-40],[9,-51]],'#3d627e');
 shape(c,[[1,-48],[10,-39],[7,-23],[17,-8],[5,-10],[-3,-31]],'#2b435c');
 line([[-10,-45],[0,-32],[10,-45]],'#bcc3bd',2);line([[-13,-27],[13,-27]],'#a6b8b6',2);
 oval(0,-62,9,11,'#ece6d7');oval(0,-62,9,11,ink,true,1.5);
 line([[-9,-64],[-10,-73],[1,-76],[10,-68],[12,-45]],'#354552',3);
 line([[-10,-67],[-13,-43]],'#354552',2);
 const cast=e.phase==='warn';
 line([[-15,-40],[-24,-33],[cast?-31:-10,cast?-47:-27]],ink,3);
 line([[15,-39],[23,-27],[8,-24]],ink,3);
 line([[-14,-19],[23,-47]],'#b7c6c8',3);line([[-14,-19],[23,-47]],ink,1);
 line([[15,-45],[23,-37]],'#aca17b',2);
 if(cast){if(e.duelCast==='mountain')mountain(c,-31,-55,.35,line,oval);else{oval(-31,-47,8,5,purple,true,2);line([[-41,-48],[-45,-53],[-45,-43],[-41,-48]],purple,1.5);}}
 c.restore();label('邺桧',e.x,e.y-88,ink,12);
 if(e.recover>0)label('收势',e.x,e.y+23,'#497565',11);
 return true;
}
function yumuxianActor(c,e,t,line,oval,label,reduced){
 c.save();c.translate(e.x,e.y);c.globalAlpha=e.born>0?.4:1;
 oval(0,3,24,6,'#8f7b4930');const stride=e.phase==='move'&&e.recover<=0&&!reduced?Math.sin(t*7)*2.5:0;
 line([[-7,-15],[-10-stride,1]],'#7d6b42',3);line([[7,-15],[10+stride,1]],'#7d6b42',3);
 shape(c,[[-10,-52],[-23,-40],[-18,-24],[-25,-4],[-6,-9],[0,-19],[7,-9],[25,-4],[18,-25],[23,-40],[10,-52]],'#faf7e9','#9e8547');
 shape(c,[[-2,-49],[9,-38],[6,-22],[17,-8],[5,-11],[-5,-32]],'#e8d69c','#a9873e');
 line([[-13,-42],[0,-31],[13,-42]],gold,2);line([[-15,-26],[15,-26]],'#c8a654',2);
 oval(0,-63,9,11,'#f0e8d6');oval(0,-63,9,11,'#6d6049',true,1.5);
 line([[-9,-65],[-6,-75],[6,-76],[12,-66],[11,-47]],'#665b49',3);line([[0,-75],[0,-84]],gold,2);oval(0,-85,4,2,paleGold);
 const cast=e.phase==='warn'&&e.duelCast==='spindles';line([[-15,-39],[-24,-32],[cast?-32:-11,cast?-48:-27]],'#756542',3);line([[15,-39],[23,-28],[8,-24]],'#756542',3);
 if(cast){c.save();c.translate(-34,-49);c.rotate(-.35);shape(c,[[-9,0],[0,-5],[9,0],[0,5]],paleGold,gold);c.restore();}
 if(e.duelShield>0&&e.duelPhase===1){const ratio=Math.max(.18,Math.min(1,e.duelShield/120)),radius=31+ratio*5;for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:t*.22),x=Math.cos(a)*radius,y=-27+Math.sin(a)*radius*.56,s=5+ratio*3;oval(x,y,s,s,'#f8edbd');oval(x,y,s,s,gold,true,1.5);oval(x,y,s*.42,s*.42,paleGold,true,1);}}
 if(e.duelShield>0&&e.duelPhase===2){const ratio=Math.max(.2,Math.min(1,e.duelShield/96));c.save();c.globalAlpha=.55+.35*ratio;for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*24,y=-25+Math.sin(a)*12;oval(x,y,10*ratio+3,5*ratio+2,'#edda8d');oval(x,y,10*ratio+3,5*ratio+2,gold,true,1.2);}oval(0,-25,8+ratio*4,5+ratio*2,'#fff4bd');c.restore();}
 c.restore();label('郁慕仙',e.x,e.y-99,gold,12);
 if(e.duelShield>0)label((e.duelPhase===2?'金莲护身 ':'法盾护身 ')+Math.ceil(e.duelShield),e.x,e.y+24,gold,11);
 else if(e.recover>0)label('护身已破 · 趁收势追击',e.x,e.y+24,'#8b6e2f',11);
 return true;
}
function actor(c,e,t,line,oval,label,reduced){if(!e.duelId||e.final)return false;if(e.duelId==='yehui')return yehuiActor(c,e,t,line,oval,label,reduced);if(e.duelId==='yumuxian')return yumuxianActor(c,e,t,line,oval,label,reduced);return false;}
function warning(c,e,line,oval,label){if(!e.duelId||e.final)return false;if(!['yehui','yumuxian'].includes(e.duelId))return false;if(e.phase!=='warn')return true;
 c.save();
 if(e.duelId==='yumuxian'&&e.duelCast==='spindles'){
  const range=e.duelPhase===2?533:481;for(const q of (e.duelShots||[]).slice(0,8)){const x=q.x+q.ax*range,y=q.y+q.ay*range,nx=-q.ay*5,ny=q.ax*5;line([[q.x+nx,q.y+ny],[x+nx,y+ny]],gold,1.5,.9);line([[q.x-nx,q.y-ny],[x-nx,y-ny]],gold,1.5,.9);line([[q.x,q.y],[x,y]],paleGold,3,.35);shape(c,[[q.x-q.ax*6,q.y-q.ay*6],[q.x-q.ay*4,q.y+q.ax*4],[q.x+q.ax*6,q.y+q.ay*6],[q.x+q.ay*4,q.y-q.ax*4]],'#f5e5a8',gold);}
  label('八枚金梭 · 移出金线',e.x,e.y-113,gold,12);
 }else if(e.duelCast==='mountain')for(const q of e.duelTargets||[]){
  c.globalAlpha=.12;oval(q.x,q.y,q.r,q.r,danger);c.globalAlpha=1;oval(q.x,q.y,q.r,q.r,danger,true,2.5);
  c.setLineDash([7,6]);oval(q.x,q.y,q.r+9,q.r+9,danger,true,1);c.setLineDash([]);
  mountain(c,q.x,q.y-30,.9,line,oval,.8);label('东羽山 · 离开此圈',q.x,q.y+q.r+18,danger,12);
 }else if(e.duelCast==='water'){
  const count=e.duelPhase===2?5:3;
  for(let i=0;i<count;i++){const a=Math.atan2(e.ay,e.ax)+(i-(count-1)/2)*.3;
   line([[e.x,e.y],[e.x+Math.cos(a)*554,e.y+Math.sin(a)*554]],purple,2,.7);
  }
  label('南惆水 · 侧移',e.x,e.y-108,purple,12);
 }
 c.restore();return true;
}
function zone(c,z,line,oval){if(z.duelArt!=='mountain')return false;c.save();c.globalAlpha=.17;oval(z.x,z.y,z.r,z.r,danger);c.globalAlpha=1;oval(z.x,z.y,z.r,z.r,danger,true,2);mountain(c,z.x,z.y,.95,line,oval);c.restore();return true;}
function fish(c,b,line,oval){if(!['duelFish','duelSpindle'].includes(b.kind))return false;c.save();c.translate(b.x,b.y-16);c.rotate(Math.atan2(b.vy,b.vx));
 if(b.kind==='duelSpindle'){line([[-22,0],[13,0]],paleGold,3,.7);shape(c,[[-11,0],[0,-6],[12,0],[0,6]],'#f3dda0',gold);oval(0,0,3,3,'#fff5c8');c.restore();return true;}
 oval(-4,0,12,6,'#b2a2bd');oval(-4,0,12,6,purple,true,1.7);
 shape(c,[[-15,0],[-23,-7],[-21,0],[-23,7]],'#b2a2bd',purple);
 oval(8,0,5,5,'#eee9dd');oval(8,0,5,5,purple,true,1.4);line([[9,-2],[10,-2]],ink,1.5);line([[9,2],[10,2]],ink,1.5);
 c.restore();return true;}
root.XJDuelArt={actor,warning,zone,fish};
})(window);
