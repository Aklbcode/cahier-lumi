/* Runtime compatibility regression: exercise the real classic source in a VM
   whose modern collection helpers have been removed. The fixture does not
   claim to emulate an obsolete JavaScript parser or a physical tablet. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{Element}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
const compat=fs.readFileSync(path.join(root,'assets/compat/core-js.js'),'utf8'),startup=fs.readFileSync(path.join(root,'classic-startup.js'),'utf8');
class CompatElement extends Element{removeChild(child){child.remove();return child;}get firstChild(){return this.childNodes[0]||null;}getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}}
function fixture(){
 const create=t=>new CompatElement(t),listeners={},timers=[],memory=new Map(),writes=[],removals=[];
 const document={createElement:create,createTextNode:t=>new CompatElement('#text',t),head:create('head'),body:create('body'),documentElement:create('html'),addEventListener(){},querySelectorAll(s){return this.body.querySelectorAll(s);},querySelector(s){return this.body.querySelector(s);},getElementById(id){return this.body.querySelector('#'+id);}};
 const panel=create('div');panel.setAttribute('id','lumi-startup');for(const [id,text]of [['lumi-startup-title','Le Cahier de Lumi'],['lumi-startup-message','Lumi prépare tes jeux…'],['lumi-startup-retry','Réessayer']]){const el=create(id.endsWith('retry')?'button':'p');el.setAttribute('id',id);el.textContent=text;panel.append(el);}document.body.append(panel);
 let reloads=0;const location={protocol:'https:',href:'https://example.invalid/cahier-lumi/',reload(){reloads++;}};
 const timer=(fn,ms)=>{timers.push({fn,ms});return timers.length;},window={CSS:{supports:()=>true},addEventListener(type,fn){(listeners[type]||(listeners[type]=[])).push(fn);},setTimeout:timer,location};
 const localStorage={getItem:k=>memory.get(k)||null,setItem(k,v){memory.set(k,String(v));writes.push(k);},removeItem(k){removals.push(k);memory.delete(k);},clear(){removals.push('*');memory.clear();}};
 const ctx=vm.createContext({console,Blob,URL,AbortController,window,document,navigator:{userAgent:'Mozilla/5.0 (Linux; Android 8.1) AppleWebKit/537.36 Chrome/88.0 Safari/537.36'},location,localStorage,setTimeout:timer,clearTimeout(){},setInterval:timer,clearInterval(){},requestAnimationFrame:f=>f(),CSS:window.CSS,LumiSpeech:require('../speech-engine.js')});
 return {ctx,document,memory,writes,removals,listeners,timers,panel,get reloads(){return reloads;}};
}
/* Exact regression: the new cursive models used Array.at at top-level, before
   boot could create any visible application UI. */
