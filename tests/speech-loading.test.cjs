const assert = require('node:assert/strict');
const {create} = require('../speech-engine.js');

// A deterministic clock exercises a genuinely slow connection without sleeping
// for five or fifteen seconds in the test runner.
class Clock {
  constructor(){this.now=0;this.next=1;this.tasks=new Map();}
  setTimeout(fn,ms){const id=this.next++;this.tasks.set(id,{at:this.now+ms,fn});return id;}
  clearTimeout(id){this.tasks.delete(id);}
  async flush(){for(let i=0;i<30;i++)await Promise.resolve();}
  async advance(ms){
    const end=this.now+ms;
    await this.flush();
    while(true){
      const due=[...this.tasks].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];
      if(!due)break;
      this.now=due[1].at;this.tasks.delete(due[0]);due[1].fn();await this.flush();
    }
    this.now=end;await this.flush();
  }
  async finish(promise,budget=30000){
    let settled=false,error;
    Promise.resolve(promise).then(()=>settled=true,e=>{settled=true;error=e;});
    await this.flush();
    const limit=this.now+budget;
    while(!settled){
      const due=[...this.tasks.values()].sort((a,b)=>a.at-b.at)[0];
      assert.ok(due&&due.at<=limit,'operation must finish within its bounded loading deadline');
      await this.advance(due.at-this.now);
    }
    if(error)throw error;
  }
}

function fixture({protocol='https:',indexDelay=0,indexBody,packBody,failFirst=false,synthesis=true,abort=true}={}){
  const clock=new Clock(),requests=[],played=[],spoken=[],states=[];
  let attempts=0,packAttempts=0,serial=0;
  const manifest={v:3,voice:'fr-BE-CharlineNeural',clips:{'ph|a':[0,0,100],'n|Bonjour !':[0,100,100],'n|Bravo ! Tu as trouvé !':[0,200,100]},packs:['charline.mp3']};
  const later=(value,ms)=>new Promise(resolve=>clock.setTimeout(()=>resolve(value),ms));
  class Audio {
    setAttribute(){} removeAttribute(){} load(){} pause(){this.paused=true;}
    play(){this.paused=false;played.push({src:this.src,rate:this.playbackRate});clock.setTimeout(()=>{if(!this.paused&&this.onended)this.onended();},10);return Promise.resolve();}
  }
  class Utterance{constructor(text){this.text=text;}}
  const env={location:{protocol},Audio,Blob,URL:{createObjectURL:()=>`blob:charline-${++serial}`,revokeObjectURL(){}},
    AbortController:abort?AbortController:null,
    synth:synthesis?{getVoices:()=>[],addEventListener(){},cancel(){},speak:u=>spoken.push(u)}:null,
    Utterance:synthesis?Utterance:null,
    setTimeout:clock.setTimeout.bind(clock),clearTimeout:clock.clearTimeout.bind(clock),
    fetch:async(url,options={})=>{
      requests.push({url,signal:options.signal});
      if(url.includes('index-belge.json')){
        attempts++;
        if(failFirst&&attempts===1)throw Error('connection unavailable');
        if(indexDelay)await later(null,indexDelay);
        return {ok:true,json:()=>indexBody?indexBody(attempts,manifest,clock,options.signal):Promise.resolve(manifest)};
      }
      packAttempts++;
      return {ok:true,arrayBuffer:()=>packBody?packBody(packAttempts,clock,options.signal):Promise.resolve(new ArrayBuffer(1000))};
    }};
  const engine=create({env,settings:()=>({rate:1}),onState:e=>states.push(e)});
  engine.Voice.init();
  return {...engine,clock,requests,played,spoken,states,get attempts(){return attempts;},get packAttempts(){return packAttempts;}};
}

