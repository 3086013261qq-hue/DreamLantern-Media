from pathlib import Path
import json,base64
c=json.loads(next(Path('delivery').glob('*.json')).read_text()) if False else json.loads(next(Path('delivery').glob('*候选1.json')).read_text())
s=c['data']['extensions']['tavern_helper']['scripts'];book=c['data']['character_book']['entries'];entries=[{'name':e.get('comment',''),'enabled':e.get('enabled',True)} for e in book]
# Model only the public helper APIs. Real ST/Android QA is a separate acceptance gate.
pre='''window.__qa={writes:[],events:{}};window.__data={stat_data:{_时代:'未选择',_当前篇章:'',_现代锁定:false}};
window.structuredClone=window.structuredClone||((x)=>JSON.parse(JSON.stringify(x)));
window.getCharWorldbookNames=async()=>({primary:'test-book',additional:[]});window.getWorldbook=async()=>structuredClone(window.__book);
window.replaceWorldbook=async(name,entries)=>{window.__qa.writes.push({name,entries});window.__book=structuredClone(entries);};
window.Mvu={events:{VARIABLE_UPDATE_ENDED:'mvu_end',VARIABLE_INITIALIZED:'mvu_init'},getMvuData:()=>structuredClone(window.__data),replaceMvuData:async d=>{window.__data=structuredClone(d);}};
window.getChatMessages=id=>[{role:'assistant',message:'[DREAM_LANTERN_OPENING_FLOW]'}];window.getLastMessageId=()=>0;window.waitGlobalInitialized=async()=>{};
window.eventOn=(name,fn)=>{(window.__qa.events[name]||=[]).push(fn);return {stop(){}}};window.tavern_events={CHAT_CHANGED:'chat',MESSAGE_UPDATED:'update'};
'''
html='<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#292330;color:#eee;font-family:serif}#chat{max-width:700px;margin:auto}#send_textarea{display:none}.qa-notice{font:12px sans-serif;padding:8px;color:#d8b36b}</style><div class="qa-notice">浏览器模拟环境 · 非Android/SillyTavern实机</div><div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div><textarea id="send_textarea"></textarea><script>'+pre+'window.__book='+json.dumps(entries,ensure_ascii=False)+';</script>'
html=html.replace('<\\/script>','</script>')
for x in [s[3],s[4]]:html+='<script>'+x['content'].replace('</script','<\\/script')+'</script>'
Path('qa/harness.html').write_text(html)