const unprotected=fixture();vm.runInContext('delete Array.prototype.at;',unprotected.ctx);
assert.throws(()=>vm.runInContext(inline,unprotected.ctx,{timeout:10000}),/at is not a function/,'Without the compatibility bundle an absent Array.at reproduces the startup failure');
assert.equal(unprotected.document.querySelector('#app'),null,'The failed initialization never reaches app creation');
assert.ok(vm.runInContext("typeof SCHOOL_WRITING_MODELS==='object' && SCHOOL_WRITING_MODELS.e.exit===undefined",unprotected.ctx),'Failure happens while initializing the cursive model joining points');
const f=fixture();vm.runInContext('delete Array.prototype.at;delete Array.prototype.flat;delete Array.prototype.flatMap;delete Object.fromEntries;',f.ctx);
assert.equal(vm.runInContext('[Array.prototype.at,Array.prototype.flat,Array.prototype.flatMap,Object.fromEntries].every(x=>x===undefined)',f.ctx),true,'The simulated missing helpers are absent');
vm.runInContext(startup,f.ctx,{timeout:1000});vm.runInContext(compat,f.ctx,{timeout:10000});
assert.equal(vm.runInContext('[Array.prototype.at,Array.prototype.flat,Array.prototype.flatMap,Object.fromEntries].every(x=>typeof x==="function")',f.ctx),true,'The locally bundled compatibility layer restores all required helpers');
vm.runInContext(inline,f.ctx,{timeout:10000});
vm.runInContext(`
const compatCheck=(condition,message)=>{if(!condition)throw Error(message);};
compatCheck(Object.keys(SCHOOL_WRITING_MODELS).length===12&&SCHOOL_WRITING_MODELS.e.exit.every(Number.isFinite),'Cursive model initialization completes');
const saved=defState();saved.current='lola';saved.world='petits';saved.progress.lola={skills:{compatSentinel:{ok:2,n:4}},cards:[{name:'Carte conservée'}],compatSentinel:'progression à garder',gameRevision20261022:true};saved.progress.luca={skills:{compatSibling:{ok:7,n:8}},compatSentinel:'frère à garder',gameRevision20261022:true};
localStorage.setItem(LS_KEY,JSON.stringify(saved));
/* Keep boot, loading/migration, Shell, Track, gifts and actual home rendering.
   Audio/radio/network are unrelated to this runtime test and remain silent. */
Voice.init=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();VoicePack.init=()=>Promise.resolve();VoicePack.prefetch=()=>{};Sfx.play=()=>{};
boot();
compatCheck(S.current==='lola'&&S.world==='petits','Actual boot restores the saved child');
compatCheck(P().skills.compatSentinel.ok===2&&P().skills.compatSentinel.n===4&&P().cards[0].name==='Carte conservée'&&P().compatSentinel==='progression à garder','Actual boot preserves exercises and creations');
compatCheck(S.progress.luca.skills.compatSibling.ok===7&&S.progress.luca.compatSentinel==='frère à garder','Boot preserves the other child');
compatCheck(document.querySelector('#app')&&document.querySelectorAll('.theme-card').length===5,'The real home renders all five themes');
compatCheck(document.querySelector('.who-screen')&&document.querySelector('#pick-luca')&&document.querySelector('#pick-lola'),'Real child chooser renders rather than a blank page');
compatCheck(Shell.el&&Shell.stage,'Real game shell is initialized');
document.querySelector('[data-theme="lire"]').click();
compatCheck(document.querySelectorAll('.simple-game').length>=3&&document.querySelector('.theme-heading'),'A real theme button opens the activity page');
compatCheck(document.querySelectorAll('.simple-game').some(b=>b.getAttribute('data-gid')==='alphabetP'),'Lola letter activity remains reachable');
`,f.ctx,{timeout:10000});
assert.equal(f.document.getElementById('lumi-startup'),null,'Successful real boot removes the startup panel');
assert.deepEqual(f.removals,[],'Neither compatibility nor startup deletes local progress');
/* Recovery must be visible even if initialization fails, and retry must only
   reload: never clear storage to conceal the underlying problem. */
const recovery=fixture();recovery.memory.set('cahier-lumi-v1','saved-progress-sentinel');vm.runInContext(startup,recovery.ctx,{timeout:1000});
for(const fn of recovery.listeners.error||[])fn(new Error('Synthetic app initialization failure'));
assert.match(recovery.document.getElementById('lumi-startup-title').textContent,/pas pu/);
assert.match(recovery.document.getElementById('lumi-startup-message').textContent,/conservés/);
recovery.document.getElementById('lumi-startup-retry').click();assert.equal(recovery.reloads,1,'Retry reloads the page');
assert.equal(recovery.memory.get('cahier-lumi-v1'),'saved-progress-sentinel');assert.deepEqual(recovery.removals,[]);
const scriptOrder=[...html.matchAll(/<script(?:\s+[^>]*src="([^"]+)"[^>]*)?>/g)].map(m=>m[1]||'inline');
assert.ok(scriptOrder.findIndex(s=>s.startsWith('classic-startup.js'))<scriptOrder.findIndex(s=>s.startsWith('assets/compat/core-js.js')),'A visible startup guard loads before compatibility');
assert.ok(scriptOrder.findIndex(s=>s.startsWith('assets/compat/core-js.js'))<scriptOrder.findIndex(s=>s.startsWith('speech-engine.js'))&&scriptOrder.findIndex(s=>s.startsWith('assets/compat/core-js.js'))<scriptOrder.lastIndexOf('inline'),'Compatibility loads before speech and game source');
console.log('Classique : panne Array.at reproduite, anciens helpers restaurés, vrai démarrage/accueil/navigation et sauvegardes conservées vérifiés.');
