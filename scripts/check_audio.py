"""Decode every indexed clip and check signal integrity, bounds and coverage."""
from pathlib import Path
import io, json, math
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
bank=json.loads((ROOT/'voix/index-claire.json').read_text())
old=json.loads((ROOT/'.audio-build/original-index.json').read_text())
assert bank['v']==2 and bank['sampleRate']==24000
assert set(old['clips']) <= set(bank['clips']), 'La banque finale doit couvrir toutes les anciennes entrées.'
packs=[(ROOT/'voix'/name).read_bytes() for name in bank['packs']]
durations=[]; peaks=[]; bad=[]
for key,(pack,offset,size) in bank['clips'].items():
 try:
  assert pack<len(packs) and offset>=0 and size>0 and offset+size<=len(packs[pack])
  data,sr=sf.read(io.BytesIO(packs[pack][offset:offset+size]),dtype='float32')
  assert sr==24000 and data.ndim==1 and len(data)/sr>=.15
  assert np.isfinite(data).all()
  peak=float(np.max(np.abs(data)));rms=float(np.sqrt(np.mean(data**2)))
  assert .002<peak<=1 and rms>.001
  assert float(np.mean(np.abs(data)>.999))<.001
  durations.append(len(data)/sr);peaks.append(peak)
 except Exception as e:bad.append({'key':key,'error':str(e)})
for t in ['a','i','u','ou','chu','ké','jin','chin','fe','pe','be','gue']:
 for b in ['n','m','s']:assert b+'|'+t in bank['clips'],t
result={'clips':len(bank['clips']),'packs':len(packs),'bytes':sum(map(len,packs)),'sampleRate':24000,'allOriginalKeysCovered':True,'decoded':len(durations),'durationMinSeconds':round(min(durations),3),'durationMedianSeconds':round(float(np.median(durations)),3),'durationMaxSeconds':round(max(durations),3),'peakMax':round(max(peaks),4),'failed':bad}
(ROOT/'audit-voix').mkdir(exist_ok=True)
(ROOT/'audit-voix/controle-audio.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False,indent=2))
assert not bad
