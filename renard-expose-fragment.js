/* Mon exposé : le renard — préparation de l’exposé de Luca (lundi 14 décembre 2026).
   Consigne de l’école : rechercher la famille, l’anatomie, la taille, les
   prédateurs, l’alimentation, l’habitat, la localisation et les
   caractéristiques de l’animal totem ; un support illustré, peu de texte ;
   apprendre à l’enfant à le présenter.
   Faits vérifiés le 1er novembre 2026 : Bruxelles Environnement (infofiche
   « Le renard »), Vikidia (« Renard roux »), Gouvernement du Québec (fiche
   « Renard roux »). Le renard et le terrier sont des dessins originaux ; les
   pictogrammes viennent de Twemoji (CC BY 4.0). La comptine est originale.
   Onze activités courtes : découvrir, s’entraîner par rubrique, répéter
   l’exposé, le présenter seul, puis un grand quiz avec un bilan par rubrique. */

const RENARD_EXPOSE={date:'2026-12-14',jour:'lundi 14 décembre'};
const RENARD_RUBRIQUES=[
 {id:'famille',pic:'👪',name:'Sa famille'},
 {id:'corps',pic:'🦊',name:'Son corps'},
 {id:'taille',pic:'📏',name:'Sa taille'},
 {id:'repas',pic:'🍽️',name:'Ce qu’il mange'},
 {id:'maison',pic:'🌲',name:'Où il vit'},
 {id:'monde',pic:'🌍',name:'Dans le monde'},
 {id:'dangers',pic:'⚠️',name:'Ses dangers'},
 {id:'special',pic:'⭐',name:'Ce qui le rend spécial'}
];

/* ---------- Dessins originaux ---------- */
const RENARD_FOX_SVG=`<svg viewBox="0 0 430 270" xmlns="http://www.w3.org/2000/svg" class="renard-fox-svg" role="img" aria-label="un renard">
<ellipse cx="220" cy="252" rx="170" ry="9" fill="#000" opacity=".08"/>
<g data-part="queue"><path d="M292 142 C 326 122 356 92 368 62 C 376 42 398 30 412 42 C 430 60 424 110 398 142 C 372 174 330 188 292 180 Z" fill="#e2702a"/><path d="M306 166 C 340 160 372 132 390 96" fill="none" stroke="#c45a1c" stroke-width="5" stroke-linecap="round" opacity=".5"/></g>
<g data-part="bout"><path d="M368 62 C 376 42 398 30 412 42 C 421 50 423 64 420 80 C 400 80 380 74 368 62 Z" fill="#fffaf2" stroke="#e8dccb" stroke-width="2"/></g>
<g data-part="pattes"><path d="M172 176 L166 230 L186 230 L192 180 Z" fill="#d4652a"/><path d="M166 212 L164 240 L190 240 L188 212 Z" fill="#2b2523"/><path d="M200 182 L198 230 L218 230 L220 184 Z" fill="#e2702a"/><path d="M198 212 L196 240 L222 240 L220 212 Z" fill="#2b2523"/><path d="M268 176 L262 230 L282 230 L292 180 Z" fill="#d4652a"/><path d="M262 212 L260 240 L286 240 L284 212 Z" fill="#2b2523"/><path d="M294 170 L294 230 L314 230 L318 168 Z" fill="#e2702a"/><path d="M294 212 L292 240 L318 240 L316 212 Z" fill="#2b2523"/></g>
<g data-part="corps"><path d="M148 128 C 168 102 230 96 278 106 C 320 114 334 150 314 172 C 292 192 222 194 186 186 C 156 180 134 156 148 128 Z" fill="#e8792b"/><path d="M146 136 C 152 164 182 184 214 186 C 196 170 186 150 184 128 C 170 122 156 124 146 136 Z" fill="#fffaf2"/></g>
<g data-part="tete"><path d="M150 80 C 172 92 178 126 162 148 C 148 166 116 166 94 154 L 32 128 C 28 120 32 113 40 111 L 92 88 C 108 76 132 72 150 80 Z" fill="#e8792b"/><path d="M34 129 L 94 154 C 116 166 148 166 162 148 C 142 152 120 148 104 140 C 82 134 56 130 40 126 Z" fill="#fffaf2"/></g>
<g data-part="oreilles"><path d="M100 90 L 110 30 L 138 80 Z" fill="#e2702a"/><path d="M108 80 L 112 46 L 128 78 Z" fill="#fde3c8"/><path d="M110 30 L 104 52 L 119 50 Z" fill="#2b2523"/><path d="M130 80 L 158 28 L 166 92 Z" fill="#d4652a"/><path d="M140 80 L 157 46 L 160 86 Z" fill="#fde3c8"/><path d="M158 28 L 149 48 L 163 50 Z" fill="#2b2523"/></g>
<g data-part="museau"><path d="M24 112 L 70 104 L 76 136 L 28 134 Z" fill="#000" fill-opacity="0"/><ellipse cx="34" cy="119" rx="9" ry="7.5" fill="#2b2523"/><path d="M46 130 Q 56 136 68 134" fill="none" stroke="#2b2523" stroke-width="2.5" stroke-linecap="round"/></g>
<g data-part="moustaches" stroke="#5b4636" stroke-width="2" stroke-linecap="round" fill="none"><path d="M14 100 L 64 112 L 64 132 L 16 146 Z" fill="#000" fill-opacity="0" stroke="none"/><path d="M62 120 L 24 106"/><path d="M62 124 L 20 122"/><path d="M64 128 L 26 138"/></g>
<g data-part="oeil"><circle cx="110" cy="105" r="21" fill="#000" fill-opacity="0"/><path d="M96 106 C 102 96 118 96 124 104 C 116 112 104 114 96 106 Z" fill="#2b2523"/><circle cx="113" cy="103" r="2.6" fill="#fff"/></g>
</svg>`;
const RENARD_TERRIER_SVG=`<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" class="renard-terrier-svg" role="img" aria-label="un terrier sous la terre">
<rect width="300" height="64" fill="#dff1ff"/><circle cx="262" cy="22" r="11" fill="#fff4b8"/>
<rect y="58" width="300" height="142" fill="#a8744a"/><path d="M0 100 C 60 92 120 108 180 98 S 260 92 300 102" fill="none" stroke="#8f6039" stroke-width="3" opacity=".6"/><path d="M0 170 C 70 160 140 176 210 166 S 280 160 300 170" fill="none" stroke="#8f6039" stroke-width="3" opacity=".6"/>
<ellipse cx="40" cy="150" rx="8" ry="5" fill="#8a7a6a"/><ellipse cx="270" cy="128" rx="10" ry="6" fill="#8a7a6a"/><ellipse cx="120" cy="182" rx="7" ry="4" fill="#8a7a6a"/>
<path d="M0 64 C 20 56 40 66 60 60 C 80 54 100 66 130 60 C 160 54 190 66 220 60 C 250 54 280 64 300 60 L 300 70 L 0 70 Z" fill="#7cc26b"/>
<rect x="236" y="34" width="9" height="30" fill="#7a4e2c"/><circle cx="240" cy="30" r="20" fill="#4f9a4a"/>
<ellipse cx="62" cy="66" rx="22" ry="7" fill="#3b2617"/>
<path d="M62 68 C 76 110 118 122 168 134" fill="none" stroke="#4a2f1d" stroke-width="30" stroke-linecap="round"/>
<ellipse cx="206" cy="140" rx="58" ry="36" fill="#4a2f1d"/>
<path d="M232 152 C 250 140 248 120 232 116 C 222 114 214 122 220 130" fill="#e2702a"/><path d="M232 116 C 222 114 214 122 220 130 C 226 126 230 122 232 116 Z" fill="#fffaf2"/>
<ellipse cx="208" cy="150" rx="34" ry="18" fill="#e8792b"/>
<path d="M180 150 C 176 138 186 130 198 134 L 206 150 Z" fill="#e8792b"/><path d="M182 138 L 186 124 L 194 134 Z" fill="#d4652a"/><path d="M190 136 L 197 124 L 200 137 Z" fill="#d4652a"/>
<path d="M184 144 Q 188 147 192 144" fill="none" stroke="#2b2523" stroke-width="2" stroke-linecap="round"/>
<text x="222" y="122" font-size="14" fill="#fff" font-family="sans-serif">z</text><text x="234" y="110" font-size="17" fill="#fff" font-family="sans-serif">z</text>
</svg>`;
function renardArt(svg,cls){return h('span',{class:'renard-art '+(cls||''),html:svg});}
function renardPic(e,label,size){return typeof ecolePic==='function'?ecolePic(e,label,size):h('span',{class:'ecole-pic '+(size||''),role:'img','aria-label':label},typeof lumiIllustration==='function'?lumiIllustration(e,label):e);}
function renardChip(e,label){return h('span',{class:'renard-chip'},renardPic(e,label),h('small',null,label));}

