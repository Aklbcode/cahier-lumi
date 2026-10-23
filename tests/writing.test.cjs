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
// Exercise actual drawing input and DOM updates, independently of the app's inline
// copy, so a tablet regression cannot hide behind geometry-only scoring tests.
class WritingNode{
 constructor(){this.attributes={};this.children=[];this.style={};this.listeners={};this.captured=new Set();this.rect={left:10,top:20,width:200,height:230};}
 setAttribute(k,v){this.attributes[k]=String(v);}
 append(node){node.parent=this;this.children.push(node);}
 remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}
 getBoundingClientRect(){return this.rect;}
 addEventListener(type,fn,options){(this.listeners[type]||(this.listeners[type]=[])).push({fn,options});}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){this.captured.delete(id);}
 emit(type,values={}){const event={pointerId:7,pointerType:'touch',isPrimary:true,button:0,cancelable:true,clientX:40,clientY:140,preventDefault(){this.prevented=true;},...values};for(const {fn}of this.listeners[type]||[])fn(event);return event;}
 set innerHTML(value){this.htmlWrites=(this.htmlWrites||0)+1;this.html=value;this.svg=new WritingNode();this.guide=new WritingNode();this.starts=new WritingNode();this.ink=new WritingNode();}
 querySelector(sel){return sel==='svg'?this.svg:sel==='[data-writing-guide]'?this.guide:sel==='[data-writing-starts]'?this.starts:sel==='[data-writing-ink]'?this.ink:null;}
}
const drawingContext=vm.createContext({window:{PointerEvent:function(){}},document:{createElementNS:()=>new WritingNode()},clamp:(n,min,max)=>Math.min(max,Math.max(min,n))});
const writingFragment=fs.readFileSync(path.join(root,'learning-writing-fragment.js'),'utf8');
vm.runInContext(writingFragment.slice(0,writingFragment.indexOf('const WRITING_VOICE_LINES=')),drawingContext);
const at=(x,y)=>({clientX:10+2*x,clientY:20+2*y});
function surfaceForInput(pointerEvents=true){
 drawingContext.window.PointerEvent=pointerEvents?function(){}:undefined;
 const board=new WritingNode(),strokes=[];let active=null,finished=0;
 const paint=vm.runInContext('writingBoardView',drawingContext)(board,vm.runInContext('WRITING_MODELS.horizontal',drawingContext));
 const input=vm.runInContext('writingBoardInput',drawingContext)(board,{canDraw:()=>true,begin:p=>{active=[p];strokes.push(active);paint({ink:strokes});},extend:p=>{if(active){active.push(p);paint({ink:strokes});}},finish:()=>{active=null;finished++;}});
 return {board,strokes,input,paint,get finished(){return finished;}};
}
const finger=surfaceForInput(),svgBefore=finger.board.svg;
assert.ok(finger.board.emit('pointerdown',at(15,60)).prevented,'A touch starts drawing instead of scrolling');
const pathBefore=finger.board.ink.children[0];
finger.board.emit('pointerdown',{pointerId:9,isPrimary:false,...at(80,15)});
finger.board.emit('pointermove',{pointerId:9,...at(90,20)});
finger.board.emit('pointerup',{pointerId:9,...at(90,20)});
finger.board.emit('pointermove',{...at(65,60),getCoalescedEvents:()=>[at(35,60),at(50,60)]});
finger.board.emit('lostpointercapture',{pointerId:9});
finger.board.emit('pointerup',at(85,60));
assert.equal(finger.strokes.length,1,'A second finger does not create or finish another line');
assert.equal(finger.strokes[0].length,5,'A touch gliding across the board records intermediate and final points');
assert.ok(vm.runInContext('writingTraceMetrics',drawingContext)(vm.runInContext('WRITING_MODELS.horizontal',drawingContext),finger.strokes,true).ok,'A real touch stream can complete the first path');
assert.equal(finger.board.htmlWrites,1,'Drawing never replaces innerHTML during a gesture');
assert.equal(finger.board.svg,svgBefore,'The SVG stays in the document');
assert.equal(finger.board.ink.children[0],pathBefore,'The active line stays in the document');
assert.equal(finger.board.style.touchAction,'none','Browser touch gestures are disabled on the drawing board');
assert.equal(finger.finished,1,'The primary pointer ends exactly once');
assert.equal(finger.board.captured.size,0,'Pointer capture is released after drawing');
assert.ok(finger.board.listeners.pointermove[0].options.passive===false,'Touch movement can be cancelled');
finger.paint({guide:false,ink:finger.strokes,numbers:true});
assert.equal(finger.board.guide.attributes.display,'none','Copy and recall never leak the green starting points');
finger.board.emit('pointerdown',{pointerId:8,pointerType:'pen',...at(15,60)});
finger.board.emit('pointercancel',{pointerId:8});
finger.board.emit('pointerdown',{pointerId:10,pointerType:'mouse',...at(20,60)});
finger.board.emit('pointerup',{pointerId:10,pointerType:'mouse',...at(40,60)});
assert.equal(finger.strokes.length,3,'Drawing restarts after an interrupted stylus stroke');
assert.equal(finger.strokes[2].length,2,'A mouse stroke does not join the cancelled stylus stroke');
finger.board.emit('pointerdown',{pointerId:11,button:2,...at(20,60)});
assert.equal(finger.strokes.length,3,'Secondary mouse buttons do not draw');
finger.input.reset();
const legacy=surfaceForInput(false),touch=(id,x,y)=>({identifier:id,...at(x,y)});
legacy.board.emit('touchstart',{changedTouches:[touch(3,15,60)]});
legacy.board.emit('touchstart',{changedTouches:[touch(4,90,20)]});
legacy.board.emit('touchmove',{changedTouches:[touch(4,20,20),touch(3,45,60)]});
legacy.board.emit('touchend',{changedTouches:[touch(4,20,20)]});
legacy.board.emit('touchmove',{changedTouches:[touch(3,65,60)]});
legacy.board.emit('touchend',{changedTouches:[touch(3,85,60)]});
assert.equal(legacy.strokes.length,1,'The Safari fallback keeps one tracked finger');
assert.equal(legacy.strokes[0].length,4,'Safari without Pointer Events can draw a continuous line');
assert.equal(legacy.board.htmlWrites,1,'The Safari touch target is never replaced');
assert.equal(legacy.finished,1,'Only the tracked finger can end the Safari fallback stroke');
legacy.board.emit('touchstart',{changedTouches:[touch(5,15,60)]});
legacy.board.emit('touchcancel',{changedTouches:[touch(5,15,60)]});
assert.equal(legacy.finished,2,'An interrupted legacy touch is released');
const fit=new WritingNode();fit.innerHTML='';fit.svg.rect={left:0,top:0,width:400,height:230};
const fitted=vm.runInContext('writingBoardPoint',drawingContext)(fit,{clientX:130,clientY:120});
assert.ok(Math.abs(fitted[0]-15)<.00001&&Math.abs(fitted[1]-60)<.00001,'Coordinate fallback respects SVG letterboxing');
fit.svg.rect.width=0;assert.equal(vm.runInContext('writingBoardPoint',drawingContext)(fit,{clientX:0,clientY:0}),null,'Hidden boards never produce invalid coordinates');
console.log('Écriture : géométries, trois modes, prégraphisme, tracé tactile/stylet/souris continu, cible SVG stable, annulations et anciens Safari vérifiés.');
