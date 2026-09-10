/* Presentation reads live combat state. No additional damage, timers or entities. */
(function(root){'use strict';
const {Run,SKILLS,dist}=root.XJ;
const names=Object.fromEntries(SKILLS.map(s=>[s.id,s.name]));
const verbs={zhiming:'至命并火 · 灰焰重击、短暂断法',dali:'南明心火 · 随身焚敌、移动 +12%',fragrance:'白色阴火 · 持续灼阵',angler:'幻饵落地 · 诱敌聚群',peril:'山川收束 · 陷敌迟行',gate:'甲兵入场 · 追击近敌',edict:'展开令域 · 普攻追加打击',dusk:'血漠展开 · 记伤与挪移',light:'六合禁闭 · 消弹、振兵',spring:'泉势加持 · 强化普攻',muddle:'浊光惑敌 · 扰乱追击',conceal:'藏匿身形 · 留下残息',dew:'洗去法区 · 护行生效',thunder:'雷霆荡清 · 近敌震退',armor:'金胄凝成 · 吸收伤害',flame:'吐焰炎行 · 持续灼伤',rain:'青雨落阵 · 磨伤破护'};
Run.prototype.skillSignal=function(id,detail){if(!this.skillSignals)this.skillSignals=[];this.skillSignals.push({id,text:detail||verbs[id]||SKILLS.find(s=>s.id===id)?.role||'',at:this.t});if(this.skillSignals.length>3)this.skillSignals.shift();};
function dusk(run){return run.zones.list().find(z=>z.kind==='dusk'&&dist(z,run.p)<z.r);}
function blinkState(run){return !dusk(run)?'须在血漠内':run.cool.blink>0?'冷却 '+run.cool.blink.toFixed(1)+'s':run.p.mp<8?'法力不足':'可挪移 · 8 法力';}
function state(run,id){if(run.lv(id)===3&&XJ.DaoExpansion.passives.includes(id))return ({metalHeart:'辨势 · 感知600',metalTrust:run.daoCounter?'应势 · 余'+run.daoCounter.hits+'击':'待脱势 · 被动',liMandate:run.daoManaReserve?'已储法6':run.cool.dao_liMandate>0?'凝法冷却 '+run.cool.dao_liMandate.toFixed(1)+'s':'命中凝法 · 就绪',fireWhole:'积火 '+(run.daoEmbers||0)+'/3'+(run.cool.dao_fireWhole>0?' · 冷却':'')})[id];if(id==='gate'&&run.lv(id)>0&&run.lv(id)<3)return run.cool.gate>0?'仙基镇压 · 冷却 '+run.cool.gate.toFixed(1)+'s':'仙基落门 · 自动镇压';if(run.lv(id)>0&&run.lv(id)<3)return run.foundationGain(id,run.lv(id));if(run.item==='screen'&&id==='spring')return '持屏无普攻 · 助击停用';if(run.item==='screen'&&id==='gold')return '持屏无普攻 · 不生效';const p=run.p,z=run.zones.list().find(z=>z.kind===id),c=run.cool;
if(id==='dusk'){const own=dusk(run);return own?'域内 · 记伤 '+(own.playerWound||0).toFixed(1):z?'域外 · 血漠 '+Math.max(0,z.life-z.age).toFixed(1)+'s':c.dusk>0?'冷却 '+c.dusk.toFixed(1)+'s':'待施放';}
if(id==='angler'){const n=run.enemies.list().filter(e=>e.lured>0).length;if(n)return '诱引 '+n+' 名 · 受击可清醒';}
if(id==='zhiming'&&z)return '并火 '+Math.max(0,z.life-z.age).toFixed(1)+'s · 灰焰断法';
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
if(id==='light'&&run.hasFruitActive())return 'F · 六合敕令 '+Math.floor(run.fruitActiveEnergy())+'%';
if(id==='light'){const n=run.enemies.list().filter(e=>e.lightUntil>run.t&&e.stun>0).length;if(n)return '禁闭 '+n+' 名';}
if(z)return '生效 '+Math.max(0,z.life-z.age).toFixed(1)+'s';
if(c[id]>0)return '冷却 '+c[id].toFixed(1)+'s';const block=run.skillBlock(id,run.nearest(p,500));if(block)return block;const cost=run.skillCost(id);if(cost&&p.mp<cost)return (run.skillBudget===id?'蓄法 · ':'缺法力 · ')+Math.ceil(cost-p.mp);if(run.manualSkill===id)return 'F · 手动待命';return run.skillBlock(id,run.nearest(p,500))||'就绪';}
function panel(run){const z=dusk(run),field=run.zones.list().find(z=>z.kind==='dusk');let out='';
if(z)out=`<div class="dusk-readout"><b>赤断镞 · 身在血漠</b><span>已记战伤 <strong>${(z.playerWound||0).toFixed(1)}</strong> · 剩余 ${Math.max(0,z.life-z.age).toFixed(1)}s</span><small>离域或收术返还 · 敌人亦会返伤</small></div>`;
else if(field)out='<div class="dusk-readout"><b>赤断镞 · 当前在域外</b><span>进入血漠后可记伤、按 E 挪移。</span></div>';
out+=(run.skillSignals||[]).filter(e=>run.t-e.at<3.2&&['dew','conceal',run.manualSkill].filter(id=>id!=='dusk').includes(e.id)).map(e=>`<div class="skill-event"><b>${names[e.id]||e.id}</b><span>${e.text}</span></div>`).join('');return out;}
function world(c,run,line,oval,label){c.save();
run.zones.forEach(z=>{if(!['dusk','edict','rain'].includes(z.kind))return;const col=z.kind==='dusk'?'#a86559':z.kind==='edict'?'#a58a38':'#568e89',inside=dist(z,run.p)<z.r;
if(z.kind==='dusk'){if(inside){const r=Math.min(180,z.r),dx=run.p.vx,dy=run.p.vy;let x=root.XJ.clamp(run.p.x+dx*r,65,root.XJ.W-65),y=root.XJ.clamp(run.p.y+dy*r,65,root.XJ.H-65);const d=dist({x,y},z);if(d>z.r){x=z.x+(x-z.x)/d*(z.r-5);y=z.y+(y-z.y)/d*(z.r-5);}if(!run.cool.blink&&run.p.mp>=8){c.setLineDash([4,7]);line([[run.p.x,run.p.y],[x,y]],col,1,.45);c.setLineDash([]);oval(x,y,7,4,col,true,1.5);}}}
});
if(run.cool.dewWard>0){oval(run.p.x,run.p.y,29,10,'#6faaa4',true,2);label('洗劫护行',run.p.x,run.p.y+36,'#568e89',10);}
if(run.cool.hidden>0){c.setLineDash([3,5]);oval(run.p.x,run.p.y-22,22,31,'#77968b',true,1);c.setLineDash([]);}
c.restore();}
// One persistent status per enemy. Broken protection takes precedence over control.
// rainBroken is refreshed to three seconds after two seconds in fruit rain;
// exposed is the shared short-lived bypass from rain and weapon effects.
function enemyState(run,e){
if(e.born>0)return '';
if(e.shield&&e.rainBroken>0)return 'rainBroken';
if(e.shield&&e.exposed>0)return 'exposed';
if(e.lightUntil>run.t&&e.stun>0)return 'light';
if(e.stun>0)return 'stun';
if(e.root>0)return 'root';
if(e.confused>0)return 'confused';
if(e.lured>0)return 'lured';
if(e.mark>0)return 'mark';
if(e.shield&&e.rainPressure>0)return 'rainPressure';
return e.shield?'shield':'';
}
function enemy(c,run,e,line,oval,label,reduced){const status=enemyState(run,e);if(!status)return false;c.save();
const x=e.x,y=e.y-51;
if(status==='rainBroken'||status==='exposed'){
 const col=status==='rainBroken'?'#397975':'#9a8959';
 // Split shield glyph stays local and remains visible after leaving fruit rain.
 line([[x-3,y-8],[x-10,y-10],[x-10,y-2],[x-4,y+4]],col,1.6);
 line([[x+3,y-8],[x+10,y-10],[x+10,y-2],[x+4,y+4]],col,1.6);
 if(status==='rainBroken')line([[x+2,y-12],[x-2,y-4]],'#397975',1.7);
}else if(status==='light'){for(const side of [-1,1])line([[x+side*12,y+3],[x+side*12,y-9],[x+side*5,y-9]],'#a68b43',1.5);
}else if(status==='stun'){line([[x-8,y-4],[x+8,y-4]],'#ac9449',2);
}else if(status==='root'){line([[x-8,y-8],[x+8,y+3],[x+8,y-8],[x-8,y+3]],'#6c9baf',1.4);
}else if(status==='confused'){c.strokeStyle='#6d9187';c.lineWidth=1.4;c.beginPath();const phase=reduced?0:run.t*2;c.arc(x,y-3,7,phase,phase+Math.PI*1.6);c.stroke();
}else if(status==='lured'){line([[x-5,y],[x,y-8],[x+5,y]],'#597f99',1.5);
}else if(status==='mark'){line([[x-5,y-3],[x,y-9],[x+5,y-3],[x,y+3],[x-5,y-3]],'#af9549',1.5);
}else if(status==='rainPressure'){const n=Math.max(1,Math.ceil(Math.min(1,e.rainPressure)*3));for(let i=0;i<n;i++)line([[x-6+i*6,y-10],[x-8+i*6,y-3]],'#568e89',1.4);
}else if(status==='shield'){line([[x-8,y-9],[x,y-11],[x+8,y-9],[x+8,y-2],[x,y+4],[x-8,y-2],[x-8,y-9]],'#86979f',1.3);}
c.restore();return true;}
root.XJFeedback={state,panel,world,blinkState,enemyState,enemy};
})(window);
