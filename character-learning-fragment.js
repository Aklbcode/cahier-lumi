/* Familiar pictures are the actual logical symbols, never a reading shortcut. */
function learningCharacterPool(kind='bluey'){
 if(kind==='barba')return Object.entries(BARBA_COLORS).map(([id,p])=>({...p,id:'barba-'+id}));
 return BLUEY_CARDS.map(p=>({...p}));
}
function learningCharacterSymbol(person,cls=''){
 return h('span',{class:'learning-character '+cls,'data-character':person.id},characterPicture(person));
}
const CHARACTER_LEARNING_VOICE=[
 'Chaque personnage doit être une seule fois sur chaque ligne et sur chaque colonne. Touche une case vide, puis choisis le personnage.',
 'Chaque personnage doit être une seule fois sur chaque ligne, chaque colonne et dans chaque carré. Touche une case vide, puis choisis le personnage.',
 'Touche d’abord une case vide.','Il y a déjà ce personnage sur cette ligne.','Il y a déjà ce personnage dans cette colonne.','Il y a déjà ce personnage dans ce carré.',
 'Regarde les personnages qui manquent sur la ligne et la colonne.','Regarde le personnage qui brille.','Bravo, la grille est complète !',
 'Continue la suite. Choisis le personnage qui vient après.','Quel personnage manque dans la suite ?','Complète les places vides pour continuer la suite.',
 'Regarde les personnages juste avant et juste après la place vide.','Regarde comment la suite se répète.',
 'Touche le grand personnage.','Touche le petit personnage.','Touche le plus grand personnage.','Touche le plus petit personnage.',
 'Touche le personnage moyen : ni grand, ni petit.','Range les personnages du plus petit au plus grand. Touche d’abord le plus petit.',
 'Cherche le plus petit.','Cherche le plus petit de ceux qui restent.','Oui ! Et maintenant ?','Et le dernier ?','Bravo ! Du plus petit au plus grand !'
];
function characterSudokuItem(ctx){
 const n=ctx.L.sz,{sol,g}=makePuzzle(n,ctx.L.b),people=sample(learningCharacterPool(),n);
 return {cls:'upgrade-stage character-sudoku-stage',exemplar:'character-sudoku:'+JSON.stringify(g),
  say:CHARACTER_LEARNING_VOICE[n<4?0:1],caption:n<4?'Un seul de chaque par ligne et par colonne':'Un seul de chaque par ligne, colonne et carré',
  render(st,api){
   let selected=null,left=g.flat().filter(v=>v==null).length;
   const grid=h('div',{class:'sudoku character-sudoku',style:{gridTemplateColumns:`repeat(${n},auto)`}}),cells=[];
   for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const v=g[r][c],b=h('button',{class:(v!=null?'fix':'')+(n===4&&c===1?' bx-r':'')+(n===4&&r===1?' bx-b':''),'aria-label':v==null?'Case vide, ligne '+(r+1)+', colonne '+(c+1):people[v].name},v==null?'':learningCharacterSymbol(people[v]));
    b._r=r;b._c=c;cells.push(b);
    if(n===4&&(Math.floor(r/2)+Math.floor(c/2))%2)b.style.background=v!=null?'#F3E7C4':'#FFF6DA';
    if(v==null)onTap(b,()=>{if(!api.alive()||g[r][c]!=null)return;cells.forEach(x=>x.classList.remove('sel'));selected=b;b.classList.add('sel');Sfx.play('tap');});
    grid.append(b);
   }
   const palette=h('div',{class:'palette character-sudoku-palette'});
   people.forEach((person,v)=>{
    const button=onTap(h('button',{'aria-label':person.name,'data-character':person.id},learningCharacterSymbol(person)),()=>{
     if(!api.alive())return;if(!selected){Voice.say(CHARACTER_LEARNING_VOICE[2]);return;}
     const r=selected._r,c=selected._c;
     if(sol[r][c]===v){selected.textContent='';selected.append(learningCharacterSymbol(person));selected.setAttribute('aria-label',person.name);selected.classList.remove('sel');g[r][c]=v;selected=null;left--;if(!left)api.answer(true,{el:grid,praise:CHARACTER_LEARNING_VOICE[8]});else api.step(true);}
     else{const row=g[r].includes(v),column=g.some(line=>line[c]===v),br=r-r%2,bc=c-c%2,box=n===4&&[0,1].some(i=>[0,1].some(j=>g[br+i][bc+j]===v));api.step(false,{el:selected,correctEl:palette.children[sol[r][c]],feedback:CHARACTER_LEARNING_VOICE[row?3:column?4:box?5:6],reveal:CHARACTER_LEARNING_VOICE[7]});}
    });palette.append(button);
   });
   uWrap(st,grid,palette);
  }
 };
}
GAMES.sudoku.make=characterSudokuItem;GAMES.sudoku.title='Compléter la grille';GAMES.sudoku.sub='Un personnage par ligne et par colonne';SIMPLE_GAME_NAMES.sudoku=GAMES.sudoku.title;
GAMES.sudoku.levels.forEach(L=>{L.ref=L.sz<4?'Un personnage par ligne et colonne':'Un personnage par ligne, colonne et carré';});

