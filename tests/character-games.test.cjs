/* Real characters belong in the answers: test actual card images, handlers,
   matching identities and color objectives rather than a decorative banner. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..');
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:fn=>{fn();return 0;},clearTimeout(){}});
assert.ok(source.includes('const BLUEY_CARDS=')&&source.includes('function makeCharacterMemo('),'Character answer implementation is integrated');
if(!source.includes('const CHARACTER_MEMORY_REVISION='))vm.runInContext(fs.readFileSync(path.join(root,'character-progress-fragment.js'),'utf8'),ctx);
async function main(){
 await vm.runInContext(`(async()=>{
 const characterCheck=(ok,message)=>{if(!ok)throw Error(message);};save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';
 const makeCharacterApi=()=>({answers:[],steps:[],finishes:[],isAlive:true,alive(){return this.isAlive;},answer(ok,options={}){this.answers.push({ok,options});return ok;},step(ok,options={}){this.steps.push({ok,options});return ok;},finish(first,details={}){this.finishes.push({first,details});},help(){},key(el){this.correct=el;}});
 const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
 const makeStage=()=>{const st=document.createElement('div');st.getBoundingClientRect=()=>({left:0,top:0,width:800,height:600});return st;};
 characterCheck(BLUEY_CARDS.length===8&&new Set(BLUEY_CARDS.map(c=>c.id)).size===8,'Eight distinct character identities are available');
 characterCheck(new Set(BLUEY_CARDS.map(c=>c.src)).size===8&&BLUEY_CARDS.every(c=>c.name&&c.src.startsWith('assets/')),'Every identity has a real, distinct local illustration');
 characterCheck(GAMES.memoMots&&GAMES.memoMots!==GAMES.memoG,'The regular French word/image activity is kept separately');
 for(const gid of ['memo','memoG'])for(let li=0;li<GAMES[gid].levels.length;li++){
  const L=GAMES[gid].levels[li],layouts=new Set();
  for(let seed=0;seed<64;seed++){
   const item=withSeed(90000+li*1000+seed,()=>GAMES[gid].make({L,li,i:0,used:[],bag:{}})),st=makeStage(),api=makeCharacterApi();
   characterCheck(item.memoryKind==='characters','Every character stage uses images as its answers');
   characterCheck(!String(item.evidenceKey||'').startsWith('reading:')&&!String(item.evidenceKey||'').startsWith('gp:'),'Recognizing Bluey is not counted as phonics or reading');
   characterCheck(item.pairIds.length===L.pairs&&new Set(item.pairIds).size===L.pairs,'Requested pair count matches distinct selected identities');
   item.render(st,api);const grid=st.querySelector('.character-memo'),cards=grid&&grid.querySelectorAll('.mcard');characterCheck(grid&&cards.length===2*L.pairs,'Two actual answer cards per pair');
   const grouped=new Map();for(const b of cards){const id=b.getAttribute('data-character'),img=b.querySelector('.character-picture');characterCheck(id&&img,'Each answer has a character identity and real image rather than a letter proxy');const entry=BLUEY_CARDS.find(c=>c.id===id);characterCheck(entry&&img.getAttribute('src')===entry.src&&img.getAttribute('alt')===entry.name,'Answer image and label match its character');characterCheck(/^Carte \\d+/.test(b.getAttribute('aria-label')),'A hidden card does not leak its character name');const xs=grouped.get(id)||[];xs.push(b);grouped.set(id,xs);}
   characterCheck(grouped.size===L.pairs&&[...grouped.values()].every(xs=>xs.length===2),'Every identity occurs exactly twice');
   for(const [id,xs]of grouped){characterCheck(xs[0].querySelector('img').getAttribute('src')===xs[1].querySelector('img').getAttribute('src'),'The two Blueys or other characters are exactly the same picture');}
   layouts.add(cards.map(b=>b.getAttribute('data-character')).join(','));
   /* Exercise a full real board for one seed per stage, plus a mismatched board
      per stage. All 64 seeds are checked for deck/rendition integrity. */
   if(seed<2){
    if(seed===1){const a=cards[0],wrong=cards.find(b=>b.getAttribute('data-character')!==a.getAttribute('data-character'));a.click();await flush();characterCheck(a.getAttribute('aria-label')===BLUEY_CARDS.find(c=>c.id===a.getAttribute('data-character')).name,'Turning a card exposes its useful character label');wrong.click();await flush();characterCheck(api.finishes.length===0&&api.steps.some(x=>x.ok===false),'A mismatch is counted and cannot complete the board');characterCheck(!a.classList.contains('up')&&!wrong.classList.contains('up'),'A mismatched pair closes again');}
    for(const [id,xs]of grouped){xs[0].click();await flush();xs[1].click();await flush();characterCheck(xs.every(b=>b.classList.contains('done')),'A real matching pair is kept visible');}
    characterCheck(api.finishes.length===1&&api.finishes[0].details.completed===true,'Finishing the real board reports completion once');characterCheck(api.finishes[0].first===(seed===0),'A mismatched board does not claim first-try success');characterCheck(api.finishes[0].details.wrongs===(seed===0?0:1),'Mismatch count survives the completion result');
   }
  }
  characterCheck(layouts.size>1,'Deck positions change across deterministic seeds');
 }
 for(let li=0;li<GAMES.couleurs.levels.length;li++){
  const L=GAMES.couleurs.levels[li],targets=new Set();
  for(let seed=0;seed<64;seed++){
   const item=withSeed(120000+li*1000+seed,()=>GAMES.couleurs.make({L,li,i:0,used:[],bag:{}})),st=makeStage(),api=makeCharacterApi();
   characterCheck(typeof item.targetColor==='string'&&COLORS[item.targetColor]&&Array.isArray(item.options),'Color objective and choices are explicit');
   const options=item.options.map(o=>typeof o==='string'?o:o.color||o.key);characterCheck(options.includes(item.targetColor)&&new Set(options).size===options.length,'Correct color is present exactly once');
   item.render(st,api);const buttons=st.querySelectorAll('button').filter(b=>b.getAttribute('data-color'));characterCheck(buttons.length===options.length,'Color choices are real answer buttons');
   for(const b of buttons){const key=b.getAttribute('data-color');characterCheck(options.includes(key),'Button metadata agrees with available colors');b.click();const result=api.answers.at(-1);characterCheck(result&&result.ok===(key===item.targetColor),'Actual handler accepts the targeted color only');}
   const images=st.querySelectorAll('.character-picture');
   if(L.mode==='sort'){characterCheck(images.length>=1,'Color transfer uses a character image as its model');characterCheck(buttons.every(b=>!b.querySelector('.character-picture')),'Transfer answers are neutral color samples, not an identical picture-matching task');}
   else for(const b of buttons){const key=b.getAttribute('data-color'),image=b.querySelector('.character-picture');if(BARBA_COLORS[key])characterCheck(image&&image.getAttribute('src')===BARBA_COLORS[key].src,'Canonical family color uses the matching actual image');else characterCheck(['blanc','brun','gris'].includes(key)&&!image,'Colors without a family member keep a neutral support');}
   targets.add(item.targetColor);
  }
  characterCheck(targets.size>1,'Target colors vary at every stage');
 }
 const lines=favoriteVoiceLines();characterCheck(lines.every(t=>typeof t==='string')&&lines.some(t=>/pastille/.test(t))&&lines.some(t=>/Touche l’image/.test(t)),'New character color instructions are available to the natural voice inventory');
 /* Changing pictures must not relabel historical scores as success with the
    new characters. Preserve access, sibling data and parent decisions. */
 S=defState();S.current='luca';
 const oldSmall={lvl:3,unlocked:4,best:{0:3,3:2},rounds:8,low:1,extra:'conserver'},oldBig={lvl:5,unlocked:7,best:{0:3,3:3,5:2},rounds:13,low:1};
 S.progress.luca={games:{memo:characterProgressCopy(oldSmall),memoG:characterProgressCopy(oldBig),sudoku:{lvl:2,unlocked:3,best:{0:2},rounds:2}},skills:{'mg1':{ok:2,n:4}},rewards:{v:2,stars:7,unlocked:['objet-0','objet-1']},parentActions:[{action:'unlock',target:{kind:'game',gid:'memoG',index:7},patches:[{path:['games','memoG','unlocked'],before:6,after:7}]}],cards:[{name:'Luca'}],resume:{kind:'game',gid:'memoG',li:5,next:1,res:[{first:true}],seed:42}};
 S.progress.lola={games:{memo:{lvl:2,unlocked:3,best:{1:3}}},skills:{sentinel:{ok:4,n:5}},cards:[{name:'Lola'}],resume:{kind:'game',gid:'sudoku',li:1}};
 const siblingBefore=JSON.stringify(S.progress.lola),unchangedBefore=JSON.stringify({skills:S.progress.luca.skills,rewards:S.progress.luca.rewards,parentActions:S.progress.luca.parentActions,cards:S.progress.luca.cards,sudoku:S.progress.luca.games.sudoku}),legacyResume=JSON.stringify(S.progress.luca.resume),cp=P();
 characterCheck(cp.games.memo.lvl===3&&cp.games.memo.unlocked===4,'Lola-sized board access maps by the original pair counts');
 characterCheck(cp.games.memoG.lvl===1&&cp.games.memoG.unlocked===4,'Grand active word/image board maps by size while prior six-image access stays open');
 characterCheck(cp.games.memoMots.lvl===1&&cp.games.memoMots.unlocked===3,'Historical word/image access opens the separate regular-word activity');
 characterCheck(['memo','memoG','memoMots'].every(id=>Object.keys(cp.games[id].best).length===0&&cp.games[id].rounds===0&&cp.games[id].low===0),'No historical score is reattributed to new boards');
 characterCheck(cp.characterMemoryArchive.length===2&&JSON.stringify(cp.characterMemoryArchive.find(a=>a.game==='memo').progress)===JSON.stringify(oldSmall)&&JSON.stringify(cp.characterMemoryArchive.find(a=>a.game==='memoG').progress)===JSON.stringify(oldBig),'Exact legacy game records are archived');
 characterCheck(!cp.resume&&JSON.stringify(cp.characterMemoryArchive.find(a=>a.game==='memoG').resume)===legacyResume,'An old partial board is archived rather than continued using different images');
 characterCheck(JSON.stringify({skills:cp.skills,rewards:cp.rewards,parentActions:cp.parentActions,cards:cp.cards,sudoku:cp.games.sudoku})===unchangedBefore,'Migration preserves stars, academic counters, parent decisions, cards and other games');
 characterCheck(JSON.stringify(S.progress.lola)===siblingBefore,'Reading Luca does not migrate or mutate Lola');
 const once=JSON.stringify(cp);characterCheck(ensureCharacterProgress(cp)===false&&JSON.stringify(P())===once,'Migration is idempotent');
 const wordRecord=JSON.stringify(cp.games.memoMots);cp.games.memoG={lvl:4,unlocked:4,best:{0:3},rounds:2};characterCheck(ensureCharacterProgress(cp)&&cp.games.memoG.contentVersion===CHARACTER_MEMORY_REVISION,'A later legacy cloud record is still detected despite the profile revision flag');characterCheck(JSON.stringify(cp.games.memoMots)===wordRecord,'Existing separate word-game progress is never reset');
 S.current='lola';const lolaResume=JSON.stringify(S.progress.lola.resume);P();characterCheck(JSON.stringify(P().resume)===lolaResume,'Unrelated interrupted games survive migration');
 })()`,ctx,{timeout:30000});
 const cards=JSON.parse(vm.runInContext('JSON.stringify(BLUEY_CARDS)',ctx)),colors=JSON.parse(vm.runInContext('JSON.stringify(BARBA_COLORS)',ctx));
 for(const item of [...cards,...Object.values(colors)])assert.ok(fs.statSync(path.join(root,item.src)).size>500,'Bundled real image '+item.src);
 assert.match(fs.readFileSync(path.join(root,'scripts/inventory_feedback.cjs'),'utf8'),/favoriteVoiceLines\(\)/);
 console.log('Personnages en jeu : paires réelles et identiques, 64 mélanges par palier, clics/erreurs/fin, couleurs et transfert neutre vérifiés.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
