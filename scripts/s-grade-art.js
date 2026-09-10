/* S-grade presentation only. Existing effect lifetimes/radii remain authoritative. */
(function(root){'use strict';
const TAU=Math.PI*2;
function arc(c,x,y,r,a,b,color,w,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.arc(x,y,r,a,b);c.stroke();c.restore();}
function facet(c,points,color,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();c.restore();}
function flame(c,x,y,size,lean=0){c.save();c.translate(x,y);c.scale(size,size);c.beginPath();c.moveTo(-8,7);c.bezierCurveTo(-20,-7,6+lean,-19,2+lean,-42);c.bezierCurveTo(23,-23,4,-14,13,-7);c.bezierCurveTo(19,13,-3,19,-8,7);c.fillStyle='#48444f';c.fill();c.strokeStyle='#a18b62';c.lineWidth=1.4;c.stroke();c.beginPath();c.moveTo(-3,6);c.quadraticCurveTo(-8,-3,5,-22);c.quadraticCurveTo(1,-5,7,1);c.quadraticCurveTo(8,11,-3,6);c.fillStyle='#c7ad72';c.fill();c.restore();}
function effect(c,run,f,line,oval,label,reduced){
const kinds=['light','thunder','spring','dew','anglerCast','perilRise','zhimingAwaken','zhimingStrike','zhimingSeal'];if(!kinds.includes(f.kind))return false;
const q=Math.min(1,f.age/f.life),t=reduced?.45:1-Math.pow(1-q,3),fade=reduced?Math.min(1,(1-q)*3):Math.sin(Math.PI*Math.min(1,q*1.6))*.35+(1-q)*.65;
const crowded=run.fx.list().filter(e=>kinds.includes(e.kind)&&e.kind!=='zhimingSeal').length>3;c.save();c.globalAlpha*=Math.max(0,fade)*(crowded?.72:1);const x=f.x,y=f.y,r=f.r;
if(f.kind==='light'){
// Six broken gates leave the centre open; no full-screen wash.
for(let i=0;i<6;i++){const a=i*TAU/6,R=r*(.35+.65*t),px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;c.save();c.translate(px,py);c.rotate(a+Math.PI/2);facet(c,[[-15,-16],[15,-16],[12,-9],[-12,-9]],'#b99a58',.8);facet(c,[[-12,-9],[-7,-9],[-7,10],[-12,14]],'#d4bd80',.65);facet(c,[[7,-9],[12,-9],[12,14],[7,10]],'#907446',.65);line([[-12,9],[-12,-10],[12,-10],[12,9]],'#9b834a',2);line([[-17,-14],[17,-14]],'#d6c48a',2.5);line([[-6,-7],[-6,4],[6,4],[6,-7]],'#faf0c6',1.4);c.restore();arc(c,x,y,R-5,a+.14,a+.72,'#d6ba72',reduced?3:7,.16);arc(c,x,y,R,a+.12,a+.8,'#aa9253',1.7,.75);if(!reduced)line([[x+Math.cos(a)*R*.7,y+Math.sin(a)*R*.7],[px,py]],'#d0bb7c',1,.45);}
}
if(f.kind==='thunder'){
for(let i=0;i<(reduced?6:9);i++){const a=i*TAU/(reduced?6:9)+.13,R=r*(.45+.55*t),ux=Math.cos(a),uy=Math.sin(a),p=[[x+ux*27,y+uy*27],[x+ux*R*.34-uy*15,y+uy*R*.34+ux*15],[x+ux*R*.52+uy*10,y+uy*R*.52-ux*10],[x+ux*R*.7,y+uy*R*.7],[x+ux*R,y+uy*R]];line(p,'#7c72b4',reduced?5:9,.13);line(p,'#555174',4.5,.85);line(p,'#c7c2eb',2.4);line(p,'#fff8e5',.9);if(!reduced&&!crowded){const tip=p[p.length-1];facet(c,[[tip[0]-4,tip[1]],[tip[0],tip[1]-9],[tip[0]+4,tip[1]],[tip[0],tip[1]+9]],'#ded8f2',.65);}if(!reduced)line([p[2],[p[2][0]+ux*21-uy*16,p[2][1]+uy*21+ux*16]],'#9489ac',1);}
}
if(f.kind==='spring'||f.kind==='dew'){
const dew=f.kind==='dew',R=dew?r*(.3+.7*t):r*(.65+.35*t);for(let i=0;i<3;i++){const a=i*TAU/3+(reduced?0:q*.65);arc(c,x,y,R*(1-i*.17),a,a+1.7,'#739ea9',reduced?4:8,.22);arc(c,x,y,R*(1-i*.17),a,a+1.7,'#527d89',2);arc(c,x,y,R*(1-i*.17)-3,a+.12,a+1.3,'#edf2e7',1.3);}
for(let i=0;i<6;i++){const a=i*TAU/6,px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;c.save();c.translate(px,py);c.rotate(a);line([[-4,0],[0,-8],[4,0],[0,5],[-4,0]],dew?'#94b7ac':'#819fb4',1.4);c.restore();}
}
if(f.kind==='anglerCast'){
const tx=f.tx,ty=f.ty;if(Number.isFinite(tx)&&Number.isFinite(ty)){c.beginPath();c.moveTo(x,y-22);c.quadraticCurveTo((x+tx)/2,(y+ty)/2-70,tx,ty);c.strokeStyle='#829d9a';c.lineWidth=1.3;c.stroke();for(let i=0;i<3;i++)arc(c,tx,ty,12+i*11+t*12,i*.8,i*.8+4,'#689297',1.3,1-i*.2);line([[tx,ty-17],[tx+5,ty-7],[tx,ty+1],[tx-5,ty-7],[tx,ty-17]],'#c6b276',2);}
}
if(f.kind==='perilRise'){
for(let i=0;i<7;i++){const a=i*TAU/7,R=r*(1-.12*t),px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;facet(c,[[px-17,py+5],[px-9,py-13],[px-3,py-7],[px+6,py-25],[px+18,py+5]],'#7c9091',.35);facet(c,[[px+6,py-25],[px+3,py-6],[px+18,py+5]],'#405e65',.45);line([[px-17,py+5],[px-9,py-13],[px-3,py-7],[px+6,py-25],[px+18,py+5]],'#6d8586',1.7,.85);line([[px+6,py-25],[px+3,py-6],[px+12,py+2]],'#b1bcb0',1.2);arc(c,x,y,R,a+.14,a+.64,'#94aaa1',1.3);}
}
if(f.kind==='zhimingAwaken'){
for(let i=0;i<(reduced?3:5);i++){const a=i*TAU/(reduced?3:5),R=27+t*10;flame(c,x+Math.cos(a)*R,y-14+Math.sin(a)*R*.55,.7,i-2);}oval(x,y,34,10,'#99865e',true,1.5);
}
if(f.kind==='zhimingStrike'){
// Tapered falling flame, not a lightning bolt or an additional damage area.
const drop=reduced?0:(1-t)*16;c.save();c.translate(x,y-12-drop);c.rotate(-.28);facet(c,[[-10,-64],[10,-47],[8,-24],[2,10],[-9,-13],[-16,-35]],'#403d48',.9);facet(c,[[1,-59],[8,-45],[4,-16],[2,10],[-3,-15]],'#bb9c5e');facet(c,[[4,-44],[3,-22],[2,7],[0,-18]],'#f4dfaa');c.restore();
for(let i=0;i<(reduced?2:4);i++){const a=i*TAU/4;flame(c,x+Math.cos(a)*(13+t*11),y-10+Math.sin(a)*11,.34,i-2);}
if(!reduced&&!crowded)for(let i=0;i<6;i++){const a=i*TAU/6,px=x+Math.cos(a)*(18+t*16),py=y-13+Math.sin(a)*(18+t*16);facet(c,[[px,py-4],[px+2,py],[px,py+5],[px-2,py]],'#bba477',.8);}
}
if(f.kind==='zhimingSeal'){
const w=reduced?10:10+Math.max(0,1-q*5)*7,yy=y-49;
line([[x-w,yy-9],[x-w,yy+4],[x-3,yy+4]],'#625563',2);line([[x+w,yy-9],[x+w,yy+4],[x+3,yy+4]],'#625563',2);facet(c,[[x,yy-10],[x+4,yy-5],[x,yy],[x-4,yy-5]],'#c1a36c');label('断法',x,y-65,'#554750',10);
}
c.restore();return true;
}
root.XJSGradeArt={effect};
})(window);
