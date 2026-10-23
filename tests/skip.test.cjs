const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fake=()=>({nodeType:1,style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fake,createTextNode:t=>({nodeType:3,textContent:t}),body:fake(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
if(!source.includes('function skippedNote(n)'))source+='\n'+fs.readFileSync(path.join(root,'scripts/skip-fragment.js'),'utf8');
vm.runInContext(source,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
const check=(b,msg)=>{if(!b)throw Error(msg)},good=()=>({first:true}),skip=()=>({first:null,skipped:true}),intro=()=>({first:null});
check(scoreOf([skip(),skip()]).stars===0&&scoreOf([skip()]).answered===0,'No free reward for entirely skipped series');check(scoreOf([]).stars===0,'Empty results do not earn stars');
const mixed=scoreOf([good(),good(),skip()]);check(mixed.skipped===1&&mixed.answered===2&&mixed.errors===0&&mixed.stars===2,'Skipped answers counted separately, never as errors or full reward');
check(scoreOf([good(),intro()]).stars===3&&scoreOf([good(),{first:false,wrongs:1}]).stars===2&&scoreOf([{first:false,wrongs:3}]).stars===1,'Existing perfect/error rewards and demonstrations preserved');
save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.ensure=()=>{};Sfx.play=()=>{};let marks=[],queue=[],plays=0,rewards=[],celebration=null;
Shell.open=()=>{};Shell.setDots=()=>{};Shell.setLevel=()=>{};Shell.now=()=>{};Shell.mark=(i,state)=>marks.push(state);Celebrate.show=o=>{celebration=o;};addStars=n=>{rewards.push(n);return {earned:n};};
Engine.play=async()=>{plays++;const value=queue.shift();if(!value)throw Error('Missing exercise fixture');return value;};
buildLesson=()=>[{skill:'a'},{skill:'a'}];buildDefi=()=>Array.from({length:6},()=>({skill:'a'}));genDistinct=(gen,n)=>Array.from({length:n},()=>({}));
const reset=()=>{S=defState();S.current='luca';S.world='grands';queue=[];plays=0;marks=[];rewards=[];celebration=null;};
reset();RUN={abort:false};queue=[intro(),...Array.from({length:5},good),skip()];let d=await runDefi(RUN,Array(6).fill({}),false);check(!d.pass&&d.ok===5&&d.skipped===1&&d.answered===5,'Five good answers plus one skipped cannot validate a challenge');check(marks.includes('skipped'),'Skipped challenge has a distinct visual marker');
reset();RUN={abort:false};queue=[intro(),...Array.from({length:5},good),{first:false}];d=await runDefi(RUN,Array(6).fill({}),false);check(d.pass&&d.skipped===0,'Five correct of six assessed answers still validates');
reset();queue=[skip(),good()];await runLesson(0);check(plays===2&&!P().lecture.pass[0]&&P().lecture.unlocked===0,'Training skip does not launch assessment or unlock reading');check(P().lecture.gp.a.n===1&&P().lecture.gp.a.ok===1,'Skipped reading item never enters skill accuracy');check(celebration.note.includes('passé')&&!P().resume,'Partial series is explained and resume cleared once');
reset();queue=[skip(),skip()];await runLesson(0);check(!rewards.length&&!P().lecture.done[0]&&!P().lecture.pass[0],'All skipped reading gives no stars or achievement');
reset();queue=[good(),good(),intro(),...Array.from({length:5},good),skip()];await runLesson(0);check(!P().lecture.pass[0]&&P().lecture.unlocked===0,'Skipped reading challenge does not unlock the next sound');check(P().lecture.log[0].skipped===1&&P().lecture.gp.a.n===7,'Reading log preserves skipped count without false error');
reset();queue=[good(),good(),intro(),...Array.from({length:6},good)];await runLesson(0);check(P().lecture.pass[0].score===6&&P().lecture.unlocked===1,'Unskipped successful reading still progresses');
reset();P().lecture.pass[0]={score:6,at:1};P().lecture.unlocked=1;P().lecture.done[0]=3;queue=[skip(),skip()];await runLesson(0);check(P().lecture.pass[0].score===6&&P().lecture.done[0]===3,'Skipping a revision preserves existing acquired evidence');
reset();queue=Array.from({length:8},skip);await runModule(0,0);check(plays===8&&!modProg(MODS[0].id).pass[0]&&calc().open===0&&!rewards.length,'All skipped calculation does not unlock, assess or reward');check(!P().skills['calc:'+MODS[0].id+':0'],'No incorrect or correct calculation evidence fabricated');
reset();queue=[...Array.from({length:8},good),intro(),...Array.from({length:5},good),skip()];await runModule(0,0);check(!modProg(MODS[0].id).pass[0]&&calc().open===0,'Skipped calculation challenge cannot pass');check(calc().log[0].skipped===1&&P().skills['calc:'+MODS[0].id+':0'].n===13,'Calculation log and accuracy exclude skipped answers');
reset();queue=[...Array.from({length:8},good),intro(),...Array.from({length:6},good)];await runModule(0,0);check(modProg(MODS[0].id).pass[0].score===6&&typeof celebration.next==='function','Successful unskipped calculation offers the next step');
reset();const last=MODS[0].levels.length-1;modProg(MODS[0].id).pass[last]={score:6,at:1};queue=Array.from({length:8},skip);await runModule(0,last);check(calc().open===0&&modProg(MODS[0].id).pass[last].score===6,'Skipping a previously valid last step never opens another module');
reset();const resume=resumeSession('lesson',{li:0});resume.next=1;resume.res=[skip()];queue=[good()];await runLesson(0);check(plays===1&&P().lecture.unlocked===0&&marks.includes('skipped'),'A resumed skipped exercise remains skipped and cannot become a fresh success');
reset();queue=[skip(),intro(),intro(),good(),good()];await readMiniBook(MINI_BOOKS[0]);check(P().bookEvidence[MINI_BOOKS[0].id].skipped===1,'A skipped reading page is retained alongside skipped comprehension questions');check(levelState('livres').current===0,'Skipping a reading page does not complete the book');
reset();queue=[intro(),intro(),intro(),good(),good()];await readMiniBook(MINI_BOOKS[0]);check(P().bookEvidence[MINI_BOOKS[0].id].skipped===0&&levelState('livres').current===1,'An unskipped reading attempt completes a book');queue=[skip(),intro(),intro(),good(),good()];await readMiniBook(MINI_BOOKS[0]);check(P().bookEvidence[MINI_BOOKS[0].id].skipped===1&&levelState('livres').current===1,'A later skipped reread preserves the first completed reading attempt');
})()`,ctx,{timeout:10000});
 assert.ok(source.includes('r.skipped'), 'Result state retains explicit skips');
 console.log('Exercices passés : récompenses proportionnées, défis sans fausse validation, reprises, progression et acquis antérieurs vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
