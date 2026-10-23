/* Lecture, langage et écriture : révision du 23 octobre 2026.
   Source maintenue séparément puis intégrée au fichier autonome index.html. */
const LITERACY_VOICE = [
 'Écoute, puis place les objets.', 'Choisis un objet, puis touche sa place.',
 'Écoute encore. Choisis le bon objet et sa place.', 'Regarde, je te montre cette place.',
 'Oui, les objets sont à leur place !', 'Regarde les images. Remets cette petite histoire dans l’ordre.',
 'Touche d’abord ce qui se passe au début.', 'Écoute les images pour retrouver le début de l’histoire.',
 'Oui, ton histoire est dans l’ordre !', 'Touche une image pour écouter ce qui s’y passe.',
 'Écoute la question. Les images te proposent plusieurs réponses.', 'Repense à l’histoire. Tu peux la réécouter.',
 'Écoute le mot. Choisis un jeton pour chaque son que tu entends.',
 'Maintenant, choisis les lettres dans l’ordre.', 'Choisis les lettres dans l’ordre.',
 'Un petit rappel des sons et des mots que tu connais.', 'Tu peux écouter la question encore une fois.',
 'Regarde le petit modèle. Tu peux écouter le prénom.', 'Écoute les deux phrases. Choisis celle qui raconte cette image.'
];

/* Only these manually enumerated, unambiguous words enter phoneme counting.
   The grapheme inventory is NEVER used as a general phoneme counter. */
const SOUND_WORDS = {
 riz:['ʁ','i'], mamie:['m','a','m','i'], lama:['l','a','m','a'], mur:['m','y','ʁ'],
 fil:['f','i','l'], fée:['f','e'], fumée:['f','y','m','e'], chat:['ʃ','a'],
 vélo:['v','e','l','o'], vache:['v','a','ʃ'], olive:['ɔ','l','i','v'], vis:['v','i','s'],
 âne:['ɑ','n'], lune:['l','y','n'], nid:['n','i'], jus:['ʒ','y'], chou:['ʃ','u'],
 ours:['u','ʁ','s'], mouche:['m','u','ʃ'], loup:['l','u'], souris:['s','u','ʁ','i'],
 roue:['ʁ','u'], papa:['p','a','p','a'], pomme:['p','ɔ','m'], puma:['p','y','m','a'],
 pile:['p','i','l'], poule:['p','u','l'], épée:['e','p','e'], poupée:['p','u','p','e'],
 soupe:['s','u','p'], loupe:['l','u','p'], tomate:['t','ɔ','m','a','t'],
 tasse:['t','a','s'], tulipe:['t','y','l','i','p'], patate:['p','a','t','a','t'],
 moto:['m','o','t','o'], pirate:['p','i','ʁ','a','t'], lit:['l','i'], tour:['t','u','ʁ'],
 rat:['ʁ','a'], dé:['d','e'], salade:['s','a','l','a','d'], dodo:['d','o','d','o'],
 malade:['m','a','l','a','d'], judo:['ʒ','y','d','o'], bébé:['b','e','b','e'],
 bulle:['b','y','l'], robe:['ʁ','ɔ','b'], bus:['b','y','s'], biche:['b','i','ʃ'],
 bol:['b','ɔ','l'], bouche:['b','u','ʃ'], ballon:['b','a','l','ɔ̃'],
 mouton:['m','u','t','ɔ̃'], bonbon:['b','ɔ̃','b','ɔ̃'], savon:['s','a','v','ɔ̃'],
 pont:['p','ɔ̃'], maman:['m','a','m','ɑ̃'], dent:['d','ɑ̃'], tente:['t','ɑ̃','t'],
 ruban:['ʁ','y','b','ɑ̃'], vent:['v','ɑ̃'], enfant:['ɑ̃','f','ɑ̃'],
 cube:['k','y','b'], carotte:['k','a','ʁ','ɔ','t'], canard:['k','a','n','a','ʁ'],
 sac:['s','a','k'], coq:['k','ɔ','k'], goutte:['g','u','t'], gant:['g','ɑ̃'],
 lapin:['l','a','p','ɛ̃'], sapin:['s','a','p','ɛ̃'], pain:['p','ɛ̃'], main:['m','ɛ̃'],
 train:['t','ʁ','ɛ̃'], fête:['f','ɛ','t'], lait:['l','ɛ'], balai:['b','a','l','ɛ'],
 pêche:['p','ɛ','ʃ'], feu:['f','ø'], jeu:['ʒ','ø'], bleu:['b','l','ø']
};
function phonemeCount(W){return SOUND_WORDS[W.w]?.length ?? null;}
/* /j/ and /w/ are not taught yet; do not pretend these words are fully decodable.
   Their pictures and natural whole-word audio remain usable in oral activities. */
