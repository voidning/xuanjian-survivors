/* Visual-only brush feedback. Uses simulation time; no random draws or combat changes. */
(function(root){'use strict';
function effect(c,run,f,line,oval,label,reduced){
 if(!['inkImpact','inkFall','sword','bow'].includes(f.kind))return false;
 const q=Math.min(1,f.age/f.life),fade=1-q;c.save();c.globalAlpha*=fade;
 if(f.kind==='inkImpact'){
  const a=f.angle||0,length=reduced?8:7+q*10;
  for(let i=0;i<3;i++){const angle=a+(i-1)*.9,r=length*(i===1?1:.7);line([[f.x+Math.cos(angle)*3,f.y+Math.sin(angle)*3],[f.x+Math.cos(angle)*r,f.y+Math.sin(angle)*r]],i===1?'#4b615b':'#9b7158',i===1?2:1.2);}
 }
 if(f.kind==='inkFall'){
  const n=reduced?3:7,spread=reduced?.25:1-Math.pow(1-q,3);
  for(let i=0;i<n;i++){const a=(f.seed||0)*1.71+i*2.399,r=f.r*(.3+spread)*(i%2?.75:1),x=f.x+Math.cos(a)*r,y=f.y-22+Math.sin(a)*r*.7+q*7;line([[x,y],[x+Math.cos(a)*Math.max(2,7*(1-q)),y+Math.sin(a)*4]],i%3?'#66716a':'#a5ada0',i%2?1:2);}
  oval(f.x,f.y,12+q*5,3,'#bfc6ba');
 }
 if(f.kind==='sword'){
  const aim=f.angle||0,sweep=reduced?1:Math.min(1,q*4),radius=f.r*(.85+.15*sweep);
  c.translate(f.x,f.y-10);c.rotate(aim);
  for(let i=0;i<14;i++){const part=i/14,a=-1.05+part*2.25,end=Math.min(a+.18,-1.05+sweep*2.25);if(end<=a)continue;c.beginPath();c.strokeStyle=i%4?'#57757c':'#9caa9d';c.lineWidth=.6+Math.sin(part*Math.PI)*3.3;c.arc(0,0,radius,a,end);c.stroke();}
  if(!reduced){c.beginPath();c.strokeStyle='#8ca39e';c.lineWidth=.75;c.globalAlpha*=.45;c.arc(0,0,radius-9,-.9,-.9+sweep*1.95);c.stroke();}
 }
 if(f.kind==='bow'){
  const a=f.angle||0;c.translate(f.x,f.y-20);c.rotate(a);
  for(const side of [-1,1])line([[8,side*6],[18+q*12,side*(10+q*8)],[26+q*12,side*(7+q*8)]],'#67878b',1.1,.7);
 }
 c.restore();return true;
}
root.XJMotion={effect};
})(window);
