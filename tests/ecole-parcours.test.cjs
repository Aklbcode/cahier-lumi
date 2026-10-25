/* Compléments école : contenu, réponses, aides, voix et images. Source seulement. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{loadApp}=require('./helpers/render-fixture.cjs');
const {speechSegments,speechJoin}=require('../speech-engine.js');
const root=path.join(__dirname,'..'),{ctx}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const run=code=>vm.runInContext(code,ctx);
run(`save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Voice.slower=f=>f();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';`);

const IDS=['lettresMiroir','graphies','petitsMots','phraseOrdre','maisonNombres','nombresLettres','calendrier','formesSolides','copieModele','ensemble','pareilModele'];
const WORLD={copieModele:'petits',ensemble:'petits',pareilModele:'petits'};

/* 1. Inscription dans les thèmes, dans l’ordre voulu */
for(const id of IDS){
 check(run(`!!GAMES.${id}&&GAMES.${id}.levels.length>0`),id+' est inscrit avec des niveaux');
 const world=WORLD[id]||'grands';
 check(run(`themesOf('${world}').some(t=>t.ids.includes('${id}'))`),id+' apparaît dans un thème de '+world);
}
const lire=run(`themesOf('grands').find(t=>t.id==='lire').ids`);
check(lire.indexOf('lettresMiroir')===lire.indexOf('balade')+1,'Les lettres miroirs suivent Écrire avec les lettres');
check(lire.indexOf('graphies')>lire.indexOf('phraseOrdre'),'Les sons complexes viennent après la phrase');

