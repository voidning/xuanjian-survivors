/* UI for compatibility, primary casting and the optional field encounter. */
(function(root){'use strict';
const {SKILLS,FieldEvent,dist}=root.XJ;
const name=id=>SKILLS.find(s=>s.id===id)?.name||'均衡调度';
function fit(run,id,gift){const hint=run.choiceFit(id,gift);return hint?`<span class="fit-note fit-${hint.tone}">${hint.text}</span>`:'';}
function mana(run){const count=SKILLS.filter(s=>run.lv(s.id)===3&&run.skillCost(s.id)&&!(run.item==='screen'&&s.id==='spring')).length;return `<p class="mana-context">当前 ${count} 道主动神通共用法力 · 每秒回复 ${run.regen.toFixed(1)} · 暂停可指定一道主修优先施放</p>`;}
function primary(run){return `<label class="manual-picker primary-picker">主修优先 <select id="primarySelect"><option value="">均衡调度</option>${SKILLS.filter(s=>run.canPrimary(s.id)).map(s=>`<option value="${s.id}" ${s.id===run.primarySkill?'selected':''}>${s.name} · 神通</option>`).join('')}</select></label><p class="primary-help">主修就绪时优先蓄法；冷却或无目标时让行，紧急防御仍优先。其他神通缺法先让行，等待一秒后轮候蓄法。</p>`;}
function eventText(e){return {available:'未接取',active:'进行中',completed:'完成',expired:'已到期',abandoned:'已放弃'}[e?.status]||'';}
function progress(e){const def=FieldEvent.info(e);return ['cache','hold'].includes(e.kind)?`${Math.min(def.goal,e.progress||0).toFixed(1)} / ${def.goal} 秒`:`${e.kills||0} / ${def.goal}`;}
function record(r){const primary='primarySkill' in r?name(r.primarySkill):'旧纪录未记录',events=r.fieldHistory?.length?r.fieldHistory:r.fieldEvent?[r.fieldEvent]:[];return `<div class="run-tactics">${r.training?root.XJExperience?.trainingSummary(r)||'':'<p class="muted">修行强化：旧纪录未记录</p>'}<p>主修：${primary}</p>${events.length?`<details><summary>山场机缘 · 完成 ${events.filter(e=>e.status==='completed').length} / ${events.length}</summary>${events.map(e=>`<p>${FieldEvent.info(e).name} · ${FieldEvent.sites.find(s=>s.id===e.site)?.name||''} · ${eventText(e)} · ${progress(e)}${e.status==='completed'?' · '+FieldEvent.info(e).reward:''}</p>`).join('')}</details>`:'fieldEvent' in r?'<p>山场机缘：未遇到</p>':''}</div>`;}
function pauseEvent(run){const e=run.fieldEvent;if(!FieldEvent.live(e))return '';const def=FieldEvent.info(e);return `<div class="event-pause"><p><b>${def.name} · ${e.name}</b> · 剩余 ${Math.ceil(Math.max(0,e.deadline-run.t))} 秒<br>${def.task} · ${progress(e)}<br>完成：${def.reward}</p><button id="abandonEvent">放弃本次机缘</button><small>不扣资源；已惊动敌人仍留场。</small></div>`;}
function hud(run){const e=run?.fieldEvent;if(!FieldEvent.live(e))return '';const def=FieldEvent.info(e),d=dist(e,run.p),a=Math.atan2(e.y-run.p.y,e.x-run.p.x),arrow=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(a/(Math.PI/4))+8)%8];let task=def.task;
 if(e.kind==='cache')task=d<def.radius?'拾取 '+progress(e):'连续停留 2 秒 · 离圈重计';
 if(e.kind==='hold')task=(d<def.radius?'据守 ':'离圈暂歇 · ')+progress(e);
 if(e.kind==='trial'&&e.status==='active')task='击破旗记守卫 '+progress(e);
 if(e.kind==='chase'&&e.status==='active')task='追击旗记目标';
 return `<b>${def.name} · ${Math.ceil(Math.max(0,e.deadline-run.t))} 秒</b><span>${arrow} ${Math.round(d)} 步 · ${task}</span>${['cache','hold'].includes(e.kind)?`<div class="encounter-track" aria-label="${task}"><i style="width:${100*(e.progress||0)/def.goal}%"></i></div>`:''}<small>${def.reward} · 可绕开 / P 放弃</small>`;}
function world(c,run,line,oval,label){const e=run.fieldEvent;if(!FieldEvent.live(e))return;const def=FieldEvent.info(e),inside=dist(e,run.p)<def.radius,col=inside?'#406d5a':'#867146';c.save();
 if(e.kind==='cache'){line([[e.x-14,e.y-5],[e.x,e.y-22],[e.x+14,e.y-5],[e.x+11,e.y+6],[e.x-11,e.y+6],[e.x-14,e.y-5]],col,2.5);line([[e.x-11,e.y-4],[e.x+11,e.y-4],[e.x,e.y+6]],col,1.5);}
 else{line([[e.x,e.y+7],[e.x,e.y-52],[e.x+25,e.y-44],[e.x,e.y-32]],col,2.5);oval(e.x,e.y,23,10,col,true,1.3);}
 label(def.name,e.x,e.y-66,col,13);
 if(e.kind!=='chase'||e.status==='available'){c.setLineDash(inside?[]:[5,9]);oval(e.x,e.y,def.radius,def.radius,col,true,2);c.setLineDash([]);}
 if(['cache','hold'].includes(e.kind)){c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.arc(e.x,e.y,def.radius-5,-Math.PI/2,-Math.PI/2+Math.PI*2*(e.progress||0)/def.goal);c.stroke();label(progress(e),e.x,e.y+30,col,12);}
 for(const q of run.enemies.list().filter(q=>q.fieldGuard&&q.fieldEventId===e.id)){line([[q.x-4,q.y-75],[q.x-4,q.y-88],[q.x+6,q.y-83],[q.x-4,q.y-79]],col,2);}
 c.restore();}
root.XJPlayUI={fit,mana,primary,record,pauseEvent,hud,world};
})(window);