/* ---------- Je découvre : une fiche par rubrique ---------- */
const RENARD_FAITS={
 famille:{say:['Le renard est de la famille des canidés, comme le chien et le loup.','Le papa, c’est le renard. La maman, c’est la renarde. Les bébés, ce sont les renardeaux.','Au printemps, la renarde a souvent quatre ou cinq renardeaux.'],
  show:()=>h('div',{class:'renard-chips'},renardChip('🦊','le renard'),renardChip('🐕','le chien'),renardChip('🐺','le loup'))},
 corps:{say:['Le renard a un pelage roux, avec du blanc sous le cou.','Il a des oreilles pointues et un museau fin.','Sa grande queue touffue a le bout blanc. Ses pattes sont noires, comme des chaussettes.'],
  show:()=>renardArt(RENARD_FOX_SVG,'big')},
 taille:{say:['Avec sa queue, le renard mesure environ un mètre.','Il pèse environ six kilos.','Il est plus grand qu’un chat, mais plus petit qu’un loup.'],
  show:()=>h('div',{class:'renard-sizes'},h('span',{style:{fontSize:'48px'}},renardChip('🐈','le chat')),h('span',{style:{fontSize:'72px'}},renardChip('🦊','le renard')),h('span',{style:{fontSize:'100px'}},renardChip('🐺','le loup')))},
 repas:{say:['Le renard mange surtout des souris et des campagnols.','Il mange aussi des lapins, des oiseaux, des œufs, des insectes, des vers de terre et des fruits.','Il mange un peu de tout : on dit qu’il est omnivore.'],
  show:()=>h('div',{class:'renard-chips'},...[['🐭','des souris'],['🐰','des lapins'],['🐦','des oiseaux'],['🥚','des œufs'],['🪲','des insectes'],['🪱','des vers de terre'],['🫐','des fruits']].map(([e,w])=>renardChip(e,w)))},
 maison:{say:['Le renard vit dans les forêts, dans les champs, et même en ville.','Il se repose et élève ses petits dans un terrier, un abri creusé sous la terre.','Souvent, c’est un ancien terrier de blaireau.'],
  show:()=>h('div',{class:'renard-line'},renardArt(RENARD_TERRIER_SVG,'terrier'),h('div',{class:'renard-chips col'},renardChip('🌲','la forêt'),renardChip('🌾','les champs'),renardChip('🏙️','la ville')))},
 monde:{say:['Le renard roux vit en Belgique et partout en Europe.','On le trouve aussi en Asie, en Amérique du Nord, en Afrique du Nord et même en Australie.','Il y a même des renards à Bruxelles !'],
  show:()=>h('div',{class:'renard-line'},renardPic('🌍','la Terre','big'),renardChip('🏙️','Bruxelles'))},
 dangers:{say:['Le loup peut attaquer le renard.','Le grand-duc, un très grand hibou, peut attraper les renardeaux.','Mais le plus grand danger pour le renard, ce sont les voitures sur les routes.'],
  show:()=>h('div',{class:'renard-chips'},renardChip('🐺','le loup'),renardChip('🦉','le grand-duc'),renardChip('🚗','les voitures'))},
 special:{say:['Le renard vit surtout la nuit.','Ses grandes oreilles entendent une souris qui bouge dans l’herbe.','Pour l’attraper, il fait un grand saut. Hop !','Quand il crie, on dit que le renard glapit.'],
  show:()=>h('div',{class:'renard-chips'},renardChip('🌙','la nuit'),renardChip('👂','il entend'),renardChip('🐭','hop !'))}
};
function renardRubriqueBadge(R){return h('div',{class:'renard-badge'},renardPic(R.pic,R.name),h('b',null,R.name));}
function renardDecouvreItem(ctx){
 const R=RENARD_RUBRIQUES[ctx.i],F=RENARD_FAITS[R.id],talk=[];F.say.forEach((s,i)=>{if(i)talk.push(500);talk.push(s);});
 return {cls:'renard-stage',say:talk,caption:R.name,
  render(st,api){
   const text=h('div',{class:'renard-facts'},F.say.map(s=>h('p',null,s)));
   uWrap(st,renardRubriqueBadge(R),F.show(),text,
    h('div',{class:'renard-actions'},onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(talk)),onTap(h('button',{class:'go-btn'},'Suivant',icon('next')),()=>api.finish(null))));
  }};
}

/* ---------- Le corps du renard ---------- */
const RENARD_PARTIES=[
 {part:'queue',ask:'Touche la queue du renard.',ok:'Oui ! Sa grande queue est touffue.',accept:['queue','bout']},
 {part:'oreilles',ask:'Touche une oreille du renard.',ok:'Oui ! Ses oreilles pointues entendent très bien.'},
 {part:'museau',ask:'Touche le museau du renard.',ok:'Oui ! Avec son museau, il sent très bien les odeurs.',accept:['museau','moustaches']},
 {part:'pattes',ask:'Touche une patte du renard.',ok:'Oui ! Ses pattes sont noires, comme des chaussettes.'},
 {part:'oeil',ask:'Touche l’œil du renard.',ok:'Oui ! Le renard voit bien quand il fait sombre.'},
 {part:'bout',ask:'Touche le bout blanc de la queue.',ok:'Oui ! Le bout de sa queue est blanc.'},
 {part:'moustaches',ask:'Touche les moustaches du renard.',ok:'Oui ! Ses moustaches l’aident à sentir ce qui l’entoure.',accept:['moustaches','museau']}
];
const RENARD_PART_NAMES={queue:'Ça, c’est la queue. Cherche encore.',bout:'Ça, c’est le bout de la queue. Cherche encore.',pattes:'Ça, c’est une patte. Cherche encore.',corps:'Ça, c’est le corps. Cherche encore.',tete:'Ça, c’est la tête. Cherche encore.',oreilles:'Ça, c’est une oreille. Cherche encore.',museau:'Ça, c’est le museau. Cherche encore.',moustaches:'Ça, ce sont les moustaches. Cherche encore.',oeil:'Ça, c’est l’œil. Cherche encore.'};
function renardCorpsItem(ctx){
 const order=ctx.bag.corps||(ctx.bag.corps=shuffle(RENARD_PARTIES.filter(x=>x.part!=='moustaches')).slice(0,5).concat(RENARD_PARTIES.filter(x=>x.part==='moustaches')));
 const Q=order[ctx.i%order.length],accept=Q.accept||[Q.part];
 return {cls:'renard-stage',say:Q.ask,caption:Q.ask,
  render(st,api){
   const art=renardArt(RENARD_FOX_SVG,'big tap');const target=art.querySelector('[data-part="'+Q.part+'"]');api.key(target);
   art.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('[data-part]');if(!g)return;const part=g.getAttribute('data-part');
    const ok=accept.includes(part);api.answer(ok,{el:g,correctEl:target,praise:Q.ok,feedback:RENARD_PART_NAMES[part]||'Cherche encore.',reveal:'Regarde, c’est là où ça brille. Touche-le !'});});
   uWrap(st,art,onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(Q.ask)));
  }};
}

