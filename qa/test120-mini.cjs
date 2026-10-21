const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const report={environment:'Chromium mobile touch emulation; mocked SillyTavern APIs; NOT Android/SillyTavern device',tests:[],errors:[]};let browser;
function check(name,ok){report.tests.push({name,ok});console.log(name,ok);if(!ok)throw Error(name);}
(async()=>{
 const C=(await import('/tmp/dreamlantern-browser/node_modules/@sparticuz/chromium/build/index.js')).default;
 browser=await chromium.launch({executablePath:await C.executablePath(),args:C.args.filter(x=>!['--single-process','--disable-web-security','--disable-site-isolation-trials'].includes(x))});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await context.route('https://cdn.jsdelivr.net/**',r=>{const marker='DreamLantern-Media@main/',u=r.request().url();if(!u.includes(marker))return r.abort();const f=path.resolve(decodeURIComponent(u.split(marker)[1].split('?')[0]));return f.startsWith(process.cwd()+'/')&&fs.existsSync(f)?r.fulfill({path:f,headers:{'access-control-allow-origin':'*'}}):r.abort();});await context.route('https://www.garden-culture.net/**',r=>r.abort());
 await context.route('https://dreamlantern.test/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('qa/harness.html','utf8')}));
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));await page.goto('https://dreamlantern.test/');await page.waitForSelector('.dl-root',{state:'attached'});
 const fontRoot='/tmp/dreamlantern-browser/node_modules/@fontsource/noto-serif-sc';
 const fontcss=fs.readFileSync(fontRoot+'/400.css','utf8').replaceAll('Noto Serif SC','Noto Serif CJK SC').replace(/url\(\.\/files\/([^)]*)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(fontRoot+'/files/'+f).toString('base64')+')');
 await page.addStyleTag({content:fontcss+'body,button{font-family:"Noto Serif CJK SC",serif!important}'});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{
  window.__last=0;window.__messages={0:{role:'assistant',message:'[DREAM_LANTERN_OPENING_FLOW]'}};
  window.getLastMessageId=()=>window.__last;window.getChatMessages=id=>[window.__messages[id]];
  window.__data.stat_data={_时代:'古代',_当前篇章:'A04',_现代锁定:false};
  window.__root=document.querySelector('.dl-root');window.__shade=document.querySelector('.dl-shade');
  window.__eventCounts=JSON.stringify(Object.fromEntries(Object.entries(window.__qa.events).map(([k,v])=>[k,v.length])));
 });
 const snapshot=()=>page.evaluate(()=>JSON.stringify([window.__data,window.__book,window.__qa.writes]));
 await page.evaluate(()=>window.DreamLantern.controller.heal());
 const initial=await snapshot();
 async function refresh(){await page.evaluate(()=>window.DreamLantern.refresh());await page.waitForTimeout(160);}
 async function add(id){await page.evaluate(id=>{window.__last=id;window.__messages[id]={role:'assistant',message:'测试正文 '+id};const e=document.createElement('div');e.className='mes';e.setAttribute('mesid',id);e.innerHTML='<div class="mes_text">测试正文 '+id+'</div>';document.querySelector('#chat').append(e);},id);await refresh();}
 async function one(id,label){
  check(label+' one latest mini',await page.locator('.dl-mini').count()===1&&await page.locator(`#chat > .mes[mesid="${id}"] .dl-mini`).count()===1);
  check(label+' exact title and native button',await page.locator('.dl-mini').evaluate(b=>b.tagName==='BUTTON'&&b.type==='button'&&b.textContent==='✧ 梦灯笼 · 古代 / 月红初世'&&b.offsetHeight>=44));
  const before=await snapshot();await page.locator('.dl-mini').tap();await page.waitForSelector('.dl-shade:not([hidden])');
  check(label+' same single root/shade',await page.evaluate(()=>document.querySelectorAll('.dl-root').length===1&&document.querySelectorAll('.dl-shade').length===1&&window.__root===document.querySelector('.dl-root')&&window.__shade===document.querySelector('.dl-shade')));
  check(label+' same view as original open button',await page.locator('.dl-door').count()===2);
  await page.getByRole('button',{name:'关闭手札'}).tap();check(label+' focus restored',await page.locator('.dl-mini').evaluate(b=>b===document.activeElement));
  check(label+' no business writes',before===await snapshot());
 }
 // Preserve baseline zero-floor total entrance; first eligible assistant is the initial mini host.
 check('zero-floor entrance retained without added full MVU',await page.locator('.dl-intro').count()===1&&await page.locator('.dl-mini').count()===0);
 for(let i=1;i<=3;i++){await add(i);await one(i,'assistant '+i);}
 await one(3,'reopen');
 await page.evaluate(()=>{window.__messages[3].message='regenerated';document.querySelector('.mes[mesid="3"] .mes_text').textContent='regenerated';(window.__qa.events.update||[]).forEach(f=>f());});await page.waitForTimeout(160);await one(3,'regenerate');
 await page.evaluate(()=>{document.querySelector('.mes[mesid="3"] .mes_text').textContent='swiped reply';window.DreamLantern.refresh();});await page.waitForTimeout(160);await one(3,'swipe via statusbar refresh');
 await page.evaluate(()=>{document.querySelector('.mes[mesid="3"] .mes_text').textContent='edited reply';window.DreamLantern.refresh();});await page.waitForTimeout(160);await one(3,'edit rerender');
 await page.evaluate(()=>{for(let i=0;i<20;i++)window.DreamLantern.refresh();});await page.waitForTimeout(160);await one(3,'20 refreshes');
 check('event subscriptions do not multiply',await page.evaluate(()=>window.__eventCounts===JSON.stringify(Object.fromEntries(Object.entries(window.__qa.events).map(([k,v])=>[k,v.length])))));
 await page.locator('.dl-mini').focus();await page.keyboard.press('Enter');check('keyboard Enter opens',await page.locator('.dl-shade').evaluate(e=>!e.hidden));await page.keyboard.press('Escape');
 await page.locator('.dl-mini').focus();await page.keyboard.press('Space');check('keyboard Space opens',await page.locator('.dl-shade').evaluate(e=>!e.hidden));await page.keyboard.press('Escape');
 await page.evaluate(()=>{(window.__qa.events.chat||[]).forEach(f=>f());});await page.waitForTimeout(160);await one(3,'chat return');
 check('all click and refresh rounds preserve business',initial===await snapshot());
 await page.evaluate(()=>{document.querySelector('#chat').style.paddingBottom='2000px';window.scrollTo(0,100);});
 await page.locator('.dl-mini').tap();await page.getByRole('button',{name:'关闭手札'}).tap();
 const beforeScroll=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,400);await page.waitForTimeout(100);
 check('document still scrolls after close',await page.evaluate(y=>scrollY>y,beforeScroll));
 await page.locator('.dl-mini').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/120-mini-mobile.png'});await page.locator('.dl-mini').tap();await page.evaluate(()=>window.getSelection()?.removeAllRanges());await page.screenshot({path:'qa/120-mini-open-mobile.png'});
 check('zero JavaScript errors',report.errors.length===0);
})().catch(e=>{report.failure=e.stack||String(e);process.exitCode=1;}).finally(async()=>{await browser?.close();fs.writeFileSync('qa/120-mini-report.json',JSON.stringify(report,null,2));});
