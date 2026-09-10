/* 山场白描：cached scenic painting, separate from combat RNG and collision. */
(function(root){'use strict';
const W=3200,H=2200,P={paper:'#f2f3ef',earth:'#e7e8dd',grass:'#dfe5d8',water:'#d8e7df',deep:'#c7ddd3',edge:'#a4bfac',rock:'#d4dace',ink:'#9aa997',moss:'#b8c6ab'};
let painting=null;let seed=73051;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function stroke(c,points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function shape(c,points,fill,edge){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function creekY(x){return 1250+Math.sin((x-420)/520)*100+Math.sin(x/290)*29;}
function water(c){
 const ribbon=(offset,width,color)=>{c.beginPath();for(let x=-20;x<=W+20;x+=20){const y=creekY(x)+offset; x===-20?c.moveTo(x,y):c.lineTo(x,y);}for(let x=W+20;x>=-20;x-=20)c.lineTo(x,creekY(x)+offset+width+Math.sin(x/170)*13);c.closePath();c.fillStyle=color;c.fill();};
 ribbon(-30,183,P.earth);ribbon(0,124,P.water);ribbon(32,55,P.deep);
 for(const offset of [0,123]){const points=[];for(let x=0;x<=W;x+=12)points.push([x,creekY(x)+offset+(offset?Math.sin(x/170)*13:0)]);stroke(c,points,P.edge,1.3);}
 for(let i=0;i<230;i++){const x=random()*W,y=creekY(x)+10+random()*104;stroke(c,[[x,y],[x+9,y-1],[x+17+random()*22,y]],i%3?'#c0d5cb':'#edf3ed',.8);}
 // Two shallow fords: spaced, flat stones read as traversable ground.
 for(const cx of [1510,620])for(let j=0;j<8;j++){let x=cx+j*11-40,y=creekY(x)+j*16;rock(c,x,y,.48+random()*.2,true);}
 for(let i=0;i<160;i++){const x=random()*W,side=i%2?148:-16,y=creekY(x)+side+random()*17;ellipse(c,x,y,2+random()*5,1+random()*2,i%3?P.rock:P.moss);}
}
function rock(c,x,y,s=1,flat=false){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,3,5,29,8,'#dce1d4');const top=flat?-13:-34-random()*17;
 shape(c,[[-28,0],[-20,top*.6],[-5,top],[17,top*.72],[30,-2],[14,7],[-16,6]],'#dbe0d4',P.ink);
 shape(c,[[-5,top],[17,top*.72],[30,-2],[7,3],[3,top*.5]],'#cbd4c7');
 stroke(c,[[-20,top*.6],[-8,top*.55],[3,top*.5],[7,3]],'#bac5b6');
 for(let i=0;i<4;i++)stroke(c,[[-17+i*5,-3],[-12+i*5,-7]],'#c2cbbd',.8);
 stroke(c,[[1,top+6],[7,top*.62],[19,top*.48]],'#edf0e0',1);stroke(c,[[18,-8],[23,-5]],'#aebb9f',.7);ellipse(c,-16,0,6,2,P.moss);ellipse(c,-9,2,4,1.5,P.moss);c.restore();}
function grass(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);for(let j=0;j<5;j++){const dx=(j-2)*4,high=8+random()*13;stroke(c,[[dx*.3,1],[dx*.7,-high*.5],[dx,-high]],j%2?'#b3c2a9':'#c3cfb8',.9);}c.restore();}
function pine(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,14,3,50,12,'#e0e5d9');
 shape(c,[[-5,0],[-3,-38],[8,-74],[3,-100],[11,-102],[16,-72],[4,-36],[3,0]],'#c5cfbe','#a4b39e');
 const branches=[[-2,-37,-42,-65],[10,-64,49,-82],[7,-94,-19,-111],[9,-99,27,-122]];
 for(const [a,b,x2,y2] of branches){stroke(c,[[a,b],[(a+x2)/2,y2+9],[x2,y2]],'#a4b39e',2);for(let k=0;k<4;k++){const xx=x2+(k-1.5)*13,yy=y2+Math.sin(k*2)*5;c.beginPath();c.moveTo(xx-20,yy+3);c.bezierCurveTo(xx-24,yy-5,xx-15,yy-9,xx-9,yy-7);c.bezierCurveTo(xx-9,yy-16,xx+6,yy-16,xx+10,yy-8);c.bezierCurveTo(xx+21,yy-10,xx+29,yy+1,xx+18,yy+5);c.bezierCurveTo(xx+2,yy+9,xx-7,yy+4,xx-20,yy+3);c.fillStyle=k%2?'#c6d7bc':'#d4e0c9';c.fill();c.strokeStyle='#b4c7aa';c.lineWidth=.65;c.stroke();for(let n=0;n<5;n++)stroke(c,[[xx-12+n*6,yy+1],[xx-8+n*6,yy-6]],'#b4c5aa',.75);}}
 stroke(c,[[-2,-6],[0,-33],[8,-65]],'#aebda6',.7);c.restore();}
function ruin(c,x,y){c.save();c.translate(x,y);
 for(let i=0;i<18;i++){const a=i*.79,r=50+(i%3)*21;rock(c,Math.cos(a)*r,Math.sin(a)*r*.42,.28,true);}
 shape(c,[[-28,9],[30,9],[37,18],[-35,18]],'#d5dccd','#afbdab');
 shape(c,[[-19,9],[-19,-74],[-10,-87],[18,-84],[23,-72],[23,9]],'#dae0d3','#a9b7a4');
 shape(c,[[16,-83],[23,-72],[23,9],[16,9]],'#c4cebd');
 stroke(c,[[-12,-66],[-12,-9],[10,-9]],'#bac6b2');stroke(c,[[-10,-87],[-3,-62],[-7,-50],[0,-37]],'#b4c0ad');
 for(let i=0;i<5;i++){const y=-60+i*9;stroke(c,[[-5,y],[6,y]],'#aebda6',1.2);stroke(c,[[i%2?2:-2,y-2],[i%2?2:-2,y+3]],'#aebda6',.8);}
 grass(c,-29,18,1.1);grass(c,30,14,.8);c.restore();}
function stoneCourt(c,x,y){c.save();c.translate(x,y);
 ellipse(c,0,3,168,100,'#e2e5d7');ellipse(c,0,0,148,88,'#e9ebde');
 // Broken arcs and radial joints describe an old terrace, not a combat marker.
 for(let ring=0;ring<3;ring++){const rx=94+ring*23,ry=55+ring*14;for(let j=0;j<12;j++){if((j+ring)%7===0)continue;const a=j*Math.PI/6;c.beginPath();c.ellipse(0,0,rx,ry,0,a+.02,a+Math.PI/6-.035);c.strokeStyle=ring===2?'#bec8b3':'#cdd4c1';c.lineWidth=ring===2?2:1;c.stroke();if(ring<2)stroke(c,[[Math.cos(a)*rx,Math.sin(a)*ry],[Math.cos(a)*(rx+23),Math.sin(a)*(ry+14)]],'#cbd3bf',.8);}}
 for(let j=0;j<8;j++){const a=j*.79;ellipse(c,Math.cos(a)*155,Math.sin(a)*89,8,2,'#c3cfb5');}
 stroke(c,[[-41,-27],[-17,-21],[-9,-8],[8,-5]],'#cfd6c4',.8);stroke(c,[[44,28],[25,16],[28,7]],'#cfd6c4',.8);c.restore();}
function botanical(c,x,y){for(let j=0;j<4;j++){const dx=(j-1.5)*7,h=12+j%2*8;stroke(c,[[x,y],[x+dx,y-h]],'#acbea0',.75);ellipse(c,x+dx,y-h,2.2,1.4,j%2?'#c3c7a0':'#e7dfbd');}}

function terrain(c){
 c.fillStyle=P.paper;c.fillRect(0,0,W,H);
 // Broad, irregular washes give connected terrain rather than isolated icons.
 for(let i=0;i<62;i++){const x=random()*W,y=random()*H,rx=100+random()*175,ry=32+random()*65;c.save();c.translate(x,y);c.scale(1,ry/rx);const wash=c.createRadialGradient(0,0,2,0,0,rx);wash.addColorStop(0,i%3?'#cbd9bc65':'#d9d6ba55');wash.addColorStop(1,'#e4eadb00');c.fillStyle=wash;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();}

 // Worn footpath passes through the central clearing and the old stele.
 const path=()=>{c.beginPath();c.moveTo(1670,270);c.bezierCurveTo(1760,620,1410,820,1560,1160);c.bezierCurveTo(1660,1460,1850,1740,2460,2160);};
 c.lineCap='round';path();c.strokeStyle='#e5e6d9';c.lineWidth=76;c.stroke();path();c.strokeStyle='#ebecdf';c.lineWidth=56;c.stroke();
 for(let i=0;i<95;i++){const y=300+random()*780,x=1660+Math.sin(y/170)*40+(random()-.5)*54;ellipse(c,x,y,2+random()*5,.8,'#d4dacb');}
 stoneCourt(c,1600,1090);water(c);
 // Composed groves at the outskirts; open centre for dense survivor combat.
 const groves=[[330,440],[840,460],[2300,430],[2850,850],[440,1810],[2300,1820],[2850,1860]];
 for(const [cx,cy] of groves){for(let i=0;i<26;i++){const x=cx+(random()-.5)*340,y=cy+(random()-.5)*220;grass(c,x,y,.6+random()*.8);}const trees=Array.from({length:7},()=>({x:cx+(random()-.5)*260,y:cy+(random()-.5)*120,s:.65+random()*.55})).sort((a,b)=>a.y-b.y);for(const p of trees)pine(c,p.x,p.y,p.s);}
 for(const [x,y] of [[2130,1400],[800,1650],[520,600],[2740,470]]){for(let i=0;i<8;i++)rock(c,x+(random()-.5)*190,y+(random()-.5)*80,.4+random()*.9);}
 ruin(c,1670,430);ruin(c,2480,1700);
 for(let i=0;i<520;i++){const x=80+random()*(W-160),y=80+random()*(H-160);if(y>creekY(x)-30&&y<creekY(x)+165)continue;if(i%5===0)grass(c,x,y,.35+random()*.45);else ellipse(c,x,y,1+random()*2,.5,i%3?'#d4ddce':'#dce2d5');}
 // Reeds follow the stream's banks; no collision or gameplay implication.
 for(let i=0;i<75;i++){const x=random()*W,y=creekY(x)+(i%2?153:-14);for(let j=0;j<3;j++){const dx=j*5;stroke(c,[[x+dx,y],[x+dx-3,y-17],[x+dx+1,y-30-j*3]],'#acbea5',.8);ellipse(c,x+dx+1,y-31-j*3,1.4,3,'#c2c7ad');}}
 for(let i=0;i<46;i++){const x=120+random()*(W-240),y=140+random()*(H-280);if(y<creekY(x)-55||y>creekY(x)+185)botanical(c,x,y);}
 // Broken edge marks remain subdued, but communicate the arena extent.
 c.setLineDash([12,10]);c.strokeStyle='#c7d2bf';c.lineWidth=1;c.strokeRect(48,48,W-96,H-96);c.setLineDash([]);
}
function ground(c,t,cam,w,h,zoom,line,oval,reduced){
 if(!painting){painting=document.createElement('canvas');painting.width=W;painting.height=H;seed=73051;terrain(painting.getContext('2d'));}
 c.drawImage(painting,0,0);
 // Sparse moving highlights; static painting is never rebuilt per frame.
 if(!reduced){c.save();c.globalAlpha=.45;for(let i=0;i<24;i++){const x=80+i*137;if(Math.abs(x-cam.x)>w/zoom/2+60)continue;const y=creekY(x)+43+(i%3)*19;if(Math.abs(y-cam.y)>h/zoom/2+30)continue;const drift=Math.sin(t*.45+i)*5;stroke(c,[[x-12+drift,y],[x+10+drift,y]],'#edf5ee',1);}c.restore();}
}
function overlay(c,run,cam,w,h,zoom,line,oval,label,reduced){
 if(!run)return;
 // At most two markers; ordinary off-screen crowds remain unmarked.
 const strong=run.enemies.list().filter(e=>(e.elite||e.boss)&&e.born<=0).sort((a,b)=>Number(b.boss)-Number(a.boss)||Math.hypot(a.x-run.p.x,a.y-run.p.y)-Math.hypot(b.x-run.p.x,b.y-run.p.y));
 let count=0;for(const e of strong){const dx=(e.x-cam.x)*zoom,dy=(e.y-cam.y)*zoom,rx=Math.max(40,w/2-65),ry=Math.max(40,h/2-165);if(Math.abs(dx)<rx&&Math.abs(dy)<ry)continue;const k=Math.min(rx/(Math.abs(dx)||1),ry/(Math.abs(dy)||1)),x=w/2+dx*k,y=h/2+dy*k,a=Math.atan2(dy,dx);c.save();c.translate(x,y);c.rotate(a);line([[-7,-5],[0,0],[-7,5]],e.boss?'#9b5f50':'#927f56',1.8,.85);c.restore();label(e.boss?'首领':'精英',x,y+18,e.boss?'#9b5f50':'#857859',10);if(++count>=2)break;}
 if(run.cool.harvest>0){label('破敌收息 · 附近经验汇入',w/2,h-152,'#638474',12);}
}
root.XJFieldArt={ground,overlay};
})(window);
