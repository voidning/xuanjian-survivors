/* Versioned local run archive. No power bonuses; imports merge rather than erase. */
(function(root){'use strict';
const KEY='jibichangsheng.archive.v1',items=['sword','bow','spear'],fruits=['mingyang','lushui'];
const fresh=()=>({schema:1,records:[],marks:[],best:{standard:{},endless:{}}});
const number=x=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(1e10,x)):0;
const validMark=x=>['firstWin',...items.map(x=>'win:'+x),...fruits.map(x=>'fruit:'+x)].includes(x);
function clean(raw){if(!raw||raw.schema!==1||!Array.isArray(raw.records))throw Error('存档格式不受支持');const out=fresh();out.marks=[...new Set((Array.isArray(raw.marks)?raw.marks:[]).filter(validMark))];
 for(const r of raw.records.slice(-500)){if(!r||typeof r.id!=='string'||r.id.length>80||!items.includes(r.item))continue;out.records.push({id:r.id,item:r.item,time:number(r.time),kills:number(r.kills),won:r.won===true,mode:r.mode==='standard'?'standard':'endless'});}
 for(const mode of ['standard','endless'])for(const item of items){const b=raw.best?.[mode]?.[item];if(b)out.best[mode][item]={time:number(b.time),kills:number(b.kills)};}
 return out;
}
let data=fresh(),storageMessage='',storageBlocked=false;try{const raw=localStorage.getItem(KEY);if(raw)data=clean(JSON.parse(raw));}catch(_){storageBlocked=true;storageMessage='原存档无法读取，已停止覆盖；本次记录暂存在内存，请导出保存。';}
function write(){if(storageBlocked)return;try{localStorage.setItem(KEY,JSON.stringify(data));storageMessage='';}catch(_){storageMessage='本地保存失败，记录仍在内存；请导出保存。';}}
const identities=new WeakMap(),receipts=new WeakMap();
function record(run){const r=run.result;if(!r)return null;if(receipts.has(r))return receipts.get(r);let id=identities.get(run);if(!id){id=typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);identities.set(run,id);}
 const before=new Set(data.marks),mode=r.mode==='standard'?'standard':'endless',b=data.best[mode][r.item]||{time:0,kills:0};const bestTime=r.time>b.time,bestKills=r.kills>b.kills;data.best[mode][r.item]={time:Math.max(b.time,r.time),kills:Math.max(b.kills,r.kills)};
 if(r.reason==='破阵功成')data.marks.push('firstWin','win:'+r.item);for(const f of fruits)if(r.fruits?.[f])data.marks.push('fruit:'+f);data.marks=[...new Set(data.marks)];
 const old=data.records.find(x=>x.id===id);const summary={id,item:r.item,time:r.time,kills:r.kills,won:r.reason==='破阵功成'||!!old?.won,mode};if(old)Object.assign(old,summary);else data.records.push(summary);data.records=data.records.slice(-500);write();
 const receipt={marks:data.marks.filter(x=>!before.has(x)),bestTime,bestKills};receipts.set(r,receipt);return receipt;
}
function merge(raw){const other=clean(raw),map=new Map(data.records.map(r=>[r.id,r]));for(const r of other.records){const old=map.get(r.id);if(!old)map.set(r.id,r);else map.set(r.id,{...old,time:Math.max(old.time,r.time),kills:Math.max(old.kills,r.kills),won:old.won||r.won});}data.records=[...map.values()].slice(-500);data.marks=[...new Set([...data.marks,...other.marks])];for(const mode of ['standard','endless'])for(const item of items){const a=data.best[mode][item]||{time:0,kills:0},b=other.best[mode][item]||{time:0,kills:0};data.best[mode][item]={time:Math.max(a.time,b.time),kills:Math.max(a.kills,b.kills)};}write();}
function exportFile(){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='几笔长生-修行录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function nextGoal(){if(!data.marks.includes('firstWin'))return '下一目标 · 完成一次十二分钟破阵挑战';if(!data.marks.includes('fruit:mingyang'))return '下一目标 · 修成明阳果位';if(!data.marks.includes('fruit:lushui'))return '下一目标 · 修成渌水果位';for(const item of items)if(!data.marks.includes('win:'+item))return '下一目标 · 用'+({sword:'青尺剑',bow:'青乌弓',spear:'杜若枪'}[item])+'破阵';return '诸法已历 · 换一套神通，挑战自己的纪录';}
root.XJArchive={record,merge,exportFile,nextGoal,get data(){return data;},get message(){return storageMessage;}};
})(window);