/* ---------- Oui ou non : le repas, les dangers ---------- */
const RENARD_REPAS=[
 {e:'🐭',w:'une souris',yes:true,why:'Oui ! Les souris, c’est son repas préféré.'},
 {e:'🐰',w:'un lapin',yes:true,why:'Oui ! Le renard chasse aussi les lapins.'},
 {e:'🥚',w:'un œuf',yes:true,why:'Oui ! Il aime les œufs des oiseaux.'},
 {e:'🪲',w:'un scarabée',yes:true,why:'Oui ! Il mange aussi des insectes.'},
 {e:'🪱',w:'un ver de terre',yes:true,why:'Oui ! Il mange aussi des vers de terre.'},
 {e:'🫐',w:'des baies',yes:true,why:'Oui ! À la fin de l’été, il mange des fruits et des baies.'},
 {e:'🐦',w:'un oiseau',yes:true,why:'Oui ! Il peut attraper des oiseaux.'},
 {e:'🍂',w:'des feuilles mortes',yes:false,why:'Non ! Le renard ne mange pas de feuilles.'},
 {e:'🪨',w:'un caillou',yes:false,why:'Non ! Personne ne mange des cailloux !'},
 {e:'🌼',w:'une fleur',yes:false,why:'Non ! Le renard ne mange pas de fleurs.'}
];
const RENARD_DANGERS=[
 {e:'🐺',w:'le loup',yes:true,why:'Oui ! Le loup peut attaquer le renard.'},
 {e:'🦉',w:'le grand-duc',yes:true,why:'Oui ! Ce très grand hibou peut attraper les renardeaux.'},
 {e:'🚗',w:'la voiture',yes:true,why:'Oui ! Les voitures sont le plus grand danger pour le renard.'},
 {e:'🐭',w:'la souris',yes:false,why:'Non ! C’est le renard qui chasse les souris.'},
 {e:'🦋',w:'le papillon',yes:false,why:'Non ! Le papillon ne fait pas de mal au renard.'},
 {e:'🐌',w:'l’escargot',yes:false,why:'Non ! L’escargot ne fait pas de mal au renard.'},
 {e:'🐞',w:'la coccinelle',yes:false,why:'Non ! La coccinelle ne fait pas de mal au renard.'}
];
function renardYesNoRow(api,yes,why,labels=['Oui','Non'],wrongTrue){
 let target;
 const row=h('div',{class:'row ecole-choices renard-yesno'},[[true,'✓',labels[0]],[false,'✗',labels[1]]].map(([v,sym,word])=>{
  const b=h('button',{class:'card txt renard-yn '+(v?'yes':'no'),'aria-label':word},h('span',{class:'renard-yn-sym','aria-hidden':'true'},sym),h('span',{class:'renard-yn-word'},word));
  if(v===yes)target=b;onTap(b,()=>api.answer(v===yes,{el:b,correctEl:target,praise:why,feedback:yes?(wrongTrue||why):why}));return b;}));
 api.key(target);return row;
}
function renardDeckItem(ctx,key,pool,question,sizes){
 const deck=ctx.bag[key]||(ctx.bag[key]=shuffle([...shuffle(pool.filter(x=>x.yes)).slice(0,sizes[0]),...shuffle(pool.filter(x=>!x.yes)).slice(0,sizes[1])]));
 const X=deck[ctx.i%deck.length];
 return {cls:'renard-stage',say:[X.w,300,question],caption:question,
  render(st,api){uWrap(st,renardPic(X.e,X.w,'big'),onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say([X.w,300,question])),renardYesNoRow(api,X.yes,X.why));}};
}
const RENARD_Q={repas:'Est-ce que le renard mange ça ?',danger:'Est-ce un danger pour le renard ?'};
function renardRepasItem(ctx){return renardDeckItem(ctx,'repas',RENARD_REPAS,RENARD_Q.repas,[5,3]);}
function renardDangersItem(ctx){return renardDeckItem(ctx,'dangers',RENARD_DANGERS,RENARD_Q.danger,[3,3]);}

/* ---------- Grand ou petit ---------- */
const RENARD_TAILLES=[
 {e:'🐭',w:'la souris',big:false,ok:'Oui ! Le renard est plus grand que la souris.'},
 {e:'🐈',w:'le chat',big:false,ok:'Oui ! Le renard est plus grand que le chat.'},
 {e:'🦔',w:'le hérisson',big:false,ok:'Oui ! Le renard est plus grand que le hérisson.'},
 {e:'🐰',w:'le lapin',big:false,ok:'Oui ! Le renard est plus grand que le lapin.'},
 {e:'🐺',w:'le loup',big:true,ok:'Oui ! Le loup est plus grand que le renard.'},
 {e:'🐴',w:'le cheval',big:true,ok:'Oui ! Le cheval est plus grand que le renard.'},
 {e:'🐻',w:'l’ours',big:true,ok:'Oui ! L’ours est plus grand que le renard.'}
];
const RENARD_ORDRE=[['🐭','la souris'],['🐈','le chat'],['🦊','le renard'],['🐴','le cheval']];
function renardTailleAsk(X){return 'Qui est le plus grand : le renard ou '+X.w+' ?';}
function renardTailleItem(ctx){
 if(ctx.i===ctx.n-1)return renardOrdreItem(ctx);
 const deck=ctx.bag.tailles||(ctx.bag.tailles=shuffle([...shuffle(RENARD_TAILLES.filter(x=>!x.big)).slice(0,2),...shuffle(RENARD_TAILLES.filter(x=>x.big)).slice(0,2)]));
 const X=deck[ctx.i%deck.length],ask=renardTailleAsk(X);
 return {cls:'renard-stage',say:ask,caption:ask,
  render(st,api){let target;
   const opts=shuffle([{e:'🦊',w:'le renard',ok:!X.big},{e:X.e,w:X.w,ok:X.big}]);
   const row=ecoleRow(2,opts.map(o=>{const b=h('button',{class:'card pic ecole-pic-card renard-size-card','aria-label':o.w},renardPic(o.e,o.w),h('small',null,o.w));if(o.ok)target=b;
    onTap(b,()=>api.answer(o.ok,{el:b,correctEl:target,praise:X.ok,feedback:X.big?'Non. Le renard est plus petit que '+X.w+'.':'Non. Le renard est plus grand que '+X.w+'.'}));return b;}));
   api.key(target);uWrap(st,row,onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(ask)));
  }};
}
function renardOrdreItem(ctx){
 const ask='Range-les du plus petit au plus grand. Touche d’abord le plus petit.';
 return {cls:'renard-stage',say:ask,caption:'Du plus petit au plus grand',
  render(st,api){
   let next=0;const slots=h('div',{class:'renard-order-line'},RENARD_ORDRE.map(()=>h('span',{class:'renard-slot'},'?')));
   const buttons={};
   const row=ecoleRow(4,shuffle(RENARD_ORDRE).map(([e,w])=>{const b=h('button',{class:'card pic ecole-pic-card','aria-label':w},renardPic(e,w),h('small',null,w));buttons[w]=b;
    onTap(b,async()=>{const want=RENARD_ORDRE[next];
     if(w!==want[1]){await api.step(false,{el:b,correctEl:buttons[want[1]],feedback:'Cherche le plus petit parmi ceux qui restent.'});return;}
     const slot=slots.children[next];slot.textContent='';slot.append(renardPic(e,w));slot.classList.add('filled');b.disabled=true;b.classList.add('used');next++;
     if(next===RENARD_ORDRE.length){api.answer(true,{praise:'Bravo ! La souris, le chat, le renard, puis le cheval.'});return;}
     await api.step(true,{el:b});api.key(buttons[RENARD_ORDRE[next][1]]);});return b;}));
   api.key(buttons[RENARD_ORDRE[0][1]]);uWrap(st,slots,row);
  }};
}