/* 2. Chaque niveau se joue jusqu’au bout avec de vrais clics, et les phrases dites sont enregistrables */
const keyNorm=t=>String(t).normalize('NFC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?…:]+$/,'').trim().toLocaleLowerCase('fr');
const voiceLines=new Set(run('ecoleParcoursVoiceLines()').flatMap(t=>speechSegments(t).map(s=>keyNorm(s.t))));
const spoken=[];
const collect=p=>{for(const u of speechJoin(p))if(u&&typeof u==='object'&&!u.phoneme&&!u.syllable)for(const s of speechSegments(u.t))spoken.push(s.t);};
function makeApi(){
 const api={results:[],steps:[],helped:false,exam:false,alive:()=>true,key(el){api.keyEl=el;},help(){api.helped=true;},
  answer(ok,o={}){api.results.push({ok,o});if(o.praise)collect(o.praise);if(!ok&&o.feedback)collect(o.feedback);if(o.reveal)collect(o.reveal);return Promise.resolve(ok);},
  step(ok,o={}){api.steps.push({ok,o});if(o.say)collect(o.say);if(!ok&&o.feedback)collect(o.feedback);return Promise.resolve(ok);},
  finish(first){api.results.push({ok:first,finish:true});}};
 return api;
}
const all=(el,sel)=>el.querySelectorAll(sel);
async function playItem(id,li,seed,i){
 const item=run(`withSeed(${seed},()=>GAMES.${id}.make({g:GAMES.${id},L:GAMES.${id}.levels[${li}],li:${li},i:${i},n:6,used:[],bag:{}}))`);
 collect(item.say);
 const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
 if(item.cls&&/ecole-house-stage/.test(item.cls)&&all(st,'.keypad').length){
  const box=st.querySelector('.box'),ans=box.getAttribute('data-a');
  const kp=all(st,'.keypad')[0],keys=all(kp,'button'),ok=keys.find(b=>b.classList.contains('ok'));const pressDigit=d=>keys.find(b=>b.getAttribute('aria-label')===d).click();
  pressDigit(String((+ans+1)%10));ok.click();await Promise.resolve();
  for(const d of ans)pressDigit(d);ok.click();await Promise.resolve();
  check(api.results.some(r=>r.ok===true),id+' clavier : la bonne réponse est acceptée');return;
 }
 const go=all(st,'.go-btn')[0];
 if(go&&!api.keyEl){go.click();check(api.results.some(r=>r.finish),id+' : la règle se termine sans note');return;}
 check(api.keyEl,`${id} niveau ${li} : une réponse attendue est désignée`);
 /* Une erreur volontaire d’abord, quand un autre choix existe */
 const choices=all(st,'button').filter(b=>b!==api.keyEl&&!b.disabled&&/card|ecole-paint|ecole-tile/.test(b.className)&&!/ecole-help|hint-btn/.test(b.className));
 if(choices.length){choices[0].click();await Promise.resolve();}
 const before=api.results.filter(r=>r.ok===true).length;
 let guard=0;
 while(api.results.filter(r=>r.ok===true).length===before&&guard++<40){
  /* Le moteur désigne la prochaine bonne réponse après chaque étape réussie */
  const k=api.keyEl;k.click();await Promise.resolve();await Promise.resolve();
  if(api.results.filter(r=>r.ok===true).length>before)break;
  const next=nextKey(id,st,api);if(next)api.keyEl=next;else break;
 }
 check(api.results.some(r=>r.ok===true),`${id} niveau ${li} item ${i} : l’exercice se termine par une réussite`);
 const help=all(st,'.ecole-help')[0];if(help){help.click();check(api.helped,id+' : l’aide est comptée comme aide');}
}
/* Étapes multiples : la bonne tuile suivante est relue dans la scène */
function nextKey(id,st,api){
 if(id==='phraseOrdre'){const filled=all(st,'.ecole-slot.filled').length,words=all(st,'.ecole-slot').length;const tiles=all(st,'.ecole-tile').filter(b=>!b.disabled);const want=api._words||(api._words=null);return tiles.find(b=>b.getAttribute('aria-label')===api._sentence?.[filled])||null;}
 return null;
}
(async()=>{
 for(const id of IDS){
  const levels=run(`GAMES.${id}.levels.length`);
  for(let li=0;li<levels;li++)for(let seed=1;seed<=12;seed++){
   const n=run(`GAMES.${id}.levels[${li}].n||6`);
   for(const i of [0,1,2,n-1])await playItemSafe(id,li,seed*31+i,i);
  }
 }
 const missing=[...new Set(spoken)].filter(s=>!voiceLines.has(keyNorm(s)));
 check(missing.length===0,'Phrases dites mais absentes de la liste vocale : '+missing.slice(0,8).join(' | '));

 /* 3. Contenu : exactitude des données pédagogiques */
 run(`
 const ok=(c,m)=>{if(!c)throw Error(m)};
 for(const k of Object.keys(ECOLE_MIRROR_WORDS))for(const [w] of ECOLE_MIRROR_WORDS[k]){const L=k[0]==='p'||k==='q'?k[0]:k[0];ok(w.split(L).length===2,'La lettre '+L+' apparaît une seule fois dans '+w);}
 for(const f of ECOLE_GRAPH_FAMILIES){ok(f.words.length>=6,f.id+' a au moins six mots');for(const [w] of f.words)ok(ecoleGraphRanges(f.id,w).length>0,'La graphie '+f.id+' est repérée dans '+w);ok(ecoleGraphRanges(f.id,f.anchor[0]).length>0,'Mot repère '+f.anchor[0]);}
 for(const n of ECOLE_NOUNS)if(n.pl)ok(n.pl===n.w+'s','Pluriel régulier : '+n.w);
 for(const s of ECOLE_ORDER_SENTENCES){ok(/^[A-Z]/.test(s.words[0])&&s.s.endsWith('.'),'Majuscule et point : '+s.s);ok(new Set(s.words).size===s.words.length,'Mots distincts : '+s.s);}
 for(const n of [3,4,5,6])ok(ECOLE_ORDER_SENTENCES.filter(s=>s.words.length===n).length>=4,'Au moins quatre phrases de '+n+' mots');
 ok(nw(70)==='septante'&&nw(90)==='nonante'&&nw(80)==='quatre-vingts','Nombres à la belge');
 ok(ECOLE_DAYS[(ECOLE_CAL_START+1-1)%7]==='mercredi','Le calendrier commence un mercredi');
 for(const s of ECOLE_SEASONS)for(const m of s.months)ok(ecoleSeasonSentence(m,s).includes(s.id==='printemps'?'au printemps':'en '+s.id),'Préposition de saison');
 ok(Object.values(ECOLE_SOLIDS).filter(s=>s.rolls).length===3,'Trois solides roulent');
 for(const p of ECOLE_TOGETHER)ok(ECOLE_TOGETHER.filter(q=>q.g!==p.g).length>=3,'Assez de distracteurs pour '+p.a[1]);
 `);

 /* 4. Toutes les images utilisées existent dans le lot local */
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/illustrations/manifest.json'),'utf8'));
 const have=new Set(manifest.files.map(f=>f.emoji.replace(/️/g,'')));
 const src=fs.readFileSync(path.join(root,'ecole-parcours-fragment.js'),'utf8');
 const used=[...new Set([...src.matchAll(/'([^'\w\s,.:;!?’()[\]{}<>=+\-*/\\"`#%&|^~@$]{1,8})'/g)].map(m=>m[1]).filter(c=>[...c].some(ch=>ch.codePointAt(0)>0x2000)))];
 const absent=used.filter(e=>!have.has(e.replace(/️/g,'')));
 check(absent.length===0,'Images absentes du lot local : '+absent.join(' '));
 console.log('ecole-parcours: '+IDS.length+' jeux, '+voiceLines.size+' phrases, '+used.length+' images — OK');
})().catch(e=>{console.error(e);process.exit(1);});
async function playItemSafe(id,li,seed,i){
 if(id==='phraseOrdre'){
  const item=run(`withSeed(${seed},()=>GAMES.phraseOrdre.make({g:GAMES.phraseOrdre,L:GAMES.phraseOrdre.levels[${li}],li:${li},i:${i},n:6,used:[],bag:{}}))`);
  collect(item.say);const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
  const sentence=run(`(${JSON.stringify(item.exemplar)}).slice(7)`).replace(/\.$/,'').split(' ');
  const tiles=all(st,'.ecole-tile');const wrong=tiles.find(b=>b.getAttribute('aria-label')!==sentence[0]);if(wrong)wrong.click();
  check(api.steps.some(s=>s.ok===false),'Phrase : un mot dans le mauvais ordre est refusé');
  for(const w of sentence)tiles.find(b=>b.getAttribute('aria-label')===w&&!b.disabled).click();
  check(api.results.length===1&&api.results[0].ok,'Phrase : les mots dans l’ordre forment la phrase '+sentence.join(' '));
  all(st,'.ecole-help')[0].click();check(api.helped,'Phrase : l’aide est comptée');return;
 }
 if(id==='copieModele'){
  const item=run(`withSeed(${seed},()=>GAMES.copieModele.make({g:GAMES.copieModele,L:GAMES.copieModele.levels[${li}],li:${li},i:${i},n:4,used:[],bag:{}}))`);
  collect(item.say);const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
  const model=run(`(${JSON.stringify(item.exemplar)}).slice(7).split(',')`);const paints=all(st,'.ecole-paint');
  const wrong=paints.find(b=>b.getAttribute('aria-label')!==model[0]);if(wrong){wrong.click();check(api.steps.some(s=>s.ok===false),'Modèle : une mauvaise couleur est refusée');}
  for(const c of model)paints.find(b=>b.getAttribute('aria-label')===c).click();
  check(api.results.length===1&&api.results[0].ok,'Modèle : la copie complète réussit');return;
 }
 if(id==='maisonNombres'&&run(`!!GAMES.maisonNombres.levels[${li}].all`)){
  const item=run(`withSeed(${seed},()=>GAMES.maisonNombres.make({g:GAMES.maisonNombres,L:GAMES.maisonNombres.levels[${li}],li:${li},i:${i},n:4,used:[],bag:{}}))`);
  collect(item.say);const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
  const [,N,blanks]=item.exemplar.split(':');const tiles=all(st,'.ecole-num');
  const need=blanks.split(',').map(a=>+N-+a);const wrong=tiles.find(b=>b.textContent!==String(need[0]));if(wrong)wrong.click();
  for(const v of need)tiles.find(b=>b.textContent===String(v)).click();
  check(api.results.length===1&&api.results[0].ok,'Maison : tous les étages remplis');return;
 }
 return playItem(id,li,seed,i);
}
