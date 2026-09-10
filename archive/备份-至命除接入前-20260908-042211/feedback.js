/* Presentation reads live combat state. No additional damage, timers or entities. */
(function(root){'use strict';
const {Run,SKILLS,dist}=root.XJ;
const names=Object.fromEntries(SKILLS.map(s=>[s.id,s.name]));
const verbs={dali:'南明心火 · 随身焚敌、移动 +12%',fragrance:'白色阴火 · 持续灼阵',angler:'幻饵落地 · 诱敌聚群',peril:'山川收束 · 陷敌迟行',gate:'甲兵入场 · 追击近敌',edict:'展开令域 · 普攻追加打击',dusk:'血漠展开 · 记伤与挪移',light:'六合禁闭 · 消弹、振兵',spring:'泉势加持 · 强化普攻',muddle:'浊光惑敌 · 扰乱追击',conceal:'藏匿身形 · 留下残息',dew:'洗去法区 · 护行生效',thunder:'雷霆荡清 · 近敌震退',armor:'金胄凝成 · 吸收伤害',flame:'吐焰炎行 · 持续灼伤',rain:'青雨落阵 · 磨伤破护'};
Run.prototype.skillSignal=function(id,detail){if(!this.skillSignals)this.skillSignals=[];this.skillSignals.push({id,text:detail||verbs[id]||'',at:this.t});if(this.skillSignals.length>3)this.skillSignals.shift();};
function dusk(run){return run.zones.list().find(z=>z.kind==='dusk'&&dist(z,run.p)<z.r);}
function blinkState(run){return !dusk(run)?'须在血漠内':run.cool.blink>0?'冷却 '+run.cool.blink.toFixed(1)+'s':run.p.mp<8?'法力不足':'可挪移 · 8 法力';}
function state(run,id){const p=run.p,z=run.zones.list().find(z=>z.kind===id),c=run.cool;
if(id==='dusk'){const own=dusk(run);return own?'域内 · 记伤 '+(own.playerWound||0).toFixed(1):z?'域外 · 血漠 '+Math.max(0,z.life-z.age).toFixed(1)+'s':c.dusk>0?'冷却 '+c.dusk.toFixed(1)+'s':'待施放';}
if(id==='angler'){const n=run.enemies.list().filter(e=>e.lured>0).length;if(n)return '诱引 '+n+' 名 · 受击可清醒';}
if(id==='dali'&&z)return '心火 '+Math.max(0,z.life-z.age).toFixed(1)+'s · 移动 +12%';
if(id==='peril'&&z)return '险地 '+Math.max(0,z.life-z.age).toFixed(1)+'s · 域内迟缓';
if(id==='body')return p.pressure>0?'合围增伤 '+Math.round(p.pressure*(15+5*run.lv(id)))+'%':p.battleWounds>0?'待复战伤 '+p.battleWounds.toFixed(1):'未受合围';
if(id==='gold')return '淬炼 '+Math.floor(run.temperKills/5)+'/6 · 普攻破护';
if(id==='gate'&&run.allies.count)return '甲兵 '+run.allies.count+' · 强化 '+run.allies.list().filter(a=>a.empowered>0).length;
if(id==='spring'&&c.springPower>0&&run.springCharges>0)return '泉势 '+run.springCharges+' 击 · '+c.springPower.toFixed(1)+'s';
if(id==='armor'&&p.armor>0)return '甲量 '+Math.ceil(p.armor)+' · '+p.armorTime.toFixed(1)+'s';
if(id==='conceal'&&c.hidden>0)return '藏匿 '+c.hidden.toFixed(1)+'s';
if(id==='dew'&&c.dewWard>0)return '地面护行 '+c.dewWard.toFixed(1)+'s';
if(id==='muddle'){const n=run.enemies.list().filter(e=>e.confused>0).length;if(n)return '惑敌 '+n+' 名';}
if(id==='light'){const n=run.enemies.list().filter(e=>e.lightUntil>run.t&&e.stun>0).length;if(n)return '禁闭 '+n+' 名';}
if(z)return '生效 '+Math.max(0,z.life-z.age).toFixed(1)+'s';
if(c[id]>0)return '冷却 '+c[id].toFixed(1)+'s';const cost=run.skillCost(id);if(cost&&p.mp<cost)return (run.skillBudget===id?'蓄法 · ':'缺法力 · ')+Math.ceil(cost-p.mp);if(run.manualSkill===id)return 'F · 手动待命';return run.skillBlock(id,run.nearest(p,500))||'就绪';}
function panel(run){const z=dusk(run),field=run.zones.list().find(z=>z.kind==='dusk');let out='';
if(z)out=`<div class="dusk-readout"><b>赤断镞 · 身在血漠</b><span>已记战伤 <strong>${(z.playerWound||0).toFixed(1)}</strong> · 剩余 ${Math.max(0,z.life-z.age).toFixed(1)}s</span><span>E · ${blinkState(run)}</span><small>离域或收术返还所记伤势；敌人亦会返伤。</small></div>`;
else if(field)out='<div class="dusk-readout"><b>赤断镞 · 当前在域外</b><span>进入血漠后可记伤、按 E 挪移。</span></div>';
out+=(run.skillSignals||[]).filter(e=>run.t-e.at<3.2&&['dew','conceal','dusk',run.manualSkill].includes(e.id)).map(e=>`<div class="skill-event"><b>${names[e.id]||e.id}</b><span>${e.text}</span></div>`).join('');return out;}
function world(c,run,line,oval,label){c.save();
run.zones.forEach(z=>{if(!['dusk','edict','rain'].includes(z.kind))return;const col=z.kind==='dusk'?'#a86559':z.kind==='edict'?'#a58a38':'#568e89',inside=dist(z,run.p)<z.r;
// Solid allied boundary plus an inward lifetime arc; enemy warnings retain their own layer.
oval(z.x,z.y,z.r,z.r,col,true,inside&&z.kind==='dusk'?2.5:1.5);
c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(z.x,z.y,z.r-5,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,1-z.age/z.life));c.stroke();
const title=z.kind==='dusk'?'赤断镞 · 血漠':z.kind==='edict'?'帝观元 · 令域':'清夕雨 · 磨阵';label(title,z.x,z.y-z.r+19,col,12);
if(z.kind==='dusk'){for(let i=0;i<12;i++){const a=i*Math.PI/6,r=z.r;line([[z.x+Math.cos(a)*(r-10),z.y+Math.sin(a)*(r-10)],[z.x+Math.cos(a)*r,z.y+Math.sin(a)*r]],col,1.5,.65);}if(inside){const r=Math.min(180,z.r),dx=run.p.vx,dy=run.p.vy;let x=root.XJ.clamp(run.p.x+dx*r,65,root.XJ.W-65),y=root.XJ.clamp(run.p.y+dy*r,65,root.XJ.H-65);const d=dist({x,y},z);if(d>z.r){x=z.x+(x-z.x)/d*(z.r-5);y=z.y+(y-z.y)/d*(z.r-5);}if(!run.cool.blink&&run.p.mp>=8){c.setLineDash([4,7]);line([[run.p.x,run.p.y],[x,y]],col,1,.45);c.setLineDash([]);oval(x,y,7,4,col,true,1.5);}}}
});
run.enemies.forEach(e=>{if(e.born>0)return;if(e.lightUntil>run.t&&e.stun>0){for(let i=0;i<3;i++){const x=e.x-13+i*13;line([[x,e.y-47],[x,e.y-4]],'#baa04c',1,.7);}oval(e.x,e.y-24,20,27,'#baa04c',true,1);}
if(e.lured>0){line([[e.x,e.y-50],[e.x+4,e.y-57],[e.x+8,e.y-50]],'#597f99',1.5);if(dist(e,{x:e.lureX,y:e.lureY})>24){c.setLineDash([3,9]);line([[e.x,e.y],[e.lureX,e.lureY]],'#7798ac',1,.28);c.setLineDash([]);}}
if(e.mark>0){line([[e.x-5,e.y-52],[e.x,e.y-58],[e.x+5,e.y-52],[e.x,e.y-46],[e.x-5,e.y-52]],'#af9549',1.5);}
if(e.confused>0){c.strokeStyle='#6d9187';c.lineWidth=1.4;c.beginPath();c.arc(e.x,e.y-48,10,run.t*3,run.t*3+Math.PI*1.6);c.stroke();}
});
if(run.cool.dewWard>0){oval(run.p.x,run.p.y,29,10,'#6faaa4',true,2);label('洗劫护行',run.p.x,run.p.y+36,'#568e89',10);}
if(run.cool.hidden>0){c.setLineDash([3,5]);oval(run.p.x,run.p.y-22,22,31,'#77968b',true,1);c.setLineDash([]);}
c.restore();}
root.XJFeedback={state,panel,world,blinkState};
})(window);
