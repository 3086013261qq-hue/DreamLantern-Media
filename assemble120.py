"""120: patch only the mini entry in delivered 119 candidate6; preserve PNG pixels."""
from pathlib import Path
import json,base64,struct,zlib,hashlib,argparse,subprocess
from assemble119 import encoded,read_chunks,unpack
R=Path(__file__).resolve().parent
BASE_COMMIT='522dfb758cd5d6e4f6f674dca6da69f10408a3f7'
BASE=R/'delivery/狐妖小红娘_梦灯笼_正式版_v1.2.0_119候选6.json'
OUT=R/'delivery/狐妖小红娘_梦灯笼_正式版_v1.2.0_120候选7'
def card():
 b=json.loads(BASE.read_bytes());assert unpack(BASE.with_suffix('.png').read_bytes())=={'chara':b,'ccv3':b}
 assert BASE.read_bytes()==subprocess.check_output(['git','show',BASE_COMMIT+':'+str(BASE.relative_to(R))],cwd=R)
 old=b['data']['extensions']['tavern_helper']['scripts'][4]['content'];new=(R/'source/script-4.js').read_text()
 assert old==subprocess.check_output(['git','show',BASE_COMMIT+':source/script-4.js'],cwd=R).decode()
 # Exactly two source lines may differ: delegated entry admission and mini creation.
 a=old.splitlines();z=new.splitlines();assert len(a)==len(z)
 diff=[(x,y) for x,y in zip(a,z) if x!=y];assert len(diff)==2
 assert diff[0][0].startswith(' function click(e)') and diff[1][0].startswith('  const box=D.querySelector(`#chat > .mes[mesid=')
 assert diff[0][1]==diff[0][0].replace("b.closest('.dl-intro')", "b.closest('.dl-intro')||b.matches('.dl-mini[data-action=\"open\"]')")
 assert "D.createElement('button')" in diff[1][1] and "bar.dataset.action='open'" in diff[1][1]
 c=json.loads(json.dumps(b));c['data']['extensions']['tavern_helper']['scripts'][4]['content']=new
 probe=json.loads(json.dumps(c));probe['data']['extensions']['tavern_helper']['scripts'][4]['content']=old;assert probe==b
 audit={'baselineCommit':BASE_COMMIT,'baseline':BASE.name,'changedCardPaths':['/data/extensions/tavern_helper/scripts/4/content'],'changedSourceLines':2,'allOtherCardFieldsExactEquality':True,'worldbookAndAliasesExactEquality':True,'mediaAndCssExactEquality':True,'openCloseAndBusinessHandlersExactEquality':True,'refreshLifecycleExactEquality':True,'miniUsesExistingDelegatedOpen':True,'newRefreshListeners':0,'androidSillyTavernDevice':'NOT_EXECUTED_DEVICE_UNAVAILABLE'}
 return c,audit
def main(stage):
 c,a=card();jp=Path(str(OUT)+'.json');pp=Path(str(OUT)+'.png')
 if stage=='audit':(R/'qa/120-business-audit.json').write_bytes(encoded(a));print(json.dumps(a));return
 if stage=='json':jp.write_bytes(encoded(c));assert json.loads(jp.read_bytes())==c;print('PASS candidate7 JSON');return
 assert json.loads(jp.read_bytes())==c
 raw=BASE.with_suffix('.png').read_bytes();out=raw[:8]
 for t,d,chunk in read_chunks(raw):
  if t==b'tEXt' and d.partition(b'\0')[0] in (b'chara',b'ccv3'):continue
  if t==b'IEND':
   for key in (b'chara',b'ccv3'):
    payload=key+b'\0'+base64.b64encode(json.dumps(c,ensure_ascii=False,separators=(',',':')).encode());body=b'tEXt'+payload
    out+=struct.pack('>I',len(payload))+body+struct.pack('>I',zlib.crc32(body)&0xffffffff)
  out+=chunk
 pp.write_bytes(out);assert unpack(out)=={'chara':c,'ccv3':c}
 keep=lambda r:[chunk for t,d,chunk in read_chunks(r) if not(t==b'tEXt' and d.partition(b'\0')[0] in (b'chara',b'ccv3'))]
 assert keep(raw)==keep(out)
 v={'jsonSha256':hashlib.sha256(jp.read_bytes()).hexdigest(),'pngSha256':hashlib.sha256(out).hexdigest(),'strictUtf8':True,'pngCrc':True,'charaCcv3JsonExactEquality':True,'imageAndNonCardChunksExactEquality':True}
 (R/'qa/120-package-validation.json').write_bytes(encoded(v));print(json.dumps(v))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('stage',choices=['audit','json','png']);main(p.parse_args().stage)
