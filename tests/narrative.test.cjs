const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
class NarrativeElement{
 constructor(tag='div',text=''){this.tagName=tag.toUpperCase();this.nodeType=tag==='#text'?3:1;this.childNodes=[];this.attributes={};this.listeners={};this.style={setProperty(){}};this.dataset={};this.disabled=false;this._text=text;this._html='';this.className='';this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' ');},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ');},toggle:(c,force)=>{const add=force===undefined?!this.classList.contains(c):force;this.classList[add?'add':'remove'](c);return add;}};}
 append(...xs){for(const x of xs){if(x==null)continue;const n=typeof x==='string'?new NarrativeElement('#text',x):x;n.parentNode=this;this.childNodes.push(n);}}
 get children(){return this.childNodes.filter(n=>n.nodeType===1);}get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');}set textContent(t){this._text=String(t);this._html='';this.childNodes=[];}get innerHTML(){return this._html;}set innerHTML(s){this._html=String(s);this._text='';this.childNodes=[];}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);}getAttribute(k){return this.attributes[k]??null;}addEventListener(k,fn){(this.listeners[k]||(this.listeners[k]=[])).push(fn);}async click(){if(!this.disabled)await Promise.all((this.listeners.click||[]).map(fn=>fn({preventDefault(){},target:this})));}
 matches(s){return s.startsWith('.')?this.classList.contains(s.slice(1)):this.tagName.toLowerCase()===s.toLowerCase();}querySelectorAll(selector){const selectors=selector.split(',').map(s=>s.trim()),out=[];const walk=n=>{for(const c of n.children){if(selectors.some(s=>c.matches(s)))out.push(c);walk(c);}};walk(this);return out;}querySelector(s){return this.querySelectorAll(s)[0]||null;}
}
async function main(){
 const element=tag=>new NarrativeElement(tag),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
 if(!source.includes('const NARRATIVE_LEVELS'))source+='\n'+fs.readFileSync(path.join(root,'narrative-redesign-fragment.js'),'utf8');
 const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:element,createTextNode:t=>new NarrativeElement('#text',t),head:element('head'),body:element('body'),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
 vm.runInContext(source,ctx,{timeout:10000});
 await vm.runInContext(`(async()=>{
  const checkN=(ok,msg)=>{if(!ok)throw Error(msg)};
  save=()=>{};Voice.say=()=>Promise.resolve();S=defState();S.current='luca';S.world='grands';Shell.capEl=document.createElement('div');
  const apiN=()=>({answers:[],steps:[],helped:false,done:false,alive(){return !this.done;},help(){this.helped=true;},step(ok){this.steps.push(ok);return ok;},answer(ok){this.answers.push(ok);if(ok)this.done=true;return ok;}});
  checkN(GAMES.recit.levels.length===5&&GAMES.recitP.levels.length===3,'Age-appropriate stage counts');
  checkN(GAMES.recit.make===narrativeItem&&GAMES.recitP.make===narrativeItem,'Both routes use redesigned interaction');
  for(const L of NARRATIVE_LEVELS){
   const c={L,used:[]};const seen=[];for(let i=0;i<3;i++){const m=narrativeModel(c);seen.push(m.story.id);checkN(m.indices.length===L.frames&&new Set(m.indices).size===L.frames,'Every frame is unique and reachable');checkN(m.indices[0]===0&&m.indices.at(-1)===3,'Narrative always retains beginning and ending');checkN(m.initial.length===(L.anchor?1:0),'Anchoring follows task scaffold');checkN(m.indices.slice(m.initial.length).every(i=>m.options.includes(i)),'Every answer appears among touch choices');checkN(m.options.every(i=>Number.isInteger(i)&&i>=0&&i<=3),'No invalid scene choice');}checkN(new Set(seen).size===3,'Three exercises use three different stories');
  }
  // The example is a different situation and must never finish an assessment.
  delete P().narrativeIntroV2;let stage=document.createElement('div'),api=apiN(),item=narrativeItem({L:NARRATIVE_LEVELS[0],used:[]});Shell.item=item;item.render(stage,api);
  checkN(stage.querySelector('.narrative-demo')&&api.answers.length===0&&api.steps.length===0,'Distinct tutorial is unscored');
  await stage.querySelectorAll('button').find(b=>b.textContent==='À moi de jouer').click();
  checkN(P().narrativeIntroV2&&stage.querySelectorAll('.sequence-card').length===2&&api.answers.length===0,'One touch begins real task without granting success');
  // Exercise the real handlers with and without an initial frame. The final
  // image completes the task; no second validation or Continue is required.
  P().narrativeIntroV2=1;
  for(const L of NARRATIVE_LEVELS){
   for(let trial=0;trial<18;trial++){
    stage=document.createElement('div');api=apiN();item=withSeed(18000+trial,()=>narrativeItem({L,used:[]}));const story=SEQUENCE_STORIES.find(s=>item.exemplar.startsWith(s.id+':'));const indices=L.frames===2?[0,3]:L.frames===3?[0,2,3]:[0,1,2,3];Shell.item=item;item.render(stage,api);
    const pending=indices.slice(L.anchor?1:0),wrong=stage.querySelectorAll('.sequence-card').find(b=>b.getAttribute('aria-label')!==story.events[pending[0]]);
    checkN(!!wrong,'A meaningful alternative is present');await wrong.click();checkN(api.steps[0]===false&&api.answers.length===0,'Wrong chronology remains retryable');
    for(const step of pending){const button=stage.querySelectorAll('.sequence-card').find(b=>b.getAttribute('aria-label')===story.events[step]);checkN(!!button&&!button.disabled,'Next scene is actionable');await button.click();}
    checkN(api.answers.length===1&&api.answers[0]===true,'Last correct touch completes exactly once');
    checkN(!stage.querySelectorAll('button').some(b=>/valider|continuer/i.test(b.textContent)),'No extra submit or continue button');
   }
  }
  // The full chronological replay reveals the solution. It is therefore an
  // explicit aid, even when the later physical placements are all correct.
  stage=document.createElement('div');api=apiN();item=narrativeItem({L:NARRATIVE_LEVELS[4],used:[]});Shell.item=item;item.render(stage,api);
  await stage.querySelectorAll('button').find(b=>b.textContent==='👀 Montre-moi').click();
  await new Promise(resolve=>setTimeout(resolve,0));
  checkN(api.helped&&api.answers.length===0,'Model replay marks help and never awards completion');
  checkN(stage.querySelectorAll('.sequence-card').every(b=>!b.disabled),'Choices are available again after narrated model');
  checkN(stage.querySelector('.reveal'),'After model, help shows the next position');
 })()`,ctx,{timeout:20000});
 assert.ok(!/speechSynthesis|new SpeechSynthesisUtterance/.test(fs.readFileSync(path.join(root,'narrative-redesign-fragment.js'),'utf8')),'No device voice fallback');
 console.log('Récits : tutoriel distinct, progression 2–4 images, 90 interactions, erreurs, aide et fin directe vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
