/* Mon exposé : le renard — inscription, parcours complet de chaque activité,
   phrases enregistrables, images présentes. Source seulement. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{loadApp}=require('./helpers/render-fixture.cjs');
const {speechSegments,speechJoin}=require('../speech-engine.js');
const root=path.join(__dirname,'..'),{ctx}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const run=code=>vm.runInContext(code,ctx);
run(`save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Voice.slower=f=>f();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';P().demo=true;`);

/* 1. Inscription : Luca, thème Découvrir, en premier */
check(run(`!!GAMES.renard&&typeof GAMES.renard.open==='function'`),'Le renard est inscrit avec son menu');
const dec=run(`themesOf('grands').find(t=>t.id==='decouvrir').ids`);
check(dec[0]==='renard','Le renard ouvre le thème Découvrir de Luca');
check(!run(`themesOf('petits').some(t=>t.ids.includes('renard'))`),'Le renard n’apparaît pas chez Lola');
check(run(`familyAccess('renard').ready`),'Le renard est accessible sans prérequis');
check(run(`RENARD_RUBRIQUES.length`)===8,'Les huit rubriques de la consigne sont présentes');

/* 2. Chaque activité se joue jusqu’au bout */
const keyNorm=t=>String(t).normalize('NFC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?…:]+$/,'').trim().toLocaleLowerCase('fr');
const voiceLines=new Set(run('renardVoiceLines()').flatMap(t=>speechSegments(t).map(s=>keyNorm(s.t))));
const spoken=[];
const collect=p=>{for(const u of speechJoin(p))if(u&&typeof u==='object')for(const s of speechSegments(u.t))spoken.push(s.t);};
function makeApi(){
 const api={results:[],steps:[],helped:false,exam:false,alive:()=>true,key(el){api.keyEl=el;},help(){api.helped=true;},
  answer(ok,o={}){api.results.push({ok,o});if(ok&&o.praise)collect(o.praise);if(!ok&&o.feedback)collect(o.feedback);if(o.reveal)collect(o.reveal);return Promise.resolve(ok);},
  step(ok,o={}){api.steps.push({ok,o});if(!ok&&o.feedback)collect(o.feedback);return Promise.resolve(ok);},
  finish(first){api.results.push({ok:first,finish:true});},skip(){api.results.push({skipped:true});}};
 return api;
}
const all=(el,sel)=>el.querySelectorAll(sel);
const tick=async()=>{for(let k=0;k<4;k++)await Promise.resolve();};
(async()=>{
const acts=run('RENARD_ACTIVITES.map(a=>({id:a.id,n:a.n}))');
check(acts.length===11,'Onze activités');
for(const [k,A] of acts.entries()){
 run(`__rctx={g:GAMES.renard,A:RENARD_ACTIVITES[${k}],k:${k},i:0,n:${A.n},used:[],bag:{}}`);
 for(let i=0;i<A.n;i++){
  const item=run(`__rctx.i=${i};withSeed(${1000+k*31+i},()=>RENARD_ACTIVITES[${k}].make(__rctx))`);
  collect(item.say);
  const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
  if(A.id==='corps'){check(st.children.length>0,'Le corps du renard se dessine');continue;}/* SVG : vérifié dans le navigateur */
  if(!api.keyEl){
   const go=all(st,'.go-btn')[0];check(go,`${A.id} ${i} : un bouton pour continuer`);go.click();
   check(api.results.some(r=>r.finish),`${A.id} ${i} : l’étape se termine`);continue;
  }
  const wrong=all(st,'button').find(b=>b!==api.keyEl&&!b.disabled&&/card/.test(b.className));
  if(wrong&&!all(st,'.renard-order-line').length){wrong.click();await tick();check(api.results.some(r=>r.ok===false)||api.steps.some(s=>s.ok===false),`${A.id} ${i} : une erreur est corrigée`);}
  let guard=0;while(!api.results.some(r=>r.ok===true)&&guard++<10){api.keyEl.click();await tick();}
  check(api.results.some(r=>r.ok===true),`${A.id} ${i} : l’exercice se termine par une réussite`);
 }
}

/* 3. Le quiz garde la première réponse et fait un bilan par rubrique */
{
 run(`__q={g:GAMES.renard,A:RENARD_ACTIVITES[10],k:10,i:0,n:13,used:[],bag:{}}`);
 for(let i=0;i<12;i++){
  const item=run(`__q.i=${i};withSeed(${77+i},()=>RENARD_ACTIVITES[10].make(__q))`);const st=ctx.document.createElement('div'),api=makeApi();item.render(st,api);
  const wrong=all(st,'button').find(b=>b!==api.keyEl&&/card/.test(b.className));
  if(i%3===0&&wrong){wrong.click();await tick();}
  api.keyEl.click();await tick();
 }
 const first=run('__q.bag.first');check(Object.keys(first).length===12,'Les douze premières réponses sont notées');
 check(Object.values(first).filter(x=>!x).length===4,'Les erreurs du premier coup restent notées après correction');
 const bilan=run(`__q.i=12;RENARD_ACTIVITES[10].make(__q)`);const st=ctx.document.createElement('div'),api=makeApi();bilan.render(st,api);
 check(all(st,'.renard-bilan-row').length===8,'Le bilan montre les huit rubriques');
 check(all(st,'.renard-bilan-row.again').length>=1,'Le bilan signale une rubrique à revoir');
 check(run('P().renardQuiz.slice(-1)[0].ok')===8,'Le résultat du quiz est gardé pour les parents');
 collect(bilan.say);
}

/* 4. Tout ce que Charline dit est dans la liste à enregistrer */
const missing=[...new Set(spoken)].filter(s=>!voiceLines.has(keyNorm(s)));
check(!missing.length,'Phrases absentes de renardVoiceLines : '+missing.slice(0,8).join(' | '));

/* 5. Chaque image du renard existe dans le paquet Twemoji local */
const bundle=fs.readFileSync(path.join(root,'assets/illustrations/twemoji-bundle.js'),'utf8');
const src=fs.readFileSync(path.join(root,'renard-expose-fragment.js'),'utf8');
const emojis=[...new Set(src.match(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu))].filter(e=>!['✓','✗'].includes(e));
const code=e=>[...(e.includes('\u200d')?e:e.replace(/\uFE0F/g,''))].map(c=>c.codePointAt(0).toString(16)).join('-');
const absent=emojis.filter(e=>!bundle.includes('"'+code(e)+'"'));
check(!absent.length,'Images absentes du paquet : '+absent.join(' '));

console.log(`renard: ${acts.length} activités, ${run('renardVoiceLines().length')} phrases, ${emojis.length} images — OK`);
})().catch(e=>{console.error(e);process.exit(1);});