/* ---------- Où vit le renard ---------- */
const RENARD_LIEUX_OUI=[['🌲','la forêt','Oui ! Le renard vit dans la forêt.'],['🌾','les champs','Oui ! Le renard vit dans les champs.'],['🏙️','la ville','Oui ! Le renard vit aussi en ville.']];
const RENARD_LIEUX_NON=[['🌊','le fond de la mer','Non ! Le renard ne vit pas au fond de la mer.'],['☁️','les nuages','Non ! Le renard ne vit pas dans les nuages.']];
function renardChoiceItem(say,options,caption){
 return {cls:'renard-stage',say,caption:caption||(Array.isArray(say)?say.filter(x=>typeof x==='string').join(' '):say),
  render(st,api){let target;
   const row=ecoleRow(options.length,shuffle(options).map(o=>{const b=h('button',{class:'card pic ecole-pic-card renard-pic-card','aria-label':o.w},o.art?renardArt(o.art,'small'):renardPic(o.e,o.w),h('small',null,o.w));if(o.ok)target=b;
    onTap(b,()=>api.answer(!!o.ok,{el:b,correctEl:target,praise:o.praise,feedback:o.why}));return typeof ecoleChoiceWithAudio==='function'?ecoleChoiceWithAudio(b,o.w):b;}));
   api.key(target);uWrap(st,row,onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(say)));
  }};
}
const RENARD_MAISON=[
 ()=>renardChoiceItem('Où dort le renard ?',[{art:RENARD_TERRIER_SVG,w:'dans un terrier',ok:true,praise:'Oui ! Le renard dort dans un terrier.'},{e:'🪺',w:'dans un nid',why:'Non, le nid, c’est pour les oiseaux.'},{e:'🌊',w:'dans l’eau',why:'Non. Le renard sait nager, mais il ne dort pas dans l’eau.'}]),
 ctx=>{const used=ctx.bag.lieux||(ctx.bag.lieux=shuffle(RENARD_LIEUX_OUI));const [e,w,praise]=used[0];return renardChoiceItem('Touche un endroit où vit le renard.',[{e,w,ok:true,praise},...RENARD_LIEUX_NON.map(([e2,w2,why])=>({e:e2,w:w2,why}))]);},
 ctx=>{const used=ctx.bag.lieux||(ctx.bag.lieux=shuffle(RENARD_LIEUX_OUI));const [e,w,praise]=used[1];return renardChoiceItem('Touche un endroit où vit le renard.',[{e,w,ok:true,praise},...RENARD_LIEUX_NON.map(([e2,w2,why])=>({e:e2,w:w2,why}))]);},
 ()=>({cls:'renard-stage',say:'Est-ce que des renards vivent en ville ?',caption:'Des renards en ville ?',render(st,api){uWrap(st,renardPic('🏙️','la ville','big'),renardYesNoRow(api,true,'Oui ! Il y a même des renards à Bruxelles.',['Oui','Non'],'Si ! Il y a des renards en ville, même à Bruxelles.'));}}),
 ()=>({cls:'renard-stage',say:'Est-ce que le renard vit en Belgique ?',caption:'Le renard en Belgique ?',render(st,api){uWrap(st,renardPic('🌍','la Terre','big'),renardYesNoRow(api,true,'Oui ! Le renard vit en Belgique, et dans beaucoup d’autres pays.',['Oui','Non'],'Si ! Le renard vit en Belgique, et dans beaucoup d’autres pays.'));}}),
 ()=>renardChoiceItem('Qui a souvent creusé le terrier du renard ?',[{e:'🦡',w:'le blaireau',ok:true,praise:'Oui ! Le renard s’installe souvent dans un ancien terrier de blaireau.'},{e:'🐦',w:'l’oiseau',why:'Non. L’oiseau ne creuse pas de terrier.'},{e:'🐟',w:'le poisson',why:'Non. Le poisson vit dans l’eau.'}])
];
function renardMaisonItem(ctx){return RENARD_MAISON[ctx.i%RENARD_MAISON.length](ctx);}

/* ---------- Vrai ou faux ---------- */
const RENARD_VF=[
 {s:'Le renard vit surtout la nuit.',e:'🌙',v:true},
 {s:'Le renard entend une souris qui bouge dans l’herbe.',e:'👂',v:true},
 {s:'Pour attraper une souris, le renard fait un grand saut.',e:'🐭',v:true},
 {s:'Le bout de la queue du renard est blanc.',e:'🦊',v:true},
 {s:'Le renard sait nager.',e:'🌊',v:true},
 {s:'Le renard est un cousin du chien.',e:'🐕',v:true},
 {s:'Quand le renard crie, on dit qu’il glapit.',e:'🔊',v:true},
 {s:'Le bébé du renard s’appelle le renardeau.',e:'🦊',v:true},
 {s:'Le renard vole comme un oiseau.',e:'🐦',v:false,fix:'C’est faux ! Le renard ne vole pas. Il court très vite.'},
 {s:'Le renard dort dans un nid, en haut d’un arbre.',e:'🪺',v:false,fix:'C’est faux ! Le renard dort dans un terrier.'},
 {s:'Le renard est un cousin du chat.',e:'🐈',v:false,fix:'C’est faux ! Le renard est un cousin du chien et du loup.'},
 {s:'Le renard mange des cailloux.',e:'🪨',v:false,fix:'C’est faux ! Il mange surtout des souris.'},
 {s:'Le renard a des plumes.',e:'🐦',v:false,fix:'C’est faux ! Le renard a des poils : un pelage roux.'},
 {s:'Le bébé du renard s’appelle le chaton.',e:'🐈',v:false,fix:'C’est faux ! Le bébé du renard s’appelle le renardeau.'},
 {s:'Le renard chasse surtout le jour.',e:'☀️',v:false,fix:'C’est faux ! Le renard chasse surtout la nuit.'}
];
const RENARD_VF_VOICE={ask:'Vrai ou faux ?',yes:'Oui, c’est vrai !',wrongTrue:'En fait, c’est vrai ! Écoute encore.'};
function renardVraiFauxItem(ctx){
 const deck=ctx.bag.vf||(ctx.bag.vf=shuffle([...shuffle(RENARD_VF.filter(x=>x.v)).slice(0,4),...shuffle(RENARD_VF.filter(x=>!x.v)).slice(0,4)]));
 const X=deck[ctx.i%deck.length];
 return {cls:'renard-stage',say:[X.s,400,RENARD_VF_VOICE.ask],caption:X.s,
  render(st,api){uWrap(st,renardPic(X.e,'image','big'),h('p',{class:'renard-sentence'},X.s),onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say([X.s,400,RENARD_VF_VOICE.ask])),
   renardYesNoRow(api,X.v,X.v?RENARD_VF_VOICE.yes:X.fix,['Vrai','Faux'],RENARD_VF_VOICE.wrongTrue));}};
}

