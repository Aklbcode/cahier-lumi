"""Append theme prompts and feedback without rebuilding the existing voice bank."""
import asyncio, json, re
import build_natural_voices as voice

def norm(t): return re.sub(r'[.!?…:]+$','',t).strip().casefold()

async def main():
 root=voice.ROOT; path=root/'voix/index-belge.json'; bank=json.loads(path.read_text())
 known={norm(k.split('|',1)[1]):v for k,v in bank['clips'].items() if k.startswith(('n|','m|','s|'))}
 texts=json.loads((root/'audit-voix/phrases-themes-feedback.json').read_text())
 unique={norm(t):t for t in texts if norm(t) not in known}
 pending=[t for t in unique.values() if not voice.path_for(t).exists()]
 sem=asyncio.Semaphore(3)
 done=0
 async def batch(texts):
  nonlocal done
  await voice.generate(texts,sem)
  done+=len(texts)
  print(json.dumps({'generated':done,'total':len(pending)}),flush=True)
 await asyncio.gather(*(batch(pending[start:start+25]) for start in range(0,len(pending),25)))
 packno=len(bank['packs']);offset=0;data=bytearray();added=[];total_bytes=0
 def flush():
  nonlocal packno,offset,data,total_bytes
  if not data:return
  name=f'belge-ajouts-{packno}.mp3';(root/'voix'/name).write_bytes(data)
  bank['packs'].append(name);bank['scopes'].setdefault('feedback',[]).append(packno)
  total_bytes+=len(data);packno+=1;offset=0;data=bytearray()
 for text in unique.values():
  clip=voice.path_for(text).read_bytes()
  if data and len(data)+len(clip)>1500000:flush()
  bank['clips']['n|'+text]=[packno,offset,len(clip)];offset+=len(clip);data.extend(clip);added.append(text)
 flush()
 bank['feedbackPolicy']='Same Charline voice for instructions and feedback; a recorded contextual encouragement replaces unavailable dynamic feedback; no automatic device voice.'
 path.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))
 report=root/'audit-voix/ajouts-personnage.json'
 previous=json.loads(report.read_text()) if report.exists() else {'added':0,'bytes':0,'phrases':[]}
 report.write_text(json.dumps({'added':previous['added']+len(added),'bytes':previous['bytes']+total_bytes,'phrases':previous['phrases']+added},ensure_ascii=False,indent=2))
 print(json.dumps({'complete':True,'added':len(added),'bytes':total_bytes},ensure_ascii=False),flush=True)

asyncio.run(main())
