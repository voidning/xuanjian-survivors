/* Paper cutout costumes fit the existing joints and anchor. No RNG or simulation writes. */
(function(root){'use strict';
function shape(c,p,fill,stroke,width=1){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
function line(c,p,col,w=1){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.lineCap='round';c.lineJoin='round';c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function clothing(c,e,ink){if(e.type===12)return;c.save();const heavy=e.type===5||e.boss,robe=[3,9,10].includes(e.type),fast=[0,7,11].includes(e.type),fill=heavy?'#7d756b':robe?'#777083':fast?'#89755f':'#a4977b',accent=e.elite||e.boss?'#a78c53':'#695d51';
 if(e.elite||e.boss)shape(c,[[-7,-31],[-16,-28],[-22,-9],[-14,-10],[-10,-22],[10,-22],[16,-7],[22,-6],[16,-28],[7,-31]],'#746158',accent,1.1);
 if(robe){shape(c,[[-7,-31],[-12,-25],[-8,-18],[-16,-2],[-4,-6],[0,-11],[5,-3],[15,-4],[8,-19],[12,-25],[7,-31]],fill,ink,1.4);shape(c,[[3,-29],[8,-20],[15,-4],[6,-6],[-2,-23]],'#514958');shape(c,[[-5,-29],[3,-23],[2,-9],[-4,-6]],'#ded7c9');}
 else if(heavy){shape(c,[[-9,-31],[-17,-26],[-12,-18],[-15,-6],[-4,-6],[0,-10],[5,-5],[15,-6],[12,-18],[17,-26],[9,-31]],fill,ink,1.6);shape(c,[[-8,-29],[8,-29],[9,-20],[0,-15],[-9,-20]],'#c4c1b1',accent);for(const side of [-1,1]){shape(c,[[side*9,-31],[side*18,-29],[side*19,-22],[side*10,-21]],'#786c60',ink,1.2);for(let j=0;j<3;j++){const y=-16+j*4;line(c,[[side*3,y],[side*12,y+1]],'#d1d5b6',.85);}}}
 else{shape(c,[[-6,-30],[-10,-26],[-7,-17],[-10,-8],[-3,-9],[0,-13],[5,-8],[11,-10],[7,-18],[10,-26],[6,-30]],fill,ink,1.2);shape(c,[[2,-28],[7,-25],[7,-18],[11,-10],[5,-8],[-1,-22]],'#625444');if(fast)shape(c,[[-8,-16],[-2,-17],[-3,-8],[-10,-7]],'#d5ccb4',accent,.8);}
 line(c,[[-5,-29],[2,-23],[6,-29]],'#e1d9c6',1.3);line(c,[[-8,-17],[8,-17]],accent,2.5);shape(c,[[-1,-19],[3,-19],[3,-15],[-1,-15]],'#b3a475');
 if(e.type===2){shape(c,[[-10,-29],[-15,-31],[-12,-12],[-7,-14]],'#7b6b57',ink);for(let j=0;j<3;j++)line(c,[[-13+j*2,-30],[-15+j*2,-43]],'#b4b7a0',1);}
 if(e.type===8){shape(c,[[-10,-29],[-15,-24],[-15,-13],[-7,-17]],'#b5bba2',ink);}
 c.restore();}
function finish(c,e,ink,t,reduced=false){if(e.type===12)return;c.save();
 // Forearms follow exactly the original control points; filled sleeves stop before grips.
 const arms={0:[[[0,-25],[-12,-18],[-19,-23]],[[0,-25],[12,-18],[19,-23]]],1:[[[0,-25],[14,-20],[24,-24]],[[0,-25],[-11,-20],[-15,-32]]],2:[[[0,-25],[12,-26],[18,-27]],[[0,-25],[-5,-23],[13,-27]]],3:[[[0,-25],[10,-22],[18,-31]],[[0,-25],[-10,-22],[-15,-16]]],4:[[[0,-25],[15,-23],[18,-33]],[[0,-25],[-14,-20],[-17,-31]]],5:[[[-8,-23],[-17,-17]],[[8,-23],[18,-28],[25,-31]]],6:[[[-8,-23],[-17,-17]],[[8,-23],[18,-28],[25,-31]]],7:[[[0,-25],[-13,-15],[-24,-27]],[[0,-25],[14,-32],[26,-20]]],9:[[[0,-26],[-15,-28],[-21,-38]],[[0,-26],[15,-28],[21,-38]]],10:[[[0,-26],[13,-21],[24,-25]],[[0,-26],[-13,-33],[-17,-44]]],11:[[[0,-25],[-14,-15],[-19,-22]],[[0,-25],[14,-30],[21,-24]]]};
 for(const points of arms[e.type]||[]){const p=points.map(x=>x.slice()),last=p.pop(),prev=p[p.length-1];p.push([prev[0]+(last[0]-prev[0])*.66,prev[1]+(last[1]-prev[1])*.66]);line(c,p,ink,e.type===5?5:4.5);line(c,p,(e.type===5||e.boss)?'#938678':[3,9,10].includes(e.type)?'#97909e':[0,7,11].includes(e.type)?'#a39480':'#b5aa92',e.type===5?3:2.8);}
 // Hats and shaded lower faces read as solid material at normal scale.
 if(e.type===2){shape(c,[[-13,-43],[-3,-55],[13,-43]],'#9e8863',ink,1);shape(c,[[-3,-55],[13,-43],[1,-45]],'#6e604c');line(c,[[-14,-42],[14,-42]],'#504c42',1.8);}
 if([3,9,10].includes(e.type)){shape(c,[[-7,-43],[-6,-51],[5,-51],[8,-43],[4,-44],[-3,-45]],'#423f4b',ink,.8);shape(c,[[-5,-35],[5,-35],[3,-31],[-3,-31]],'#b8aa9b');}
 // Keep faces simple; headwear, not facial detail, is the normal-scale identifier.
 if([0,7,11].includes(e.type)){shape(c,[[-7,-43],[-6,-48],[3,-49],[8,-43],[5,-42],[0,-44],[-6,-41]],'#635b4d',ink,.8);shape(c,[[-6,-37],[6,-37],[4,-31],[-4,-31]],'#8e7d67',ink,.6);line(c,[[6,-43],[14,-41],[18,-35]],'#75634e',1.5);}
 if(e.type===5||e.boss){shape(c,[[-8,-40],[-8,-48],[0,-53],[8,-48],[8,-40],[4,-43],[0,-46],[-4,-43]],'#69665f',ink,1);line(c,[[0,-51],[0,-42]],'#b8a675',1.7);shape(c,[[17,-49],[34,-49],[34,-39],[17,-39]],'#9fa49f',ink,1.4);shape(c,[[17,-49],[23,-52],[38,-51],[34,-49]],'#d0d0c1',ink,.8);shape(c,[[34,-49],[38,-51],[38,-42],[34,-39]],'#6e7774',ink,.8);}
 if(e.type===4)shape(c,[[15,-32],[27,-32],[27,-14],[20,-7],[13,-14]],'#b9ac8e',ink,1.4);
 if(e.type===4){shape(c,[[20,-30],[25,-30],[25,-15],[20,-10]],'#8b795e');line(c,[[16,-24],[24,-24]],'#e5e9d4',1);}
 if(e.type===3){shape(c,[[19,-56],[37,-51],[19,-43]],'#998c9a',ink,1);line(c,[[21,-51],[27,-48]],'#d8d5ae',1.3);}
 if(e.type===9)for(const side of [-1,1]){shape(c,[[side*22,-63],[side*33,-59],[side*33,-42],[side*22,-46]],'#c0c7aa',ink,.8);line(c,[[side*25,-56],[side*30,-52],[side*25,-49]],'#6b8069',1.3);}
 if(e.type===10){const sw=(reduced?0:Math.sin(t*3+e.id)*3);shape(c,[[25,-74],[43+sw,-68],[38+sw,-45],[25,-50]],'#877e92',ink,1);line(c,[[29,-67],[36+sw,-61],[30,-54]],'#c8cca9',1.6);}
 if(e.elite){shape(c,[[-7,-53],[0,-58],[7,-53],[0,-49]],'#ba9b57','#716039',1);line(c,[[-10,-29],[-16,-10]],'#bfaa73',1.2);line(c,[[10,-29],[17,-9]],'#bfaa73',1.2);}
 c.restore();}
function hound(c,ink){shape(c,[[-21,-20],[-14,-27],[2,-28],[18,-21],[21,-15],[10,-12],[-12,-13]],'#a59e8f',ink,1.4);shape(c,[[-13,-26],[-4,-29],[7,-25],[10,-18],[-5,-17]],'#777164');}
root.XJRosterArt={clothing,finish,hound};
})(window);
