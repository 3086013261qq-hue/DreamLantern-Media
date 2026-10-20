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
 let {page,context}=await setup(390,false,true,true);
 await page.locator('.dl-116-intro-sound').click();
 await page.waitForFunction(()=>{const v=document.querySelector('.dl-intro video');return v&&v.muted&&!v.paused&&v.currentTime>.1&&v.parentElement.dataset.introVideo==='playing';});
 check('blocked intro audible attempt keeps visible playback',await page.locator('.dl-115-intro-video').evaluate(v=>getComputedStyle(v).display!=='none'&&getComputedStyle(v).visibility==='visible'&&+getComputedStyle(v).opacity>0)&&await page.evaluate(()=>window.__plays.some(p=>p.cls==='dl-115-intro-video'&&!p.muted&&p.active)));
 check('blocked intro sound button offers retry',await page.locator('.dl-116-intro-sound').textContent().then(s=>s.includes('开启声音')));
 await page.evaluate(()=>window.__denySound=false);
 await page.locator('.dl-116-intro-sound').click();
 check('one sound retry restores sound without opening era page',await page.locator('.dl-115-intro-video').evaluate(v=>!v.muted&&!v.paused)&&await page.locator('.dl-door').count()===0);
 await context.close();check('zero JS page errors',report.errors.length===0,report.errors);await browser.close();
})().catch(e=>{report.failure=String(e);process.exitCode=1;}).finally(()=>{fs.writeFileSync('qa/119-intro-sound-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));});
