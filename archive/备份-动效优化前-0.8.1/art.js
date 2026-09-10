/* Figure geometry retained from the user's approved reference. */
window.makeArt=function(c){const ink='#303436';
function line(points,color=ink,width=3,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.restore()}
function ellipse(x,y,rx,ry,color,stroke=false,width=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(stroke){c.strokeStyle=color;c.lineWidth=width;c.stroke()}else{c.fillStyle=color;c.fill()}}
function figure(x,y,kind,phase,walk,dir=1,casting=0,pose={}){c.save();c.translate(x,y);c.scale(.80,.80);ellipse(0,3,17,4,'#dce0d9');const bob=walk?Math.sin(phase*10)*1.4:0;c.translate(0,bob);c.scale(dir,1);const kick=(pose.recoil||0)/.18;c.transform(1,0,(walk?-.06:0)+kick*.16,1,-kick*3,0);const stride=walk?Math.sin(phase*10)*9:1;
if(kind===1){ellipse(0,-27,10,10,'#f2f3ef');ellipse(0,-27,10,10,ink,true,2.5);const flap=Math.sin(phase*7)*6;line([[-9,-26],[-25,-40+flap],[-36,-30+flap],[-25,-29],[-17,-18],[-8,-21]],ink,2.5);line([[9,-26],[25,-40+flap],[36,-30+flap],[25,-29],[17,-18],[8,-21]],ink,2.5);line([[-4,-28],[-3,-25]],ink,2);line([[4,-28],[3,-25]],ink,2);c.restore();return}
line([[0,-35],[0,-18]],ink,3);line([[0,-18],[-7-stride/2,-8],[-9-stride,0]],ink,3);line([[0,-18],[7+stride/2,-9],[9+stride,0]],ink,3);
if(kind===2){line([[-7,-29],[-14,-18],[-9,-13]],ink,3);line([[5,-29],[14,-20],[10,-13]],ink,3)}else{line([[0,-31],[-10,-22],[-16,-26]],ink,3);line([[0,-31],[10,casting?-36:-22],[casting?23:18,casting?-39:-27]],ink,3);const q=pose.attack||0,stroke=pose.empowered?'#b29a46':pose.spring?'#6faaa4':'#596268';c.save();c.translate(14,-28);const aim=pose.aim??-.7;c.rotate(Math.atan2(Math.sin(aim),Math.cos(aim)*dir));
if(kind===3){const reach=Math.sin(q*Math.PI)*17;line([[-26+reach,0],[38+reach,0]],stroke,2);line([[38+reach,0],[28+reach,-4],[31+reach,4],[38+reach,0]],stroke,1.7);}
else if(kind===4){const draw=Math.sin(q*Math.PI)*9;line([[5,-19],[13,-9],[16,0],[13,9],[5,19]],stroke,1.8);line([[5,-19],[-draw,0],[5,19]],stroke,1);line([[-draw-4,0],[24,0]],stroke,1.3);}
else{c.rotate(q?-.9+q*1.8:-.55);line([[-5,0],[31,0],[37,0]],stroke,2);line([[2,-5],[2,5]],ink,2);if(q)line([[9,-5],[27,-5],[35,-2]],stroke,1,.35);}
c.restore();line([[-5,-27],[-7,-18],[0,-16]],'#b4bcb5',1);line([[17,-24],[25,-21]],ink,2);line([[-5,-16],[-8-(walk?Math.sin(phase*10)*4:0),-7],[2,-13],[8,-17]],'#7c8582',1.5)}
ellipse(0,-46,11,12,'#f2f3ef');ellipse(0,-46,11,12,ink,true,2.5);
if(kind===2){line([[-8,-55],[-11,-64],[-3,-57]],ink,2.5);line([[7,-55],[12,-62],[10,-52]],ink,2.5);line([[-5,-47],[-2,-46]],ink,2);line([[5,-47],[2,-46]],ink,2)}else{ellipse(-3,-61,4,4,ink);line([[-8,-56],[5,-57],[15,-53+Math.sin(phase*3)*2],[20,-57+Math.sin(phase*3)*2]],ink,1.6);line([[4,-47],[5,-47]],ink,2)}c.restore()}

return {line,ellipse,figure};};
