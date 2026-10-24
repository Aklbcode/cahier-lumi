const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{loadApp}=require('./helpers/render-fixture.cjs');
const root=path.join(__dirname,'..'),{ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
if(!source.includes('function characterSudokuItem(ctx)'))vm.runInContext(fs.readFileSync(path.join(root,'character-learning-fragment.js'),'utf8'),ctx);
vm.runInContext(`
const clCheck=(ok,msg)=>{if(!ok)throw Error(msg)};
save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';
const learningApi=()=>({results:[],steps:[],alive:()=>true,key(){},answer(ok,options={}){this.results.push({ok,options});return ok;},step(ok,options={}){this.steps.push({ok,options});return ok;}});
const learningCtx=L=>({L,li:0,i:0,used:[],bag:{}});
function solveCharacterGrid(g){const n=g.length,grid=g.map(row=>row.slice());const search=()=>{for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]==null){for(let v=0;v<n;v++){if(grid[r].includes(v)||grid.some(row=>row[c]===v))continue;if(n===4){const br=r-r%2,bc=c-c%2;if([0,1].some(i=>[0,1].some(j=>grid[br+i][bc+j]===v)))continue;}grid[r][c]=v;if(search())return true;grid[r][c]=null;}return false;}return true;};clCheck(search(),'Every displayed grid remains solvable');return grid;}
for(const L of GAMES.sudoku.levels)for(let seed=0;seed<4;seed++){
 const item=withSeed(1000+seed+L.b*100,()=>GAMES.sudoku.make(learningCtx(L))),st=document.createElement('div'),api=learningApi();item.render(st,api);
 const grid=st.querySelector('.sudoku'),cells=grid.children,palette=st.querySelector('.palette').children,ids=palette.map(b=>b.getAttribute('data-character')),n=L.sz,g=Array.from({length:n},()=>Array(n).fill(null));
 clCheck(ids.length===n&&new Set(ids).size===n,'Distinct character symbols in palette');
 for(const cell of cells){const person=cell.querySelector('.learning-character');if(person)g[cell._r][cell._c]=ids.indexOf(person.getAttribute('data-character'));}
 clCheck(sudoCount(g.map(row=>row.slice()),n)===1,'Unique sudoku solution preserved');const solved=solveCharacterGrid(g),blanks=cells.filter(c=>g[c._r][c._c]==null);
 clCheck(st.querySelectorAll('img').length>n&&blanks.length>0,'Characters appear in given cells and answer palette');
 const first=blanks[0],answer=solved[first._r][first._c];first.click();palette[(answer+1)%n].click();clCheck(api.steps.at(-1).ok===false&&api.results.length===0,'A wrong character never completes or changes the selected empty cell');
 for(const cell of blanks){cell.click();palette[solved[cell._r][cell._c]].click();}
 clCheck(api.results.length===1&&api.results[0].ok,'All character sudoku sizes finish through real clicks');
 const count=api.results.length;first.click();palette[answer].click();clCheck(api.results.length===count,'Filled cells cannot be counted twice');
 clCheck(!/animal/.test(item.say),'Sudoku voice matches the character content');
}
for(const id of ['suites','suitesG'])for(const L of GAMES[id].levels)for(let seed=0;seed<3;seed++){
 const seedValue=9000+seed,item=withSeed(seedValue,()=>GAMES[id].make(learningCtx(L))),st=document.createElement('div'),api=learningApi();item.render(st,api);
 if(L.num){const original=withSeed(seedValue,()=>suiteBeforeCharacterLearning(learningCtx(L),L));clCheck(JSON.stringify(original.say)===JSON.stringify(item.say)&&original.caption===item.caption,'Numeric sequences remain the original exercise');clCheck(!st.querySelector('img'),'No character replaces a number');continue;}
 clCheck(st.querySelector('.necklace').querySelector('img')&&st.querySelector('.row').querySelectorAll('img').length>=2,'Characters are both sequence symbols and actual answer choices');
 const buttons=st.querySelector('.row').children;let turns=0;while(api.results.filter(r=>r.ok).length===0&&turns++<8){for(const b of buttons){const before=api.results.filter(r=>r.ok).length;b.click();if(api.results.filter(r=>r.ok).length>before)break;}}
 clCheck(api.results.filter(r=>r.ok).length===1,'Every logical motif and middle/multiple gap completes through answer clicks');
 clCheck(!/perle|collier/.test(item.say),'Sequence instructions describe the shown symbols');
}
for(const L of GAMES.tailles.levels)for(let i=0;i<3;i++){
 const context=learningCtx(L);context.i=i;const item=GAMES.tailles.make(context),st=document.createElement('div'),api=learningApi();item.render(st,api);
 if(L.mode==='long'){clCheck(st.querySelector('.pencil')&&!st.querySelector('img'),'Comparing pencil lengths remains unchanged');continue;}
 const cards=st.querySelector('.sizes').children,ids=new Set(cards.map(c=>c.querySelector('.learning-character').getAttribute('data-character')));clCheck(ids.size===1&&cards.every(c=>c.querySelector('img')),'The exact same character picture is compared at different sizes');
 if(L.mode==='order'){const sorted=cards.slice().sort((a,b)=>+a.getAttribute('data-size')-+b.getAttribute('data-size'));sorted.at(-1).click();clCheck(api.steps.at(-1).ok===false,'Wrong size order is rejected');sorted.forEach(c=>c.click());clCheck(api.results.length===1&&api.results[0].ok,'Three/four sizes sort through real clicks');clCheck(st.querySelector('.order-line').querySelectorAll('img').length===L.k,'Ordered answers remain pictures');}
 else{const wanted=item.say.includes('moyen')?.66:item.say.includes('petit')?Math.min(...cards.map(c=>+c.getAttribute('data-size'))):1;cards.find(c=>+c.getAttribute('data-size')!==wanted).click();clCheck(api.results.at(-1).ok===false,'Wrong comparative size is rejected');cards.find(c=>+c.getAttribute('data-size')===wanted).click();clCheck(api.results.at(-1).ok,'Size comparison accepts the mathematically correct picture');}
}
clCheck(characterLearningVoiceLines().every(t=>typeof t==='string'&&t.length>0)&&characterLearningVoiceLines().length===25,'All new generic French voice lines are enumerable');
clCheck(!characterLearningVoiceLines().some(t=>BLUEY_CARDS.some(c=>t.includes(c.name))),'English names are never voiced or treated as decoded French');
`,ctx,{timeout:20000});
console.log('Personnages : sudoku unique 2/3/4, suites logiques et tailles vérifiés avec les clics ; nombres et crayons inchangés.');