const suiteBeforeCharacterLearning=makeSuite;
function characterSuiteItem(ctx,L){
 if(L.num)return suiteBeforeCharacterLearning(ctx,L);
 const pattern=PATTERNS[pick(L.pats)],kind=L.kind==='mix'?pick(['col','emo']):L.kind,people=sample(learningCharacterPool(kind==='col'?'barba':'bluey'),4),symbols=pattern.map(i=>people[i]),used=uniq(symbols),miss=L.miss||1,total=Math.max(L.len||7,pattern.length*2+miss),sequence=Array.from({length:total},(_,i)=>symbols[i%symbols.length]),holes=L.mid?[rint(pattern.length,total-2)]:Array.from({length:miss},(_,k)=>total-miss+k),pool=L.opts===2?used:uniq([...used,...people]),choices=shuffle(uniq([...holes.map(i=>sequence[i]),...shuffle(pool)]).slice(0,Math.max(L.opts||3,uniq(holes.map(i=>sequence[i])).length)));
 return {cls:'upgrade-stage character-sequence-stage',exemplar:'character-suite:'+sequence.map(p=>p.id).join(':')+':'+holes.join(','),say:CHARACTER_LEARNING_VOICE[L.mid?10:miss>1?11:9],caption:L.mid?'Quel personnage manque ?':'Continue la suite',
  render(st,api){
   let at=0,target;const slots={},symbol=p=>h('span',{class:'bead character-sequence-symbol'},learningCharacterSymbol(p)),neck=h('div',{class:'necklace'},sequence.map((p,i)=>holes.includes(i)?(slots[i]=h('span',{class:'bead slot'+(i===holes[0]?' next':'')},'?')):symbol(p))),row=h('div',{class:'row'}),buttons=choices.map(p=>{const b=card(symbol(p),p.name);b._character=p.id;return b;});
   const mark=()=>{target=buttons.find(b=>b._character===sequence[holes[at]].id);if(target)api.key(target);};
   buttons.forEach(b=>{onTap(b,()=>{if(!api.alive()||at>=holes.length)return;const slot=holes[at],person=sequence[slot];if(b._character!==person.id)return api.answer(false,{el:b,correctEl:target,feedback:CHARACTER_LEARNING_VOICE[L.mid?12:13]});const replacement=symbol(person);slots[slot].parentNode.insertBefore(replacement,slots[slot]);slots[slot].remove();at++;if(at===holes.length)api.answer(true,{el:b});else{api.step(true,{el:b});slots[holes[at]].classList.add('next');mark();}});row.append(b);});mark();uWrap(st,neck,row);
  }
 };
}
makeSuite=characterSuiteItem;

const sizesBeforeCharacterLearning=GAMES.tailles.make;
GAMES.tailles.make=function(ctx){
 const L=ctx.L;if(L.mode==='long')return sizesBeforeCharacterLearning(ctx);
 const person=avoidRepeat(ctx,learningCharacterPool('barba'),p=>p.id),order=L.mode==='order',sizes=order?(L.k===3?[.36,.64,1]:[.3,.5,.74,1]):L.mode==='gp2'?[.42,1]:[.38,.66,1];
 let ask,want;
 if(order)ask=19;else if(L.mode==='moy'&&ctx.i%3!==1){ask=18;want=.66;}else{const big=Math.random()<.5;ask=L.mode==='gp2'?(big?14:15):(big?16:17);want=big?1:sizes[0];}
 return {cls:'upgrade-stage character-size-stage',exemplar:'character-size:'+person.id+':'+L.mode+':'+want,say:CHARACTER_LEARNING_VOICE[ask],caption:order?'Du plus petit au plus grand':'Compare la taille du même personnage',
  render(st,api){
   let target,step=0;const buttons={},line=h('div',{class:'order-line'}),picture=(f,small=false)=>h('span',{class:'character-size-picture',style:{width:`calc(${small?'clamp(40px,8vw,80px)':'clamp(70px,18vw,165px)'} * ${f})`,height:`calc(${small?'clamp(56px,11.2vw,112px)':'clamp(100px,25vw,225px)'} * ${f})`}},learningCharacterSymbol(person)),row=h('div',{class:'sizes character-sizes'},shuffle(sizes).map(f=>{
    const b=card(picture(f),person.name);b.setAttribute('data-size',f);buttons[f]=b;if(f===want)target=b;
    onTap(b,()=>{if(!api.alive()||b.disabled)return;if(!order)return api.answer(f===want,{el:b,correctEl:target});const expected=sizes[step];if(f!==expected)return api.step(false,{el:b,correctEl:buttons[expected],feedback:CHARACTER_LEARNING_VOICE[step===0?20:21]});b.disabled=true;b.style.visibility='hidden';line.append(picture(f,true));step++;if(step===sizes.length)api.answer(true,{el:line,praise:CHARACTER_LEARNING_VOICE[24]});else api.step(true,{say:CHARACTER_LEARNING_VOICE[step===sizes.length-1?23:22]});});return b;
   }));uWrap(st,row,...(order?[line]:[]));
  }
 };
};
function characterLearningVoiceLines(){return CHARACTER_LEARNING_VOICE.slice();}
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent=`
.learning-character{display:block;width:100%;height:100%;pointer-events:none}.character-sudoku .learning-character{width:82%;height:86%}.character-sudoku-palette .learning-character{width:90%;height:90%;margin:auto}.character-sequence-symbol{padding:2px}.character-sequence-symbol .learning-character{height:100%;width:100%}.character-sequence-stage .card{min-width:76px;min-height:92px}.character-sequence-stage .card .bead{width:70px;height:80px}.character-sequence-stage .necklace{padding:10px;gap:5px;border-radius:24px}.character-size-picture{display:block;flex:none}.character-sizes{align-items:flex-end;width:100%;gap:clamp(6px,2vw,20px)}.character-sudoku-stage .upgrade-wrap{gap:14px}@media(max-width:600px){.character-sequence-stage .necklace .bead{width:40px;height:49px}.character-sequence-stage .card .bead{width:58px;height:67px}.character-sequence-stage .card{min-width:66px;min-height:78px}.character-sudoku-palette{gap:9px}}
`;document.head.append(style);}
