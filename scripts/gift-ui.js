/* Browsing and presentation for 箓气. Combat rules live in XJ.GiftSystem. */
(function(root){'use strict';
const PAGE_SIZE=3;
let active=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const system=()=>root.XJ?.GiftSystem;
function normalized(entry){return entry?{...entry,grade:entry.grade||entry.tier,tag:entry.tag||entry.category,purpose:entry.purpose||entry.role,mechanic:entry.mechanic||entry.desc,explanation:entry.explanation||entry.fact,status:entry.status||(entry.pending?'pending':'active')}:null;}
function definitions(){const api=system(),source=api?.definitions??api?.entries??[],rows=typeof source==='function'?source.call(api):source;return Array.isArray(rows)?rows.filter(Boolean).map(normalized):[];}
function get(id){const api=system(),entry=api?.get?.(id)??definitions().find(row=>row.id===id);return normalized(entry);}
function details(run,id){const api=system(),extra=api?.details?.(run,id),entry=get(id);return extra&&typeof extra==='object'?{...entry,...extra}:entry;}
function isAvailable(run,entry){const api=system();if(entry?.status!=='active')return false;if(typeof api?.available!=='function')return true;try{return !!api.available(run,entry);}catch(_){try{return !!api.available(run,entry.id);}catch(_again){return false;}}}
function statusText(status){return status==='active'?'本局可选':status==='pending'?'原文待核实':'暂未开放';}
function typeText(entry){return [entry.grade,entry.tag].filter(Boolean).join(' · ')||'箓气';}
function symbol(id){
 const marks={
  whale:'<path d="M8 25c9-11 19-11 28-2-8 1-12 8-19 8-5 0-8-2-9-6Z"/><path d="M31 19c3-4 6-5 9-3-2 4-4 6-8 7"/>',
  life:'<path d="M24 7c-7 8-11 13-11 20a11 11 0 0 0 22 0c0-7-4-12-11-20Z"/><path d="m17 28 6-8 1 7 7-5"/>',
  sparrow:'<path d="M7 28c9-2 12-11 18-15-1 8 6 9 15 8-8 3-11 10-20 9-5 0-9-1-13-2Z"/><path d="m25 13 4-5"/>',
  sunseal:'<circle cx="24" cy="24" r="9"/><path d="M24 5v6m0 26v6M5 24h6m26 0h6M11 11l4 4m18 18 4 4m0-26-4 4M15 33l-4 4"/>',
  cloud:'<path d="M7 28c3-7 8-8 13-5 2-8 13-9 17-2 6 0 8 3 6 7H7Z"/><path d="M12 34h23M18 39h15"/>',
  might:'<path d="M10 34 27 9l-3 14h14L19 42l5-16H10Z"/>',
  omen:'<path d="M8 31c8-17 24-20 32-2-9 8-23 9-32 2Z"/><circle cx="25" cy="27" r="4"/><path d="M13 14c7-7 16-7 22 0"/>',
  rainbow:'<path d="M7 34c3-14 12-22 25-22 4 0 7 1 10 3M13 37c3-11 10-17 20-17 3 0 5 0 8 2M20 39c2-7 7-11 14-11 2 0 4 1 6 2"/>',
  frostpine:'<path d="M24 5v37M11 35l13-25 13 25M15 27h18M18 20h12M20 14h8"/>',
  greed:'<path d="M8 33c10-1 12-11 16-22 4 11 6 21 16 22-8 6-24 6-32 0Z"/><path d="M16 28c5 3 11 3 16 0M24 11v27"/>'
 };
 return `<svg class="gift-sigil" viewBox="0 0 48 48" aria-hidden="true"><g>${marks[id]||'<circle cx="24" cy="24" r="15"/><path d="M14 24h20M24 14v20"/>'}</g></svg>`;
}
function choiceEntries(run){
 const choices=Array.isArray(run?.choices)?run.choices:[];
 return choices.map((id,index)=>({entry:details(run,id),index})).filter(row=>row.entry&&isAvailable(run,row.entry));
}
function detailBody(entry,run,selected=false,compact=false){
 if(!entry)return '<p class="gift-empty">请选择一道箓气查看详情。</p>';
 const explanation=entry.explanation||entry.description||entry.desc||entry.detail||'';
 const evidence=`<details class="gift-evidence"><summary>原著依据与改编边界</summary>${explanation?`<p><b>原著所载</b><br>${esc(explanation)}</p>`:''}<p><b>出处</b><br>${esc(entry.source||'待补充')}</p><p><b>改编边界</b><br>${esc(entry.boundary||'暂无补充')}</p></details>`;
 return `<div class="gift-detail-heading">${symbol(entry.id)}<div><span>${esc(typeText(entry))}</span><h3>${esc(entry.name)}</h3></div>${selected?'<b>已选中</b>':''}</div><p class="gift-detail-purpose">${esc(entry.mechanic||entry.purpose||'查看箓气规则')}</p>${compact?evidence:`<p class="gift-role">${esc(entry.purpose||'')}</p>${evidence}`}${run?.gift===entry.id?statsHTML(run,entry.id):''}`;
}
const statLabels={uses:'发动次数',triggers:'触发次数',damage:'追加伤害',damageDealt:'造成伤害',mana:'回复法力',manaRestored:'回复法力',xp:'额外经验',experience:'额外经验',prevented:'避免伤害',blocked:'抵挡次数',dodges:'避开致命伤',kills:'关联击杀',stacks:'当前层数',peakStacks:'最高层数',duration:'生效时长',activeTime:'生效时长',lifeSpent:'耗费寿元'};
function flatten(value,prefix='',out=[]){
 if(value==null)return out;
 if(typeof value!=='object'){out.push([prefix,value]);return out;}
 for(const [key,item] of Object.entries(value)){if(['id','name','grade','tag','purpose','mechanic','boundary','source','status'].includes(key))continue;const label=prefix?`${prefix} · ${statLabels[key]||key}`:(statLabels[key]||key);if(item&&typeof item==='object'&&!Array.isArray(item))flatten(item,label,out);else if(!Array.isArray(item))out.push([label,item]);}
 return out;
}
function statValue(value){if(typeof value==='number')return Number.isInteger(value)?String(value):String(Math.round(value*10)/10);if(typeof value==='boolean')return value?'是':'否';return String(value??'—');}
function statsHTML(run,id){
 const api=system();let summary=null;
 try{summary=api?.stats?.(run,id)??api?.summary?.(run,id)??null;}catch(_){summary=null;}
 if(summary&&typeof summary==='object'&&id&&summary[id]&&typeof summary[id]==='object')summary=summary[id];
 if(summary&&typeof summary==='object'&&summary.stats&&typeof summary.stats==='object')summary=summary.stats;
 const rows=flatten(summary).filter(([,value])=>value!==undefined&&value!==null);
 return `<section class="gift-stats" aria-label="本局真实统计"><h4>本局实绩</h4>${rows.length?`<div>${rows.map(([label,value])=>`<span><b>${esc(statValue(value))}</b><small>${esc(label)}</small></span>`).join('')}</div>`:'<p>本局尚无触发记录。</p>'}</section>`;
}
function choice(run){return `<div class="gift-choice-intro"><div class="eyebrow">受箓 · 本局仅一次</div><h2>择一道箓气</h2><p class="choice-lead">首次击败精英后受箓。分类翻页，先选后确认；本局不可更换。</p></div><div class="gift-browser" data-gift-browser></div>`;}
function renderChoice(){
 if(!active?.container?.isConnected)return;
 const all=choiceEntries(active.run),tags=['全部',...new Set(all.map(row=>row.entry.tag).filter(Boolean))];
 if(!tags.includes(active.tag))active.tag='全部';
 const filtered=active.tag==='全部'?all:all.filter(row=>row.entry.tag===active.tag),pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 active.page=Math.max(0,Math.min(active.page,pages-1));
 const page=filtered.slice(active.page*PAGE_SIZE,(active.page+1)*PAGE_SIZE),selected=all.find(row=>row.index===active.selectedIndex);
 const browser=active.container.querySelector('[data-gift-browser]')||active.container;
 browser.innerHTML=`<nav class="gift-filters" aria-label="箓气分类">${tags.map(tag=>`<button data-gift-tag="${esc(tag)}" aria-pressed="${tag===active.tag}">${esc(tag)}</button>`).join('')}</nav><div class="gift-choice-layout"><section><div class="gift-page-meta"><span>${filtered.length} 道可选 · 每页至多 ${PAGE_SIZE} 道</span><b>${active.page+1} / ${pages}</b></div><div class="gift-short-cards">${page.map((row,local)=>{const entry=row.entry,isSelected=row.index===active.selectedIndex;return `<button class="gift-choice-card gift-${esc(entry.id)}" data-choice="${row.index}" data-gift-local="${local+1}" aria-pressed="${isSelected}">${symbol(entry.id)}<span class="gift-card-copy"><small>${local+1} · ${esc(typeText(entry))}</small><strong>${esc(entry.name)}</strong><em>${esc(entry.purpose||entry.mechanic||'查看箓气规则')}</em></span><i aria-hidden="true">${isSelected?'已选':'详'}</i></button>`;}).join('')||'<p class="gift-empty">此分类暂无本局可选箓气。</p>'}</div><div class="gift-pager"><button data-gift-page="prev" ${active.page===0?'disabled':''}>上一页</button><span>数字 1–3 选中本页箓气</span><button data-gift-page="next" ${active.page>=pages-1?'disabled':''}>下一页</button></div>${canDefer(active.run)?'<button class="gift-defer" data-gift-defer>暂缓受箓 · 等待后续构筑</button>':''}</section><aside class="gift-choice-detail" aria-live="polite">${detailBody(selected?.entry,active.run,!!selected,true)}<button class="gift-confirm primary" data-gift-confirm ${selected?'':'disabled'}>${selected?`确认受箓 · ${esc(selected.entry.name)}`:'先选中一道箓气'}</button><small>确认后立即生效，本局不能更换。</small><button class="gift-back" data-gift-back>返回候选</button></aside></div>`;
 bindChoice(browser);
}
function bindChoice(browser){
 browser.querySelectorAll('[data-gift-tag]').forEach(button=>button.onclick=()=>{active.tag=button.dataset.giftTag;active.page=0;active.selectedIndex=null;renderChoice();});
 browser.querySelectorAll('[data-gift-page]').forEach(button=>button.onclick=()=>{active.page+=button.dataset.giftPage==='next'?1:-1;renderChoice();});
 browser.querySelectorAll('.gift-choice-card[data-choice]').forEach(button=>button.onclick=()=>select(Number(button.dataset.choice)));
 const confirmButton=browser.querySelector('[data-gift-confirm]');if(confirmButton)confirmButton.onclick=confirm;
 const deferButton=browser.querySelector('[data-gift-defer]');if(deferButton)deferButton.onclick=defer;
 const backButton=browser.querySelector('[data-gift-back]');if(backButton)backButton.onclick=()=>browser.querySelector('.gift-short-cards')?.scrollIntoView({block:'start'});
}
function mount(container,run,options={}){active={container,run,onConfirm:options.onConfirm,onDefer:options.onDefer,tag:'全部',page:0,selectedIndex:null};renderChoice();return api;}
function select(index){if(!active||!Number.isInteger(index)||!choiceEntries(active.run).some(row=>row.index===index))return false;active.selectedIndex=index;renderChoice();const detail=active.container.querySelector('.gift-choice-detail'),confirmButton=active.container.querySelector('[data-gift-confirm]');confirmButton?.focus({preventScroll:true});if(root.matchMedia?.('(max-width: 820px)').matches)requestAnimationFrame(()=>detail?.scrollIntoView({block:'start',behavior:root.XJPreferences?.reduced||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));return true;}
function key(n){if(!active||!Number.isInteger(n)||n<1||n>PAGE_SIZE)return false;const button=active.container.querySelector(`[data-gift-local="${n}"]`);return button?select(Number(button.dataset.choice)):false;}
function confirm(){if(!active||!Number.isInteger(active.selectedIndex))return false;const callback=active.onConfirm,index=active.selectedIndex;active=null;if(typeof callback==='function')callback(index);return true;}
function canDefer(run){return typeof run?.deferGift==='function'&&definitions().some(entry=>entry.id==='greed'&&!isAvailable(run,entry));}
function defer(){if(!active||!canDefer(active.run))return false;const callback=active.onDefer,run=active.run;active=null;if(typeof callback==='function')callback(run);else run.deferGift();return true;}
function pause(run){const entry=run?.gift?details(run,run.gift):null;return `<details class="gift-pause" ${entry?'open':''}><summary>箓气 · ${esc(entry?.name||'尚未受箓')}</summary>${entry?detailBody(entry,run):'<p>首次击败精英后可从所有已开放箓气中择一。</p>'}</details>`;}
function catalog(run){return `<section class="gift-catalog" data-gift-catalog><div class="gift-catalog-head"><h3>箓气</h3><p>十箓分栏查阅；本局只能受一道，不占神通槽。</p></div><div data-gift-catalog-body></div></section>`;}
function catalogStatus(run,entry){if(entry.id===run?.gift)return '已受箓';if(run?.gift)return '本局不可改换';if(entry.status!=='active')return statusText(entry.status);return isAvailable(run,entry)?'本局可选':'条件未满足';}
function mountCatalog(container,run){
 const host=container?.querySelector?.('[data-gift-catalog]');if(!host)return false;
 const state={tag:'全部',page:0},body=host.querySelector('[data-gift-catalog-body]'),all=definitions();
 const render=()=>{const tags=['全部',...new Set(all.map(entry=>entry.tag).filter(Boolean))];if(!tags.includes(state.tag))state.tag='全部';const filtered=state.tag==='全部'?all:all.filter(entry=>entry.tag===state.tag),pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));state.page=Math.max(0,Math.min(state.page,pages-1));const rows=filtered.slice(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE);body.innerHTML=`<nav class="gift-catalog-filters" aria-label="箓气图鉴分类">${tags.map(tag=>`<button data-catalog-tag="${esc(tag)}" aria-pressed="${tag===state.tag}">${esc(tag)}</button>`).join('')}</nav><div class="gift-catalog-list">${rows.map(entry=>{const label=catalogStatus(run,entry);return `<details class="gift-catalog-entry gift-${esc(entry.id)}" ${entry.id===run?.gift?'open':''}><summary>${symbol(entry.id)}<span><small>${esc(typeText(entry))}</small><strong>${esc(entry.name)}</strong></span><b class="gift-status status-${esc(entry.status||'inactive')}">${esc(label)}</b></summary>${detailBody(entry,entry.id===run?.gift?run:null)}</details>`;}).join('')}</div><div class="gift-catalog-pager"><button data-catalog-page="prev" ${state.page===0?'disabled':''}>上一页</button><span>${filtered.length} 道 · ${state.page+1} / ${pages}</span><button data-catalog-page="next" ${state.page>=pages-1?'disabled':''}>下一页</button></div>`;body.querySelectorAll('[data-catalog-tag]').forEach(button=>button.onclick=()=>{state.tag=button.dataset.catalogTag;state.page=0;render();});body.querySelectorAll('[data-catalog-page]').forEach(button=>button.onclick=()=>{state.page+=button.dataset.catalogPage==='next'?1:-1;render();});};
 render();return true;
}
const api={PAGE_SIZE,choice,mount,key,select,confirm,defer,pause,catalog,mountCatalog,symbol,statsHTML};
root.XJGiftUI=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
