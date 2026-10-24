/* Characters are the pictures that the child actually matches or compares. */
const FAVORITE_CHARACTERS={petit:{name:'Petit Poilu',image:'assets/personnages/petit-poilu.png',label:'Petit Poilu écoute ton histoire'}};
const FAVORITE_ACTIVITIES={recit:'petit',recitP:'petit'};
function favoriteGuide(key){const friend=FAVORITE_CHARACTERS[key];if(!friend)return null;const picture=h('img',{src:friend.image,alt:friend.name,width:70,height:70});picture.addEventListener('error',()=>picture.hidden=true);return h('aside',{class:'favorite-guide','aria-label':friend.label},picture,h('span',null,friend.label));}
const playBeforeFavorites=Engine.play.bind(Engine);
Engine.play=function(item,run){const friend=FAVORITE_ACTIVITIES[run.gid];if(!friend||run.exam)return playBeforeFavorites(item,run);const render=item.render;return playBeforeFavorites({...item,render(st,api){render(st,api);if(!st.querySelector('.favorite-guide'))st.prepend(favoriteGuide(friend));}},run);};
function characterPicture(person){const image=h('img',{class:'character-picture',src:person.src,alt:person.name,loading:'eager'});image.addEventListener('dragstart',e=>e.preventDefault());image.addEventListener('error',()=>{image.hidden=true;const parent=image.parentNode;if(parent&&!parent.querySelector('.character-image-error'))parent.append(h('span',{class:'character-image-error'},'Image indisponible'));});return image;}
function characterMemoDeck(ctx){const count=clamp(ctx.L.pairs,2,BLUEY_CARDS.length);let selected;if(count===2&&ctx.li===0)selected=BLUEY_CARDS.filter(c=>['bluey','bingo'].includes(c.id));else selected=sample(BLUEY_CARDS,count);return {pairs:selected.length,deck:shuffle(selected.flatMap(c=>[{...c},{...c}]))};}
function makeCharacterMemo(ctx){
 const model=characterMemoDeck(ctx);
 return {cls:'upgrade-stage character-memory-stage',memoryKind:'characters',pairIds:uniq(model.deck.map(c=>c.id)),exemplar:'bluey:'+model.deck.map(c=>c.id).join(':'),say:'Retrouve les paires ! Retourne deux cartes.',caption:'Retrouve deux images identiques',
 render(st,api){
  const [cols,rows]=memoGrid(model.pairs),r=st.getBoundingClientRect(),width=Math.max(220,Math.min(760,r.width-32,(r.height-65)*cols/rows));
  const grid=h('div',{class:'memo character-memo',style:{gridTemplateColumns:`repeat(${cols},1fr)`,width:width+'px'}}),status=h('p',{class:'character-pair-count','aria-live':'polite'},'');
  let open=[],found=0,misses=RUN?.session?.partialWrongs||0,lock=false,finished=false;
  const show=(card,up)=>{card.el.classList.toggle('up',up);card.el.setAttribute('aria-label',up?card.c.name:'Carte '+card.number);card.back.setAttribute('aria-hidden',up?'false':'true');};
  model.deck.forEach((c,i)=>{
   const back=h('div',{class:'b','aria-hidden':'true'},characterPicture(c)),el=h('button',{class:'mcard','aria-label':'Carte '+(i+1),'data-character':c.id},h('div',{class:'in'},h('div',{class:'f','aria-hidden':'true'},'?'),back)),entry={c,el,back,number:i+1};
   onTap(el,async()=>{
    if(lock||finished||el.classList.contains('up')||!api.alive())return;
    show(entry,true);Sfx.play('flip');open.push(entry);if(open.length!==2)return;
    lock=true;const [a,b]=open;
    if(a.c.id===b.c.id){
     await sleep(350);if(!api.alive())return;
     a.el.classList.add('done');b.el.classList.add('done');a.el.disabled=true;b.el.disabled=true;found++;Sfx.play('tick');api.step(true);status.textContent=found+' / '+model.pairs;open=[];
     if(found===model.pairs){finished=true;await sleep(350);if(api.alive())api.finish(misses===0,{wrongs:misses,completed:true});return;}
    }else{
     misses++;api.step(false,{feedback:'Regarde bien les deux images. Essaie une autre paire.'});
     await sleep(1000);if(!api.alive())return;show(a,false);show(b,false);open=[];
    }
    lock=false;
   });grid.append(el);
  });
  uWrap(st,grid,status);
 }};
}
/* Keep the real French word/image exercise available as its own activity.
   English character names never count as words decoded in French. */