/* ---------- La comptine du renard (texte original) ---------- */
const RENARD_COMPTINE=[
 {l:'Petit renard au manteau roux',e:'🦊'},
 {l:'Oreilles pointues, museau tout doux',e:'👂'},
 {l:'Grande queue touffue au bout tout blanc',e:'⚪'},
 {l:'Il trotte, il trotte au bord des champs',e:'🌾'},
 {l:'La nuit, chut, il entend une souris',e:'🐭'},
 {l:'Hop, un grand saut, elle est partie !',e:'🐾'},
 {l:'Au petit matin, il rentre chez lui',e:'☀️'},
 {l:'Dans son terrier, bonne nuit !',e:'🌙'}
];
const RENARD_TROUS=[
 {line:2,start:'Grande queue touffue au bout tout…',ans:'blanc',opts:[['⚪','blanc'],['⚫','noir'],['🔴','rouge']]},
 {line:3,start:'Il trotte, il trotte au bord des…',ans:'champs',opts:[['🌾','champs'],['🏠','maisons'],['🌊','vagues']]},
 {line:4,start:'La nuit, chut, il entend une…',ans:'souris',opts:[['🐭','souris'],['🐔','poule'],['🐄','vache']]},
 {line:7,start:'Dans son terrier, bonne…',ans:'nuit',opts:[['🌙','nuit'],['☀️','journée'],['🌧️','pluie']]}
];
const RENARD_COMPTINE_VOICE={listen:'Écoute la comptine du renard.',gap:'Quel mot manque ?',echo:'À toi ! Répète chaque ligne après moi.',done:'Bravo, tu connais la comptine !'};
function renardComptineSay(withPauses){const out=[];RENARD_COMPTINE.forEach((x,i)=>{if(i)out.push(withPauses||450);out.push(x.l);});return out;}
function renardComptineCard(mark){return h('div',{class:'renard-poem'},RENARD_COMPTINE.map((x,i)=>h('p',{class:i===mark?'on':''},renardPic(x.e,''),' ',x.l)));}
function renardComptineItem(ctx){
 if(ctx.i===0)return {cls:'renard-stage',say:[RENARD_COMPTINE_VOICE.listen,500,...renardComptineSay()],caption:'La comptine du renard',
  render(st,api){uWrap(st,renardComptineCard(-1),h('div',{class:'renard-actions'},onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(renardComptineSay())),onTap(h('button',{class:'go-btn'},'Suivant',icon('next')),()=>api.finish(null))));}};
 if(ctx.i===ctx.n-1)return {cls:'renard-stage',say:[RENARD_COMPTINE_VOICE.echo,700,...renardComptineSay(2600)],caption:'Répète après Charline',
  render(st,api){uWrap(st,renardComptineCard(-1),h('div',{class:'renard-actions'},onTap(h('button',{class:'hint-btn'},icon('speaker'),'Recommencer'),()=>Voice.say([RENARD_COMPTINE_VOICE.echo,700,...renardComptineSay(2600)])),onTap(h('button',{class:'go-btn'},'J’ai répété',icon('next')),()=>{Voice.say(RENARD_COMPTINE_VOICE.done);api.finish(null);})));}};
 const T=RENARD_TROUS[(ctx.i-1)%RENARD_TROUS.length],full=RENARD_COMPTINE[T.line].l;
 return {cls:'renard-stage',say:[T.start,500,RENARD_COMPTINE_VOICE.gap],caption:T.start,
  render(st,api){let target;
   const row=ecoleRow(3,shuffle(T.opts).map(([e,w])=>{const b=h('button',{class:'card pic ecole-pic-card','aria-label':w},renardPic(e,w),h('small',null,w));if(w===T.ans)target=b;
    onTap(b,()=>api.answer(w===T.ans,{el:b,correctEl:target,praise:full,feedback:'Écoute bien la rime.'}));return typeof ecoleChoiceWithAudio==='function'?ecoleChoiceWithAudio(b,w):b;}));
   api.key(target);uWrap(st,renardComptineCard(T.line),onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say([T.start,500,RENARD_COMPTINE_VOICE.gap])),row);
  }};
}

/* ---------- L’exposé : répéter, puis présenter seul ---------- */
const RENARD_EXPOSE_PHRASES=[
 {pic:'🦊',name:'Bonjour',say:'Bonjour ! Mon animal totem, c’est le renard.'},
 {rub:'famille',say:'Le renard est un cousin du chien et du loup. Sa maman s’appelle la renarde, et ses bébés, les renardeaux.'},
 {rub:'corps',say:'Il a un pelage roux, des oreilles pointues et une grande queue touffue avec le bout blanc.'},
 {rub:'taille',say:'Avec sa queue, il mesure environ un mètre. Il est plus grand qu’un chat.'},
 {rub:'repas',say:'Il mange surtout des souris, mais aussi des lapins, des œufs, des insectes et des fruits.'},
 {rub:'maison',say:'Il vit dans les forêts et les champs, et même en ville. Il dort dans un terrier.'},
 {rub:'monde',say:'On le trouve en Belgique, et dans beaucoup de pays du monde.'},
 {rub:'dangers',say:'Le loup et le grand-duc peuvent l’attaquer. Mais son plus grand danger, ce sont les voitures.'},
 {rub:'special',say:'Il vit surtout la nuit. Il entend les souris dans l’herbe, et il fait un grand saut pour les attraper.'},
 {pic:'🙂',name:'Merci',say:'Merci de m’avoir écouté ! Avez-vous des questions ?'}
];
const RENARD_EXPOSE_VOICE={listen:'Écoute, puis répète.',alone:'À toi ! Que dis-tu pour cette image ?',start:'À toi ! Commence ton exposé.',end:'À toi ! Comment finis-tu ton exposé ?'};
function renardExposeCard(E){const R=E.rub?RENARD_RUBRIQUES.find(r=>r.id===E.rub):{pic:E.pic,name:E.name};return h('div',{class:'renard-expose-card'},renardPic(R.pic,R.name,'big'),h('b',null,R.name));}
function renardRepeteItem(ctx){
 const E=RENARD_EXPOSE_PHRASES[ctx.i];
 return {cls:'renard-stage',say:[RENARD_EXPOSE_VOICE.listen,400,E.say],caption:E.say,
  render(st,api){uWrap(st,renardExposeCard(E),h('div',{class:'renard-actions'},onTap(h('button',{class:'hint-btn'},icon('speaker'),'Encore'),()=>Voice.say(E.say)),onTap(h('button',{class:'go-btn'},'Je l’ai dit',icon('next')),()=>api.finish(null))));}};
}
function renardSeulItem(ctx){
 const E=RENARD_EXPOSE_PHRASES[ctx.i],ask=ctx.i===0?RENARD_EXPOSE_VOICE.start:ctx.i===ctx.n-1?RENARD_EXPOSE_VOICE.end:RENARD_EXPOSE_VOICE.alone;
 return {cls:'renard-stage',say:ask,caption:ask,
  render(st,api){let helped=false;
   uWrap(st,renardExposeCard(E),h('div',{class:'renard-actions'},onTap(h('button',{class:'hint-btn'},icon('speaker'),'Un indice'),()=>{helped=true;api.help();Voice.say(E.say);}),onTap(h('button',{class:'go-btn'},'Je l’ai dit',icon('next')),()=>api.finish(!helped))));}};
}

