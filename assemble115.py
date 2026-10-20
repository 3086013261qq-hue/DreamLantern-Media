"""115 presentation-only delta on delivered 112 candidate1; atomic JSON/PNG outputs."""
import json,re,hashlib,struct,zlib,base64,argparse
from pathlib import Path
R=Path(__file__).resolve().parent
STEM='狐妖小红娘_梦灯笼_正式版_v1.2.0_'
BASE=R/'delivery'/(STEM+'112候选1.json')
OUT=R/'delivery'/(STEM+'115候选2')
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def once(s,a,b):
 assert s.count(a)==1,(a[:100],s.count(a))
 return s.replace(a,b,1)
def build():
 base=json.loads(BASE.read_text());c=json.loads(BASE.read_text());scripts=c['data']['extensions']['tavern_helper']['scripts'];s=scripts[4]['content']
 assert scripts[4]['id']=='dreamlantern-ui'
 factory_end=s.index('// Pure transaction coordinator.')
 s=(R/'ui/dreamlantern.media112.js').read_text()+'\n'+s[factory_end:]
 policy=json.loads((R/'manifest/presentation115.v1.json').read_text())
 m=re.search(r'^ const MEDIA112=(.*);$',s,re.M);media=json.loads(m[1]);original_media=json.loads(m[1]);media['intro']=policy['intro']
 s=s[:m.start(1)]+json.dumps(media,ensure_ascii=False)+s[m.end(1):]
 # Candidate1 embedded manifests are authoritative: repository legacy runtime file is incomplete.
 remap=json.loads((R/'manifest/anime-to-manga-remap.v1.json').read_text())
 assert len(media['chapterVideos'])==21
 assert all(media['chapterVideos'][k]['video']==v['rawVideo'] for k,v in {**remap['ancientOrderCrosswalk'],**remap['modernOrderCrosswalk']}.items())
 s=once(s," let lowMotion=!!getPrefs().lowMotion||!!reduced?.matches;",''' // One-time 115 migration ignores legacy false/default-low-motion preferences.
 let prefs=getPrefs();if(prefs.presentation115!==1){prefs={...prefs,presentation115:1,fxEnabled:true,lowMotion:false};try{W.localStorage.setItem('hxy_dreamlantern_preferences',JSON.stringify(prefs));}catch{}}
 let fxEnabled=prefs.fxEnabled!==false,lowMotion=!!prefs.lowMotion||!!reduced?.matches;''')
 s=once(s,"function applyMotion(){root.classList.toggle('dl-low-motion',lowMotion);", "function applyMotion(){root.classList.toggle('dl-fx-off',!fxEnabled);root.classList.toggle('dl-low-motion',lowMotion);")
 s=once(s,"function enhanceIntro(intro){", "function enhanceIntro(intro){\n  mediaLayer.mountIntro(intro);mediaLayer.showIntro(shade.hidden);")
 s=once(s,"D.querySelectorAll('.dl-intro').forEach(e=>e.classList.add('dl-muted-scene'));returnFocus", "D.querySelectorAll('.dl-intro').forEach(e=>e.classList.add('dl-muted-scene'));mediaLayer.showIntro(false);returnFocus")
 s=once(s,"shade.hidden=true;stopVisual();returnFocus", "shade.hidden=true;stopVisual();mediaLayer.showIntro(true);returnFocus")
 # Persistent replay path on all phone pages; the existing doors/era actions only select display state.
 s=once(s,'<button class="dl-close"', '<button class="dl-115-review" data-action="doors">回看时代入口</button><button class="dl-close"')
 s=once(s,"button('motion',lowMotion?'轻动效 · 已开启':'切换轻动效')", "button('fx',fxEnabled?'特效 · 已开启':'特效 · 已关闭')+button('motion',lowMotion?'轻动效 · 已开启':'切换轻动效')")
 s=once(s,"else if(a==='motion'){lowMotion=!lowMotion;", "else if(a==='fx'){fxEnabled=!fxEnabled;try{W.localStorage.setItem('hxy_dreamlantern_preferences',JSON.stringify({...getPrefs(),presentation115:1,fxEnabled}));}catch{}applyMotion();}\n  else if(a==='motion'){lowMotion=!lowMotion;")
 s=once(s,'JSON.stringify({lowMotion})','JSON.stringify({...getPrefs(),presentation115:1,fxEnabled,lowMotion})')
 m=re.search(r'^ const CSS=(.*);$',s,re.M);css=json.loads(m[1]);css=css.replace('.dl-112-era-video{display:none}','')
 css+='\n'+(R/'ui/dreamlantern.presentation112.css').read_text()
 s=s[:m.start(1)]+json.dumps(css,ensure_ascii=False)+s[m.end(1):]
 scripts[4]['content']=s
 clone=json.loads(json.dumps(c));clone['data']['extensions']['tavern_helper']['scripts'][4]['content']=base['data']['extensions']['tavern_helper']['scripts'][4]['content'];assert clone==base
 old=base['data']['extensions']['tavern_helper']['scripts'][4]['content'];a=old.index('// Pure transaction coordinator.');b=old.index('\n(function(){');assert old[a:b]==s[s.index('// Pure transaction coordinator.'):s.index('\n(function(){')]
 assert c['data']['character_version']=='1.2.0'
 audit={'baseline':BASE.name,'baselineSha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'changedPaths':['/data/extensions/tavern_helper/scripts/4/content'],'businessAndAllOtherFieldsExactEquality':clone==base,'transactionCoordinatorExactEquality':True,'chapterVideosExactEquality':media['chapterVideos']==original_media['chapterVideos'],'eraGatePathsExactEquality':media['eraGate']==original_media['eraGate'],'chapterCount':len(media['chapterVideos']),'androidSillyTavern':'NOT_EXECUTED_DEVICE_UNAVAILABLE','jsonSha256':hashlib.sha256((json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()).hexdigest()}
 return c,s,audit

def png(c):
 raw=(R/'delivery'/(STEM+'112候选1.png')).read_bytes();out=raw[:8];i=8;keys=[];before=[];after=[]
 while i<len(raw):
  n=int.from_bytes(raw[i:i+4],'big');t=raw[i+4:i+8];d=raw[i+8:i+8+n];chunk=raw[i:i+n+12];i+=n+12
  assert zlib.crc32(t+d)&0xffffffff==int.from_bytes(chunk[-4:],'big')
  if t==b'tEXt' and d.split(b'\0')[0] in (b'chara',b'ccv3'):continue
  before.append(chunk)
  if t==b'IEND':
   for key in (b'chara',b'ccv3'):
    payload=key+b'\0'+base64.b64encode(json.dumps(c,ensure_ascii=False,separators=(',',':')).encode());body=b'tEXt'+payload;out+=struct.pack('>I',len(payload))+body+struct.pack('>I',zlib.crc32(body)&0xffffffff)
  out+=chunk
 i=8
 while i<len(out):
  n=int.from_bytes(out[i:i+4],'big');t=out[i+4:i+8];d=out[i+8:i+8+n];chunk=out[i:i+n+12];i+=n+12
  assert zlib.crc32(t+d)&0xffffffff==int.from_bytes(chunk[-4:],'big')
  if t==b'tEXt' and d.split(b'\0')[0] in (b'chara',b'ccv3'):
   keys.append(d.split(b'\0')[0].decode());assert json.loads(base64.b64decode(d.split(b'\0',1)[1]))==c
  else:after.append(chunk)
 assert before==after and keys==['chara','ccv3']
 return out,{'nonCardChunksExactEquality':True,'charaAndCcv3MatchJson':True,'pngSha256':hashlib.sha256(out).hexdigest()}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('stage',choices=['source','json','png']);args=p.parse_args();c,s,a=build()
 if args.stage=='source':
  (R/'source/script-4.js').write_text(s);dump(R/'qa/115-business-audit.json',a)
 elif args.stage=='json':
  assert (R/'source/script-4.js').read_text()==s;dump(OUT.with_suffix('.json'),c)
 elif args.stage=='png':
  assert json.loads(OUT.with_suffix('.json').read_text())==c;raw,result=png(c);OUT.with_suffix('.png').write_bytes(raw);dump(R/'qa/115-package-validation.json',result)
 print(json.dumps(a,ensure_ascii=False))
