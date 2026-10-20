/* 112 presentation adapter. Owns media/FX only; receives no MVU or worldbook API. */
function createDreamLanternMedia112(W, manifest, dynamic, profiles) {
  'use strict';
  const D=W.document, BASE='https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@main/';
  const url=p=>/^https:\/\//.test(p||'')?p:BASE+String(p||'').replace(/^\/+/, '');
  let active=null, gates=[], globalLayer=null, generation=0, dead=false;
  const motion=()=>W.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const node=(tag,cls)=>{const n=D.createElement(tag);n.className=cls;return n;};
  function release(v){try{v.pause();v.removeAttribute('src');v.load();}catch{}v.remove();}
  function cover(id){return manifest.chapterVideos?.[id]?.cover||manifest.covers?.chapters?.[id]?.path||'ui/brand-background.webp';}
  function fx(host,profileName='global',budget=7){
    const layer=node('div','dl-112-fx');layer.setAttribute('aria-hidden','true');layer.dataset.profile=profileName;
    const p=profiles.profiles?.[profileName]||{redLines:2,foxfire:1,dust:3};
    const kinds=[['thread',p.redLines],['petal',p.petals],['fox',p.foxfire],['mote',p.dust]];
    let i=0;for(const [kind,n] of kinds)for(let j=0;j<(n||0)&&i<(profileName==='global'?budget:budget-1);j++,i++){
      const e=node('i','dl-112-'+kind);e.style.setProperty('--x',`${12+(i*19)%78}%`);e.style.setProperty('--y',`${18+(i*17)%67}%`);e.style.setProperty('--delay',`${-i*2.7}s`);layer.append(e);
    }
    if(profileName!=='global'&&i<budget){const e=node('i','dl-112-extra');e.dataset.extra=(p.extra||[]).join(' ');layer.append(e);}
    host.append(layer);return layer;
  }
  function mountGlobal(root){globalLayer?.remove();globalLayer=fx(root.querySelector('.dl-paper')||root,'global',6);}
  function clear(){
    generation++;if(active){const a=active;active=null;a.stop();}
    for(const v of gates)release(v);gates=[];
  }
  function suspendMusic(root){
    // The cross-origin player has no pause API: unload its document, then restore auto=0.
    const frames=[...root.querySelectorAll('.dl-music iframe')].map(f=>({f,src:f.getAttribute('src')}));
    for(const {f} of frames)f.src='about:blank';
    return ()=>{for(const {f,src} of frames)if(f.isConnected&&src)f.src=src;};
  }
  function mountEraGate(root,lowMotion=false){
    clear();const doors=root.querySelector('.dl-doors');if(!doors)return;
    doors.classList.add('dl-112-era-stack');
    for(const door of doors.querySelectorAll('.dl-door')){
      const era=door.dataset.era,spec=manifest.eraGate[era];if(!spec)continue;
      const img=node('img','dl-112-era-cover');img.alt='';img.src=url(spec.cover||cover(era==='ancient'?'A04':'M04'));
      img.onerror=()=>{img.onerror=null;img.src=url('ui/brand-background.webp');};door.prepend(img);
      const v=node('video','dl-112-era-video');v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=!lowMotion&&!motion();v.playsInline=true;v.preload='metadata';v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('aria-hidden','true');
      v.poster=img.src;v.src=url(spec.video);door.prepend(v);gates.push(v);
      v.addEventListener('playing',()=>door.dataset.video='playing');
      v.addEventListener('error',()=>{door.dataset.video='fallback';release(v);},{once:true});
      if(v.autoplay)v.play().catch(()=>{door.dataset.video='fallback';});
      door.querySelector('b').textContent=era==='ancient'?'前尘':'今世';
      const sub=door.querySelector('span');if(sub)sub.textContent=era==='ancient'?'古代八卷 · 一念落在苦情树下':'现代十三卷 · 红线再续人间';
    }
  }
  function mountOpening(root,host,id,svgFallback,lowMotion=false,memoryId=null){
    clear();const token=generation;
    const spec=memoryId?manifest.historyVideos?.[memoryId]:manifest.chapterVideos?.[id],profile=dynamic.chapters?.[id]?.fxProfile||'blossom_redthread';
    const img=node('img','dl-112-opening-cover');img.alt='';img.src=url(spec?.cover||cover(id));
    let imageStage=0;img.onerror=()=>{if(imageStage++===0)img.src=url('ui/brand-background.webp');else if(imageStage===2)img.src=svgFallback;else img.remove();};host.prepend(img);
    const layer=fx(host,profile,8);host.dataset.profile=profile;
    const label=host.querySelector('[data-media-label]');if(label)label.textContent='灯影轻动 · 此卷可随时入梦';
    const nodes=[img,layer];let v=null,timer=null,restore=()=>{};
    const stop=()=>{W.clearTimeout(timer);if(v)release(v);for(const n of nodes)n.remove();restore();};
    active={stop};
    if(!spec?.video||!spec.verified){host.dataset.dlVideoMounted='cover-fx';return;}
    restore=suspendMusic(root);
    v=node('video','dl-112-opening-video');v.playsInline=true;v.loop=true;v.preload='metadata';v.poster=img.src;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.src=url(spec.video);host.prepend(v);
    const play=node('button','dl-112-sound');play.type='button';play.textContent='点亮梦灯 · 开启原声';play.setAttribute('aria-label','播放本卷Opening并开启原声');host.append(play);nodes.push(play);
    let failed=false;
    function fallback(){if(token!==generation||failed)return;failed=true;W.clearTimeout(timer);host.dataset.dlVideoMounted='fallback';if(label)label.textContent='灯影暂歇 · 静态缘景仍可入梦';release(v);play.hidden=true;restore();restore=()=>{};}
    async function sound(){if(failed||token!==generation)return;v.muted=false;if(!timer)timer=W.setTimeout(fallback,12000);try{await v.play();if(token!==generation)return;play.hidden=true;}catch{if(token!==generation)return;v.muted=true;v.play().catch(()=>{});play.hidden=false;}}
    play.addEventListener('click',e=>{e.stopPropagation();void sound();});
    v.addEventListener('error',fallback,{once:true});
    v.addEventListener('playing',()=>{if(token!==generation)return;W.clearTimeout(timer);host.dataset.dlVideoMounted='playing';if(label)label.textContent=v.muted?'灯影已亮 · 点击开启原声':'原声 Opening · 一曲前世今生';});
    timer=W.setTimeout(fallback,12000);
    if(lowMotion||motion()){W.clearTimeout(timer);timer=null;host.dataset.dlVideoMounted='tap-to-play';return;}
    v.muted=false;v.play().then(()=>{if(token===generation)play.hidden=true;}).catch(()=>{
      if(token!==generation||failed)return;v.muted=true;play.hidden=false;v.play().catch(()=>{host.dataset.dlVideoMounted='tap-to-play';});
    });
  }
  function visibility(hidden){for(const v of [...gates,...(active?[...D.querySelectorAll('.dl-112-opening-video')]:[])]){if(hidden)v.pause();else if(v.muted&&!motion())v.play().catch(()=>{});}}
  function dispose(){if(dead)return;dead=true;clear();globalLayer?.remove();}
  return Object.freeze({mountEraGate,mountOpening,mountGlobal,clear,dispose,visibility,cover,url});
}
