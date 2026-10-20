/* DreamLantern media111 — user-uploaded era/chapter video adapter. Presentation only. */
(() => {
  'use strict';
  const BASE='https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@main/';
  let manifestPromise;
  const full = p => /^https?:\/\//i.test(p||'') ? p : BASE + String(p||'').replace(/^\/+/, '');
  const manifest = () => manifestPromise ||= fetch(full('manifest/user-media-runtime.v1.json'),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`media111 ${r.status}`);return r.json();});
  const q=(root,sel)=>root?.matches?.(sel)?root:root?.querySelector?.(sel);
  function cleanup(root){root?.querySelectorAll?.('.dl-111-era-video,.dl-111-opening-video').forEach(n=>{try{n.pause();n.removeAttribute('src');n.load?.();}catch{} n.remove();});}
  async function mountEraGate(root){
    const doors=q(root,'.dl-doors'); if(!doors)return {ok:false,reason:'missing_doors'};
    try{
      const m=await manifest(); doors.classList.add('dl-111-era-stack');
      for(const door of doors.querySelectorAll('.dl-door')){
        const era=door.dataset.era; const spec=m.eraGate?.[era]; if(!spec)continue;
        door.classList.add('dl-111-era-card');
        door.querySelector('.dl-111-era-video')?.remove();
        const v=document.createElement('video'); v.className='dl-111-era-video'; v.src=full(spec.video); v.autoplay=true; v.loop=true; v.muted=true; v.playsInline=true; v.preload='metadata'; v.setAttribute('aria-hidden','true');
        door.prepend(v); v.play().catch(()=>{});
      }
      doors.dataset.dlEraMedia='1'; return {ok:true};
    }catch(e){console.error('[DreamLantern111] era gate failed',e);doors.dataset.dlEraMedia='error';return {ok:false,reason:String(e?.message||e)};}
  }
  async function mountOpeningVideo(root,chapterId){
    const opening=q(root,'.dl-opening'); if(!opening||!chapterId)return {ok:false,reason:'missing_opening_or_chapter'};
    opening.querySelector('.dl-111-opening-video')?.remove();
    try{
      const m=await manifest();
      if(m.mappingStatus!=='VERIFIED_MANGA_ORDER'){
        opening.dataset.dlVideoMounted='mapping-pending';
        return {ok:false,reason:'manga_order_mapping_not_verified'};
      }
      const spec=m.chapterVideos?.[chapterId]; if(!spec?.video||spec.verified!==true)return {ok:false,reason:'no_verified_video'};
      const v=document.createElement('video'); v.className='dl-111-opening-video'; v.src=full(spec.video); v.playsInline=true; v.loop=true; v.preload='metadata'; v.autoplay=true; v.muted=false; v.controls=false;
      opening.prepend(v); opening.dataset.dlVideoMounted='1';
      v.play().catch(()=>{v.controls=true; opening.dataset.dlVideoMounted='tap-to-play';});
      return {ok:true,chapterId};
    }catch(e){console.error('[DreamLantern111] opening video failed',e);opening.dataset.dlVideoMounted='error';return {ok:false,reason:String(e?.message||e)};}
  }
  function dispose(root){cleanup(root);const d=q(root,'.dl-doors');if(d){d.classList.remove('dl-111-era-stack');delete d.dataset.dlEraMedia;}const o=q(root,'.dl-opening');if(o)delete o.dataset.dlVideoMounted;}
  window.DreamLanternMedia111=Object.freeze({mountEraGate,mountOpeningVideo,dispose});
})();