/* ---------- Le grand quiz : une question par case, un bilan par rubrique ---------- */
const RENARD_QUIZ=[
 {rub:'famille',q:'Qui est un cousin du renard ?',opts:[['🐕','le chien',1],['🐈','le chat'],['🐰','le lapin']],ok:'Oui ! Le chien est un cousin du renard.',no:'Non. Le renard est de la famille du chien et du loup.'},
 {rub:'famille',q:'Comment s’appelle le bébé du renard ?',opts:[['🦊','le renardeau',1],['🐈','le chaton'],['🐣','le poussin']],ok:'Oui ! Le bébé du renard, c’est le renardeau.',no:'Non. Le bébé du renard s’appelle le renardeau.'},
 {rub:'corps',q:'De quelle couleur est le bout de la queue du renard ?',opts:[['⚪','blanc',1],['⚫','noir'],['🔵','bleu']],ok:'Oui ! Le bout de sa queue est blanc.',no:'Non. Le bout de sa queue est blanc.'},
 {rub:'corps',q:'De quelle couleur est le pelage du renard ?',opts:[['🟠','roux',1],['🟢','vert'],['🔵','bleu']],ok:'Oui ! Le renard a un pelage roux.',no:'Non. Le renard a un pelage roux, presque orange.'},
 {rub:'taille',q:'Qui est plus grand que le renard ?',opts:[['🐺','le loup',1],['🐭','la souris'],['🐈','le chat']],ok:'Oui ! Le loup est plus grand que le renard.',no:'Non. Le renard est plus grand qu’un chat, mais plus petit qu’un loup.'},
 {rub:'repas',q:'Que mange surtout le renard ?',opts:[['🐭','des souris',1],['🍂','des feuilles'],['🪨','des cailloux']],ok:'Oui ! Le renard mange surtout des souris.',no:'Non. Le renard mange surtout des souris.'},
 {rub:'repas',q:'Le renard mange-t-il aussi des fruits ?',yesno:true,ans:true,e:'🫐',ok:'Oui ! Il mange aussi des fruits et des baies.',no:'Si ! Il mange aussi des fruits et des baies.'},
 {rub:'maison',q:'Où dort le renard ?',opts:[['terrier','dans un terrier',1],['🪺','dans un nid'],['🌊','dans l’eau']],ok:'Oui ! Le renard dort dans un terrier.',no:'Non. Le renard dort dans un terrier, sous la terre.'},
 {rub:'monde',q:'Y a-t-il des renards en Belgique ?',yesno:true,ans:true,e:'🌍',ok:'Oui ! Il y a des renards en Belgique, même à Bruxelles.',no:'Si ! Il y a des renards en Belgique, même à Bruxelles.'},
 {rub:'dangers',q:'Quel est le plus grand danger pour le renard ?',opts:[['🚗','la voiture',1],['🦋','le papillon'],['🐌','l’escargot']],ok:'Oui ! Les voitures sont le plus grand danger pour le renard.',no:'Non. Le plus grand danger pour le renard, ce sont les voitures.'},
 {rub:'special',q:'Quand le renard chasse-t-il surtout ?',opts:[['🌙','la nuit',1],['☀️','le jour']],ok:'Oui ! Le renard chasse surtout la nuit.',no:'Non. Le renard chasse surtout la nuit.'},
 {rub:'special',q:'Avec quoi le renard entend-il la souris ?',opts:[['👂','ses oreilles',1],['👃','son nez'],['👀','ses yeux']],ok:'Oui ! Avec ses grandes oreilles.',no:'Non. Il entend avec ses grandes oreilles.'}
];
const RENARD_QUIZ_VOICE={start:'Le grand quiz du renard ! Réponds du mieux que tu peux.',end:'Bravo, tu as fini le grand quiz ! Regarde ton bilan.'};
function renardQuizScoreSay(k,n){return 'Tu as trouvé '+(k===1?'une':nw(k))+' réponse'+(k>1?'s':'')+' du premier coup, sur '+nw(n)+'.';}
function renardQuizItem(ctx){
 const order=ctx.bag.quiz||(ctx.bag.quiz=shuffle(RENARD_QUIZ.map((_,i)=>i))),results=ctx.bag.first||(ctx.bag.first={});
 if(ctx.i===ctx.n-1)return renardBilanItem(ctx);
 const Q=RENARD_QUIZ[order[ctx.i]],qi=order[ctx.i];
 const say=ctx.i===0?[RENARD_QUIZ_VOICE.start,500,Q.q]:Q.q;
 return {cls:'renard-stage',say,caption:Q.q,
  render(st,api){let tried=false;
   const record=ok=>{if(!tried){tried=true;results[qi]=!!ok;}};
   if(Q.yesno){const row=renardYesNoRow({...api,answer:(ok,o)=>{record(ok);return api.answer(ok,o);},key:api.key},Q.ans,Q.ok,['Oui','Non'],Q.no);
    uWrap(st,renardPic(Q.e,'image','big'),onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(Q.q)),row);return;}
   let target;
   const row=ecoleRow(Q.opts.length,shuffle(Q.opts).map(([e,w,good])=>{const b=h('button',{class:'card pic ecole-pic-card renard-pic-card','aria-label':w},e==='terrier'?renardArt(RENARD_TERRIER_SVG,'small'):renardPic(e,w),h('small',null,w));if(good)target=b;
    onTap(b,()=>{record(!!good);api.answer(!!good,{el:b,correctEl:target,praise:Q.ok,feedback:Q.no});});return typeof ecoleChoiceWithAudio==='function'?ecoleChoiceWithAudio(b,w):b;}));
   api.key(target);uWrap(st,row,onTap(h('button',{class:'hint-btn'},icon('speaker'),'Réécouter'),()=>Voice.say(Q.q)));
  }};
}
function renardQuizBilan(results){
 const by={};RENARD_RUBRIQUES.forEach(R=>by[R.id]={n:0,ok:0});
 RENARD_QUIZ.forEach((Q,i)=>{if(i in results){by[Q.rub].n++;if(results[i])by[Q.rub].ok++;}});
 const ok=Object.values(results).filter(Boolean).length;return {ok,n:Object.keys(results).length,by};
}
const RENARD_REVOIR={famille:'Je découvre',corps:'Le corps du renard',taille:'Grand ou petit ?',repas:'Le repas du renard',maison:'Où vit le renard ?',monde:'Où vit le renard ?',dangers:'Amis ou dangers ?',special:'Vrai ou faux ?'};
function renardBilanItem(ctx){
 const B=renardQuizBilan(ctx.bag.first||{});
 return {cls:'renard-stage',say:[RENARD_QUIZ_VOICE.end,400,renardQuizScoreSay(B.ok,RENARD_QUIZ.length)],caption:'Ton bilan',
  render(st,api){
   const p=P();p.renardQuiz=[...(p.renardQuiz||[]),{at:Date.now(),ok:B.ok,n:RENARD_QUIZ.length,by:B.by}].slice(-20);save();
   const grid=h('div',{class:'renard-bilan'},RENARD_RUBRIQUES.map(R=>{const r=B.by[R.id],good=r.n&&r.ok===r.n;
    return h('div',{class:'renard-bilan-row '+(good?'good':'again')},renardPic(R.pic,R.name),h('b',null,R.name),h('span',{class:'renard-bilan-mark'},good?'✓':'à revoir'),good?null:h('small',null,'→ '+RENARD_REVOIR[R.id]));}));
   uWrap(st,h('div',{class:'renard-score'},B.ok+' / '+RENARD_QUIZ.length),grid,onTap(h('button',{class:'go-btn'},'Terminer',icon('next')),()=>api.finish(null)));
  }};
}