const GLIDE_WORDS = new Set(['lion','avion','camion','violon','radio','pingouin','gorille']);
for(const W of WORDS)if(GLIDE_WORDS.has(W.w)){W.originalReq=W.req;W.req=99;}
const nounoursWord=WORDS.find(w=>w.w==='nounours');
if(nounoursWord){nounoursWord.syl=parseNotation('n.ou-n.ou.r.s');nounoursWord.gs=nounoursWord.syl.flat();const r=reqOf(nounoursWord.syl);nounoursWord.req=r.req;nounoursWord.keys=r.keys;}
const earBeforeLiteracy=safeEarWord;
safeEarWord=function(W,k){return !GLIDE_WORDS.has(W.w)&&earBeforeLiteracy(W,k);};
/* Keep the original encoding exercise when a phoneme analysis is not explicit. */
itDictee=function(W,li){
 const old=originalDictee(W,li),count=phonemeCount(W);
 old.say=['Écris le mot',W.w,'.',300,'Choisis les lettres dans l’ordre.'];
 old.evidenceKey='encoding:words';old.exemplar=W.w;
 if(count===null)return old;
 return {...old,say:[W.w,300,'Écoute le mot. Choisis un jeton pour chaque son que tu entends.'],render(st,api){let selected=0;const tokens=h('div',{class:'urow'});
 const draw=()=>{tokens.innerHTML='';for(let i=0;i<selected;i++)tokens.append(h('span',{class:'sound-token'},'●'));};
 const more=uButton('● Ajouter',()=>{if(selected<8){selected++;draw();}}),less=uButton('− Enlever',()=>{selected=Math.max(0,selected-1);draw();});
 api.strategy=()=>{tokens.innerHTML='';for(let i=0;i<count;i++)tokens.append(h('span',{class:'sound-token reveal'},'●'));setTimeout(()=>{if(api.alive())draw();},2200);};
 const next=uButton('✓ Les lettres',()=>{if(selected!==count)return api.step(false,{feedback:'Écoute le mot. Choisis un jeton pour chaque son que tu entends.'});st.innerHTML='';old.render(st,api);if(Shell.item){Shell.item.say=old.say;Shell.item.replay=old.replay;}Shell.caption(old.caption);Voice.say(['Maintenant, choisis les lettres dans l’ordre.',W.w]);});
 st.append(uButton('🔊',()=>Voice.say(W.w),{'aria-label':'Écouter le mot'}),h('p',{class:'u-note'},'Un jeton pour chaque son'),tokens,h('div',{class:'urow'},more,less),next);
 }};
};
const chainBeforeLiteracy=wordChainPairs;
wordChainPairs=function(pool){return chainBeforeLiteracy(pool).filter(({a,b})=>{const ap=SOUND_WORDS[a.w],bp=SOUND_WORDS[b.w];return ap&&bp&&ap.length===bp.length&&ap.filter((p,i)=>p!==bp[i]).length===1;});};

/* Stable content identity, not the generic instruction, determines delayed retrieval. */
const letterBeforeLiteracy=itLettre,formBeforeLiteracy=itForme,motBeforeLiteracy=itMot,phraseBeforeLiteracy=itPhrase,fusionBeforeLiteracy=itFusion;
itLettre=function(L,li,n){return {...letterBeforeLiteracy(L,li,n),evidenceKey:'gp:'+L.k,exemplar:'letter:'+L.main};};
itForme=function(L,li,alt,n){return {...formBeforeLiteracy(L,li,alt,n),evidenceKey:'gp:'+L.k,exemplar:'form:'+L.main+':'+alt};};
itMot=function(W,pool,n){return {...motBeforeLiteracy(W,pool,n),evidenceKey:'reading:words',exemplar:W.w};};
itPhrase=function(sentence){return {...phraseBeforeLiteracy(sentence),evidenceKey:'reading:sentences',exemplar:sentence.text};};
itFusion=function(L,li,mode,t,demo,n){return {...fusionBeforeLiteracy(L,li,mode,t,demo,n),evidenceKey:'gp:'+L.k,exemplar:mode+':'+t.w};};
/* Replace the earlier wrapper to avoid counting twice. */
Engine.play=async function(item,run){const p=P(),key=evidenceKey(item,run),signature=String(item.exemplar||JSON.stringify(item.say||item.caption||'')).slice(0,500);const r=await evidencePlay(item,run);if(!run.abort&&RUN===run){evidenceUpdate(p,key,r,signature);save();}return r;};
recommendedGame=function(){const p=P(),ids=themesOf(S.world).flatMap(t=>t.ids);if(p.resume){if(p.resume.kind==='lesson')return 'lecture';if(p.resume.kind==='module')return 'calcul';if(ids.includes(p.resume.gid))return p.resume.gid;}
 const due=Object.entries(p.evidence||{}).filter(([,e])=>e.due<=Date.now()).sort((a,b)=>a[1].due-b[1].due);
 for(const [key]of due){let id=key.startsWith('gp:')&&LIDX[key.slice(3)]!=null?'lecture':key.startsWith('encoding:')?'mots':key.startsWith('reading:')?'lecture':key.startsWith('calc:')?'calcul':key.startsWith('book:')?'livres':key.startsWith('oral:')?(S.world==='petits'?'consignesP':'consignes'):key.startsWith('narrative:')?(S.world==='petits'?'recitP':'recit'):key==='writing:message'?'messages':key.startsWith('writing:')?(S.world==='petits'?'pretrace':'trace'):key.startsWith('game:')?key.slice(5):null;if(ids.includes(id))return id;}
 return S.world==='petits'?'consignesP':(p.lecture.unlocked||0)<6?'lecture':'mots';
};

