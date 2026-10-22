"""Build static French-Belgian Charline recordings. No runtime TTS or child data.

Requires edge-tts==7.3.1, numpy and imageio-ffmpeg. Generation sends only the
public application strings to Microsoft's online voice service. Word boundaries
are checked against every source character before batch audio is separated.
This is signal/coverage validation, not a human phonetic certification.
"""
from __future__ import annotations
import argparse, asyncio, hashlib, io, json, re, subprocess, time, unicodedata
from pathlib import Path
import edge_tts, imageio_ffmpeg, numpy as np

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.audio-build/charline-v1'
VOICE='fr-BE-CharlineNeural'
RATE='-5%'
FF=imageio_ffmpeg.get_ffmpeg_exe()
PHONEMES={'a':'a','i':'i','o':'eau','u':'u','é':'é','e':'e','ou':'houx','on':'on','an':'an','oi':'oie','in':'hein','è':'haie','eu':'eux'}
EXTRA=[
 'Écoute le son','comme dans ami','comme dans loup',
 'Écoute. Regarde les images. Puis choisis ta réponse.',
 'Cinq plus trois, cela fait huit.',
 'Écoute bien. Le son que tu vas entendre est celui de la lettre.',
 'Le son ne se charge pas. Touche le haut-parleur pour réessayer.',
]

def compact(s):
 return ''.join(c for c in unicodedata.normalize('NFKC',s).casefold() if c.isalnum())
def path_for(text):
 return CACHE/(hashlib.sha256((VOICE+'|'+RATE+'|v1|'+text).encode()).hexdigest()+'.mp3')
def speech_text(text):
 s=text.strip().strip('«»“”').strip()
 return s if s[-1:] in '.!?…' else s+'.'

def encode(wave):
 if len(wave)<2400 or not np.isfinite(wave).all(): raise ValueError('Invalid/short waveform')
 peak=float(np.max(np.abs(wave)))
 if peak<.002: raise ValueError('Silent waveform')
 # Keep all consonant attacks and vowel tails. No pitch shift or artificial
 # vowel stretching. Only a fixed ceiling and silence outside the utterance.
 wave=wave*min(1.15,.89/peak)
 wave=np.pad(wave,(1440,2400)).astype('float32')
 return subprocess.run([FF,'-v','error','-f','f32le','-ar','24000','-ac','1','-i','pipe:0','-c:a','libmp3lame','-b:a','80k','-write_xing','0','-id3v2_version','0','-f','mp3','pipe:1'],input=wave.tobytes(),capture_output=True,check=True).stdout

def separate(texts,raw,events):
 pcm=subprocess.run([FF,'-v','error','-i','pipe:0','-f','f32le','-ar','24000','-ac','1','pipe:1'],input=raw,capture_output=True,check=True).stdout
 wave=np.frombuffer(pcm,dtype='float32')
 expected=''.join(compact(s) for s in texts)
 actual=''.join(compact(e['text']) for e in events)
 if actual!=expected: raise ValueError('Word-boundary/source mismatch: '+repr((expected[:160],actual[:160])))
 ranges=[]; end=0
 for e in events:
  n=len(compact(e['text'])); ranges.append((end,end+n,e)); end+=n
 cursor=0; out=[]
 for text in texts:
  stop=cursor+len(compact(text)); own=[e for a,b,e in ranges if a>=cursor and b<=stop and b>a]
  if not own or any(a<stop<b or a<cursor<b for a,b,e in ranges): raise ValueError('Boundary crosses an utterance')
  start=own[0]['offset']/1e7; finish=(own[-1]['offset']+own[-1]['duration'])/1e7
  previous=[(e['offset']+e['duration'])/1e7 for a,b,e in ranges if b<=cursor]
  following=[e['offset']/1e7 for a,b,e in ranges if a>=stop]
  lo=max(0,start-.10, (previous[-1]+start)/2 if previous else 0)
  hi=min(len(wave)/24000,finish+.18,(finish+following[0])/2 if following else len(wave)/24000)
  data=encode(wave[round(lo*24000):round(hi*24000)])
  out.append((text,data,{'start':round(lo,4),'end':round(hi,4),'words':len(own)})); cursor=stop
 return out

async def generate(texts,sem):
 async with sem:
  last=None
  for attempt in range(5):
   try:
    audio=bytearray(); events=[]
    async for event in edge_tts.Communicate('\n'.join(speech_text(t) for t in texts),VOICE,rate=RATE,boundary='WordBoundary',connect_timeout=15,receive_timeout=90).stream():
     if event['type']=='audio':audio.extend(event['data'])
     elif event['type']=='WordBoundary':events.append(event)
    if not audio: raise ValueError('Empty response')
    separated=await asyncio.to_thread(separate,texts,bytes(audio),events)
    for text,data,bounds in separated:
     p=path_for(text); p.write_bytes(data); p.with_suffix('.json').write_text(json.dumps({'voice':VOICE,'rate':RATE,'source':text,'checkedBoundaries':bounds},ensure_ascii=False))
    return len(texts)
   except ValueError as exc:
    last=exc
    if len(texts)>1:
     # Retry an unalignable batch as individual utterances. Never associate an
     # unverified neighbouring word with a teaching sound.
     break
   except Exception as exc:last=exc
   await asyncio.sleep(min(12,2**attempt))
 if len(texts)>1:
  return sum(await asyncio.gather(*(generate([text],sem) for text in texts)))
 raise RuntimeError(f'Voice generation failed for {texts[0]!r}: {last}')

