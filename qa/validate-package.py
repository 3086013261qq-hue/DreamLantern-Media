from pathlib import Path
import json,base64,zlib,argparse
p=argparse.ArgumentParser();p.add_argument('base_png',type=Path);a=p.parse_args()
out=Path('delivery');c=json.loads(next(out.glob('*候选1.json')).read_text());raw=next(out.glob('*.png')).read_bytes();base=a.base_png.read_bytes()
def chunks(raw):
 i=8
 while i<len(raw):
  n=int.from_bytes(raw[i:i+4],'big');typ=raw[i+4:i+8];data=raw[i+8:i+8+n]
  assert zlib.crc32(typ+data)&0xffffffff==int.from_bytes(raw[i+8+n:i+12+n],'big')
  yield typ,data;i+=n+12
iscard=lambda t,d:t==b'tEXt' and d.split(b'\0',1)[0] in (b'chara',b'ccv3')
cards={d.split(b'\0',1)[0].decode():json.loads(base64.b64decode(d.split(b'\0',1)[1])) for t,d in chunks(raw) if iscard(t,d)}
noncard=lambda raw:[(t,d) for t,d in chunks(raw) if not iscard(t,d)]
r={'PNG_data_matches_JSON':all(v==c for v in cards.values()),'cardKeys':list(cards),'original_noncard_chunks_unchanged':noncard(raw)==noncard(base),'json_bytes':next(out.glob('*候选1.json')).stat().st_size,'png_bytes':len(raw),'character_version':c['data']['character_version']}
assert r['PNG_data_matches_JSON'] and r['original_noncard_chunks_unchanged']
Path('qa/package-validation.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
p=Path('source');p.mkdir(exist_ok=True)
for i,x in enumerate(c['data']['extensions']['tavern_helper']['scripts']):(p/f'script-{i}.js').write_text(x['content'])
for i,x in enumerate(c['data']['extensions']['regex_scripts']):(p/f'regex-{i}.json').write_text(json.dumps(x,ensure_ascii=False,indent=2))
(p/'character-book.json').write_text(json.dumps(c['data']['character_book'],ensure_ascii=False,indent=2))
print(json.dumps(r,ensure_ascii=False))
