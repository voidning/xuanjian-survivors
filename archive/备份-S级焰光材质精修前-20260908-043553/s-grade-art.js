/* S-grade presentation only. Existing effect lifetimes/radii remain authoritative. */
(function(root){'use strict';
const TAU=Math.PI*2;
function arc(c,x,y,r,a,b,color,w,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.arc(x,y,r,a,b);c.stroke();c.restore();}
function effect(c,run,f,line,oval,label,reduced){
const kinds=['light','thunder','spring','dew','anglerCast','perilRise','zhimingAwaken','zhimingStrike'];if(!kinds.includes(f.kind))return false;
const q=Math.min(1,f.age/f.life),t=reduced?.45:1-Math.pow(1-q,3),fade=reduced?Math.min(1,(1-q)*3):Math.sin(Math.PI*Math.min(1,q*1.6))*.35+(1-q)*.65;
c.save();c.globalAlpha*=Math.max(0,fade);const x=f.x,y=f.y,r=f.r;
if(f.kind==='light'){
// Six broken gates leave the centre open; no full-screen wash.
for(let i=0;i<6;i++){const a=i*TAU/6,R=r*(.35+.65*t),px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;c.save();c.translate(px,py);c.rotate(a+Math.PI/2);line([[-12,9],[-12,-10],[12,-10],[12,9]],'#9b834a',2);line([[-17,-14],[17,-14]],'#d6c48a',2.5);line([[-6,-7],[-6,4],[6,4],[6,-7]],'#faf0c6',1.4);c.restore();arc(c,x,y,R,a+.12,a+.8,'#aa9253',1.7,.75);if(!reduced)line([[x+Math.cos(a)*R*.7,y+Math.sin(a)*R*.7],[px,py]],'#d0bb7c',1,.45);}
}
if(f.kind==='thunder'){
for(let i=0;i<(reduced?6:9);i++){const a=i*TAU/(reduced?6:9)+.13,R=r*(.45+.55*t),ux=Math.cos(a),uy=Math.sin(a),p=[[x+ux*27,y+uy*27],[x+ux*R*.34-uy*15,y+uy*R*.34+ux*15],[x+ux*R*.52+uy*10,y+uy*R*.52-ux*10],[x+ux*R*.7,y+uy*R*.7],[x+ux*R,y+uy*R]];line(p,'#625c83',3,.7);line(p,'#e6e5f5',1.1);if(!reduced)line([p[2],[p[2][0]+ux*21-uy*16,p[2][1]+uy*21+ux*16]],'#9489ac',1);}
}
if(f.kind==='spring'||f.kind==='dew'){
const dew=f.kind==='dew',R=dew?r*(.3+.7*t):r*(.65+.35*t);for(let i=0;i<3;i++){const a=i*TAU/3+(reduced?0:q*.65);arc(c,x,y,R*(1-i*.17),a,a+1.7,'#668f92',2);arc(c,x,y,R*(1-i*.17)-3,a+.12,a+1.3,'#edf2e7',1.3);}
for(let i=0;i<6;i++){const a=i*TAU/6,px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;c.save();c.translate(px,py);c.rotate(a);line([[-4,0],[0,-8],[4,0],[0,5],[-4,0]],dew?'#94b7ac':'#819fb4',1.4);c.restore();}
}
if(f.kind==='anglerCast'){
const tx=f.tx,ty=f.ty;if(Number.isFinite(tx)&&Number.isFinite(ty)){c.beginPath();c.moveTo(x,y-22);c.quadraticCurveTo((x+tx)/2,(y+ty)/2-70,tx,ty);c.strokeStyle='#829d9a';c.lineWidth=1.3;c.stroke();for(let i=0;i<3;i++)arc(c,tx,ty,12+i*11+t*12,i*.8,i*.8+4,'#689297',1.3,1-i*.2);line([[tx,ty-17],[tx+5,ty-7],[tx,ty+1],[tx-5,ty-7],[tx,ty-17]],'#c6b276',2);}
}
if(f.kind==='perilRise'){
for(let i=0;i<7;i++){const a=i*TAU/7,R=r*(1-.12*t),px=x+Math.cos(a)*R,py=y+Math.sin(a)*R;line([[px-17,py+5],[px-9,py-13],[px-3,py-7],[px+6,py-25],[px+18,py+5]],'#6d8586',1.7,.85);line([[px+6,py-25],[px+3,py-6],[px+12,py+2]],'#b1bcb0',1.2);arc(c,x,y,R,a+.14,a+.64,'#94aaa1',1.3);}
}
if(f.kind==='zhimingAwaken'){
for(let i=0;i<5;i++){const a=i*TAU/5,R=28+t*14,px=x+Math.cos(a)*R,py=y-19+Math.sin(a)*R*.7;line([[px-5,py+8],[px+5,py-5],[px-2,py-17],[px+3,py-28]],'#57535e',3);line([[px-5,py+8],[px+5,py-5],[px-2,py-17]],'#c2ae79',1.3);}oval(x,y,30,9,'#91816a',true,1.5);
}
if(f.kind==='zhimingStrike'){
const p=[[x-23,y-57],[x+11,y-33],[x-5,y-13],[x+7,y+2]];line(p,'#4b4654',7,.8);line(p,'#a28c61',3);line(p,'#e5d5a6',1);for(let i=0;i<(reduced?2:5);i++){const a=i*TAU/5;line([[x+Math.cos(a)*8,y-15+Math.sin(a)*8],[x+Math.cos(a)*(17+t*13),y-15+Math.sin(a)*(17+t*13)]],'#a79876',1.4);}
}
c.restore();return true;
}
root.XJSGradeArt={effect};
})(window);
