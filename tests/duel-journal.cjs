'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const archiveSource=fs.readFileSync('scripts/archive.js','utf8'),uiSource=fs.readFileSync('scripts/journal-ui.js','utf8');
const baseXJ={ITEMS:[{id:'sword',name:'剑'}],SKILLS:[],GIFTS:[],TRAINING:[],Rules:{costs:{}},Cultivation:{routes:[]}};
function load(duel,stored=null,duels){let saved='';const XJ={...baseXJ,...(duel===undefined?{}:{Duel:duel}),...(duels===undefined?{}:{Duels:duels})},w={XJ,localStorage:{getItem:()=>stored===null?null:JSON.stringify(stored),setItem:(_k,v)=>saved=v},crypto:{randomUUID:()=> 'test-id'},Date,Math,setTimeout,URL:{createObjectURL:()=>'',revokeObjectURL(){}},Blob:function(){},document:{createElement:()=>({click(){}})}};w.window=w;vm.runInNewContext(archiveSource,w);return {w,get saved(){return saved&&JSON.parse(saved)}};}
const duel={id:'visitor',name:'客<影>',story:'来历 & 未明',chapter:'卷一「旧事」',guide:'避开 "锋芒"'},yumu={id:'yumuxian',name:'郁慕<仙>',story:'金 & 白',chapter:'筑基章',guide:'先破盾',boundary:'仅作玩法改编'},yehui={id:'yehui',name:'邺桧',story:'白山紫水',chapter:'紫府章',guide:'避山与水',boundary:'仅取两法'};
const record=(id='r',time=20,duelHistory)=>({id,item:'sword',time,kills:1,mode:'standard',duelHistory});
{
 const old=record('old',1);const {w}=load(duel,{schema:1,records:[old],marks:[],best:{}});
 assert.equal(w.XJArchive.data.records.length,1);assert.equal('duelHistory' in w.XJArchive.data.records[0],false,'old saves remain valid without the new field');
}
{
 const mixed=[{id:'visitor',at:-5,defeatedAt:null,phase:1},{id:'wrong',at:2,defeatedAt:3,phase:1},{id:'visitor',at:Infinity,defeatedAt:Infinity,phase:2},{id:'visitor',at:4,defeatedAt:0,phase:2},{id:'visitor',at:5,defeatedAt:null,phase:3},...Array.from({length:13},(_,i)=>({id:'visitor',at:10+i,defeatedAt:null,phase:1}))];
 const {w}=load(duel,{schema:1,records:[record('mixed',30,mixed)],marks:[],best:{}}),saved=w.XJArchive.data.records[0].duelHistory;
 assert.equal(saved.length,12);assert(saved.every(e=>e.id==='visitor'&&(e.phase===1||e.phase===2)));assert.deepEqual(Array.from(saved,e=>e.at),Array.from({length:12},(_,i)=>11+i));
 const zero=load(duel,{schema:1,records:[record('zero',30,[{id:'visitor',at:NaN,defeatedAt:0,phase:2},{id:'visitor',at:1,defeatedAt:null,phase:1},{id:'visitor',at:2,phase:1},{id:'visitor',at:3,defeatedAt:'4',phase:1},{id:'visitor',at:4,defeatedAt:NaN,phase:1},{id:'visitor',at:5,defeatedAt:-1,phase:1},{id:'visitor',at:6,defeatedAt:5,phase:1}])],marks:[],best:{}}).w.XJArchive.data.records[0].duelHistory;
 assert.equal(zero[0].at,0);assert.equal(zero[0].defeatedAt,0);assert.equal(zero[1].defeatedAt,null);assert(zero.slice(2).every(e=>e.defeatedAt===null),'undefined, strings, NaN, negatives and times before encounter are not defeats');
}
{
 const initial={schema:1,records:[record('same',10,[{id:'visitor',at:3,defeatedAt:null,phase:1}]),record('legacy',5)],marks:[],best:{}};
 const loaded=load(duel,initial),w=loaded.w;w.XJArchive.merge({schema:1,records:[record('same',20,[{id:'visitor',at:3,defeatedAt:8,phase:1},{id:'visitor',at:9,defeatedAt:null,phase:2}]),record('new',7)],marks:[],best:{}});
 assert.equal(w.XJArchive.data.records.length,3);const merged=w.XJArchive.data.records.find(r=>r.id==='same');assert.deepEqual(Array.from(merged.duelHistory,e=>[e.at,e.defeatedAt,e.phase]),[[3,8,1],[9,null,2]]);
 const run={result:{item:'sword',time:25,kills:2,mode:'standard',reason:'主动结束',duelHistory:[{id:'visitor',at:12,defeatedAt:20,phase:2}]}};w.XJArchive.record(run);assert.deepEqual(Array.from(w.XJArchive.data.records.at(-1).duelHistory,e=>[e.at,e.defeatedAt,e.phase]),[[12,20,2]]);
 assert.deepEqual(loaded.saved.records.find(r=>r.id==='same').duelHistory,JSON.parse(JSON.stringify(merged.duelHistory)),'serialized archive retains merged duel history');
 assert(!('power' in w.XJArchive.data));assert(!w.XJArchive.markIds.some(id=>id.includes('duel')));
}
{
 const {w}=load(duel,{schema:1,records:[record('phase-update',10,[{id:'visitor',at:3,defeatedAt:null,phase:1}])],marks:[],best:{}});w.XJArchive.merge({schema:1,records:[record('phase-update',20,[{id:'visitor',at:3,defeatedAt:9,phase:2}])],marks:[],best:{}});assert.deepEqual(Array.from(w.XJArchive.data.records[0].duelHistory,e=>[e.at,e.defeatedAt,e.phase]),[[3,9,2]],'later snapshot upgrades the same encounter instead of duplicating it');
}
{
 const local=Array.from({length:11},(_,i)=>({id:'visitor',at:i,defeatedAt:null,phase:1})),duplicates=Array.from({length:12},()=>({id:'visitor',at:10,defeatedAt:30,phase:1}));const {w}=load(duel,{schema:1,records:[record('dedupe',10,local)],marks:[],best:{}});w.XJArchive.merge({schema:1,records:[record('dedupe',20,duplicates)],marks:[],best:{}});const entries=w.XJArchive.data.records[0].duelHistory;assert.equal(entries.length,11);assert.deepEqual(Array.from(entries,e=>e.at),Array.from({length:11},(_,i)=>i));assert.equal(entries.at(-1).defeatedAt,30);
}
{
 const {w}=load(undefined,{schema:1,records:[record('no-meta',5,[{id:'visitor',at:1,defeatedAt:2,phase:1}])],marks:[],best:{}});assert.equal(w.XJArchive.data.records.length,1);assert.equal(w.XJArchive.data.records[0].duelHistory.length,0);
}
{
 const mixed=[{id:'yehui',at:6,defeatedAt:12,phase:2},{id:'yumuxian',at:1,defeatedAt:null,phase:1},{id:'unknown',at:2,defeatedAt:3,phase:1},{id:'yehui',at:1,defeatedAt:null,phase:1},{id:'yumuxian',at:6,defeatedAt:9,phase:2}];
 const loaded=load(yehui,{schema:1,records:[record('multi',20,mixed)],marks:[],best:{}},[yumu,yehui]),w=loaded.w,history=w.XJArchive.data.records[0].duelHistory;
 assert.deepEqual(Array.from(history,e=>e.id),['yehui','yumuxian','yehui','yumuxian'],'known bosses retain independent records while unknown IDs are discarded');
 w.XJArchive.merge({schema:1,records:[record('multi',30,[{id:'yumuxian',at:1,defeatedAt:8,phase:2}])],marks:[],best:{}});const merged=w.XJArchive.data.records[0].duelHistory;
 assert(merged.some(e=>e.id==='yehui'&&e.at===6&&e.defeatedAt===12),'old Yehui history survives a later mixed import');assert(merged.some(e=>e.id==='yumuxian'&&e.at===1&&e.phase===2&&e.defeatedAt===8));
 w.XJPlayUI={record:()=>''};w.document={};vm.runInNewContext(uiSource,w);const overview=w.XJJournalUI.overview();
 for(const text of ['郁慕&lt;仙&gt;','金 &amp; 白','筑基章','先破盾','仅作玩法改编','邺桧','白山紫水','紫府章','避山与水','仅取两法'])assert(overview.includes(text),`mixed journal includes ${text}`);
 assert(overview.includes('斗法见闻 · 郁慕&lt;仙&gt;')&&overview.includes('斗法见闻 · 邺桧'),'recent record groups each boss under its own name');assert(!overview.includes('unknown'));
}
{
 const {w}=load(duel);w.XJArchive.merge({schema:1,records:[record('ui',40,[{id:'visitor',at:0,defeatedAt:0,phase:2},{id:'visitor',at:8,defeatedAt:null,phase:1}])],marks:[],best:{}});w.XJPlayUI={record:()=>''};w.document={};vm.runInNewContext(uiSource,w);
 const overview=w.XJJournalUI.overview();assert(overview.includes('斗法见闻'));assert(overview.includes('第二阶段'));assert(overview.includes('游戏改编遭遇，并非原著事件'));assert(overview.includes('身份：<b>客&lt;影&gt;</b>'));assert(overview.includes('来历 &amp; 未明'));assert(overview.includes('斗法见闻 · 客&lt;影&gt;'),'recent history includes encounter details');assert(overview.includes('00:00 击退'));assert(overview.includes('未击退'));assert(!overview.includes('客<影>'));assert(!overview.includes('来历 & 未明'));
 const run={result:{item:'sword',time:40,kills:1,mode:'standard',reason:'主动结束',skills:{},duelHistory:[{id:'visitor',at:0,defeatedAt:0,phase:2},{id:'visitor',at:8,defeatedAt:null,phase:1},{id:'visitor',at:9,phase:1},{id:'visitor',at:10,defeatedAt:'11',phase:1},{id:'visitor',at:12,defeatedAt:NaN,phase:1},{id:'visitor',at:14,defeatedAt:13,phase:1}]}};const debrief=w.XJJournalUI.debrief(run);assert(debrief.includes('00:00 击退'));assert(debrief.includes('未击退'));assert(debrief.includes('第二阶段'));for(const at of ['00:09','00:10','00:12','00:14'])assert(debrief.includes(at+' 遇见 · 未击退'));
}
{
 const {w}=load(duel);w.XJPlayUI={record:()=>''};w.document={};vm.runInNewContext(uiSource,w);const overview=w.XJJournalUI.overview();assert(overview.includes('身份未知'));assert(!overview.includes(duel.story));
}
console.log('duel journal archive, merge, UI and no-power contract: passed');
