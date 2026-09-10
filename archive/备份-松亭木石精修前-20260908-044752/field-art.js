/* Porcelain-white battlefield. One cached floor + reusable, depth-sorted scenic cutouts.
   Decorative scenery has no collision. Occluders fade around living actors. */
(function(root){'use strict';
const W=3200,H=2200,P={paper:'#f2efe5',line:'#797c70',light:'#e3dfd1',water:'#bfd5da',deep:'#92b5c1',ink:'#304e48',gold:'#aa9a6a'};
let painting=null,seed=73051,cacheBuilds=0;const props=[],sprites=new Map();
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function stroke(c,p,col,w=1){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function shape(c,p,col,edge,w=1){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.closePath();c.fillStyle=col;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=w;c.lineJoin='round';c.stroke();}}
function ellipse(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();}
function path(c,d,fill,edge,w=1){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(edge){c.strokeStyle=edge;c.lineWidth=w;c.stroke(p);}}
function shadow(c,x,y,rx,ry){ellipse(c,x+8,y+4,rx,ry,'#4b51461b');ellipse(c,x+3,y+2,rx*.7,ry*.65,'#414a3c2a');}
function rock(c,variant=0){const h=variant?55:78;
 shadow(c,0,0,51,13);
 shape(c,[[-43,0],[-34,-h*.48],[-10,-h],[6,-h+3],[38,-h*.5],[49,-4],[22,10],[-20,7]],'#d6d7cf','#74786f',1.6);
 shape(c,[[-10,-h],[7,-h+3],[38,-h*.5],[49,-4],[19,5],[9,-h*.43]],'#8e9999');
 shape(c,[[9,-h*.43],[19,5],[-20,7],[-43,0],[-28,-14]],'#bcb9aa');
 stroke(c,[[-34,-h*.48],[-18,-h*.47],[-10,-h+6]],'#f5f0df',2);stroke(c,[[-18,-h*.47],[9,-h*.43],[19,5]],'#80877c',1.2);
 stroke(c,[[7,-h+3],[4,-h*.7],[13,-h*.54],[11,-h*.3]],'#777f79',1);
 stroke(c,[[-36,-14],[-24,-21],[-18,-37]],'#898c7b',1.1);stroke(c,[[28,-29],[32,-17],[27,-9]],'#657776',1.1);
 shape(c,[[-35,-8],[-20,-13],[-9,-8],[17,3],[-20,5]],'#aaa997');stroke(c,[[-28,-10],[-17,-15],[-7,-10]],'#ddd9c9',1);
 for(let i=0;i<7;i++){const x=-29+i*7;ellipse(c,x,3+Math.sin(i)*2,3+i%3,1.5,i%2?'#82916b':'#a2aa7f');}
}
function pine(c,variant=0){shadow(c,8,3,75,17);
 path(c,'M-8 1Q-10-40 5-83Q17-115 9-149L17-151Q29-115 15-79Q2-40 1 0Z','#8c7c67','#5e594b',1.5);
 path(c,'M-5-4Q-4-36 7-61M8-82Q17-109 13-130',null,'#c4b798',1.4);
 const branches=[[-1,-46,-55,-78],[12,-82,62,-106],[15,-115,-24,-148],[15,-137,37,-171]];
 for(const [x,y,tx,ty]of branches){path(c,`M${x} ${y}Q${(x+tx)/2} ${ty+4} ${tx} ${ty}`,null,'#5e594b',5);path(c,`M${x} ${y-2}Q${(x+tx)/2} ${ty+1} ${tx} ${ty-2}`,null,'#ac9b7b',1.1);}
 for(const [cx,cy,rx]of [[-51,-82,43],[55,-111,48],[-25,-152,42],[33,-177,39]]){
 c.save();c.translate(cx+(variant?5:0),cy);c.rotate(cx<0?-.07:.055);c.scale(rx/45,cx<0?.88:1.06);
 path(c,'M-47 3Q-54-5-40-13Q-33-24-18-21Q-8-35 6-23Q22-29 29-18Q50-19 51-5Q56 4 39 9Q10 17-16 10Q-35 14-47 3Z','#667955','#455a40',1.2);
 path(c,'M-42-7Q-27-25-15-17Q0-31 12-18Q27-25 37-10Q11-3-8-8Q-26-2-42-7Z','#929f74');
 // Irregular needle fans follow branches, avoiding a tiled chevron texture.
 path(c,'M-43 2Q-17-6 0 1Q24-9 45-2L37 8Q12 14-10 7Q-30 12-43 2Z','#465d40');
 for(let j=0;j<17;j++){const x=-39+(j%8)*10+Math.sin(j*5.3)*4,y=-13+Math.floor(j/8)*8+Math.cos(j*2.7)*4;for(let k=0;k<4;k++){const a=-2.9+k*.8+j*.17,len=4+(j+k)%4;stroke(c,[[x,y+3],[x+Math.cos(a)*len,y+Math.sin(a)*len]],j%4===0?'#b6bd94':j%3?'#839567':'#354e39',.65);}}
 path(c,'M-39 5Q-20 1-7 5M7 4Q22-2 36 2',null,'#c1b28a',.75);
 c.restore();}
 // Root flare and low moss unite the silhouette with its footprint.
 stroke(c,[[-6,-7],[-14,0],[-27,3]],'#6b6351',2);stroke(c,[[1,-6],[9,0],[23,3]],'#6b6351',2);ellipse(c,-7,3,13,2,'#99a479');
}
function bamboo(c){shadow(c,2,2,60,12);
 for(let i=0;i<7;i++){const x=(i-3)*15,h=94+(i%3)*20,lean=(i-3)*2;stroke(c,[[x,0],[x+lean,-h]],'#7a8660',3);stroke(c,[[x-1,-2],[x+lean-1,-h]],'#bbc193',1);
 for(let j=1;j<=5;j++){const y=-h*j/6,xx=x+lean*j/6;stroke(c,[[xx-2,y],[xx+2,y]],'#e1e0b9',1.2);const sign=(i+j)%2?1:-1;
 stroke(c,[[xx,y-3],[xx+sign*26,y-17]],'#64774e',1);
 for(let k=0;k<3;k++){const a=xx+sign*(9+k*7),b=y-7-k*4;path(c,`M${a} ${b}q${sign*5} -18 ${sign*16} -20q${-sign*1} 15 ${-sign*16} 20Z`,k%2?'#577154':'#8a9a6a');}
 }}
}
function pavilion(c){shadow(c,0,6,145,24);
 for(let j=3;j>=0;j--)shape(c,[[-91-j*8,j*5],[91+j*8,j*5],[108+j*8,j*5+9],[-108-j*8,j*5+9]],j%2?'#bcbbae':'#e0ddd0','#8e9184');
 shape(c,[[-67,-89],[67,-89],[67,-5],[-67,-5]],'#65564616');shape(c,[[-78,-2],[69,-2],[94,7],[-93,7]],'#89816a42');
 for(const x of [-73,73]){shape(c,[[x-5,0],[x-5,-101],[x+5,-101],[x+5,0]],'#8a7562','#5f5347');stroke(c,[[x-3,-95],[x-3,-5]],'#c4b493',1.3);shape(c,[[x-9,2],[x-8,-7],[x+8,-7],[x+9,2]],'#c3c2b1','#898e81');}
 for(const side of [-1,1]){path(c,`M${side*72}-68Q${side*64}-85 ${side*43}-88`,null,'#685443',4);stroke(c,[[side*71,-70],[side*65,-80],[side*46,-86]],'#b3a17e',1);shape(c,[[side*66,-99],[side*79,-99],[side*79,-91],[side*66,-91]],'#695640','#bdab88',.8);}
 stroke(c,[[-75,-90],[75,-90]],'#655346',7);stroke(c,[[-72,-25],[72,-25]],'#978269',4);
 for(let i=-60;i<=60;i+=20){stroke(c,[[i,-23],[i,-2]],'#95806a',2);stroke(c,[[i,-20],[i+15,-4],[i+15,-20],[i,-4]],'#baa88a',1);}
 path(c,'M-136-93Q-99-97-70-122Q-37-149 0-161Q37-149 70-122Q99-97 136-93L100-83Q45-91 0-122Q-45-91-100-83Z','#6e8178','#4f625b',1.6);
 path(c,'M-132-94Q-80-101 0-139Q80-101 132-94L105-84Q47-98 0-123Q-47-98-105-84Z','#a0ad98');
 for(let i=-10;i<=10;i++){const x=i*10;path(c,`M${i*3} ${-151+Math.abs(i)*2}Q${x*.72} ${-120+Math.abs(i)} ${x} ${-95+Math.abs(i)*.9}`,null,i%2?'#c0c6af':'#5d7266',1);}
 path(c,'M-136-94Q-115-78-91-88Q-48-102 0-123Q48-102 91-88Q115-78 136-94',null,'#4c6057',3);
 path(c,'M-105-83Q-55-96 0-117Q55-96 105-83',null,'#344a40',2);
 path(c,'M-32-151Q0-170 32-151M-20-157 0-168 20-157',null,'#728271',2);
 shape(c,[[-20,-98],[20,-98],[20,-80],[-20,-80]],'#5d5d4e','#a49b6d');stroke(c,[[-12,-88],[-3,-88],[2,-88],[12,-88]],'#c8ba88',1.7);
 for(const side of [-1,1]){stroke(c,[[side*75,-85],[side*75,-54]],'#978769',1);ellipse(c,side*75,-48,5,8,'#b7ad7e');stroke(c,[[side*75,-40],[side*75,-33]],'#817b57',1);}
}
function stele(c){shadow(c,0,0,38,10);shape(c,[[-25,1],[25,1],[32,9],[-32,9]],'#bcb9ad','#898477');shape(c,[[-17,0],[-17,-76],[-9,-91],[13,-88],[20,-77],[20,0]],'#d8d5c9','#827d6d',1.4);shape(c,[[13,-88],[20,-77],[20,0],[12,0]],'#abaea6');stroke(c,[[-8,-78],[-8,-14],[7,-14]],'#a7a394');stroke(c,[[-9,-91],[-4,-66],[-7,-47],[2,-34]],'#8a8476',1);for(let j=0;j<5;j++){const y=-66+j*9;stroke(c,[[-2,y],[6,y],[6,y+3],[-1,y+3]],'#888579',1.2);}}
const sizes={pine:[220,230],bamboo:[190,190],rock:[120,110],pavilion:[320,220],stele:[90,120]};
function sprite(kind,variant=0){const key=kind+variant;if(sprites.has(key))return sprites.get(key);const [w,h]=sizes[kind],canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.translate(w/2,h-30);({pine,bamboo,rock,pavilion,stele})[kind](c,variant);const s={canvas,w,h};sprites.set(key,s);return s;}
function place(kind,x,y,scale=1,variant=0){props.push({kind,x,y,scale,...sprite(kind,variant)});}
function creekY(x){return 1250+Math.sin((x-420)/520)*100+Math.sin(x/290)*29+Math.sin(x/91)*4+Math.sin(x/43)*2;}
function water(c){
 const ribbon=(offset,width,col)=>{c.beginPath();for(let x=-20;x<=W+20;x+=20){const y=creekY(x)+offset;x===-20?c.moveTo(x,y):c.lineTo(x,y);}for(let x=W+20;x>=-20;x-=20)c.lineTo(x,creekY(x)+offset+width+Math.sin(x/170)*13);c.closePath();c.fillStyle=col;c.fill();};
 ribbon(-23,167,'#dce0d4');ribbon(-8,146,'#9fb6b6');ribbon(0,127,P.water);ribbon(30,52,'#aac8d2');ribbon(114,12,'#b4ccd0');
 for(const off of [0,125]){let pts=[];for(let x=0;x<=W;x+=12)pts.push([x,creekY(x)+off+(off?Math.sin(x/170)*13:0)]);stroke(c,pts,off?'#799ca7':'#7e9ca4',1.8);}
 for(let i=0;i<170;i++){const x=random()*W,y=creekY(x)+12+random()*96;path(c,`M${x} ${y}q12-3 23 0t17 0`,null,i%3?'#8eb2c0':'#eff4f1',.7);}
 for(const cx of [1510,620])for(let i=0;i<8;i++){const x=cx+i*11-40,y=creekY(x)+i*16;shadow(c,x,y,13,4);shape(c,[[x-12,y],[x-7,y-6],[x+8,y-6],[x+13,y],[x+5,y+4],[x-9,y+3]],'#dddcd0','#8e9690');stroke(c,[[x-7,y-4],[x+7,y-4]],'#f9faf0',1);}
 for(const cx of [330,1070,1940,2650])for(let i=0;i<14;i++){const x=cx+random()*100,y=creekY(x)+(i%2?146:-14);ellipse(c,x,y,2+random()*4,1.2,'#94a183');}
}
function scenicGround(c){
 // Upper-left light: broad broken shadows lie behind the actual foot contact.
 for(const [x,y,k]of [[1025,1090,1],[2020,1030,1.1],[2140,1510,.9],[480,500,1.1],[2550,530,1.2],[550,1820,1],[2630,1850,1]]){c.save();c.translate(x,y);c.scale(k,k);shape(c,[[0,0],[23,4],[95,50],[128,49],[151,64],[130,78],[80,64],[31,27]],'#495a4510');ellipse(c,97,48,44,13,'#495a4510');ellipse(c,139,64,30,10,'#495a4510');c.restore();}
 // The terrace approaches from the side and stays out of the duelling court.
 path(c,'M1150 995Q1205 1038 1305 1039Q1360 1040 1405 1057',null,'#d5c9b367',34);
 for(let i=0;i<7;i++){const x=1170+i*29,y=1023+Math.sin(i*.6)*12;shape(c,[[x-11,y-4],[x+12,y-3],[x+16,y+4],[x-9,y+5]],i%3?'#d7d0bf':'#c3beae','#aaa794',.7);}
 for(const [cx,span,side]of [[1120,140,-1],[1880,125,-1],[2180,125,1],[460,100,1],[2770,120,-1]]){const y=creekY(cx)+(side>0?139:-5);c.save();c.translate(cx,y);shape(c,[[-span,0],[-span*.7,-7],[-span*.3,-3],[0,-12],[span*.5,-5],[span,0],[span*.7,12],[span*.2,10],[-span*.5,7]],'#b7b6a2','#8b9686',.7);shape(c,[[-span*.8,0],[-span*.4,-5],[0,-8],[span*.6,-2],[span*.75,2],[span*.1,3]],'#d8d3c0');stroke(c,[[-span*.8,7],[-span*.3,10],[span*.1,9],[span*.5,12]],'#edf0e4',1.1);c.restore();}
}
function court(c){c.save();c.translate(1600,1090);ellipse(c,2,6,165,97,'#656e6125');ellipse(c,0,3,161,94,'#b1b1a2');ellipse(c,0,-2,157,91,'#e6e0d1');
 // Broad, quiet paving within the existing terrace footprint.
 c.save();c.beginPath();c.ellipse(0,-2,147,82,0,0,Math.PI*2);c.clip();
 for(let row=0;row<5;row++){const yy=-69+row*31,shift=row%2?29:0;for(let col=0;col<6;col++){const xx=-175+col*59+shift;shape(c,[[xx+2,yy],[xx+57,yy+1],[xx+55,yy+29],[xx,yy+28]],(row+col)%4===0?'#ddd7c8':(row+col)%4===1?'#e9e3d5':'#e4dece');stroke(c,[[xx+2,yy],[xx+57,yy+1]],'#bab6a5',.6);stroke(c,[[xx+57,yy+1],[xx+55,yy+29]],'#c4bdad',.6);}}
 c.restore();
 for(let j=0;j<12;j++){const a=j*Math.PI/6;c.beginPath();c.ellipse(0,-2,151,86,0,a+.018,a+Math.PI/6-.022);c.strokeStyle=j%3?'#a7a797':'#c4c0af';c.lineWidth=2;c.stroke();stroke(c,[[Math.cos(a)*143,Math.sin(a)*80-2],[Math.cos(a)*157,Math.sin(a)*91-2]],'#a8a697',.8);}
 // A few chipped edges, with no new obstacle silhouette.
 for(const [xx,yy]of [[-141,27],[107,62],[48,-83]]){shape(c,[[xx-5,yy-2],[xx+7,yy],[xx+3,yy+4],[xx-4,yy+2]],'#a7a693');stroke(c,[[xx-5,yy-3],[xx+7,yy-1]],'#eee9da',1);}

 for(const [x,y]of [[-117,28],[-102,-40],[110,43],[135,-23]]){stroke(c,[[x,y],[x+8,y+4],[x+7,y+11],[x+15,y+13]],'#a2a18f',.9);ellipse(c,x-3,y+2,5,1.5,'#a9b18c');}c.restore();}
function build(){cacheBuilds++;seed=73051;painting=document.createElement('canvas');painting.width=W;painting.height=H;const c=painting.getContext('2d');c.fillStyle=P.paper;c.fillRect(0,0,W,H);
 // Large pale washes only outside the open centre; grain generated once.
 for(const [x,y,rx,ry,tint]of [[900,900,320,220,"#a9b18b"],[2200,950,330,230,"#b6b69a"],[2000,1520,330,150,"#b7b19d"],[500,500,400,270,"#a9b18b"],[1840,825,160,110,"#beac91"]]){c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,20,0,0,rx);g.addColorStop(0,tint+'6b');g.addColorStop(1,tint+'00');c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();}
 path(c,'M1670 270C1760 620 1410 820 1560 1160C1660 1460 1850 1740 2460 2160',null,'#d2c8b4',74);path(c,'M1670 270C1760 620 1410 820 1560 1160C1660 1460 1850 1740 2460 2160',null,'#e4daca',61);court(c);water(c);scenicGround(c);
 // Deliberate scenic islands frame the starting court, with a clear approach on each side.
 for(const [x,y,s]of [[1025,1090,1],[2020,1030,1.1],[2140,1510,.9],[480,500,1.1],[2550,530,1.2],[550,1820,1],[2630,1850,1]]){
 place('rock',x-48,y+7,s*.72);place('pine',x,y,s);place('rock',x+39,y+27,s*.5,1);place('bamboo',x+106,y-46,s*.68);
 }
 place('pavilion',1150,995,1.05);place('bamboo',1010,916,.82);place('bamboo',1245,895,.62);place('rock',1087,1045,.45,1);
 for(const [x,scale]of [[1090,.58],[1185,.44],[1860,.65],[1950,.42],[2770,.6]])place('rock',x,creekY(x)-5,scale,1);
 place('stele',1670,430,1);place('stele',1840,825,1.1);place('rock',1881,846,.4,1);place('stele',2480,1700,1.15);
 for(const [x,y]of [[2050,1470],[860,1660],[2840,870]]){place('rock',x+35,y-20,.94);place('rock',x,y,1.1);place('rock',x-42,y+18,.68,1);}
 c.font='12px Songti SC,serif';c.textAlign='center';c.fillStyle='#858272';c.fillText('松亭',1150,1035);c.fillText('残碑',1840,859);c.fillText('溪岸',1650,creekY(1650)+171);
 // Bank reeds use short groups, leaving crossing stones exposed.
 for(const [cx,side]of [[365,1],[1095,-1],[1190,-1],[1920,-1],[2240,1],[2730,-1]])for(let i=0;i<4;i++){const x=cx+i*8,y=creekY(x)+(side>0?148:-13);for(let j=0;j<3;j++){const xx=x+j*3,h=13+(j+i)%3*6;path(c,`M${xx} ${y}q2-${h*.5} ${4+j}-${h}`,null,'#9c926a',.8);ellipse(c,xx+4+j,y-h,1.3,4,'#c0ad79');stroke(c,[[xx,y-4],[xx-4,y-11]],'#90956f',.7);}}
 // Shallow shelves interrupt the long bank edge only beside established scenery.
 for(const cx of [1065,1190,1865,1960,2740]){const yy=creekY(cx);shape(c,[[cx-33,yy+3],[cx-17,yy-4],[cx+7,yy-2],[cx+28,yy+8],[cx+18,yy+16],[cx-8,yy+13]],'#c9c7b4');stroke(c,[[cx-29,yy+7],[cx-8,yy+15],[cx+19,yy+18],[cx+32,yy+11]],'#e9efdf',1.2);for(let j=0;j<4;j++){const xx=cx-20+j*12;ellipse(c,xx,yy+7+(j%2)*3,3+j%2,1.6,'#989f8b');}}
 // Small flat stones and earth patches tie the pavilion approach into the path.
 for(const [cx,cy]of [[1306,1043],[1395,1058],[1807,859]]){ellipse(c,cx,cy,27,7,'#c8baa12a');for(let j=0;j<4;j++){const xx=cx+j*9-15,yy=cy+Math.sin(j*2)*4;shape(c,[[xx-4,yy],[xx,yy-2],[xx+5,yy],[xx+1,yy+2]],j%2?'#b9b3a1':'#d0c8b5');}}
 // Restrained leaf litter belongs to the stele and pavilion, not the open court.
 for(const [cx,cy]of [[1815,841],[1150,1040],[2460,1710]])for(let j=0;j<9;j++){const x=cx+Math.sin(j*2.4)*28,y=cy+Math.cos(j*1.7)*10;shape(c,[[x-3,y],[x,y-2],[x+4,y+1],[x,y+2]],j%3?'#b5a185':'#c5b384');}
 for(const [cx,cy]of [[1055,1064],[2053,1048]])for(let j=0;j<4;j++){const x=cx+j*6,y=cy+Math.sin(j*2)*4;stroke(c,[[x,y+4],[x,y-2]],'#8c9b78',.7);ellipse(c,x-1,y-2,2.4,1.4,'#fff9e8');ellipse(c,x+1,y-4,1.5,2,'#fff9e8');}
 c.globalAlpha=.07;for(let i=0;i<22000;i++){c.fillStyle=i%2?'#fff':'#77715f';c.fillRect(random()*W,random()*H,1+random()*2,1);}c.globalAlpha=1;
 c.setLineDash([12,10]);c.strokeStyle='#b5b6a4';c.strokeRect(48,48,W-96,H-96);c.setLineDash([]);
}
function ground(c,t,cam,w,h,zoom,line,oval,reduced){if(!painting)build();c.drawImage(painting,0,0);if(!reduced){c.save();c.globalAlpha=.65;for(let i=0;i<18;i++){const x=80+i*173,y=creekY(x)+48+i%3*19;if(Math.abs(x-cam.x)>w/zoom/2+40||Math.abs(y-cam.y)>h/zoom/2+30)continue;const d=Math.sin(t*.45+i)*4;stroke(c,[[x-10+d,y],[x+12+d,y]],'#f2f8f0',1);}c.restore();}}
function compose(c,cam,w,h,zoom,actors){if(!painting)build();const visible=props.filter(o=>Math.abs(o.x-cam.x)<w/zoom/2+o.w*o.scale&&Math.abs(o.y-cam.y)<h/zoom/2+o.h*o.scale);
 const queue=[...actors,...visible.map(o=>({y:o.y,draw(){const left=o.x-o.w*o.scale/2,top=o.y-(o.h-30)*o.scale;
 const occludes=actors.some(a=>a.x>left+15&&a.x<left+o.w*o.scale-15&&a.y<o.y+3&&a.y>top+22);
 c.save();if(occludes)c.globalAlpha*=.28;c.drawImage(o.canvas,left,top,o.w*o.scale,o.h*o.scale);c.restore();}}))];queue.sort((a,b)=>a.y-b.y);for(const o of queue)o.draw();}
function overlay(c,run,cam,w,h,zoom,line,oval,label,reduced){
 if(!run)return;
 // At most two markers; ordinary off-screen crowds remain unmarked.
 const strong=run.enemies.list().filter(e=>(e.elite||e.boss)&&e.born<=0).sort((a,b)=>Number(b.boss)-Number(a.boss)||Math.hypot(a.x-run.p.x,a.y-run.p.y)-Math.hypot(b.x-run.p.x,b.y-run.p.y));
 let count=0;for(const e of strong){const dx=(e.x-cam.x)*zoom,dy=(e.y-cam.y)*zoom,rx=Math.max(40,w/2-65),ry=Math.max(40,h/2-165);if(Math.abs(dx)<rx&&Math.abs(dy)<ry)continue;const k=Math.min(rx/(Math.abs(dx)||1),ry/(Math.abs(dy)||1)),x=w/2+dx*k,y=h/2+dy*k,a=Math.atan2(dy,dx);c.save();c.translate(x,y);c.rotate(a);line([[-7,-5],[0,0],[-7,5]],e.boss?'#9b5f50':'#927f56',1.8,.85);c.restore();label(e.boss?'首领':'精英',x,y+18,e.boss?'#9b5f50':'#857859',10);if(++count>=2)break;}
 if(run.cool.harvest>0){label('破敌收息 · 附近经验汇入',w/2,h-152,'#638474',12);}
}
root.XJFieldArt={ground,compose,overlay,get metrics(){return {cacheBuilds,scenicSprites:sprites.size,placedProps:props.length,cacheBytes:W*H*4+[...sprites.values()].reduce((n,s)=>n+s.w*s.h*4,0)};}};
})(window);
