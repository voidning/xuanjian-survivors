/* Evidence-backed lore additions: bounded Canvas strokes, simulation-time only. */
(function(root){'use strict';
function seal(c,x,y,angle,line){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(-4,-8);c.lineTo(0,-11);c.lineTo(4,-8);c.lineTo(4,8);c.lineTo(-4,8);c.closePath();c.fillStyle='#e9ece5';c.fill();c.strokeStyle='#6c778e';c.lineWidth=1;c.stroke();line([[1,-6],[-2,0],[2,0],[-1,5]],'#8c839f',1);c.restore();}
function zone(c,run,z,line,oval,label,reduced){if(z.kind!=='fragrance')return false;c.save();oval(z.x,z.y,z.r,z.r,'#a5a1b5',true,1);const phase=reduced?0:z.age*.8;
// Six white wisps with gray-violet edges; no opaque field or red danger tint.
for(let j=0;j<6;j++){const a=j*Math.PI/3,x=z.x+Math.cos(a)*z.r*.62,y=z.y+Math.sin(a)*z.r*.62,wave=Math.sin(phase+j)*5;const p=[[x-9,y+9],[x+wave,y-7],[x-5,y-20],[x+4,y-30]];line(p,'#8c889e',3,.55);line(p,'#f7f5ef',1.6,.9);}label('香俱沉 · 阴火',z.x,z.y-z.r+17,'#827d93',10);c.restore();return true;}
function effect(c,run,f,line,oval,label,reduced){if(!['screenPulse','sixSeals','sealStrike'].includes(f.kind))return false;const q=f.age/f.life;c.save();c.globalAlpha*=Math.max(0,1-q);
if(f.kind==='sealStrike'){const x=f.x,y=f.y-15;line([[x-4,y-65],[x+8,y-43],[x-7,y-27],[x,y]],'#817d9b',2);line([[x-4,y-65],[x+8,y-43],[x-7,y-27],[x,y]],'#f6f5ee',.8);oval(f.x,f.y,13+q*10,5,'#8c88a1',true,1);}
if(f.kind==='sixSeals'){for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:q*.25);seal(c,f.x+Math.cos(a)*f.r,f.y-26+Math.sin(a)*f.r*.55,a,line);}}
if(f.kind==='screenPulse'){for(let i=0;i<8;i++){const a=i*Math.PI/4,x=f.x+Math.cos(a)*f.r,y=f.y+Math.sin(a)*f.r;line([[x-3,y-7],[x-3,y+7],[x+3,y+7],[x+3,y-7]],'#66796d',1.2);}}
c.restore();return true;}
root.XJNewLoreArt={zone,effect};
})(window);
