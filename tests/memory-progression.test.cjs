const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{Element}=require('./helpers/render-fixture.cjs');
async function main(){
 const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
 /* Review the source module before rebuilding the generated delivery. */
 const start=source.indexOf('/* Niveaux lisibles :'),end=source.indexOf('/* Passer un exercice reste une navigation :',start);
 if(start<0||end<0)throw Error('Progress module markers missing');
 source=source.slice(0,start)+fs.readFileSync(path.join(root,'scripts/progress-fragment.js'),'utf8')+'\n'+source.slice(end);
 Element.prototype.getBoundingClientRect=()=>({width:800,height:600});
 const element=t=>new Element(t),document={createElement:element,createTextNode:t=>new Element('#text',t),head:element('head'),body:element('body'),addEventListener(){},querySelectorAll(s){return this.body.querySelectorAll(s)},querySelector(s){return this.body.querySelector(s)}};
 const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout:fn=>{Promise.resolve().then(fn);return 0;},clearTimeout(){},requestAnimationFrame:f=>f(),window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document,LumiSpeech:require('../speech-engine.js')});
 vm.runInContext(source,ctx,{timeout:10000});
 await vm.runInContext(`(async()=>{
 const check=(ok,msg)=>{if(!ok)throw Error(msg)},flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
 save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();VoicePack.prefetchScope=()=>{};VoicePack.prefetch=()=>{};Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};renderHome=()=>{};Shell.build();
 const cardKey=(card,cards)=>{const identity=card.getAttribute('data-character');if(identity)return identity;const back=card.querySelector('.b'),img=back.querySelector('img'),picture=back.querySelector('.lumi-illustration');if(img)return img.getAttribute('alt');if(picture)return picture.getAttribute('aria-label');const text=back.textContent;if(back.classList.contains('word'))return text;const words=cards.map(c=>c.querySelector('.b')).filter(b=>b.classList.contains('word')).map(b=>b.textContent),word=WORDS.find(w=>w.e===text&&words.includes(w.w));return word?word.w:text;};
 for(const gid of ['memo','memoG',...(GAMES.memoMots?['memoMots']:[])]){
  S=defState();S.current=gid==='memo'?'lola':'luca';S.world=prof().world;P().lecture.unlocked=LESSONS.length-1;
  const other=S.current==='luca'?'lola':'luca';withParentChild(other,p=>{p.skills.sentinel={ok:3,n:7};});
  const otherBefore=JSON.stringify(S.progress[other]),gp=gameProg(gid),n=GAMES[gid].levels[0].n||GAMES[gid].n||6;
  const pending=runGame(gid);await flush();
  for(let board=0;board<n;board++){
   const grid=Shell.stage.querySelector('.memo');check(grid,'A real memory grid renders '+gid+' '+board);
   const cards=grid.querySelectorAll('.mcard'),groups=new Map();for(const card of cards){const k=cardKey(card,cards);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(card);}
   check(groups.size>=2&&[...groups.values()].every(pair=>pair.length===2),'Every visible identity has exactly two cards');
   if(board===0){const [a,b]=[...groups.values()];a[0].click();b[0].click();await flush();check(!a[0].classList.contains('up')&&!b[0].classList.contains('up'),'A mismatch closes through real click handlers');}
   for(const pair of groups.values()){pair[0].click();pair[1].click();await flush();check(pair.every(c=>c.classList.contains('done')),'Matched cards finish through real click handlers');}
   if(board<n-1)check(Shell.stage.querySelector('.memo')!==grid,'Completion starts the next board in this level');
  }
  await pending;await flush();
  const panel=Shell.el.querySelector('.celebrate'),acts=panel&&panel.querySelector('.acts');
  check(panel&&panel.querySelector('h2').textContent.includes('Niveau 1 /'),'Completion screen retains the finished level');
  const next=acts.querySelectorAll('button').find(b=>b.textContent==='Niveau suivant');
  check(gp.unlocked===1&&gp.lvl===1&&next,'A completed memory level opens the next despite an exploratory mismatch');
  check(gp.best[0]===2&&seriesRewards().stars===2,'One mismatch still earns two stars, not a perfect result');
  check(JSON.stringify(S.progress[other])===otherBefore,'Memory play leaves the other child untouched');
  next.click();await flush();check(RUN.levelIndex===1&&Shell.progressEl.textContent.includes('Niveau 2 /')&&Shell.stage.querySelector('.memo'),'Next-level button launches the second level through its real click handler');
  RUN.abort=true;RUN=null;
  const beforeRounds=gp.rounds,beforeStars=seriesRewards().stars;gp.lvl=0;gp.unlocked=0;gp.low=0;
  const skipped=Array.from({length:n},(_,i)=>i?{first:false,wrongs:1,completed:true}:{first:null,skipped:true});
  finishGame({gid,levelIndex:0,res:skipped},GAMES[gid],gp);check(gp.lvl===0&&gp.unlocked===0,'Skipping a memory board does not unlock the next level');
  check(gp.rounds===beforeRounds+1,'Completed series is counted exactly once');
  const incomplete={gid,levelIndex:0,res:Array.from({length:n-1},()=>({first:false,wrongs:1,completed:true}))};check(!memoryLevelCompleted(incomplete,GAMES[gid]),'A partial series cannot satisfy the completion rule');
  check(memoryLevelCompleted({gid,levelIndex:0,res:Array.from({length:n},()=>({first:false,wrongs:2}))},GAMES[gid]),'Previously saved completed boards remain compatible');
 }
 check(!memoryLevelCompleted({levelIndex:0,res:[{first:false}]},GAMES.sudoku),'Other learning games retain their success criterion');
 })()`,ctx,{timeout:10000});
 console.log('Mémos : clics de toutes les paires, erreur exploratoire, score, niveau suivant, reprise et exercices passés vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
