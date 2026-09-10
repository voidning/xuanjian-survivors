/* Figure geometry retained from the user's approved reference. */
window.makeArt=function(c){const ink='#303436';
function line(points,color=ink,width=3,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.restore()}
function ellipse(x,y,rx,ry,color,stroke=false,width=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(stroke){c.strokeStyle=color;c.lineWidth=width;c.stroke()}else{c.fillStyle=color;c.fill()}}
function figure(x,y,kind,phase,walk,dir=1,casting=0,pose={}){c.save();c.translate(x,y);c.scale(.80,.80);ellipse(0,3,17,4,'#dce0d9');const gait=pose.gait??phase*10,amount=pose.walkAmount??(walk?1:0),weight=Math.sin(gait)*amount;
const bob=-Math.abs(Math.sin(gait))*.45*amount;
c.scale(dir,1);const kick=(pose.recoil||0)/.18;
const stride=weight*(pose.vertical?2.5:5);

if(kind===1){ellipse(0,-27,10,10,'#f2f3ef');ellipse(0,-27,10,10,ink,true,2.5);const flap=Math.sin(phase*7)*6;line([[-9,-26],[-25,-40+flap],[-36,-30+flap],[-25,-29],[-17,-18],[-8,-21]],ink,2.5);line([[9,-26],[25,-40+flap],[36,-30+flap],[25,-29],[17,-18],[8,-21]],ink,2.5);line([[-4,-28],[-3,-25]],ink,2);line([[4,-28],[3,-25]],ink,2);c.restore();return}
// Alternating feet, compact stance, planted support foot; the torso does not rock.
const leftLift=Math.max(0,Math.cos(gait))*2.5*amount,rightLift=Math.max(0,-Math.cos(gait))*2.5*amount;
line([[-2,-18+bob],[-4+stride*.45,-9-leftLift*.4],[-4+stride,-leftLift]],'#65716a',2.5);
line([[2,-18+bob],[4-stride*.45,-9-rightLift*.4],[4-stride,-rightLift]],ink,2.8);
c.translate(-kick*2,bob);line([[0,-35],[0,-18]],ink,3);
if(pose.robe){const hem=Math.sin(gait-.55)*1.5*amount;line([[-8,-32],[-15+hem,-10],[-2+hem*.4,-14],[12+hem,-10],[8,-31]],'#536e69',1.5);}

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
 line([shoulder,elbow,hand],col,2.5);const ux=(hand[0]-elbow[0]),uy=(hand[1]-elbow[1]),len=Math.hypot(ux,uy)||1;
 const cuff=[hand[0]-ux/len*4,hand[1]-uy/len*4];line([[cuff[0]-uy/len*2.4,cuff[1]+ux/len*2.4],[cuff[0]+uy/len*2.4,cuff[1]-ux/len*2.4]],'#849287',1.4);
}
let front,back;
if(kind===3){
 const reach=q>0?24*q*q-5*Math.sin(u*Math.PI):-9*prep;
 back=point(-20+reach,0);front=point(-3+reach,0);
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 line([point(-26+reach,0),point(38+reach,0)],stroke,2);
 line([point(38+reach,0),point(28+reach,-4),point(31+reach,4),point(38+reach,0)],stroke,1.7);
}else if(kind===4){
 const draw=q>0?Math.sin(u*24)*q*3:prep*11,flex=q>0?Math.sin(u*20)*q*2:prep*3;
 front=point(16+flex,0);back=point(-draw,0);
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 line([point(5,-19),point(13+flex,-9),point(16+flex,0),point(13+flex,9),point(5,19)],stroke,1.8);
 line([point(5,-19),back,point(5,19)],stroke,1);
 if(!q||u>.65)line([point(-draw-4,0),point(24,0)],stroke,1.3);
}else{
 const sweep=q?-.9+1.9*(1-q*q*q):-.55-prep*.65,angle=a+sweep;
 // A small shoulder-led displacement carries the grip through the cut.
 origin[0]+=q?Math.sin(u*Math.PI)*3:0;origin[1]+=q?Math.sin(u*Math.PI)*2:0;
 front=point(0,0,angle);back=[-11-Math.sin(gait)*amount,-23-(q?Math.sin(u*Math.PI)*4:0)];
 arm([-3,-32],back,1,'#65736b');arm([4,-32],front,-1);
 line([point(-5,0,angle),point(31,0,angle),point(37,0,angle)],stroke,2);
 line([point(2,-5,angle),point(2,5,angle)],ink,2);
 if(q){line([point(9,-5,angle),point(27,-5,angle),point(35,-2,angle)],stroke,1,q*.45);line([point(10,-9,angle),point(24,-9,angle),point(34,-5,angle)],stroke,.7,q*.22);}
}
// Small grips cover the intersection so the weapon stays seated in the hands.
for(const hand of [back,front])ellipse(hand[0],hand[1],1.7,1.7,ink);
line([[-5,-27],[-7,-18],[0,-16]],'#b4bcb5',1);
line([[-5,-16],[-8-Math.sin(gait-.55)*1.5*amount,-7],[2,-13],[8,-17]],'#7c8582',1.5);
}

ellipse(0,-46,11,12,'#f2f3ef');ellipse(0,-46,11,12,ink,true,2.5);
if(kind===2){line([[-8,-55],[-11,-64],[-3,-57]],ink,2.5);line([[7,-55],[12,-62],[10,-52]],ink,2.5);line([[-5,-47],[-2,-46]],ink,2);line([[5,-47],[2,-46]],ink,2)}else{ellipse(-3,-61,4,4,ink);line([[-8,-56],[5,-57],[15,-53+Math.sin(gait-.65)*amount*.9],[23,-55+Math.sin(gait-1)*amount*1.4]],ink,1.6);line([[4,-47],[5,-47]],ink,2)}c.restore()}

return {line,ellipse,figure};};
