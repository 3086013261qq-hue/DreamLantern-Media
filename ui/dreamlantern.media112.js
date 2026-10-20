/* 118 visible entrance, preserving 117 isolated entrance/era media channels; incremental presentation repair of 112 adapter. Owns media/FX only; receives no MVU or worldbook API. */
function createDreamLanternMedia112(W, manifest, dynamic, profiles) {
  'use strict';
  const D=W.document, BASE='https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@main/';
  const url=p=>/^https:\/\//.test(p||'')?p:BASE+String(p||'').replace(/^\/+/, '');
  let active=null, gates=[], globalLayer=null, generation=0, dead=false;
  let introVideo=null, introHost=null, introSound=null, introAttempt=0, armed=null;
  const eraPreview={video:null,door:null,sound:null,attempt:0};
  const node=(tag,cls)=>{const n=D.createElement(tag);n.className=cls;return n;};
  function release(v){try{v.muted=true;v.pause();v.removeAttribute('src');v.load();}catch{}v.remove();}
  function cover(id){return manifest.chapterVideos?.[id]?.cover||manifest.covers?.chapters?.[id]?.path||'ui/brand-background.webp';}
  function fx(host,profileName='global',budget=7){
    const layer=node('div','dl-112-fx');layer.setAttribute('aria-hidden','true');layer.dataset.profile=profileName;
    const p=profiles.profiles?.[profileName]||{redLines:2,petals:1,foxfire:1,dust:2};
    const kinds=[['thread',p.redLines],['petal',p.petals],['fox',p.foxfire],['mote',p.dust]];
    let i=0;for(const [kind,n] of kinds)for(let j=0;j<(n||0)&&i<(profileName==='global'?budget:budget-1);j++,i++){
      const e=node('i','dl-112-'+kind);e.style.setProperty('--x',`${12+(i*19)%78}%`);e.style.setProperty('--y',`${18+(i*17)%67}%`);e.style.setProperty('--delay',`${-i*2.7}s`);layer.append(e);
    }
    if(profileName!=='global'&&i<budget){const e=node('i','dl-112-extra');e.dataset.extra=(p.extra||[]).join(' ');layer.append(e);}
    host.append(layer);return layer;
  }
  function mountGlobal(root){globalLayer?.remove();globalLayer=fx(root.querySelector('.dl-paper')||root,'global',6);}
  function soundLabel(){if(!introSound||!introVideo)return;introSound.textContent=introVideo.muted?'🔇 开启声音':'🔊 关闭声音';introSound.setAttribute('aria-pressed',String(!introVideo.muted));}
  function stopIntro(){introAttempt++;if(introVideo)release(introVideo);introSound?.remove();introVideo=null;introSound=null;introHost=null;}
  function playIntro(sound=false){
    const v=introVideo,host=introHost,attempt=++introAttempt;if(!v)return;
    v.muted=!sound;soundLabel();
    v.play().then(()=>{if(v===introVideo&&attempt===introAttempt)soundLabel();}).catch(()=>{
      if(v!==introVideo||attempt!==introAttempt)return;
      v.muted=true;soundLabel();v.play().catch(()=>{if(v===introVideo)host.dataset.introVideo='fallback';});
    });
  }
  function mountIntro(host,sound=false){
    if(!host?.classList.contains('dl-intro')||D.querySelector('.dl-shade:not([hidden])'))return;
    stopEra();
    if(introHost===host&&introVideo?.isConnected)return;
    stopIntro();introHost=host;host.hidden=false;host.dataset.introVideo='loading';
    const v=node('video','dl-115-intro-video');introVideo=v;
    v.loop=true;v.muted=true;v.defaultMuted=true;v.playsInline=true;
    v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('aria-hidden','true');
    v.preload='auto';v.poster=url('ui/brand-background.webp');
    v.addEventListener('playing',()=>{if(v===introVideo)host.dataset.introVideo='playing';});
    v.addEventListener('error',()=>{if(v===introVideo){host.dataset.introVideo='fallback';stopIntro();}},{once:true});
    v.src=url(manifest.intro.video);host.prepend(v);
    introSound=node('button','dl-116-intro-sound');introSound.type='button';
    introSound.addEventListener('click',e=>{e.stopPropagation();if(!introVideo)return;if(introVideo.muted)playIntro(true);else{introAttempt++;introVideo.muted=true;soundLabel();}});host.append(introSound);
    playIntro(sound);
  }
  function showIntro(visible,sound=false){
    if(visible&&!D.hidden){if(!introVideo){const host=D.querySelector('.dl-intro');if(host)mountIntro(host,sound);}else playIntro(sound);}
    else stopIntro();
  }
  function clear(){
    generation++;armed=null;stopIntro();stopEra();if(active){const a=active;active=null;a.stop();}
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
      door.querySelectorAll('.dl-112-era-video,.dl-112-era-cover').forEach(n=>n.remove());delete door.dataset.video;delete door.dataset.armed;
      const img=node('img','dl-112-era-cover');img.alt='';img.src=url(spec.cover||cover(era==='ancient'?'A04':'M04'));
      img.onerror=()=>{img.onerror=null;img.src=url('ui/brand-background.webp');};door.prepend(img);
      door.querySelector('b').textContent=era==='ancient'?'前尘':'今世';
      const sub=door.querySelector('span');if(sub)sub.textContent='轻触预览 · 再触入'+(era==='ancient'?'前尘':'今世');
    }
  }
  function eraSoundLabel(){
    const {video:v,sound:b}=eraPreview;if(!v||!b)return;
    b.textContent=v.muted?'🔇 开启声音':'🔊 关闭声音';
    b.setAttribute('aria-pressed',String(!v.muted));
  }
  function stopEra(){
    eraPreview.attempt++;
    if(eraPreview.video)release(eraPreview.video);
    eraPreview.sound?.remove();
    if(eraPreview.door){delete eraPreview.door.dataset.armed;delete eraPreview.door.dataset.video;}
    eraPreview.video=null;eraPreview.door=null;eraPreview.sound=null;armed=null;gates=[];
  }
  function playEra(sound=true){
    const v=eraPreview.video,door=eraPreview.door,attempt=++eraPreview.attempt;if(!v)return;
    v.muted=!sound;eraSoundLabel();
    v.play().then(()=>{if(v===eraPreview.video&&attempt===eraPreview.attempt)eraSoundLabel();}).catch(()=>{
      if(v!==eraPreview.video||attempt!==eraPreview.attempt)return;
      v.muted=true;eraSoundLabel();
      v.play().catch(()=>{if(v===eraPreview.video&&attempt===eraPreview.attempt)door.dataset.video='fallback';});
    });
  }
  function previewEra(door,locked=false){
    const era=door.dataset.era,spec=manifest.eraGate?.[era];
    if(!['ancient','modern'].includes(era)||!spec?.video||spec.video===manifest.intro.video)return false;
    if(armed===door){if(locked){door.querySelector('span').textContent='今世已定 · 前尘仅供回看';return false;}return true;}
    clear();armed=door;eraPreview.door=door;door.dataset.armed='true';
    const v=node('video','dl-112-era-video');eraPreview.video=v;
    v.muted=false;v.defaultMuted=false;v.loop=true;v.playsInline=true;v.preload='auto';v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('aria-hidden','true');
    v.poster=door.querySelector('img').src;v.src=url(spec.video);door.prepend(v);gates=[v];
    const token=generation;
    v.addEventListener('playing',()=>{if(v===eraPreview.video&&token===generation){door.dataset.video='playing';eraSoundLabel();}});
    v.addEventListener('error',()=>{if(v===eraPreview.video&&token===generation){stopEra();armed=door;door.dataset.armed='true';door.dataset.video='fallback';}},{once:true});
    // A sibling button avoids invalid nested interactive elements inside the era card.
    const sound=node('button','dl-117-era-sound');eraPreview.sound=sound;sound.type='button';
    sound.addEventListener('click',e=>{e.stopPropagation();if(v!==eraPreview.video)return;if(v.muted)playEra(true);else{eraPreview.attempt++;v.muted=true;eraSoundLabel();}});
    door.after(sound);playEra(true);
    for(const other of door.parentElement.querySelectorAll('.dl-door')){
      if(other!==door){delete other.dataset.armed;delete other.dataset.video;other.querySelector('span').textContent='轻触预览 · 再触入'+(other.dataset.era==='ancient'?'前尘':'今世');}
    }
    door.querySelector('span').textContent=locked?'今世已定 · 前尘仅供回看':'再触一次 · 入'+(era==='ancient'?'前尘':'今世');
    return false;
  }
  function mountOpening(root,host,id,svgFallback,lowMotion=false,memoryId=null){
    clear();showIntro(false);const token=generation;delete host.dataset.dlVideoMounted;
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
    const play=node('button','dl-112-sound');play.type='button';play.textContent='开启声音';play.hidden=true;play.setAttribute('aria-label','开启Opening声音');host.append(play);nodes.push(play);
    let failed=false;
    function fallback(){if(token!==generation||failed)return;failed=true;W.clearTimeout(timer);host.dataset.dlVideoMounted='fallback';if(label)label.textContent='灯影暂歇 · 静态缘景仍可入梦';release(v);play.hidden=true;restore();restore=()=>{};}
    async function sound(){if(failed||token!==generation)return;v.muted=false;if(!timer)timer=W.setTimeout(fallback,12000);try{await v.play();if(token!==generation)return;play.hidden=true;}catch{if(token!==generation)return;v.muted=true;v.play().catch(()=>{});play.hidden=false;}}
    play.addEventListener('click',e=>{e.stopPropagation();void sound();});
    v.addEventListener('error',fallback,{once:true});
    v.addEventListener('playing',()=>{if(token!==generation)return;W.clearTimeout(timer);host.dataset.dlVideoMounted='playing';if(label)label.textContent=v.muted?'灯影已亮 · 可开启声音':'原声 Opening · 一曲前世今生';});
    timer=W.setTimeout(fallback,12000);
    // Called synchronously from the cover click -> render -> mountMedia chain.
    // Sound rejection must never become a second-click prerequisite for video.
    v.muted=false;v.play().then(()=>{if(token===generation)play.hidden=true;}).catch(()=>{
      if(token!==generation||failed)return;v.muted=true;play.hidden=false;
      v.play().catch(()=>{if(token===generation)fallback();});
    });
  }
  function visibility(hidden){
    if(hidden){introVideo?.pause();for(const v of gates)v.pause();D.querySelectorAll('.dl-112-opening-video').forEach(v=>v.pause());}
    else{
      if(introVideo)playIntro(!introVideo.muted);
      if(eraPreview.video)playEra(!eraPreview.video.muted);
      for(const v of D.querySelectorAll('.dl-112-opening-video'))v.play().catch(()=>{v.muted=true;v.play().catch(()=>{});});
    }
  }
  function dispose(){if(dead)return;dead=true;clear();globalLayer?.remove();}
  return Object.freeze({mountIntro,showIntro,mountEraGate,previewEra,mountOpening,mountGlobal,clear,dispose,visibility,cover,url});
}
