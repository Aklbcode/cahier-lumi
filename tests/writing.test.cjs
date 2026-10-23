const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fake=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fake,createTextNode:t=>({textContent:t}),body:fake(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
if(!source.includes('const WRITING_MODELS='))source+='\n'+fs.readFileSync(path.join(root,'learning-writing-fragment.js'),'utf8');
vm.runInContext(source,ctx);
vm.runInContext(`
const check=(condition,message)=>{if(!condition)throw Error(message);};save=()=>{};S=defState();S.current='luca';
check(Object.keys(WRITING_MODELS).filter(k=>!WRITING_MODELS[k].gesture).length===12,'Twelve explicit script forms');
for(const [key,model]of Object.entries(WRITING_MODELS)){
 check(model.strokes.every(s=>s.length>1&&s.every(p=>p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=100&&p[1]>=0&&p[1]<=115)),'Finite in-bounds paths: '+key);
 const before=JSON.stringify(model),perfect=writingTraceMetrics(model,model.strokes,!!model.gesture);check(perfect.ok&&perfect.orderObserved,'Reference drawing is attainable: '+key);check(JSON.stringify(model)===before,'Scoring is non-destructive');
 check(!writingTraceMetrics(model,[],!!model.gesture).ok,'Blank board never succeeds');
 const shifted=model.strokes.map(s=>s.map(([x,y])=>[x+35,y]));check(!writingTraceMetrics(model,shifted,!!model.gesture).ok,'Wrong area is rejected: '+key);
 const scribble=Array.from({length:20},(_,i)=>[[3,3+i*5],[97,3+i*5]]);check(!writingTraceMetrics(model,scribble,!!model.gesture).ok,'Scribbling over everything is rejected: '+key);
 check(!writingTraceMetrics(model,[[[NaN,2]]],!!model.gesture).ok,'Invalid points cannot pass');
 const svg=writingSVG(model,{ink:model.strokes,progress:{stroke:0,fraction:.5}});check(svg.includes('<svg')&&!/NaN|Infinity|undefined/.test(svg),'Renderable model: '+key);
}
const backwards=WRITING_MODELS.l.strokes.map(s=>[...s].reverse());check(writingTraceMetrics(WRITING_MODELS.l,backwards).ok&&!writingTraceMetrics(WRITING_MODELS.l,backwards).orderObserved,'Shape resemblance is separate from observed stroke order');
for(const key of ['a','d','i','t','n','m','p','b']){check(!writingTraceMetrics(WRITING_MODELS[key],WRITING_MODELS[key].strokes.slice(0,1)).ok,'A missing stroke is rejected: '+key);}
check(GAMES.trace.levels.length===9&&new Set(GAMES.trace.levels.map(l=>l.mode)).size===3,'Trace, copy and recall stages');
for(const L of GAMES.trace.levels){const item=GAMES.trace.make({L,used:[],bag:{},i:0});check(item.render&&item.evidenceKey.startsWith('writing:')&&item.exemplar.includes(':vector-v1'),'Explicit writing scope and exemplar');}
for(const L of LESSONS){const item=GAMES.trace.make({L:{set:[L.main],font:'script'},used:[],bag:{},i:0});check(typeof item.render==='function','All existing lesson graphemes retain a renderer: '+L.main);}
check(themesOf('petits').find(t=>t.id==='creer').ids.includes('pretrace'),'Preparatory gestures are reachable for young children');
const previousStars=seriesRewards().stars,previousSkills=JSON.stringify(P().skills);writingStoreResult('a','recall',{coverage:1,outside:0,orderObserved:true},true);check(P().writingPractice.items['a:recall'].last.screenGestureOnly&&P().writingPractice.items['a:recall'].aided===1,'Aided screen gestures are explicitly scoped');check(seriesRewards().stars===previousStars&&JSON.stringify(P().skills)===previousSkills,'Writing observation does not award rewards or create school evidence');
check(writingEffectiveAid(false,{session:{partialHelped:true}})&&writingEffectiveAid(true,{})&&!writingEffectiveAid(false,{session:{partialHelped:false}}),'An aid survives an interrupted item');check(!writingAutoDemoAllowed('recall',true)&&writingAutoDemoAllowed('recall',false)&&writingAutoDemoAllowed('trace',true),'A pending automatic demonstration cannot reveal an already hidden recall model');
const worksheet=writingWorksheetSVG();check(worksheet.includes('210mm')&&worksheet.includes('297mm')&&!/NaN|Infinity|undefined/.test(worksheet),'Printable A4 SVG');check(!writingWorksheetSVG(['<script>']).includes('<script>'),'Only known letters are exported');check(writingVoiceLines().length>=13&&writingVoiceLines().every(s=>typeof s==='string'),'Public speech is enumerable');
`,ctx,{timeout:10000});
assert.ok(!fs.readFileSync(path.join(root,'learning-writing-fragment.js'),'utf8').includes('speechSynthesis'),'No device voice fallback');
console.log('Écriture : douze géométries, trois modes, anciens graphèmes, prégraphisme, limites du suivi et fiche A4 vérifiés.');