const wordMemoBeforeCharacters=GAMES.memoG;
GAMES.memoMots={...wordMemoBeforeCharacters,id:'memoMots',title:'Les paires des mots',sub:'Associer un mot à son image',levels:wordMemoBeforeCharacters.levels.filter(L=>L.words).map((L,i)=>({...L,name:L.pairs+' mots et images',skill:'memo:word-image:'+i})),make(ctx){return makeMemo(ctx,ctx.L,true);}};
for(const id of ['memo','memoG']){GAMES[id].title='Les paires de Bluey';GAMES[id].sub='Retrouver les mêmes personnages';GAMES[id].make=makeCharacterMemo;SIMPLE_GAME_NAMES[id]=GAMES[id].title;}
GAMES.memoG.levels=[2,3,4,5,6,8].map((pairs,i)=>({pairs,n:2,name:pairs+' paires de personnages',skill:'memo:characters:'+i,tag:'M3–P1',ref:'Mémoriser la position de deux images identiques de personnages'}));
SIMPLE_GAME_NAMES.memoMots='Les paires des mots';
if(!WORLD_TILES.grands.includes('memoMots'))WORLD_TILES.grands.push('memoMots');
const memoTheme=THEMES.grands.find(t=>t.id==='jouer');if(memoTheme&&!memoTheme.ids.includes('memoMots'))memoTheme.ids.splice(memoTheme.ids.indexOf('memoG')+1,0,'memoMots');
if(THEME_DIFFICULTY_ORDER.grands.jouer&&!THEME_DIFFICULTY_ORDER.grands.jouer.includes('memoMots'))THEME_DIFFICULTY_ORDER.grands.jouer.push('memoMots');
const COLOR_IMAGE_WORD={rouge:'rouge',bleu:'bleue',jaune:'jaune',vert:'verte',orange:'orange',violet:'violette',rose:'rose',noir:'noire',blanc:'blanche',brun:'brune',gris:'grise'};
const CHARACTER_COLOR_VOICE=['Regarde le personnage. Touche la pastille de la même couleur.','Oui, tu as trouvé la bonne couleur.','Regarde encore les couleurs.','Regarde l’image qui brille.'];
function colorCharacterImage(color){const person=BARBA_COLORS[color];return person?characterPicture(person):h('span',{class:'neutral-color-sample','aria-label':color,style:{background:COLORS[color]}});}
function makeBarbaColor(ctx){
 const L=ctx.L,sort=L.mode==='sort',palette=sort?Object.keys(BARBA_COLORS):L.pal,target=avoidRepeat(ctx,palette),options=shuffle([target,...sample(palette.filter(c=>c!==target),(sort?3:L.k)-1)]);
 return {cls:'upgrade-stage character-colors-stage',targetColor:target,options,exemplar:'barba:'+target+':'+(sort?'transfer':'recognize'),say:sort?CHARACTER_COLOR_VOICE[0]:'Touche l’image '+COLOR_IMAGE_WORD[target]+'.',caption:sort?'Trouve la même couleur':'Regarde la couleur du corps',render(st,api){
  let correct;const row=h('div',{class:'character-color-choices','data-count':options.length}),reference=sort?h('div',{class:'character-color-reference'},colorCharacterImage(target)):null;
  for(const color of options){const b=h('button',{class:'character-color-card'+(sort?' color-transfer':''),'aria-label':sort?'Couleur '+color:'Image '+COLOR_IMAGE_WORD[color],'data-color':color},sort?h('span',{class:'neutral-color-sample',style:{background:COLORS[color]}}):colorCharacterImage(color));if(color===target)correct=b;onTap(b,()=>{if(api.alive())api.answer(color===target,{el:b,correctEl:correct,praise:CHARACTER_COLOR_VOICE[1],feedback:CHARACTER_COLOR_VOICE[2],reveal:CHARACTER_COLOR_VOICE[3]});});row.append(b);}
  uWrap(st,...(reference?[reference]:[]),row);
 }};
}
GAMES.couleurs.make=makeBarbaColor;GAMES.couleurs.title='Les couleurs des Barbapapa';GAMES.couleurs.sub='Reconnaître et associer les couleurs';SIMPLE_GAME_NAMES.couleurs=GAMES.couleurs.title;
GAMES.robot.title='Suivre un chemin';GAMES.robot.sub='Se déplacer de case en case';GAMES.robot.icon='🧭';SIMPLE_GAME_NAMES.robot=GAMES.robot.title;
function favoriteVoiceLines(){return [...CHARACTER_COLOR_VOICE,...Object.values(COLOR_IMAGE_WORD).map(word=>'Touche l’image '+word+'.')];}
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`
.favorite-guide{display:flex;align-items:center;justify-content:center;gap:12px;color:#5c5570;font:700 16px/1.3 var(--font-read)}.favorite-guide img{width:60px;height:60px;object-fit:contain}
.character-picture{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none}.character-image-error{font:700 13px/1.3 var(--font-read);color:#666;padding:8px}
.character-memory-stage .upgrade-wrap{gap:5px}.character-pair-count{font:700 16px var(--font-read);margin:5px;min-height:24px}.character-memo .mcard{min-height:0;min-width:0}.character-memo .in{transform:none!important;transition:none}.character-memo .f{font:700 clamp(28px,5vw,45px) var(--font-read);color:white;background:#7864b4;background-image:none}.character-memo .b{display:none;transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;overflow:hidden;padding:8px}.character-memo .mcard.up .f{display:none}.character-memo .mcard.up .b{display:block}.character-memo .mcard.done .b{background:#edf8ee;box-shadow:0 4px 0 #a0c0aa}
.character-color-choices{display:flex;justify-content:center;flex-wrap:wrap;gap:14px;width:100%}.character-color-card{display:grid;place-items:center;flex:0 1 140px;width:clamp(95px,15vw,150px);height:clamp(125px,20vw,180px);padding:12px;background:#fff;border:3px solid #d7deea;border-bottom-width:7px;border-radius:22px;min-width:85px}.neutral-color-sample{display:block;width:75%;height:75%;border-radius:50%;border:3px solid #697080;box-shadow:inset 0 0 0 2px #ffffff99}.character-color-reference{width:130px;height:155px;background:white;border-radius:24px;padding:10px}.character-color-choices[data-count="2"] .character-color-card{flex-basis:220px;width:220px;height:280px}.character-color-choices[data-count="3"] .character-color-card{flex-basis:185px;width:185px;height:235px}.character-color-card.color-transfer{height:110px;flex-basis:110px}.character-color-reference .character-picture{object-fit:contain}
@media(max-width:600px){.character-color-choices{gap:8px}.character-color-card,.character-color-choices[data-count="2"] .character-color-card,.character-color-choices[data-count="3"] .character-color-card{flex-basis:100px;width:100px;height:140px;padding:8px}.character-memo .b{padding:5px}.character-color-reference{height:120px;width:100px}}
`;document.head.append(style);}
