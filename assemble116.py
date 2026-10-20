"""116 incremental interaction delta. Sole direct baseline: delivered 115 candidate2."""
import json,re,hashlib,argparse,struct,zlib,base64
from pathlib import Path
import assemble115 as prev
R=Path(__file__).resolve().parent
STEM=prev.STEM
BASE=R/'delivery'/(STEM+'115候选2.json')
OUT=R/'delivery'/(STEM+'116候选3')
def dump(p,x):prev.dump(p,x)
def build():
 base=json.loads(BASE.read_text());c=json.loads(BASE.read_text());old=c['data']['extensions']['tavern_helper']['scripts'][4]['content'];s=old
 end=s.index('// Pure transaction coordinator.')
 s=(R/'ui/dreamlantern.media112.js').read_text()+'\n'+s[end:]
 s=prev.once(s,'mediaLayer.mountIntro(intro);mediaLayer.showIntro(shade.hidden);','if(shade.hidden)mediaLayer.mountIntro(intro);')
 s=prev.once(s,"<div class=\"dl-doors\">", "<section class=\"dl-116-entry\" aria-label=\"梦灯笼入口视频\"></section><div class=\"dl-doors\">")
 s=prev.once(s,"if(page==='doors')mediaLayer.mountEraGate(root,lowMotion);", "if(page==='doors'){mediaLayer.mountEraGate(root,lowMotion);mediaLayer.mountIntro(view.querySelector('.dl-116-entry'),true);}")
 s=prev.once(s,"mediaLayer.showIntro(true);returnFocus", "returnFocus")
 s=prev.once(s,"else if(a==='era'){era=b.dataset.era;page='chapters';render();}","else if(a==='era'){const locked=b.dataset.era==='ancient'&&!!state()._现代锁定;if(b.classList.contains('dl-door')){if(!mediaLayer.previewEra(b,locked))return;if(locked)return;}era=b.dataset.era;page='chapters';render();}")
 # Existing chosen-era intro launcher must also preserve the trusted gesture for rukou.
 s=prev.once(s,"if(a==='open')open();", "if(a==='open')open('doors');")
 m=re.search(r'^ const CSS=(.*);$',s,re.M);css=json.loads(m[1])+'''\n/* 116: visible total entrance; only its sound toggle and era preview hints are new. */
.dl-116-entry{position:relative;aspect-ratio:16/9;isolation:isolate;overflow:hidden;border:1px solid #d8b36b55;border-radius:6px 24px;background:#100c14}
.dl-116-entry .dl-115-intro-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.dl-intro .dl-116-intro-sound,.dl-root .dl-116-intro-sound{position:absolute;right:10px;top:10px;z-index:5;font-size:12px;min-height:44px;background:#100c14cc!important}
.dl-root .dl-door[data-armed=true]{border-color:#f0d398!important;box-shadow:0 0 18px #9c354a55}
'''
 s=s[:m.start(1)]+json.dumps(css,ensure_ascii=False)+s[m.end(1):]
 c['data']['extensions']['tavern_helper']['scripts'][4]['content']=s
 clone=json.loads(json.dumps(c));clone['data']['extensions']['tavern_helper']['scripts'][4]['content']=old;assert clone==base
 a=old.index('// Pure transaction coordinator.');b=old.index('\n(function(){');assert old[a:b]==s[s.index('// Pure transaction coordinator.'):s.index('\n(function(){')]
 assert re.search(r'^ const MEDIA112=(.*);$',old,re.M)[1]==re.search(r'^ const MEDIA112=(.*);$',s,re.M)[1]
 assert c['data']['character_version']=='1.2.0'
 audit={'baseline':BASE.name,'baselineCommit':'d5a755b83aa21f85d313baca0283d72b4ccfa51f','baselineSha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'changedPaths':['/data/extensions/tavern_helper/scripts/4/content'],'businessAndAllOtherFieldsExactEquality':True,'transactionCoordinatorExactEquality':True,'mediaManifestExactEquality':True,'androidSillyTavern':'NOT_EXECUTED_DEVICE_UNAVAILABLE','jsonSha256':hashlib.sha256((json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()).hexdigest()}
 return c,s,audit
def png(c):
 raw=(R/'delivery'/(STEM+'115候选2.png')).read_bytes();out=raw[:8];i=8;keys=[];before=[];after=[]
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
 if args.stage=='source':(R/'source/script-4.js').write_text(s);dump(R/'qa/116-business-audit.json',a)
 elif args.stage=='json':
  assert (R/'source/script-4.js').read_text()==s;dump(Path(str(OUT)+'.json'),c)
 else:
  assert json.loads(Path(str(OUT)+'.json').read_text())==c
  raw,result=png(c)
  Path(str(OUT)+'.png').write_bytes(raw);dump(R/'qa/116-package-validation.json',result)
 print(json.dumps(a,ensure_ascii=False))
