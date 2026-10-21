// Run inherited 119 browser checks against current source, retaining distinct 120 reports.
const fs=require('fs'),{spawnSync}=require('child_process');
for(const file of ['qa/test119.cjs','qa/test119-lifecycle.cjs','qa/test119-intro-sound.cjs']){
 const src=fs.readFileSync(file,'utf8').replaceAll('qa/119-','qa/120-regression119-');
 const result=spawnSync(process.execPath,['-e',src],{stdio:'inherit',env:process.env});
 if(result.status!==0)process.exit(result.status||1);
}
