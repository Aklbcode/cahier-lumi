const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
class Node{
 constructor(tag='div'){this.nodeType=tag==='#text'?3:1;this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.style={setProperty(){}};this.dataset={};this._text='';this.hidden=false;this.className='';this.classList={add:(...xs)=>{this.className=[...new Set([...this.className.split(' '),...xs])].join(' ')},remove:(...xs)=>{this.className=this.className.split(' ').filter(x=>!xs.includes(x)).join(' ')},toggle(){}};}
 append(...items){for(const x of items.flat(Infinity)){if(x==null||x===false)continue;const child=typeof x==='string'?Object.assign(new Node('#text'),{_text:x}):x;this.children.push(child);child.parentNode=this;}}
 prepend(...items){const old=this.children;this.children=[];this.append(...items,...old);}
 insertBefore(child,before){const i=this.children.indexOf(before);if(i<0)this.append(child);else{this.children.splice(i,0,child);child.parentNode=this;}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);}
 setAttribute(k,v){this.attrs[k]=String(v);if(k==='class')this.className=v;}
 getAttribute(k){return this.attrs[k];}
 addEventListener(n,f){(this.events||(this.events={}))[n]=f;}
 querySelectorAll(selector){const matches=(n,s)=>s.startsWith('.')?n.className.split(' ').includes(s.slice(1)):s.startsWith('#')?n.attrs.id===s.slice(1):n.tagName===s.toUpperCase();const out=[];const walk=n=>{for(const c of n.children){if(selector.split(',').some(s=>matches(c,s.trim())))out.push(c);walk(c)}};walk(this);return out;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 set textContent(t){this._text=String(t);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 set innerHTML(t){this._text='';this.children=[];}
 get innerHTML(){return '';}
}
const document={createElement:t=>new Node(t),createTextNode:t=>Object.assign(new Node('#text'),{_text:t}),body:new Node('body'),head:new Node('head'),addEventListener(){},querySelectorAll(s){return this.body.querySelectorAll(s)},querySelector(s){return this.body.querySelector(s)}};
const context=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,requestAnimationFrame:f=>f(),window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document,LumiSpeech:require('../speech-engine.js')});
let source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
if(!source.includes('function levelState(gid)'))source+='\n'+fs.readFileSync(path.join(root,'scripts/progress-fragment.js'),'utf8');
vm.runInContext(source,context);
vm.runInContext(`
const check=(b,msg)=>{if(!b)throw Error(msg)};save=()=>{};S=defState();S.current='luca';Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Sfx.ensure=()=>{};
let started=null;runGame=id=>{started={id,level:gameProg(id).lvl};};
const initial=levelState('sudoku');check(initial.current===1&&initial.total===14,'Initial current and maximum');check(initial.items.filter(x=>x.open).length===1,'Future levels visible but locked');
const gp=gameProg('sudoku');gp.lvl=4;gp.unlocked=7;const progressed=levelState('sudoku');check(progressed.current===5&&progressed.items.filter(x=>x.open).length===8,'Current level distinct from available levels');progressed.items[2].go();check(started.id==='sudoku'&&started.level===2,'Replay an available exact level');
P().lecture.unlocked=8;const view=currentRunLevel({session:{kind:'lesson',li:2},gid:'lecture'});check(view.current===3&&view.total===LESSONS.length,'Reading header uses active lesson, not highest unlocked');
const total=MODS.reduce((n,m)=>n+m.levels.length,0),offset=MODS[0].levels.length;const math=currentRunLevel({gid:'calcul',session:{kind:'module',mi:1,lv:1}});check(math.current===offset+2&&math.total===total,'Calculation header flattens module steps');
calc().open=2;modProg(MODS[2].id).parentStart=1;const calcView=levelState('calcul');check(calcView.current===MODS[0].levels.length+MODS[1].levels.length+2,'Parent-selected calculation start remains visible');
const tile=simpleGameTile('sudoku');check(tile.querySelector('.activity-progress')&&tile.textContent.includes('Niveau 3 / 14'),'Activity tile current/max and progress bar');const free=simpleGameTile('atelier');check(free.textContent.includes('Activité libre')&&!free.querySelector('.activity-progress'),'Free creation has no invented maximum');check(levelState('cuisine')===null,'Cooking has no invented mastery progress');
P().bookEvidence={[MINI_BOOKS[0].id]:{at:1}};check(levelState('livres').current===1&&levelState('livres').total===12,'Library progress counts unique completed books');const book=currentRunLevel({gid:'livres',bookId:MINI_BOOKS[2].id});check(book.current===3&&book.label==='Livre','Book reading can show its active book');
Shell.build();RUN={gid:'sudoku',levelIndex:2,session:{kind:'game',li:2}};Shell.open({level:'Sudoku'});check(Shell.progressEl.textContent.includes('Niveau 3 / 14')&&!Shell.progressEl.hidden,'Header shows the played level');Celebrate.show({next:()=>{},nextLabel:'Niveau suivant',note:'Une nouvelle étape est disponible.',home:()=>{}});const celebration=Shell.el.querySelector('.celebrate');check(celebration.querySelector('h2').textContent==='Niveau 3 / 14 terminé','Completed level remains visible in score screen');check(celebration.querySelector('.acts').children[0].textContent==='Niveau suivant','Custom next label is rendered');check(celebration.querySelector('.completion-note').textContent==='Une nouvelle étape est disponible.','Completion context is rendered');Shell.clearCeleb();showLevelChoices(levelState('sudoku'));const choices=document.body.querySelector('.level-choice-list');check(choices.children.length===14&&choices.children[3].getAttribute('disabled')===undefined&&choices.children[9].getAttribute('disabled')!==undefined,'All levels listed with future levels disabled');
let score=null,rewardCalls=0;Celebrate.show=o=>{score=o;};addStars=n=>{rewardCalls++;return {earned:n};};Shell.el=document.createElement('div');
gp.lvl=0;gp.unlocked=0;gp.best={};gp.low=0;const run={gid:'sudoku',levelIndex:0,session:{li:0},res:[{first:true},{first:true}]};finishGame(run,GAMES.sudoku,gp);check(gp.lvl===1&&gp.unlocked===1&&!!score.next,'Successful completion offers next level');check(gp.best[0]===3&&!gp.best[1],'Result saved against completed level');score.again();check(started.level===0,'Replay stays on just-completed level');score.next();check(started.level===1,'Next button starts following level');
gp.lvl=13;gp.unlocked=13;finishGame({gid:'sudoku',levelIndex:13,res:[{first:true}]},GAMES.sudoku,gp);check(!score.next,'Last level never loops or offers nonexistent next');
gp.lvl=0;gp.unlocked=0;gp.low=0;finishGame({gid:'sudoku',levelIndex:0,res:[{first:true},{first:null,skipped:true}]},GAMES.sudoku,gp);check(gp.lvl===0&&gp.unlocked===0&&gp.low===0,'Skipped exercise neither advances nor demotes');
const actualScore=scoreOf;scoreOf=()=>({pct:0,stars:0,errors:0});const beforeReward=rewardCalls;finishGame({gid:'sudoku',levelIndex:0,res:[{first:null,skipped:true}]},GAMES.sudoku,gp);check(score.sticker===null&&rewardCalls===beforeReward,'Entirely skipped series earns no reward');scoreOf=actualScore;
S.current='lola';check(levelState('sudoku').current===1&&levelState('sudoku').items.filter(x=>x.open).length===1,'Progress is independent for each child');
`,context,{timeout:10000});
assert.ok(source.includes('nextLabel'), 'Custom reading/calculation completion retains next action label');
console.log('Progression : niveaux actuels/disponibles, parcours lecture et calcul, tuiles, reprise exacte, étape suivante et exercices passés vérifiés.');
