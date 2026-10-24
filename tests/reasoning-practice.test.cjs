const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),{ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
if(!source.includes('function reasoningPracticeVoiceLines()'))vm.runInContext(fs.readFileSync(path.join(root,'reasoning-practice-fragment.js'),'utf8'),ctx);
vm.runInContext(`
const rpCheck=(ok,msg)=>{if(!ok)throw Error(msg)};
save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';
const rpApi=()=>({results:[],steps:[],alive:()=>true,key(){},answer(ok,options={}){this.results.push({ok,options});return ok;},step(ok,options={}){this.steps.push({ok,options});return ok;}});
const rpContext=(L,li=0)=>({L,li,i:0,used:[],bag:{}});
for(const [level,L] of GAMES.tangram.levels.entries()){
 const seed=500+level,problem=withSeed(seed,()=>tangramProblem(rpContext(L))),polys=problem.pieces;
 rpCheck(polys.length===L.pieces,'Tangram has the requested number of real pieces');
 rpCheck(Math.abs(polys.reduce((s,p)=>s+reasoningArea(p),0)-16)<1e-9,'Pieces have the exact area of the target square');
 for(let i=0;i<800;i++){const point=[.001+(i*.61803398875%1)*3.998,.001+(i*.41421356237%1)*3.998],cover=polys.filter(p=>reasoningInside(point,p)).length;rpCheck(cover===1,'Every interior point is covered once, without overlap or a hole');}
 const item=withSeed(seed,()=>GAMES.tangram.make(rpContext(L))),st=document.createElement('div'),api=rpApi();item.render(st,api);
 const pieces=st.querySelectorAll('.tangram-piece'),targets=st.querySelectorAll('[data-target]');
 const turn=b=>Number(b.innerHTML.match(/rotate\\((\\d+)\\)/)[1])/90;
 pieces[0].click();let wrong=polys.findIndex(p=>tangramSignature(p)!==tangramSignature(polys[0],turn(pieces[0])));
 if(wrong>=0){targets[wrong].click();rpCheck(api.steps.at(-1).ok===false&&api.results.length===0,'A geometrically wrong placement is rejected without completing the square');}
 // Tapping a selected piece rotates it. Any congruent piece may fill a matching slot.
 for(let target=0;target<polys.length;target++){
  const available=pieces.findIndex((b,i)=>!b.disabled&&[0,1,2,3].some(t=>tangramSignature(polys[i],t)===tangramSignature(polys[target])));
  rpCheck(available>=0,'Every remaining target has an interchangeable matching piece');
  const b=pieces[available];if(!b.classList.contains('selected'))b.click();let turns=0;
  while(tangramSignature(polys[available],turn(b))!==tangramSignature(polys[target])&&turns++<4)b.click();
  rpCheck(turns<=4,'Rotation by quarter-turns always reaches the target orientation');targets[target].click();
 }
 rpCheck(api.results.length===1&&api.results[0].ok,'Two to seven pieces finish through actual selection, rotation and placement clicks');
 targets[0].click();rpCheck(api.results.length===1,'Already placed pieces cannot complete twice');
}
// The old-tablet touch path uses changedTouches, not PointerEvent or drag support.
{
 const L=GAMES.tangram.levels[0],seed=987,p=withSeed(seed,()=>tangramProblem(rpContext(L))),item=withSeed(seed,()=>GAMES.tangram.make(rpContext(L))),st=document.createElement('div'),api=rpApi();item.render(st,api);const b=st.querySelectorAll('.tangram-piece')[0],board=st.querySelector('.tangram-board');b.click();let t=Number(b.innerHTML.match(/rotate\\((\\d+)\\)/)[1])/90;
 while(tangramSignature(p.pieces[0],t)!==tangramSignature(p.pieces[0])){b.click();t=Number(b.innerHTML.match(/rotate\\((\\d+)\\)/)[1])/90;}
 board.getBoundingClientRect=()=>({left:10,top:20,width:400,height:400});const center=reasoningCenter(p.pieces[0]);let prevented=false;
 board.listeners.touchend[0]({changedTouches:[{clientX:10+center[0]*100,clientY:20+center[1]*100}],preventDefault(){prevented=true;}});
 rpCheck(prevented&&board.getAttribute('data-placed')==='1','Touch-only tablets place an oriented piece at the tapped board position');
 board.click();rpCheck(board.getAttribute('data-placed')==='1','The synthesized click following a touch does not count again');
}
for(const L of GAMES.tableau.levels)for(let seed=0;seed<5;seed++){
 const p=withSeed(seed+44,()=>reasoningTableProblem(L));rpCheck(p.objects.length===L.rows*L.cols&&new Set(p.objects.map(o=>o.id)).size===L.rows*L.cols,'Two-criterion cells have exactly one matching object each');
 const item=withSeed(seed+44,()=>GAMES.tableau.make(rpContext(L))),st=document.createElement('div'),api=rpApi();item.render(st,api);const objects=st.querySelectorAll('[data-object]'),cells=st.querySelectorAll('[data-cell]');objects[0].click();cells.find(c=>c.getAttribute('data-cell')!==objects[0].getAttribute('data-object')).click();rpCheck(api.steps.at(-1).ok===false&&api.results.length===0,'Sharing only colour or only shape never fills a two-criterion cell');
 for(const b of objects){b.click();cells.find(c=>c.getAttribute('data-cell')===b.getAttribute('data-object')).click();}
 rpCheck(api.results.length===1&&api.results[0].ok&&cells.every(c=>c.disabled),'2x2, 3x2 and 3x3 tables complete automatically after the last correct placement');
}
const familyNames=ANALOGY_FAMILIES.map(f=>[f.adult,f.young]);rpCheck(JSON.stringify(familyNames)===JSON.stringify([['le chat','le chaton'],['le chien','le chiot'],['la poule','le poussin'],['le canard','le caneton']]),'Adult/young names use the correct French words');
const babySilhouettes=ANALOGY_FAMILIES.map(f=>reasoningAnimalSVG(f,true).replace(/(?:aria-label|fill|stroke)="[^"]*"/g,''));
rpCheck(new Set(babySilhouettes).size===ANALOGY_FAMILIES.length,'Every baby has distinct visible geometry, even without names or colour: a duckling is not the same picture as a chick');
for(const L of GAMES.analogies.levels)for(let seed=0;seed<20;seed++){
 const p=withSeed(seed,()=>reasoningAnalogyProblem(rpContext(L)));rpCheck(p.source.id!==p.target.id&&p.options.filter(o=>o.family.id===p.target.id).length===1,'Every analogy asks for one uniquely correct animal family');
 rpCheck(p.options.length===L.options,'Only the number of comparison options changes across the analogy stages');
 const item=withSeed(seed,()=>GAMES.analogies.make(rpContext(L))),st=document.createElement('div'),api=rpApi();item.render(st,api);const choices=st.querySelectorAll('[data-answer]');choices.find(b=>b.getAttribute('data-answer')!==p.target.id).click();rpCheck(api.results.at(-1).ok===false,'An unrelated baby is rejected');choices.find(b=>b.getAttribute('data-answer')===p.target.id).click();rpCheck(api.results.at(-1).ok,'A matching animal baby is accepted in one action');
 rpCheck(st.querySelectorAll('.analogy-animal').every(n=>n.innerHTML.includes('<svg')),'Every adult and baby is a stable vector image, not a platform-dependent emoji');
 for(const family of ANALOGY_FAMILIES)rpCheck(reasoningAnimalSVG(family,false)!==reasoningAnimalSVG(family,true),'Adults and babies have different head/body drawings');
}
for(const L of GAMES.rangerG.levels){
 const p=reasoningSortProblem(rpContext(L));rpCheck(p.sizes.length===L.count&&new Set(p.sizes).size===L.count,'Five to nine physically distinct sizes');
 const item=GAMES.rangerG.make(rpContext(L)),st=document.createElement('div'),api=rpApi();item.render(st,api);const cards=st.querySelectorAll('[data-size]'),sorted=cards.slice().sort((a,b)=>Number(a.getAttribute('data-size'))-Number(b.getAttribute('data-size')));sorted.at(-1).click();rpCheck(api.steps.at(-1).ok===false,'Descending first choice is rejected');sorted.forEach(b=>b.click());rpCheck(api.results.length===1&&api.results[0].ok,'The full five-to-nine object order finishes automatically');rpCheck(new Set(cards.map(b=>b.querySelector('img').getAttribute('src'))).size===1,'Identity and image stay constant: size alone determines the order');
 const result=st.querySelector('.reasoning-order-result').querySelectorAll('.reasoning-order-picture'),widths=result.map(p=>parseFloat(p.style.width)),heights=result.map(p=>parseFloat(p.style.height));
 rpCheck(result.length===L.count&&widths.every((v,i)=>i===0||v>widths[i-1])&&heights.every((v,i)=>i===0||v>heights[i-1]),'Every object remains visibly larger than the previous one in the final ordered row');
 rpCheck(result.every((p,i)=>Math.abs(parseFloat(p.style.width)/parseFloat(sorted[i].querySelector('.reasoning-order-picture').style.width)-.6)<.00001&&Math.abs(parseFloat(p.style.height)/parseFloat(sorted[i].querySelector('.reasoning-order-picture').style.height)-.6)<.00001),'The final row scales every object uniformly instead of clipping the largest objects to one size');
}
// Create an actual AAB challenge, hand it over and solve it through rendered controls.
{
 const before=JSON.stringify(P()),local=new Map();globalThis.localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)};let stars=0,skills=0;addStars=()=>{stars++};recordSkill=()=>{skills++};
 Shell.open=function(){this.stage=document.createElement('div');};Shell.caption=()=>{};Shell.close=()=>{};
 reasoningChallengeStudio();const st=Shell.stage;st.querySelectorAll('[data-rule]').find(b=>b.getAttribute('data-rule')==='AAB').click();st.querySelectorAll('[data-pick]')[0].click();const used=st.querySelectorAll('[data-pick]').filter(b=>b.disabled);rpCheck(used.length===1,'A different rule letter cannot reuse the same character');st.querySelectorAll('[data-pick]').find(b=>!b.disabled).click();
 rpCheck(st.querySelectorAll('.reasoning-studio-bead').length===9,'The AAB pattern is visibly repeated three times');st.querySelector('[data-handoff]').click();const choices=st.querySelectorAll('[data-solve]');const selectedPeople=BLUEY_CARDS.slice(0,2),expected=selectedPeople[1].id;choices.find(b=>b.getAttribute('data-solve')!==expected).click();rpCheck(!local.has(REASONING_LOCAL_CHALLENGES_KEY),'A wrong solution is not recorded as completed');choices.find(b=>b.getAttribute('data-solve')===expected).click();
 const records=JSON.parse(local.get(REASONING_LOCAL_CHALLENGES_KEY));rpCheck(records.length===1&&records[0].rule==='AAB'&&records[0].deviceOnly&&records[0].masteryValidated===false,'Collaboration records state local-only practice, not academic mastery');rpCheck(JSON.stringify(P())===before&&stars===0&&skills===0,'A shared challenge changes neither child academic evidence nor rewards nor cloud profile data');rpCheck(st.querySelector('[data-new-challenge]'),'The finished challenge offers an explicit new creation, never automatic chaining');
 for(let i=0;i<25;i++)reasoningStoreChallenge({id:String(i),deviceOnly:true});rpCheck(JSON.parse(local.get(REASONING_LOCAL_CHALLENGES_KEY)).length===20,'Local challenge history is bounded');
}
for(const id of ['tangram','tableau','analogies','rangerG']){const names=GAMES[id].levels.map(L=>L.name);rpCheck(new Set(names).size===names.length,'Every practice stage has a unique difficulty-specific name');rpCheck(WORLD_TILES.grands.includes(id)&&THEMES.grands.some(t=>t.ids.includes(id)),'New reasoning games are reachable in the large-child themes');}
rpCheck(WORLD_TILES.petits.includes('tangram')&&WORLD_TILES.petits.includes('tableau'),'Spatial and M3 sorting practice is also reachable for Lola');
rpCheck(!GAMES.creerDefi.levels&&GAMES.creerDefi.open,'Creative collaboration is a free activity rather than a fake scored level');
const voices=reasoningPracticeVoiceLines();rpCheck(voices.every(t=>typeof t==='string'&&t.length>0)&&new Set(voices).size===voices.length,'Voice inventory is finite and duplicate-free');for(const a of ANALOGY_FAMILIES)for(const b of ANALOGY_FAMILIES)if(a.id!==b.id)rpCheck(voices.includes(reasoningAnalogyPrompt(a,b)),'All generated French analogy instructions are included in the voice bank inventory');
`,ctx,{timeout:30000});
const reasoningStyles=fs.readFileSync(path.join(root,'reasoning-practice-fragment.js'),'utf8');
if(/\.reasoning-order-result \.reasoning-order-picture\{[^}]*max-(?:width|height)/.test(reasoningStyles))throw Error('Final ordered pictures must not be capped independently');
console.log('Raisonnement : tangram 2–7 sans trous ni chevauchements, rotation et toucher, tableaux à deux critères, analogies françaises, ordre 5–9, défi local réellement créé et résolu sans fausse compétence.');
