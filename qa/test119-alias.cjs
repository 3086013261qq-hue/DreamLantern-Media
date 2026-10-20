const fs=require('fs'),assert=require('assert');
const audit=JSON.parse(fs.readFileSync('qa/119-character-alias-audit.json'));
const book=JSON.parse(fs.readFileSync('source/character-book.json'));
let tests=0,compiled=0;
const check=(ok)=>{assert(ok);tests++;};
for(const entry of audit.entries){
 const e=book.entries[entry.index];check(e.keys.length===1&&e.selective===true&&!e.constant&&e.use_regex&&e.position==='after_char'&&e.extensions.probability===100);
 const key=e.keys[0],end=key.lastIndexOf('/');let re=new RegExp(key.slice(1,end),key.slice(end+1));compiled++;
 for(const alias of entry.aliases){check(re.test('<story_scene>\n登场：'+alias+'\n</story_scene>'));check(!re.test('在标签外遇见'+alias));check(!re.test('<story_scene>众人交谈。</story_scene> 外面是'+alias));check(!re.test('<story_scene>王 妖 狐 姐姐 长老 家主 道士</story_scene>'));}
}
const guyi=audit.entries.find(e=>e.entry==='角色:极北萨摩王故义');check(guyi.aliases.includes('故义')&&guyi.aliases.includes('极北萨摩王'));
check(audit.sameCharacterConsistency&&audit.broadAliasCount===0);
const result={regexCompilePassRate:compiled/audit.entries.length,compiledRegexCount:compiled,assertions:tests,fullNamesAndEveryAliasHit:true,outsideSceneNegative:true,broadWordsNegative:true,sameCharacterConsistency:true};
Object.assign(audit,{regexCompilePassRate:result.regexCompilePassRate,regexCompileCount:compiled,triggerTests:result});fs.writeFileSync('qa/119-character-alias-audit.json',JSON.stringify(audit,null,2)+'\n');console.log(result);
