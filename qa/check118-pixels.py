from PIL import Image,ImageChops
import json
from pathlib import Path
r=Path(__file__).resolve().parent
imgs=[Image.open(r/p).convert('RGB') for p in ['118-browser-intro-390.png','118-intro-poison-poster.png','118-intro-video-hidden-control.png']]
def delta(a,b):
 ps=list(ImageChops.difference(a,b).getdata());return {'changedPixels':sum(max(p)>8 for p in ps),'meanChannelDelta':sum(sum(p) for p in ps)/(len(ps)*3)}
a=delta(imgs[0],imgs[1]);b=delta(imgs[1],imgs[2]);result={'poisonPosterDelta':a,'hiddenVideoControlDelta':b};print(json.dumps(result));assert a['changedPixels']==0;assert b['changedPixels']>10000 and b['meanChannelDelta']>3
