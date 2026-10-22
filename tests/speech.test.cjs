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
    fetch:async url=>{if(failFetch)throw Error('offline');return {ok:true,json:async()=>({v:3,clips,packs:['test.mp3']}),arrayBuffer:async()=>new ArrayBuffer(10000)};},
    setTimeout:(fn,ms)=>setTimeout(fn,ms>10000?ms:Math.min(ms,2)),clearTimeout};
  const engine=create({env,settings:()=>settings,female:['marie'],male:['thomas'],novelty:['rocko'],onState:e=>statuses.push(e)});
  engine.Voice.init();
  return {...engine,settings,played,spoken,statuses,revoked};
}
async function main(){
  assert.deepEqual(speechJoin(['Oui !','Le',{t:'chat'},300,{t:'ou',rate:.8},'!']),[{t:'Oui ! Le chat',rate:1},300,{t:'ou',rate:.8},{t:'!',rate:1}]);
  assert.deepEqual(speechJoin(['Écoute',{t:'a',phoneme:'a'},'comme dans ami']),[{t:'Écoute',rate:1},{t:'a',phoneme:'a',rate:1},{t:'comme dans ami',rate:1}]);
  assert.deepEqual(speechSegments('Écoute. Regarde ! Puis choisis.'),[{t:'Écoute',end:'.'},{t:'Regarde !',end:'!'},{t:'Puis choisis',end:'.'}]);
  assert.equal(speechBucket(.75),'s');assert.equal(speechBucket(.8),'m');
  const f=fixture({clips:{'n|Bonjour !':[0,0,100],'m|ou':[0,100,100]}});
  await f.Voice.say(['Bonjour !',{t:'ou',rate:.8}]);
  assert.equal(f.Voice.voice.voiceURI,'marie');assert.equal(f.played.length,2);assert.equal(f.spoken.length,0);
  assert.equal(f.played[0].rate,.95);assert.equal(f.played[0].preservesPitch,true);
  f.settings.rate=.8;await f.Voice.say('Bonjour !');assert.equal(f.played.at(-1).rate,.8);
  await f.Voice.slower(()=>f.Voice.say('Bonjour !'));assert.ok(f.played.at(-1).rate<.8);
  const p0=f.played.length;await f.Voice.say(['Bonjour !','Phrase absente.']);
  assert.equal(f.played.length,p0);assert.equal(f.spoken.length,0,'missing recording never changes the speaker');assert.equal(f.Voice.status,'error');
  const s0=f.spoken.length;await f.Voice.say('Bonjour !',{device:true});assert.equal(f.spoken.length,s0+1);
  const stopped=fixture({clips:{'n|Bonjour !':[0,0,100]},hangAudio:true});
  const running=stopped.Voice.say('Bonjour !');await new Promise(r=>setTimeout(r,10));stopped.Voice.stop();
  await Promise.race([running,new Promise((_,reject)=>setTimeout(()=>reject(Error('cancellation hung')),100))]);
  assert.equal(stopped.Voice.speaking,false);assert.equal(stopped.Voice.status,'idle');
  const offline=fixture({failFetch:true});await offline.Voice.say('Bonjour !');assert.equal(offline.spoken.length,0);
  const sounds=fixture({clips:{'ph|a':[0,0,100],'sy|me':[0,100,100],'n|Bonjour !':[0,200,100]}});
  sounds.settings.voiceMode='device';sounds.settings.rate=.75;
  await sounds.Voice.say([{t:'a',phoneme:'a',rate:.75}]);
  assert.equal(sounds.played.length,1);assert.equal(sounds.played[0].rate,1,'phoneme stays at its original speed');assert.equal(sounds.spoken.length,0,'device setting cannot change a reading sound');
  await sounds.Voice.slower(()=>sounds.Voice.say([{t:'a',phoneme:'a'}]));assert.equal(sounds.played.at(-1).rate,1);
  await sounds.Voice.say([{t:'me',syllable:'me'}]);assert.equal(sounds.played.at(-1).rate,.75);
  await sounds.Voice.say([{t:'i',phoneme:'i'}]);assert.equal(sounds.spoken.length,0);assert.equal(sounds.Voice.status,'error','missing sound must never be invented by TTS');
  await offline.Voice.say([{t:'a',phoneme:'a'}]);assert.equal(offline.spoken.length,0);assert.equal(offline.Voice.status,'error');assert.equal(offline.VoicePack.ready,null,'bank can be retried after an offline failure');
  const feedback=fixture({clips:{'n|Bravo ! Tu as trouvé !':[0,0,100],'n|Regarde bien et essaie encore.':[0,100,100],'s|Deux':[0,200,100]}});
  await feedback.Voice.say('Feedback absent',{feedback:'correct'});assert.equal(feedback.played.length,1);assert.equal(feedback.Voice.lastFallback,true);assert.equal(feedback.spoken.length,0);
  await feedback.Voice.say('Autre feedback absent',{feedback:'retry'});assert.equal(feedback.played.length,2);assert.equal(feedback.spoken.length,0);
  feedback.settings.voiceMode='device';await feedback.Voice.say('deux');assert.equal(feedback.played.length,3,'text lookup ignores obsolete bucket and capitalization');assert.equal(feedback.spoken.length,0);
  const flowing=fixture({clips:{'n|Écoute. Regarde les images. Puis choisis ta réponse.':[0,0,100]}});
  await flowing.Voice.say('Écoute. Regarde les images. Puis choisis ta réponse.');assert.equal(flowing.played.length,1,'whole recording keeps the voice fluent');assert.equal(flowing.spoken.length,0);
  assert.ok(f.statuses.some(x=>x.mode==='recorded'&&x.status==='speaking'));
  const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];scripts.forEach((m,i)=>new vm.Script(m[1],{filename:`application-${i}.js`}));
  const stateCode=html.slice(html.indexOf('function defState()'),html.indexOf('function loadLocal()'));
  const ctx=vm.createContext({});vm.runInContext(stateCode,ctx);
  const oldState={v:1,current:'luca',profiles:[{id:'luca',world:'grands'},{id:'lola',world:'petits'}],settings:{pitch:1.05,rate:.95},progress:{luca:{stars:53,lecture:{done:{0:true}},calcul:{mods:{}}},lola:{stars:7,games:{}}}};
  const migrated=ctx.migrate(structuredClone(oldState));
  assert.equal(JSON.stringify(migrated.progress),JSON.stringify(oldState.progress));assert.equal(migrated.settings.pitch,1);assert.equal(migrated.settings.voiceRevision,3);assert.equal(migrated.settings.rate,1);
  const custom=ctx.migrate({...structuredClone(oldState),settings:{rate:.8,pitch:1,voiceRevision:2,voiceMode:'device'}});assert.equal(custom.settings.rate,.8);assert.equal(custom.settings.voiceMode,'lumi');
  assert.ok(html.includes('if (!g.levels)'),'preserve latest parents fix');
  assert.ok(!html.includes('device: true')&&!html.includes('device:true'),'no app action invokes another voice');
  const fakeElement=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
  const full=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fakeElement,createTextNode:t=>({textContent:t}),body:fakeElement(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
  vm.runInContext(scripts.map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,''),full,{timeout:3000});
  vm.runInContext(`for(const world of ['petits','grands']){const themes=themesOf(world);if(themes.length!==5)throw Error('Five simple themes required');const ids=themes.flatMap(t=>t.ids);for(const id of WORLD_TILES[world]){if(!ids.includes(id)&&!/^fete/.test(id))throw Error('Unreachable game: '+id);}}`,full);
  vm.runInContext(`
    save = () => {};
    S.current='luca'; P().av={gear:{sac:true,chapeau:true,loupe:true,cape:true}};
    if(gearOn().length!==3)throw Error('Legacy outfit limit');
    P().av={gear:{}};
    if(gearOn().length!==0)throw Error('No automatic reward equipment');
    for(const id of ['sac','chapeau','objet-0'])if(!toggleObject(id))throw Error('Equip object');
    if(toggleObject('cape')||gearOn().length!==3)throw Error('Fourth object rejected');
    if(!toggleObject('couronne')||gearOn().includes('chapeau')||gearOn().length!==3)throw Error('Hat replacement');
    if(!toggleObject('objet-0')||!toggleObject('objet-39'))throw Error('Remove and replace');
    const saved=JSON.stringify(P().av); P().av=JSON.parse(saved);
    if(gearOn().length!==3||!gearOn().includes('objet-39'))throw Error('Outfit persistence');
    const counter=P().stars;delete P().rewards;
    for(let i=1;i<=9;i++){const r=addStars(100);if(r.stars!==i||r.diamond)throw Error('One star per series');}
    const tenth=addStars(3);if(!tenth.diamond||tenth.stars!==0||P().rewards.diamonds!==1)throw Error('Ten stars convert into one diamond');
    if(addStars(1).stars!==1||P().stars!==counter)throw Error('New cycle and legacy preservation');
    const savedRewards=JSON.stringify(P().rewards);P().rewards=JSON.parse(savedRewards);if(seriesRewards().stars!==1)throw Error('Reward persistence');
    S.current='lola';if(seriesRewards().stars!==0)throw Error('Independent reward counters');P().av={gear:{}};if(gearOn().length)throw Error('Independent outfits');
    if(objectChoices().some(o=>o.label.includes(' ')))throw Error('One word per object');
    if(objectChoices().length!==48)throw Error('All objects available');
    if(!avatarSVG('lola',{gear:['objet-39']}).includes('🐉'))throw Error('Equipped object visible');
  `,full);
  for(const [word,key] of [['poire','a'],['lion','i'],['fleur','eu'],['pomme','o']]) assert.equal(vm.runInContext(`safeEarWord(WORDS.find(w=>w.w===${JSON.stringify(word)}),${JSON.stringify(key)})`,full),false,word);
  for(const [word,key] of [['guitare','a'],['lit','i'],['feu','eu'],['vélo','o']]) assert.equal(vm.runInContext(`safeEarWord(WORDS.find(w=>w.w===${JSON.stringify(word)}),${JSON.stringify(key)})`,full),true,word);
  vm.runInContext("LESSONS.forEach(L=>{const c={usedE:new Set()};for(let i=0;i<12;i++)itEcoute(L,c);})",full,{timeout:3000});
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(vow("a"))',full)),{t:'a',phoneme:'a',rate:1});
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(sylUnit("me"))',full)),{t:'me',syllable:'me',rate:.85});
  vm.runInContext('var replayedWord; Voice.say = x => { replayedWord=x; }; itDictee(WORDS.find(w=>w.w==="mouche"),LESSONS.length-1).replay();',full);
  assert.equal(vm.runInContext('replayedWord',full),'mouche','word help keeps a whole spoken syllable and silent letters');
  const syllableIPA=require('../audit-voix/syllabes-phonetics.json');
  assert.equal(syllableIPA['chè'],'ʃɛ');assert.equal(syllableIPA['gui'],'ɡi');assert.equal(syllableIPA['me'],'mə');assert.equal(syllableIPA['jeu'],'ʒø');
  assert.ok(!html.includes('Réécouter plus lentement'));assert.ok(!html.includes('Plus lent'));assert.ok(!html.includes("chu: 'chut'"));assert.ok(!html.includes("'ké': 'quai'"));
  console.log('Voix : débit des enregistrements, timbre conservé au ralenti, secours cohérent, choix féminin, annulation et application vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
