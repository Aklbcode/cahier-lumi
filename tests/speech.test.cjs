const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {create,speechJoin,speechSegments,speechBucket} = require('../speech-engine.js');

function fixture({clips={},failFetch=false,hangAudio=false}={}) {
  const settings={voiceMode:'lumi',rate:.95,pitch:1,voiceURI:''};
  const played=[],spoken=[],statuses=[],revoked=[];
  class Audio {
    setAttribute(){} removeAttribute(){} load(){} pause(){this.paused=true;}
    play() {this.paused=false;played.push({src:this.src,rate:this.playbackRate,preservesPitch:this.preservesPitch});
      if(!hangAudio)setTimeout(()=>{if(!this.paused&&this.onended)this.onended();},1);return Promise.resolve();}
  }
  class Utterance{constructor(t){this.text=t;}}
  const female={name:'Marie',lang:'fr-FR',voiceURI:'marie'},male={name:'Thomas',lang:'fr-FR',voiceURI:'thomas'};
  const synth={getVoices:()=>[male,female],addEventListener(){},cancel(){},speak(u){spoken.push(u);setTimeout(()=>u.onend&&u.onend(),1);}};
  let serial=0;
  const env={Audio,Utterance,synth,Blob,URL:{createObjectURL:()=>`blob:${++serial}`,revokeObjectURL:u=>revoked.push(u)},
    fetch:async url=>{if(failFetch)throw Error('offline');return {ok:true,json:async()=>({v:2,clips,packs:['test.mp3']}),arrayBuffer:async()=>new ArrayBuffer(10000)};},
    setTimeout:(fn,ms)=>setTimeout(fn,ms>10000?ms:Math.min(ms,2)),clearTimeout};
  const engine=create({env,settings:()=>settings,female:['marie'],male:['thomas'],novelty:['rocko'],onState:e=>statuses.push(e)});
  engine.Voice.init();
  return {...engine,settings,played,spoken,statuses,revoked};
}
async function main(){
  assert.deepEqual(speechJoin(['Oui !','Le',{t:'chat'},300,{t:'ou',rate:.8},'!']),[{t:'Oui ! Le chat',rate:1},300,{t:'ou',rate:.8},{t:'!',rate:1}]);
  assert.deepEqual(speechSegments('Écoute. Regarde ! Puis choisis.'),[{t:'Écoute',end:'.'},{t:'Regarde !',end:'!'},{t:'Puis choisis',end:'.'}]);
  assert.equal(speechBucket(.75),'s');assert.equal(speechBucket(.8),'m');
  const f=fixture({clips:{'n|Bonjour !':[0,0,100],'m|ou':[0,100,100]}});
  await f.Voice.say(['Bonjour !',{t:'ou',rate:.8}]);
  assert.equal(f.Voice.voice.voiceURI,'marie');assert.equal(f.played.length,2);assert.equal(f.spoken.length,0);
  assert.equal(f.played[0].rate,.95);assert.equal(f.played[0].preservesPitch,true);
  f.settings.rate=.8;await f.Voice.say('Bonjour !');assert.equal(f.played.at(-1).rate,.8);
  await f.Voice.slower(()=>f.Voice.say('Bonjour !'));assert.ok(f.played.at(-1).rate<.8);
  const p0=f.played.length;await f.Voice.say(['Bonjour !','Phrase absente.']);
  assert.equal(f.played.length,p0,'one timbre for an incomplete recording set');assert.equal(f.spoken.length,2);
  const s0=f.spoken.length;await f.Voice.say('Bonjour !',{device:true});assert.equal(f.spoken.length,s0+1);
  const stopped=fixture({clips:{'n|Bonjour !':[0,0,100]},hangAudio:true});
  const running=stopped.Voice.say('Bonjour !');await new Promise(r=>setTimeout(r,10));stopped.Voice.stop();
  await Promise.race([running,new Promise((_,reject)=>setTimeout(()=>reject(Error('cancellation hung')),100))]);
  assert.equal(stopped.Voice.speaking,false);assert.equal(stopped.Voice.status,'idle');
  const offline=fixture({failFetch:true});await offline.Voice.say('Bonjour !');assert.equal(offline.spoken.length,1);
  assert.ok(f.statuses.some(x=>x.mode==='recorded'&&x.status==='speaking'));
  const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];scripts.forEach((m,i)=>new vm.Script(m[1],{filename:`application-${i}.js`}));
  const stateCode=html.slice(html.indexOf('function defState()'),html.indexOf('function loadLocal()'));
  const ctx=vm.createContext({});vm.runInContext(stateCode,ctx);
  const oldState={v:1,current:'luca',profiles:[{id:'luca',world:'grands'},{id:'lola',world:'petits'}],settings:{pitch:1.05,rate:.95},progress:{luca:{stars:53,lecture:{done:{0:true}},calcul:{mods:{}}},lola:{stars:7,games:{}}}};
  const migrated=ctx.migrate(structuredClone(oldState));
  assert.equal(JSON.stringify(migrated.progress),JSON.stringify(oldState.progress));assert.equal(migrated.settings.pitch,1);assert.equal(migrated.settings.voiceRevision,2);
  assert.ok(html.includes('if (!g.levels)'),'preserve latest parents fix');
  const fakeElement=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
  const full=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fakeElement,createTextNode:t=>({textContent:t}),body:fakeElement(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
  vm.runInContext(scripts.map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,''),full,{timeout:3000});
  for(const [word,key] of [['poire','a'],['lion','i'],['fleur','eu'],['pomme','o']]) assert.equal(vm.runInContext(`safeEarWord(WORDS.find(w=>w.w===${JSON.stringify(word)}),${JSON.stringify(key)})`,full),false,word);
  for(const [word,key] of [['guitare','a'],['lit','i'],['feu','eu'],['vélo','o']]) assert.equal(vm.runInContext(`safeEarWord(WORDS.find(w=>w.w===${JSON.stringify(word)}),${JSON.stringify(key)})`,full),true,word);
  vm.runInContext("LESSONS.forEach(L=>{const c={usedE:new Set()};for(let i=0;i<12;i++)itEcoute(L,c);})",full,{timeout:3000});
  const syllableIPA=require('../audit-voix/syllabes-phonetics.json');
  assert.equal(syllableIPA['chè'],'ʃɛ');assert.equal(syllableIPA['gui'],'ɡi');assert.equal(syllableIPA['me'],'mə');assert.equal(syllableIPA['jeu'],'ʒø');
  assert.ok(html.includes('Réécouter plus lentement'));assert.ok(!html.includes("chu: 'chut'"));assert.ok(!html.includes("'ké': 'quai'"));
  console.log('Voix : débit des enregistrements, timbre conservé au ralenti, secours cohérent, choix féminin, annulation et application vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
