"""Rebuild the French recordings locally; no child data or remote TTS service.

Python 3.12: pip install kokoro-onnx==0.6.1 soundfile imageio-ffmpeg
Model: thewh1teagle/kokoro-onnx model-files-v1.1 / Kokoro-82M v1.0.
The model and voice weights are supplied explicitly and never shipped to browsers.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, io, json, os, subprocess, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.audio-build'
PHONETICS = {'a': 'a', 'i': 'i', 'o': 'o', 'u': 'y', 'é': 'e', 'è': 'ɛ', 'euh': 'ə', 'ou': 'u', 'on': 'ɔ̃', 'an': 'ɑ̃', 'hein': 'ɛ̃', 'eux': 'ø', 'oie': 'wa', 'chu': 'ʃy', 'ké': 'ke', 'jin': 'ʒɛ̃', 'chin': 'ʃɛ̃', 'le':'lə','re':'ʁə','me':'mə','se':'sə','fe':'fə','che':'ʃə','ve':'və','ne':'nə','je':'ʒə','pe':'pə','te':'tə','de':'də','be':'bə','gue':'ɡə','cheval':'ʃəvˈal','renard':'ʁənˈaʁ','melon':'məlˈɔ̃','biberon':'bibəʁˈɔ̃','requin':'ʁəkˈɛ̃'}
EXTRA = [
 'Bonjour ! Je suis Lumi.', 'Écoute bien. Nous allons apprendre ensemble.',
 'Bonjour, je suis Lumi. On apprend ensemble ?', 'Voici ma vitesse.', 'Voici ma voix.',
 'Écoute le son', 'comme dans loup.', 'Touche la syllabe',
 'Je parle doucement, avec des pauses. À toi de jouer !',
 'Cinq plus trois, cela fait huit.', 'Touche le mot qui commence comme maman.',
 'Repasse sur la lettre avec ton doigt.', 'Écoute. Regarde les images. Puis choisis ta réponse.',
 'La voix est prête.', 'a', 'i', 'o', 'u', 'é', 'è', 'ou', 'on', 'an', 'euh', 'hein', 'eux', 'oie', 'chu', 'ké', 'jin', 'chin',
]

SYLLABLES_FILE=ROOT/'audit-voix/syllabes-phonetics.json'
if SYLLABLES_FILE.exists(): PHONETICS.update(json.loads(SYLLABLES_FILE.read_text()))

def setup(model, voices, threads):
 global K, NP, SF, FFMPEG
 import numpy as np, soundfile as sf, imageio_ffmpeg, onnxruntime as rt
 from kokoro_onnx import Kokoro
 rt.disable_telemetry_events()
 options = rt.SessionOptions(); options.intra_op_num_threads = threads; options.inter_op_num_threads = 1
 options.enable_mem_pattern = False
 session = rt.InferenceSession(model, sess_options=options, providers=['CPUExecutionProvider'])
 session.disable_telemetry_events() if hasattr(session, 'disable_telemetry_events') else None
 K = Kokoro.from_session(session, voices); NP = np; SF = sf; FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def cache_path(key):
 text=key.split('|',1)[1]
 ph=PHONETICS.get(text.strip().rstrip('.!?')) if len(text)<8 else None
 signature='kokoro-v2-fp32-ff_siwis|'+key+('|ipa='+ph if ph else '')
 return CACHE/(hashlib.sha256(signature.encode()).hexdigest()+'.mp3')

def synth(job):
 key, text, speed = job
 file = cache_path(key)
 if file.exists(): return key, str(file)
 ph = PHONETICS.get(text.strip().rstrip('.!?')) if len(text) < 8 else None
 if ph and K.tokenizer.known(ph)!=ph: raise ValueError('Unsupported phonetic symbol: '+ph)
 audio, sr = K.create((ph + '.') if ph else text, voice='ff_siwis', speed=speed, lang='fr-fr', is_phonemes=bool(ph), trim=False, sentence_pause=.30, clause_pause=.14)
 audio = NP.asarray(audio, dtype=NP.float32)
 if not len(audio) or not NP.isfinite(audio).all(): raise ValueError('Invalid audio: '+key)
 # Keep weak word endings and unvoiced consonants; trim only long near-silence.
 frame = max(1, int(sr*.01)); rms = NP.array([NP.sqrt(NP.mean(audio[i:i+frame]**2)) for i in range(0,len(audio),frame)])
 active = NP.flatnonzero(rms > max(.00025, float(rms.max())*.006))
 if len(active): audio = audio[max(0,int(active[0]*frame-sr*.09)):min(len(audio),int((active[-1]+1)*frame+sr*.16))]
 peak = float(NP.max(NP.abs(audio)))
 if peak < .002 or len(audio)/sr < .15: raise ValueError('Silent or truncated audio: '+key)
 # Peak ceiling, consistent loudness, no clipping or pitch shifting.
 rms_all = float(NP.sqrt(NP.mean(audio**2)))
 gain = min(.89/peak, .12/max(rms_all,.0001), 3.0)
 audio = NP.pad(audio*gain, (int(sr*.06),int(sr*.09)))
 wav = io.BytesIO(); SF.write(wav,audio,sr,format='WAV',subtype='PCM_16')
 p = subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-i','pipe:0','-codec:a','libmp3lame','-b:a','64k','-ar','24000','-ac','1','-write_xing','0','-id3v2_version','0','-f','mp3','pipe:1'],input=wav.getvalue(),capture_output=True,check=True)
 file.write_bytes(p.stdout)
 return key, str(file)

def main():
 p=argparse.ArgumentParser(); p.add_argument('--model',required=True); p.add_argument('--voices',required=True); p.add_argument('--workers',type=int,default=3); p.add_argument('--threads',type=int,default=2); p.add_argument('--limit',type=int,default=0); p.add_argument('--pack-ready',action='store_true'); p.add_argument('--phonetics-only',action='store_true')
 args=p.parse_args(); CACHE.mkdir(exist_ok=True)
 old_file=CACHE/'original-index.json'
 if not old_file.exists(): old_file.write_bytes((ROOT/'voix/index.json').read_bytes())
 old=json.loads(old_file.read_text()); keys=dict.fromkeys(old['clips'])
 for text in EXTRA:
  for b in ['n','m','s']: keys[b+'|'+text]=None
 for k in PHONETICS:
  for b in ['n','m','s']: keys[b+'|'+k]=None
 additional=ROOT/'audit-voix/phrases-ajoutees.json'
 if additional.exists():
  for k in json.loads(additional.read_text()): keys[k]=None
 # Generate the UI and phonics first so that early checks use the final voice.
 def priority(key):
  ent=old['clips'].get(key)
  scope=old['packs'][ent[0]].split('-')[0] if ent else 'ui'
  return ({'ui':0,'lecture':1,'petits':2,'grands':3,'calcul':4}.get(scope,5),key)
 ordered=sorted(keys,key=priority)
 if args.phonetics_only: ordered=[k for k in ordered if k.split('|',1)[1].strip().rstrip('.!?') in PHONETICS or k not in old['clips']]
 if args.limit: ordered=ordered[:args.limit]
 jobs=[(k,k.split('|',1)[1],{'n':.93,'m':.86,'s':.79}[k[0]]) for k in ordered]
 start=time.monotonic(); results={}
 if args.pack_ready:
  for key in ordered:
   file=cache_path(key)
   if file.exists(): results[key]=str(file)
  ordered=[key for key in ordered if key in results]
 else:
  with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers,initializer=setup,initargs=(args.model,args.voices,args.threads)) as pool:
   futures={pool.submit(synth,j):j[0] for j in jobs}
   for i,f in enumerate(concurrent.futures.as_completed(futures),1):
    key,file=f.result(); results[key]=file
    if i%100==0 or i==len(jobs): print(json.dumps({'done':i,'total':len(jobs),'elapsedSeconds':round(time.monotonic()-start)}),flush=True)
 if args.limit or args.phonetics_only: return
 packs=[]; clips={}; scopes={}; order={}; handles={}; sizes={}
 try:
  for key in ordered:
   ent=old['clips'].get(key); scope=old['packs'][ent[0]].split('-')[0] if ent else 'ui'
   text=key.split('|',1)[1]
   if key[0] in 'ms' and ' ' not in text and len(text)<=12: scope='sons'
   data=Path(results[key]).read_bytes()
   if scope not in handles or sizes[scope]+len(data)>1_200_000:
    if scope in handles: handles[scope][1].close()
    idx=len(packs); name=f'claire-{scope}-{len(scopes.get(scope,[]))}.mp3'; packs.append(name); scopes.setdefault(scope,[]).append(idx)
    handles[scope]=(idx,(ROOT/'voix'/name).open('wb')); sizes[scope]=0
   idx,handle=handles[scope]; clips[key]=[idx,sizes[scope],len(data)]; handle.write(data); sizes[scope]+=len(data)
 finally:
  for _,handle in handles.values(): handle.close()
 for world in ['petits','grands']: order[world]=scopes.get('ui',[]) + scopes.get(world,[]) + (scopes.get('lecture',[]) if world=='grands' else [])
 new={'v':2,'voice':'Kokoro-82M v1.0 · ff_siwis · français féminin','sampleRate':24000,'generatedAt':'2026-10-22','baseSpeed':.93,'clips':clips,'packs':packs,'order':order,'scopes':scopes,'phoneticOverrides':PHONETICS}
 (ROOT/'voix/index-claire.json').write_text(json.dumps(new,ensure_ascii=False,separators=(',',':')))
 print(json.dumps({'complete':not args.pack_ready,'clips':len(clips),'packs':len(packs),'elapsedSeconds':round(time.monotonic()-start)}),flush=True)

if __name__=='__main__': main()
