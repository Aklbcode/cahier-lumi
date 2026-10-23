const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fake=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fake,createTextNode:t=>({textContent:t}),body:fake(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
if(!source.includes("const SCHOOL_WRITING_VERSION="))source+='\n'+fs.readFileSync(path.join(root,'school-writing-fragment.js'),'utf8');
vm.runInContext(source,ctx);
vm.runInContext(`
const verify=(condition,message)=>{if(!condition)throw Error(message);};save=()=>{};S=defState();S.current='luca';
verify(Object.keys(SCHOOL_WRITING_MODELS).length===12,'Twelve explicit cursive forms');
for(const [letter,model]of Object.entries(SCHOOL_WRITING_MODELS)){
 verify(model.cursive&&model.version===SCHOOL_WRITING_VERSION,'Versioned cursive model: '+letter);
 verify(model.strokes.every(s=>s.length>1&&s.every(p=>p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=100&&p[1]>=0&&p[1]<=115)),'Finite in-bounds geometry: '+letter);
 verify(model.strokes[0][0][0]<=8&&model.strokes[0].at(-1)[0]>=90,'An entrance and joining exit are explicit: '+letter);
 verify(model.strokes[0].slice(1).every((p,i)=>Math.hypot(p[0]-model.strokes[0][i][0],p[1]-model.strokes[0][i][1])<9),'The main cursive stroke is continuous: '+letter);
 const result=writingTraceMetrics(model,model.strokes);verify(result.ok&&result.orderObserved,'The actual reference gesture is attainable: '+letter);
 verify(!writingTraceMetrics(model,[]).ok,'A blank board cannot pass');
 verify(!writingTraceMetrics(model,Array.from({length:20},(_,i)=>[[3,3+i*5],[97,3+i*5]])).ok,'Scribbles cannot pass');
 verify(!/NaN|Infinity|undefined/.test(writingSVG(model,{progress:{stroke:0,fraction:.5},ink:model.strokes})),'Model can render');
 verify(JSON.stringify(model.strokes)!==JSON.stringify(WRITING_MODELS[letter]?.strokes),'Cursive is a new geometry rather than a font on old script guides: '+letter);
}
verify(SCHOOL_WRITING_MODELS.i.strokes.length===2&&SCHOOL_WRITING_MODELS.t.strokes.length===2,'Dots and bars follow the continuous body');
verify(GAMES.cursive.levels.length===9&&new Set(GAMES.cursive.levels.map(l=>l.mode)).size===3,'Tracing then copying then recall');
for(const L of GAMES.cursive.levels){const item=GAMES.cursive.make({L,used:[],bag:{},i:0});verify(item.evidenceKey.startsWith('cursive:'+SCHOOL_WRITING_VERSION+':')&&item.exemplar.endsWith(SCHOOL_WRITING_VERSION),'New evidence namespace');verify(typeof item.render==='function','Every stage can render');}
const oldScript=P().games.trace={lvl:8,unlocked:8,best:{0:3},rounds:10,low:0};P().writingPractice={version:1,items:{'a:trace':{completed:7}}};
verify(gameProg('cursive').lvl===0,'Script progression is not silently inherited by cursive');
const stars=seriesRewards().stars,skills=JSON.stringify(P().skills);schoolWritingStoreResult('a','trace',{coverage:1,outside:0,orderObserved:true},true);
verify(P().games.trace===oldScript&&P().writingPractice.items['a:trace'].completed===7,'Historical script observations stay intact');
verify(P().cursivePractice.items['a:trace'].aided===1&&P().cursivePractice.items['a:trace'].last.screenGestureOnly,'Cursive observation stays scoped and aided');
verify(seriesRewards().stars===stars&&JSON.stringify(P().skills)===skills,'An observation alone does not award stars or certify a skill');
verify(themesOf('grands').find(t=>t.id==='creer').ids.includes('cursive')&&!themesOf('grands').find(t=>t.id==='creer').ids.includes('trace'),'The new activity is reachable');
verify(themesOf('petits').find(t=>t.id==='creer').ids.includes('pretrace'),'Young children keep preparatory gestures');
verify(schoolWritingWorksheetSVG().includes('210mm')&&schoolWritingWorksheetSVG().includes('297mm'),'Printable A4 cursive sheet');
verify(!schoolWritingWorksheetSVG(['<script>']).includes('<script>'),'Unknown models cannot enter the exported SVG');
verify(schoolWritingVoiceLines().length>=8&&schoolWritingVoiceLines().every(s=>typeof s==='string'),'Speech inventory is enumerable');
`,ctx,{timeout:10000});
const bytes=fs.readFileSync(path.join(root,'assets/fonts/Borel-Regular.ttf'));assert.ok(bytes.length>20000&&bytes.readUInt32BE(0)===65536,'A real local TrueType font is bundled');
assert.match(fs.readFileSync(path.join(root,'assets/fonts/Borel-OFL.txt'),'utf8'),/SIL OPEN FONT LICENSE/);
assert.ok(!fs.readFileSync(path.join(root,'school-writing-fragment.js'),'utf8').includes('speechSynthesis'),'No alternate device voice');
console.log('Cursive: versioned geometry, continuous gestures, distinct evidence, stages, font and export passed.');