def inventory():
 bank=json.loads((ROOT/'voix/index-claire.json').read_text())
 entries={k:k.split('|',1)[1] for k in bank['clips']}
 for text in EXTRA:
  for b in ['n','m','s']:entries[b+'|'+text]=text
 # Typed sound keys cannot accidentally resolve to a letter name or to a
 # device voice. Short syllables have an independent identity too.
 for k,text in PHONEMES.items():entries['ph|'+k]=text
 syllables=json.loads((ROOT/'audit-voix/syllabes-phonetics.json').read_text())
 for text in list(set(entries.values())):
  if len(text)<=20:entries['sy|'+text]=text
 return bank,entries

def pack(bank,entries,complete=True):
 clips={}; packs=[]; scopes={}; handles={}; sizes={}; offsets={}
 def scope(k):
  if k.startswith(('ph|','sy|')):return 'sons'
  old=bank['clips'].get(k)
  return bank['packs'][old[0]].split('-')[1] if old else 'ui'
 try:
  for key,text in sorted(entries.items(),key=lambda x:(0 if x[0].startswith(('ph|','sy|')) else 1,scope(x[0]),x[0])):
   if text in offsets:clips[key]=offsets[text];continue
   data=path_for(text).read_bytes(); sc=scope(key)
   if sc not in handles or sizes[sc]+len(data)>1_200_000:
    if sc in handles:handles[sc][1].close()
    idx=len(packs);name=f'belge-{sc}-{len(scopes.get(sc,[]))}.mp3';packs.append(name);scopes.setdefault(sc,[]).append(idx)
    handles[sc]=(idx,(ROOT/'voix'/name).open('wb'));sizes[sc]=0
   idx,f=handles[sc];entry=[idx,sizes[sc],len(data)];f.write(data);sizes[sc]+=len(data);clips[key]=offsets[text]=entry
 finally:
  for _,f in handles.values():f.close()
 result={'v':3,'complete':complete,'voice':VOICE,'label':'Lumi · français de Belgique · voix féminine naturelle','sampleRate':24000,'generatedAt':'2026-10-22','baseSpeed':.95,'clips':clips,'packs':packs,'scopes':scopes,'order':{w:scopes.get('ui',[])+scopes.get(w,[]) for w in ['petits','grands']},'phonemes':PHONEMES,'source':'Microsoft online neural voice; static pre-recording; no runtime requests to the voice service.'}
 (ROOT/'voix/index-belge.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
 return {'clips':len(clips),'unique':len(offsets),'packs':len(packs),'bytes':sum((ROOT/'voix'/p).stat().st_size for p in packs)}

async def main():
 p=argparse.ArgumentParser();p.add_argument('--limit',type=int,default=0);p.add_argument('--pack-only',action='store_true');p.add_argument('--preview-ready',action='store_true');p.add_argument('--workers',type=int,default=6);a=p.parse_args()
 CACHE.mkdir(parents=True,exist_ok=True);bank,entries=inventory();texts=list(dict.fromkeys(list(PHONEMES.values())+EXTRA+list(entries.values())))
 if a.preview_ready:
  ready={k:t for k,t in entries.items() if path_for(t).exists()}
  print(json.dumps({'previewOnly':True,**pack(bank,ready,complete=False)}));return
 pending=[t for t in texts if not path_for(t).exists()]
 if a.limit:pending=pending[:a.limit]
 if not a.pack_only:
  batches=[];batch=[];size=0
  for t in pending:
   n=len(speech_text(t).encode())+1
   if batch and (size+n>2700 or len(batch)>=35):batches.append(batch);batch=[];size=0
   batch.append(t);size+=n
  if batch:batches.append(batch)
  sem=asyncio.Semaphore(max(1,min(6,a.workers)));done=len(texts)-len(pending);start=time.monotonic()
  for task in asyncio.as_completed([generate(b,sem) for b in batches]):
   done+=await task;status={'done':done,'total':len(texts),'seconds':round(time.monotonic()-start)}
   (CACHE/'progress.json').write_text(json.dumps(status));print(json.dumps(status),flush=True)
 if not a.limit:
  missing=[t for t in texts if not path_for(t).exists()]
  if missing:raise RuntimeError(f'{len(missing)} recordings missing')
  print(json.dumps({'complete':True,**pack(bank,entries)}),flush=True)

if __name__=='__main__':asyncio.run(main())