async function main(){
  const unhandled=[];const rejection=err=>unhandled.push(err);
  process.on('unhandledRejection',rejection);
  try{
    const local=fixture({protocol:'file:'});
    await local.clock.finish(local.Voice.say([{t:'a',phoneme:'a'}]));
    await local.clock.finish(local.Voice.say('An unrecorded encouragement',{feedback:'correct'}));
    assert.equal(local.VoicePack.label,'fr-BE-CharlineNeural');
    assert.equal(local.played.length,2);
    assert.equal(local.played[0].rate,1,'the recorded reading sound retains its original speed');
    assert.ok(local.requests.some(r=>r.url.includes('index-belge.json')));
    assert.ok(local.requests.some(r=>r.url.includes('charline.mp3')));
    assert.ok(local.requests.every(r=>r.url.startsWith('https://aklbcode.github.io/cahier-lumi/voix/')),'both manifest and packs avoid fetch(file://)');
    assert.equal(local.spoken.length,0,'a file opening must retain the same recorded voice, including feedback');

    const online=fixture();
    await online.clock.finish(online.Voice.say('Bonjour !'));
    assert.ok(online.requests.every(r=>r.url.startsWith('voix/')),'an HTTP deployment keeps its own relative audio assets');

    const noTTS=fixture({synthesis:false});
    await noTTS.clock.finish(noTTS.Voice.say([{t:'a',phoneme:'a'}]));
    assert.equal(noTTS.Voice.ok,false);
    assert.equal(noTTS.played.length,1,'recorded speech does not require an installed speech synthesis voice');

    const slow=fixture({indexDelay:7000});
    await slow.clock.finish(slow.Voice.say('Bonjour !'));
    assert.ok(slow.clock.now>=7000,'manifest loading actually exceeds the former five-second wait');
    assert.equal(slow.played.length,1,'the first instruction succeeds on a slow connection');
    assert.equal(slow.Voice.status,'idle');

    const retry=fixture({failFirst:true});
    await retry.clock.finish(retry.Voice.say('Bonjour !'));
    assert.equal(retry.Voice.status,'error');
    assert.equal(retry.VoicePack.ready,null,'a failed manifest does not poison subsequent attempts');
    await retry.clock.finish(retry.Voice.say('Bonjour !'));
    assert.equal(retry.attempts,2);assert.equal(retry.played.length,1);

    // Deliberately ignore AbortSignal in the first response body. The explicit
    // deadline must still release the operation, including on old browsers.
    const body=fixture({abort:false,indexBody:(n,manifest)=>n===1?new Promise(()=>{}):Promise.resolve(manifest)});
    await body.clock.finish(body.Voice.say('Bonjour !'));
    assert.equal(body.Voice.status,'error');
    assert.equal(body.VoicePack.ready,null);
    assert.ok(body.clock.now>=15000&&body.clock.now<16000,'the body is covered by the manifest deadline');
    await body.clock.finish(body.Voice.say('Bonjour !'));
    assert.equal(body.attempts,2);assert.equal(body.played.length,1,'a hung response can be retried');

    const aborted=fixture({indexBody:(n,manifest,clock,signal)=>n===1?new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted')))):Promise.resolve(manifest)});
    await aborted.clock.finish(aborted.Voice.say('Bonjour !'));
    assert.equal(aborted.requests[0].signal.aborted,true,'a timed-out manifest also aborts its network request');
    await aborted.clock.finish(aborted.Voice.say('Bonjour !'));
    assert.equal(aborted.played.length,1);

    for(const abort of [false,true]){
      const pack=fixture({abort,packBody:(n)=>n===1?new Promise(()=>{}):Promise.resolve(new ArrayBuffer(1000))});
      await pack.clock.finish(pack.Voice.say('Bonjour !'));
      assert.equal(pack.Voice.status,'error','a stalled MP3 body must produce a recoverable error');
      assert.equal(pack.played.length,0);
      assert.equal(pack.VoicePack.loading[0],undefined,'the failed pack promise must be discarded');
      assert.ok(pack.clock.now>=15000&&pack.clock.now<16000,'MP3 body loading is bounded even without AbortController');
      const packRequest=pack.requests.find(r=>r.url.includes('charline.mp3'));
      if(abort)assert.equal(packRequest.signal.aborted,true,'a stalled MP3 request is aborted when supported');
      await pack.clock.finish(pack.Voice.say('Bonjour !'));
      assert.equal(pack.attempts,1,'a valid manifest is retained across a pack retry');
      assert.equal(pack.packAttempts,2);
      assert.equal(pack.played.length,1,'the same instruction succeeds after the pack connection recovers');
      assert.equal(pack.spoken.length,0,'pack timeouts must not switch to a device speaker');
    }

    const cancel=fixture({indexDelay:12000});
    const pending=cancel.Voice.say('Bonjour !');
    await cancel.clock.advance(100);
    cancel.Voice.stop();
    await cancel.clock.finish(pending,1);
    assert.equal(cancel.clock.now,100,'stopping speech resolves promptly while its manifest is pending');
    assert.equal(cancel.played.length,0);
    await cancel.clock.advance(13000);
    assert.equal(cancel.played.length,0,'a late manifest cannot revive cancelled speech');

    const offlineFile=fixture({protocol:'file:',failFirst:true});
    await offlineFile.clock.finish(offlineFile.Voice.say([{t:'a',phoneme:'a'}]));
    assert.match(offlineFile.Voice.text,/Internet/,'local-file loading failures provide an actionable connection message');
    assert.equal(offlineFile.spoken.length,0,'missing phonemes never fall back to device pronunciation');

    // Let Node deliver any unhandled-rejection event from failed/aborted races.
    await new Promise(resolve=>setImmediate(resolve));
    assert.deepEqual(unhandled,[]);
    console.log('Voix : ouverture locale, banque lente, absence de TTS, délai du manifeste, reprise et annulation vérifiés.');
  }finally{process.removeListener('unhandledRejection',rejection);}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
