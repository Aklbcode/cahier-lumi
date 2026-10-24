/* Search in a fixed 3:2 world: the scene and every object share one coordinate
   system. Zoom transforms that complete world rather than cropping a cover
   image independently. Distinct hit boxes never overlap. */
const CHARACTER_SEARCH_SCENES=['assets/scenes/search-park.png','assets/scenes/search-harbor.png','assets/scenes/search-forest.png'];
const CHARACTER_SEARCH_VOICE=[
 'Retrouve dans le paysage les images montrées en haut. Tu peux agrandir l’image.',
 'Cette image est trouvée. Cherche les autres.',
 'Tu as retrouvé toutes les images.',
 'Ce personnage n’est pas dans les modèles du haut. Regarde encore.',
 'Regarde dans le cadre. Tu peux agrandir l’image.',
 'Une image ne se charge pas. Tu peux passer cet exercice.'
];
function characterSearchVoiceLines(){return [...CHARACTER_SEARCH_VOICE];}
function characterSearchPool(){
 if(typeof SEARCH_CHARACTERS!=='undefined'&&SEARCH_CHARACTERS.length)return SEARCH_CHARACTERS.map(p=>({...p}));
 const bluey=BLUEY_CARDS.map(p=>({...p,id:'bluey:'+p.id})),barba=Object.entries(BARBA_COLORS).map(([color,p])=>({...p,id:'barba:'+color,src:'assets/personnages/barbapapa/mini/'+p.name.toLowerCase()+'.gif'}));
 return [...bluey,...barba];
}
function characterSearchOverlap(a,b,gap=0){return Math.abs(a.x-b.x)<(a.hit+b.hit)/2+gap&&Math.abs(a.y-b.y)<(a.hit+b.hit)/2+gap;}
function characterSearchModel(ctx){
 const L=ctx.L,pool=characterSearchPool(),targets=sample(pool,L.targets),targetIds=new Set(targets.map(p=>p.id)),others=pool.filter(p=>!targetIds.has(p.id));
 const people=[...targets.map(p=>({...p,target:true})),...Array.from({length:L.distractors},()=>({...pick(others),target:false}))],hit=Math.max(100,L.size),pitch=hit+28,cols=Math.max(1,Math.floor(1200/pitch)),rows=Math.max(1,Math.floor(800/pitch)),dx=1200/cols,dy=800/rows;
 const cells=shuffle(Array.from({length:cols*rows},(_,i)=>({x:(i%cols+.5)*dx,y:(Math.floor(i/cols)+.5)*dy})));
 if(cells.length<people.length)throw Error('Search scene capacity is too small');
 const jitterX=Math.max(0,(dx-hit)/2-6),jitterY=Math.max(0,(dy-hit)/2-6);
 const objects=shuffle(people).map((p,i)=>({...p,key:'object-'+i,x:cells[i].x+(Math.random()*2-1)*jitterX,y:cells[i].y+(Math.random()*2-1)*jitterY,size:L.size,hit}));
 return {width:1200,height:800,scene:CHARACTER_SEARCH_SCENES[(ctx.li||0)%CHARACTER_SEARCH_SCENES.length],targets,objects};
}
function characterSearchBounds(view,width,height){
 const z=clamp(view.zoom,1,4);
 return {zoom:z,x:clamp(view.x,-width*(z-1),0),y:clamp(view.y,-height*(z-1),0)};
}
function characterSearchZoom(view,next,width,height,cx=width/2,cy=height/2){
 const z=clamp(next,1,4),ratio=z/view.zoom;
 return characterSearchBounds({zoom:z,x:cx-(cx-view.x)*ratio,y:cy-(cy-view.y)*ratio},width,height);
}
let characterSearchCleanup=null;
function characterSearchItem(ctx){
 const model=characterSearchModel(ctx);
 return {cls:'upgrade-stage character-search-stage',say:CHARACTER_SEARCH_VOICE[0],caption:'Retrouve les images du haut',evidenceKey:'visual-search:characters:v1',exemplar:model.scene+':'+model.objects.map(o=>o.id+'@'+o.x.toFixed(2)+','+o.y.toFixed(2)).join('|'),searchModel:model,render(st,api){
  if(characterSearchCleanup)characterSearchCleanup();
  let view={zoom:1,x:0,y:0},drag=null,suppressUntil=0,done=false,mediaFailed=false,wrongs=RUN?.gid==='cherche'?RUN.session?.partialWrongs||0:0,helped=RUN?.gid==='cherche'?!!RUN.session?.partialHelped:false;
  const found=new Set(),buttons=new Map(),references=new Map(),status=h('p',{class:'search-status','aria-live':'polite'},''),targets=h('div',{class:'search-targets','aria-label':'Images à retrouver'});
  const failed=()=>{if(mediaFailed||!api.alive())return;mediaFailed=true;status.textContent=CHARACTER_SEARCH_VOICE[5];Voice.say(CHARACTER_SEARCH_VOICE[5]);};
  /* The shared picture helper also honors contentBounds on source artwork.
     Keep its internal crop styles intact; size only the returned outer node. */
  const picture=person=>{const node=characterPicture(person);node.classList.add('search-character');for(const img of node.tagName==='IMG'?[node]:node.querySelectorAll('img,image'))img.addEventListener('error',failed);return node;};
  model.targets.forEach(person=>{const ref=h('div',{class:'search-target','data-target-id':person.id},picture(person),h('span',{class:'search-target-check','aria-hidden':'true'},''));references.set(person.id,ref);targets.append(ref);});
  const viewport=h('div',{class:'search-viewport','aria-label':'Paysage à explorer. Utilise les boutons pour agrandir et déplacer l’image.',role:'group'}),world=h('div',{class:'search-world'}),background=h('img',{class:'search-background',src:model.scene,alt:'',draggable:false,'aria-hidden':'true'}),region=h('div',{class:'search-help-region',hidden:true,'aria-hidden':'true'});
  background.addEventListener('error',()=>{background.hidden=true;failed();});world.append(background,region);viewport.append(world);
  const dimensions=()=>{const r=viewport.getBoundingClientRect(),w=r.width||600;return {w,h:r.height||w*2/3};};
  const zoomLabel=h('span',{class:'search-zoom-label','aria-live':'polite'},'Vue entière');
  const paint=()=>{const {w,h}=dimensions();view=characterSearchBounds(view,w,h);world.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.zoom+')';viewport.setAttribute('data-zoom',view.zoom);viewport.setAttribute('data-pan-x',view.x);viewport.setAttribute('data-pan-y',view.y);zoomLabel.textContent=view.zoom===1?'Vue entière':'Zoom × '+Number(view.zoom.toFixed(1));};
  const zoom=delta=>{if(!api.alive())return;const {w,h}=dimensions();view=characterSearchZoom(view,view.zoom+delta,w,h);paint();};
  const pan=(x,y)=>{if(!api.alive())return;const {w,h}=dimensions();view.x+=x*w*.22;view.y+=y*h*.22;paint();};
  const reset=()=>{view={zoom:1,x:0,y:0};paint();};
  const showRegion=(manual=true)=>{
   if(!api.alive()||done)return;const target=model.objects.find(o=>o.target&&!found.has(o.id));if(!target)return;
   helped=true;api.help();const rw=Math.max(260,target.hit*2.1),rh=Math.max(220,target.hit*1.8);
   region.style.left=Math.max(0,target.x-rw/2)/12+'%';region.style.top=Math.max(0,target.y-rh/2)/8+'%';region.style.width=Math.min(rw,1200-Math.max(0,target.x-rw/2))/12+'%';region.style.height=Math.min(rh,800-Math.max(0,target.y-rh/2))/8+'%';region.hidden=false;
   const {w,h}=dimensions(),z=Math.max(view.zoom,1.5);view=characterSearchBounds({zoom:z,x:w/2-target.x/1200*w*z,y:h/2-target.y/800*h*z},w,h);paint();status.textContent=CHARACTER_SEARCH_VOICE[4];if(manual)Voice.say(CHARACTER_SEARCH_VOICE[4]);
  };
  for(const object of model.objects){
   const b=h('button',{class:'search-object','data-search-object':object.key,'data-search-character':object.id,'aria-label':object.name,style:{left:object.x/12+'%',top:object.y/8+'%',width:object.hit/12+'%',height:object.hit/8+'%'}},h('span',{class:'search-object-picture',style:{width:object.size/object.hit*100+'%',height:object.size/object.hit*100+'%'}},picture(object)),h('span',{class:'search-found-check','aria-hidden':'true'},''));
   buttons.set(object.key,b);onTap(b,async()=>{
    if(!api.alive()||done||mediaFailed||Date.now()<suppressUntil||found.has(object.id))return;
    if(!object.target){wrongs++;api.step(false,{el:b,feedback:CHARACTER_SEARCH_VOICE[3]});return;}
    found.add(object.id);b.classList.add('found');b.disabled=true;b.setAttribute('aria-label',object.name+' trouvé');b.querySelector('.search-found-check').textContent='✓';const ref=references.get(object.id);ref.classList.add('found');ref.querySelector('.search-target-check').textContent='✓';region.hidden=true;api.step(true);
    if(found.size===model.targets.length){done=true;status.textContent=CHARACTER_SEARCH_VOICE[2];await Voice.say(CHARACTER_SEARCH_VOICE[2]);if(api.alive())api.finish(wrongs===0&&!helped,{wrongs,completed:true});}
    else status.textContent=CHARACTER_SEARCH_VOICE[1];
   });world.append(b);
  }
  const tool=(text,label,fn)=>uButton(text,fn,{'aria-label':label});
  const tools=h('div',{class:'search-tools'},tool('−','Dézoomer',()=>zoom(-.5)),tool('+','Agrandir l’image',()=>zoom(.5)),tool('↔','Voir toute l’image',reset),zoomLabel,tool('←','Déplacer l’image à gauche',()=>pan(-1,0)),tool('→','Déplacer l’image à droite',()=>pan(1,0)),tool('↑','Déplacer l’image vers le haut',()=>pan(0,-1)),tool('↓','Déplacer l’image vers le bas',()=>pan(0,1)),tool('Un indice','Montrer une zone pour m’aider',()=>showRegion(true)));
  const fit=()=>{
   const r=st.getBoundingClientRect(),availableWidth=Math.max(150,(r.width||600)-24),availableHeight=r.height||500;
   const controls=(targets.offsetHeight||66)+(tools.offsetHeight||60)+(status.offsetHeight||28)+42;
   const width=Math.min(1000,availableWidth,Math.max(150,(availableHeight-controls)*1.5));
   viewport.style.width=width+'px';viewport.style.height=width*2/3+'px';viewport.style.paddingBottom='0';paint();
  };
  const start=(id,x,y)=>{if(!api.alive()||done||drag)return;drag={id,x,y,px:view.x,py:view.y,moved:false};};
  const move=(id,x,y,event)=>{if(!drag||drag.id!==id||!api.alive())return;if(Math.hypot(x-drag.x,y-drag.y)>6)drag.moved=true;if(!drag.moved)return;if(event.cancelable!==false)event.preventDefault();view.x=drag.px+x-drag.x;view.y=drag.py+y-drag.y;paint();try{if(event.pointerId!==undefined)viewport.setPointerCapture(event.pointerId);}catch(_){}};
  const stop=id=>{if(!drag||drag.id!==id)return;if(drag.moved)suppressUntil=Date.now()+300;drag=null;try{if(viewport.hasPointerCapture?.(id))viewport.releasePointerCapture(id);}catch(_){}};
  viewport.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button>0)return;start(e.pointerId,e.clientX,e.clientY);});
  viewport.addEventListener('pointermove',e=>move(e.pointerId,e.clientX,e.clientY,e),{passive:false});viewport.addEventListener('pointerup',e=>stop(e.pointerId));viewport.addEventListener('pointercancel',e=>stop(e.pointerId));viewport.addEventListener('lostpointercapture',e=>stop(e.pointerId));
  if(typeof window!=='undefined'&&!window.PointerEvent){viewport.addEventListener('touchstart',e=>{const t=e.changedTouches?.[0];if(t)start(t.identifier,t.clientX,t.clientY);},{passive:false});viewport.addEventListener('touchmove',e=>{const t=Array.from(e.changedTouches||[]).find(t=>t.identifier===drag?.id);if(t)move(t.identifier,t.clientX,t.clientY,e);},{passive:false});viewport.addEventListener('touchend',e=>{for(const t of Array.from(e.changedTouches||[]))stop(t.identifier);});viewport.addEventListener('touchcancel',e=>{for(const t of Array.from(e.changedTouches||[]))stop(t.identifier);});}
  const resize=()=>{if(api.alive())fit();else characterSearchCleanup?.();};if(typeof window!=='undefined')window.addEventListener('resize',resize);
  characterSearchCleanup=()=>{if(typeof window!=='undefined'&&window.removeEventListener)window.removeEventListener('resize',resize);drag=null;characterSearchCleanup=null;};
  api.strategy=()=>showRegion(false);uWrap(st,targets,viewport,tools,status);fit();
 }};
}
GAMES.cherche={id:'cherche',title:'Chercher les personnages',sub:'Observer et retrouver dans le paysage',icon:'🔎',color:'teal',stage:'#eff6ed',advanceOnCompletion:true,levels:[
 {targets:2,distractors:2,size:180,name:'Deux grandes images'},
 {targets:2,distractors:4,size:164,name:'Au milieu des amis'},
 {targets:3,distractors:6,size:146,name:'Trois images à retrouver'},
 {targets:3,distractors:8,size:128,name:'Un paysage plus rempli'},
 {targets:3,distractors:11,size:112,name:'Observe les détails'},
 {targets:4,distractors:13,size:98,name:'Quatre modèles'},
 {targets:4,distractors:16,size:86,name:'Des images plus petites'},
 {targets:4,distractors:18,size:76,name:'Explore en agrandissant'},
 {targets:5,distractors:21,size:66,name:'Cinq images bien cachées'},
 {targets:5,distractors:23,size:58,name:'Le grand cherche et trouve'}
].map((L,i)=>({...L,n:1,skill:'visual-search:characters:v1:'+i,tag:i<4?'M1–M3':'M3–P1',ref:'Retrouver un modèle visuel parmi des distracteurs, avec zoom libre et aide explicite'})),make:characterSearchItem};
SIMPLE_GAME_NAMES.cherche=GAMES.cherche.title;
for(const world of ['petits','grands']){if(!WORLD_TILES[world].includes('cherche'))WORLD_TILES[world].push('cherche');const theme=THEMES[world].find(t=>t.id==='jouer');if(theme&&!theme.ids.includes('cherche'))theme.ids.push('cherche');if(THEME_DIFFICULTY_ORDER[world].jouer&&!THEME_DIFFICULTY_ORDER[world].jouer.includes('cherche'))THEME_DIFFICULTY_ORDER[world].jouer.push('cherche');}
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`
.character-search-stage{justify-content:flex-start!important}.character-search-stage .upgrade-wrap{width:100%;max-width:1000px;gap:9px}.search-targets{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.search-target{position:relative;display:grid;place-items:center;width:58px;height:64px;padding:4px;background:white;border:2px solid #d2dce0;border-radius:13px}.search-target.found{border-color:#448460;background:#e6f4e9}.search-target-check,.search-found-check{position:absolute;right:-3px;bottom:-2px;color:#17673c;background:#fff;border-radius:50%;font:bold 20px Arial;pointer-events:none}.search-target-check:empty,.search-found-check:empty{display:none}
.search-viewport{position:relative;width:100%;height:0;padding-bottom:66.6666667%;flex:none;overflow:hidden;background:#d7e5c3;border:2px solid #667d64;border-radius:15px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.search-world{position:absolute;top:0;left:0;width:100%;height:100%;transform-origin:0 0;will-change:transform}.search-background{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;pointer-events:none}.search-character{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none}
.search-object{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);border:0!important;border-radius:8px;background:transparent!important;box-shadow:none!important;padding:0!important;margin:0!important;min-width:0!important;min-height:0!important;cursor:pointer;z-index:2;touch-action:none}.search-object-picture{display:block;pointer-events:none}.search-object.found{outline:3px solid #17753b;outline-offset:1px}.search-object.found .search-object-picture{opacity:.6}.search-object:focus-visible{outline:3px solid #353078;outline-offset:2px}.search-help-region{position:absolute;border:5px dashed #7139b7;border-radius:20px;background:#fff2;pointer-events:none;z-index:3}.search-tools{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;line-height:1.8}.search-tools .ubtn{min-width:44px;min-height:44px;font-size:18px;line-height:1.8;padding:8px 12px}.search-zoom-label{min-width:88px;text-align:center;font-size:14px;line-height:1.8}.search-status{min-height:27px;margin:0;font:400 15px/1.8 var(--font-read);text-align:center}@media(max-width:600px){.search-target{width:46px;height:53px}.character-search-stage .upgrade-wrap{gap:6px}.search-tools{gap:4px}.search-tools .ubtn{padding:7px 9px}.search-zoom-label{min-width:70px;font-size:12px}}
`;document.head.append(style);}
