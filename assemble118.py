"""Incremental 118: sole input is delivered 117 candidate4; intro visibility only."""
from pathlib import Path
import base64,json,struct,zlib,hashlib,subprocess,argparse
R=Path(__file__).resolve().parent
STEM='狐妖小红娘_梦灯笼_正式版_v1.2.0_'
BASE=R/'delivery'/(STEM+'117候选4.json')
PNG=BASE.with_suffix('.png')
OUT=R/'delivery'/(STEM+'118候选5')
BASE_COMMIT='c8258d2589101bb50ec6db6b4fae4c60b31be8a6'
def encoded(c):return (json.dumps(c,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode('utf-8')
def read_chunks(raw):
 assert raw[:8]==b'\x89PNG\r\n\x1a\n';i=8
 while i<len(raw):
  n=struct.unpack('>I',raw[i:i+4])[0];t=raw[i+4:i+8];d=raw[i+8:i+8+n];chunk=raw[i:i+n+12]
  assert len(chunk)==n+12 and zlib.crc32(t+d)&0xffffffff==struct.unpack('>I',chunk[-4:])[0]
  yield t,d,chunk;i+=n+12
 assert i==len(raw)
def unpack(raw):
 return {d.partition(b'\0')[0].decode():json.loads(base64.b64decode(d.partition(b'\0')[2],validate=True).decode('utf-8')) for t,d,_ in read_chunks(raw) if t==b'tEXt' and d.partition(b'\0')[0] in (b'chara',b'ccv3')}
def card():
 b=json.loads(BASE.read_bytes().decode('utf-8'));embed=unpack(PNG.read_bytes());assert embed['chara']==embed['ccv3']==b
 assert BASE.read_bytes()==subprocess.check_output(['git','show',BASE_COMMIT+':'+str(BASE.relative_to(R))],cwd=R)
 c=json.loads(json.dumps(b));old=b['data']['extensions']['tavern_helper']['scripts'][4]['content'];new=(R/'source/script-4.js').read_text()
 assert old==subprocess.check_output(['git','show',BASE_COMMIT+':source/script-4.js'],cwd=R).decode()
 marker='// Pure transaction coordinator.'
 assert old[old.index(marker):old.index('\n(function(){')]==new[new.index(marker):new.index('\n(function(){')]
 import re
 for constant in ('MEDIA112','CH','DYNAMIC112','PROFILES112'):
  a=re.search(r'^ const '+constant+r'=(.*);$',old,re.M);z=re.search(r'^ const '+constant+r'=(.*);$',new,re.M)
  assert (a[1] if a else None)==(z[1] if z else None)
 assert old[old.index('  function mountEraGate('):old.index('  function dispose(')]==new[new.index('  function mountEraGate('):new.index('  function dispose(')]
 assert old[old.index(' function enhanceIntro('):]==new[new.index(' function enhanceIntro('):]
 assert old[old.index('  function soundLabel('):old.index('  function mountIntro(')]==new[new.index('  function soundLabel('):new.index('  function mountIntro(')]
 c['data']['extensions']['tavern_helper']['scripts'][4]['content']=new
 probe=json.loads(json.dumps(c));probe['data']['extensions']['tavern_helper']['scripts'][4]['content']=old;assert probe==b
 assert c['data']['character_version']=='1.2.0'
 return c,{'baselineCommit':BASE_COMMIT,'baseline':BASE.name,'changedPaths':['/data/extensions/tavern_helper/scripts/4/content'],'allOtherFieldsExactEquality':True,'transactionCoordinatorExactEquality':True,'mediaManifestAndChapterMappingExactEquality':True,'eraOpeningAndVisibilityFunctionsExactEquality':True,'introSoundLogicExactEquality':True,'enhanceIntroAndAllBusinessHandlersExactEquality':True,'cardVersion':'1.2.0','androidSillyTavernDevice':'NOT_EXECUTED_DEVICE_UNAVAILABLE'}
def main(stage):
 c,audit=card()
 if stage=='audit':
  (R/'qa/118-business-audit.json').write_bytes(encoded(audit));print(json.dumps(audit,ensure_ascii=False));return
 jp=Path(str(OUT)+'.json');pp=Path(str(OUT)+'.png')
 if stage=='json':
  jp.write_bytes(encoded(c));assert json.loads(jp.read_bytes().decode('utf-8',errors='strict'))==c
  print('PASS: strict UTF-8, JSON parse, exact intended card equality');return
 assert json.loads(jp.read_bytes().decode('utf-8',errors='strict'))==c
 source=PNG.read_bytes();out=source[:8]
 for t,d,chunk in read_chunks(source):
  if t==b'tEXt' and d.partition(b'\0')[0] in (b'chara',b'ccv3'):continue
  if t==b'IEND':
   for key in (b'chara',b'ccv3'):
    payload=key+b'\0'+base64.b64encode(json.dumps(c,ensure_ascii=False,separators=(',',':')).encode('utf-8'));body=b'tEXt'+payload
    out+=struct.pack('>I',len(payload))+body+struct.pack('>I',zlib.crc32(body)&0xffffffff)
  out+=chunk
 pp.write_bytes(out);data=unpack(pp.read_bytes());assert data['chara']==data['ccv3']==c
 keep=lambda raw:[chunk for t,d,chunk in read_chunks(raw) if not(t==b'tEXt' and d.partition(b'\0')[0] in (b'chara',b'ccv3'))]
 assert keep(source)==keep(out)
 print('PASS: PNG CRC, chara/ccv3/UTF-8 JSON exact equality, all image/non-card chunks unchanged')
 print('JSON sha256',hashlib.sha256(jp.read_bytes()).hexdigest(),'PNG sha256',hashlib.sha256(out).hexdigest())
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('stage',choices=['audit','json','png']);main(p.parse_args().stage)
