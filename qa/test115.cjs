const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const DEPS=process.env.DREAMLANTERN_BROWSER_DEPS||'/tmp/dreamlantern-browser/node_modules';
const ROOT=path.resolve('.'),report={environment:'Chromium mobile viewport + mocked SillyTavern helper APIs; NOT Android device',tests:[],errors:[],route:'CDN URLs fulfilled from exact repository bytes for deterministic UI QA'};
const check=(name,ok,details)=>{console.log(name,ok);report.tests.push({name,ok,details});if(!ok)throw Error(name+': '+JSON.stringify(details));};
(async()=>{
 const sp=await import(path.join(DEPS,'@sparticuz/chromium/build/index.js'));const C=sp.default;
 const browser=await chromium.launch({executablePath:await C.executablePath(),args:C.args.filter(x=>!['--single-process','--disable-web-security','--disable-site-isolation-trials'].includes(x)),headless:true});
 async function setup(width=390,fail=false,reduced=false,denySound=false){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,hasTouch:true,isMobile:true,reducedMotion:reduced?'reduce':'no-preference'});
  await context.route('https://cdn.jsdelivr.net/**',async route=>{
   const u=route.request().url(),marker='DreamLantern-Media@main/';if(!u.includes(marker))return route.abort();
   if(fail)return route.abort();const rel=decodeURIComponent(u.split(marker)[1].split('?')[0]);const f=path.resolve(ROOT,rel);if(!f.startsWith(ROOT)||!fs.existsSync(f))return route.fulfill({status:404,body:'not found'});
   await route.fulfill({path:f,headers:{'access-control-allow-origin':'*'}});
  });
  await context.route('https://www.garden-culture.net/**',r=>r.abort());
  await context.route('https://music.163.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>网易云占位：auto=0，真实播放另行实机核验</p>'}));
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
  await context.addInitScript(({denySound})=>{
    localStorage.setItem('hxy_dreamlantern_preferences',JSON.stringify({fxEnabled:false,lowMotion:true}));
    const play=HTMLMediaElement.prototype.play;window.__plays=[];
    HTMLMediaElement.prototype.play=function(){window.__plays.push({cls:this.className,muted:this.muted,active:navigator.userActivation.isActive});if(denySound&&!this.muted)return Promise.reject(new DOMException('QA sound blocked','NotAllowedError'));return play.call(this);};
  },{denySound});
  await context.route('https://dreamlantern.test/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('qa/harness.html','utf8')}));
  await page.goto('https://dreamlantern.test/');await page.waitForSelector('.dl-intro');
  const fontRoot=path.join(DEPS,'@fontsource/noto-serif-sc');
  const fontcss=fs.readFileSync(fontRoot+'/400.css','utf8').replaceAll('Noto Serif SC','Noto Serif CJK SC').replace(/url\(\.\/files\/([^)]*)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(fontRoot+'/files/'+f).toString('base64')+')');
  await page.addStyleTag({content:fontcss});await page.evaluate(()=>document.fonts.ready);return {page,context};
 }
 let {page,context}=await setup();
 await page.waitForFunction(()=>{const v=document.querySelector('.dl-115-intro-video');return v&&!v.paused&&v.currentTime>.1;});
 check('intro real rukou loops muted inline',await page.locator('.dl-115-intro-video').evaluate(v=>v.src.endsWith('/rukou.mp4')&&v.loop&&v.muted&&v.playsInline));
 check('115 migrates legacy FX false and lowMotion true',await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('hxy_dreamlantern_preferences'));return p.presentation115===1&&p.fxEnabled===true&&p.lowMotion===false;}));
 await page.screenshot({path:'qa/115-intro-390.png'});
 await page.getByRole('button',{name:'展开狐妖手札'}).click();
 await page.waitForSelector('.dl-112-era-video');
 let gate=await page.locator('.dl-door').evaluateAll(es=>es.map(e=>({era:e.dataset.era,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,src:e.querySelector('video').src,muted:e.querySelector('video').muted,inline:e.querySelector('video').playsInline})));
 check('stacked real video era gates',gate.length===2&&gate[0].y<gate[1].y&&gate.every(x=>x.muted&&x.inline&&x.w/x.h>1.5),gate);
 await page.waitForFunction(()=>[...document.querySelectorAll('.dl-112-era-video')].every(v=>v.readyState>=2&&!v.paused&&v.currentTime>.1),{timeout:15000});
 check('both era videos actually decode and advance',true);check('era videos paint above poster',await page.locator('.dl-door').evaluateAll(es=>es.every(e=>parseInt(getComputedStyle(e.querySelector('video')).zIndex)>parseInt(getComputedStyle(e.querySelector('img')).zIndex))));
 check('no mirror DOM',await page.locator('[class*=mirror]').count()===0);
 await page.screenshot({animations:'disabled',path:'qa/115-browser-era-390.png'});
 check('global FX all four types visible',await page.locator('.dl-paper>.dl-112-fx').evaluate(e=>['thread','fox','petal','mote'].every(k=>e.querySelector('.dl-112-'+k)&&getComputedStyle(e.querySelector('.dl-112-'+k)).display!=='none')));
 await page.getByRole('button',{name:'关闭手札'}).click();
 await page.waitForFunction(()=>!document.querySelector('.dl-115-intro-video').paused);
 check('return to total intro resumes video',true);
 await page.getByRole('button',{name:'展开狐妖手札'}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.dl-112-era-video')].every(v=>!v.paused&&v.currentTime>.1));
 check('return to era gate remounts and plays both',true);
 await page.locator('.dl-door[data-era=modern]').click();await page.waitForSelector('.dl-card');
 check('modern 13 covers',await page.locator('.dl-cover-action img').count()===13);
 check('whole cover opens Opening',await page.locator('.dl-cover-action[data-id=M03]').count()===1);
 await page.locator('.dl-cover-action[data-id=M03]').click();await page.waitForSelector('.dl-112-opening-video');
 check('cover click calls play in active gesture',await page.evaluate(()=>window.__plays.some(p=>p.cls==='dl-112-opening-video'&&!p.muted&&p.active)));
 check('no blocking sound prompt',await page.getByText('点亮梦灯 · 开启原声').count()===0);
 check('M03 remapped to anime 02',await page.locator('.dl-112-opening-video').getAttribute('src').then(s=>s.endsWith('/M02.mp4')));
 await page.waitForFunction(()=>document.querySelector('.dl-opening').dataset.dlVideoMounted==='playing',{timeout:15000});
 const v=await page.locator('.dl-112-opening-video').evaluate(v=>({currentTime:v.currentTime,muted:v.muted,readyState:v.readyState,paused:v.paused,src:v.src}));
 check('video decodes and plays',v.readyState>=2&&!v.paused,v);
 check('global plus chapter FX <=14',await page.locator('.dl-root .dl-112-fx i').count()<=14,await page.locator('.dl-root .dl-112-fx i').count());
 check('visible sword extra DOM',await page.locator('.dl-opening .dl-112-extra').count()===1);
 await page.screenshot({animations:'disabled',path:'qa/115-browser-sword-390.png'});
 await page.getByRole('button',{name:'由此入梦'}).click();await page.waitForFunction(()=>document.querySelector('.dl-state').textContent.includes('王权篇'));
 check('transaction commits M03 modern lock',await page.evaluate(()=>window.__data.stat_data._当前篇章==='M03'&&window.__data.stat_data._现代锁定===true));
 check('exactly one timeline enabled',await page.evaluate(()=>window.__book.filter(x=>/【HXY_TIMELINE:/.test(x.name)&&x.enabled).length===1));
 await page.getByRole('button',{name:'回看时代入口'}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.dl-112-era-video')].every(v=>!v.paused&&v.currentTime>.1));
 check('review gate preserves modern lock and chapter',await page.evaluate(()=>window.__data.stat_data._现代锁定===true&&window.__data.stat_data._当前篇章==='M03'));
 await page.locator('.dl-door[data-era=ancient]').click();
 check('review selection writes no business state',await page.evaluate(()=>window.__data.stat_data._时代==='现代'&&window.__data.stat_data._当前篇章==='M03'));
 check('Opening released on navigation' ,await page.locator('.dl-112-opening-video').count()===0);
 await page.getByRole('button',{name:'缘卷',exact:true}).click();await page.locator('[data-action=era][data-era=ancient]').click();
 check('ancient 8 covers',await page.locator('.dl-cover-action').count()===8);
 await page.locator('.dl-cover-action[data-id=A03]').click();check('locked ancient replay has no enter',await page.locator('[data-action=enter]').count()===0);
 for(const [id,profile] of [['M04','blossom_redthread'],['M06','southern_mist'],['M09','mirror_redthread']]){
  await page.getByRole('button',{name:'缘卷',exact:true}).click();await page.locator('.dl-cover-action[data-id='+id+']').click();
  check(id+' themed FX',await page.locator('.dl-opening').getAttribute('data-profile')===profile);
  await page.screenshot({animations:'disabled',path:`qa/115-browser-${id}-390.png`});
 }
 await page.getByRole('button',{name:'缘忆',exact:true}).click();
 await page.locator('[data-action=memory][data-id=MEM_ZHUYE]').click();
 check('bamboo history keeps anime06 rather than A03 Wangquan EP',await page.locator('.dl-112-opening-video').getAttribute('src').then(s=>s.endsWith('/M06.mp4')));
 check('bamboo history remains replay only',await page.locator('[data-action=enter]').count()===0);
 await page.getByRole('button',{name:'缘忆',exact:true}).click();check('memory spoiler retained',await page.locator('.dl-spoiler').count()>0);await page.screenshot({animations:'disabled',path:'qa/115-browser-memory-390.png'});
 await page.getByRole('button',{name:'缘音',exact:true}).click();await page.locator('[data-track-index="0"]').click();check('one netease iframe auto=0',await page.locator('.dl-music iframe').count()===1&&await page.locator('.dl-music iframe').getAttribute('src').then(s=>s.includes('auto=0')));await page.screenshot({animations:'disabled',path:'qa/115-browser-music-390.png'});
 await page.getByRole('button',{name:'缘卷',exact:true}).click();await page.locator('.dl-cover-action[data-id=M04]').click();check('Opening unloads hidden music iframe',await page.locator('.dl-music iframe').getAttribute('src')==='about:blank');
 await page.getByRole('button',{name:'返回',exact:true}).click();check('restore music without autoplay',await page.locator('.dl-music iframe').getAttribute('src').then(s=>s.includes('auto=0')));
 await page.getByRole('button',{name:'缘卷',exact:true}).click();
 const mediaManifest=JSON.parse(fs.readFileSync(ROOT+'/source/script-4.js','utf8').match(/^ const MEDIA112=(.*);$/m)[1]);
 const crosswalk=JSON.parse(fs.readFileSync(ROOT+'/manifest/anime-to-manga-remap.v1.json','utf8'));
 check('21 unique final paths match latest crosswalk',new Set(Object.values(mediaManifest.chapterVideos).map(v=>v.video)).size===21&&Object.entries({...crosswalk.ancientOrderCrosswalk,...crosswalk.modernOrderCrosswalk}).every(([id,s])=>s.rawVideo===mediaManifest.chapterVideos[id].video));
 for(const [id,spec] of Object.entries(mediaManifest.chapterVideos)){
  await page.evaluate(id=>window.DreamLantern.playOpening(id,{mode:'replay',allowEnter:false}),id);
  check(id+' final mapped video',spec.verified&&await page.locator('.dl-112-opening-video').getAttribute('src').then(s=>s.endsWith(spec.video)));
  await page.waitForFunction(()=>document.querySelector('.dl-opening').dataset.dlVideoMounted==='playing',{timeout:15000});
  check(id+' video decodes and advances',await page.locator('.dl-112-opening-video').evaluate(v=>v.readyState>=2&&!v.paused));
  check(id+' only one Opening video',await page.locator('.dl-112-opening-video').count()<=1);
 }

 await context.close();
 for(const width of [360,412,430]){
  ({page,context}=await setup(width));await page.getByRole('button',{name:'展开狐妖手札'}).click();
  check('viewport '+width+' no horizontal overflow',await page.locator('.dl-paper').evaluate(e=>e.scrollWidth<=e.clientWidth),await page.locator('.dl-paper').evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth})));await page.screenshot({animations:'disabled',path:`qa/115-browser-era-${width}.png`});await context.close();
 }
 ({page,context}=await setup(390,true));await page.getByRole('button',{name:'展开狐妖手札'}).click();await page.locator('.dl-door[data-era=modern]').click();await page.locator('.dl-cover-action[data-id=M04]').click();await page.waitForFunction(()=>document.querySelector('.dl-opening').dataset.dlVideoMounted==='fallback');
 check('all remote failure no black blocker',await page.getByRole('button',{name:'由此入梦'}).isEnabled()&&await page.locator('.dl-opening .dl-112-fx i').count()>0);
 await page.screenshot({animations:'disabled',path:'qa/115-browser-offline-390.png'});await page.getByRole('button',{name:'由此入梦'}).click();check('offline media still commits business',await page.evaluate(()=>window.__data.stat_data._当前篇章==='M04'));await context.close();
 ({page,context}=await setup(390,false,true));await page.getByRole('button',{name:'展开狐妖手札'}).click();check('reduced motion FX static',await page.locator('.dl-paper>.dl-112-fx i').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')));await context.close();
 ({page,context}=await setup(390,false,true,true));
 await page.getByRole('button',{name:'展开狐妖手札'}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.dl-112-era-video')].every(v=>!v.paused&&v.currentTime>.1));
 check('reduced motion keeps both era videos playing visible',await page.locator('.dl-112-era-video').evaluateAll(es=>es.every(v=>getComputedStyle(v).display!=='none'&&getComputedStyle(v).opacity==='1')));
 await page.locator('.dl-door[data-era=modern]').click();await page.locator('.dl-cover-action[data-id=M04]').click();
 await page.waitForFunction(()=>{const v=document.querySelector('.dl-112-opening-video');return v&&v.muted&&!v.paused&&v.currentTime>.1;});
 check('sound denied automatically plays muted without another click',true);
 check('optional sound button is nonblocking',await page.getByRole('button',{name:'开启Opening声音'}).isVisible());
 await page.getByRole('button',{name:'返回',exact:true}).click();await page.locator('.dl-cover-action[data-id=M04]').click();
 await page.waitForFunction(()=>{const v=document.querySelector('.dl-112-opening-video');return v&&v.muted&&!v.paused&&v.currentTime>.1;});
 check('replay automatically plays muted again',true);
 await page.getByRole('button',{name:'关闭手札'}).click();await page.locator('.dl-launch').click();
 await page.getByRole('button',{name:'特效 · 已开启',exact:true}).click();
 check('explicit FX off works',await page.locator('.dl-root').evaluate(e=>e.classList.contains('dl-fx-off')));
 await page.reload();await page.waitForSelector('.dl-intro');
 // Init script seeds old prefs on reload; migration must turn FX back on for that old version.
 check('legacy defaults migrate on a fresh load',await page.evaluate(()=>JSON.parse(localStorage.getItem('hxy_dreamlantern_preferences')).fxEnabled===true));
 await context.close();
 check('zero JS page errors' ,report.errors.length===0,report.errors);
 await browser.close();
})().catch(e=>{report.failure=String(e);process.exitCode=1;}).finally(()=>{fs.writeFileSync('qa/115-browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));});
