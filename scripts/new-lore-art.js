/* Evidence-backed lore additions: bounded Canvas strokes, simulation-time only. */
(function(root){'use strict';
function seal(c,x,y,angle,line){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(-4,-8);c.lineTo(0,-11);c.lineTo(4,-8);c.lineTo(4,8);c.lineTo(-4,8);c.closePath();c.fillStyle='#e9ece5';c.fill();c.strokeStyle='#6c778e';c.lineWidth=1;c.stroke();line([[1,-6],[-2,0],[2,0],[-1,5]],'#8c839f',1);c.restore();}
function heartFlame(c,x,y,k,line){c.save();c.translate(x,y);c.scale(k,k);c.beginPath();c.moveTo(-7,6);c.bezierCurveTo(-14,-4,-1,-11,-2,-21);c.bezierCurveTo(11,-13,1,-5,8,-8);c.bezierCurveTo(14,7,1,13,-7,6);c.closePath();c.fillStyle='#dfc17b';c.fill();c.strokeStyle='#927442';c.lineWidth=1.1;c.stroke();line([[-3,5],[1,-3],[0,-11]],'#fff0c0',1.3);c.restore();}
function zone(c,run,z,line,oval,label,reduced){if(z.kind==='zhiming'){c.save();const sway=reduced?0:Math.sin(z.age*4)*2;for(const side of [-1,1]){const x=z.x+side*19;line([[x,z.y+1],[x+side*5,z.y-12],[x+sway,z.y-26],[x+side*3,z.y-39]],'#55545e',3,.8);line([[x,z.y],[x+side*5,z.y-12],[x+sway,z.y-26]],'#baa77a',1,.9);}c.restore();return true;}if(z.kind==='dali'){c.save();const phase=reduced?0:Math.sin(z.age*2.2)*.08;for(let i=0;i<6;i++){const a=i*Math.PI/3+phase;c.beginPath();c.arc(z.x,z.y,z.r,a-.12,a+.12);c.strokeStyle='#a58d5959';c.lineWidth=1;c.stroke();heartFlame(c,z.x+Math.cos(a)*z.r*.75,z.y+Math.sin(a)*z.r*.75,.55,line);}c.restore();return true;}if(z.kind!=='fragrance')return false;c.save();oval(z.x,z.y,z.r,z.r,'#a5a1b5',true,1);const phase=reduced?0:z.age*.8;
// Six white wisps with gray-violet edges; no opaque field or red danger tint.
for(let j=0;j<6;j++){const a=j*Math.PI/3,x=z.x+Math.cos(a)*z.r*.62,y=z.y+Math.sin(a)*z.r*.62,wave=Math.sin(phase+j)*5;const p=[[x-9,y+9],[x+wave,y-7],[x-5,y-20],[x+4,y-30]];line(p,'#8c889e',3,.55);line(p,'#f7f5ef',1.6,.9);}label('香俱沉 · 阴火',z.x,z.y-z.r+17,'#827d93',10);c.restore();return true;}
function effect(c,run,f,line,oval,label,reduced){if(!['zhimingAwaken','zhimingStrike','zhimingSeal','daliAwaken','screenPulse','sixSeals','sealStrike'].includes(f.kind))return false;const q=f.age/f.life;c.save();c.globalAlpha*=Math.max(0,1-q);
if(f.kind==='zhimingAwaken'){oval(f.x,f.y,24,8,'#77717b',true,1.5);line([[f.x-12,f.y-4],[f.x-19,f.y-24],[f.x-11,f.y-40]],'#b3a077',2);}
if(f.kind==='zhimingStrike'){line([[f.x-16,f.y-41],[f.x+7,f.y-22],[f.x-4,f.y-7]],'#55515b',4,.8);line([[f.x-16,f.y-41],[f.x+7,f.y-22],[f.x-4,f.y-7]],'#c7b78a',1.4);}
if(f.kind==='zhimingSeal'){line([[f.x-9,f.y-56],[f.x-9,f.y-45],[f.x+9,f.y-45],[f.x+9,f.y-56]],'#80778a',1.5);label('断法',f.x,f.y-61,'#5d5366',10);}
if(f.kind==='daliAwaken'){heartFlame(c,f.x,f.y-24,.9,line);line([[f.x-11,f.y-30],[f.x-11,f.y-15],[f.x+11,f.y-15],[f.x+11,f.y-30]],'#ad8c4f',1);}
if(f.kind==='sealStrike'){const x=f.x,y=f.y-15;line([[x-4,y-65],[x+8,y-43],[x-7,y-27],[x,y]],'#817d9b',2);line([[x-4,y-65],[x+8,y-43],[x-7,y-27],[x,y]],'#f6f5ee',.8);oval(f.x,f.y,13+q*10,5,'#8c88a1',true,1);}
if(f.kind==='sixSeals'){for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:q*.25);seal(c,f.x+Math.cos(a)*f.r,f.y-26+Math.sin(a)*f.r*.55,a,line);}}
if(f.kind==='screenPulse'){for(let i=0;i<8;i++){const a=i*Math.PI/4,x=f.x+Math.cos(a)*f.r,y=f.y+Math.sin(a)*f.r;line([[x-3,y-7],[x-3,y+7],[x+3,y+7],[x+3,y-7]],'#66796d',1.2);}}
c.restore();return true;}
root.XJNewLoreArt={zone,effect};
})(window);
