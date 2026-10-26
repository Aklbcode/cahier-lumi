/* Progression tests against the integrated application, without a browser.
   Access is distinct from independent evidence. These checks do not measure
   a child's reading, handwriting, or learning outside the application. */
'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {loadApp}=require('./helpers/render-fixture.cjs');
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
assert(source.includes('const LEARNING_PATHS='),'Integrate progression-parcours-fragment.js before testing');
assert(source.includes('function curriculumMathAccess('),'Integrate the mathematics dependency graph before testing');

vm.runInContext(`
let pathsChecks=0,pathsGenerated=0;
const pathsCheck=(ok,message)=>{pathsChecks++;if(!ok)throw Error(message);};
const pathsSame=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pathsFresh=()=>({stars:0,treasures:0,games:{},skills:{},evidence:{},lecture:{unlocked:0,done:{},pass:{},gp:{}},calcul:{open:0,mods:{}}});
const pathsActivate=(p,world='grands')=>{S=curriculumPreserveAccess(defState());S.current=world==='petits'?'lola':'luca';S.world=world;S.profiles.find(x=>x.id===S.current).world=world;S.progress[S.current]=p;RUN=null;};
const pathsPass=(p,indices)=>{p.lecture.pass=Object.fromEntries(indices.map(i=>[i,{at:1,score:6}]));return p;};
save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};

/* Every visible activity belongs to exactly one ordered group. */
for(const world of ['grands','petits'])for(const theme of ['lire','calculer']){
 const p=pathsFresh();pathsActivate(p,world);
 const groups=learningPathGroups(world,theme),ids=groups.flatMap(g=>g.ids),visible=themesOf(world).find(t=>t.id===theme).ids;
 pathsCheck(groups.length>0,world+'/'+theme+' has a path');
 pathsCheck(new Set(groups.map(g=>g.id)).size===groups.length,world+'/'+theme+' has unique section IDs');
 pathsCheck(new Set(ids).size===ids.length,world+'/'+theme+' has no duplicate activity');
 pathsCheck(pathsSame(ids,visible),world+'/'+theme+' classifies every visible activity once in its displayed order');
 for(const group of groups){pathsCheck(!!group.title&&group.ids.length>0,'Each section has an explicit title and activities');for(const id of group.ids)pathsCheck(!!GAMES[id],'The grouped activity exists: '+world+'/'+id);}
}
{
 const reading=learningPathGroups('grands','lire').flatMap(g=>g.ids),maths=learningPathGroups('grands','calculer').flatMap(g=>g.ids);
 for(const [before,after]of [['lecture','mots'],['mots','phraseOrdre'],['phraseOrdre','livres']])pathsCheck(reading.indexOf(before)<reading.indexOf(after),'Reading order: '+before+' before '+after);
 for(const [before,after]of [['blocs','maisonNombres'],['maisonNombres','calcul'],['calcul','pontDix'],['pontDix','balance']])pathsCheck(maths.indexOf(before)<maths.indexOf(after),'Calculation order: '+before+' before '+after);
 pathsCheck(learningPathGroups('grands','lire').find(g=>g.ids.includes('recit')).parallel,'Oral narrative is a parallel branch');
 pathsCheck(learningPathGroups('grands','calculer').find(g=>g.ids.includes('formesSolides')).parallel,'Geometry is a parallel branch');
 pathsCheck(learningPathGroups('grands','calculer').find(g=>g.ids.includes('calendrier')).parallel,'Calendar is a parallel branch');
 pathsCheck(learningPathGroups('grands','calculer').find(g=>g.ids.includes('paniers')).extension,'Groups and multiplication are explicitly an extension');
 pathsActivate(pathsFresh());for(const id of ['recit','petitsMots','formesSolides','calendrier','grandeurs'])pathsCheck(familyAccess(id).ready,'The parallel entry does not require arithmetic or decoding: '+id);
 pathsActivate(pathsFresh(),'petits');for(const id of learningPathGroups('petits','lire').flatMap(g=>g.ids).concat(learningPathGroups('petits','calculer').flatMap(g=>g.ids)))pathsCheck(familyAccess(id).ready,'Preschool entry is discoverable without an invented academic prerequisite: '+id);
}

/* A visit, previous access, stars, or a parent opening is not a prerequisite
   success for another activity. Preserve that activity itself for training. */
{
 const p=pathsFresh();p.stars=999;p.treasures=25;p.games.blocs={lvl:3,unlocked:3,rounds:4,best:{}};p.games.pontDix={lvl:1,unlocked:1,rounds:2,best:{}};p.last={blocs:1,pontDix:2};p.familyEvents=[{id:'blocs',at:1,first:null,skipped:true}];pathsActivate(p);S.settings.learningPathLegacy.children.luca=curriculumAccessSnapshot(p);
 const before=JSON.stringify(p);
 pathsCheck(!curriculumQuantitiesReady(p,10),'Visiting or opening quantity levels does not prove quantities to ten');
 pathsCheck(!curriculumGameRequirement('maisonNombres',p,0).ready,'A visited cubes game does not open number houses');
 pathsCheck(!curriculumGameRequirement('pontDix',p,0).ready,'A visited cubes game does not open complements to ten');
 pathsCheck(!curriculumGameRequirement('balance',p,0).ready,'A visited complements game does not open equality');
 const preserved=familyAccess('pontDix',p);pathsCheck(preserved.ready&&preserved.training&&preserved.previous,'The previously visited activity itself remains available as training');
 pathsCheck(JSON.stringify(p)===before,'Access queries do not add evidence, mutate stars or change saved IDs');
 p.familyAccess={blocs:1,pontDix:1};p.parentActions=[{at:1,action:'open',target:{kind:'game',gid:'blocs'}}];
 pathsCheck(!curriculumQuantitiesReady(p,10)&&!curriculumGamePassed('pontDix',0,p),'Adult openings do not become independent prerequisites');
 pathsCheck(!familyAccess('balance',p).ready,'Opening the prerequisite for training does not automatically open the dependent activity');
 const level=GAMES.blocs.levels.findIndex(L=>L.max>=10);pathsCheck(level>=0,'A real cubes level represents quantities to ten');p.games.blocs.best[level]=2;
 pathsCheck(curriculumQuantitiesReady(p,10),'A real successful quantity level supplies the matching prerequisite');
}

/* Migration adds one bounded historical-access snapshot and preserves the
   original records, reward values, and activity identities. */
{
 const child=pathsFresh();child.stars=7;child.treasures=4;child.equipped=['piece','anneau'];child.lecture.unlocked=8;child.lecture.done={0:3,1:2};child.lecture.pass={0:{at:11,score:6},1:{at:12,parent:true},2:{at:13,review:true}};child.games.balade={lvl:2,unlocked:3,best:{0:3},rounds:2};child.calcul={open:3,mods:{a10:{done:{0:2},pass:{0:{at:14,score:5}}}}};child.resume={kind:'game',gid:'balade',li:2,next:1,seed:123,res:[{first:true}]};
 const other=pathsFresh();other.stars=3;const old={...defState(),progress:{luca:JSON.parse(JSON.stringify(child)),lola:JSON.parse(JSON.stringify(other))}},beforeChild=JSON.stringify(child),beforeOther=JSON.stringify(other),migrated=migrate(old);
 pathsCheck(migrated.settings.learningPathLegacy.v===1&&migrated.settings.learningPathLegacy.children.luca.readingOpen===8,'The first migration snapshots the historic reading frontier outside child records');
 const savedChild=migrated.progress.luca,savedOther=migrated.progress.lola;
 pathsCheck(JSON.stringify(savedChild)===beforeChild,'Migration preserves rewards, pass flags, IDs, results and unfinished series');
 pathsCheck(JSON.stringify(savedOther)===beforeOther,'Migration preserves the other child');
 migrated.progress.luca.lecture.unlocked=27;const again=migrate(migrated);
 pathsCheck(again.settings.learningPathLegacy.children.luca.readingOpen===8,'The historic snapshot cannot expand when newer progress opens sounds');
 pathsCheck(again.settings.learningPathLegacy.children.luca.games.balade===3,'Existing game access is bounded to its previous maximum');
 const fresh=curriculumPreserveAccess({profiles:[{id:'luca'}],progress:{luca:pathsFresh()}});fresh.progress.luca.lecture.unlocked=27;curriculumPreserveAccess(fresh);
 pathsCheck(fresh.settings.learningPathLegacy.children.luca.readingOpen===0,'A new profile never turns later openings into old access');
}

/* Parent-only sound records and an unlocked frontier do not make a reader. */
{
 const p=pathsFresh();p.lecture.unlocked=27;p.lecture.pass=Object.fromEntries(LESSONS.map((L,i)=>[i,{at:1,parent:true}]));p.learningPaths={v:1,legacyReadingOpen:27};pathsActivate(p);
 pathsCheck(readingPracticeKnownKeys(p).size===0&&familyIndependentSounds(p).length===0,'Zero independent passes remain zero even when every sound was parent-passed');
 pathsCheck(curriculumReadableWords(p).length===0,'Parent-passed sounds supply no independently decodable word corpus');
 pathsCheck(MINI_BOOKS.every(b=>!miniBookDecodable(b)),'An unlocked or parent-passed frontier does not label books independently decodable');
 p.lecture.pass={0:{at:1,review:true},999:{at:1,score:6}};
 pathsCheck(readingPracticeKnownKeys(p).size===0,'Review and invalid records do not add independently known sounds');
 p.lecture.pass={};p.familyAccess={mots:1,balade:1,riviere:1};
 for(const id of ['mots','balade','riviere']){
  p.games[id]={lvl:0,unlocked:0,best:{},rounds:0};const access=familyAccess(id,p);
  pathsCheck(access.ready&&access.parent&&access.training,'Parent opening remains explicit accompanied training: '+id);
  const game=GAMES[id],item=withSeed(77,()=>game.make({g:game,L:game.levels[0],li:0,i:0,n:6,used:[],bag:{}}));
  pathsCheck(item.helped===true&&item.evidenceKey==='training:'+id,'A parent-opened unsupported item is marked as training: '+id);
  const st=document.createElement('div');let helped=false;item.render(st,{exam:false,alive:()=>true,help(){helped=true;},key(){},answer(){return Promise.resolve(true)},step(){return Promise.resolve(true)},finish(){},say(){return Promise.resolve()}});
  pathsCheck(helped,'The real renderer signals assistance to the engine before answering: '+id);
 }
 pathsCheck(readingPracticeKnownKeys(p).size===0&&curriculumReadableWords(p).length===0,'Generating/rendering parent training fabricates no sound pass');
}

/* Corpora follow the actual independently passed set, including non-prefix
   sets. At least three distinct targets are required for an independent game. */
for(let cutoff=-1;cutoff<LESSONS.length;cutoff++){
 const p=pathsPass(pathsFresh(),Array.from({length:cutoff+1},(_,i)=>i));p.lecture.unlocked=27;pathsActivate(p);const known=readingPracticeKnownKeys(p);
 for(const max of [2,4,8,12]){
  const words=curriculumReadableWords(p,max);
  pathsCheck(new Set(words.map(w=>w.w)).size===words.length,'No duplicate corpus word at '+cutoff+'/'+max);
  for(const W of words){pathsCheck([...W.keys].every(k=>known.has(k)),'No unpassed sound in '+W.w+' at '+cutoff);pathsCheck(W.gs.filter(g=>!g.mute).length<=max&&W.req!==99&&!GLIDE_WORDS.has(W.w)&&picOK(W),'Corpus keeps explicit length, phonetics and image limits for '+W.w);}
 }
 for(const id of ['mots','balade','riviere'])for(let li=0;li<GAMES[id].levels.length;li++){
  const g=GAMES[id],L=g.levels[li];p.games[id]={lvl:li,unlocked:0,best:{},rounds:0};
  const pool=id==='riviere'?curriculumRiverPool(L,p):curriculumReadableWords(p,id==='mots'?L.max:12).filter(w=>id!=='balade'||w.w.length>=L.min&&w.w.length<=L.max&&!/[ ’-]/.test(w.w));
  const access=curriculumGameRequirement(id,p,li);
  pathsCheck(access.ready===(pool.length>=3),'Independent access requires three actual targets: '+id+' level '+li+' cutoff '+cutoff+' pool '+pool.length);
  if(!access.ready)continue;
  pathsCheck(pool.length>=3,'An independent series has target variety');
  for(const W of pool){const lexical=WORDS.find(w=>w.w===W.w);pathsCheck(!!lexical&&[...lexical.keys].every(k=>known.has(k)),'The actual generated pool contains no unpassed word: '+id+'/'+W.w);}
  for(let seed=1;seed<=4;seed++){
   const item=withSeed(seed*47+li,()=>g.make({g,L,li,i:seed,n:6,used:[],bag:{}}));
   const said=(Array.isArray(item.say)?item.say.flat(4):[item.say]).filter(x=>typeof x==='string'),target=pool.find(w=>w.w===item.exemplar||said.includes(w.w));
   pathsCheck(!!target,'The real generator chooses a word from its independently readable pool: '+id+' level '+li+' cutoff '+cutoff);pathsGenerated++;
  }
 }
}
{
 const keep=['a','m','l','i','o'],indices=LESSONS.flatMap((L,i)=>keep.includes(L.k)?[i]:[]),p=pathsPass(pathsFresh(),indices);p.lecture.unlocked=27;pathsActivate(p);
 pathsCheck([...readingPracticeKnownKeys(p)].every(k=>keep.includes(k)),'A sparse pass set is not expanded to all earlier/unlocked sounds');
 for(const W of curriculumReadableWords(p,12))pathsCheck([...W.keys].every(k=>keep.includes(k)),'Sparse passes constrain every grapheme: '+W.w);
 const all=pathsPass(pathsFresh(),LESSONS.map((_,i)=>i));all.lecture.unlocked=0;pathsActivate(all);
 pathsCheck(MINI_BOOKS.every(miniBookDecodable),'Actual independent sound passes make the books decodable even with frontier zero');
 const p2=pathsFresh();p2.lecture.unlocked=27;pathsActivate(p2);pathsCheck(MINI_BOOKS.every(b=>!miniBookDecodable(b)),'Frontier alone cannot substitute for independent passes');
}
`,ctx,{timeout:20000});

const result=JSON.parse(vm.runInContext('JSON.stringify({checks:pathsChecks,generatedItems:pathsGenerated})',ctx));
assert(result.checks>1000,'The corpus/property checks should cover the progression, not just its headings');
console.log('Parcours : '+result.checks+' contrôles, '+result.generatedItems+' items générés ; groupes complets, prérequis, accès historiques/adultes, migration et corpus décodables vérifiés.');
