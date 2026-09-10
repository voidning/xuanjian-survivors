/* Backward-compatible local journal: history and mastery, never power bonuses. */
(function(root){'use strict';
const KEY='jibichangsheng.archive.v1',items=root.XJ.ITEMS.map(i=>i.id),fruits=['mingyang','lushui'],skills=root.XJ.SKILLS.map(s=>s.id),gifts=root.XJ.GIFTS.map(s=>s.id);
const markIds=['firstElite','firstMastery','firstBoss','firstWin',...fruits.map(x=>'fruit:'+x),...items.map(x=>'win:'+x),...skills.map(x=>'master:'+x)];
const fresh=()=>({schema:1,records:[],marks:[],best:{standard:{},endless:{}}});
const number=x=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(1e10,x)):0;
function cleanEvent(e){if(!e||!['pine','stele','creek'].includes(e.site)||!['available','active','completed','expired','abandoned'].includes(e.status))return null;
 const out={site:e.site,status:e.status,kills:Math.min(3,Math.floor(number(e.kills)))};
 if(['trial','cache','hold','chase'].includes(e.kind)){out.kind=e.kind;out.progress=Math.min(10,number(e.progress));out.at=number(e.at);}return out;}
function cleanLoop(d){if(!d||typeof d!=='object')return null;const out={manaWait:number(d.manaWait),routes:{},formedAt:{}};for(const id of fruits){const m=d.routes?.[id];if(m&&typeof m==='object'){out.routes[id]={};for(const k of ['opportunities','trainingDeferrals','otherDeferrals','offersWithoutTarget','dry','longestDry'])out.routes[id][k]=Math.floor(number(m[k]));}if(typeof d.formedAt?.[id]==='number'&&Number.isFinite(d.formedAt[id]))out.formedAt[id]=number(d.formedAt[id]);}return out;}
function cleanRecord(r){if(!r||typeof r.id!=='string'||r.id.length>80||!items.includes(r.item))return null;
 const out={id:r.id,item:r.item,time:number(r.time),kills:number(r.kills),won:r.won===true,mode:r.mode==='standard'?'standard':'endless'};
 if(Number.isInteger(r.seed)&&r.seed>=0&&r.seed<=4294967295)out.seed=r.seed;
 if(r.skills&&typeof r.skills==='object'){out.skills={};for(const id of skills)if(Number.isInteger(r.skills[id])&&r.skills[id]>0&&r.skills[id]<=3)out.skills[id]=r.skills[id];}
 if(r.training&&typeof r.training==='object'){out.training={};for(const d of root.XJ.TRAINING)if(Number.isInteger(r.training[d.id])&&r.training[d.id]>0&&r.training[d.id]<=d.max&&!(r.item==='screen'&&['haste','weapon'].includes(d.id)))out.training[d.id]=r.training[d.id];}
 if(['筑基','紫府','紫府中期','大真人','五法圆满'].includes(r.realm))out.realm=r.realm;
 if(['mingyang','lushui'].includes(r.dao))out.dao=r.dao;
 if(Array.isArray(r.realmHistory))out.realmHistory=r.realmHistory.filter(x=>x&&['紫府','紫府中期','大真人','五法圆满'].includes(x.realm)).slice(0,4).map(x=>({realm:x.realm,at:number(x.at),count:Math.min(5,number(x.count))}));
 if(r.skillCasts&&typeof r.skillCasts==='object'){out.skillCasts={};for(const id of skills)out.skillCasts[id]=Math.floor(number(r.skillCasts[id]));}
 const loop=cleanLoop(r.loop);if(loop)out.loop=loop;
 if(r.medicine&&typeof r.medicine==='object'){out.medicine={};for(const k of ['dropped','picked','healed','left'])out.medicine[k]=number(r.medicine[k]);}
 if(gifts.includes(r.gift))out.gift=r.gift;
 if(r.primarySkill===null)out.primarySkill=null;
 else if(skills.includes(r.primarySkill)&&out.skills?.[r.primarySkill]&&root.XJ.Rules.costs[r.primarySkill])out.primarySkill=r.primarySkill;
 if(r.fieldEvent===null)out.fieldEvent=null;
 else if(cleanEvent(r.fieldEvent))out.fieldEvent=cleanEvent(r.fieldEvent);
 if(Array.isArray(r.fieldHistory))out.fieldHistory=r.fieldHistory.slice(-48).map(cleanEvent).filter(Boolean);
 if(r.fruits&&typeof r.fruits==='object')out.fruits=Object.fromEntries(fruits.filter(id=>r.fruits[id]===true).map(id=>[id,true]));
 for(const id of ['level','elites','bosses'])if(typeof r[id]==='number')out[id]=number(r[id]);
 if(Number.isSafeInteger(r.endedAt)&&r.endedAt>=0&&r.endedAt<=8640000000000000)out.endedAt=r.endedAt;
 if(typeof r.version==='string'&&/^\d+\.\d+\.\d+$/.test(r.version))out.version=r.version;
 if(['破阵功成','身死道消','主动结束'].includes(r.reason))out.reason=r.reason;
 return out;
}
function clean(raw){if(!raw||raw.schema!==1||!Array.isArray(raw.records))throw Error('存档格式不受支持');const out=fresh();out.marks=[...new Set((Array.isArray(raw.marks)?raw.marks:[]).filter(x=>markIds.includes(x)))];out.records=raw.records.slice(-500).map(cleanRecord).filter(Boolean);
 for(const mode of ['standard','endless'])for(const item of items){const b=raw.best?.[mode]?.[item];if(b)out.best[mode][item]={time:number(b.time),kills:number(b.kills)};}return out;}
let data=fresh(),storageMessage='',storageBlocked=false;
try{const raw=localStorage.getItem(KEY);if(raw)data=clean(JSON.parse(raw));}catch(_){storageBlocked=true;storageMessage='原存档无法读取，已停止覆盖；本次记录暂存在内存，请导出保存。';}
function write(){if(storageBlocked)return;try{localStorage.setItem(KEY,JSON.stringify(data));storageMessage='';}catch(_){storageMessage='本地保存失败，记录仍在内存；请导出保存。';}}
const identities=new WeakMap(),receipts=new WeakMap();
function record(run){const r=run.result;if(!r)return null;if(receipts.has(r))return receipts.get(r);let identity=identities.get(run);if(!identity){identity=typeof root.crypto?.randomUUID==='function'?root.crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);identities.set(run,identity);}
 const mode=r.mode==='standard'?'standard':'endless',id=identity+':'+mode,before=new Set(data.marks),b=data.best[mode][r.item]||{time:0,kills:0};
 const bestTime=r.time>b.time,bestKills=r.kills>b.kills;data.best[mode][r.item]={time:Math.max(b.time,r.time),kills:Math.max(b.kills,r.kills)};
 if(r.elites>0)data.marks.push('firstElite');if(r.bosses>0)data.marks.push('firstBoss');
 for(const skill of skills)if(r.skills?.[skill]===3)data.marks.push('firstMastery','master:'+skill);
 if(r.reason==='破阵功成')data.marks.push('firstWin','win:'+r.item);for(const f of fruits)if(r.fruits?.[f])data.marks.push('fruit:'+f);data.marks=[...new Set(data.marks)];
 const summary=cleanRecord({...r,id,won:r.reason==='破阵功成',endedAt:Date.now()}),old=data.records.find(x=>x.id===id);if(old)Object.assign(old,summary);else data.records.push(summary);data.records=data.records.slice(-500);write();
 const receipt={marks:data.marks.filter(x=>!before.has(x)),bestTime,bestKills};receipts.set(r,receipt);return receipt;}
