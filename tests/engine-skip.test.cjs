const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
class TestElement{
 constructor(tag='div'){this.nodeType=tag==='#text'?3:1;this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.style={setProperty(){}};this.dataset={};this._text='';this.className='';this.classList={add:(...xs)=>{this.className=[...new Set([...this.className.split(' '),...xs])].join(' ')},remove:(...xs)=>{this.className=this.className.split(' ').filter(x=>!xs.includes(x)).join(' ')},toggle(){}};}
 append(...items){for(const x of items.flat(Infinity)){if(x==null||x===false)continue;const child=typeof x==='string'?Object.assign(new TestElement('#text'),{_text:x}):x;this.children.push(child);child.parentNode=this;}}
 prepend(...items){const old=this.children;this.children=[];this.append(...items,...old);}
 insertBefore(child,before){const i=this.children.indexOf(before);if(i<0)this.append(child);else{this.children.splice(i,0,child);child.parentNode=this;}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);}
 setAttribute(k,v){this.attrs[k]=String(v);if(k==='class')this.className=v;if(k==='disabled')this.disabled=true;}
 getAttribute(k){return this.attrs[k];}
 addEventListener(n,f){(this.events||(this.events={}))[n]=f;}
 querySelectorAll(selector){const matches=(n,s)=>s.startsWith('.')?n.className.split(' ').includes(s.slice(1)):s.startsWith('#')?n.attrs.id===s.slice(1):n.tagName===s.toUpperCase();const out=[];const walk=n=>{for(const c of n.children){if(selector.split(',').some(s=>matches(c,s.trim())))out.push(c);walk(c)}};walk(this);return out;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 set textContent(t){this._text=String(t);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 set innerHTML(t){this._text='';this.children=[];}
 get innerHTML(){return '';}
}
const document={createElement:t=>new TestElement(t),createTextNode:t=>Object.assign(new TestElement('#text'),{_text:t}),body:new TestElement('body'),head:new TestElement('head'),addEventListener(){},querySelectorAll(s){return this.body.querySelectorAll(s)},querySelector(s){return this.body.querySelector(s)}};
const errors=[],ctx=vm.createContext({console:{...console,error:(...e)=>errors.push(e)},Blob,URL,AbortController,setTimeout,clearTimeout,requestAnimationFrame:f=>f(),window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document,LumiSpeech:require('../speech-engine.js')});
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
assert.ok(source.includes('function skippedNote(n)'), 'Run integrate_learning.py before the real-engine skip test');vm.runInContext(source,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
const check=(b,msg)=>{if(!b)throw Error(msg)},tick=async()=>{await Promise.resolve();await Promise.resolve();};
save=()=>{};S=defState();S.current='luca';Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Shell.build();
const button=Shell.el.querySelector('.skip-exercise');check(button&&button===Shell.skipBtn,'Every game shell exposes the skip button');
let api=null;const item={skill:'probe',render(st,a){api=a;}};
let run={gid:'probe',abort:false,res:[]};RUN=run;Shell.open({level:'Test'});let pending=Engine.play(item,run);check(typeof Shell.skipCurrent==='function'&&!button.disabled&&!button.hidden,'Skip available on a normal exercise');button.events.click({preventDefault(){}});let r=await pending;check(r.first===null&&r.skipped&&!r.exam,'Normal skip has no success result');check(!P().evidence?.['gp:probe']&&!P().skills.probe,'Normal skip creates no learning evidence');check(P().skips.probe===1,'A skip is counted once separately');api.skip();check(P().skips.probe===1,'Rapid double skip is ignored');
run={gid:'probe',exam:true,abort:false,res:[]};RUN=run;Shell.open({level:'Test'});pending=Engine.play(item,run);Shell.skipCurrent();r=await pending;check(r.skipped&&r.exam&&r.first===null,'Exam skip remains unanswered, not false or correct');check(P().skipEvents.at(-1).exam===true&&!P().evidence?.['gp:probe'],'Exam skip preserves its distinct audit status');
const session=resumeSession('game',{gid:'sudoku',li:0});session.partialWrongs=2;session.partialHelped=true;run={gid:'sudoku',levelIndex:0,session,res:[],abort:false};RUN=run;Shell.open({level:'Sudoku'});pending=Engine.play(item,run);Shell.skipCurrent();r=await pending;run.res.push(r);checkpoint(run,1);check(r.skipped&&r.wrongs===2&&r.helped&&P().resume.res[0].skipped,'Interrupted exercise restores prior attempts and persists its skipped result');check(scoreOf(P().resume.res).errors===0&&scoreOf(P().resume.res).stars===0,'A skipped resumed exercise does not become an assessed error or free reward');
run={gid:'broken',abort:false,res:[]};RUN=run;Shell.open({level:'Test'});let resolved=false;pending=Engine.play({render(){throw Error('Expected broken renderer fixture');}},run);pending.then(()=>resolved=true);await tick();check(!resolved,'Renderer failure never auto-completes as success');check(typeof Shell.skipCurrent==='function'&&!button.disabled,'Renderer failure leaves the shell skip available');check(Shell.stage.textContent.includes('Cet exercice ne se charge pas.'),'Renderer failure gives a clear local fallback');const local=Shell.stage.querySelector('button');check(local,'Renderer fallback offers its own skip action');local.events.click({preventDefault(){}});r=await pending;check(r.skipped&&r.first===null&&!P().evidence?.['game:broken'],'Passing a broken renderer creates no success');
for(const exam of [false,true]){
 let release;Voice.say=()=>new Promise(resolve=>{release=resolve;});run={gid:'feedback-'+exam,exam,abort:false,res:[]};RUN=run;Shell.open({level:'Test'});pending=Engine.play(item,run);const answering=api.answer(true);await tick();check(!button.disabled&&typeof Shell.skipCurrent==='function','Skip stays available while feedback voice is pending');button.events.click({preventDefault(){}});r=await pending;check(r.skipped&&r.first===null,'Pending voice can be bypassed without reporting success');release();await answering;await tick();check(!P().evidence?.['gp:probe'],'Late voice completion cannot overwrite the passed result');
}
for(const exam of [false,true]){
 let release,oldApi,newApi,newButton;Voice.say=()=>new Promise(resolve=>{release=resolve;});const oldRun={gid:'previous-'+exam,exam,abort:false,res:[]};RUN=oldRun;Shell.open({level:'Ancien niveau'});Engine.play({skill:'previous-level',render(st,a){oldApi=a;st.append(h('button',null,'Ancienne réponse'));}},oldRun);const oldAnswer=oldApi.answer(true);await tick();
 oldRun.abort=true;Voice.stop();const newRun={gid:'next-'+exam,abort:false,res:[]},newItem={skill:'next-level',render(st,a){newApi=a;newButton=h('button',null,'Nouvelle réponse');st.append(newButton);}};RUN=newRun;Shell.open({level:'Nouveau niveau'});const newPending=Engine.play(newItem,newRun);release();await oldAnswer;await tick();
 check(RUN===newRun&&Shell.item===newItem&&newApi.alive(),'Late feedback from a previous level cannot clear the active item');check(newButton.style.pointerEvents!=='none'&&!button.disabled&&typeof Shell.skipCurrent==='function','Changing levels during feedback leaves new choices and skip enabled');check(!P().evidence?.['gp:previous-level'],'Aborted previous level never records a late success');Shell.skipCurrent();await newPending;
}
Voice.say=()=>Promise.resolve();run={gid:'finished',abort:false,res:[]};RUN=run;Shell.open({level:'Test'});pending=Engine.play(item,run);api.finish(null);r=await pending;const count=P().skips.finished||0;api.skip();check((P().skips.finished||0)===count&&!r.skipped,'Already settled finish cannot be converted to a skip');
run={gid:'sudoku',levelIndex:0,session:{kind:'game',li:0},res:[{first:null,skipped:true}]};RUN=run;Shell.open({level:'Sudoku'});Celebrate.show({note:'Un exercice a été passé.',home:()=>{}});check(Shell.el.querySelector('.celebrate').querySelector('h2').textContent.includes('Série terminée')&&Shell.el.querySelector('.celebrate').querySelector('h2').textContent.includes('passé'),'Skipped series completion never claims the level is completed');check(button.hidden,'Skip is hidden on the completion screen');Shell.open({level:'Test'});check(!button.hidden,'Skip returns when a new activity opens');
})()`,ctx,{timeout:10000});
 assert.equal(errors.length,1,'Only the intentional broken-renderer fixture should log an error');
 console.log('Moteur réel : passer en jeu/défi/reprise, rendu en erreur, voix bloquée, résultat unique et bouton permanent vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
