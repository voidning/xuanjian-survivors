/* Local synthesized weapon sounds. No assets, network, or combat RNG. */
(function(root){'use strict';
const snapshots=new WeakMap(),buffers=new WeakMap(),voices=new Set();let lastAt=-1;
function silence(){for(const v of voices){try{v.stop();}catch(_){}}voices.clear();}
function noise(ctx){if(buffers.has(ctx))return buffers.get(ctx);const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.22),ctx.sampleRate),data=b.getChannelData(0);let seed=9137;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}buffers.set(ctx,b);return b;}
function play(ctx,kind,strong){if(voices.size>=4||ctx.currentTime-lastAt<.075)return;lastAt=ctx.currentTime;const t=ctx.currentTime,duration=kind==='bow'?.14:kind==='spear'?.11:.13;
 const amp=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='bandpass';filter.Q.value=kind==='bow'?1.2:.7;filter.frequency.setValueAtTime(kind==='bow'?920:kind==='spear'?2000:1250,t);filter.frequency.exponentialRampToValueAtTime(kind==='bow'?600:kind==='spear'?500:350,t+duration);filter.connect(amp);amp.connect(ctx.destination);amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(strong?.11:.065,t+.006);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);
 let source;if(kind==='bow'){source=ctx.createOscillator();source.type='triangle';source.frequency.setValueAtTime(strong?370:460,t);source.frequency.exponentialRampToValueAtTime(strong?190:240,t+duration);}else{source=ctx.createBufferSource();source.buffer=noise(ctx);source.playbackRate.value=kind==='spear'?1.45:1;}
 source.connect(filter);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();amp.disconnect();};source.start(t);source.stop(t+duration+.01);
}
function update(run,ctx,muted){let old=snapshots.get(run)||{shots:0,uses:0};const shots=run.telemetry.autoShots,uses=run.telemetry.itemUses,changed=shots>old.shots||uses>old.uses,strong=uses>old.uses;snapshots.set(run,{shots,uses});if(!changed||muted||!ctx||ctx.state!=='running')return;play(ctx,run.item,strong);}
root.XJWeaponAudio={update,silence};
})(window);