function merge(raw){const other=clean(raw),map=new Map(data.records.map(r=>[r.id,r]));for(const r of other.records){const old=map.get(r.id);if(!old)map.set(r.id,r);else{const later=r.time>=old.time?r:old,earlier=later===r?old:r;map.set(r.id,{...earlier,...later,kills:Math.max(old.kills,r.kills),won:old.won||r.won});}}
 data.records=[...map.values()].sort((a,b)=>(a.endedAt||0)-(b.endedAt||0)).slice(-500);data.marks=[...new Set([...data.marks,...other.marks])];
 for(const mode of ['standard','endless'])for(const item of items){const a=data.best[mode][item]||{time:0,kills:0},b=other.best[mode][item]||{time:0,kills:0};data.best[mode][item]={time:Math.max(a.time,b.time),kills:Math.max(a.kills,b.kills)};}write();}
function exportFile(){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='几笔长生-修行录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function nextGoal(){const has=id=>data.marks.includes(id);if(!has('firstWin')){if(!has('firstElite'))return '下一目标 · 击败一名精英，获得首次箓气';if(!has('firstMastery'))return '下一目标 · 将一道神通修至三重';if(!has('firstBoss'))return '下一目标 · 击败一位执阵首领';return '下一目标 · 完成破阵挑战（11分15秒开终阵）';}
 for(const item of items.filter(id=>id!=='screen'))if(!has('win:'+item))return '下一目标 · 用'+root.XJ.ITEMS.find(x=>x.id===item).name+'破阵';const openSkills=root.XJ.Cultivation.routes.flatMap(r=>r.ids),skill=openSkills.find(id=>!has('master:'+id));if(skill)return '下一目标 · 将'+root.XJ.SKILLS.find(x=>x.id===skill).name+'修至三重';return '诸法已历 · 换一套神通，挑战自己的纪录';}
root.XJArchive={record,merge,exportFile,nextGoal,markIds,get data(){return data;},get message(){return storageMessage;}};
})(window);
