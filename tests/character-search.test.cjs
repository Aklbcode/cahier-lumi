const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),fragment=fs.readFileSync(path.join(root,'character-search-fragment.js'),'utf8'),{ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:fn=>{fn();return 0;},clearTimeout(){}});
if(!source.includes('const CHARACTER_SEARCH_SCENES='))vm.runInContext(fragment,ctx);
async function main(){
 await vm.runInContext(`(async()=>{
 const searchCheck=(ok,message)=>{if(!ok)throw Error(message);};save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';RUN=null;
 const createSearchElement=document.createElement;document.createElement=function(tag){const el=createSearchElement(tag);el.getBoundingClientRect=()=>({left:0,top:0,width:600,height:400});el.captured=new Set();el.setPointerCapture=id=>el.captured.add(id);el.hasPointerCapture=id=>el.captured.has(id);el.releasePointerCapture=id=>el.captured.delete(id);return el;};
 const searchApi=()=>({steps:[],finishes:[],helps:0,active:true,alive(){return this.active;},step(ok,options={}){this.steps.push({ok,options});},finish(first,details={}){this.finishes.push({first,details});},help(){this.helps++;}}),flushSearch=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
 const triggerSearch=(node,type,values={})=>{const event={pointerId:7,isPrimary:true,button:0,clientX:100,clientY:100,cancelable:true,preventDefault(){this.prevented=true;},...values};for(const fn of node.listeners[type]||[])fn(event);return event;};
 searchCheck(GAMES.cherche.advanceOnCompletion===true&&GAMES.cherche.levels.length===10,'Completed searches explicitly open the following stage');
 for(const world of ['petits','grands'])searchCheck(themesOf(world).some(t=>t.id==='jouer'&&t.ids.includes('cherche'))&&WORLD_TILES[world].includes('cherche'),'Search is reachable in both profiles');
 let previous=null;
 for(let li=0;li<GAMES.cherche.levels.length;li++){
  const L=GAMES.cherche.levels[li];searchCheck(L.n===1&&L.targets>=2&&L.targets<=5,'One complete scene per stage, two to five models');if(previous)searchCheck(L.targets>=previous.targets&&L.distractors>=previous.distractors&&L.size<=previous.size,'Target count, density and scale progress monotonically');previous=L;
  for(let seed=0;seed<80;seed++){
   const make=()=>GAMES.cherche.make({L,li,i:0,used:[],bag:{}}),item=withSeed(80000+li*100+seed,make),repeat=withSeed(80000+li*100+seed,make),model=item.searchModel;
   searchCheck(JSON.stringify(model)===JSON.stringify(repeat.searchModel),'A resumed deterministic seed keeps the exact same objects and positions');
   searchCheck(model.width===1200&&model.height===800&&model.targets.length===L.targets&&model.objects.length===L.targets+L.distractors,'Scene coordinate system and item counts match the stage');
   const targetIds=new Set(model.targets.map(t=>t.id));searchCheck(targetIds.size===L.targets&&model.objects.filter(o=>o.target).length===L.targets,'No duplicate target identity');
   for(const o of model.objects){searchCheck(o.src.startsWith('assets/')&&o.name&&o.x-o.hit/2>=0&&o.x+o.hit/2<=1200&&o.y-o.hit/2>=0&&o.y+o.hit/2<=800,'A real picture has an entirely reachable in-bounds hit area');searchCheck(o.target===targetIds.has(o.id),'A distractor is never an identical copy of a requested model');searchCheck(o.hit/1200*360*2>=44,'At a small portrait viewport, zoom2 gives at least a 44px target');}
   for(let a=0;a<model.objects.length;a++)for(let b=a+1;b<model.objects.length;b++)searchCheck(!characterSearchOverlap(model.objects[a],model.objects[b]),'No target is covered or blocked by another interactive figure');
   for(const id of targetIds)searchCheck(model.objects.filter(o=>o.id===id).length===1,'Every requested model has exactly one answer in the scenery');
   searchCheck(!item.evidenceKey.startsWith('reading:')&&!item.evidenceKey.startsWith('gp:'),'Visual matching does not validate reading or phonics');
  }
  for(let variant=0;variant<3;variant++){
   const item=withSeed(190000+li*10+variant,()=>GAMES.cherche.make({L,li,i:0,used:[],bag:{}})),model=item.searchModel,st=document.createElement('div'),api=searchApi();item.render(st,api);
   const viewport=st.querySelector('.search-viewport'),world=st.querySelector('.search-world'),buttons=st.querySelectorAll('.search-object'),targets=st.querySelectorAll('.search-target'),tool=label=>st.querySelectorAll('button').find(b=>b.getAttribute('aria-label')===label);
   searchCheck(parseFloat(viewport.style.height)>0&&Math.abs(parseFloat(viewport.style.width)/parseFloat(viewport.style.height)-1.5)<.001&&parseFloat(viewport.style.height)+196<=400.01,'The entire scenery and reserved controls fit the actual stage height');
   searchCheck(buttons.length===model.objects.length&&targets.length===model.targets.length&&buttons.every(b=>b.querySelector('.search-character')),'Real target pictures and real landscape answer buttons are rendered');
   searchCheck(world.querySelector('.search-background').getAttribute('src')===model.scene,'The background shares the same world element as targets');
   const positions=JSON.stringify(buttons.map(b=>[b.style.left,b.style.top,b.style.width,b.style.height]));
   tool('Agrandir l’image').click();tool('Agrandir l’image').click();searchCheck(viewport.getAttribute('data-zoom')==='2','Zoom buttons operate without dragging');
   for(let i=0;i<30;i++){tool('Déplacer l’image à gauche').click();tool('Déplacer l’image vers le haut').click();}
   searchCheck(Number(viewport.getAttribute('data-pan-x'))>=-600&&Number(viewport.getAttribute('data-pan-y'))>=-400,'Pan buttons clamp at the real scene edges');
   triggerSearch(viewport,'pointerdown');const movement=triggerSearch(viewport,'pointermove',{clientX:180,clientY:150});triggerSearch(viewport,'pointerup',{clientX:180,clientY:150});searchCheck(movement.prevented&&viewport.captured.size===0,'A touch/stylus/mouse pan prevents scrolling and releases capture');
   const first=model.objects.find(o=>o.target),firstButton=buttons.find(b=>b.getAttribute('data-search-object')===first.key);firstButton.click();await flushSearch();searchCheck(api.steps.length===0,'Dragging cannot accidentally select a target');
   /* Remove only the synthetic post-drag click delay before testing answers. */
   const savedNow=Date.now;Date.now=()=>savedNow()+1000;
   try{
    tool('Voir toute l’image').click();searchCheck(viewport.getAttribute('data-zoom')==='1'&&viewport.getAttribute('data-pan-x')==='0'&&viewport.getAttribute('data-pan-y')==='0','Reset always restores the complete scenery');
    searchCheck(JSON.stringify(buttons.map(b=>[b.style.left,b.style.top,b.style.width,b.style.height]))===positions,'Pan and zoom never change object coordinates');
    if(variant===1){const distractor=model.objects.find(o=>!o.target);buttons.find(b=>b.getAttribute('data-search-object')===distractor.key).click();await flushSearch();searchCheck(api.steps.length===1&&api.steps[0].ok===false&&api.finishes.length===0,'A distractor is an error rather than a found target');}
    if(variant===2){tool('Montrer une zone pour m’aider').click();searchCheck(api.helps===1&&!world.querySelector('.search-help-region').hidden,'An explicit zone hint is counted as help');}
    for(const object of model.objects.filter(o=>o.target)){const b=buttons.find(b=>b.getAttribute('data-search-object')===object.key);b.click();await flushSearch();searchCheck(b.disabled&&b.classList.contains('found'),'A found target stays checked and cannot score twice');}
    searchCheck(targets.every(t=>t.classList.contains('found')&&t.querySelector('.search-target-check').textContent==='✓'),'All target models are visibly marked found');
    searchCheck(api.finishes.length===1&&api.finishes[0].details.completed===true,'A complete scene reports completion exactly once');searchCheck(api.finishes[0].first===(variant===0)&&api.finishes[0].details.wrongs===(variant===1?1:0),'Errors and assistance preserve honest first-try and error results');
   }finally{Date.now=savedNow;}
  }
 }
 const expert=GAMES.cherche.levels.at(-1);searchCheck(expert.size*900/1200>=35&&expert.size*900/1200<=45,'Expert models have the intended small visual scale at a wide tablet viewport');
 const view={zoom:1,x:0,y:0},zoomed=characterSearchZoom(view,2,600,400);searchCheck(zoomed.x===-300&&zoomed.y===-200&&view.zoom===1,'Centered zoom keeps the world point under the viewport center and is non-mutating');
 const clipped=characterSearchBounds({zoom:4,x:500,y:-9999},600,400);searchCheck(clipped.x===0&&clipped.y===-1200,'All pan coordinates remain within real scene bounds');
 const broken=withSeed(7,()=>GAMES.cherche.make({L:GAMES.cherche.levels[0],li:0,i:0,used:[],bag:{}})),brokenStage=document.createElement('div'),brokenApi=searchApi();broken.render(brokenStage,brokenApi);const brokenBackground=brokenStage.querySelector('.search-background');for(const fn of brokenBackground.listeners.error||[])fn();for(const b of brokenStage.querySelectorAll('.search-object'))b.click();await flushSearch();searchCheck(brokenApi.finishes.length===0&&brokenApi.steps.length===0&&brokenStage.querySelector('.search-status').textContent===CHARACTER_SEARCH_VOICE[5],'Missing media cannot silently turn into a scored easier or invisible exercise');
 searchCheck(characterSearchVoiceLines().length===6&&characterSearchVoiceLines().every(t=>typeof t==='string'),'Every new instruction and feedback is enumerable for Charline');
 })()`,ctx,{timeout:30000});
 assert.match(fragment,/pointer-events:none/,'Scenery, image content and hint overlays do not intercept target taps');
 assert.ok(!fragment.includes('setInterval')&&!fragment.includes('timerMin'),'No time race is introduced');
 const pictures=JSON.parse(vm.runInContext('JSON.stringify(characterSearchPool())',ctx));for(const p of pictures)assert.ok(fs.statSync(path.join(root,p.src)).size>100,'Search character media is bundled: '+p.src);
 const backgrounds=JSON.parse(vm.runInContext('JSON.stringify(CHARACTER_SEARCH_SCENES)',ctx));for(const file of backgrounds)assert.ok(fs.statSync(path.join(root,file)).size>10000,'Search landscape is bundled: '+file);
 console.log('Chercher : 800 scènes déterministes, cibles accessibles sans chevauchement, 30 parties réelles, zoom/pan, indices et résultats vérifiés.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
