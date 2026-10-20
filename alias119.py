"""Audited character recall groups from 118 candidate5 only; no content/permission edits."""
from pathlib import Path
import copy,json,re
R=Path(__file__).resolve().parent
BASE=R/'delivery/狐妖小红娘_梦灯笼_正式版_v1.2.0_118候选5.json'
ADDITIONS={
 '涂山雅雅':['雅雅'],'涂山容容':['容容','千面妖容'],'涂山红红':['红红','妖仙姐姐'],
 '涂山苏苏':['苏苏'],'白月初':['道士哥哥'],'欢都擎天':['毒皇','万毒之王'],
 '欢都落兰':['落兰'],'阿克占·布泰':['布泰'],'王权富贵':['道门兵人'],
 '六耳猕猴':['六耳'],'黑狐左使':['左使'],'月映丽城':['小丽'],
 '樊七手':['梵七手'],'赤须火龙赤雷':['赤须火龙'],
 '极北萨摩王故义':['故义','极北萨摩王'],
}
BROAD={'王','妖','狐','姐姐','长老','家主','道士','公主','二小姐','少爷','小狐狸'}
def label(x):return x.get('comment',x.get('name',''))
def aliases(x):
 keys=x.get('keys',[])
 if len(keys)==1 and '<story_scene>' in keys[0]:return re.search(r'\((.*?)\)',keys[0])[1].split('|')
 return []
def regex(aa):return '/<story_scene>.*?('+'|'.join(re.escape(a) for a in aa)+').*?<\\/story_scene>/s'
def build():
 b=json.loads(BASE.read_text());book=copy.deepcopy(b['data']['character_book']);entries=book['entries'];roles={label(x)[3:]:x for x in entries if label(x).startswith('角色:')}
 groups={n:list(dict.fromkeys([n]+aliases(x))) for n,x in roles.items()}
 # Union only dedicated same-character entries; relationship/identity supplements keep their union semantics.
 for x in entries:
  name=label(x).removeprefix('核心设定:').split('·')[0]
  if label(x).startswith('核心设定:') and name in groups and '<story_scene>' in ''.join(x.get('keys',[])):
   groups[name]=list(dict.fromkeys(groups[name]+aliases(x)))
 evidence={}
 for name,aa in ADDITIONS.items():
  for a in aa:
   # Require independent spelling, not a substring produced by slicing a formal name.
   hits=[]
   for x in entries:
    text=x.get('content','').replace(name,'');m=re.search('.{0,30}'+re.escape(a)+'.{0,50}',text)
    if m:hits.append({'entry':label(x),'quote':m[0]})
   assert hits,(name,a)
   # Own text/ability evidence first; otherwise a canonical timeline/dialogue snippet.
   hits.sort(key=lambda h:0 if h['entry'] in ('角色:'+name,'核心设定:'+name+'·能力') else 1)
   evidence[name+' / '+a]=hits[:2];groups[name].append(a)
 for n in groups:groups[n]=list(dict.fromkeys(groups[n]));assert not BROAD.intersection(groups[n])
 changes=[];associated=[]
 for i,x in enumerate(entries):
  title=label(x);isrole=title.startswith('角色:');oldaa=aliases(x)
  if not isrole and not oldaa:continue
  owner=title.removeprefix('角色:').removeprefix('核心设定:').split('·')[0]
  if owner in groups:aa=groups[owner]
  else:
   # Mixed identity/bio entries: retain every original trigger, expand only its explicit character groups.
   aa=list(dict.fromkeys(a for a0 in oldaa for a in groups.get(a0,[a0])))
  old=copy.deepcopy(x)
  x.update(keys=[regex(aa)],constant=False,selective=True,use_regex=True,position='after_char')
  assert x['extensions']['probability']==100
  probe=copy.deepcopy(x)
  for field in ('keys','constant','selective','use_regex','position'):probe[field]=old[field]
  assert probe==old
  if x!=old:changes.append(i)
  associated.append({'index':i,'entry':title,'owner':owner,'aliases':aa,'regex':x['keys'][0],'characterBody':isrole,'sameCharacterConsistency':owner not in groups or x['keys']==[regex(groups[owner])]})
 # Single long descriptors without a supported distinct personal name are documented exceptions.
 exceptions=[]
 for n,aa in groups.items():
  if len(aa)==1 and len(aa[0])>=5:
   exceptions.append({'character':n,'reason':'角色正文及现有关键词未提供独立简称；保留既有专名，不机械截断或使用泛称。'})
 report={'baseline':BASE.name,'characterBodyCount':len(roles),'characterBodyStorySceneRegexCount':len(roles),'scannedCharacterAndAssociatedEntryCount':len(associated),'storySceneRegexCount':len(associated),'changedEntryCount':len(changes),'changedEntryIndices':changes,'singleLongAliasExceptions':exceptions,'suspiciousSingleLongWithoutExceptionCount':0,'broadAliasCount':0,'sameCharacterConsistency':all(x['sameCharacterConsistency'] for x in associated),'characters':[{'character':n,'aliasCount':len(aa),'aliases':aa,'review':'existing sanctioned aliases + independently evidenced additions; no invented abbreviations'} for n,aa in groups.items()],'entries':associated,'addedAliasEvidence':evidence,'excludedCandidates':{'月初':'东方月初/白月初/平丘月初重名歧义','富贵':'王权富贵/王富贵重名歧义','二小姐':'六耳/秦兰头衔重叠','小狐狸':'通用种族称呼','萨摩王':'未找到独立于极北萨摩王的用例，不机械拆词','孤月':'未找到独立简称用例','黑狐娘娘':'分身/借体/本体身份专题已有联合召回；不将其强制等同凤牺人物专名'},'contentsEnabledDepthPermissionsUnchanged':True}
 return book,report
if __name__=='__main__':
 book,report=build();(R/'source/character-book.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n');(R/'qa/119-character-alias-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:report[k] for k in ('characterBodyCount','scannedCharacterAndAssociatedEntryCount','changedEntryCount','singleLongAliasExceptions','broadAliasCount','sameCharacterConsistency')},ensure_ascii=False))
