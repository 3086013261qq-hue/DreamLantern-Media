const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const DEPS=process.env.DREAMLANTERN_BROWSER_DEPS||'/tmp/dreamlantern-browser/node_modules';
const ROOT=path.resolve('.'),report={environment:'Chromium mobile viewport + mocked SillyTavern helper APIs; NOT Android device',tests:[],errors:[],route:'CDN URLs fulfilled from exact repository bytes for deterministic UI QA'};
const check=(name,ok,details)=>{console.log(name,ok);report.tests.push({name,ok,details});if(!ok)throw Error(name+': '+JSON.stringify(details));};
async function capture(page,options){
 // Only the entry regression requires pixel evidence; other pages use DOM/media/business assertions.
 if(!options.path.includes('intro'))return;
 await page.evaluate(()=>{window.__qaScreenshotVideos=[...document.querySelectorAll('video')].filter(v=>!v.paused);window.__qaScreenshotVideos.forEach(v=>v.pause());});
 try{return await page.screenshot(options);}finally{await page.evaluate(()=>{window.__qaScreenshotVideos.forEach(v=>{if(v.isConnected)v.play().catch(()=>{});});window.__qaScreenshotVideos=[];});}
}
let browser;
(async()=>{
 const sp=await import(path.join(DEPS,'@sparticuz/chromium/build/index.js'));const C=sp.default;
 browser=await chromium.launch({executablePath:await C.executablePath(),args:C.args.filter(x=>!['--single-process','--disable-web-security','--disable-site-isolation-trials'].includes(x)),headless:true});
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
    const load=HTMLMediaElement.prototype.load;HTMLMediaElement.prototype.load=function(){this.__qaLoads=(this.__qaLoads||0)+1;return load.call(this);};
    const play=HTMLMediaElement.prototype.play;window.__plays=[];window.__denySound=denySound;
    HTMLMediaElement.prototype.play=function(){window.__plays.push({cls:this.className,muted:this.muted,active:navigator.userActivation.isActive});if(window.__denySound&&!this.muted)return Promise.reject(new DOMException('QA sound blocked','NotAllowedError'));return play.call(this);};
  },{denySound});
  await context.route('https://dreamlantern.test/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('qa/harness.html','utf8')}));
  await page.goto('https://dreamlantern.test/');await page.waitForSelector('.dl-intro');
  const fontRoot=path.join(DEPS,'@fontsource/noto-serif-sc');
  const fontcss=fs.readFileSync(fontRoot+'/400.css','utf8').replaceAll('Noto Serif SC','Noto Serif CJK SC').replace(/url\(\.\/files\/([^)]*)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(fontRoot+'/files/'+f).toString('base64')+')');
  await page.addStyleTag({content:fontcss});await page.evaluate(()=>document.fonts.ready);return {page,context};
 }

 let {page,context}=await setup();
 const exact='https://cdn.jsdelivr.net/gh/3086013261qq-hue/DreamLantern-Media@main/incoming/mp4_raw/rukou.mp4';
 async function intro(label){
  await page.waitForFunction(()=>{const h=document.querySelector('.dl-intro'),v=h?.querySelector('video');return h?.dataset.introVideo==='playing'&&v&&!v.paused&&v.readyState>=2&&v.currentTime>.1;});
  check(label+' single exact entrance and sound',await page.locator('video').count()===1&&await page.locator('.dl-intro video').getAttribute('src')===exact&&await page.locator('.dl-116-intro-sound').count()===1);
  check(label+' visible video above current chapter scene',await page.locator('.dl-intro').evaluate(h=>{const v=h.querySelector('video'),c=getComputedStyle(v),scene=getComputedStyle(h.querySelector('.dl-scene'));return !h.classList.contains('dl-muted-scene')&&+c.opacity>0&&c.display!=='none'&&c.visibility!=='hidden'&&+c.zIndex>=0&&+c.zIndex>+scene.zIndex&&scene.visibility==='hidden';}));
  const t=await page.locator('.dl-intro video').evaluate(v=>v.currentTime);await page.waitForFunction(t=>document.querySelector('.dl-intro video').currentTime>t+.05,t);
 }
 async function releaseCheck(){check('stale entrance paused muted unloaded detached',await page.evaluate(()=>{const v=window.__oldIntro;return !v||(v.paused&&v.muted&&!v.isConnected&&!v.hasAttribute('src')&&v.__qaLoads>0);}));}
 async function doors(){await page.evaluate(()=>window.__oldIntro=document.querySelector('.dl-intro video'));await page.getByRole('button',{name:'展开狐妖手札'}).click();await releaseCheck();check('era page excludes every rukou URL and keeps two cards',await page.locator('.dl-door').count()===2&&await page.locator('[src*="rukou.mp4"],.dl-115-intro-video').count()===0);}
 async function choose(era,id){await doors();await page.locator('.dl-door[data-era='+era+']').click();check('first era only audible preview',await page.locator('.dl-card').count()===0&&await page.locator('.dl-112-era-video').evaluate(v=>!v.muted));await page.locator('.dl-door[data-era='+era+']').click();await page.locator('.dl-cover-action[data-id='+id+']').click();await page.waitForSelector('.dl-112-opening-video');await page.getByRole('button',{name:'由此入梦'}).click();await page.waitForFunction(id=>window.__data.stat_data._当前篇章===id,id);check('entered chapter keeps entrance absent until close',await page.locator('.dl-intro video').count()===0);await page.getByRole('button',{name:'关闭手札'}).click();await intro(era+' '+id+' after entry');}
 await intro('initial');await choose('ancient','A02');
 // Ancient transition is checked by computed paint layers and real time progression.
 await context.close();({page,context}=await setup());await choose('modern','M03');
 // Capture only after the complete lifecycle test succeeds.
 for(let i=0;i<3;i++){
  const before=await page.evaluate(()=>JSON.stringify([window.__data,window.__book,window.__qa.writes]));
  await doors();await page.locator('.dl-door[data-era=ancient]').click();await page.getByRole('button',{name:'关闭手札'}).click();await intro('round '+i+' era close');
  await page.evaluate(()=>window.DreamLantern.playOpening('M03',{mode:'replay',allowEnter:false}));
  check('replay opening excludes entrance',await page.locator('.dl-intro video').count()===0);await page.getByRole('button',{name:'关闭手札'}).click();await intro('round '+i+' replay close');
  await page.evaluate(()=>{document.querySelector('.dl-root [data-action=close]').click();document.querySelector('.dl-root [data-action=close]').click();});await intro('round '+i+' idempotent close');
  check('replay and remount leave business exact',before===await page.evaluate(()=>JSON.stringify([window.__data,window.__book,window.__qa.writes])));
 }
 // Hidden-document return must defer mounting until visibility is restored.
 await doors();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.querySelector('.dl-root [data-action=close]').click();});
 check('hidden document does not prematurely remount',await page.locator('.dl-intro video').count()===0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await intro('visibility return');
 // Fail only rukou; Opening and business remain available, then re-enter to retry.
 let failRukou=true;
 await context.route('**/incoming/mp4_raw/rukou.mp4',r=>failRukou?r.abort():r.fallback());
 await doors();await page.getByRole('button',{name:'关闭手札'}).click();
 await page.waitForFunction(()=>document.querySelector('.dl-intro').dataset.introVideo==='fallback');
 check('failed remount exposes fallback',await page.locator('.dl-intro video').count()===0&&await page.locator('.dl-scene').evaluate(s=>+getComputedStyle(s).opacity>0));
 failRukou=false;await doors();await page.getByRole('button',{name:'关闭手札'}).click();await intro('recovered after media failure');
 check('modern lock survives every return',await page.evaluate(()=>window.__data.stat_data._现代锁定&&window.__data.stat_data._当前篇章==='M03'));
 await capture(page,{animations:'disabled',path:'qa/119-intro-after-modern.png'});
 await context.close();check('zero JS page errors',report.errors.length===0,report.errors);await browser.close();
})().catch(e=>{report.failure=e.stack||String(e);process.exitCode=1;}).finally(async()=>{await browser?.close();fs.writeFileSync('qa/119-lifecycle-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));});
