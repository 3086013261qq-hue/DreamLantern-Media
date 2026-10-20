"""Package reproducible text sources + deliverables; exclude hosted bitmap/video payloads."""
from pathlib import Path
import json,zipfile,hashlib
ROOT=Path(__file__).resolve().parent.parent
out=ROOT/'delivery'/'DreamLantern_v1.2.0_112_candidate1_project.zip'
files=[]
for p in ROOT.rglob('*'):
 rel=p.relative_to(ROOT)
 if not p.is_file() or any(x in rel.parts for x in ['.git','__pycache__','incoming']):continue
 if p.suffix.lower() in ['.mp4','.jpg','.jpeg','.webp','.zip','.pyc']:continue
 if p.name in ['harness.html','test-run.log']:continue
 # Retain only final card PNG and labelled QA screenshots, no remote runtime bitmap bundles.
 if p.suffix.lower()=='.png' and rel.parts[0] not in ['delivery','qa']:continue
 files.append(p)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):z.write(p,p.relative_to(ROOT))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert not any(Path(n).suffix.lower() in ['.mp4','.jpg','.jpeg','.webp'] for n in z.namelist())
print(json.dumps({'path':str(out),'fileCount':len(files),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},indent=2))
