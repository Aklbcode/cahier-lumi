"""Split the new game voice pack on indexed clip boundaries; preserve every byte."""
from pathlib import Path
import json, hashlib
root=Path(__file__).resolve().parents[1];p=root/'voix/index-belge.json';bank=json.loads(p.read_text());index=157;limit=1500000
name=bank['packs'][index];raw=(root/'voix'/name).read_bytes()
if len(raw)<=limit: print('Already split');raise SystemExit
(root/'.audio-build'/name).write_bytes(raw)
entries={tuple(v) for v in bank['clips'].values() if v[0]==index};mapping={};data=bytearray();chunks=[];current=index
for old in sorted(entries,key=lambda v:v[1]):
 _,offset,size=old
 if data and len(data)+size>limit:
  chunks.append((current,bytes(data)));data=bytearray();current=len(bank['packs']);bank['packs'].append(f'belge-jeux-{current}.mp3');bank['scopes']['feedback'].append(current)
 mapping[old]=[current,len(data),size];data.extend(raw[offset:offset+size])
chunks.append((current,bytes(data)))
for key,v in list(bank['clips'].items()):
 if tuple(v) in mapping:bank['clips'][key]=mapping[tuple(v)]
for idx,chunk in chunks:(root/'voix'/bank['packs'][idx]).write_bytes(chunk)
p.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'originalBytes':len(raw),'packs':len(chunks),'largest':max(len(d) for _,d in chunks),'preserved':sum(len(d) for _,d in chunks)==len(raw)}))
