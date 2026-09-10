/* Small ochre pouch, distinct from blue XP; never a combat-radius ring. */
(function(root){'use strict';
function draw(c,run,line,oval,label){c.save();for(const b of run.medicineBags||[]){oval(b.x,b.y+5,11,3,'#6c58452b');c.fillStyle='#d9b58d';c.strokeStyle='#9a5444';c.lineWidth=1.7;c.beginPath();c.moveTo(b.x-5,b.y-10);c.lineTo(b.x+5,b.y-10);c.lineTo(b.x+10,b.y+1);c.quadraticCurveTo(b.x+10,b.y+9,b.x,b.y+9);c.quadraticCurveTo(b.x-10,b.y+9,b.x-10,b.y+1);c.closePath();c.fill();c.stroke();line([[b.x-7,b.y-9],[b.x+7,b.y-9]],'#7e5143',2);line([[b.x-4,b.y-15],[b.x,b.y-10],[b.x+5,b.y-15]],'#9a5444',1.4);label('药',b.x,b.y+4,'#704635',10);if(Math.hypot(b.x-run.p.x,b.y-run.p.y)<150)label(run.p.hp>=run.maxHP?'满血留存':'药囊 · 拾取回血',b.x,b.y-24,'#855043',10);}c.restore();}
root.XJMedicineArt={draw};
})(window);
