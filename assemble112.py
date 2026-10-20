"""Assemble only presentation changes onto the exact v1.2.0 user card."""
import json,re,hashlib,struct,zlib,base64,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def read(p):return json.loads(p.read_text())
def write(p,obj):p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def constants(src,name,obj):
 pattern=r'^ const '+name+r'=.*;$'
 assert len(re.findall(pattern,src,re.M))==1,name
 return re.sub(pattern,lambda _: ' const '+name+'='+json.dumps(obj,ensure_ascii=False)+';',src,flags=re.M)
def replace_fn(s,name,new):
 # Functions below are delimited by the next same-indentation function/constant.
 start=s.index(' function '+name+'(')
 m=re.search(r'\n (?:function |const |let |async function )',s[start+1:])
 assert m,name
 end=start+1+m.start()
 return s[:start]+new.rstrip()+s[end:]
def assemble(base_json,base_png,out):
 out.mkdir(parents=True,exist_ok=True)
 base=read(base_json);c=json.loads(json.dumps(base));d=c['data'];assert d['character_version']=='1.2.0'
 scripts=d['extensions']['tavern_helper']['scripts'];ui=next(x for x in scripts if x['id']=='dreamlantern-ui');src=ui['content'];original=src
 oldcss=json.loads(next(l.split('=',1)[1].rstrip(';') for l in src.splitlines() if l.startswith(' const CSS=')))
 media=read(ROOT/'manifest/user-media-runtime.v1.json');runtime=read(ROOT/'manifest/chapter-runtime.v2.json');dynamic=read(ROOT/'manifest/dynamic-runtime.v1.json');profiles=read(ROOT/'manifest/fx-profiles.v1.json')
 # Verify the final crosswalk on every build; unbound is an explicit mapping result.
 remap=read(ROOT/'manifest/anime-to-manga-remap.v1.json')
 cross={**remap['ancientOrderCrosswalk'],**remap['modernOrderCrosswalk']}
 assert set(media['chapterVideos'])==set(cross) and len(cross)==21
 assert len(media['covers']['chapters'])==21
 for id,mapping in cross.items():
  item=media['chapterVideos'][id]
  assert item.get('video')==mapping['rawVideo'],id
  assert bool(item['verified'])==bool(mapping['rawVideo']),id
  for rel in [item.get('video'),item.get('cover')]:
   if rel:assert (ROOT/rel).is_file(),rel
 assert all(x.get('video') for x in media['chapterVideos'].values())
 assert len({x['video'] for x in media['chapterVideos'].values()})==21
 # Read 109's chapter-local image entries, never reuse the old visual override as authority.
 visual={}
 for id,spec in runtime['chapters'].items():
  im=read(ROOT/spec['images']);primary=im.get('primary',[]);secondary=im.get('secondary',[])
  p=primary[0] if primary else {};v={'officialAssetUrl':p.get('url') or p.get('path'),'officialAssetVerified':bool(primary),'objectPosition':p.get('objectPosition','50% 30%')}
  if secondary:v['secondaryOfficialAssetUrl']=secondary[0].get('url') or secondary[0].get('path')
  visual[id]=v
 for name,obj in [('CSS',oldcss+'\n'+(ROOT/'ui/dreamlantern.runtime109.css').read_text()+'\n'+(ROOT/'ui/dreamlantern.presentation112.css').read_text()),('LOCAL_POSTERS',{}),('BRAND_BACKGROUND',media['assetBase']+'ui/brand-background.webp'),('VISUAL_OVERRIDE',{'chapters':visual})]:src=constants(src,name,obj)
 # Embed manifests and a presentation factory: media failure cannot delay controller setup.
 anchor=' const W=window.parent,D=W.document;'
 src=src.replace(anchor,anchor+'\n const MEDIA112='+json.dumps(media,ensure_ascii=False)+';\n const DYNAMIC112='+json.dumps(dynamic,ensure_ascii=False)+';\n const FX112='+json.dumps(profiles,ensure_ascii=False)+';\n const mediaLayer=createDreamLanternMedia112(W,MEDIA112,DYNAMIC112,FX112);',1)
 src=(ROOT/'ui/dreamlantern.media112.js').read_text()+'\n'+src
 src=src.replace("||((W.navigator.hardwareConcurrency||8)<=4)","")
 src=src.replace("let page='home',era='ancient',preview=null,replay=false;", "let page='home',era='ancient',preview=null,replay=false,memorySource=null;")
 src=src.replace("preview=id;replay=options.mode", "preview=id;memorySource=options.memoryId||null;replay=options.mode")
 src=src.replace("id==='MEM_ZHUYE'?'A03':id,{mode:'replay',allowEnter:false}", "id==='MEM_ZHUYE'?'A03':id,{mode:'replay',allowEnter:false,memoryId:id==='MEM_ZHUYE'?id:null}")
 src=src.replace('<h2>${esc(c.title)}</h2>', '<h2>${memorySource?"竹业 · 历史观忆":esc(c.title)}</h2>')
 src=src.replace("root.className='dl-root';","root.className='dl-root dl-112';")
 src=src.replace(" function thumb(c){return hasOfficial(c)?resolveAsset(visual(c).officialAssetUrl):resolveAsset(c.thumb)||localArt(c.id);}"," function thumb(c){return mediaLayer.url(mediaLayer.cover(c.id));}")
 src=replace_fn(src,'loadVisualOverrides'," function loadVisualOverrides(){return Promise.resolve();}")
 src=replace_fn(src,'bindThumbs',""" function bindThumbs(){view.querySelectorAll('[data-dl-thumb]').forEach(img=>{
  let stage=0;img.style.objectPosition=MEDIA112.covers.chapters[img.dataset.dlThumb]?.objectPosition||'50% 30%';
  img.onerror=()=>{if(stage++===0)img.src=resolveAsset('ui/brand-background.webp');else if(stage===2)img.src=uri(img.dataset.dlThumb);else img.remove();};
 });}""")
 src=replace_fn(src,'mountMedia'," function mountMedia(host,c){mediaLayer.mountOpening(root,host,c.id,uri(c.id),lowMotion,memorySource);}")
 src=replace_fn(src,'makeFx'," function makeFx(host,c){/* 112 owns the visible FX DOM within its mobile budget. */}")
 src=src.replace("function stopVisual(){dropMedia();", "function stopVisual(){mediaLayer.clear();dropMedia();")
 src=src.replace("link.href=asset('ui/dreamlantern.css')","link.href=asset('ui/dreamlantern.presentation112.css')")
 # The full card cover remains untouched; every runtime bitmap is a remote URL.
 src=src.replace("<p class=\"dl-kicker\">一灯 · 双境</p>","<p class=\"dl-kicker\">苦情树下 · 前世今生</p>")
 # Image itself is a full-size accessible cover button; existing entry/preview actions are retained.
 old='<img class="dl-thumb" data-dl-thumb="${c.id}" loading="lazy" src="${thumb(c)}" alt="${esc(c.title)} · 景窗">'
 new='<button class="dl-cover-action" data-action="preview" data-id="${c.id}" aria-label="展开${esc(c.title)} Opening">'+old+'</button>'
 assert old in src;src=src.replace(old,new)
 src=src.replace("updateChapterBackground();bindThumbs();applyMotion();root.querySelectorAll", "if(page==='doors')mediaLayer.mountEraGate(root,lowMotion);mediaLayer.mountGlobal(root);updateChapterBackground();bindThumbs();applyMotion();root.querySelectorAll")
 src=src.replace("disposed=true;epoch++;stopVisual();music?.dispose();", "disposed=true;epoch++;stopVisual();mediaLayer.dispose();music?.dispose();")
 src=src.replace("function visibility(){root.classList", "function visibility(){mediaLayer.visibility(D.hidden);root.classList")
 # Pausing hidden previews is purely presentational; window hiding never writes state.
 assert original[:original.index('\n(function(){')]==src[src.index('// Pure transaction coordinator.'):src.index('\n(function(){')]
 assert 'data:image/webp;base64,' not in src and 'data:video' not in src
 ui['content']=src
 stem='狐妖小红娘_梦灯笼_正式版_v1.2.0_112候选1'
 write(out/(stem+'.json'),c)
 # Retain original PNG pixel / non-card chunks byte for byte; replace character data only.
 raw=base_png.read_bytes();assert raw[:8]==b'\x89PNG\r\n\x1a\n';result=raw[:8];offset=8;pixel_original=[];pixel_new=[]
 while offset<len(raw):
  size=int.from_bytes(raw[offset:offset+4],'big');typ=raw[offset+4:offset+8];payload=raw[offset+8:offset+8+size];chunk=raw[offset:offset+size+12];offset+=size+12
  if typ==b'tEXt' and payload.split(b'\0',1)[0] in [b'chara',b'ccv3']:continue
  if typ==b'IEND':
   for key in [b'chara',b'ccv3']:
    data=key+b'\0'+base64.b64encode(json.dumps(c,ensure_ascii=False,separators=(',',':')).encode());body=b'tEXt'+data;result+=struct.pack('>I',len(data))+body+struct.pack('>I',zlib.crc32(body)&0xffffffff)
  result+=chunk
 (out/(stem+'.png')).write_bytes(result)
 (out/'dreamlantern-ui.js').write_text(src)
 changes=[]
 def diff(a,b,p=''):
  if type(a)!=type(b):changes.append(p);return
  if isinstance(a,dict):
   for k in a.keys()|b.keys():
    if k not in a or k not in b:changes.append(p+'/'+k)
    else:diff(a[k],b[k],p+'/'+k)
  elif isinstance(a,list):
   if len(a)!=len(b):changes.append(p)
   else:
    for i,(x,y) in enumerate(zip(a,b)):diff(x,y,p+'/'+str(i))
  elif a!=b:changes.append(p)
 diff(base,c)
 expected='/data/extensions/tavern_helper/scripts/4/content';assert changes==[expected],changes
 audit={'baseline':base_json.name,'baselineVersion':'1.2.0','resourceInputCommit':'a76debe5f5d61ea0967fa0dd843eee60c2316f59','mappingInputCommit':media.get('mappingInputCommit'),'cardVersionUnchanged':True,'changedJsonPaths':changes,'worldbookExactEquality':base['data']['character_book']==d['character_book'],'mvuZodStatusMusicExactEquality':base['data']['extensions']['tavern_helper']['scripts'][:4]==scripts[:4],'regexExactEquality':base['data']['extensions']['regex_scripts']==d['extensions']['regex_scripts'],'controllerExactEquality':True,'noRuntimeBitmapBytes':True,'baseJsonSha256':hashlib.sha256(base_json.read_bytes()).hexdigest(),'outputJsonSha256':hashlib.sha256((out/(stem+'.json')).read_bytes()).hexdigest(),'androidStatus':'NOT_EXECUTED_DEVICE_UNAVAILABLE','formalTagCreated':False}
 write(out/'business-diff-audit.json',audit)
 print(json.dumps(audit,ensure_ascii=False,indent=2))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('base_json',type=Path);p.add_argument('base_png',type=Path);p.add_argument('out',type=Path);a=p.parse_args();assemble(a.base_json,a.base_png,a.out)
