const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

// Small event-capable DOM: it exercises the real render handlers, not a second
// implementation of the games. SVG remains an opaque string; pixels need browser QA.
class TestElement {
  constructor(tag='div',text){this.tagName=tag.toUpperCase();this.nodeType=tag==='#text'?3:1;this.childNodes=[];this.attributes={};this.listeners={};this.style={setProperty(){}};this.dataset={};this.disabled=false;this._text=text||'';this._html='';this.className='';this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' ');},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ');},toggle:(c,force)=>{const add=force===undefined?!this.classList.contains(c):force;this.classList[add?'add':'remove'](c);return add;}};}
  append(...xs){for(const x of xs){if(x==null)continue;const n=typeof x==='string'?new TestElement('#text',x):x;n.parentNode=this;this.childNodes.push(n);}}
  get children(){return this.childNodes.filter(n=>n.nodeType===1);}
  get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');}
  set textContent(t){this._text=String(t);this._html='';this.childNodes=[];}
  get innerHTML(){return this._html;}
  set innerHTML(s){this._html=String(s);this._text='';this.childNodes=[];}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='disabled')this.disabled=true;}
  getAttribute(k){return this.attributes[k]??null;}
  addEventListener(k,fn){(this.listeners[k]||(this.listeners[k]=[])).push(fn);}
  click(){if(!this.disabled)for(const fn of this.listeners.click||[])fn({preventDefault(){},target:this});}
  matches(s){if(s.startsWith('.'))return this.classList.contains(s.slice(1));if(s.startsWith('[')){const m=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return !!m&&this.getAttribute(m[1])!==null&&(m[2]===undefined||this.getAttribute(m[1])===m[2]);}return this.tagName.toLowerCase()===s.toLowerCase();}
  querySelectorAll(selector){const selectors=selector.split(',').map(s=>s.trim()),out=[];const walk=n=>{for(const c of n.children){if(selectors.some(s=>c.matches(s)))out.push(c);walk(c);}};walk(this);return out;}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  remove(){if(this.parentNode)this.parentNode.childNodes=this.parentNode.childNodes.filter(n=>n!==this);}
}
const element=tag=>new TestElement(tag);
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:element,createTextNode:t=>new TestElement('#text',t),head:element('head'),body:element('body'),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
vm.runInContext(source,ctx,{timeout:10000});
vm.runInContext(`
const checkLiteracy=(ok,msg)=>{if(!ok)throw Error(msg)};
save=()=>{};Voice.say=()=>Promise.resolve();S=defState();S.current='luca';S.world='grands';
const nodeLiteracy=()=>document.createElement('div');
Shell.capEl=nodeLiteracy();
const apiLiteracy=()=>({answers:[],steps:[],helped:false,done:false,alive(){return !this.done;},help(){this.helped=true;},step(ok){this.steps.push(ok);return ok;},answer(ok){this.answers.push(ok);if(ok)this.done=true;return ok;},finish(){this.done=true;}});

// Ground-truth French examples: two-letter graphèmes count as one sound;
// silent t/p do not count; unknown words must never be guessed from spelling.
for(const [word,count] of [['chat',2],['chou',2],['loup',2],['mouche',3],['souris',4],['pain',2],['main',2],['maman',4],['bulle',3]])checkLiteracy(phonemeCount({w:word,gs:Array(20).fill({})})===count,'Explicit phoneme count '+word);
checkLiteracy(phonemeCount({w:'inconnu',gs:[{g:'i'}]})===null,'Unknown phoneme sequence is not inferred');
for(const word of ['lion','avion','camion','violon','radio','pingouin','gorille']){const W=WORDS.find(w=>w.w===word);checkLiteracy(!!W&&W.req>=LESSONS.length,'Untaught semivowel excluded from decoding '+word);checkLiteracy(!safeEarWord(W,'i'),'No false isolated vowel example '+word);}
for(const li of [0,6,12,18,27,28])for(const pair of wordChainPairs(strictWordPool(li))){const ap=SOUND_WORDS[pair.a.w],bp=SOUND_WORDS[pair.b.w];checkLiteracy(ap&&bp&&ap.length===bp.length&&ap.filter((p,i)=>p!==bp[i]).length===1,'Word chain changes exactly one spoken phoneme');checkLiteracy(pair.ag.filter(g=>g.mute).map(g=>g.g).join('')===pair.bg.filter(g=>g.mute).map(g=>g.g).join(''),'Silent letters preserved in word chain');}
const dictation=itDictee(WORDS.find(w=>w.w==='chat'),LESSONS.length-1);checkLiteracy(JSON.stringify(dictation.say).includes('jeton')&&!JSON.stringify(dictation.say).includes('Choisis les lettres'),'Counting stage announces tokens, not next-stage letters');

// A later success requires something previously retrieved without help. A
// failure just before a review must not erase an older successful retrieval.
const onlyErrors={};evidenceUpdate(onlyErrors,'phoneme',{first:false,wrongs:2},'chat',1000);evidenceUpdate(onlyErrors,'phoneme',{first:false,helped:true},'chou',86400000);evidenceUpdate(onlyErrors,'phoneme',{first:true},'mouche',2*86400000);checkLiteracy(onlyErrors.evidence.phoneme.later===0&&onlyErrors.evidence.phoneme.alone===1,'Success after only failures is not a delayed retrieval');
const earlierSuccess={};evidenceUpdate(earlierSuccess,'phoneme',{first:true},'chat',1000);evidenceUpdate(earlierSuccess,'phoneme',{first:false,wrongs:1},'chou',2*86400000-1000);evidenceUpdate(earlierSuccess,'phoneme',{first:true},'mouche',2*86400000);checkLiteracy(earlierSuccess.evidence.phoneme.later===1,'Later retrieval uses last unaided success, not most recent error');evidenceUpdate(earlierSuccess,'phoneme',{first:true},'mouche',4*86400000);checkLiteracy(earlierSuccess.evidence.phoneme.later===1,'Same heard word is not a new transfer example');
const heardExamples=new Map();for(let i=0;i<100;i++){const item=withSeed(14000+i,()=>itEcoute(LESSONS[LIDX.a],{usedE:new Set()}));checkLiteracy(item.exemplar?.startsWith('hear:'),'Hearing task identifies its actual target');const heardWord=item.exemplar.slice(5);checkLiteracy(WORDS.some(w=>w.w===heardWord),'Hearing identity names a known target');if(!heardExamples.has(item.exemplar))heardExamples.set(item.exemplar,new Set());heardExamples.get(item.exemplar).add(JSON.stringify(item.say));}checkLiteracy(heardExamples.size>1,'Different heard targets produce different exemplars');checkLiteracy([...heardExamples.values()].some(variants=>variants.size>1),'Different distractors do not invent a new exemplar for the same target');

// Seven oral difficulties, 100 reproducible trials each. The user must choose
// an object when alternatives exist; correct objects may occupy every tray slot.
checkLiteracy(ORAL_LEVELS.length===7,'Seven oral stages');
for(let li=0;li<ORAL_LEVELS.length;li++){
 const L=ORAL_LEVELS[li],positions=new Set();
 for(let trial=0;trial<100;trial++){
  const seed=9000+li*100+trial,m=withSeed(seed,()=>oralModel(L));
  checkLiteracy(m.objs.length===L.objects&&m.zones.length===L.zones&&m.steps.length===L.actions,'Oral model respects stage capacity');
  checkLiteracy(new Set(m.steps.map(s=>s.object.id)).size===L.actions&&new Set(m.steps.map(s=>s.zone.id)).size===L.actions,'One object per action, no collision between destinations');
  for(const s of m.steps)checkLiteracy(m.objs.includes(s.object)&&m.zones.includes(s.zone)&&s.zone.x>=0&&s.zone.x<=100&&s.zone.y>=0&&s.zone.y<=100,'Every requested move is reachable');
  const first=m.steps[0],second=m.steps[1];checkLiteracy(m.instruction.includes(first.object.name)&&m.instruction.includes(first.zone.name),'Instruction names target and relation');
  if(second)checkLiteracy(m.instruction.includes(second.object.name)&&m.instruction.includes(second.zone.name)&&(L.before?m.instruction.startsWith('Avant de mettre'):m.instruction.includes(', puis mets')),'Two actions spoken in requested syntax');
  const item=withSeed(seed,()=>oralItem({L,li})),stage=nodeLiteracy(),api=apiLiteracy();withSeed(seed+777,()=>item.render(stage,api));
  const objects=stage.querySelectorAll('.object-pick'),zones=stage.querySelectorAll('.place-zone');positions.add(objects.findIndex(b=>b.getAttribute('aria-label')===first.object.name));
  if(L.objects>1){checkLiteracy(!objects.some(b=>b.classList.contains('selected')),'No answer preselected with multiple objects');zones[m.zones.indexOf(first.zone)].click();checkLiteracy(api.steps.length===0&&api.answers.length===0,'Touching a destination before choosing an object does not answer');}
  objects.find(b=>b.getAttribute('aria-label')===first.object.name).click();zones[m.zones.indexOf(first.zone)].click();
  checkLiteracy(objects.find(b=>b.getAttribute('aria-label')===first.object.name).disabled,'Placed object cannot be reused');
  if(second){checkLiteracy(api.answers.length===0&&!objects.some(b=>b.classList.contains('selected')),'Second action requires a fresh choice');const prior=api.steps.length;zones[m.zones.indexOf(second.zone)].click();checkLiteracy(api.steps.length===prior,'Second destination alone does not answer');objects.find(b=>b.getAttribute('aria-label')===second.object.name).click();zones[m.zones.indexOf(second.zone)].click();}
  checkLiteracy(api.answers.length===1&&api.answers[0]===true,'All requested moves finish once');
 }
 if(L.objects>1)checkLiteracy(positions.size===L.objects,'Correct object does not stay in a fixed tray position');
}

// Redesigned chronology is exercised separately in narrative.test.cjs:
// distinct unscored model, 2–4 frames, direct completion, help tracking.

// Every actual book must have two unique, answerable questions. Exercise the
// shuffled real choice handlers to prevent cover-emoji or positional answers.
checkLiteracy(MINI_BOOKS.length===12,'Twelve books');let questionCount=0;
for(const b of MINI_BOOKS){const qs=BOOK_QUESTIONS[b.id];checkLiteracy(qs?.length===2&&new Set(qs.map(q=>q.id)).size===2,'Two distinct questions for '+b.id);checkLiteracy(miniBookRequirement(b)!==null,'Known grapheme requirements '+b.id);for(const q of qs){questionCount++;checkLiteracy(q.text.endsWith('?')&&q.options.length===3&&new Set(q.options.map(o=>o.id)).size===3&&q.options.filter(o=>o.id===q.answer).length===1,'Valid unique book answer '+b.id+':'+q.id);checkLiteracy(q.options.every(o=>o.picture&&o.label)&&new Set(q.options.map(o=>o.picture)).size===3,'Visually distinguishable book options');const api=apiLiteracy(),row=pictureChoices(q.options,q.answer,api),target=q.options.find(o=>o.id===q.answer),wrong=q.options.find(o=>o.id!==q.answer);row.querySelectorAll('.scene-choice').find(b=>b.getAttribute('aria-label')===wrong.label).click();row.querySelectorAll('.scene-choice').find(b=>b.getAttribute('aria-label')===target.label).click();checkLiteracy(api.answers[0]===false&&api.answers[1]===true,'Only intended picture accepted '+b.id);}}
checkLiteracy(questionCount===24,'Twenty-four book questions');

// Message eligibility depends on every word, including the function words.
checkLiteracy(messagePool(0).length===0&&messagePool(LESSONS.length-1).length===3,'Messages withheld until their graphemes are introduced');
let previous=[];for(let li=0;li<LESSONS.length;li++){const pool=messagePool(li);checkLiteracy(previous.every(g=>pool.includes(g)),'Message eligibility is monotone');for(const gift of pool){const requirements=[WORDS.find(w=>w.w===gift.word).req,...['une','pour','lola','milo'].map(t=>reqOf(parseNotation(MINI_NOTATION[t])).req)];checkLiteracy(requirements.every(r=>r<=li),'Every printed message word has known graphemes');}previous=pool;}
for(const gift of GIFT_WORDS)for(const person of ['lola','milo']){const card=messageCard(gift,person,'qa-message');checkLiteracy(card.kind==='visit'&&card.items.length===5&&card.items.every(o=>Number.isFinite(o.x)&&o.x>0&&o.x<700&&o.y>0&&o.y<400),'Message card objects within canvas');const text=card.items.filter(o=>o.letter).map(o=>o.text).join(' ');checkLiteracy(text==='Une '+gift.word+' pour '+(person==='lola'?'Lola.':'Milo.'),'Message spacing and punctuation preserved');}
const savedName=kid().name;kid().name='<script>alert(1)</script>';const hostileCard=messageCard({word:'<img onerror=alert(1)>',em:'<script>x</script>'},'lola','qa-hostile');const safeSVG=visitSVG(hostileCard);checkLiteracy(!/<script|<img/i.test(safeSVG)&&safeSVG.includes('&lt;script&gt;')&&safeSVG.includes('&lt;img'),'Message SVG escapes supplied text');kid().name=savedName;

// Four-item revision remains the same after an interrupted series, while
// routing due skills preserves the active child and existing rewards.
P().lecture.unlocked=18;P().resume=null;P().evidence={'gp:a':{due:0,seen:[]},'encoding:words':{due:1,seen:['papa']},'reading:words':{due:2,seen:['papa']}};
const session=resumeSession('game',{gid:'rappel',li:0}),ctxRecall={L:GAMES.rappel.levels[0],li:0,bag:{},i:0};GAMES.rappel.make(ctxRecall);const planBefore=JSON.stringify(session.reviewPlan);checkLiteracy(session.reviewPlan.length===4&&session.reviewPlan.some(t=>t.kind==='write'),'Revision includes due encoding and four tasks');
for(let i=0;i<4;i++){const t=session.reviewPlan[i],item=GAMES.rappel.make({...ctxRecall,i});checkLiteracy(typeof item.render==='function','Every planned review item can render');if(t.kind==='letter')checkLiteracy(LIDX[t.k]<=18,'No untaught letter in review');else checkLiteracy(WORDS.find(w=>w.w===t.word)?.req<=18,'No untaught word in review');}
P().evidence={};const resumed={L:GAMES.rappel.levels[0],li:0,bag:{},i:2};GAMES.rappel.make(resumed);checkLiteracy(JSON.stringify(resumed.bag.plan)===planBefore&&JSON.stringify(session.reviewPlan)===planBefore,'Interrupted review retains exact plan');
P().resume=null;const starsBefore=seriesRewards().stars;
for(const [key,id]of [['oral:placement:0','mots'],['narrative:order','recit'],['book:chat:ecoute','livres'],['writing:message','messages'],['writing:letter:a','mots'],['cursive:cursive-liee-v1:trace:a','cursive'],['encoding:words','rappel'],['reading:words','rappel'],['gp:a','rappel']]){P().evidence={[key]:{due:0,seen:[]}};checkLiteracy(recommendedGame()===id,'Due skill routes to reachable activity '+key);}
checkLiteracy(seriesRewards().stars===starsBefore&&S.current==='luca','Planning and recommendations do not reward or switch children');
for(const id of ['lecture','recit','rappel','messages'])checkLiteracy(themesOf('grands').some(t=>t.ids.includes(id)),'New activity reachable '+id);
checkLiteracy(!themesOf('grands').some(t=>t.ids.includes('consignes')),'Oral placement intentionally removed for Luca');
P().evidence={'gp:legacy-unknown':{due:0,seen:[]}};checkLiteracy(recommendedGame()!=='rappel','Unknown legacy reading keys do not create an empty review');
S.current='lola';S.world='petits';P().resume=null;P().evidence={};checkLiteracy(recommendedGame()==='consignesP','Preschool suggestion uses preschool progression');for(const [key,id]of [['oral:placement:0','consignesP'],['narrative:order','recitP']]){P().evidence={[key]:{due:0,seen:[]}};checkLiteracy(recommendedGame()===id&&themesOf('petits').some(t=>t.ids.includes(id)),'Preschool due skill routes to its own progression '+key);}
`,ctx,{timeout:20000});
assert.ok(!/autonomousDecodingValidated\s*:\s*true/.test(source),'The app must not certify autonomous decoding from comprehension choices');
console.log('Lecture/langage : phonèmes, 700 modèles oraux, gestes réels, récits progressifs, 24 questions, messages et rappels vérifiés.');
