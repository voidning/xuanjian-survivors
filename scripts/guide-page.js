'use strict';
const article=document.getElementById('article'),toc=document.getElementById('toc');
article.innerHTML=window.XJGuideHTML||'<h1>说明暂未载入</h1><p>请重新打开本页，或查看 docs/原作设定与游戏表现对照.md。</p>';
const headings=[...article.querySelectorAll('h2,h3')];
for(const [i,heading] of headings.entries()){
 heading.id='section-'+i;
 const link=document.createElement('a');
 link.href='#'+heading.id;link.textContent=heading.textContent;
 link.className=heading.tagName==='H3'?'subheading':'heading';toc.append(link);
}
document.getElementById('print').addEventListener('click',()=>window.print());
if(matchMedia('(max-width: 850px)').matches)document.getElementById('contents').open=false;
