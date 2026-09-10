/* Figure geometry retained from the user's approved reference. */
window.makeArt=function(c){const ink='#303436';
function line(points,color=ink,width=3,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.restore()}
function ellipse(x,y,rx,ry,color,stroke=false,width=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(stroke){c.strokeStyle=color;c.lineWidth=width;c.stroke()}else{c.fillStyle=color;c.fill()}}
function figure(x,y,kind,phase,walk,dir=1,casting=0,pose={}){c.save();c.translate(x,y);c.scale(.94,.94);ellipse(1,4,19,5,'#a8b7a1');ellipse(0,3,12,2.5,'#849b89');const gait=pose.gait??phase*10,amount=pose.walkAmount??(walk?1:0),weight=Math.sin(gait)*amount;
const bob=-Math.abs(Math.sin(gait))*.45*amount;
c.scale(dir,1);const kick=(pose.recoil||0)/.18;
const stride=weight*(pose.vertical?2.5:5);

if(kind===1){ellipse(0,-27,10,10,'#f2f3ef');ellipse(0,-27,10,10,ink,true,2.5);const flap=Math.sin(phase*7)*6;line([[-9,-26],[-25,-40+flap],[-36,-30+flap],[-25,-29],[-17,-18],[-8,-21]],ink,2.5);line([[9,-26],[25,-40+flap],[36,-30+flap],[25,-29],[17,-18],[8,-21]],ink,2.5);line([[-4,-28],[-3,-25]],ink,2);line([[4,-28],[3,-25]],ink,2);c.restore();return}
// Alternating feet, compact stance, planted support foot; the torso does not rock.
const leftLift=Math.max(0,Math.cos(gait))*2.5*amount,rightLift=Math.max(0,-Math.cos(gait))*2.5*amount;
line([[-2,-18+bob],[-4+stride*.45,-9-leftLift*.4],[-4+stride,-leftLift]],'#65716a',2.5);
line([[2,-18+bob],[4-stride*.45,-9-rightLift*.4],[4-stride,-rightLift]],ink,2.8);
if(pose.robe){line([[-4+stride,-leftLift-3],[-4+stride,-leftLift],[-1+stride,-leftLift]],'#3e594e',3.2);line([[4-stride,-rightLift-3],[4-stride,-rightLift],[7-stride,-rightLift]],'#3e594e',3.2);}
c.translate(-kick*2,bob);
if(pose.robe&&!pose.armor){const tail=Math.sin(gait-.8)*3*amount; c.beginPath();c.moveTo(-5,-35);c.bezierCurveTo(-16,-30,-15,-17,-23+tail,-10);c.lineTo(-13+tail,-12);c.lineTo(-4,-28);c.closePath();c.fillStyle='#315e57';c.fill();line([[-6,-33],[-13,-23],[-20+tail,-12]],'#bda975',.8);}

if(pose.robe&&!pose.armor&&kind===4){c.beginPath();[[-13,-33],[-7,-36],[-2,-17],[-8,-14]].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#9b9069';c.fill();c.strokeStyle='#5e7057';c.lineWidth=1;c.stroke();for(let j=0;j<3;j++)line([[-11+j*2,-32],[-16+j*3,-44]],'#778166',1);line([[-15,-41],[-17,-44],[-15,-46]],'#d7dbc2',1);}
line([[0,-35],[0,-18]],ink,3);
if(pose.armor){
 c.beginPath();[[-9,-34],[-14,-29],[-10,-20],[-13,-7],[-3,-8],[0,-13],[4,-7],[13,-8],[10,-20],[14,-29],[9,-34]].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#d9dccb';c.fill();c.strokeStyle='#887d52';c.lineWidth=1.6;c.stroke();for(let j=0;j<3;j++)line([[-9,-27+j*6],[9,-27+j*6]],'#aa9965',1.2);line([[-14,-29],[-16,-24],[-9,-24]],'#887d52',2);line([[14,-29],[16,-24],[9,-24]],'#887d52',2);
}else if(pose.robe){
 const hem=Math.sin(gait-.55)*1.5*amount;
 c.beginPath();c.moveTo(-5,-36);c.lineTo(-10,-32);c.lineTo(-8,-22);c.lineTo(-14+hem,-5);c.lineTo(-2+hem*.3,-8);c.lineTo(1,-14);c.lineTo(5+hem*.3,-6);c.lineTo(13+hem,-7);c.lineTo(8,-23);c.lineTo(9,-32);c.lineTo(4,-36);c.closePath();c.fillStyle='#346f68';c.fill();c.strokeStyle='#203f3c';c.lineWidth=1.5;c.stroke();
 c.beginPath();c.moveTo(-4,-35);c.lineTo(3,-28);c.lineTo(5,-23);c.lineTo(-2,-23);c.lineTo(-7,-31);c.closePath();c.fillStyle='#ececda';c.fill();
 c.beginPath();c.moveTo(4,-25);c.lineTo(8,-23);c.lineTo(13+hem,-7);c.lineTo(7+hem*.3,-8);c.lineTo(2,-17);c.closePath();c.fillStyle='#234e49';c.fill();
 line([[-5,-35],[3,-27],[7,-33]],'#dde3ce',1.3);
 line([[-11+hem,-7],[-3+hem*.3,-10]],'#c5c49b',1.1);line([[6+hem*.3,-8],[11+hem,-9]],'#c5c49b',1.1);line([[4,-35],[-4,-26],[-7,-12]],'#97a491',.9);
 line([[-8,-23],[8,-23]],'#3b5c51',3);ellipse(1,-23,2.1,1.8,'#c2ae72');ellipse(1,-23,.8,.8,'#517c6d');line([[5,-22],[7+hem,-14],[5+hem,-9]],'#b9aa71',1.8);
 line([[-3,-19],[-6+hem*.3,-9]],'#abc2aa',.9);line([[5,-18],[8+hem*.3,-10]],'#abc2aa',.9);
}


if(kind===2){line([[-7,-29],[-14,-18],[-9,-13]],ink,3);line([[5,-29],[14,-20],[10,-13]],ink,3) }else{
const q=pose.attack||0,u=1-q,prep=pose.prepare||0,stroke=pose.empowered?'#b29a46':pose.spring?'#6faaa4':'#596268';
const aim=pose.aim??-.7,ready=Math.max(pose.readiness??1,q>0?1:0),targetAngle=Math.atan2(Math.sin(aim),Math.cos(aim)*dir),rest=kind===3?-.85:kind===4?.5:1.7,a=rest+Math.atan2(Math.sin(targetAngle-rest),Math.cos(targetAngle-rest))*ready;
// The wrist targets and weapon vertices share exactly the same transform.
const origin=[Math.cos(a)*11,-29+Math.sin(a)*7+(1-ready)*5];
function point(x,y,angle=a){return [origin[0]+Math.cos(angle)*x-Math.sin(angle)*y,origin[1]+Math.sin(angle)*x+Math.cos(angle)*y];}
function arm(shoulder,hand,bend,col=ink){
 const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],d=Math.max(.001,Math.hypot(dx,dy)),upper=20,lower=21;
 const along=Math.max(0,Math.min(upper,(upper*upper-lower*lower+d*d)/(2*d))),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 bend=dx>=0?1:-1;
 const elbow=[shoulder[0]+dx/d*along-dy/d*height*bend,shoulder[1]+dy/d*along+dx/d*height*bend];
 if(pose.robe){
 const joint=[hand[0]+(elbow[0]-hand[0])*.2,hand[1]+(elbow[1]-hand[1])*.2];
 // Filled narrow sleeves mask the skeleton and preserve readable overlaps.
 line([shoulder,elbow,joint],pose.armor?'#887d52':'#365d51',7.1);line([shoulder,elbow,joint],pose.armor?'#d9dccb':'#589286',4.8);line([joint,hand],col,2);
}else line([shoulder,elbow,hand],col,2.5);const ux=(hand[0]-elbow[0]),uy=(hand[1]-elbow[1]),len=Math.hypot(ux,uy)||1;
 const cuff=[hand[0]-ux/len*4,hand[1]-uy/len*4];line([[cuff[0]-uy/len*2.4,cuff[1]+ux/len*2.4],[cuff[0]+uy/len*2.4,cuff[1]-ux/len*2.4]],'#849287',1.4);
}
let front,back;
if(kind===3){
 const reach=q>0?24*q*q-5*Math.sin(u*Math.PI):-9*prep;
 back=point(-20+reach,0);front=point(-3+reach,0);
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 line([point(-26+reach,0),point(38+reach,0)],stroke,2);
 c.beginPath();[point(42+reach,0),point(29+reach,-3.7),point(31+reach,0),point(29+reach,3.7)].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#c8dcd3';c.fill();c.strokeStyle=stroke;c.lineWidth=1;c.stroke();line([point(32+reach,0),point(41+reach,0)],'#f3f2d8',.8);line([point(25+reach,-2),point(25+reach,2)],'#b39e62',2);
}else if(kind===4){
 const draw=q>0?Math.sin(u*24)*q*3:prep*11,flex=q>0?Math.sin(u*20)*q*2:prep*3;
 front=point(16+flex,0);back=point(-draw,0);
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 line([point(5,-19),point(13+flex,-9),point(16+flex,0),point(13+flex,9),point(5,19)],'#726b48',3);line([point(5,-19),point(13+flex,-9),point(16+flex,0),point(13+flex,9),point(5,19)],'#c2af79',1.4);
 line([point(5,-19),back,point(5,19)],stroke,1);
 if(!q||u>.65)line([point(-draw-4,0),point(24,0)],stroke,1.3);
}else{
 const sweep=q?-.9+1.9*(1-q*q*q):-.55-prep*.65,angle=a+sweep;
 // A small shoulder-led displacement carries the grip through the cut.
 origin[0]+=q?Math.sin(u*Math.PI)*3:0;origin[1]+=q?Math.sin(u*Math.PI)*2:0;
 front=point(0,0,angle);back=[-11-Math.sin(gait)*amount,-23-(q?Math.sin(u*Math.PI)*4:0)];
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 c.beginPath();[point(4,-1.6,angle),point(31,-1.4,angle),point(38,0,angle),point(31,1.5,angle),point(4,1.8,angle)].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#c9ded7';c.fill();c.strokeStyle=stroke;c.lineWidth=.9;c.stroke();line([point(6,0,angle),point(35,0,angle)],'#f5f5dc',.8);line([point(-5,0,angle),point(3,0,angle)],'#796c47',2.8);
 line([point(2,-5,angle),point(2,5,angle)],'#ae995d',2);
 if(q){line([point(9,-5,angle),point(27,-5,angle),point(35,-2,angle)],stroke,1,q*.45);line([point(10,-9,angle),point(24,-9,angle),point(34,-5,angle)],stroke,.7,q*.22);}
}
// Small grips cover the intersection so the weapon stays seated in the hands.
for(const hand of [back,front]){ellipse(hand[0],hand[1],2.1,2.1,'#40584d');ellipse(hand[0],hand[1],1.25,1.25,'#e1d9bb');}
if(!pose.robe)line([[-5,-27],[-7,-18],[0,-16]],'#b4bcb5',1);
if(!pose.robe)line([[-5,-16],[-8-Math.sin(gait-.55)*1.5*amount,-7],[2,-13],[8,-17]],'#7c8582',1.5);
}

if(pose.robe){
 ellipse(0,-46,8,10,'#ede1c6');ellipse(0,-46,8,10,'#3e514b',true,1.6);
 c.beginPath();c.ellipse(-1,-49,7.8,7,0,Math.PI,Math.PI*2);c.lineTo(6,-48);c.lineTo(2,-52);c.lineTo(-6,-47);c.closePath();c.fillStyle='#243e3a';c.fill();
 if(pose.armor){line([[-9,-48],[-8,-56],[0,-60],[8,-56],[9,-48]],'#887d52',2);line([[-9,-48],[-10,-40]],'#887d52',2);line([[9,-48],[10,-40]],'#887d52',2);}else ellipse(-2,-58,3,3.5,'#243e3a');line([[-5,-56],[3,-56]],'#bba76b',1.5);ellipse(4,-55.8,1.3,1.3,'#e1d49e');
 line([[3,-46],[5,-46]],'#3e514b',1);line([[5,-43],[6,-42],[4,-41]],'#8e998b',.8);
 line([[-5,-54],[-10,-50],[-16,-49+Math.sin(gait-.65)*amount],[-21,-51+Math.sin(gait-1)*amount]],'#487b70',1.7);
}else{
ellipse(0,-46,11,12,'#f2f3ef');ellipse(0,-46,11,12,ink,true,2.5);
if(kind===2){line([[-8,-55],[-11,-64],[-3,-57]],ink,2.5);line([[7,-55],[12,-62],[10,-52]],ink,2.5);line([[-5,-47],[-2,-46]],ink,2);line([[5,-47],[2,-46]],ink,2)}else{ellipse(-3,-61,4,4,ink);line([[-8,-56],[5,-57],[15,-53+Math.sin(gait-.65)*amount*.9],[23,-55+Math.sin(gait-1)*amount*1.4]],ink,1.6);line([[4,-47],[5,-47]],ink,2)}
}
c.restore()}

return {line,ellipse,figure};};