/* ---------- Les activités et le menu ---------- */
const RENARD_ACTIVITES=[
 {id:'decouvre',title:'Je découvre le renard',pic:'👀',n:8,make:renardDecouvreItem},
 {id:'corps',title:'Le corps du renard',pic:'🦊',n:6,make:renardCorpsItem},
 {id:'taille',title:'Grand ou petit ?',pic:'📏',n:5,make:renardTailleItem},
 {id:'repas',title:'Le repas du renard',pic:'🍽️',n:8,make:renardRepasItem},
 {id:'maison',title:'Où vit le renard ?',pic:'🌲',n:6,make:renardMaisonItem},
 {id:'dangers',title:'Amis ou dangers ?',pic:'⚠️',n:6,make:renardDangersItem},
 {id:'vraifaux',title:'Vrai ou faux ?',pic:'⭐',n:8,make:renardVraiFauxItem},
 {id:'comptine',title:'La comptine du renard',pic:'🎵',n:6,make:renardComptineItem},
 {id:'repete',title:'Je répète mon exposé',pic:'🎤',n:10,make:renardRepeteItem},
 {id:'seul',title:'Je présente tout seul',pic:'🎤',n:10,make:renardSeulItem},
 {id:'quiz',title:'Le grand quiz',pic:'🏆',n:13,make:renardQuizItem}
];
const RENARD_MENU_VOICE={open:'Prépare ton exposé sur le renard. Choisis un jeu.'};
function renardDaysLeft(now=new Date()){const a=new Date(now.getFullYear(),now.getMonth(),now.getDate()),b=new Date(RENARD_EXPOSE.date+'T00:00:00');return Math.round((b-a)/86400000);}
function renardMenu(){
 const ov=ovScreen('Mon exposé : le renard',null,'renard-menu');const gp=gameProg('renard'),days=renardDaysLeft(),last=(P().renardQuiz||[]).slice(-1)[0];
 ov.body.append(h('div',{class:'renard-head'},renardArt(RENARD_FOX_SVG,'mini'),h('div',null,
  h('p',{class:'u-note'},days>1?'Exposé le '+RENARD_EXPOSE.jour+' : encore '+days+' jours.':days===1?'Exposé demain, '+RENARD_EXPOSE.jour+' !':days===0?'C’est le jour de l’exposé !':'Exposé du '+RENARD_EXPOSE.jour),
  last?h('p',{class:'u-note'},'Dernier grand quiz : '+last.ok+' / '+last.n):null)));
 const list=h('div',{class:'renard-acts'});
 RENARD_ACTIVITES.forEach((A,k)=>{const done=(gp.best||{})[k];
  list.append(onTap(h('button',{class:'renard-act'+(done?' done':''),'aria-label':A.title},renardPic(A.pic,A.title),h('span',null,A.title),done?h('span',{class:'renard-done','aria-label':'déjà joué'},'✓'):null),()=>{ov.el.remove();renardRun(k);}));});
 ov.body.append(list,h('p',{class:'u-note renard-parents'},onTap(h('button',{class:'ubtn'},'🖨️ Fiche à imprimer (parents)'),()=>{try{window.open('renard/fiche.html','_blank');}catch(_){}})));
 Voice.say(RENARD_MENU_VOICE.open);
}
async function renardRun(k){
 const A=RENARD_ACTIVITES[k];if(!A)return;if(typeof Sfx!=='undefined'&&Sfx.ensure)Sfx.ensure();
 const run={gid:'renard',levelIndex:k,key:'game:renard',abort:false,res:[]};RUN=run;
 Shell.open({bg:'#fff4e6',level:A.title,onClose:renardMenu});Shell.setDots(A.n);
 const ctx={g:GAMES.renard,A,k,i:0,n:A.n,used:[],bag:{}};
 for(let i=0;i<A.n;i++){
  ctx.i=i;Shell.now(i);let item;
  try{item=A.make(ctx);}catch(e){console.error('renard',e);item={say:'Tu peux passer cet exercice.',render(st,api){st.append(h('p',{class:'u-note'},'Cet exercice ne se charge pas.'),onTap(h('button',{class:'go-btn'},'Passer l’exercice →'),api.skip));}};}
  const r=await Engine.play(item,run);if(run.abort||RUN!==run)return;run.res.push(r);
  if(r.first!=null){Shell.mark(i,r.first?'ok':'half');recordSkill('renard:'+A.id,r.first);}else Shell.mark(i,r.skipped?'skipped':'ok');
 }
 if(run.abort||RUN!==run)return;
 const gp=gameProg('renard'),{stars}=scoreOf(run.res);gp.rounds=(gp.rounds||0)+1;gp.best=gp.best||{};gp.best[k]=Math.max(gp.best[k]||0,stars);
 const sticker=addStars(stars);save();
 Celebrate.show({stars,sticker,next:k+1<RENARD_ACTIVITES.length?()=>renardRun(k+1):null,again:()=>renardRun(k),home:()=>Shell.close()});
}
GAMES.renard={id:'renard',title:'Mon exposé : le renard',sub:'Préparer l’exposé du 14 décembre',icon:'🦊',color:'orange',stage:'#fff4e6',open:renardMenu};
SIMPLE_GAME_NAMES.renard='Mon exposé : le renard';
if(!WORLD_TILES.grands.includes('renard'))WORLD_TILES.grands.push('renard');
{const t=THEMES.grands.find(x=>x.id==='decouvrir');if(t&&!t.ids.includes('renard'))t.ids.unshift('renard');}
if(typeof THEME_DIFFICULTY_ORDER!=='undefined'&&THEME_DIFFICULTY_ORDER.grands&&THEME_DIFFICULTY_ORDER.grands.decouvrir&&!THEME_DIFFICULTY_ORDER.grands.decouvrir.includes('renard'))THEME_DIFFICULTY_ORDER.grands.decouvrir.unshift('renard');