function literacyStyle(){const style=h('style');style.textContent=`
 .listen-scene{position:relative;width:min(620px,88vw);aspect-ratio:620/330;background:#eaf5fb;border-radius:28px;overflow:hidden}
 .listen-scene svg{width:100%;height:100%;display:block}.place-zone{position:absolute;transform:translate(-50%,-50%);width:17%;height:24%;border:3px dashed #7691a6;border-radius:18px;background:#ffffff70;font-size:clamp(28px,5vw,45px);padding:0;touch-action:manipulation}
 .place-zone.reveal{background:#fff2a7;outline:5px solid #f0ba31}.object-pick{min-width:75px;min-height:70px;font-size:44px;border:3px solid transparent;border-radius:18px;background:white}.object-pick.selected{border-color:#7657b8;background:#f3edff}.object-pick[disabled]{opacity:.4}
 .scene-choice{width:min(210px,27vw);border-radius:20px;border:3px solid #e2dcec;background:#fff;padding:8px;min-height:110px}.scene-choice svg{display:block;width:100%;height:auto}.scene-choice span{display:block;font-size:16px}.choice-voice{display:block;margin:5px auto 0;border:0;background:#edf4fc;border-radius:12px;min-width:44px;min-height:38px}.picture-options{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.picture-option{text-align:center}.sequence-slots{display:flex;justify-content:center;gap:10px;max-width:95%;flex-wrap:wrap}.sequence-slot{width:min(150px,20vw);aspect-ratio:1.1;border:3px dashed #b2a7c9;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;background:#ffffff80}.sequence-slot svg{width:100%;height:100%}.sequence-card{width:min(170px,23vw);border:3px solid #d9cde8;border-radius:20px;background:#fff;padding:6px}.sequence-card svg{width:100%;display:block}.sequence-card.used{visibility:hidden}.sequence-card.reveal{outline:5px solid #f2be43}
 .message-slots{gap:12px}.message-slots .slot{font-size:clamp(24px,4.8vw,36px);padding:8px 12px;min-width:64px;min-height:62px;line-height:1.3}
 .book-cast{display:flex;gap:18px;justify-content:center}.book-cast button{background:transparent;border:0;min-width:65px;font-size:17px}.book-cast svg{height:58px;width:58px}.book-page .book-scene{font-size:60px}.book-words{max-width:680px}.book-question{max-width:650px;text-align:center;font-size:clamp(19px,3vw,26px);font-weight:700}.sequence-tools{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
 @media(max-width:600px){.listen-scene{width:91vw}.place-zone{border-width:2px;border-radius:12px}.sequence-card{width:27vw}.scene-choice{width:27vw;padding:4px}.picture-options{gap:7px}.sequence-slots{gap:5px}.sequence-slot{width:20vw}.book-page .book-scene{font-size:45px}}
 `;document.head.append(style);}

/* A concrete oral-language task: object and relationship, then two ordered actions. */
const PLACE_OBJECTS=[{id:'pomme',em:'🍎',name:'la pomme'},{id:'balle',em:'⚽',name:'la balle'},{id:'ours',em:'🧸',name:'l’ours'}];
const PLACE_ZONES=[{id:'dans',x:19,y:58,name:'dans le panier'},{id:'sur',x:73,y:31,name:'sur le tabouret'},{id:'sous',x:73,y:79,name:'sous le tabouret'},{id:'cote',x:43,y:71,name:'à côté du panier'}];
function oralModel(L){const objs=sample(PLACE_OBJECTS,L.objects||1),zones=PLACE_ZONES.slice(0,L.zones||2),chosen=sample(zones,L.actions||1);const steps=chosen.map((z,i)=>({object:objs[i%objs.length],zone:z}));const a=steps[0],b=steps[1];const instruction=b?(L.before?`Avant de mettre ${b.object.name} ${b.zone.name}, mets ${a.object.name} ${a.zone.name}.`:`Mets ${a.object.name} ${a.zone.name}, puis mets ${b.object.name} ${b.zone.name}.`):`Mets ${a.object.name} ${a.zone.name}.`;return {objs,zones,steps,instruction};}
function oralScene(){return '<svg viewBox="0 0 620 330" aria-hidden="true"><path d="M0 232H620V330H0Z" fill="#d6e8cf"/><path d="M60 166Q116 150 176 166L162 235H74Z" fill="#d7a565" stroke="#9c704b" stroke-width="5"/><path d="M78 165Q120 70 159 165" fill="none" stroke="#b78a57" stroke-width="10"/><path d="M395 131L379 277M506 131L524 277" stroke="#a47553" stroke-width="16"/><rect x="370" y="121" width="170" height="30" rx="12" fill="#d7ad7e"/><path d="M394 211H513" stroke="#a47553" stroke-width="9"/></svg>';}
function oralItem(ctx){const m=oralModel(ctx.L);return {cls:'upgrade-stage',say:m.objs.length>1?['Choisis un objet, puis touche sa place.',300,m.instruction]:m.instruction,caption:m.instruction,exemplar:m.instruction,evidenceKey:'oral:placement:'+ctx.li,render(st,api){let selected=m.objs.length===1?m.objs[0]:null,at=0;const completed={},scene=h('div',{class:'listen-scene',html:oralScene()}),picks=h('div',{class:'urow'}),buttons=new Map();
 const draw=()=>{for(const [id,b]of buttons)b.classList.toggle('selected',id===selected?.id);};
 shuffle(m.objs).forEach(o=>{const b=h('button',{class:'object-pick','aria-label':o.name},o.em);onTap(b,()=>{if(!api.alive())return;selected=o;draw();});buttons.set(o.id,b);picks.append(b);});
 const zoneButtons=new Map();m.zones.forEach(z=>{const b=h('button',{class:'place-zone','aria-label':'Place '+(m.zones.indexOf(z)+1),style:{left:z.x+'%',top:z.y+'%'}},'＋');zoneButtons.set(z.id,b);onTap(b,()=>{if(!api.alive())return;if(!selected){Voice.say('Choisis un objet, puis touche sa place.');return;}const step=m.steps[at];if(selected.id!==step.object.id||z.id!==step.zone.id)return api.step(false,{el:b,feedback:'Écoute encore. Choisis le bon objet et sa place.'});completed[z.id]=selected.em;b.textContent=selected.em;buttons.get(selected.id).disabled=true;at++;if(at===m.steps.length)return api.answer(true,{praise:'Oui, les objets sont à leur place !'});api.step(true);selected=null;draw();});scene.append(b);});
 api.strategy=()=>{const s=m.steps[at];if(s){buttons.get(s.object.id).classList.add('reveal');zoneButtons.get(s.zone.id).classList.add('reveal');}};
 const demo=uButton('👀 Montre-moi',()=>{api.help();api.strategy();Voice.say('Regarde, je te montre cette place.');});
 draw();uWrap(st,picks,scene,h('div',{class:'sequence-tools'},uButton('🔊 Réécouter',()=>Voice.say(m.instruction)),demo));}};}
