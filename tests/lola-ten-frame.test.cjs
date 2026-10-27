'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),fragment=fs.readFileSync(path.join(root,'lola-ten-frame-fragment.js'),'utf8');
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:fn=>{Promise.resolve().then(fn);return 0;},clearTimeout(){}});
if(!source.includes('function lolaTenFrameItem('))vm.runInContext(fragment,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
 const check=(ok,message)=>{if(!ok)throw Error(message);},flush=async()=>{for(let i=0;i<70;i++)await Promise.resolve();};
 save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();VoicePack.prefetchScope=()=>{};Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};renderHome=()=>{};
 S=defState();S.current='lola';S.world='petits';
 const g=GAMES.boulesP;
 check(g.levels.length===4&&g.n===8,'Four progressive levels, each with eight questions');
 check(g.levels.map(L=>L.max).join(',')==='3,5,10,10'&&!g.levels[2].scattered&&g.levels[3].scattered,'Counting progresses from 1–3 to ten arranged and scattered balls');
 check(WORLD_TILES.petits.includes(g.id)&&!WORLD_TILES.grands.includes(g.id),'The new activity belongs to Lola only');
 const groups=learningPathGroups('petits','calculer'),group=groups.find(x=>x.id==='quantites');
 check(group.ids.indexOf(g.id)===group.ids.indexOf('nombres')+1,'The game is next to the other small-quantity activities');
 check(themesOf('petits').find(t=>t.id==='calculer').ids.includes(g.id)&&familyAccess(g.id).ready,'Lola can discover this game without unrelated prerequisites');
 check(levelState(g.id).current===1&&levelState(g.id).total===4,'Existing current/maximum level controls support the game');
 const reached=new Set();let cases=0;
 for(let li=0;li<g.levels.length;li++)for(let seed=0;seed<40;seed++){
  const L=g.levels[li],context={g,L,li,i:0,n:8,bag:{},used:[]},answers=[];
  for(let i=0;i<8;i++){
   context.i=i;const item=withSeed(seed*100+i+li*9000,()=>g.make(context)),st=document.createElement('div'),results=[];
   const api={alive:()=>true,key(){},answer(ok,o){results.push({ok,o});}};item.render(st,api);cases++;
   const m=item.model,balls=st.querySelectorAll('.lola-ten-ball'),cells=st.querySelectorAll('.lola-ten-cell'),buttons=st.querySelectorAll('.lola-ten-number');
   check(cells.length===10&&balls.length===m.answer,'Exactly ten fixed cells and exactly the target number of red balls');
   check(m.answer>=1&&m.answer<=L.max&&m.positions.length===m.answer&&new Set(m.positions).size===m.answer&&m.positions.every(p=>p>=0&&p<10),'Every target is 1–10 with valid, nonduplicated occupied positions');
   if(!L.scattered)check(m.positions.every((p,i)=>p===i),'Arranged quantities are filled left-to-right, top row first');
   check(buttons.length===L.max&&buttons.every((b,i)=>Number(b.getAttribute('data-number'))===i+1),'Number choices are stable, ordered, directly clickable, and never exceed ten');
   const right=buttons.find(b=>Number(b.getAttribute('data-number'))===m.answer),wrong=buttons.find(b=>b!==right);wrong.click();right.click();
   check(results.length===2&&!results[0].ok&&results[1].ok&&results[0].o.correctEl===right,'Wrong numbers are rejected and the true count is accepted in one click');
   check(!st.querySelectorAll('button').some(b=>/valider|continuer|vérifier/i.test(b.textContent)),'Counting requires no second validation button');
   answers.push(m.answer);if(li===3)reached.add(m.answer);
  }
  const frequencies=Array.from({length:L.max},(_,i)=>answers.filter(n=>n===i+1).length);
  check(Math.max(...frequencies)-Math.min(...frequencies)<=1,'Targets are balanced across the eight-question series');
  check(answers.every((a,i)=>i===0||a!==answers[i-1]),'Adjacent questions do not repeat the same quantity');
 }
 check(reached.size===10,'Repeated final-level series genuinely exercise every number from one through ten');
 /* Real Engine + standard eight-question runner: completion, next level,
    skip, persisted progress, and child isolation use the app mechanisms. */
 Shell.build();const lucaBefore=JSON.stringify(S.progress.luca),gp=gameProg(g.id);gp.lvl=0;
 const pending=runGame(g.id);await flush();
 for(let i=0;i<8;i++){
  check(RUN.session.next===i&&Shell.item?.model,'The runner presents the next actual counting question');
  const answer=Shell.item.model.answer;Shell.stage.querySelectorAll('.lola-ten-number').find(b=>Number(b.getAttribute('data-number'))===answer).click();await flush();
 }
 await pending;check(gp.lvl===1&&gp.unlocked===1,'Eight correct answers open the next counting level');
 check(Shell.el.querySelector('.celebrate')&&Shell.el.textContent.includes('Niveau suivant'),'The result screen proposes the next level');
 check(JSON.stringify(S.progress.luca)===lucaBefore,'Luca’s progress is untouched');
 const skipBefore=gp.unlocked;Shell.clearCeleb();gp.lvl=1;const skipRun=runGame(g.id);await flush();
 for(let i=0;i<8;i++){Shell.skipCurrent();await flush();}await skipRun;
 check(gp.unlocked===skipBefore,'Skipping a whole series does not unlock the following level');
 check(RUN.res.length===8&&RUN.res.every(r=>r.skipped),'Every counting question supports the normal skip action');
 console.log('Cadre rouge Lola : '+cases+' questions, 4 niveaux, quantités exactes, choix directs, parcours, réussite, suite et sauts vérifiés.');
 })()`,ctx,{timeout:30000});
 const index=JSON.parse(fs.readFileSync(path.join(root,'voix/index-belge.json'),'utf8'));
 const normalized=new Set(Object.keys(index.clips).map(k=>k.replace(/^[nms]\|/,'').replace(/[.!?…:]+$/,'').trim().toLowerCase()));
 for(const line of ['Combien de points ?','Touche le bon chiffre.'])assert(normalized.has(line.replace(/[.!?…:]+$/,'').trim().toLowerCase()),'The new game uses a real existing Charline recording: '+line);
 assert(!fragment.includes('speechSynthesis')&&!fragment.includes('setInterval'),'No alternative speaker or timer race');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
