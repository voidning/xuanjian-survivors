/* Final world overlay: readable danger contours above allied effects. */
(function(root){'use strict';
function draw(c,run,line,oval){c.save();
 run.zones.forEach(z=>{if(z.kind!=='hazard')return;const active=z.age>=z.warn;c.setLineDash(active?[]:[6,5]);oval(z.x,z.y,z.r,z.r,active?'#a15343':'#b47e58',true,active?2.2:1.6);c.setLineDash([]);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])line([[z.x+Math.cos(a)*(z.r-6),z.y+Math.sin(a)*(z.r-6)],[z.x+Math.cos(a)*(z.r+2),z.y+Math.sin(a)*(z.r+2)]],'#a9694e',1.4,.9);});
 run.enemies.forEach(e=>{if(e.phase!=='warn'||![1,6,7,11,12].includes(e.type))return;const length=e.type===7?158.4:e.type===12?190:e.type===11?(e.elite?360:300):312,half=e.type===11?30:e.r+14;c.setLineDash([7,5]);for(const sign of [-1,1]){const nx=-e.ay*half*sign,ny=e.ax*half*sign;line([[e.x+nx,e.y+ny],[e.x+e.ax*length+nx,e.y+e.ay*length+ny]],'#aa664c',1.7,.9);}c.setLineDash([]);});
 // The stable foot mark survives a busy field without another animated halo.
 const p=run.p;oval(p.x,p.y+2,12,4,'#f3f4ed',true,3);oval(p.x,p.y+2,12,4,'#4b746c',true,1.2);c.restore();
}
root.XJDangerArt={draw};
})(window);