const ORAL_LEVELS=[{objects:1,zones:2,actions:1},{objects:2,zones:2,actions:1},{objects:2,zones:3,actions:1},{objects:3,zones:4,actions:1},{objects:2,zones:3,actions:2},{objects:2,zones:4,actions:2},{objects:2,zones:4,actions:2,before:true}];
GAMES.consignes={id:'consignes',title:'Écoute et place',sub:'Comprendre et agir',icon:'👂',color:'teal',stage:'#edf5ed',make:oralItem,levels:ORAL_LEVELS.map((L,i)=>({...L,n:3,name:'Écoute et place',skill:'oral:placement:'+i,tag:i<2?'M1–M2':i<4?'M3':'P1',ref:i<4?'Comprendre un objet et une relation spatiale':'Comprendre deux actions et leur ordre'}))};
GAMES.consignesP={...GAMES.consignes,id:'consignesP',levels:GAMES.consignes.levels.slice(0,4)};

/* Original, wordless sequential scenes. Audio describes individual events;
   the child must reconstruct chronology rather than memorize a number. */
const SEQUENCE_STORIES=[
 {id:'tour',em:'🧱',title:'La tour',events:['Les cubes sont posés à côté de Lola.','Lola pose un cube.','Lola ajoute des cubes. La tour grandit.','La balle touche la tour. Les cubes tombent.'],q:'Pourquoi les cubes sont-ils tombés ?',answer:3,distractors:[0,2]},
 {id:'pluie',em:'☔',title:'Sous la pluie',events:['Lola se promène sous le soleil.','Les nuages arrivent. La pluie tombe.','Lola ouvre son parapluie.','Lola reste au sec sous son parapluie.'],q:'Qu’est-ce qui protège Lola de la pluie ?',answer:3,distractors:[0,1]},
 {id:'dessin',em:'🖍️',title:'Le dessin',events:['Milo prend une feuille blanche.','Milo dessine un rond.','Milo ajoute les pétales. C’est une fleur.','Milo offre son dessin à Lola.'],q:'Qu’est-ce que Milo offre à Lola ?',answer:3,distractors:[0,1]},
 {id:'bateau',em:'⛵',title:'Le bateau de papier',events:['Milo prend une feuille de papier.','Milo plie la feuille de papier.','Le papier plié forme un bateau.','Milo pose le bateau sur l’eau. Il flotte.'],q:'Où Milo pose-t-il le bateau à la fin ?',answer:3,distractors:[0,2]},
 {id:'ballon',em:'🎈',title:'Le ballon',events:['Le ballon est tout petit et vide.','Lola souffle dans le ballon.','Le ballon devient gros.','Lola tient le gros ballon avec une ficelle.'],q:'Pourquoi le ballon est-il devenu gros ?',answer:1,distractors:[0,3]}
];
function personShape(id,x=90,y=90,scale=1){const lola=id==='lola',shirt=lola?'#cf6b94':'#5897c5';return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-28 -10Q-34 -54 0 -55Q35 -54 29 -9" fill="${lola?'#8d553e':'#70503b'}"/><circle cy="-25" r="23" fill="#edc19c"/>${lola?'<path d="M-24 -39L-35 -12M25 -39L36 -12" stroke="#8d553e" stroke-width="10"/>':''}<circle cx="-8" cy="-26" r="2.5" fill="#4e4445"/><circle cx="8" cy="-26" r="2.5" fill="#4e4445"/><path d="M-7 -15Q0 -10 7 -15" stroke="#9d6755" fill="none" stroke-width="2"/><path d="M-18 0H18L25 48H-25Z" fill="${shirt}"/><path d="M-11 48V72M11 48V72" stroke="#5d6c80" stroke-width="9"/><path d="M-20 8L-37 31M20 8L37 31" stroke="#edc19c" stroke-width="9" stroke-linecap="round"/></g>`;}
function sequenceSVG(id,step){let a='',bg='#f0f6ed';const text=(x,y,t,size=43)=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${t}</text>`;
 if(id==='tour'){a=personShape('lola',57,102,.75);if(step===0)a+='<rect x="120" y="132" width="34" height="29" rx="4" fill="#e4b05f"/><rect x="160" y="132" width="34" height="29" rx="4" fill="#83b9be"/>';if(step===1)a+='<rect x="135" y="130" width="36" height="31" rx="4" fill="#e4b05f"/>';if(step===2)a+=[0,1,2].map(i=>`<rect x="135" y="${130-i*32}" width="36" height="31" rx="4" fill="${['#e4b05f','#83b9be','#d68ba9'][i]}"/>`).join('');if(step===3)a+='<rect x="101" y="126" width="34" height="29" rx="4" fill="#e4b05f" transform="rotate(-18 118 140)"/><rect x="178" y="126" width="34" height="29" rx="4" fill="#83b9be" transform="rotate(21 195 140)"/><rect x="138" y="127" width="34" height="29" rx="4" fill="#d68ba9"/>'+text(176,137,'⚽',34);}
 if(id==='pluie'){bg=step===0?'#dceffa':'#c5d6e8';a=personShape('lola',110,106,.77);if(step===0)a+=text(35,45,'☀️',40);else a+=text(45,52,'🌧️',43)+text(180,52,'🌧️',43);if(step===2)a+=text(130,93,'☂️',46);if(step===3)a+=text(119,65,'☂️',90);}
 if(id==='dessin'){a=personShape('milo',40,109,.7);a+='<rect x="96" y="55" width="85" height="100" rx="5" fill="white" stroke="#c3b8a4" stroke-width="3"/>';if(step===1)a+='<circle cx="139" cy="102" r="15" fill="none" stroke="#c784a5" stroke-width="4"/>';if(step>=2)a+=text(139,121,'🌸',55);if(step===3)a+=personShape('lola',207,111,.65);else if(step>0)a+=text(84,113,'🖍️',30);}
 if(id==='bateau'){a=personShape('milo',43,104,.7);if(step===0)a+='<rect x="102" y="70" width="80" height="70" rx="4" fill="white" stroke="#b3a8a2" stroke-width="3"/>';if(step===1)a+='<path d="M95 122L143 65 187 122Z" fill="white" stroke="#b3a8a2" stroke-width="3"/>';if(step===2)a+='<path d="M103 102H192L176 132H120Z" fill="#fffdf7" stroke="#a7a2b1" stroke-width="3"/><path d="M106 102L145 73 188 102M145 73V119" fill="#e8e6f2" stroke="#a7a2b1" stroke-width="2"/>';if(step===3){a+='<path d="M74 136Q110 120 146 136T240 134V180H74Z" fill="#8ccadd"/>';a+='<path d="M111 112H202L185 143H128Z" fill="#fffdf7" stroke="#a7a2b1" stroke-width="3"/><path d="M114 112L154 83 198 112M154 83V129" fill="#e8e6f2" stroke="#a7a2b1" stroke-width="2"/>';}}
 if(id==='ballon'){if(step>0)a=personShape('lola',60,105,.73);if(step===0)a+='<ellipse cx="130" cy="143" rx="21" ry="8" fill="#e994a1"/>';if(step===1)a+=text(116,84,'🎈',43);if(step>=2)a+=text(154,92,'🎈',93);if(step===3)a+='<path d="M145 100Q130 150 89 125" fill="none" stroke="#7b6d79" stroke-width="2"/>';}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 190"><rect width="250" height="190" rx="20" fill="${bg}"/><path d="M0 158H250V190H0Z" fill="#deccb0"/>${a}</svg>`;
}
function sequenceModel(L){const story=pick(SEQUENCE_STORIES),n=L.frames||2,indices=n===2?[0,3]:n===3?[0,2,3]:[0,1,2,3];return {story,indices};}
function sequenceItem(ctx){const m=sequenceModel(ctx.L),story=m.story;return {cls:'upgrade-stage',say:'Regarde les images. Remets cette petite histoire dans l’ordre.',caption:'Le début → la suite → la fin',exemplar:story.id+':'+m.indices.join(','),evidenceKey:'narrative:order',render(st,api){let chosen=[],slots=h('div',{class:'sequence-slots'},m.indices.map((_,i)=>h('div',{class:'sequence-slot','aria-label':'Place '+(i+1)},i===0?'▶':'·'))),tray=h('div',{class:'urow'}),cards=new Map();
 const showQuestion=()=>{api.step(true);if(Shell.item){Shell.item.say=story.q;Shell.item.replay=()=>Voice.say(story.q);}Shell.caption(story.q);st.innerHTML='';const row=h('div',{class:'picture-options'});for(const step of shuffle([story.answer,...story.distractors])){const box=h('div',{class:'picture-option'}),b=h('button',{class:'scene-choice',html:sequenceSVG(story.id,step),'aria-label':story.events[step]});onTap(b,()=>api.answer(step===story.answer,{el:b,feedback:'Repense à l’histoire. Tu peux la réécouter.'}));box.append(b,uButton('🔊',()=>Voice.say(story.events[step]),{class:'choice-voice','aria-label':'Écouter cette image'}));row.append(box);if(step===story.answer)api.strategy=()=>b.classList.add('reveal');}uWrap(st,h('p',{class:'book-question'},story.q),row,uButton('🔊 Réécouter l’histoire',()=>{api.help();Voice.say(story.events);}));Voice.say([...story.events,300,story.q]);};
 const draw=()=>{chosen.forEach((step,i)=>slots.children[i].innerHTML=sequenceSVG(story.id,step));for(let i=chosen.length;i<m.indices.length;i++)slots.children[i].textContent=i===0?'▶':'·';for(const [step,b]of cards)b.classList.toggle('used',chosen.includes(step));};
 shuffle(m.indices).forEach(step=>{const wrap=h('div',{class:'picture-option'}),b=h('button',{class:'sequence-card',html:sequenceSVG(story.id,step),'aria-label':story.events[step]});cards.set(step,b);onTap(b,()=>{if(!api.alive()||chosen.includes(step))return;if(step!==m.indices[chosen.length])return api.step(false,{el:b,feedback:'Écoute les images pour retrouver le début de l’histoire.'});chosen.push(step);draw();if(chosen.length===m.indices.length){if(ctx.L.cause)showQuestion();else api.answer(true,{praise:'Oui, ton histoire est dans l’ordre !'});}else api.step(true);});wrap.append(b,uButton('🔊',()=>Voice.say(story.events[step]),{'aria-label':'Écouter cette image',class:'choice-voice'}));tray.append(wrap);});
 api.strategy=()=>cards.get(m.indices[chosen.length])?.classList.add('reveal');
 uWrap(st,slots,tray,h('p',{class:'u-note'},'🔊 Écoute chaque image'),uButton('👀 Montre-moi',()=>{api.help();api.strategy();Voice.say('Touche d’abord ce qui se passe au début.');}));}};}
GAMES.recit={id:'recit',title:'Histoire mélangée',sub:'Raconter dans l’ordre',icon:'🎞️',color:'plum',stage:'#f2edf8',make:sequenceItem,levels:[2,3,3,4,4].map((frames,i)=>({frames,cause:i>=2,n:3,name:'Histoire mélangée',skill:'narrative:order:'+i,tag:i===0?'M1–M2':i<3?'M3':'P1',ref:'Ordonner des événements et écouter les liens du récit'}))};
GAMES.recitP={...GAMES.recit,id:'recitP',levels:GAMES.recit.levels.slice(0,3)};

/* Comprehension choices differ by action/character, not the cover emoji. */
function portraitSVG(id){if(id==='lola'||id==='milo')return `<svg viewBox="0 0 100 120">${personShape(id,50,55,.8)}</svg>`;return `<svg viewBox="0 0 120 120"><text x="60" y="83" text-anchor="middle" font-size="72">${visitEscape(id)}</text></svg>`;}
function pictureChoices(options,good,api,feedback){const row=h('div',{class:'picture-options'});for(const o of shuffle(options)){const box=h('div',{class:'picture-option'}),b=h('button',{class:'scene-choice','aria-label':o.label,html:portraitSVG(o.picture)});b.append(h('span',null,o.label));onTap(b,()=>api.answer(o.id===good,{el:b,feedback:feedback||'Repense à l’histoire. Tu peux la réécouter.'}));box.append(b,uButton('🔊',()=>Voice.say(o.label),{'aria-label':'Écouter '+o.label,class:'choice-voice'}));row.append(box);}return row;}
const BOOK_CAST=[{id:'lola',picture:'lola',label:'Lola'},{id:'milo',picture:'milo',label:'Milo'},{id:'bebe',picture:'👶',label:'Le bébé'}];
function bookPersonQ(id,text,answer,third){const opts=BOOK_CAST.slice(0,2);opts.push(third||BOOK_CAST[2]);return {id,text,options:opts,answer};}
function bookObjectQ(id,text,answer,objects){return {id,text,answer,options:objects.map(([id,picture,label])=>({id,picture,label}))};}
MINI_NOTATION.une='u-n.*e';
MINI_BOOKS.find(b=>b.id==='bateau').pages[2]='Le navire a une voile.';
const BOOK_QUESTIONS={
 lune:[bookPersonQ('fin','Qui rit à la fin de l’histoire ?','lola'),bookObjectQ('regarder','Qu’est-ce que Milo a vu ?','lune',[['lune','🌙','La lune'],['chat','🐱','Le chat'],['moto','🏍️','La moto']])],
 lama:[bookPersonQ('debut','Qui a vu le lama au début ?','milo'),bookPersonQ('fin','Qui rit à la fin de l’histoire ?','lola')],
 chat:[bookPersonQ('fin','Qui rit à la fin de l’histoire ?','milo'),bookPersonQ('debut','Qui a vu le chat au début ?','lola')],
 velo:[bookPersonQ('possede','Qui a le vélo ?','lola'),bookObjectQ('roule','Qu’est-ce qui roule dans cette histoire ?','velo',[['velo','🚲','Le vélo'],['balle','⚽','La balle'],['moto','🏍️','La moto']])],
 moto:[bookPersonQ('possede','Qui a la moto ?','milo'),bookPersonQ('regarde','Qui a vu la moto à la fin ?','lola')],
 poule:[bookPersonQ('debut','Qui a vu la poule au début ?','lola'),bookPersonQ('fin','Qui rit à la fin de l’histoire ?','milo')],
 pomme:[bookPersonQ('debut','Qui a la pomme au début ?','milo'),bookPersonQ('fin','Qui a la pomme à la fin ?','lola')],
 tulipe:[bookPersonQ('debut','Qui a la tulipe au début ?','lola'),bookPersonQ('fin','Qui a la tulipe à la fin ?','milo')],
 bebe:[bookObjectQ('jouet','Qu’est-ce que le bébé a ?','poupee',[['poupee','🪆','La poupée'],['balle','⚽','La balle'],['livre','📕','Le livre']]),bookObjectQ('fin','Qui rit à la fin de l’histoire ?','bebe',[['bebe','👶','Le bébé'],['lola','lola','Lola'],['milo','milo','Milo']])],
 lapin:[bookObjectQ('mange','Qu’est-ce que le lapin a ?','carotte',[['carotte','🥕','La carotte'],['pomme','🍎','La pomme'],['pain','🍞','Le pain']]),bookPersonQ('fin','Qui a vu le lapin à la fin ?','milo')],
 bateau:[bookObjectQ('navire','Qu’est-ce que le navire a ?','voile',[['voile','⛵','Une voile'],['roues','🛞','Des roues'],['ailes','🪽','Des ailes']]),bookPersonQ('debut','Qui a vu le navire au début ?','milo')],
 dragon:[bookObjectQ('fin','Qui rit à la fin de l’histoire ?','dragon',[['dragon','🐉','Le dragon'],['lola','lola','Lola'],['milo','milo','Milo']]),bookPersonQ('regarde','Qui a vu le dragon ?','lola')]
};
readMiniBook=async function(b){const run={gid:'livres',res:[],abort:false};RUN=run;Shell.open({bg:'#f6eedb',level:b.title,onClose:miniLibrary});const questions=BOOK_QUESTIONS[b.id];Shell.setDots(b.pages.length+questions.length);let assisted=false;const started=Date.now();
 for(let i=0;i<b.pages.length;i++){Shell.now(i);const text=b.pages[i];await Engine.play({cls:'upgrade-stage',say:'Touche un mot pour l’écouter. Ensuite, tourne la page.',render(st,api){const words=h('div',{class:'book-words'});text.split(' ').forEach(t=>words.append(uButton(t,()=>{assisted=true;api.help();Voice.say(t.replace(/[.!?]/g,''));})));const cast=h('div',{class:'book-cast'},['lola','milo'].map(id=>uButton('',()=>Voice.say(id==='lola'?'Lola':'Milo'),{html:portraitSVG(id)+(id==='lola'?'Lola':'Milo')})));const listen=uButton('🔊 Écouter la page',async()=>{if(!api.alive())return;assisted=true;api.help();for(const bt of words.children)bt.classList.add('reading');await Voice.say(text);for(const bt of words.children)bt.classList.remove('reading');});uWrap(st,h('div',{class:'book-page'},cast,h('div',{class:'book-scene'},b.em),words,listen,uButton('→ Tourner la page',()=>api.finish(null))));}},run);if(run.abort||RUN!==run)return;}
 for(let qi=0;qi<questions.length;qi++){const q=questions[qi];Shell.now(b.pages.length+qi);const r=await Engine.play({cls:'upgrade-stage',say:q.text,evidenceKey:'book:'+b.id+':'+(assisted||!miniBookDecodable(b)?'ecoute':'lecture-declaree'),exemplar:q.id,render(st,api){const revisit=uButton('🔊 Réécouter l’histoire',()=>{api.help();assisted=true;Voice.say(b.pages);});uWrap(st,h('p',{class:'book-question'},q.text),pictureChoices(q.options,q.answer,api),revisit);}},run);if(run.abort||RUN!==run)return;run.res.push(r);Shell.mark(b.pages.length+qi,r.first?'ok':'half');}
 const p=P(),all=p.bookEvidence||(p.bookEvidence={}),prev=all[b.id]||{};const attempt={at:Date.now(),started,comprehension:run.res.filter(r=>r.first).length,questions:questions.length,mode:assisted||!miniBookDecodable(b)?'ecoute-accompagnee':'lecture-declaree',autonomousDecodingValidated:false};all[b.id]={...prev,...attempt,attempts:[...(prev.attempts||[]),attempt].slice(-20)};save();const sticker=addStars(scoreOf(run.res).stars);Celebrate.show({sticker,again:()=>readMiniBook(b),home:()=>{Shell.close();miniLibrary();}});
};

/* A short message has a recipient and becomes an editable card. No claim of free composition. */
const GIFT_WORDS=[{word:'pomme',em:'🍎'},{word:'tulipe',em:'🌷'},{word:'carotte',em:'🥕'}];
MINI_NOTATION.pour='p.ou.r';
function messageRequirement(gift){const w=WORDS.find(w=>w.w===gift.word);return Math.max(w.req,...['une','pour','lola','milo'].map(t=>reqOf(parseNotation(MINI_NOTATION[t])).req));}
function messagePool(li){return GIFT_WORDS.filter(g=>messageRequirement(g)<=li);}
function messageCard(gift,person,key){const words=['Une',gift.word,'pour',person==='lola'?'Lola.':'Milo.'],widths=words.map(w=>w.length*29),total=widths.reduce((a,b)=>a+b,0)+3*21;let x=(700-total)/2;const items=words.map((w,i)=>{const o={text:w,x:x+widths[i]/2,y:231,letter:true};x+=widths[i]+21;return o;});items.push({text:gift.em,x:350,y:325});return {kind:'visit',messageKey:key,name:kid().name,bg:CARD_BG[0],items,strokes:[],at:Date.now()};}
function messageItem(ctx){const li=P().lecture.unlocked||0,pool=messagePool(li);if(!pool.length)return itLettre(LESSONS[li],li);const gift=avoidRepeat(ctx,pool),person=pick(['lola','milo']),name=person==='lola'?'Lola':'Milo',words=['Une',gift.word,'pour',name],sentence=words.join(' ')+'.',key='message:'+(P().resume?.seed||Date.now())+':'+ctx.i;return {cls:'upgrade-stage',say:['Prépare ce petit message pour offrir un cadeau.',sentence],caption:'Un petit message pour quelqu’un',evidenceKey:'writing:message',exemplar:sentence,render(st,api){let at=0;const slots=h('div',{class:'urow message-slots'},words.map(()=>h('span',{class:'slot'},'·'))),tray=h('div',{class:'urow'}),buttons=[];for(const word of shuffle(words)){const b=uButton(word,()=>{if(!api.alive()||b.disabled)return;if(word!==words[at])return api.step(false,{el:b,feedback:'Écoute le message. Choisis le mot suivant.'});b.disabled=true;slots.children[at].textContent=word;at++;api.step(true);if(at===words.length){tray.innerHTML='';const point=uButton('●',()=>{if(!api.alive())return;slots.children[slots.children.length-1].textContent+='.';const p=P();p.cards=p.cards||[];if(!p.cards.some(c=>c.messageKey===key)){p.cards.unshift(messageCard(gift,person,key));if(p.cards.length>24)p.cards.length=24;save();}api.answer(true,{praise:'Ton message est prêt. Tu le retrouveras dans tes cartes.'});},{'aria-label':'Ajouter le point'});tray.append(point);api.strategy=()=>point.classList.add('reveal');if(Shell.item){Shell.item.say='Les mots sont séparés par des espaces. Ajoute un point à la fin du message.';Shell.item.replay=()=>Voice.say(Shell.item.say);}Shell.caption('Ajoute le point à la fin');Voice.say('Les mots sont séparés par des espaces. Ajoute un point à la fin du message.');}});buttons.push(b);tray.append(b);}api.strategy=()=>buttons.find(b=>b.textContent===words[at])?.classList.add('reveal');uWrap(st,h('div',{class:'urow'},h('span',{style:{fontSize:'60px'}},gift.em),h('div',{style:{width:'90px'},html:portraitSVG(person)})),slots,tray,uButton('🔊 Écouter le message',()=>Voice.say(sentence)));}};}
GAMES.messages={id:'messages',title:'Mes petits messages',sub:'Des mots pour quelqu’un',icon:'💌',color:'pink',stage:'#fff0f5',levels:[{n:2,name:'Un cadeau, un message',skill:'writing:message',tag:'P1',ref:'Assembler un message dicté, séparer les mots et terminer par un point'}],make:messageItem};
addThemeGame('grands','creer','messages');SIMPLE_GAME_NAMES.messages='Mes petits messages';
function messageVoiceLines(){return ['Prépare ce petit message pour offrir un cadeau.','Écoute le message. Choisis le mot suivant.','Les mots sont séparés par des espaces. Ajoute un point à la fin du message.','Ton message est prêt. Tu le retrouveras dans tes cartes.',...GIFT_WORDS.flatMap(g=>['Lola','Milo'].map(n=>`Une ${g.word} pour ${n}.`))];}

/* Revision alternates correspondences and decodable words, with a stable saved plan. */
function revisionPlan(){const p=P(),li=p.lecture.unlocked||0,entries=Object.entries(p.evidence||{}).filter(([key,e])=>e.due<=Date.now()&&(key.startsWith('gp:')&&LIDX[key.slice(3)]<=li||key==='reading:words'||key==='encoding:words')).sort((a,b)=>a[1].due-b[1].due),plan=[];
 for(const [key,e]of entries){if(key.startsWith('gp:'))plan.push({kind:'letter',k:key.slice(3)});else{const pool=strictWordPool(li,6),fresh=pool.filter(w=>!e.seen.includes(w.w));const W=pick(fresh.length?fresh:pool);if(W)plan.push({kind:key.startsWith('encoding:')?'write':'read',word:W.w});}if(plan.length>=4)break;}
 for(const W of sample(strictWordPool(li,5),4))if(plan.length<4)plan.push({kind:'read',word:W.w});
 for(const L of shuffle(LESSONS.slice(0,li+1)))if(plan.length<4)plan.push({kind:'letter',k:L.k});
 while(plan.length<4)plan.push({kind:'letter',k:LESSONS[Math.min(li,LESSONS.length-1)].k});return plan;
}
GAMES.rappel={id:'rappel',title:'Mon petit rappel',sub:'Retrouver les sons et les mots',icon:'🔁',color:'sky',stage:'#eff6fc',levels:[{n:4,name:'Mon petit rappel',tag:'P1',ref:'Retrouver des correspondances et des mots rencontrés, après un délai'}],make(ctx){const session=P().resume;if(!ctx.bag.plan){ctx.bag.plan=session?.reviewPlan||revisionPlan();if(session){session.reviewPlan=ctx.bag.plan;save();}}const t=ctx.bag.plan[ctx.i],li=P().lecture.unlocked||0;if(t.kind==='letter')return itLettre(LESSONS[LIDX[t.k]],li);const W=WORDS.find(w=>w.w===t.word);return t.kind==='write'?itDictee(W,li):itMot(W,strictWordPool(li),3);}};
const recommendBeforeRecall=recommendedGame;
recommendedGame=function(){const id=recommendBeforeRecall();if(S.world==='grands'&&!P().resume&&['lecture','mots'].includes(id)&&Object.entries(P().evidence||{}).some(([k,e])=>e.due<=Date.now()&&(k.startsWith('gp:')&&LIDX[k.slice(3)]!=null||k==='reading:words'||k==='encoding:words')))return 'rappel';return id;};
for(const [world,theme,id]of [['grands','lire','rappel'],['grands','lire','consignes'],['grands','lire','recit'],['petits','lire','consignesP'],['petits','lire','recitP']])addThemeGame(world,theme,id);
Object.assign(SIMPLE_GAME_NAMES,{rappel:'Mon petit rappel',consignes:'Écoute et place',consignesP:'Écoute et place',recit:'Histoire mélangée',recitP:'Histoire mélangée'});
function literacyVoiceLines(){const lines=[...LITERACY_VOICE,...messageVoiceLines(),...PLACE_OBJECTS.map(o=>o.name),...PLACE_ZONES.map(z=>z.name)];for(const L of ORAL_LEVELS){const zones=PLACE_ZONES.slice(0,L.zones),objects=PLACE_OBJECTS;for(const a of objects)for(const z of zones){lines.push(`Mets ${a.name} ${z.name}.`);if(L.actions===2)for(const b of objects)for(const q of zones)if(a.id!==b.id&&z.id!==q.id)lines.push(L.before?`Avant de mettre ${b.name} ${q.name}, mets ${a.name} ${z.name}.`:`Mets ${a.name} ${z.name}, puis mets ${b.name} ${q.name}.`);}}for(const s of SEQUENCE_STORIES)lines.push(...s.events,s.q);for(const qs of Object.values(BOOK_QUESTIONS))for(const q of qs)lines.push(q.text,...q.options.map(o=>o.label));lines.push('Lola','Milo');return [...new Set(lines)];}
/* Stable presentation order follows the entry task and its prerequisites.
   Each game keeps its own adaptive progression; ordering never locks access. */
const THEME_DIFFICULTY_ORDER={
 grands:{
  lire:['consignes','histoires','recit','syllabes','lecture','lettre1','rappel','mots','riviere','balade','livres'],
  calculer:['blocs','paniers','calcul','marche','heure'],
  jouer:['robot','miroir','memoG','monstre','suitesG','lynxG','sudoku','cheminG'],
  creer:['atelier','trace','messages'],
  decouvrir:['cuisine','feteG']
 },
 petits:{
  lire:['ferme','consignesP','histoires','livres','recitP','syllabes'],
  calculer:['gestes','tailles','nombres','blocsP','grandpetit'],
  jouer:['formes','ombres','monstreP','espace','puzzle','lynx','memo','suites','chemin'],
  creer:['couleurs','pretrace','atelier'],
  decouvrir:['cuisine','feteP']
 }
};
const themesBeforeDifficulty=themesOf;
themesOf=function(world){return themesBeforeDifficulty(world).map(theme=>{const order=THEME_DIFFICULTY_ORDER[world]?.[theme.id]||[],rank=new Map(order.map((id,i)=>[id,i]));return {...theme,ids:theme.ids.map((id,i)=>({id,rank:rank.has(id)?rank.get(id):order.length+i})).sort((a,b)=>a.rank-b.rank).map(x=>x.id)};});};
/* Deferred until boot so non-browser audits can load the game definitions. */
const bootBeforeLiteracy=boot;
boot=function(){literacyStyle();bootBeforeLiteracy();};
