/* Bounded procedural strokes. Animation uses simulation time and freezes on pause. */
(function(root){'use strict';
function arc(c,x,y,r,start,end,col,w=1,a=1){c.save();c.globalAlpha*=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.arc(x,y,r,start,end);c.stroke();c.restore();}
function boundary(c,z,col,oval,label,title){
 oval(z.x,z.y,z.r,z.r,col,true,1.3);
 arc(c,z.x,z.y,z.r-5,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,1-z.age/z.life),col,2.5);
 label(title,z.x,z.y-z.r+19,col,11);
}
function zone(c,run,z,line,oval,label){
 if(!['angler','peril','flame','rain'].includes(z.kind))return false;
 c.save();
 if(z.kind==='angler'){
  const col='#678d9d';boundary(c,z,col,oval,label,'溪上翁 · 幻饵');
  // A suspended white lure and hook; outward ripples show attraction, not damage.
  const bob=Math.sin(z.age*4)*3,x=z.x,y=z.y-17+bob;
  line([[x,y-32],[x,y-9],[x+4,y-6],[x+8,y-10]],col,1.6);
  oval(x,y,7,7,'#f4f7f3');oval(x,y,7,7,col,true,1.8);
  for(let i=0;i<3;i++){const q=(z.age*.45+i/3)%1;oval(z.x,z.y,14+q*37,5+q*13,col,true,1);}
  label('趋饵 · 受击清醒',z.x,z.y+z.r-16,col,10);
 }
 if(z.kind==='peril'){
  const col='#587887';boundary(c,z,col,oval,label,'位从险 · 险地');
  // Sparse paired ridges leave the middle of the battlefield readable.
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+Math.PI/4,x=z.x+Math.cos(a)*z.r*.66,y=z.y+Math.sin(a)*z.r*.66;
   const rise=Math.min(1,z.age/.4),h=(22+i%2*9)*rise;
   line([[x-23,y+6],[x-10,y-h],[x-2,y-8],[x+7,y-h*.7],[x+23,y+6]],col,1.5,.75);
   line([[x-10,y-h],[x-9,y-5]],col,1,.4);
  }
  for(let i=0;i<4;i++){
   const r=20+i*16,a=z.age*.5+i*.7;
   arc(c,z.x,z.y,r,a,a+Math.PI*1.25,col,1,.35);
  }
  label('收束 · 域内迟缓',z.x,z.y+z.r-16,col,10);
 }
 if(z.kind==='flame'){
  c.translate(z.x,z.y);c.rotate(z.angle);
  const col='#ba7e49';
  // Thin advancing flame tongues remain within the real hit cone.
  arc(c,0,0,z.r,-z.spread,z.spread,col,1.2,.7);
  for(const sign of [-1,1])line([[12,0],[Math.cos(z.spread)*z.r,Math.sin(z.spread)*z.r*sign]],col,1,.35);
  for(let i=0;i<11;i++){
   const a=-z.spread+(i+.5)*z.spread*2/11,q=(z.age*1.25+i*.137)%1;
   const r=22+q*(z.r-26),length=Math.min(33,r-8),ux=Math.cos(a),uy=Math.sin(a);
   line([[ux*(r-length),uy*(r-length)],[ux*(r-12)-uy*4,uy*(r-12)+ux*4],[ux*r,uy*r]],i%3?'#c28e59':'#d6ae77',1.3,Math.sin(q*Math.PI)*.8);
  }
  c.rotate(-z.angle);label('雉离行 · 吐焰',0,-57,col,10);
 }
 if(z.kind==='rain'){
  const col='#719b97';
  for(let i=0;i<30;i++){
   const a=i*2.4,r=Math.sqrt((i+.5)/30)*z.r*.91,x=z.x+Math.cos(a)*r,y=z.y+Math.sin(a)*r;
   const q=(z.age*1.9+i*.29)%1;
   if(q<.68)line([[x+4,y-16+q*20],[x,y-4+q*20]],col,1.2,.55);
   else{c.globalAlpha=(1-q)*1.7;oval(x,y+9,2+(q-.68)*14,1+(q-.68)*5,col,true,1);c.globalAlpha=1;}
  }
  // The existing feedback layer supplies the exact boundary, title and lifetime.
 }
 c.restore();return true;
}
function effect(c,run,f,line,oval,label){
 if(!['anglerCast','perilRise','enemyHook','thunder','light','gate'].includes(f.kind))return false;
 const q=Math.min(1,f.age/f.life),fade=1-q;c.save();c.globalAlpha=fade;
 if(f.kind==='anglerCast'){
  const x=f.x,y=f.y-27,tx=f.tx,ty=f.ty-20,col='#6c8f9f';
  c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+tx)/2,(y+ty)/2-60*Math.sin(q*Math.PI),tx,ty);c.stroke();
  oval(tx,ty,4+q*6,4+q*6,col,true,1);label('诱引',tx,ty-23,col,10);
 }
 if(f.kind==='perilRise'){
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=f.r*(1-q*.6),x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r;line([[x+Math.cos(a)*16,y+Math.sin(a)*16],[x,y],[x+Math.cos(a+.6)*10,y+Math.sin(a+.6)*10]],'#668491',1.5);}
 }
 if(f.kind==='enemyHook'){
  const dx=f.tx-f.x,dy=f.ty-f.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
  const reach=1-q,x=f.x+dx*reach,y=f.y+dy*reach;
  c.setLineDash([5,3]);line([[f.x,f.y],[x,y]],'#b77659',2);c.setLineDash([]);
  line([[x-ux*12-uy*6,y-uy*12+ux*6],[x,y],[x-ux*5+uy*7,y-uy*5-ux*7]],'#b77659',2.2);
 }
 if(f.kind==='thunder'){
  const col='#9684b0';oval(f.x,f.y,f.r*(.8+q*.2),f.r*(.8+q*.2),col,true,1);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,r=f.r*(.25+Math.min(1,q*3)*.75),ux=Math.cos(a),uy=Math.sin(a);
   const points=[[f.x+ux*15,f.y+uy*15],[f.x+ux*r*.36-uy*13,f.y+uy*r*.36+ux*13],[f.x+ux*r*.62+uy*10,f.y+uy*r*.62-ux*10],[f.x+ux*r,f.y+uy*r]];
   line(points,col,2.2);if(i%2===0)line([points[1],[f.x+ux*r*.5-uy*31,f.y+uy*r*.5+ux*31]],col,1.1,.65);
  }
 }
 if(f.kind==='light'){
  const col='#baa04c';for(let i=0;i<6;i++){
   const a=i*Math.PI/3,r=f.r*(.85+.15*Math.min(1,q*3)),x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r;
   line([[x,y+8],[x,y-32-Math.sin(q*Math.PI)*22]],col,2.1);
   arc(c,f.x,f.y,r,a+.1,a+Math.PI/3-.1,col,1.3);
  }
  oval(f.x,f.y,28+q*28,10+q*10,col,true,1.4);
 }
 if(f.kind==='gate'){
  const col='#b19a59',rise=Math.min(1,q*5),y=f.y;
  for(const side of [-1,1]){const x=f.x+side*25;line([[x,y],[x,y-70*rise]],col,2.6);line([[x+side*5,y],[x+side*5,y-70*rise]],col,1,.5);}
  if(q>.12){const across=Math.min(1,(q-.12)*6);line([[f.x-35,y-75],[f.x-35+70*across,y-75]],col,2.4);}
  if(q>.2)line([[f.x-25,y-70],[f.x+25*Math.min(1,(q-.2)*7),y-70]],col,2);
  for(let i=0;i<4;i++){const x=f.x-18+i*12;line([[x,y-5],[x,y-10-35*rise]],col,1,.3);}
 }
 c.restore();return true;
}
root.XJExpansionArt={zone,effect};
})(window);
