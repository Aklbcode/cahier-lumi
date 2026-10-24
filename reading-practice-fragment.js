/* Written/audio matching, reading to act, and optional brief word exposure.
   None of these tasks measures a child's oral reading or certifies fluency. */
const READING_PRACTICE_VOICE=[
 'Lis le mot inventé. Écoute les trois propositions, puis choisis celle qui correspond.',
 'Écouter une proposition ne compte pas comme une réponse.',
 'Tu as associé le mot écrit aux bons sons.',
 'Regarde chaque syllabe du mot écrit. Tu peux réécouter les propositions.',
 'Lis la phrase. Choisis l’objet, puis touche sa place.',
 'Relis la phrase. Regarde l’objet et sa place.',
 'L’action correspond à la phrase.',
 'Regarde les deux cases qui brillent.',
 'Quand tu es prêt, touche Voir le mot. Ensuite, choisis son image.',
 'Lis le mot, puis choisis son image. Tu peux prendre ton temps.',
 'Tu as retrouvé l’image du mot.',
 'Regarde encore le mot. Choisis l’image qui correspond.',
 'Tu peux revoir le mot aussi longtemps que tu veux.',
 'Découvre d’abord les sons nécessaires dans Apprendre à lire.',
 'Commence par les mots sans disparition pour les découvrir tranquillement.'
];
function readingPracticeKnownKeys(p=P()){
 if(p.demo)return new Set(LESSONS.map(L=>L.k));
 return new Set(LESSONS.filter((L,i)=>{const e=p.lecture?.pass?.[i];return e&&!e.review&&!e.parent;}).map(L=>L.k));
}
function readingPracticeParentOpened(gid,p=P()){return !!p.familyAccess?.[gid]||(p.parentActions||[]).some(a=>!a.undone&&a.target?.kind==='game'&&a.target.gid===gid&&['open','unlock','skip'].includes(a.action));}
function readingPracticeTrainingProfile(gid,p=P()){return readingPracticeParentOpened(gid,p)?{...p,demo:true}:p;}
function readingPracticeTrainingNote(training){return training?h('p',{class:'u-note reading-training-note'},'Avec une aide'):null;}
function readingNotationKeys(notation){return [...reqOf(parseNotation(notation)).keys];}
function readingKeysAvailable(keys,p=P()){const known=readingPracticeKnownKeys(p);return keys.every(k=>known.has(k));}
const PSEUDO_GROUPS=[
 [['la','li'],['lu','li'],['la','lu']],
 [['mu','li'],['mu','lu'],['mu','mi']],
 [['fa','li'],['fa','mi'],['fa','mu']],
 [['cha','li'],['cha','mi'],['cha','mu']],
 [['va','ni'],['va','mi'],['va','ji']],
 [['mou','mi'],['mou','ni'],['mou','vi']],
 [['ba','lu'],['da','lu'],['ta','lu']],
 [['ba','mu','li'],['da','mu','li'],['ta','mu','li']]
].map((group,index)=>({index,words:group.map(syllables=>({word:syllables.join(''),syllables,keys:readingNotationKeys(syllables.map(s=>s.match(/ch|ou|[a-zéè]/g).join('.')).join('-'))}))}));
function pseudoGroupAvailable(group,p=P()){return group.words.every(w=>readingKeysAvailable(w.keys,p));}
function pseudoAudio(word){return word.syllables.flatMap((s,i)=>i?[65,sylUnit(s,.85)]:[sylUnit(s,.85)]);}
function readingPracticeBlocked(gid){const text=gid==='lectureEclair'?READING_PRACTICE_VOICE[14]:READING_PRACTICE_VOICE[13];return {cls:'upgrade-stage',say:text,caption:'Les sons et les mots d’abord',evidenceKey:'practice:unavailable',exemplar:gid,render(st,api){uWrap(st,h('p',{class:'u-note'},text),uButton('Retour aux jeux',()=>{if(api.alive())Shell.close();}));}};}
function pseudoReadingItem(ctx){
 const p=P(),group=PSEUDO_GROUPS[ctx.L.group],normal=pseudoGroupAvailable(group,p),training=!normal&&readingPracticeParentOpened('pseudoMot',p);if(!normal&&!training)return readingPracticeBlocked('pseudoMot');
 const word=avoidRepeat(ctx,group.words,w=>w.word),options=shuffle(group.words);
 return {cls:'upgrade-stage reading-practice-stage',say:READING_PRACTICE_VOICE[0],caption:'Lis le mot inventé',helped:training,evidenceKey:training?'practice:written-audio:pseudo-training':'practice:written-audio:pseudo-v1',exemplar:word.word,pseudoModel:{word,options},training,render(st,api){
  if(training)api.help();
  const choices=h('div',{class:'reading-audio-choices'});for(const [i,option]of options.entries()){
   const listen=uButton('🔊 '+(i+1),()=>{if(api.alive())Voice.say(pseudoAudio(option));},{'aria-label':'Écouter la proposition '+(i+1),'data-audio-option':i});
   const choose=uButton('Choisir '+(i+1),()=>api.answer(option.word===word.word,{praise:READING_PRACTICE_VOICE[2],feedback:READING_PRACTICE_VOICE[3]}),{'data-choose-option':i});choices.append(h('div',{class:'reading-audio-option'},listen,choose));
  }
  uWrap(st,readingPracticeTrainingNote(training),h('div',{class:'reading-practice-word'},word.word),choices);
 }};
}
const READ_ACT_OBJECTS=[
 {id:'pomme',article:'La',word:'pomme',em:'🍎',notation:'p.o.mm.*e'},
 {id:'balle',article:'La',word:'balle',em:'⚽',notation:'b.a.ll.*e'},
 {id:'chat',article:'Le',word:'chat',em:'🐱',notation:'ch.a.*t'}
].map(o=>({...o,keys:readingNotationKeys(o.notation)}));
const READ_ACT_ZONES=[
 {id:'sur',phrase:'sur la table',notation:'s.u.r-l.a-t.a-b.l.*e',x:73,y:27},
 {id:'sous',phrase:'sous la table',notation:'s.ou.*s-l.a-t.a-b.l.*e',x:73,y:78},
 {id:'dans',phrase:'dans le bol',notation:'d.an.*s-l.e-b.o.l',x:22,y:58},
 {id:'cote',phrase:'à côté du bol',notation:'à-c.ô-t.é-d.u-b.o.l',x:43,y:66}
].map(z=>({...z,keys:readingNotationKeys(z.notation)}));
const READ_ACT_BASE_KEYS=readingNotationKeys('l.a-l.e-v.a');
function readActSentence(object,zone){return object.article+' '+object.word+' va '+zone.phrase+'.';}
function readActAvailable(L,p=P()){
 const zones=READ_ACT_ZONES.filter(z=>L.zones.includes(z.id));return readingKeysAvailable(READ_ACT_BASE_KEYS,p)&&zones.every(z=>readingKeysAvailable(z.keys,p))&&READ_ACT_OBJECTS.filter(o=>readingKeysAvailable(o.keys,p)).length>=L.objects;
}
function readActModel(ctx,p=P()){
 const pool=READ_ACT_OBJECTS.filter(o=>readingKeysAvailable(o.keys,p)),objects=sample(pool,ctx.L.objects),zones=READ_ACT_ZONES.filter(z=>ctx.L.zones.includes(z.id)),placements=sample(zones,ctx.L.actions),steps=Array.from({length:ctx.L.actions},(_,i)=>({object:objects[i%objects.length],zone:placements[i]}));
 return {objects,zones,steps,text:steps.map(s=>readActSentence(s.object,s.zone)).join(' ')};
}
function readActScene(){return '<svg viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true"><path d="M0 234H620V330H0Z" fill="#d8e8cf"/><path d="M390 139L375 292M518 139L535 292" fill="none" stroke="#986947" stroke-width="16"/><rect x="355" y="125" width="195" height="28" rx="8" fill="#bd895b" stroke="#785237" stroke-width="4"/><path d="M48 182Q137 281 218 182Z" fill="#83b8d2" stroke="#42677c" stroke-width="5"/><ellipse cx="133" cy="182" rx="85" ry="16" fill="#d7eff6" stroke="#42677c" stroke-width="4"/></svg>';}
function readActItem(ctx){
 const p=P(),normal=readActAvailable(ctx.L,p),training=!normal&&readingPracticeParentOpened('lisFais',p);if(!normal&&!training)return readingPracticeBlocked('lisFais');const model=readActModel(ctx,training?readingPracticeTrainingProfile('lisFais',p):p);
 return {cls:'upgrade-stage reading-practice-stage',say:READING_PRACTICE_VOICE[4],caption:'Lis, puis fais l’action',helped:training,evidenceKey:training?'practice:read-and-act:training':'practice:read-and-act:v1',exemplar:model.text,readActModel:model,training,render(st,api){
  if(training)api.help();
  let selected=null,at=0;const sentence=h('p',{class:'read-act-sentence'},model.text),objects=h('div',{class:'urow'}),scene=h('div',{class:'read-act-scene',html:readActScene()}),objectButtons=new Map(),zoneButtons=new Map();
  const draw=()=>{for(const [id,b]of objectButtons)b.classList.toggle('selected',id===selected?.id);};
  for(const object of shuffle(model.objects)){const b=uButton('',()=>{if(!api.alive()||b.disabled)return;selected=object;draw();},{class:'object-pick','data-read-object':object.id,'aria-label':object.word});b.append(lumiIllustration(object.em,object.word));objects.append(b);objectButtons.set(object.id,b);}
  for(const zone of model.zones){const b=uButton('+',()=>{if(!api.alive()||at>=model.steps.length)return;if(!selected)return;const step=model.steps[at];if(selected.id!==step.object.id||zone.id!==step.zone.id)return api.step(false,{el:b,feedback:READING_PRACTICE_VOICE[5]});b.textContent='';b.append(lumiIllustration(selected.em,selected.word));objectButtons.get(selected.id).disabled=true;selected=null;at++;draw();if(at===model.steps.length)return api.answer(true,{praise:READING_PRACTICE_VOICE[6]});api.step(true);},{class:'place-zone','data-read-zone':zone.id,'aria-label':'Place '+(model.zones.indexOf(zone)+1),style:{left:zone.x+'%',top:zone.y+'%'}});zoneButtons.set(zone.id,b);scene.append(b);}
  const aid=uButton('🔊 Écouter la phrase',()=>{if(!api.alive())return;api.help();Voice.say(model.text);},{'data-reading-aid':'phrase'});
  api.strategy=()=>{const step=model.steps[at];if(!step)return;api.help();objectButtons.get(step.object.id).classList.add('reveal');zoneButtons.get(step.zone.id).classList.add('reveal');};
  uWrap(st,readingPracticeTrainingNote(training),sentence,objects,scene,aid);
 }};
}
function readingWordKnown(word,p=P()){
 if(p.demo)return true;if((p.readingPractice?.knownWords?.[word]?.alone||0)>0)return true;
 const e=p.evidence?.['reading:words'];return !!(e&&e.lastResult==='alone'&&e.seen?.[0]===word);
}
function readingPracticeWordPool(L,p=P()){return WORDS.filter(w=>{const n=w.gs.filter(g=>!g.mute).length;return w.req<LESSONS.length&&picOK(w)&&n>=(L.min||0)&&n<=L.max&&readingKeysAvailable([...w.keys],p);});}
function readingFlashPool(L,p=P()){const pool=readingPracticeWordPool(L,p);return pool.filter(w=>(L.calibrate||readingWordKnown(w.w,p))&&pool.filter(o=>o.w!==w.w&&o.e!==w.e&&!similar(o.e,w.e)).length>=2);}
function readingFlashRecord(p,word,{alone,mode,ms,band=0}){
 const all=p.readingPractice||(p.readingPractice={}),known=all.knownWords||(all.knownWords={}),e=known[word]||(known[word]={alone:0,aided:0});if(alone)e.alone++;else e.aided++;e.last={at:Date.now(),mode,ms,oralReadingMeasured:false};if(alone&&mode==='brief'){const durations=all.flashMsBands||(all.flashMsBands={});durations[band]=Math.max(1000,(durations[band]||2000)-100);}save();
}
function readingFlashItem(ctx){
 const p=P(),normalPool=readingPracticeWordPool(ctx.L,p),normalTargets=readingFlashPool(ctx.L,p),training=(normalPool.length<3||!normalTargets.length)&&readingPracticeParentOpened('lectureEclair',p),content=training?readingPracticeTrainingProfile('lectureEclair',p):p,pool=readingPracticeWordPool(ctx.L,content),targets=readingFlashPool(ctx.L,content);if(pool.length<3||!targets.length)return readingPracticeBlocked('lectureEclair');
 const word=avoidRepeat(ctx,targets,w=>w.w),options=shuffle([word,...sample(pool.filter(w=>w.w!==word.w&&w.e!==word.e&&!similar(w.e,word.e)),2)]);if(options.length<3)return readingPracticeBlocked('lectureEclair');
 const ms=clamp(p.readingPractice?.flashMsBands?.[ctx.L.band||0]||2000,1000,2000);
 return {cls:'upgrade-stage reading-practice-stage',say:ctx.L.calibrate?READING_PRACTICE_VOICE[9]:READING_PRACTICE_VOICE[8],caption:ctx.L.calibrate?'Lis sans disparition':'Regarde le mot, puis retrouve son image',helped:training,evidenceKey:training?'practice:visual-word-recognition:training':'practice:visual-word-recognition:v1',exemplar:word.w,flashModel:{word,options,ms},training,render(st,api){
  if(training)api.help();
  let begun=false,helped=training||!!RUN?.session?.partialHelped,wrongs=RUN?.session?.partialWrongs||0,untimed=training||!!ctx.L.calibrate||!!p.readingPractice?.flashUntimed,timer=null,recorded=false;
  const display=h('div',{class:'reading-practice-word',hidden:true},word.w),choices=h('div',{class:'row pics',hidden:true}),note=h('p',{class:'u-note'},''),start=uButton('Voir le mot',()=>{if(!api.alive()||begun)return;begun=true;start.hidden=true;display.hidden=false;if(untimed)choices.hidden=false;else timer=setTimeout(()=>{if(!api.alive())return;display.hidden=true;choices.hidden=false;reveal.hidden=false;},ms);},{'data-flash-action':'start'});
  const reveal=uButton('Revoir le mot',()=>{if(!api.alive())return;helped=true;api.help();clearTimeout(timer);display.hidden=false;choices.hidden=false;note.textContent=READING_PRACTICE_VOICE[12];reveal.hidden=true;},{'data-flash-action':'reveal'});reveal.hidden=true;
  const free=uButton('Garder le mot visible',()=>{if(!api.alive())return;untimed=!untimed;const q=p.readingPractice||(p.readingPractice={});q.flashUntimed=untimed;free.setAttribute('aria-pressed',String(untimed));if(begun){helped=true;api.help();clearTimeout(timer);display.hidden=false;choices.hidden=false;}save();},{'data-flash-action':'untimed','aria-pressed':String(untimed)});free.hidden=training||!!ctx.L.calibrate;
  for(const option of options){const b=uButton('',async()=>{if(!api.alive()||!begun||choices.hidden)return;if(option!==word){wrongs++;return api.answer(false,{el:b,feedback:READING_PRACTICE_VOICE[11]});}clearTimeout(timer);const accepted=await api.answer(true,{el:b,praise:READING_PRACTICE_VOICE[10]});if(accepted===true&&!recorded){recorded=true;readingFlashRecord(p,word.w,{alone:!helped&&wrongs===0,mode:untimed?'untimed':'brief',ms:untimed?null:ms,band:ctx.L.band||0});}},{class:'card','data-flash-word':option.w,'aria-label':option.w});b.append(lumiIllustration(option.e,option.w));choices.append(b);}
  api.strategy=()=>{helped=true;api.help();clearTimeout(timer);display.hidden=false;choices.hidden=false;note.textContent=READING_PRACTICE_VOICE[12];};uWrap(st,readingPracticeTrainingNote(training),start,display,choices,h('div',{class:'urow'},reveal,free),note);
 }};
}
function readingPracticeAccess(gid,p=P()){
 if(readingPracticeParentOpened(gid,p))return {ready:true,parent:true,training:true,missing:[]};
 const g=GAMES[gid],L=g?.levels?.[clamp(p.games?.[gid]?.lvl||0,0,g.levels.length-1)];
 if(gid==='pseudoMot'){const group=PSEUDO_GROUPS[L.group];return {ready:pseudoGroupAvailable(group,p),missing:uniq(group.words.flatMap(w=>w.keys).filter(k=>!readingPracticeKnownKeys(p).has(k)))};}
 if(gid==='lisFais')return {ready:readActAvailable(L,p),missing:[...new Set([...READ_ACT_BASE_KEYS,...READ_ACT_ZONES.filter(z=>L.zones.includes(z.id)).flatMap(z=>z.keys),...READ_ACT_OBJECTS.slice(0,L.objects).flatMap(o=>o.keys)])].filter(k=>!readingPracticeKnownKeys(p).has(k))};
 if(gid==='lectureEclair')return {ready:readingPracticeWordPool(L,p).length>=3&&readingFlashPool(L,p).length>0,missing:[]};return {ready:true,missing:[]};
}
GAMES.pseudoMot={id:'pseudoMot',title:'Le mot du monstre',sub:'Associer un mot inventé et ses sons',icon:'👾',color:'plum',stage:'#f4f0fa',preReq:{kind:'independent-graphemes',access:()=>readingPracticeAccess('pseudoMot')},levels:['Les syllabes avec l','Les syllabes avec m','Les syllabes avec f','Le son ch','Les consonnes v, n et j','Le son ou','Les consonnes b, d et t','Trois syllabes inventées'].map((name,group)=>({name,group,n:3,skill:'practice:pseudo:'+group,tag:'P1',ref:'Choix écrit–audio avec syllabes enregistrées ; ne mesure pas une lecture orale'})),make:pseudoReadingItem};
GAMES.lisFais={id:'lisFais',title:'Lis et fais',sub:'Comprendre une phrase et agir',icon:'📝',color:'teal',stage:'#edf5f0',preReq:{kind:'independent-graphemes',access:()=>readingPracticeAccess('lisFais')},levels:[
 {name:'Un objet : sur ou sous',objects:2,zones:['sur','sous'],actions:1},
 {name:'Trois objets et deux places',objects:3,zones:['sur','sous'],actions:1},
 {name:'Dans le bol ou sur la table',objects:3,zones:['sur','dans'],actions:1},
 {name:'À côté du bol',objects:3,zones:['dans','cote'],actions:1},
 {name:'Deux phrases dans l’ordre',objects:2,zones:['sur','sous'],actions:2},
 {name:'Deux actions et quatre places',objects:3,zones:['sur','sous','dans','cote'],actions:2}
].map((L,i)=>({...L,n:3,skill:'practice:read-act:'+i,tag:'P1',ref:'Action après lecture écrite ; écouter la phrase reste une aide explicite'})),make:readActItem};
GAMES.lectureEclair={id:'lectureEclair',title:'Lecture éclair',sub:'Retrouver l’image de mots déjà rencontrés',icon:'💡',color:'sky',stage:'#edf4fa',preReq:{kind:'independent-graphemes',access:()=>readingPracticeAccess('lectureEclair')},levels:[
 {name:'Découvrir les petits mots',max:4,band:0,calibrate:true},
 {name:'Revoir les petits mots',max:4,band:0},
 {name:'Découvrir des mots plus longs',min:4,max:6,band:1,calibrate:true},
 {name:'Revoir les mots plus longs',min:4,max:6,band:1},
 {name:'Découvrir les grands mots',min:5,max:8,band:2,calibrate:true},
 {name:'Revoir les grands mots',min:5,max:8,band:2}
].map((L,i)=>({...L,n:4,skill:'practice:flash:'+i,tag:'P1',ref:'Association visuelle mot/image, affichage libre ou 1–2 secondes ; aucune mesure de fluence orale'})),make:readingFlashItem};
for(const gid of ['pseudoMot','lisFais','lectureEclair']){SIMPLE_GAME_NAMES[gid]=GAMES[gid].title;if(!WORLD_TILES.grands.includes(gid))WORLD_TILES.grands.push(gid);const theme=THEMES.grands.find(t=>t.id==='lire');if(!theme.ids.includes(gid))theme.ids.push(gid);if(!THEME_DIFFICULTY_ORDER.grands.lire.includes(gid))THEME_DIFFICULTY_ORDER.grands.lire.push(gid);}
function readingPracticeVoiceLines(){const clauses=READ_ACT_OBJECTS.flatMap(o=>READ_ACT_ZONES.map(z=>readActSentence(o,z)));return [...READING_PRACTICE_VOICE,...clauses,...clauses.flatMap(a=>clauses.map(b=>a+' '+b)),...WORDS.filter(picOK).map(w=>w.w)];}
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`.reading-practice-word{font-size:clamp(44px,8vw,76px);line-height:1.8;text-align:center;min-height:100px;padding:4px 18px}.reading-audio-choices{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}.reading-audio-option{display:flex;flex-direction:column;gap:9px}.reading-audio-option .ubtn{min-width:115px;min-height:60px}.read-act-sentence{font-size:clamp(23px,3.3vw,32px);line-height:1.8;text-align:center;max-width:780px;margin:0}.read-act-scene{position:relative;width:min(620px,90vw);height:330px;max-height:36vh;background:#eaf4fa;border-radius:20px}.read-act-scene svg{width:100%;height:100%;display:block}.read-act-scene .place-zone{font-size:28px}.reading-practice-stage .object-pick .lumi-illustration{width:60px;height:60px}.reading-practice-stage .card{min-width:95px;min-height:100px}.reading-practice-stage .card .lumi-illustration{width:90px;height:90px}.reading-practice-stage .ubtn{line-height:1.8}@media(max-width:560px){.reading-audio-option .ubtn{min-width:90px;min-height:55px}.read-act-scene{height:250px}.reading-practice-word{min-height:80px}}`;document.head.append(style);}