/* ---------- Toutes les phrases que Charline doit avoir enregistrées ---------- */
function renardVoiceLines(){
 const out=[];const add=(...xs)=>xs.flat(4).forEach(x=>{if(typeof x==='string'&&x.trim())out.push(x);});
 const walk=v=>{if(typeof v==='string')add(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};
 Object.values(RENARD_FAITS).forEach(F=>add(F.say));
 RENARD_PARTIES.forEach(x=>add(x.ask,x.ok));walk(RENARD_PART_NAMES);add('Cherche encore.','Regarde, c’est là où ça brille. Touche-le !');
 [...RENARD_REPAS,...RENARD_DANGERS].forEach(x=>add(x.w,x.why));walk(RENARD_Q);
 RENARD_TAILLES.forEach(X=>add(renardTailleAsk(X),X.ok,'Non. Le renard est plus petit que '+X.w+'.','Non. Le renard est plus grand que '+X.w+'.',X.w));
 add('le renard','Range-les du plus petit au plus grand. Touche d’abord le plus petit.','Cherche le plus petit parmi ceux qui restent.','Bravo ! La souris, le chat, le renard, puis le cheval.');RENARD_ORDRE.forEach(([,w])=>add(w));
 add('Où dort le renard ?','Touche un endroit où vit le renard.','Est-ce que des renards vivent en ville ?','Est-ce que le renard vit en Belgique ?','Qui a souvent creusé le terrier du renard ?');
 add('dans un terrier','Oui ! Le renard dort dans un terrier.','dans un nid','Non, le nid, c’est pour les oiseaux.','dans l’eau','Non. Le renard sait nager, mais il ne dort pas dans l’eau.');
 [...RENARD_LIEUX_OUI,...RENARD_LIEUX_NON].forEach(([,w,s])=>add(w,s));
 add('Oui ! Il y a même des renards à Bruxelles.','Si ! Il y a des renards en ville, même à Bruxelles.','Oui ! Le renard vit en Belgique, et dans beaucoup d’autres pays.','Si ! Le renard vit en Belgique, et dans beaucoup d’autres pays.');
 add('le blaireau','Oui ! Le renard s’installe souvent dans un ancien terrier de blaireau.','l’oiseau','Non. L’oiseau ne creuse pas de terrier.','le poisson','Non. Le poisson vit dans l’eau.');
 RENARD_VF.forEach(x=>add(x.s,x.fix));walk(RENARD_VF_VOICE);
 RENARD_COMPTINE.forEach(x=>add(x.l));RENARD_TROUS.forEach(T=>{add(T.start);T.opts.forEach(([,w])=>add(w));});walk(RENARD_COMPTINE_VOICE);add('Écoute bien la rime.');
 RENARD_EXPOSE_PHRASES.forEach(E=>add(E.say));walk(RENARD_EXPOSE_VOICE);
 RENARD_QUIZ.forEach(Q=>{add(Q.q,Q.ok,Q.no);(Q.opts||[]).forEach(([,w])=>add(w));});walk(RENARD_QUIZ_VOICE);
 for(let k=0;k<=RENARD_QUIZ.length;k++)add(renardQuizScoreSay(k,RENARD_QUIZ.length));
 walk(RENARD_MENU_VOICE);add('Tu peux passer cet exercice.');
 return uniq(out);
}

/* ---------- Mise en page ---------- */
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent=`
.renard-stage .upgrade-wrap{gap:14px;align-items:center}
.renard-art{display:inline-flex;justify-content:center}
.renard-art svg{display:block;width:100%;height:auto}
.renard-art.big{width:min(560px,86vw)}
.renard-art.terrier{width:min(300px,60vw)}
.renard-art.small{width:110px}
.renard-art.mini{width:120px}
.renard-art.tap svg [data-part]{cursor:pointer}
.renard-art.tap svg [data-part]:hover{filter:brightness(1.08)}
.renard-art svg [data-part].reveal{animation:renard-glow 1s ease-in-out infinite alternate}
.renard-art svg [data-part].ok-flash{filter:drop-shadow(0 0 8px #3fb36b)}
.renard-art svg [data-part].shake{filter:drop-shadow(0 0 6px #d1491f)}
@keyframes renard-glow{from{filter:drop-shadow(0 0 2px #f1c94a)}to{filter:drop-shadow(0 0 12px #f1a51a)}}
.renard-badge{display:flex;align-items:center;gap:12px;background:#fff;border-radius:999px;padding:6px 22px 6px 10px;box-shadow:0 4px 0 rgba(31,46,69,.10);font-size:clamp(22px,4vw,30px)}
.renard-badge .ecole-pic{font-size:44px}
.renard-badge b{font-weight:400}
.renard-facts{max-width:min(640px,92vw);background:#fff;border-radius:20px;padding:6px 18px;font-size:clamp(17px,2.6vw,21px);line-height:1.5;color:#3d4a5c}
.renard-facts p{margin:8px 0}
.renard-chips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.renard-chips.col{flex-direction:column}
.renard-chip{display:inline-flex;flex-direction:column;align-items:center;gap:2px;background:#fff;border-radius:18px;padding:8px 12px;min-width:92px}
.renard-chip .ecole-pic{font-size:52px}
.renard-chip small{font-size:16px;color:#55647b}
.renard-sizes{display:flex;align-items:flex-end;gap:14px}
.renard-sizes .renard-chip .ecole-pic{font-size:inherit}
.renard-line{display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center}
.renard-actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.renard-pic-card small,.renard-size-card small,.ecole-pic-card small{display:block;font-size:17px;color:#55647b;margin-top:4px}
.renard-stage .ecole-pic-card{min-width:132px;flex-direction:column}
.renard-stage .ecole-pic-card .ecole-pic{font-size:clamp(64px,10vw,92px);background:#f6efe6;border-radius:24px;padding:6px}
.renard-size-card{min-width:170px}
.renard-size-card .ecole-pic{font-size:clamp(80px,13vw,120px)!important}
.renard-yesno .renard-yn{min-width:140px;min-height:110px;flex-direction:column;gap:2px}
.renard-yn-sym{font-size:52px;line-height:1;font-family:system-ui,sans-serif!important}
.renard-yn.yes .renard-yn-sym{color:#2b8050}.renard-yn.no .renard-yn-sym{color:#c0392b}
.renard-yn-word{font-size:24px}
.renard-sentence{max-width:min(620px,92vw);background:#fff;border-radius:20px;padding:8px 20px 12px;font-size:clamp(20px,3.4vw,28px);text-align:center;margin:0}
.renard-order-line{display:flex;gap:12px}
.renard-slot{width:84px;height:84px;border-radius:18px;border:3px dashed #9fb0c6;background:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;color:#9fb0c6}
.renard-slot.filled{border-style:solid;border-color:#3fb36b}
.renard-slot .ecole-pic{font-size:54px}
.card.used{opacity:.3}
.renard-poem{background:#fff;border-radius:22px;padding:8px 22px;max-width:min(640px,94vw);font-size:clamp(17px,2.8vw,23px);line-height:1.45}
.renard-poem p{margin:4px 0;display:flex;align-items:center;gap:8px}
.renard-poem p .ecole-pic{font-size:26px;background:#f3ece2;border-radius:50%;padding:3px}
.renard-poem p.on{background:#fff0b0;border-radius:10px}
.renard-expose-card{display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff;border-radius:28px;padding:18px 40px;box-shadow:0 6px 0 rgba(31,46,69,.10)}
.renard-expose-card .ecole-pic.big{font-size:clamp(110px,20vw,170px)}
.renard-expose-card b{font-weight:400;font-size:clamp(24px,4vw,34px)}
.renard-score{font-size:clamp(44px,8vw,64px);background:#fff;border-radius:22px;padding:0 26px 6px}
.renard-bilan{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:min(680px,94vw);width:100%}
.renard-bilan-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 10px;background:#fff;border-radius:16px;padding:6px 12px}
.renard-bilan-row .ecole-pic{font-size:34px;grid-row:span 2}
.renard-bilan-row b{font-weight:400;font-size:18px}
.renard-bilan-row small{grid-column:2/4;font-size:14px;color:#8a5a12}
.renard-bilan-mark{font-size:16px;color:#2b8050}
.renard-bilan-row.again{background:#fff6e3}.renard-bilan-row.again .renard-bilan-mark{color:#b46a1f}
.renard-head{display:flex;align-items:center;gap:14px;justify-content:center;flex-wrap:wrap}
.renard-acts{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;max-width:900px;margin:10px auto}
.renard-act{position:relative;display:flex;align-items:center;gap:12px;min-height:84px;padding:10px 16px;border-radius:20px;border:0;background:#fff;box-shadow:0 5px 0 rgba(31,46,69,.12);font-size:clamp(18px,2.4vw,22px);text-align:left;cursor:pointer}
.renard-act .ecole-pic{font-size:46px}
.renard-act.done{background:#eef8ee}
.renard-done{position:absolute;top:6px;right:10px;color:#2b8050;font-size:22px;font-family:system-ui,sans-serif!important}
.renard-parents{text-align:center;margin-top:14px}
@media(max-width:600px){.renard-bilan{grid-template-columns:1fr}.renard-yesno .renard-yn{min-width:120px}}
@media(prefers-reduced-motion:reduce){.renard-art svg [data-part].reveal{animation:none}}
`;document.head.append(style);}
