const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..');let clock=0,next=1;const timers=new Map();
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout(fn,ms=0){const id=next++;timers.set(id,{fn,at:clock+ms});return id;},clearTimeout:id=>timers.delete(id),readingTick(ms){clock+=ms;for(const [id,t]of [...timers])if(t.at<=clock){timers.delete(id);t.fn();}}});
const fragment=fs.readFileSync(path.join(root,'reading-practice-fragment.js'),'utf8');if(!source.includes('const READING_PRACTICE_VOICE='))vm.runInContext(fragment,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
 const checkReading=(ok,message)=>{if(!ok)throw Error(message);};save=()=>{};const spoken=[];Voice.say=parts=>{spoken.push(parts);return Promise.resolve();};Voice.stop=()=>{};Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';RUN=null;
 const p=P();p.lecture.unlocked=LESSONS.length-1;p.lecture.pass={};for(const gid of ['pseudoMot','lisFais','lectureEclair'])checkReading(!readingPracticeAccess(gid,p).ready,'Unlocking all lessons without autonomous passes does not satisfy prerequisites');
 for(let i=0;i<LESSONS.length;i++)p.lecture.pass[i]={at:1,parent:true};checkReading(readingPracticeKnownKeys(p).size===0,'Parent passes do not become evidence of independent grapheme knowledge');
 for(let i=0;i<LESSONS.length;i++)p.lecture.pass[i]={at:1};checkReading(readingPracticeKnownKeys(p).size===LESSONS.length,'Autonomous passed graphemes are available');
 p.lecture.pass[LIDX.l].review=true;checkReading(!pseudoGroupAvailable(PSEUDO_GROUPS[0],p),'A grapheme marked for review is excluded');p.lecture.pass[LIDX.l]={at:1};
 const makeReadingApi=()=>({answers:[],steps:[],helps:0,active:true,accept:true,alive(){return this.active;},help(){this.helps++;},answer(ok,options={}){if(!this.active)return Promise.resolve(false);this.answers.push({ok,options});return Promise.resolve(ok&&this.accept);},step(ok,options={}){if(this.active)this.steps.push({ok,options});},finish(){},key(){}}),flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
 for(let group=0;group<PSEUDO_GROUPS.length;group++)for(let seed=0;seed<64;seed++){
  const item=withSeed(70000+group*100+seed,()=>GAMES.pseudoMot.make({L:GAMES.pseudoMot.levels[group],li:group,i:0,used:[],bag:{}})),model=item.pseudoModel,st=document.createElement('div'),api=makeReadingApi();item.render(st,api);
  checkReading(model&&model.options.length===3&&new Set(model.options.map(o=>o.word)).size===3&&model.options.filter(o=>o.word===model.word.word).length===1,'Every pseudoword has exactly three distinct, decodable pronunciations');
  for(const option of model.options)checkReading(readingKeysAvailable(option.keys,p)&&option.syllables.join('')===option.word,'All target and distractor graphemes are independently known');
  const listens=st.querySelectorAll('[data-audio-option]'),choices=st.querySelectorAll('[data-choose-option]');checkReading(listens.length===3&&choices.length===3,'Listening and answering are separate actions');
  const before=spoken.length;for(const b of listens)b.click();checkReading(api.answers.length===0&&api.helps===0&&spoken.length===before+3,'Listening to all choices neither answers nor counts as a hint');
  for(const plan of spoken.slice(before))checkReading(Array.isArray(plan)&&plan.filter(x=>typeof x==='object').every(x=>x.syllable),'Pseudoword choices use existing recorded syllables instead of unconstrained invented-word TTS');
  const right=model.options.findIndex(o=>o.word===model.word.word),wrong=(right+1)%3;choices[wrong].click();choices[right].click();await flush();checkReading(api.answers.length===2&&!api.answers[0].ok&&api.answers[1].ok,'A choice validates immediately, without a separate verify/continue pair');
 }
 for(let li=0;li<GAMES.lisFais.levels.length;li++)for(let seed=0;seed<64;seed++){
  const item=withSeed(80000+li*100+seed,()=>GAMES.lisFais.make({L:GAMES.lisFais.levels[li],li,i:0,used:[],bag:{}})),model=item.readActModel,st=document.createElement('div'),api=makeReadingApi(),before=spoken.length;item.render(st,api);
  checkReading(model&&model.steps.length===GAMES.lisFais.levels[li].actions&&new Set(model.steps.map(s=>s.zone.id)).size===model.steps.length,'Distinct actions use distinct spatial positions');
  checkReading(spoken.length===before&&!String(item.say).includes(model.text),'The answer sentence is written and is never read automatically');
  for(const o of model.objects)checkReading(readingKeysAvailable(o.keys,p),'Object words are decodable');for(const z of model.zones)checkReading(readingKeysAvailable(z.keys,p),'Relation words are decodable');
  const object=id=>st.querySelectorAll('[data-read-object]').find(b=>b.getAttribute('data-read-object')===id),zone=id=>st.querySelectorAll('[data-read-zone]').find(b=>b.getAttribute('data-read-zone')===id);
  if(seed===0){const first=model.steps[0],wrong=model.objects.find(o=>o.id!==first.object.id);object(wrong.id).click();zone(first.zone.id).click();checkReading(api.steps.length===1&&!api.steps[0].ok&&api.answers.length===0,'Wrong object does not advance an action');}
  if(seed===1){st.querySelector('[data-reading-aid]').click();checkReading(api.helps===1&&spoken.at(-1)===model.text,'Reading the phrase aloud is an explicit counted aid');}
  for(const step of model.steps){object(step.object.id).click();zone(step.zone.id).click();}await flush();checkReading(api.answers.length===1&&api.answers[0].ok,'Last placement validates the complete sentence in one step');
 }
 /* Legacy seen lists include aided attempts. Only their latest autonomous
    result is safe to reuse; new per-word observations are explicit. */
 p.readingPractice={};p.evidence={'reading:words':{alone:5,lastResult:'aided',seen:['chat','lama']}};checkReading(!readingWordKnown('chat',p)&&!readingWordKnown('lama',p),'An aided seen word is not silently declared known');p.evidence['reading:words'].lastResult='alone';checkReading(readingWordKnown('chat',p)&&!readingWordKnown('lama',p),'Only the exact latest autonomous legacy word is reused');
 for(const L of GAMES.lectureEclair.levels){const words=readingPracticeWordPool(L,p);checkReading(words.length>=3&&words.every(w=>w.req<LESSONS.length&&readingKeysAvailable([...w.keys],p)),'Flash candidates exclude quarantined/untaught graphemes');}
 for(let li=0;li<GAMES.lectureEclair.levels.length;li++)for(let variant=0;variant<4;variant++){
  const L=GAMES.lectureEclair.levels[li];p.readingPractice={knownWords:Object.fromEntries(WORDS.map(w=>[w.w,{alone:1,aided:0}])),flashUntimed:false};const item=withSeed(9000+li*10+variant,()=>GAMES.lectureEclair.make({L,li,i:0,used:[],bag:{}})),model=item.flashModel,st=document.createElement('div'),api=makeReadingApi();item.render(st,api);
  const action=id=>st.querySelectorAll('[data-flash-action]').find(b=>b.getAttribute('data-flash-action')===id),choices=st.querySelectorAll('[data-flash-word]'),target=choices.find(b=>b.getAttribute('data-flash-word')===model.word.w),display=st.querySelector('.reading-practice-word');
  checkReading(model.options.length===3&&new Set(model.options.map(w=>w.e)).size===3&&readingWordKnown(model.word.w,p),'Flash uses a known decodable target and three distinct images');
  target.click();await flush();checkReading(api.answers.length===0,'A hidden/pre-start choice cannot answer the item');
  if(variant===1&&!L.calibrate)action('untimed').click();action('start').click();checkReading(!display.hidden,'The child starts exposure when ready, rather than during spoken instructions');
  if(!L.calibrate&&variant!==1){readingTick(model.ms);checkReading(display.hidden&&api.answers.length===0&&api.steps.length===0,'Word disappearance is never a timeout error');if(variant===2){action('reveal').click();checkReading(!display.hidden&&api.helps===1,'Revealing the hidden word explicitly counts as aid');}if(variant===3){api.accept=false;}}
  else checkReading(!display.hidden,'Calibration or untimed setting leaves the word visible');
  target.click();await flush();checkReading(api.answers.length===1&&api.answers[0].ok,'Image choice validates directly');
  const entry=p.readingPractice.knownWords[model.word.w];if(!L.calibrate&&variant===3)checkReading(!entry.last,'An answer skipped/aborted during feedback cannot record word success');else{checkReading(entry.last.oralReadingMeasured===false,'No flash result claims measured oral fluency');if(!L.calibrate&&variant===2)checkReading(entry.aided===1&&entry.alone===1,'A reread cannot produce a new autonomous-known word');}
 }
 const q={readingPractice:{knownWords:{}}};for(let i=0;i<40;i++)readingFlashRecord(q,'chat',{alone:true,mode:'brief',ms:1000,band:0});checkReading(q.readingPractice.flashMsBands[0]===1000&&!q.readingPractice.flashMsBands[1],'Exposure never drops below one second and a new length band starts afresh');
 p.lecture.pass={};p.familyAccess={pseudoMot:1,lisFais:1,lectureEclair:1};p.readingPractice={};const independentBefore=JSON.stringify(p.lecture.pass),skillsBefore=JSON.stringify(p.skills),rewardsBefore=JSON.stringify(p.rewards);
 for(const gid of ['pseudoMot','lisFais','lectureEclair']){const item=GAMES[gid].make({L:GAMES[gid].levels[0],li:0,i:0,used:[],bag:{}}),st=document.createElement('div'),api=makeReadingApi();checkReading(readingPracticeAccess(gid,p).ready&&item.training&&item.helped&&item.evidenceKey.includes('training'),'Parent access produces a concrete assisted item instead of another blocked screen');item.render(st,api);checkReading(api.helps===1&&st.querySelector('.reading-training-note'),'Parent training is visibly and statistically assisted');if(gid==='lectureEclair'){st.querySelectorAll('[data-flash-action]').find(b=>b.getAttribute('data-flash-action')==='start').click();st.querySelectorAll('[data-flash-word]').find(b=>b.getAttribute('data-flash-word')===item.flashModel.word.w).click();await flush();const result=p.readingPractice.knownWords[item.flashModel.word.w];checkReading(result.alone===0&&result.aided===1,'Parent training never creates autonomous known-word evidence');}}
 checkReading(readingPracticeKnownKeys(p).size===0&&JSON.stringify(p.lecture.pass)===independentBefore&&JSON.stringify(p.skills)===skillsBefore&&JSON.stringify(p.rewards)===rewardsBefore,'Opening assisted practice creates no grapheme passes, academic results or rewards');delete p.familyAccess;p.parentActions=[{action:'unlock',target:{kind:'game',gid:'pseudoMot'},undone:true}];checkReading(!readingPracticeParentOpened('pseudoMot',p),'An undone parent action is not an ongoing permission');
 for(const gid of ['pseudoMot','lisFais','lectureEclair']){
  const gp=gameProg(gid);gp.lvl=0;gp.unlocked=0;const target={kind:'game',gid,index:1},before=JSON.stringify({skills:p.skills,rewards:p.rewards,pass:p.lecture.pass});
  const opened=parentAdjust('luca',target,'open');checkReading(opened.changed&&p.parentActions.at(-1).action==='open'&&readingPracticeParentOpened(gid,p),'The actual historical parentAdjust open action grants reading practice');
  const item=GAMES[gid].make({L:GAMES[gid].levels[1],li:1,i:0,used:[],bag:{}}),st=document.createElement('div'),api=makeReadingApi();checkReading(item.training&&item.helped,'A real parent open creates a playable assisted item');item.render(st,api);checkReading(api.helps===1,'The real parent route is recorded as assisted');
  const undone=parentUndo('luca');checkReading(undone.ok&&p.parentActions.at(-1).undone&&!readingPracticeParentOpened(gid,p),'Actual parentUndo revokes the historical open route');
  checkReading(!GAMES[gid].make({L:GAMES[gid].levels[1],li:1,i:0,used:[],bag:{}}).training,'An undone opening does not leave a hidden training permission');
  checkReading(JSON.stringify({skills:p.skills,rewards:p.rewards,pass:p.lecture.pass})===before,'Real open and undo add no independent passes, academic results or stars');
 }
 const small=themesOf('petits').flatMap(t=>t.ids),large=themesOf('grands').flatMap(t=>t.ids);for(const id of ['pseudoMot','lisFais','lectureEclair'])checkReading(large.includes(id)&&!small.includes(id)&&new Set(GAMES[id].levels.map(L=>L.name)).size===GAMES[id].levels.length,'Distinct reading stages belong to Luca only');
 checkReading(readingPracticeVoiceLines().every(t=>typeof t==='string'),'Every public instruction/help sentence is enumerable');
 })()`,ctx,{timeout:30000});
 const syllables=JSON.parse(vm.runInContext('JSON.stringify(PSEUDO_GROUPS.flatMap(g=>g.words.flatMap(w=>pseudoAudio(w).filter(x=>typeof x==="object").map(x=>x.syllable))))',ctx)),bank=JSON.parse(fs.readFileSync(path.join(root,'voix/index-belge.json'),'utf8'));
 for(const s of syllables)assert.ok(bank.clips['sy|'+s],'Validated syllable recording is present: '+s);
 assert.ok(!fragment.includes('speechSynthesis'),'All speech remains on the shared Charline voice path');
 console.log('Lecture : 512 pseudomots, 384 actions lues, prérequis indépendants, vrais clics, aides, mots connus et affichage bref sans pression vérifiés.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
