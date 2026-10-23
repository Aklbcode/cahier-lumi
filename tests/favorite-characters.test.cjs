const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
const root=path.join(__dirname,'..');
assert.ok(source.includes('const FAVORITE_CHARACTERS='),'Favorite characters must be integrated in normal app');
vm.runInContext(`
const favoriteCheck=(ok,message)=>{if(!ok)throw Error(message);};
save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';
const favoriteApi=()=>({results:[],steps:[],alive:()=>true,answer(ok,options={}){this.results.push({ok,options});return ok;},step(ok,options={}){this.steps.push({ok,options});return ok;},help(){},finish(){}});
for(const id of ['robot','memo','memoG'])favoriteCheck(GAMES[id].title===SIMPLE_GAME_NAMES[id],'Child tile and game header agree: '+id);
for(const [id,friend]of Object.entries(FAVORITE_ACTIVITIES)){
 const guide=favoriteGuide(friend);favoriteCheck(guide.tagName==='ASIDE'&&guide.getAttribute('aria-label')===FAVORITE_CHARACTERS[friend].label,'Guide has a separate descriptive label');
 favoriteCheck(guide.querySelectorAll('button').length===0,'Guide is not a clickable answer or a game control');
 favoriteCheck(guide.textContent.includes(FAVORITE_CHARACTERS[friend].label),'A missing image does not erase the character name');
 const img=guide.querySelector('img');if(img){favoriteCheck(img.getAttribute('alt')===FAVORITE_CHARACTERS[friend].name,'Image has a useful alternative');for(const fn of img.listeners.error||[])fn();favoriteCheck(img.hidden===true&&guide.textContent.includes(FAVORITE_CHARACTERS[friend].name),'Image failure keeps the text fallback');}
}
for(let li=0;li<GAMES.robot.levels.length;li++)for(let seed=0;seed<20;seed++){
 const item=withSeed(6000+li*100+seed,()=>GAMES.robot.make({L:GAMES.robot.levels[li],li,i:0,used:[],bag:{}})),st=document.createElement('div'),api=favoriteApi();item.render(st,api);
 const grid=st.querySelector('.post-grid'),cells=grid.children,side=Math.sqrt(cells.length),pawn=()=>cells.filter(b=>b.getAttribute('aria-label')==='Peter Pan'),current=()=>cells.findIndex(b=>b.classList.contains('current'));
 favoriteCheck(item.say.includes('Peter Pan')&&!item.say.includes('robot'),'Instruction names the represented guide');
 favoriteCheck(pawn().length===1&&cells[current()]===pawn()[0],'One named pawn at the initial position');
 cells[current()].click();favoriteCheck(cells[current()].classList.contains('favorite-pawn'),'Clicking the current case preserves the pawn');
 const bad=cells.find(b=>!b.classList.contains('path'));if(bad){const before=current();bad.click();favoriteCheck(current()===before&&api.results.length===0&&api.steps.at(-1).ok===false,'A bush does not advance or finish the game');favoriteCheck(cells[current()].classList.contains('favorite-pawn'),'A wrong move preserves the visible pawn');}
 const goal=cells.findIndex(b=>b.getAttribute('aria-label')==='La maison'),visited=new Set([current()]);let safety=0;
 while(current()!==goal&&safety++<20){const at=current(),next=cells.findIndex((b,i)=>!visited.has(i)&&b.classList.contains('path')&&Math.abs(Math.floor(i/side)-Math.floor(at/side))+Math.abs(i%side-at%side)===1);favoriteCheck(next>=0,'Every generated level has a neighbor toward the goal');cells[next].click();visited.add(next);favoriteCheck(pawn().length===1&&current()===next&&pawn()[0]===cells[next],'Moving updates both character label and current case');}
 favoriteCheck(current()===goal&&api.results.length===1&&api.results[0].ok,'All six stages still finish through real button handlers');favoriteCheck(api.results[0].options.praise==='Bravo, Peter Pan est arrivé !','Success uses the character voice line');
}
for(const id of ['memo','memoG'])for(const L of GAMES[id].levels){const item=GAMES[id].make({L,i:0,used:[],bag:{}}),plan=LumiSpeech.speechJoin(item.say),spoken=plan.filter(x=>typeof x==='object').map(x=>x.t).join(' ');favoriteCheck(spoken.includes('Bluey joue au jeu des paires avec toi.')&&/Retrouve/.test(spoken),'Nested memo instructions retain both the friend and original objective');const st=document.createElement('div');st.getBoundingClientRect=()=>({width:800,height:600});item.render(st,favoriteApi());favoriteCheck(st.querySelectorAll('.mcard').length>=4,'Memo answers still render after voice decoration');favoriteCheck(!st.querySelector('.favorite-guide'),'Game renderer itself does not insert characters among answer cards');}
const favoriteExpected=['Bluey joue au jeu des paires avec toi.','Barbapapa cherche la même forme que toi.','Guide Peter Pan. Touche la case voisine pour aller à la maison.','Bravo, Peter Pan est arrivé !'];favoriteCheck(favoriteExpected.every(t=>favoriteVoiceLines().includes(t)),'All new spoken instructions and praise are enumerable');
`,ctx,{timeout:10000});
async function checkBanners(){
 await vm.runInContext(`(async()=>{
  Shell.caption=()=>{};Shell.bg='#fff';
  for(const gid of Object.keys(FAVORITE_ACTIVITIES))for(const exam of [false,true]){
   const stage=document.createElement('div');Shell.stage=stage;const run={gid,key:'game:'+gid,exam,session:{seed:10,next:0},abort:false};RUN=run;
   const exercise={say:'Une consigne.',autoSay:false,render(st,api){st.append(h('div',{class:'answer-choices'},h('button',null,'Réponse A'),h('button',null,'Réponse B')));}};
   const pending=Engine.play(exercise,run),guide=stage.querySelector('.favorite-guide'),answers=stage.querySelector('.answer-choices');
   favoriteCheck(answers&&answers.children.length===2,'Answer content remains untouched');
   favoriteCheck(exam?!guide:guide&&guide.parentNode===stage&&stage.children[0]===guide,'Character is outside the answer container and absent in assessment');
   favoriteCheck(!answers.querySelector('.favorite-guide'),'Guide never becomes an answer hint');Shell.skipCurrent();await pending;
  }
  const stage=document.createElement('div');Shell.stage=stage;const run={gid:'lecture',key:'lecture',exam:false,session:{seed:10,next:0},abort:false};RUN=run;const pending=Engine.play({autoSay:false,render(st){st.append(h('button',null,'a'));}},run);favoriteCheck(!stage.querySelector('.favorite-guide'),'Phoneme reading exercise stays undecorated');Shell.skipCurrent();await pending;
 })()`,ctx,{timeout:10000});
 const inventory=fs.readFileSync(path.join(root,'scripts/inventory_feedback.cjs'),'utf8');assert.match(inventory,/favoriteVoiceLines\(\)/,'Voice inventory includes character phrases');
 for(const name of ['petit-poilu.png','barbapapa.png'])assert.ok(fs.statSync(path.join(root,'assets/personnages',name)).size>1000,'Bundled character image '+name);
 console.log('Personnages : bandeaux séparés des réponses, 120 chemins et déplacements, mémos, consignes et inventaire vocal vérifiés.');
}
checkBanners().catch(error=>{console.error(error);process.exitCode=1;});
