/* Curriculum, compatibility and runner transitions; no browser automation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {loadApp}=require('./helpers/render-fixture.cjs');
const {ctx,source}=loadApp({Blob,URL,AbortController});
const fragment=fs.readFileSync(path.join(__dirname,'../curriculum-math-fragment.js'),'utf8');
if(!source.includes('const CURRICULUM_MATH_ORDER='))vm.runInContext(fragment,ctx,{timeout:10000});
async function main(){
 await vm.runInContext(`(async()=>{
 const check=(value,message)=>{if(!value)throw Error(message);};
 const clone=value=>JSON.parse(JSON.stringify(value));
 const fresh=()=>({calcul:{open:0,mods:{}},games:{},skills:{},familyAccess:{},parentActions:[]});
 const pass=(p,key,parent=false)=>{const t=curriculumMathTarget(key),id=MODS[t.mi].id;p.calcul.mods[id]=p.calcul.mods[id]||{done:{},pass:{}};p.calcul.mods[id].pass[t.lv]={at:1,score:6,...(parent?{parent:true}:{})};};
 const targetKey=t=>t?curriculumMathKey(t.mi,t.lv):null;
 const ready=(key,p)=>{const t=curriculumMathTarget(key);return curriculumMathAccess(t.mi,t.lv,p).ready;};
 const expected=MODS.flatMap(M=>M.levels.map((_,lv)=>M.id+':'+lv));
 check(expected.length===33&&CURRICULUM_MATH_ORDER.length===33&&new Set(CURRICULUM_MATH_ORDER).size===33,'The 33 original module IDs and local indices occur exactly once');
 check(expected.every(key=>CURRICULUM_MATH_ORDER.includes(key)),'No stored math level is removed or renamed');
 const groupKeys=CURRICULUM_MATH_GROUPS.flatMap(g=>g.keys);check(groupKeys.length===33&&new Set(groupKeys).size===33&&expected.every(k=>groupKeys.includes(k)),'Every level occurs in exactly one visible group');
 for(const key of CURRICULUM_MATH_ORDER){check(curriculumMathTarget(key),'Each target exists');for(const before of CURRICULUM_MATH_REQUIRES[key])check(CURRICULUM_MATH_ORDER.indexOf(before)>=0&&CURRICULUM_MATH_ORDER.indexOf(before)<CURRICULUM_MATH_ORDER.indexOf(key),'Dependencies exist and the displayed step order is topological: '+key);}
 let p=fresh(),before=JSON.stringify(p);curriculumMathAccess(10,0,p);curriculumMathNext(p);curriculumMathCurrent(p);curriculumMathPassed('n10',0,p);check(JSON.stringify(p)===before,'Access and recommendation are pure when supplied a profile');
 check(ready('n10:0',p)&&ready('n10:1',p)&&!ready('a10:0',p),'A new child can recognize/count before symbolic addition');
 let access=curriculumMathAccess(10,0,p);check(!access.ready&&targetKey(access.target)==='n10:1','A locked problem gives a concrete accessible prerequisite rather than a dead end');
 pass(p,'n10:1');check(ready('a10:0',p)&&ready('s10:0',p),'Concrete adding and removing are parallel branches after counting');
 pass(p,'a10:0');check(!ready('pb:0',p),'A first problem series waits for the relevant adding and removing meanings');
 pass(p,'s10:0');check(ready('pb:0',p)&&!curriculumMathPassed('n100',0,p)&&!curriculumMathPassed('mul',0,p),'Problems to ten do not depend on numbers to one hundred or multiplication');
 check(targetKey(curriculumMathNext(p,{mi:3,lv:0}))==='pb:0','First problems are recommended immediately after the first addition/removal series, before complements and mental fluency');
 for(const key of ['pb:0','n20:0','a20:0','s20:0'])pass(p,key);
 check(ready('pb:1',p)&&!ready('pb:2',p),'Problems to twenty are core; mixed multiplication problems remain an extension');
 check(targetKey(curriculumMathNext(p,{mi:7,lv:0}))==='pb:1','Problems to twenty are recommended before finishing all mental strategies');
 pass(p,'pb:1');pass(p,'mul:0');check(ready('pb:2',p),'Multiplicative problems become available after their own relevant prerequisite');
 p=fresh();pass(p,'a10:0',true);pass(p,'s10:0');check(!curriculumMathPassed('a10',0,p)&&ready('pb:0',p),'A parent-passed prerequisite permits routing without becoming an independent success');
 p=fresh();p.calcul.mods.n100={done:{},pass:{},parentStart:2};check(ready('n100:2',p)&&!curriculumMathPassed('n100',2,p),'Parent-selected exact starts remain accessible without fabricated assessment');
 p=fresh();p.familyAccess.calcul=123;check(ready('pb:2',p)&&!curriculumMathPassed('pb',2,p),'The adult whole-activity opening remains available and distinct from success');
 p=fresh();p.parentActions=[{at:2,action:'open',target:{kind:'calcul',mi:9,index:2}}];check(ready('mul:2',p),'An exact parent opening is respected');p.parentActions[0].undone=3;check(!ready('mul:2',p),'Undoing that opening restores prerequisites');
 p=fresh();p.calcul.open=5;check(ready('s10:0',p)&&ready('n20:0',p)&&!curriculumMathPassed('s10',0,p),'Historically opened modules stay accessible, without manufactured passes');check(!ready('s10:2',p),'Legacy access does not silently open every local level');
 p.calcul.mods.s10={done:{},pass:{1:{at:1}}};check(ready('s10:2',p),'Previously unlocked local levels remain replayable');
 p=fresh();p.calcul.mods.n10={done:{0:3}};before=JSON.stringify(p);check(curriculumMathPassed('n10',0,p)&&JSON.stringify(p)===before,'Pre-pass historic completions are read using the existing migration meaning without mutation');
 p=fresh();p.demo=true;check(CURRICULUM_MATH_ORDER.every(key=>ready(key,p)),'The separate Admin/demo profile can open all levels');
 check(!curriculumMathAccess(-1,0,fresh()).ready&&!curriculumMathAccess(0,99,fresh()).ready,'Invalid indices do not start a module');
 /* Every fresh graph state can reach all targets by real pass records; no cycle
    or unreachable island is hidden by a broad legacy frontier. */
 p=fresh();let visited=[];for(let guard=0;guard<40;guard++){const next=curriculumMathNext(p);if(!next)break;const key=targetKey(next);check(!visited.includes(key),'No recommendation loop');visited.push(key);pass(p,key);}
 check(visited.length===33&&curriculumMathNext(p)===null&&p.calcul.open===0,'All 33 levels are reachable, the last level terminates, and the old frontier is unchanged');

 save=()=>{};S=defState();S.current='luca';Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.ensure=()=>{};Sfx.play=()=>{};Lumi.react=()=>{};VoicePack.prefetchScope=()=>{};Shell.build();
 let child=P();for(const key of ['n10:1','a10:0','s10:0'])pass(child,key);child.calcul.focus={mi:10,lv:0,at:100};
 let view=levelState('calcul'),idx=CURRICULUM_MATH_ORDER.indexOf('pb:0');check(view.label==='Étape'&&view.current===idx+1&&view.items[idx].mi===10&&view.items[idx].lv===0,'The activity meter and selector use the graph order, retaining original indices');
 let active=currentRunLevel({gid:'calcul',session:{kind:'module',mi:10,lv:0}});check(active.current===idx+1&&active.name===MODS[10].levels[0].name,'The running level header agrees with the same ordered selector');
 S=defState();S.current='luca';RUN=null;openCalcul();check(Shell.stage.querySelectorAll('.curriculum-math-group').length===6&&Shell.stage.querySelectorAll('.curriculum-math-step').length===33,'The real selector groups all original levels');
 let started=null,actualRunModule=runModule;runModule=(mi,lv)=>{started={mi,lv};};Shell.stage.querySelector('[data-math-key="pb:0"]').click();let modal=document.body.querySelector('.modal');check(modal&&modal.textContent.includes('Pour commencer'),'A locked card explains the next useful preparation');modal.querySelectorAll('button').find(b=>b.textContent==='Commencer par cette activité').click();check(targetKey(started)==='n10:1'&&!document.body.querySelector('.modal'),'One clear action starts the accessible prerequisite');runModule=actualRunModule;

 const actualEnginePlay=Engine.play,actualDefi=runDefi,actualCelebrate=Celebrate.show,actualStars=addStars;
 let shown=null,credits=[],defiCalls=0,plays=0;
 Celebrate.show=o=>{shown=o;};addStars=n=>{credits.push(n);return {earned:n};};Engine.play=async()=>{plays++;return {first:true,helped:false};};
 runDefi=async()=>{defiCalls++;return {pass:true,ok:5,n:6,res:[...Array.from({length:5},()=>({first:true})),{first:false,wrongs:1}]};};
 S=defState();S.current='luca';child=P();for(const key of ['n10:1','a10:0','s10:0'])pass(child,key);const other=JSON.stringify(S.progress.lola);await runModule(10,0);
 check(plays===8&&defiCalls===1&&shown.stars===2&&credits.length===1&&credits[0]===2,'Eight correct practice items plus a 5/6 challenge show and credit exactly the same two stars');
 check(child.calcul.open===0&&curriculumMathPassed('pb',0,child)&&child.calcul.focus,'A real challenge stores its original ID/index and a focus, without opening fictional earlier modules');check(JSON.stringify(S.progress.lola)===other,'The other child is unchanged');
 check(typeof shown.next==='function','A successful series offers a graph-based next step');
 S=defState();S.current='luca';child=P();pass(child,'n10:1',true);plays=0;defiCalls=0;credits=[];runDefi=async()=>{defiCalls++;return {pass:true,ok:6,n:6,res:Array.from({length:6},()=>({first:true}))};};await runModule(0,1);
 check(defiCalls===1&&curriculumMathPassed('n10',1,child)&&!child.calcul.mods.n10.pass[1].parent,'Retaking a parent-passed stage needs a real challenge before becoming an independent success');
 S=defState();S.current='luca';child=P();credits=[];defiCalls=0;Engine.play=async()=>({first:null,skipped:true,wrongs:0});await runModule(0,1);
 check(credits.length===0&&shown.stars===0&&shown.sticker===null&&defiCalls===0&&!curriculumMathPassed('n10',1,child)&&child.calcul.open===0&&!shown.next,'An entirely passed series creates no success, reward, challenge or automatic next step');
 S=defState();S.current='luca';child=P();plays=0;credits=[];Engine.play=async()=>{plays++;return {first:true};};child.resume={v:1,kind:'module',mi:0,lv:1,seed:123,next:3,res:[{first:false,wrongs:1},{first:true},{first:true}],partialWrongs:0,partialHelped:false};await runModule(0,1);
 check(plays===5&&shown.stars===2&&credits[0]===2&&!child.resume,'A saved module resumes the exact remaining five questions, retaining its previous error and final reward');
 S=defState();S.current='luca';child=P();credits=[];shown=null;Engine.play=async()=>{RUN={gid:'another'};return {first:true};};await runModule(0,1);
 check(!shown&&!credits.length&&!curriculumMathPassed('n10',1,child),'A late result after changing activity cannot complete or reward the abandoned run');
 Engine.play=actualEnginePlay;runDefi=actualDefi;Celebrate.show=actualCelebrate;addStars=actualStars;
 })()`,ctx,{timeout:20000});
 assert.ok(!fragment.includes('speechSynthesis')&&!fragment.includes('setInterval'),'No new alternate voice or timed race');
 console.log('Curriculum maths : 33 niveaux sans cycle, prérequis locaux, problèmes précoces, accès historiques/parent/Admin, groupes, reprise, saut, isolation et étoiles finales cohérentes — OK.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
