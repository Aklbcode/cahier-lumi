const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),fragment=fs.readFileSync(path.join(root,'math-practice-fragment.js'),'utf8'),{ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:fn=>{Promise.resolve().then(fn);return 0;},clearTimeout(){}});
if(!source.includes('const MATH_REVIEW_DAYS='))vm.runInContext(fragment,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
 const mpCheck=(ok,message)=>{if(!ok)throw Error(message)},flushMath=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
 save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();VoicePack.prefetchScope=()=>{};Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};renderHome=()=>{};S=defState();S.current='luca';
 const mpCtx=(L,li=0,i=0)=>({L,li,i,used:[],bag:{}}),mpApi=()=>({results:[],steps:[],finishes:[],helps:0,active:true,exam:false,alive(){return this.active;},key(){},help(){this.helps++;},answer(ok,options={}){this.results.push({ok,options});return ok;},step(ok,options={}){this.steps.push({ok,options});return ok;},finish(first,details={}){this.finishes.push({first,details});}}),makeMathStage=()=>{const st=document.createElement('div');st.getBoundingClientRect=()=>({width:800,height:500});return st;};
 const typeMath=(st,n)=>{const keys=st.querySelector('.keypad').querySelectorAll('button');for(const digit of String(n))keys.find(b=>b.getAttribute('aria-label')===digit).click();keys.find(b=>b.getAttribute('aria-label')==='valider').click();};
 const fact=mathFactFromConfig({eq:[3,'+',4,'=','?'],ans:7});mpCheck(fact&&fact.answer===7,'Addition facts are modeled from the actual displayed equation');
 mpCheck(!mathFactFromConfig({eq:[3,'×',4,'=','?'],ans:12})&&!mathFactFromConfig({eq:[3,'+',4,'=','?'],ans:8}),'Premature multiplication and mathematically false equations are rejected');
 mpCheck(mathFactFromConfig({eq:['?','+','?','=',8],ans:4}).eq.filter(x=>x==='?').length===1,'Halves recall has one real input rather than moving a shared input node twice');
 const childA={},childB={};mpCheck(mathReviewPlan(childA,1000).length===0,'No facts are invented from access levels');
 mpCheck(!observeMathFact(childA,fact,{first:null,skipped:true},1000)&&!observeMathFact(childA,fact,{first:null},1000),'Skipped and demonstration items do not seed review');
 observeMathFact(childA,fact,{first:false,wrongs:1},1000);mpCheck(mathReviewPlan(childA,1000).length===6&&mathReviewPlan(childB,1000).length===0,'Review contains only a fact actually encountered by this child');
 const start=100000;let now=start;for(let stage=0;stage<MATH_REVIEW_DAYS.length;stage++){mathReviewRecord(childA,fact,{first:true},now);const e=mathPracticeState(childA).review[fact.id];mpCheck(e.stage===stage&&e.due-now===MATH_REVIEW_DAYS[stage]*MATH_DAY_MS,'Spacing follows exactly 1/3/7/14/30 days');const due=e.due;mathReviewRecord(childA,fact,{first:true},now+1);mpCheck(e.stage===stage&&e.due===due,'Extra same-day practice cannot speed up the spacing ladder');now=due;}
 mathReviewRecord(childA,fact,{first:false,wrongs:1},now);mpCheck(mathPracticeState(childA).review[fact.id].stage===-1&&mathPracticeState(childA).review[fact.id].due===now+MATH_DAY_MS,'An error restarts with a next-day review');
 const reviewBefore=JSON.stringify(childA);mpCheck(!mathReviewRecord(childA,fact,{first:null,skipped:true},now)&&JSON.stringify(childA)===reviewBefore,'Passing a review changes neither schedule nor success evidence');
 mpCheck(!mathReviewRecord(childB,fact,{first:true},now),'Unknown facts cannot gain review evidence');
 for(let n=1;n<=8;n++)observeMathFact(childA,mathFactFromConfig({eq:[n,'+',1,'=','?'],ans:n+1}),{first:true},now+n);
 const plan=mathReviewPlan(childA,now+1);mpCheck(plan.length===6&&new Set(plan.map(f=>f.id)).size===6,'Six distinct encountered facts are mixed when available');
 const coreBefore=JSON.stringify(P().calcul);mathReviewRecord(P(),fact,{first:true},now);mpCheck(JSON.stringify(P().calcul)===coreBefore,'Review never changes the original calculation modules or their assessment passes');

 for(const gid of ['ligneP','ligne'])for(let li=0;li<GAMES[gid].levels.length;li++){
  const L=GAMES[gid].levels[li],item=GAMES[gid].make(mpCtx(L,li)),st=makeMathStage(),api=mpApi();item.render(st,api);
  const cells=st.querySelectorAll('.math-line-cell'),roll=st.querySelector('.math-line-roll');
  mpCheck(cells.length===L.end/L.step&&item.lineModel.values.at(-1)===L.end,'Linear board uses the expected 1–10, 1–20 or tens-to-100 range');
  mpCheck(roll.disabled,'Die starts after the child locates the first number');cells[0].click();
  roll.click();cells[2].click();mpCheck(api.steps.at(-1).ok===false&&!cells[2].classList.contains('current'),'Skipping a number is rejected without moving');
  let guard=0;while(!api.finishes.length&&guard++<100){if(!roll.disabled)roll.click();const current=cells.findIndex(c=>c.classList.contains('current'));cells[current+1].click();}
  mpCheck(api.finishes.length===1&&api.finishes[0].details.completed&&api.finishes[0].details.wrongs===1,'Every visited square leads to one completed cooperative or solo journey with honest errors');
  mpCheck(item.lineModel.cooperative===!!L.coop,'Cooperation is a shared journey, without a separate opponent score');
 }
 for(let li=0;li<GAMES.pontDix.levels.length;li++)for(let seed=0;seed<8;seed++){
  const item=withSeed(1000+seed,()=>GAMES.pontDix.make(mpCtx(GAMES.pontDix.levels[li],li))),st=makeMathStage(),api=mpApi();Shell.item=item;RUN={session:{}};item.render(st,api);
  if(li===0){mpCheck(item.model.a+item.model.answer===10,'Bridge complementary numbers sum to ten');st.querySelectorAll('.math-ten-cell').filter(b=>!b.disabled).forEach(b=>b.click());mpCheck(api.finishes.length===1&&api.finishes[0].first===null&&api.finishes[0].details.practice,'Guided frame construction is not fabricated independent mastery');}
  else{if(li===2){const help=st.querySelectorAll('button').find(b=>b.textContent==='Voir le cadre');help.click();mpCheck(item.helped&&RUN.session.partialHelped,'Viewing a hidden frame is explicitly counted as help');}typeMath(st,item.answer===0?1:0);await flushMath();typeMath(st,item.answer);await flushMath();mpCheck(api.results.length===2&&!api.results[0].ok&&api.results[1].ok,'Concrete and hidden complements reject a wrong input then accept the true complement');}
 }
 for(let li=0;li<GAMES.balance.levels.length;li++)for(let seed=0;seed<20;seed++){
  const item=withSeed(3000+seed,()=>GAMES.balance.make(mpCtx(GAMES.balance.levels[li],li))),m=item.model,st=makeMathStage(),api=mpApi();item.render(st,api);
  mpCheck(m.a+m.b===m.answer+m.fixed,'Both balance sides contain the same total');mpCheck((m.eq[0]==='?')===(li===1),'Unknown really appears on the other side in the second level');
  typeMath(st,0);await flushMath();typeMath(st,m.answer);await flushMath();mpCheck(!api.results[0].ok&&api.results.at(-1).ok,'Equality uses the actual unknown, not the left-side total as answer');
 }
 for(let li=0;li<GAMES.barres.levels.length;li++)for(let seed=0;seed<6;seed++){
  const item=withSeed(6000+seed,()=>GAMES.barres.make(mpCtx(GAMES.barres.levels[li],li))),m=item.model,st=makeMathStage(),api=mpApi();item.render(st,api);
  mpCheck(m.answer===(m.kind==='join'?m.a+m.b:m.kind==='compare'?m.a-m.b:(m.a+m.b)/2),'Oral bar problem arithmetic is correct for join/comparison/equal sharing');
  const pieces=st.querySelectorAll('.math-bar-piece');pieces[1].click();mpCheck(api.steps.at(-1).ok===false,'Bar placement respects the represented story order');pieces[0].click();pieces[1].click();
  mpCheck(st.querySelectorAll('.math-bar-slot').every(s=>s.children.length===1),'Two bars are manipulated into the story before any answer keypad');
  const bars=st.querySelectorAll('.math-bar-slot').map(s=>s.children[0]);mpCheck(Math.abs(parseFloat(bars[0].style.width)/m.a-parseFloat(bars[1].style.width)/m.b)<.0001,'Both bars retain exactly the same unit length at all responsive sizes');
  const choice=st.querySelectorAll('button').find(b=>b.textContent===(m.operation==='share'?'Partager en deux':m.operation));choice.click();typeMath(st,m.answer);await flushMath();mpCheck(api.results.at(-1).ok,'Choosing the operation then typing the result completes the story');
 }
 for(let li=0;li<GAMES.grandeurs.levels.length;li++)for(let seed=0;seed<10;seed++){
  const item=withSeed(8000+seed,()=>GAMES.grandeurs.make(mpCtx(GAMES.grandeurs.levels[li],li))),m=item.model,st=makeMathStage(),api=mpApi();item.render(st,api);
  if(m.mode==='unit'){mpCheck(st.querySelector('.math-unit-strip').children.length===m.answer,'Unit length corresponds to the exact number of equal units');typeMath(st,m.answer);}
  else if(m.mode==='change'){mpCheck(m.answer===m.paid-m.price&&m.answer>=0,'Change is exact and nonnegative');if(m.answer===0)st.querySelectorAll('button').find(b=>b.textContent==='0 €').click();else for(let i=0;i<m.answer;i++)st.querySelectorAll('button').find(b=>b.textContent==='1 €').click();}
  else{const bad=st.querySelectorAll('button').find(b=>Number(b.getAttribute('data-quantity'))!==m.answer);bad.click();mpCheck(!api.results.at(-1).ok,'Wrong magnitude is rejected');st.querySelectorAll('button').find(b=>Number(b.getAttribute('data-quantity'))===m.answer).click();}
  await flushMath();mpCheck(api.results.at(-1).ok,'Each magnitude and money level accepts its mathematically correct choice');
 }
 for(let li=0;li<GAMES.doigts.levels.length;li++)for(let seed=0;seed<8;seed++){
  const item=withSeed(9000+seed,()=>GAMES.doigts.make(mpCtx(GAMES.doigts.levels[li],li))),st=makeMathStage(),api=mpApi();item.render(st,api);
  mpCheck(item.model.answer>=1&&item.model.answer<=GAMES.doigts.levels[li].max,'Finger target stays within the developmental range');
  if(item.model.mode==='raise'){st.querySelectorAll('.math-finger-toggle').slice(0,item.model.answer).forEach(b=>b.click());mpCheck(api.finishes.length===1&&api.finishes[0].first===null,'Guided finger counting does not pretend to be independent assessment');}
  else{const correct=st.querySelectorAll('button').find(b=>Number(b.getAttribute('data-fingers'))===item.model.answer);correct.click();mpCheck(api.results.length===1&&api.results[0].ok,'Finger recognition accepts the requested quantity');}
 }
 /* Real Engine exercises seed only completed actual core math questions. */
 S=defState();S.current='luca';Shell.build();const coreItem=kpItem({say:'Calcule.',eq:[2,'+',3,'=','?'],ans:5}),run={gid:'calcul',session:{seed:1,next:0},abort:false,res:[]};RUN=run;Shell.open({level:'Calcul'});let pending=Engine.play(coreItem,run);typeMath(Shell.stage,5);await pending;mpCheck(mathPracticeState().encountered[coreItem.mathPracticeFact.id],'The real Engine hook collects a displayed and completed equation');
 const otherBefore=JSON.stringify(S.progress.lola||{}),newItem=kpItem({say:'Calcule.',eq:[7,'−',2,'=','?'],ans:5});RUN=run;pending=Engine.play(newItem,run);Shell.skipCurrent();await pending;mpCheck(!mathPracticeState().encountered[newItem.mathPracticeFact.id],'Skipping through the real Engine never seeds an unseen review fact');mpCheck(JSON.stringify(S.progress.lola||{})===otherBefore,'The other child remains independent');
 const schedule=JSON.stringify(mathPracticeState().review);RUN=run;pending=Engine.play(mathReviewItem(coreItem.mathPracticeFact),run);Shell.skipCurrent();await pending;mpCheck(JSON.stringify(mathPracticeState().review)===schedule,'The real skip action leaves review success and spacing unchanged');
 for(let n=1;n<=8;n++)observeMathFact(P(),mathFactFromConfig({eq:[n,'+',1,'=','?'],ans:n+1}),{first:true},1000+n);
 const oldCore=JSON.stringify(P().calcul),oldSkills=JSON.stringify(P().skills),reviewPending=runMathReview();await flushMath();const reviewPlan=RUN.session.mathReviewPlan.slice();
 for(let i=0;i<6;i++){mpCheck(RUN.session.next===i,'The real six-item review resumes at the expected item');if(i===2)Shell.skipCurrent();else typeMath(Shell.stage,reviewPlan[i].answer);await flushMath();}
 await reviewPending;mpCheck(Shell.el.querySelector('.celebrate'),'Six real keypad/skip interactions end on a completion screen');
 mpCheck(!mathPracticeState().review[reviewPlan[2].id]&&reviewPlan.filter((f,i)=>i!==2).every(f=>mathPracticeState().review[f.id]?.stage===0),'Only answered review facts receive a next-day schedule');
 mpCheck(JSON.stringify(P().calcul)===oldCore&&JSON.stringify(P().skills)===oldSkills,'Completing review cannot manufacture original-module passes or skills');
 S=defState();S.current='luca';calc().open=MODS.length-1;modProg(MODS[0].id).pass[0]={parent:true};await runMathReview();mpCheck(!Shell.stage.querySelector('.keypad')&&Shell.stage.textContent.includes('Découvre d’abord'),'Parent-opened levels do not seed unseen review facts');
 const voices=new Set(mathPracticeVoiceLines());for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){if(a<=5&&b<=5)mpCheck(voices.has(mathBarsStory('join',a,b)),'All addition stories are voiced');if(a>=4&&b<a)mpCheck(voices.has(mathBarsStory('compare',a,b)),'All comparison stories are voiced');if(a===b&&a<=5)mpCheck(voices.has(mathBarsStory('share',a,b)),'All sharing stories are voiced');}
 for(const world of ['petits','grands'])for(const id of world==='petits'?['doigts','ligneP']:['ligne','rappelCalcul','pontDix','balance','barres','grandeurs'])mpCheck(WORLD_TILES[world].includes(id)&&themesOf(world).some(t=>t.id==='calculer'&&t.ids.includes(id))&&GAMES[id].levels.every(L=>L.name&&L.skill),'Each new activity has distinct named levels and is reachable in the correct theme');
 })()`,ctx,{timeout:30000});
 assert.ok(!fragment.includes('setInterval')&&!fragment.includes('speechSynthesis'),'No time race or alternative synthesized voice');
 console.log('Maths : faits réellement vus, espacement 1/3/7/14/30, ligne, compléments, égalités, barres, grandeurs, doigts, erreurs et sauts vérifiés.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
