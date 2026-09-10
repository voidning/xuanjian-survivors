/* Shared paper-filled silhouettes; equipment and hitboxes retain their identities. */
(function(root){'use strict';
function shape(c,points,fill,stroke,width=1.4){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}
function clothing(c,e,ink){if(e.type===12)return;c.save();const heavy=e.type===5||e.boss,robe=[3,9,10].includes(e.type),fill=heavy?'#859594':robe?'#a39bab':'#b6b699',accent=e.boss?'#987347':e.elite?'#92765b':robe?'#7c8d88':'#899080';
 if(e.elite||e.boss)shape(c,[[-8,-30],[-15,-24],[-20,-6],[-12,-10],[-5,-23],[5,-23],[14,-7],[20,-5],[15,-25],[8,-30]],e.boss?'#87654f':'#9e846c',accent);
 shape(c,[[-7,-30],[-11,-26],[-8,-17],[-(heavy?15:robe?13:10),robe?-3:-8],[0,robe?-7:-11],[heavy?15:robe?13:10,robe?-3:-8],[8,-17],[11,-26],[7,-30]],fill,ink,1.4);
 shape(c,[[-10,-27],[-15,-24],[-17,-18],[-11,-16],[-6,-23]],fill,ink,1.1);shape(c,[[10,-27],[15,-24],[17,-18],[11,-16],[6,-23]],fill,ink,1.1);
 if(heavy){shape(c,[[-13,-29],[-18,-26],[-16,-20],[-8,-22]],'#c8cfc1',accent);shape(c,[[13,-29],[18,-26],[16,-20],[8,-22]],'#c8cfc1',accent);for(let i=0;i<3;i++){const y=-22+i*5;c.beginPath();c.moveTo(-8,y);c.lineTo(8,y);c.strokeStyle=accent;c.lineWidth=1;c.stroke();}}
 else{c.beginPath();c.moveTo(-5,-29);c.lineTo(4,-21);c.lineTo(7,-28);c.strokeStyle=accent;c.lineWidth=1;c.stroke();}
 c.beginPath();c.moveTo(-8,-16);c.lineTo(8,-16);c.strokeStyle=accent;c.lineWidth=2.2;c.stroke();
 if(e.type===7||e.type===11)shape(c,[[-7,-29],[-12,-26],[-7,-19],[-2,-22]],'#b8c3b7',ink,1);
 if(e.type===2){shape(c,[[-14,-31],[-8,-33],[-5,-14],[-11,-12]],'#9b9d7e',ink,.9);}
 if(!heavy&&!robe){shape(c,[[-8,-15],[-2,-16],[-2,-7],[-7,-8]],'#bcc3a5',accent,.8);}
 if(robe){shape(c,[[-3,-28],[2,-25],[5,-5],[0,-8]],'#e6dfc5',accent,.65);}
 if(heavy){for(const side of [-1,1])for(let j=0;j<3;j++){const x=side*(5+j*3);c.beginPath();c.moveTo(x,-14);c.lineTo(x+side*2,-7);c.strokeStyle='#939f88';c.lineWidth=.8;c.stroke();}}
 if(e.elite||e.boss){shape(c,[[-7,-42],[0,-46],[7,-42],[6,-38],[-6,-38]],e.boss?'#b4a36e':'#a39774',accent,.8);}
 c.restore();}
function hound(c,ink){shape(c,[[-21,-20],[-14,-25],[6,-27],[19,-21],[21,-15],[10,-12],[-12,-13]],'#c9d1c5',ink,1.5);}
root.XJRosterArt={clothing,hound};
})(window);
