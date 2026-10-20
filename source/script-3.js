// Retained Warhammer BanG owner-document and official handoff implementation,
// adapted only for DreamLantern's independent display module and numeric catalogue.
(function(){
 const W=window.parent;W.__DreamLanternMusic={attach(root,catalogue){
  const doc=root.ownerDocument;let recommendation=catalogue[0]||null, appAttempt=null,disposed=false;
  const pendingTimeouts=new Set();
  root.innerHTML='<p class="dl-kicker">缘音 · 一曲寄相思</p><div class="dl-song-title"></div><p class="dl-muted">请点选曲目，再在播放器中手动播放。</p><div class="dl-controls" data-catalogue></div><div data-player></div><div class="dl-controls"><a class="dl-link" data-official-link target="_blank" rel="noopener">打开网易云App</a><a class="dl-link" data-https target="_blank" rel="noopener">仅打开官网</a></div><details><summary>播放自己的曲目或歌单</summary><label>网易云官方链接或纯数字ID</label><input inputmode="url" placeholder="粘贴 music.163.com 官方链接"><div class="dl-controls"><button data-music-action="song">载入歌曲</button><button data-music-action="playlist">打开歌单</button></div></details><p class="dl-muted" data-music-status>音乐独立运行；会员与登录请在网易云官方页面或App完成。</p>';
  function message(t){root.querySelector('[data-music-status]').textContent=t;}
  function url(m) {
    if(/^\d+$/.test(m?.track_id || '')) return 'https://music.163.com/#/song?id='+m.track_id;
    if(/^\d+$/.test(m?.playlist_id || '')) return 'https://music.163.com/#/playlist?id='+m.playlist_id;
    try {const u=new URL(m?.source_url); return u.protocol==='https:' && u.hostname==='music.163.com' ? u.href : ''; }catch{return '';}
  }
  function outchain(m) {return /^\d+$/.test(m?.track_id||'')?'https://music.163.com/outchain/player?type=2&id='+m.track_id+'&auto=0&height=66':'';}
  function finishAppAttempt(announce=false) {
    const job=appAttempt;if(!job)return;appAttempt=null;
    clearTimeout(job.timer);pendingTimeouts.delete(job.timer);
    try {if(!job.popup.closed)job.popup.location.replace(job.https);
      if(announce&&!disposed&&root.isConnected)message('已保留官方歌曲页 · App是否打开请以手机实际结果为准');
    }catch{if(announce&&!disposed&&root.isConnected)message('自动回退受限 · 请点“仅打开官网”');}
  }
  function onOfficialClick(event) {
    const link=event.target.closest('[data-official-link]');
    if(!link||!root.contains(link))return false;
    if(!event.isTrusted||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return false;
    const m=recommendation,https=url(m);
    const scheme=/^\d+$/.test(m?.track_id||'')?'orpheus://song/'+m.track_id:/^\d+$/.test(m?.playlist_id||'')?'orpheus://playlist/'+m.playlist_id:'';
    if(!scheme||!https||link.href!==https)return false;
    finishAppAttempt();let popup;
    try{popup=doc.defaultView.open('','_blank');}catch{}
    if(!popup){message('App窗口受限 · 继续打开官方HTTPS页');return false;}
    event.preventDefault();try{popup.opener=null;}catch{}
    try{popup.location.replace(scheme);}catch{
      try{popup.location.replace(https);}catch{}
      message('App跳转受限 · 官网链接仍可使用');return true;
    }
    const job={popup,https,timer:null};appAttempt=job;
    job.timer=setTimeout(()=>{if(appAttempt===job)finishAppAttempt(true);},1500);pendingTimeouts.add(job.timer);
    message('正在尝试网易云App · 此窗口随后保留官网回退；也可点“仅打开官网”');return true;
  }
  function select(m,play=false){
   recommendation=m;root.querySelector('.dl-song-title').textContent=m?.title||'待选择曲目';
   const https=url(m);for(const a of root.querySelectorAll('[data-official-link],[data-https]')){a.href=https||'https://music.163.com/';a.hidden=!https;}
   const holder=root.querySelector('[data-player]');holder.replaceChildren();
   if(play&&outchain(m)){
    const iframe=doc.createElement('iframe');iframe.title='网易云音乐 · '+m.title;iframe.src=outchain(m);iframe.setAttribute('allow','encrypted-media');
    iframe.addEventListener('error',()=>message('播放器暂不可用，可打开网易云App或官网。'));holder.append(iframe);
   }
  }
  const cat=root.querySelector('[data-catalogue]');
  catalogue.forEach((m,i)=>{const b=doc.createElement('button');b.textContent=m.title;b.dataset.trackIndex=i;cat.append(b);});
  function click(e){
   if(e.target.closest('[data-official-link]')){onOfficialClick(e);return;}
   const track=e.target.closest('[data-track-index]');if(track){select(catalogue[Number(track.dataset.trackIndex)],true);return;}
   const action=e.target.closest('[data-music-action]');if(!action)return;
   const text=root.querySelector('input').value.trim();let id='';
   if(/^\d+$/.test(text))id=text;else try{const u=new URL(text);if(u.protocol==='https:'&&/^(music|y\.music)\.163\.com$/.test(u.hostname))id=(u.href.match(/[?&]id=(\d+)/)||u.href.match(/\/(?:song|playlist)\/(\d+)/)||[])[1]||'';}catch{}
   if(!id){message('请输入网易云官方歌曲/歌单链接，或纯数字ID。');return;}
   select(action.dataset.musicAction==='song'?{title:'我的歌曲',track_id:id}:{title:'我的歌单',playlist_id:id},action.dataset.musicAction==='song');
   message(action.dataset.musicAction==='playlist'?'歌单已就绪，点App或官网打开。':'歌曲已载入，请手动播放。');
  }
  root.addEventListener('click',click);select(recommendation);
  return {dispose(){disposed=true;root.removeEventListener('click',click);finishAppAttempt();pendingTimeouts.forEach(clearTimeout);root.querySelector('[data-player]').replaceChildren();}};
 }};W.dispatchEvent(new W.Event('dreamlantern-music-ready'));
})();
