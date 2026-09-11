/* Compact battle HUD follows the viewport, including landscape phones. */
(function(){
'use strict';
const query=matchMedia('(max-width: 680px), (pointer: coarse)');
window.XJMobile=query;
function update(){
 document.body.classList.toggle('mobile-battle',query.matches);
 const pause=document.getElementById('pause');
 pause.textContent=query.matches?'详情 · 暂停':'暂停 P';
 pause.setAttribute('aria-label','暂停战斗并查看详情与设置');
}
query.addEventListener('change',update);update();
})();
