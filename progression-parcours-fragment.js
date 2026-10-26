/* Parcours explicites : les prérequis portent sur une tâche, jamais sur une
   visite, une quantité d’étoiles, ni une certification scolaire. Les anciens
   accès et décisions du parent restent utilisables comme entraînement. */
const LEARNING_PATHS={
 grands:{
  lire:[
   {id:'sons',title:'1. Les sons et les lettres',note:'Découvrir les sons, leurs lettres et les syllabes à l’oral.',ids:['lecture','lettre1','syllabes']},
   {id:'mots',title:'2. Assembler et écrire des mots',note:'Utiliser les sons déjà rencontrés, sans attendre tout l’alphabet.',ids:['mots','riviere','balade','pseudoMot']},
   {id:'phrases',title:'3. Lire et comprendre',note:'Passer des mots aux phrases, puis aux petits livres.',ids:['phraseOrdre','lisFais','livres']},
   {id:'graphies',title:'4. D’autres écritures des sons',note:'Revoir les lettres proches et découvrir de nouvelles graphies.',ids:['lettresMiroir','graphies']},
   {id:'revoir',title:'Revoir ce que j’ai rencontré',note:'Des rappels courts et des mots déjà connus. La vitesse reste facultative.',ids:['rappel','lectureEclair']},
   {id:'oral',title:'Écouter et comprendre',note:'À explorer en parallèle : ces jeux ne demandent pas de savoir lire.',parallel:true,ids:['petitsMots','recit']}
  ],
  calculer:[
   {id:'nombres',title:'1. Construire les nombres',note:'Relier une quantité à un nombre, puis le séparer en deux parties.',ids:['blocs','ligne','maisonNombres']},
   {id:'operations',title:'2. Ajouter, enlever et résoudre',note:'Un parcours par petites étapes : les premiers problèmes arrivent dès les petites opérations.',ids:['calcul']},
   {id:'strategies',title:'3. Trouver des stratégies',note:'Compléter dix, comprendre l’égalité et représenter les problèmes.',ids:['pontDix','balance','barres']},
   {id:'revoir',title:'Revoir les calculs rencontrés',ids:['rappelCalcul']},
   {id:'quotidien',title:'Les nombres au quotidien',parallel:true,note:'Écouter les nombres écrits et jouer avec la monnaie.',ids:['nombresLettres','marche']},
   {id:'explorer',title:'Formes, mesures et temps',parallel:true,note:'Ces découvertes avancent en parallèle du calcul.',ids:['formesSolides','grandeurs','calendrier','heure']},
   {id:'extension',title:'Pour aller plus loin',note:'Faire des groupes égaux ; découvrir ensuite la multiplication, à son rythme.',extension:true,ids:['paniers']}
  ]
 },
 petits:{
  lire:[
   {id:'ecouter',title:'Écouter et comprendre',ids:['ferme','ensemble','consignesP','recitP']},
   {id:'sons',title:'Jouer avec les sons',ids:['syllabes','sonsP']},
   {id:'lettres',title:'Découvrir les lettres',note:'Une découverte à côté des jeux oraux, sans obligation de lire.',ids:['alphabetP']}
  ],
  calculer:[
   {id:'quantites',title:'1. Découvrir les petites quantités',ids:['doigts','nombres']},
   {id:'construire',title:'2. Construire et comparer',ids:['blocsP','grandpetit']},
   {id:'suite',title:'3. Avancer dans les nombres',ids:['ligneP']},
   {id:'tailles',title:'Comparer les tailles',parallel:true,ids:['tailles']}
  ]
 }
};
function learningPathGroups(world,theme){return LEARNING_PATHS[world]?.[theme]||null;}
function curriculumAccessSnapshot(p={}){const games={};for(const id of Object.keys(GAMES)){if(familyPlayed(p,id))games[id]=Math.max(0,Number(p.games?.[id]?.lvl)||0,Number(p.games?.[id]?.unlocked)||0);}return {readingOpen:Number(p.learningPaths?.legacyReadingOpen??p.lecture?.unlocked)||0,games};}
function curriculumPreserveAccess(state){
 state.settings=state.settings||{};const all=state.settings.learningPathLegacy||(state.settings.learningPathLegacy={v:1,children:{}});all.children=all.children||{};
 for(const profile of state.profiles||[]){if(!all.children[profile.id])all.children[profile.id]=curriculumAccessSnapshot(state.progress?.[profile.id]);}return state;
}
function curriculumLegacyAccess(p=P()){const id=Object.keys(S.progress||{}).find(id=>S.progress[id]===p);return S.settings.learningPathLegacy?.children?.[id]||(S.settings.learningPathLegacy?{readingOpen:0,games:{}}:curriculumAccessSnapshot(p));}
function curriculumLegacyGameLevel(id,p=P()){return curriculumLegacyAccess(p).games?.[id]??-1;}
const migrationBeforeLearningPaths=migrate;
migrate=function(input){return curriculumPreserveAccess(migrationBeforeLearningPaths(input));};
const themesBeforeLearningPaths=themesOf;
themesOf=function(world){return themesBeforeLearningPaths(world).map(t=>{const groups=learningPathGroups(world,t.id);if(!groups)return t;const order=groups.flatMap(g=>g.ids),ids=[...order.filter(id=>t.ids.includes(id)),...t.ids.filter(id=>!order.includes(id))];return {...t,ids};});};
function curriculumGamePassed(id,level,p=P()){
 const record=p.pathSeries?.[id]?.[level];if(record)return record.independent===true;
 const best=p.games?.[id]?.best?.[level];return Number(best)>=2;
}
function curriculumReadableWords(p=P(),max=8){const known=readingPracticeKnownKeys(p);return WORDS.filter(w=>picOK(w)&&!GLIDE_WORDS.has(w.w)&&w.req!==99&&w.gs.filter(g=>!g.mute).length<=max&&Array.from(w.keys).every(k=>known.has(k)));}
function curriculumWordCandidates(id,p=P(),max=12){
 const known=curriculumReadableWords(p,max);if(known.length||p.demo)return known;
 const parent=p.familyAccess?.[id]||(p.parentActions||[]).some(a=>!a.undone&&a.target?.gid===id);
 const legacy=curriculumLegacyAccess(p).readingOpen>=(id==='balade'?3:2)||curriculumLegacyGameLevel(id,p)>=0;
 return parent||legacy?WORDS.filter(w=>picOK(w)&&!GLIDE_WORDS.has(w.w)&&w.gs.filter(g=>!g.mute).length<=max):known;
}
function curriculumRiverPool(L,p=P()){
 const known=new Set(curriculumWordCandidates('riviere',p).map(w=>w.w));return RIVER.filter(w=>known.has(w.w)&&w.parts.length>=L.min&&w.parts.length<=L.max);
}
function curriculumReadingTarget(p=P()){return {gid:'lecture'};}
function curriculumQuantitiesReady(p,max=10){
 if(curriculumMathPassed('n10',1,p))return true;
 return ['blocs','blocsP'].some(id=>(GAMES[id]?.levels||[]).some((L,i)=>L.max>=max&&curriculumGamePassed(id,i,p)));
}
function curriculumGameRequirement(id,p=P(),level=p.games?.[id]?.lvl||0){
 const need=(ready,reason,gid,lv=0)=>({ready:!!ready,reason,target:{gid,level:lv}});
 if(S.world==='petits'&&['doigts','nombres','blocsP','grandpetit','ligneP','tailles','ferme','ensemble','consignesP','recitP','syllabes','sonsP','alphabetP'].includes(id))return {ready:true};
 if(['phraseOrdre','graphies','lettresMiroir','petitsMots'].includes(id)&&typeof ecoleReadingAccess==='function'){
  const access=ecoleReadingAccess(id,p,level);return {...access,target:access.target||curriculumReadingTarget(p)};
 }
 if(['pseudoMot','lisFais','lectureEclair'].includes(id)){const access=readingPracticeAccess(id,p);return {...access,reason:access.reason||'Découvrir les sons nécessaires dans « Apprendre à lire ».',target:{gid:id==='lectureEclair'?'mots':'lecture'}};}
 if(['mots','balade','riviere'].includes(id)){
  const L=GAMES[id].levels[clamp(level,0,GAMES[id].levels.length-1)],words=curriculumReadableWords(p,id==='mots'?L.max:12),known=new Set(words.map(w=>w.w)),pool=id==='riviere'?RIVER.filter(w=>known.has(w.w)&&w.parts.length>=L.min&&w.parts.length<=L.max):id==='balade'?words.filter(w=>w.w.length>=L.min&&w.w.length<=L.max):words;
  return need(pool.length>=3,'Découvrir les sons de quelques mots dans « Apprendre à lire ».','lecture');
 }
 if(id==='livres')return need(MINI_BOOKS.some(b=>{const r=miniBookRequirement(b);return r!==null&&LESSONS.slice(0,r+1).every((L,i)=>readingPracticeKnownKeys(p).has(L.k));}),'Découvrir les sons du premier livre dans « Apprendre à lire ».','lecture');
 if(id==='rappel')return need(readingPracticeKnownKeys(p).size>0,'Rencontrer un premier son dans « Apprendre à lire ».','lecture');
 if(id==='rappelCalcul')return need(Object.keys(p.mathPractice?.encountered||{}).length>0,'Rencontrer un premier calcul dans le parcours.','calcul');
 if(id==='maisonNombres')return need(curriculumQuantitiesReady(p,level===0?5:10),'Construire d’abord des quantités avec les cubes.','blocs',level===0?0:2);
 if(id==='pontDix')return need(curriculumQuantitiesReady(p,10),'Construire les nombres jusqu’à dix.','blocs',2);
 if(id==='balance')return need((curriculumMathPassed('a10',0,p)||curriculumGamePassed('blocs',4,p))&&(curriculumGamePassed('maisonNombres',2,p)||curriculumGamePassed('pontDix',0,p)||curriculumMathPassed('c10',0,p)),'Ajouter de petits nombres et compléter une quantité.','pontDix');
 if(id==='barres')return need(level===0?(curriculumMathPassed('a10',0,p)||curriculumGamePassed('blocs',4,p)):(curriculumMathPassed('s10',0,p)||curriculumGamePassed('blocs',5,p)),'Essayer d’abord les petites additions et soustractions.','calcul');
 if(id==='paniers')return need(curriculumQuantitiesReady(p,level<3?5:10),'Construire d’abord les petites quantités.','blocs',level<3?0:2);
 if(id==='nombresLettres')return need(curriculumQuantitiesReady(p,level===0?5:10),'Relier d’abord les petites quantités aux nombres.','blocs',level===0?0:2);
 if(id==='heure')return need(curriculumMathPassed('n20',0,p)||curriculumGamePassed('ligne',0,p),'Découvrir d’abord les nombres de l’horloge.','ligne');
 if(id==='grandeurs'&&level>=3)return need((curriculumMathPassed('s10',0,p)||curriculumGamePassed('blocs',5,p))&&curriculumGamePassed('marche',0,p),'Jouer avec les euros et les petits retraits avant de rendre la monnaie.','marche');
 return {ready:true};
}
const familyAccessBeforePaths=familyAccess;
familyAccess=function(id,p=P()){
 if(!GAMES[id])return {ready:false,reason:'Choisis une activité disponible.'};
 const access=curriculumGameRequirement(id,p);
 if(p.demo||p.familyAccess?.[id])return {...access,ready:true,parent:!p.demo,training:!access.ready};
 const parent=(p.parentActions||[]).some(a=>!a.undone&&a.target?.kind==='game'&&a.target.gid===id);
 if(parent)return {...access,ready:true,parent:true,training:!access.ready};
 /* A preserved access is not used as a prerequisite for a different activity. */
 const current=p.games?.[id]?.lvl||0;
 if(!access.ready&&curriculumLegacyGameLevel(id,p)>=current)return {...access,ready:true,previous:true,training:true};
 if(!access.ready&&current===0&&['mots','riviere','balade','livres'].includes(id)&&curriculumLegacyAccess(p).readingOpen>=(id==='mots'||id==='riviere'?2:3))return {...access,ready:true,previous:true,legacy:true,training:true};
 if(!access.ready)return access;
 /* Requirements above replace the old visit-based mathematics gates. */
 if(['maisonNombres','pontDix','balance','barres','paniers','nombresLettres','heure','grandeurs','rappel','rappelCalcul','mots','balade','riviere','livres','phraseOrdre','graphies','lettresMiroir','petitsMots'].includes(id))return access;
 return familyAccessBeforePaths(id,p);
};
/* A useful next step, rather than an unexplained lock. */
const familyLockedBeforePaths=familyLocked;
familyLocked=function(id,access){
 familyLockedBeforePaths(id,access);const sheet=$('.modal:last-child .sheet')||$$('.modal .sheet').at(-1);if(!sheet||!access.target?.gid)return;
 const target=access.target.gid,label=SIMPLE_GAME_NAMES[target]||GAMES[target]?.title||'Apprendre à lire';
 const button=uButton('Commencer par « '+label+' »',()=>{const modal=sheet.parentNode;modal.remove();Voice.stop();runGame(target);},{class:'pbtn pri curriculum-prepare','data-prepare-gid':target});
 sheet.insertBefore(button,sheet.children[sheet.children.length-2]||null);
};
/* The numerical game models keep the same IDs. Only their presentation changes. */
Object.assign(SIMPLE_GAME_NAMES,{calcul:'Mon parcours de calcul',pseudoMot:'Lire des mots inventés',lectureEclair:'Revoir les mots',lettresMiroir:'Distinguer b, d, p et q',petitsMots:'Choisir les petits mots à l’oral',phraseOrdre:'Construire une phrase',graphies:'Découvrir les autres graphies'});
const tileBeforeLearningPaths=simpleGameTile;
simpleGameTile=function(id){const tile=tileBeforeLearningPaths(id),access=familyAccess(id);if(access.ready&&access.training)tile.append(h('small',{class:'curriculum-aided'},'Entraînement accompagné'));return tile;};
for(const id of ['mots','balade','riviere']){
 const make=GAMES[id].make;GAMES[id].make=function(ctx){const item=make.call(this,ctx),access=curriculumGameRequirement(id,P(),gameProg(id).lvl);if(!access.ready){item.helped=true;item.evidenceKey='training:'+id;const render=item.render;item.render=function(st,api){api.help();return render.call(this,st,api);};}return item;};
}
/* Mark genuinely guided entry consistently, including mathematics activities
   opened early by an adult. A historical opening is not an answer. */
