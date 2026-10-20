"""Use candidate1 business/music mocks with the current, audited 115 UI source."""
from pathlib import Path
import json,runpy
R=Path(__file__).resolve().parent.parent
runpy.run_path(str(R/'qa/make-harness.py'))
c=json.loads(next((R/'delivery').glob('*112候选1.json')).read_text())
old=c['data']['extensions']['tavern_helper']['scripts'][4]['content'].replace('</script','<\\/script')
p=R/'qa/harness.html';s=p.read_text();assert old in s
p.write_text(s.replace(old,(R/'source/script-4.js').read_text().replace('</script','<\\/script')))