const engineBeforePathGuidance=Engine.play.bind(Engine);
Engine.play=function(item,run){
 if(GAMES[run.gid]?.levels){const level=run.levelIndex??run.session?.li??0,access=curriculumGameRequirement(run.gid,P(),level);if(!access.ready){item.helped=true;item.evidenceKey='training:'+run.gid;}}
 return engineBeforePathGuidance(item,run);
};
const finishGameBeforePathEvidence=finishGame;
finishGame=function(run,g,gp){
 if(run.res?.length){const p=P(),level=run.levelIndex??run.session?.li??gp.lvl,all=p.pathSeries||(p.pathSeries={}),by=all[g.id]||(all[g.id]={}),sc=scoreOf(run.res),independent=!run.res.some(r=>r.helped||r.skipped)&&sc.pct>=.8;
  if(independent||!by[level]?.independent)by[level]={at:Date.now(),independent,answered:run.res.filter(countableResult).length};
 }
 return finishGameBeforePathEvidence(run,g,gp);
};
/* A parent-opened sound is access, not evidence of autonomous book decoding. */
miniBookDecodable=function(b){const known=readingPracticeKnownKeys(P());return b.pages.flatMap(bookTokens).every(t=>{const word=WORDS.find(w=>w.w.toLocaleLowerCase('fr')===t);const keys=word?word.keys:MINI_NOTATION[t]?reqOf(parseNotation(MINI_NOTATION[t])).keys:null;return !!keys&&Array.from(keys).every(k=>known.has(k));});};
/* Use the same series score for the visible result and the reward counter. */
const celebrationBeforeConsistentScore=Celebrate.show.bind(Celebrate);
Celebrate.show=function(options){if(RUN?.session&&['lesson','module'].includes(RUN.session.kind)&&RUN.res?.length)options={...options,stars:scoreOf(RUN.res).stars};return celebrationBeforeConsistentScore(options);};
const homeBeforeLearningPaths=renderHome;
renderHome=function(theme=HOME_THEME){
 homeBeforeLearningPaths(theme);if(!HOME_THEME)return;
 const groups=learningPathGroups(S.world,HOME_THEME),main=$('.theme-home'),old=main&&$('.theme-games',main);if(!groups||!old)return;
 const tiles=new Map(Array.from(old.children).map(t=>[t.getAttribute('data-gid'),t]));
 const path=h('div',{class:'learning-path','aria-label':'Parcours '+(HOME_THEME==='lire'?'de lecture':'de calcul')}),used=new Set();
 for(const group of groups){const ids=group.ids.filter(id=>tiles.has(id));if(!ids.length)continue;const section=h('section',{class:'learning-path-group'+(group.parallel?' parallel':'')+(group.extension?' extension':''),'aria-label':group.title,'data-path-group':group.id});section.append(h('h2',null,group.title));if(group.note)section.append(h('p',{class:'path-note'},group.note));const grid=h('div',{class:'theme-games'});for(const id of ids){used.add(id);grid.append(tiles.get(id));}section.append(grid);path.append(section);}
 const other=Array.from(tiles).filter(([id])=>!used.has(id));if(other.length){const sec=h('section',{class:'learning-path-group'},h('h2',null,'D’autres découvertes')),grid=h('div',{class:'theme-games'});for(const[,tile]of other)grid.append(tile);sec.append(grid);path.append(sec);}
 old.remove();main.append(path);
};
/* The home suggestion follows the same readiness rules as the categories. */
const recommendedBeforeLearningPaths=recommendedGame;
recommendedGame=function(){const p=P();if(p.resume)return recommendedBeforeLearningPaths();const old=recommendedBeforeLearningPaths();if((['rappel','rappelCalcul'].includes(old)||Object.values(p.evidence||{}).some(e=>e.due<=Date.now()))&&familyAccess(old,p).ready)return old;
 const ids=themesOf(S.world).filter(t=>['lire','calculer'].includes(t.id)).flatMap(t=>t.ids),eligible=ids.filter(id=>familyAccess(id,p).ready&&!familyPlayed(p,id));return eligible[0]||(familyAccess(old,p).ready?old:(S.world==='petits'?'doigts':'lecture'));
};
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent=`
.learning-path{display:grid;gap:30px;margin:8px 0 35px}.learning-path-group h2{font-size:clamp(21px,3.5vw,29px);line-height:1.8;margin:0 0 4px;color:var(--ink)}.path-note{font-size:16px;line-height:1.9;margin:0 0 14px;max-width:850px;color:var(--ink-soft)}.learning-path-group.parallel,.learning-path-group.extension{padding-top:20px;border-top:2px solid #dbe6e0}.learning-path .theme-games{margin:0}.curriculum-aided{font-size:13px;color:#675c39;line-height:1.8}.curriculum-prepare{display:block;width:100%;margin:14px 0}.simple-game small{overflow-wrap:anywhere}.learning-path-group .simple-game{min-height:175px}@media(max-width:600px){.learning-path{gap:24px}.path-note{font-size:14px}.learning-path-group .simple-game{min-height:160px}.learning-path-group h2{font-size:21px}}
`;document.head.append(style);}
