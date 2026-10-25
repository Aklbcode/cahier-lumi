/* Compléments du programme — maternelle et 1re primaire (25 octobre 2026).
   Inspirés de l’analyse des parcours d’une application scolaire du marché :
   seuls les MÉCANISMES sont repris (petites étapes, consigne orale, essai
   sans pénalité, aide vocale à la demande, révision en spirale).
   Mots, phrases, dessins et progressions sont originaux à Lumi et suivent
   les attendus de la Fédération Wallonie-Bruxelles (nombres à la belge). */

const ECOLE_LABELS={help:'Aide',intro:'J’ai compris',replay:'Réécouter'};
const ECOLE_VOICE={
 helpWord:'Écoute encore le mot.',
 mirrorAsk:'Quelle lettre manque dans ce mot ?',
 mirrorSame:'Si les deux lettres sont pareilles, touche le signe égal. Sinon, touche le signe barré.',
 mirrorSameYes:'Oui, elles sont pareilles.',mirrorSameNo:'Oui, elles sont différentes.',
 mirrorSameWrong:'Regarde bien le sens de chaque lettre.',
 graphComplete:'Complète le mot avec les bonnes lettres.',graphCompleteWrong:'Regarde comment ce mot était écrit tout à l’heure.',
 mirrorWrong:'Regarde bien la forme de la lettre, et écoute encore le mot.',
 mirrorRule:{
  b:'Pour écrire b, on trace d’abord le grand trait, puis le ventre.',
  d:'Pour écrire d, on trace d’abord le ventre, puis le grand trait.',
  p:'Pour écrire p, on trace d’abord le trait qui descend, puis le ventre.',
  q:'Pour écrire q, on trace d’abord le ventre, puis le trait qui descend.'
 },
 graphHear:'Touche le mot que tu entends.',
 graphRead:'Lis le mot, puis touche la bonne image.',
 graphWrongHear:'Ce n’est pas ce mot. Lis bien chaque partie du mot.',
 graphWrongRead:'Ce n’est pas cette image. Relis le mot.',
 genderAsk:{un:'Un ou une ?',le:'Le ou la ?'},
 genderWrong:'Dis les deux à voix haute. Lequel sonne juste ?',
 pronounAsk:'Il ou elle ?',
 pronounWrong:'Regarde bien l’image. Est-ce un garçon ou une fille, un homme ou une femme ?',
 numberAsk:'Regarde l’image : un seul, ou plusieurs ? Lis bien et choisis.',
 numberWrong:'Compte les images. Quand il y en a plusieurs, on écrit des ou les, et un s à la fin.',
 phraseAsk:'Remets les mots dans l’ordre pour faire une phrase. Le premier mot commence par une majuscule.',
 phraseNext:'Lis encore. Quel mot vient ensuite ?',
 phraseFirst:'Cherche le mot qui commence par une majuscule.',
 houseWrong:'Compte les points. Combien en manque-t-il pour remplir la maison ?',
 houseAll:'Remplis tous les étages de la maison. Chaque étage fait le nombre du toit.',
 houseDone:'Tous les étages sont remplis !',
 houseKey:'Tape le nombre qui manque.',
 wordToDigit:'Lis le nombre écrit en lettres. Touche le bon nombre.',
 hearToWord:'Écoute le nombre. Touche le mot qui l’écrit.',
 digitToWord:'Touche le mot qui correspond à ce nombre.',
 numberWordWrong:'Relis le mot, lettre après lettre.',
 calendarWrong:'Récite les jours dans l’ordre : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.',
 monthWrong:'Récite les mois dans l’ordre, depuis janvier.',
 calendarAsk:'Quel jour de la semaine est la date entourée ?',
 calendarGridWrong:'Suis la colonne de la date jusqu’en haut du calendrier.',
 seasonWrong:'Pense au temps qu’il fait pendant ce mois.',
 shapeWrong:'Regarde les côtés et les pointes de chaque figure.',
 sidesAsk:'Combien de côtés a cette figure ?',
 cornersAsk:'Combien de sommets a cette figure ? Les sommets, ce sont ses pointes.',
 countWrong:'Compte en touchant chaque côté avec ton doigt.',
 cornerWrong:'Compte en touchant chaque pointe avec ton doigt.',
 solidWrong:'Regarde bien la forme : est-elle ronde, plate ou pointue ?',
 rollAsk:'Touche le solide qui peut rouler.',
 rollWrong:'Ce solide a des faces plates partout. Il glisse, mais il ne roule pas.',
 modelAsk:'Regarde le modèle. Quelle couleur va dans la case qui brille ?',
 modelWrong:'Regarde la même case sur le modèle.',
 modelDone:'Tu as copié le modèle !',
 modelError:'Regarde le modèle, puis la copie. Une case n’a pas la bonne couleur. Touche-la.',
 modelErrorWrong:'Cette case est pareille sur le modèle. Cherche encore.',modelErrorDone:'Oui, c’est cette case qui n’est pas pareille !',
 oppositeWrong:'Cherche ce qui est tout l’inverse.',
 pairWrong:'Réfléchis : à quoi sert cet objet ?',
 detailAsk:'Regarde le modèle en haut. Touche le dessin qui est tout pareil.',
 detailWrong:'Regarde bien : ce dessin a une petite différence.',
 detailDone:'Oui, c’est exactement le même !'
};

/* ---------- Outils communs ---------- */
function ecoleHelp(api,say){
 if(api.exam)return null;
 return onTap(h('button',{class:'hint-btn ecole-help','aria-label':ECOLE_LABELS.help},icon('speaker'),ECOLE_LABELS.help),()=>{api.help();if(typeof Voice.slower==='function')Voice.slower(()=>Voice.say(say));else Voice.say(say);});
}
function ecolePic(emoji,label,size){
 const p=h('span',{class:'ecole-pic'+(size?' '+size:''),role:'img','aria-label':label},typeof lumiIllustration==='function'?lumiIllustration(emoji,label):emoji);
 return p;
}
function ecoleMoveKey(api,prev,next){if(prev&&prev.dataset&&prev.dataset.key)delete prev.dataset.key;api.key(next);return next;}
function ecoleTextCard(text,label,cls=''){return h('button',{class:'card txt ecole-word-card '+cls,'aria-label':label||text},h('span',{class:'ecole-card-text'},text));}
function ecolePicCard(emoji,label){const b=h('button',{class:'card pic ecole-pic-card','aria-label':label},ecolePic(emoji,label));return b;}
function ecoleRow(n,...kids){return h('div',{class:'row ecole-choices'+(n>=4?' four':'')},...kids);}
function ecoleFresh(ctx,pool,keyOf=x=>x){
 const used=ctx.used||[];const fresh=pool.filter(x=>!used.includes(keyOf(x)));const choice=pick(fresh.length?fresh:pool);
 if(ctx.used)ctx.used.push(keyOf(choice));return choice;
}
function ecoleLevels(prefix,tag,list){return list.map((L,i)=>({n:6,...L,skill:'ecole:'+prefix+':'+i,tag,ref:L.ref||L.name}));}
function ecoleRegister(id,game,world,theme,after){
 GAMES[id]={id,color:game.color||'sky',stage:game.stage||'#f5f8fc',...game};
 SIMPLE_GAME_NAMES[id]=game.title;
 if(!WORLD_TILES[world].includes(id))WORLD_TILES[world].push(id);
 const t=THEMES[world].find(x=>x.id===theme);if(t&&!t.ids.includes(id))t.ids.push(id);
 const order=typeof THEME_DIFFICULTY_ORDER!=='undefined'&&THEME_DIFFICULTY_ORDER[world]&&THEME_DIFFICULTY_ORDER[world][theme];
 if(order&&!order.includes(id)){const at=after?order.indexOf(after):-1;if(at>=0)order.splice(at+1,0,id);else order.push(id);}
}

/* =========================================================
   LUCA — Lire
   ========================================================= */

/* ---------- 1. Les lettres miroirs : b/d, p/q ---------- */
const ECOLE_MIRROR_WORDS={
 bStart:[['bol','🥣'],['banane','🍌'],['ballon','🎈'],['bus','🚌'],['bateau','⛵'],['bougie','🕯️'],['biscuit','🍪']],
 dStart:[['dé','🎲'],['dent','🦷'],['diamant','💎'],['dragon','🐉'],['dauphin','🐬'],['douche','🚿']],
 bMid:[['robe','👗'],['arbre','🌳'],['zèbre','🦓'],['tambour','🥁'],['abeille','🐝'],['robot','🤖']],
 dMid:[['cadeau','🎁'],['radio','📻'],['salade','🥗'],['crocodile','🐊'],['sandale','🩴'],['tornade','🌪️']],
 p:[['pomme','🍎'],['poule','🐔'],['pied','🦶'],['pizza','🍕'],['poire','🍐'],['pingouin','🐧']],
 q:[['quatre','4️⃣'],['coq','🐓'],['cinq','5️⃣'],['quille','🎳'],['requin','🦈'],['moustique','🦟'],['casquette','🧢']]
};
function ecoleMirrorEntries(keys,letterOf){return keys.flatMap(k=>ECOLE_MIRROR_WORDS[k].map(([w,e])=>({w,e,letter:letterOf(k)})));}
const ECOLE_MIRROR_LEVEL_POOLS=[
 {pool:()=>ecoleMirrorEntries(['bStart','dStart'],k=>k[0]),opts:['b','d']},
 {pool:()=>ecoleMirrorEntries(['bMid','dMid'],k=>k[0]),opts:['b','d']},
 {pool:()=>ecoleMirrorEntries(['p','q'],k=>k),opts:['p','q']},
 {pool:()=>ecoleMirrorEntries(['bStart','dStart','bMid','dMid','p','q'],k=>k[0]),opts:['b','d','p','q']}
];
function ecoleMirrorSameItem(ctx){
 const a=pick(['b','d','p','q']),same=Math.random()<.5,b=same?a:pick(['b','d','p','q'].filter(x=>x!==a));
 return {cls:'ecole-stage ecole-mirror',say:ECOLE_VOICE.mirrorSame,caption:'Pareilles ou différentes ?',exemplar:'miroir-pareil:'+a+b,
  render(st,api){let target;
   const row=ecoleRow(2,[['=',true],['≠',false]].map(([sym,v])=>{const btn=ecoleTextCard(sym,v?'pareilles':'différentes','ecole-letter-card');if(v===same)target=btn;
    onTap(btn,()=>api.answer(v===same,{el:btn,correctEl:target,feedback:ECOLE_VOICE.mirrorSameWrong,praise:same?ECOLE_VOICE.mirrorSameYes:ECOLE_VOICE.mirrorSameNo}));return btn;}));
   api.key(target);uWrap(st,h('div',{class:'ecole-letter-pair'},h('span',null,a),h('span',null,b)),row);}};
}
function ecoleMirrorItem(ctx){
 if(ctx.L.same)return ecoleMirrorSameItem(ctx);
 const spec=ECOLE_MIRROR_LEVEL_POOLS[ctx.L.pool],W=ecoleFresh(ctx,spec.pool(),x=>x.w),gap=W.w.indexOf(W.letter);
 return {cls:'ecole-stage ecole-mirror',say:[W.w,350,ECOLE_VOICE.mirrorAsk],caption:'Quelle lettre manque ?',exemplar:'miroir:'+W.w,
  render(st,api){
   const word=h('div',{class:'ecole-gap-word','aria-label':'mot à compléter'},[...W.w].map((c,i)=>i===gap?h('span',{class:'ecole-gap'},'?'):h('span',null,c)));
   const gapEl=word.querySelector?word.querySelector('.ecole-gap'):null;
   let target;
   const row=ecoleRow(spec.opts.length,shuffle(spec.opts).map(letter=>{const b=ecoleTextCard(letter,'lettre '+letter,'ecole-letter-card');if(letter===W.letter)target=b;
    onTap(b,()=>api.answer(letter===W.letter,{el:b,correctEl:target,feedback:letter===W.letter?null:[ECOLE_VOICE.mirrorWrong],reveal:ECOLE_VOICE.mirrorRule[W.letter],praise:['Oui !',W.w],sfx:'good'}).then(ok=>{if(ok&&gapEl){gapEl.textContent=W.letter;gapEl.classList.add('filled');}}));return b;}));
   api.key(target);
   uWrap(st,h('div',{class:'ecole-picture-line'},ecolePic(W.e,W.w,'big'),word),ecoleHelp(api,W.w),row);
  }};
}
ecoleRegister('lettresMiroir',{title:'Les lettres miroirs',sub:'Ne plus confondre b, d, p et q',icon:'🪞',color:'plum',stage:'#f4f0fa',
 levels:ecoleLevels('miroir','P1',[{same:true,name:'Pareilles ou différentes ?'},{pool:0,name:'b ou d au début du mot'},{pool:1,name:'b ou d au milieu du mot'},{pool:2,name:'p ou q'},{pool:3,name:'b, d, p ou q'}]),make:ecoleMirrorItem},'grands','lire','balade');

/* ---------- 2. Les sons qui s’écrivent autrement ---------- */
const ECOLE_VOWEL_CHARS='aeiouyéèêëâàîïôûù';
function ecoleGraphRanges(id,w){
 const out=[];const add=(i,n)=>out.push([i,i+n]);
 const scan=(token)=>{let i=w.indexOf(token);while(i>=0){add(i,token.length);i=w.indexOf(token,i+token.length);}};
 if(id==='au'){let i=0;while(i<w.length){if(w.startsWith('eau',i)){add(i,3);i+=3;}else if(w.startsWith('au',i)){add(i,2);i+=2;}else i++;}}
 else if(id==='ai'){scan('ai');scan('ei');}
 else if(id==='er'){if(/er$|ez$/.test(w))add(w.length-2,2);}
 else if(id==='c'){for(let i=0;i<w.length;i++){if(w[i]==='ç'||w[i]==='c'&&'eiyéèê'.includes(w[i+1]||''))add(i,1);}}
 else if(id==='g'){for(let i=0;i<w.length;i++){if(w[i]==='g'&&'eiyéèê'.includes(w[i+1]||''))add(i,1);}}
 else if(id==='s'){for(let i=1;i<w.length-1;i++){if(w[i]==='s'&&ECOLE_VOWEL_CHARS.includes(w[i-1])&&ECOLE_VOWEL_CHARS.includes(w[i+1]))add(i,1);}}
 else if(id==='gn')scan('gn');
 else if(id==='ill')scan('ill');
 else if(id==='ph')scan('ph');
 return out.sort((a,b)=>a[0]-b[0]);
}
const ECOLE_GRAPH_FAMILIES=[
 {id:'au',name:'au et eau',sound:'o',anchor:['bateau','⛵'],rule:()=>['Quand tu vois a u, ou e a u, tu entends',ecoleVowel('o'),300,'comme dans bateau.'],
  words:[['bateau','⛵'],['gâteau','🍰'],['chapeau','👒'],['oiseau','🐦'],['château','🏰'],['cadeau','🎁'],['auto','🚗'],['taureau','🐂'],['chaussette','🧦']]},
 {id:'ai',name:'ai et ei',sound:'è',anchor:['fraise','🍓'],rule:()=>['Quand tu vois a i, ou e i, tu entends',ecoleVowel('è'),300,'comme dans fraise.'],
  words:[['lait','🥛'],['balai','🧹'],['fraise','🍓'],['maison','🏠'],['chaise','🪑'],['aigle','🦅'],['baleine','🐋'],['neige','❄️'],['reine','👸']]},
 {id:'er',name:'er et ez à la fin du mot',sound:'é',anchor:['panier','🧺'],rule:()=>['À la fin d’un mot, e r et e z font souvent le son',ecoleVowel('é'),300,'comme dans panier.'],
  words:[['nez','👃'],['panier','🧺'],['rocher','🪨'],['escalier','🪜'],['cahier','📓'],['soulier','👞']]},
 {id:'c',name:'c qui chante comme dans citron',anchor:['citron','🍋'],rule:()=>['Devant e, i ou y, la lettre c chante comme au début de citron. Avec une cédille, ç chante aussi comme ça, comme dans garçon.'],
  words:[['citron','🍋'],['cerise','🍒'],['glaçon','🧊'],['garçon','👦'],['cinéma','🎬'],['cible','🎯'],['police','👮']]},
 {id:'g',name:'g qui chante comme dans girafe',anchor:['girafe','🦒'],rule:()=>['Devant e, i ou y, la lettre g chante comme au début de girafe.'],
  words:[['girafe','🦒'],['orange','🍊'],['nuage','☁️'],['plage','🏖️'],['fromage','🧀'],['singe','🐒'],['gilet','🦺'],['bougie','🕯️']]},
 {id:'s',name:'s entre deux voyelles',anchor:['rose','🌹'],rule:()=>['Entre deux voyelles, un seul s chante comme au début de zèbre, comme dans rose.'],
  words:[['rose','🌹'],['chemise','👕'],['valise','🧳'],['ciseaux','✂️'],['musique','🎵'],['vase','🏺'],['fusée','🚀']]},
 {id:'gn',name:'gn comme dans montagne',anchor:['montagne','⛰️'],rule:()=>['Les lettres g et n, ensemble, chantent comme à la fin de montagne.'],
  words:[['montagne','⛰️'],['champignon','🍄'],['araignée','🕷️'],['cygne','🦢'],['agneau','🐑'],['peigne','🪮']]},
 {id:'ill',name:'ill comme dans fille',anchor:['fille','👧'],rule:()=>['Les lettres i, l, l, ensemble, chantent comme à la fin de fille.'],
  words:[['fille','👧'],['quille','🎳'],['chenille','🐛'],['abeille','🐝'],['bouteille','🍾'],['feuille','🍃'],['grenouille','🐸'],['papillon','🦋'],['oreille','👂']]},
 {id:'ph',name:'ph comme dans phoque',anchor:['phoque','🦭'],rule:()=>['Les lettres p et h, ensemble, chantent comme au début de fée, comme dans phoque.'],
  words:[['éléphant','🐘'],['phoque','🦭'],['téléphone','☎️'],['dauphin','🐬'],['photo','📷'],['alphabet','🔤']]}
];
function ecoleVowel(k){return typeof vow==='function'?vow(k):{t:k,phoneme:k,rate:1};}
function ecoleGraphWordEl(fam,w,mark){
 const ranges=mark?ecoleGraphRanges(fam.id,w):[];const out=h('span',{class:'ecole-graph-word','aria-label':w});let i=0;
 ranges.forEach(([a,b])=>{if(a>i)out.append(h('span',null,w.slice(i,a)));out.append(h('b',{class:'ecole-graph-mark'},w.slice(a,b)));i=b;});
 if(i<w.length)out.append(h('span',null,w.slice(i)));return out;
}
function ecoleGraphIntroItem(fam){
 return {cls:'ecole-stage ecole-graph',say:fam.rule(),caption:fam.name,exemplar:'graphie-intro:'+fam.id,render(st,api){
  const go=onTap(h('button',{class:'go-btn'},ECOLE_LABELS.intro,icon('next')),()=>api.finish(null));
  uWrap(st,h('div',{class:'ecole-rule-card'},ecolePic(fam.anchor[1],fam.anchor[0],'big'),h('div',{class:'ecole-rule-word'},ecoleGraphWordEl(fam,fam.anchor[0],true))),
   onTap(h('button',{class:'hint-btn'},icon('speaker'),ECOLE_LABELS.replay),()=>Voice.say(fam.rule())),go);
 }};
}
function ecoleGraphItem(ctx){
 const mix=ctx.L.family==='mix',fam=mix?pick(ECOLE_GRAPH_FAMILIES):ECOLE_GRAPH_FAMILIES.find(f=>f.id===ctx.L.family);
 if(!mix&&ctx.i===0)return ecoleGraphIntroItem(fam);
 const entries=fam.words.map(([w,e])=>({w,e})),W=ecoleFresh(ctx,entries,x=>x.w),others=sample(entries.filter(x=>x.w!==W.w),2),opts=shuffle([W,...others]);
 const mark=!mix&&ctx.i<=3,hear=ctx.i%2===1;
 const ALT={au:['au','eau'],ai:['ai','ei'],er:['er','ez']}[fam.id];
 if(ALT&&!mix&&ctx.i===(ctx.n||7)-1){
  const [a,b]=ecoleGraphRanges(fam.id,W.w)[0],part=W.w.slice(a,b),opts=ALT.includes(part)?ALT:[part,...ALT.filter(x=>x!==part)].slice(0,2);
  return {cls:'ecole-stage ecole-graph',say:[W.w,350,ECOLE_VOICE.graphComplete],caption:'Complète le mot',exemplar:'graphie-complete:'+W.w,render(st,api){
   const gap=h('span',{class:'ecole-gap'},'?');let target;
   const row=ecoleRow(2,shuffle(opts).map(o=>{const btn=ecoleTextCard(o,o);if(o===part)target=btn;onTap(btn,()=>api.answer(o===part,{el:btn,correctEl:target,feedback:ECOLE_VOICE.graphCompleteWrong,praise:['Oui !',W.w]}).then(ok=>{if(ok){gap.textContent=part;gap.classList.add('filled');}}));return btn;}));
   api.key(target);uWrap(st,h('div',{class:'ecole-picture-line'},ecolePic(W.e,W.w,'big'),h('div',{class:'ecole-gap-word'},W.w.slice(0,a),gap,W.w.slice(b))),row);
  }};
 }
 if(hear)return {cls:'ecole-stage ecole-graph',say:[W.w,350,ECOLE_VOICE.graphHear],caption:'Touche le mot que tu entends',exemplar:'graphie-ecoute:'+W.w,render(st,api){
  let target;const row=h('div',{class:'ecole-word-list'},opts.map(o=>{const b=h('button',{class:'card txt ecole-word-card','aria-label':o.w},ecoleGraphWordEl(fam,o.w,mark));if(o===W)target=b;
   onTap(b,()=>api.answer(o===W,{el:b,correctEl:target,feedback:ECOLE_VOICE.graphWrongHear,praise:['Oui !',W.w]}));return b;}));
  api.key(target);uWrap(st,ecolePic(W.e,W.w,'big'),onTap(h('button',{class:'hint-btn'},icon('speaker'),ECOLE_LABELS.replay),()=>Voice.say(W.w)),row);
 }};
 return {cls:'ecole-stage ecole-graph',say:ECOLE_VOICE.graphRead,caption:'Lis le mot, puis touche la bonne image',exemplar:'graphie-lecture:'+W.w,render(st,api){
  let target;const row=ecoleRow(3,opts.map(o=>{const b=ecolePicCard(o.e,'image');if(o===W)target=b;onTap(b,()=>api.answer(o===W,{el:b,correctEl:target,feedback:ECOLE_VOICE.graphWrongRead,praise:['Oui !',W.w]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-big-word'},ecoleGraphWordEl(fam,W.w,mark)),ecoleHelp(api,W.w),row);
 }};
}
ecoleRegister('graphies',{title:'Les sons qui s’écrivent autrement',sub:'au, eau, ai, ei, gn, ill, ph…',icon:'🔤',color:'plum',stage:'#f4f0fa',
 levels:ecoleLevels('graphies','P1',[...ECOLE_GRAPH_FAMILIES.map(f=>({family:f.id,name:f.name,n:7})),{family:'mix',name:'Tous les sons mélangés'}]),make:ecoleGraphItem},'grands','lire','phraseOrdre');

/* ---------- 3. Les petits mots : un/une, le/la, il/elle, singulier/pluriel ---------- */
const ECOLE_NOUNS=[
 ['lapin','🐰','m','lapins'],['chat','🐱','m','chats'],['vélo','🚲','m','vélos'],['ballon','🎈','m','ballons'],['chien','🐶','m','chiens'],['livre','📖','m','livres'],
 ['crayon','✏️','m','crayons'],['poisson','🐟','m','poissons'],['train','🚂','m','trains'],['gâteau','🍰','m',null],['cheval','🐴','m',null],['lit','🛏️','m','lits'],
 ['pomme','🍎','f','pommes'],['poule','🐔','f','poules'],['fleur','🌸','f','fleurs'],['tortue','🐢','f','tortues'],['lune','🌙','f',null],['maison','🏠','f','maisons'],
 ['vache','🐄','f','vaches'],['voiture','🚗','f','voitures'],['fraise','🍓','f','fraises'],['banane','🍌','f','bananes'],['girafe','🦒','f','girafes'],['chaussure','👟','f','chaussures']
].map(([w,e,g,pl])=>({w,e,g,pl}));
const ECOLE_PEOPLE=[['le garçon','👦','il'],['la fille','👧','elle'],['papa','👨','il'],['maman','👩','elle'],['papy','👴','il'],['mamie','👵','elle'],['le roi','🤴','il'],['la reine','👸','elle']].map(([w,e,p])=>({w,e,p}));
const ECOLE_PRONOUN_VERBS=['chante','dort','mange','lit','danse','rit'];
const ECOLE_SMALL_WORD_KINDS=['un','le','il','des','les'];
function ecoleArticleOf(kind,n,plural){if(kind==='un')return n.g==='m'?'un':'une';if(kind==='le')return n.g==='m'?'le':'la';if(kind==='des')return plural?'des':n.g==='m'?'un':'une';return plural?'les':n.g==='m'?'le':'la';}
function ecoleSmallWordsItem(ctx){
 const kind=ctx.L.kind==='mix'?ECOLE_SMALL_WORD_KINDS[ctx.i%ECOLE_SMALL_WORD_KINDS.length]:ctx.L.kind;
 if(kind==='un'||kind==='le'){
  const N=ecoleFresh(ctx,ECOLE_NOUNS,x=>x.w),options=kind==='un'?['un','une']:['le','la'],ans=ecoleArticleOf(kind,N,false);
  return {cls:'ecole-stage ecole-small',say:[N.w,350,ECOLE_VOICE.genderAsk[kind]],caption:ECOLE_VOICE.genderAsk[kind],exemplar:'petitsmots:'+kind+':'+N.w,render(st,api){
   const gap=h('span',{class:'ecole-gap'},'?');let target;
   const row=ecoleRow(2,options.map(o=>{const b=ecoleTextCard(o,o);if(o===ans)target=b;onTap(b,()=>api.answer(o===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.genderWrong,praise:['Oui !',ans+' '+N.w]}).then(ok=>{if(ok){gap.textContent=ans;gap.classList.add('filled');}}));return b;}));
   api.key(target);uWrap(st,ecolePic(N.e,N.w,'big'),h('div',{class:'ecole-phrase-line'},gap,' ',N.w),row);
  }};
 }
 if(kind==='il'){
  const person=ecoleFresh(ctx,ECOLE_PEOPLE,x=>x.w),verb=pick(ECOLE_PRONOUN_VERBS),ans=person.p,sentence=(ans==='il'?'Il ':'Elle ')+verb+'.';
  return {cls:'ecole-stage ecole-small',say:[person.w,350,ECOLE_VOICE.pronounAsk],caption:ECOLE_VOICE.pronounAsk,exemplar:'petitsmots:il:'+person.w+':'+verb,render(st,api){
   const gap=h('span',{class:'ecole-gap'},'?');let target;
   const row=ecoleRow(2,['Il','Elle'].map(o=>{const b=ecoleTextCard(o,o);if(o.toLowerCase()===ans)target=b;onTap(b,()=>api.answer(o.toLowerCase()===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.pronounWrong,praise:['Oui !',sentence]}).then(ok=>{if(ok){gap.textContent=o;gap.classList.add('filled');}}));return b;}));
   api.key(target);uWrap(st,ecolePic(person.e,person.w,'big'),h('div',{class:'ecole-phrase-line'},gap,' '+verb+'.'),row);
  }};
 }
 const N=ecoleFresh(ctx,ECOLE_NOUNS.filter(n=>n.pl),x=>x.w),plural=Math.random()<.5,count=plural?rint(3,5):1;
 const one=ecoleArticleOf(kind,N,false)+' '+N.w,many=(kind==='des'?'des ':'les ')+N.pl,ans=plural?many:one;
 return {cls:'ecole-stage ecole-small',say:ECOLE_VOICE.numberAsk,caption:'Un seul, ou plusieurs ?',exemplar:'petitsmots:'+kind+':'+N.w+':'+count,render(st,api){
  let target;const pics=h('div',{class:'ecole-count-pics'},Array.from({length:count},()=>ecolePic(N.e,N.w)));
  const row=ecoleRow(2,shuffle([one,many]).map(o=>{const b=ecoleTextCard(o,o);if(o===ans)target=b;onTap(b,()=>api.answer(o===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.numberWrong,praise:['Oui !',ans]}));return b;}));
  api.key(target);uWrap(st,pics,row);
 }};
}
ecoleRegister('petitsMots',{title:'Les petits mots',sub:'un, une, le, la, il, elle, les',icon:'🔡',color:'teal',stage:'#edf6f2',
 levels:ecoleLevels('petitsmots','P1',[{kind:'un',name:'un ou une'},{kind:'le',name:'le ou la'},{kind:'il',name:'il ou elle'},{kind:'des',name:'un ou des : un seul ou plusieurs'},{kind:'les',name:'le, la ou les'},{kind:'mix',name:'Tous les petits mots'}]),make:ecoleSmallWordsItem},'grands','lire','pseudoMot');

/* ---------- 4. Remettre la phrase en ordre ---------- */
/* Phrases décodables avec les sons du parcours « Apprendre à lire » (jusqu’à eu). */
const ECOLE_ORDER_SENTENCES=[
 ['Le chat dort.','🐱'],['La vache boit.','🐄'],['Le bébé rit.','👶'],['La moto roule.','🏍️'],['Le loup court.','🐺'],['La fée vole.','🧚'],['La tortue dort.','🐢'],['Le canard boit.','🦆'],
 ['Papa lit un livre.','📖'],['Lola a un vélo.','🚲'],['Luca a un ballon.','🎈'],['Le chat a soif.','🐱'],['Mamie a un chat.','👵'],['Papa a une moto.','🏍️'],
 ['Le lapin a une carotte.','🥕'],['Le roi a une couronne.','👑'],['Le chat boit du lait.','🥛'],['Lola a vu un loup.','🐺'],['Papa a vu une souris.','🐭'],
 ['Luca a vu un lapin.','🐰'],
 ['Lola donne une pomme à papa.','🍎'],['Papa a vu un gros loup.','🐺'],['Le chat a vu une souris.','🐭'],['Le loup a vu le lapin.','🐺'],['Luca a lu un joli livre.','📖'],['La poule a un petit poussin.','🐣']
].map(([s,e])=>({s,e,words:s.replace(/\.$/,'').split(' ')}));
function ecolePhraseItem(ctx){
 const pool=ECOLE_ORDER_SENTENCES.filter(x=>x.words.length===ctx.L.words),P0=ecoleFresh(ctx,pool,x=>x.s);
 let order=shuffle(P0.words.map((w,i)=>({w,i})));let guard=0;while(order.every((x,i)=>x.i===i)&&guard++<10)order=shuffle(order);
 return {cls:'ecole-stage ecole-phrase',say:ECOLE_VOICE.phraseAsk,caption:'Remets les mots dans l’ordre',exemplar:'phrase:'+P0.s,render(st,api){
  let at=0,done=false;const buttons=[];const line=h('div',{class:'ecole-sentence','aria-label':'La phrase'},P0.words.map(()=>h('span',{class:'ecole-slot'},'\u00a0')),h('span',{class:'ecole-dot'},'.'));
  const slots=line.querySelectorAll?line.querySelectorAll('.ecole-slot'):[];
  const tray=h('div',{class:'ecole-tiles'},order.map(o=>{const b=h('button',{class:'card txt ecole-tile','aria-label':o.w},o.w);buttons[o.i]=b;
   onTap(b,()=>{if(done||!api.alive()||b.disabled)return;
    if(o.w!==P0.words[at]){api.step(false,{el:b,correctEl:buttons[at],feedback:at===0?ECOLE_VOICE.phraseFirst:ECOLE_VOICE.phraseNext,reveal:at===0?ECOLE_VOICE.phraseFirst:ECOLE_VOICE.phraseNext});return;}
    b.disabled=true;b.classList.add('used');if(slots[at]){slots[at].textContent=o.w;slots[at].classList.add('filled');}at++;
    if(at===P0.words.length){done=true;api.answer(true,{el:line,praise:['Oui !',P0.s]});}else{ecoleMoveKey(api,b,buttons[at]);api.step(true);}});return b;}));
  api.key(buttons[0]);uWrap(st,ecolePic(P0.e,'image de la phrase','big'),line,tray,ecoleHelp(api,P0.s));
 }};
}
ecoleRegister('phraseOrdre',{title:'Remettre la phrase en ordre',sub:'Lire chaque mot et construire la phrase',icon:'🧱',color:'teal',stage:'#edf6f2',
 levels:ecoleLevels('phrase','P1',[{words:3,name:'Trois mots'},{words:4,name:'Quatre mots'},{words:5,name:'Cinq mots'},{words:6,name:'Six mots'}]),make:ecolePhraseItem},'grands','lire','lisFais');

/* =========================================================
   LUCA — Calculer
   ========================================================= */

/* ---------- 5. La maison des nombres ---------- */
function ecoleHouseDots(total,filled){return h('div',{class:'ecole-dots','aria-hidden':'true'},Array.from({length:total},(_,i)=>h('i',{class:i<filled?'on':''})));}
function ecoleHouseEl(N,floors,showDots){
 return h('div',{class:'ecole-house','aria-label':'maison du '+nw(N)},
  h('div',{class:'ecole-roof'},h('b',null,String(N))),
  h('div',{class:'ecole-floors'},floors.map(f=>h('div',{class:'ecole-floor'+(f.focus?' focus':'')},
   h('span',{class:'ecole-room'},f.a==null?h('span',{class:'ecole-gap'},'?'):String(f.a)),
   h('span',{class:'ecole-room'},f.b==null?h('span',{class:'ecole-gap'},'?'):String(f.b)),
   showDots?ecoleHouseDots(N,f.a==null?0:f.a):null))));
}
function ecoleHouseSay(N,a){return `Dans la maison du ${nw(N)}, il y a ${nw(a)}. Combien faut-il ajouter pour faire ${nw(N)} ?`;}
function ecoleHouseItem(ctx){
 const L=ctx.L;
 if(L.all){
  const N=rint(L.min,L.max),blanks=sample(Array.from({length:N+1},(_,i)=>i),Math.min(3,N+1)).sort((a,b)=>a-b);
  return {cls:'ecole-stage ecole-house-stage',say:ECOLE_VOICE.houseAll,caption:'Remplis tous les étages',exemplar:'maison-toute:'+N+':'+blanks.join(','),render(st,api){
   let k=0,done=false;const floors=Array.from({length:N+1},(_,a)=>({a,b:blanks.includes(a)?null:N-a,focus:a===blanks[0]}));
   const wrap=h('div',{class:'ecole-house-wrap'});const draw=()=>{wrap.innerHTML='';wrap.append(ecoleHouseEl(N,floors,false));};draw();
   let target;const byValue={};const tiles=ecoleRow(4,Array.from({length:N+1},(_,v)=>{const b=ecoleTextCard(String(v),nw(v),'ecole-num');byValue[v]=b;if(v===N-blanks[0])target=b;
    onTap(b,()=>{if(done||!api.alive())return;const need=N-blanks[k];
     if(v!==need){api.step(false,{el:b,feedback:ECOLE_VOICE.houseWrong});return;}
     floors[blanks[k]].b=v;floors[blanks[k]].focus=false;k++;if(k<blanks.length)floors[blanks[k]].focus=true;draw();
     if(k===blanks.length){done=true;api.answer(true,{el:wrap,praise:ECOLE_VOICE.houseDone});}else{ecoleMoveKey(api,b,byValue[N-blanks[k]]);}if(k<blanks.length)api.step(true,{say:nw(blanks[k-1])+' et '+nw(v)+', ça fait '+nw(N)+'.'});});return b;}));
   api.key(target);uWrap(st,wrap,tiles);
  }};
 }
 const N=rint(L.min,L.max),a=rint(1,N-1),ans=N-a,say=ecoleHouseSay(N,a);
 if(L.keypad)return {...kpItem({say,caption:'La maison du '+nw(N),visual:()=>ecoleHouseEl(N,[{a,b:null,focus:true}],false),ans,hint:'Pense à la maison : '+nw(a)+' et combien font '+nw(N)+' ?'}),cls:'ecole-stage ecole-house-stage',exemplar:'maison-clavier:'+N+':'+a};
 const opts=[ans,...sample(Array.from({length:N+1},(_,v)=>v).filter(v=>v!==ans),Math.min(3,N))].sort((x,y)=>x-y);
 return {cls:'ecole-stage ecole-house-stage',say,caption:'La maison du '+nw(N),exemplar:'maison:'+N+':'+a,render(st,api){
  let target;const gapHolder=ecoleHouseEl(N,[{a,b:null,focus:true}],true);
  const row=ecoleRow(opts.length,opts.map(v=>{const b=ecoleTextCard(String(v),nw(v),'ecole-num');if(v===ans)target=b;onTap(b,()=>api.answer(v===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.houseWrong,praise:['Oui !',nw(a)+' et '+nw(ans)+', ça fait '+nw(N)+'.']}));return b;}));
  api.key(target);uWrap(st,gapHolder,row);
 }};
}
ecoleRegister('maisonNombres',{title:'La maison des nombres',sub:'Décomposer les nombres jusqu’à 10',icon:'🏠',color:'sky',stage:'#eef5fd',
 levels:ecoleLevels('maison','P1',[{min:3,max:5,name:'Les maisons de 3, 4 et 5'},{min:6,max:7,name:'Les maisons de 6 et 7'},{min:8,max:10,name:'Les maisons de 8, 9 et 10'},{min:4,max:6,all:true,n:4,name:'Remplir toute la maison'},{min:6,max:10,keypad:true,name:'Sans les points, au clavier'}]),make:ecoleHouseItem},'grands','calculer','blocs');

/* ---------- 6. Les nombres en lettres (à la belge) ---------- */
const ECOLE_NUMBER_WORD_LEVELS=[{min:0,max:5},{min:6,max:10},{min:11,max:16},{min:17,max:20},{min:0,max:20,reverse:true},{tens:true}];
function ecoleNumberWordItem(ctx){
 const spec=ECOLE_NUMBER_WORD_LEVELS[ctx.li];
 const pool=spec.tens?[10,20,30,40,50,60,70,80,90,100]:Array.from({length:spec.max-spec.min+1},(_,i)=>spec.min+i);
 const n=ecoleFresh(ctx,pool,x=>String(x));
 const near=spec.tens?pool.filter(x=>x!==n):Array.from({length:21},(_,i)=>i).filter(x=>x!==n&&Math.abs(x-n)<=4);
 const opts=shuffle([n,...sample(near,spec.reverse?2:3)]);
 if(spec.reverse)return {cls:'ecole-stage ecole-number-word',say:ECOLE_VOICE.digitToWord,caption:'Touche le bon mot',exemplar:'nombre-mot:'+n,render(st,api){
  let target;const list=h('div',{class:'ecole-word-list'},opts.map(v=>{const b=ecoleTextCard(nw(v),nw(v));if(v===n)target=b;onTap(b,()=>api.answer(v===n,{el:b,correctEl:target,feedback:ECOLE_VOICE.numberWordWrong,praise:['Oui !',nw(n)]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-big-number'},String(n)),list,ecoleHelp(api,nw(n)));
 }};
 if(ctx.i%2===1){
  const words=shuffle([n,...sample(near,2)]);
  return {cls:'ecole-stage ecole-number-word',say:[nw(n),350,ECOLE_VOICE.hearToWord],caption:'Écoute et touche le bon mot',exemplar:'ecoute-mot:'+n,render(st,api){
   let target;const list=h('div',{class:'ecole-word-list'},words.map(v=>{const b=ecoleTextCard(nw(v),nw(v));if(v===n)target=b;onTap(b,()=>api.answer(v===n,{el:b,correctEl:target,feedback:ECOLE_VOICE.numberWordWrong,praise:['Oui !',nw(n)]}));return b;}));
   api.key(target);uWrap(st,onTap(h('button',{class:'hint-btn'},icon('speaker'),ECOLE_LABELS.replay),()=>Voice.say(nw(n))),list);
  }};
 }
 return {cls:'ecole-stage ecole-number-word',say:ECOLE_VOICE.wordToDigit,caption:'Lis le nombre écrit en lettres',exemplar:'mot-nombre:'+n,render(st,api){
  let target;const row=ecoleRow(opts.length,opts.map(v=>{const b=ecoleTextCard(String(v),nw(v),'ecole-num');if(v===n)target=b;onTap(b,()=>api.answer(v===n,{el:b,correctEl:target,feedback:ECOLE_VOICE.numberWordWrong,praise:['Oui !',nw(n)]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-big-word'},nw(n)),ecoleHelp(api,nw(n)),row);
 }};
}
ecoleRegister('nombresLettres',{title:'Les nombres en lettres',sub:'Lire zéro, onze, septante, nonante…',icon:'🔢',color:'sky',stage:'#eef5fd',
 levels:ecoleLevels('nombresmots','P1',[{name:'De zéro à cinq'},{name:'De six à dix'},{name:'De onze à seize'},{name:'De dix-sept à vingt'},{name:'Du nombre au mot'},{name:'Les dizaines, de dix à cent'}]),make:ecoleNumberWordItem},'grands','calculer','pontDix');

/* ---------- 7. Les jours et les mois ---------- */
const ECOLE_DAYS=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const ECOLE_MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const ECOLE_SEASONS=[{id:'hiver',e:'❄️',months:['janvier','février']},{id:'printemps',e:'🌸',months:['avril','mai']},{id:'été',e:'☀️',months:['juillet','août']},{id:'automne',e:'🍂',months:['octobre','novembre']}];
const ECOLE_CAL_START=2,ECOLE_CAL_LENGTH=30;
function ecoleSeasonSentence(m,s){return `${m} est ${s.id==='printemps'?'au':'en'} ${s.id}.`;}
function ecoleCalendarChoice(api,list,ans,wrong,praise){
 let target;const row=h('div',{class:'ecole-day-row'},list.map(v=>{const b=ecoleTextCard(v,v,'ecole-day');const spk=h('span',{class:'spk',html:ICON.speaker,role:'button','aria-label':'écouter '+v});spk.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault();Voice.say(v);});b.append(spk);if(v===ans)target=b;
  onTap(b,()=>api.answer(v===ans,{el:b,correctEl:target,feedback:wrong,praise:['Oui !',praise||ans]}));return b;}));api.key(target);return row;
}
function ecoleCalendarItem(ctx){
 const kind=ctx.L.kind;
 if(kind==='after'||kind==='before'){
  const i=rint(0,6),ans=ECOLE_DAYS[(i+(kind==='after'?1:6))%7],opts=shuffle([ans,...sample(ECOLE_DAYS.filter(d=>d!==ans&&d!==ECOLE_DAYS[i]),2)]);
  const say=kind==='after'?`Quel jour vient après ${ECOLE_DAYS[i]} ?`:`Quel jour vient avant ${ECOLE_DAYS[i]} ?`;
  return {cls:'ecole-stage ecole-calendar',say,caption:say,exemplar:'jour:'+kind+':'+i,render(st,api){uWrap(st,h('div',{class:'ecole-big-word'},(kind==='after'?ECOLE_DAYS[i]+' → ?':'? → '+ECOLE_DAYS[i])),ecoleCalendarChoice(api,opts,ans,ECOLE_VOICE.calendarWrong));}};
 }
 if(kind==='hier'){
  const i=rint(0,6),tomorrow=Math.random()<.5,ans=ECOLE_DAYS[(i+(tomorrow?1:6))%7],opts=shuffle([ans,ECOLE_DAYS[(i+(tomorrow?6:1))%7],ECOLE_DAYS[i]]);
  const say=tomorrow?`Aujourd’hui, c’est ${ECOLE_DAYS[i]}. Quel jour serons-nous demain ?`:`Aujourd’hui, c’est ${ECOLE_DAYS[i]}. Quel jour était-ce hier ?`;
  return {cls:'ecole-stage ecole-calendar',say,caption:tomorrow?'Demain ?':'Hier ?',exemplar:'hier:'+i+':'+tomorrow,render(st,api){
   uWrap(st,h('div',{class:'ecole-days-strip'},h('span',{class:tomorrow?'':'ecole-gap'},tomorrow?'hier':'hier ?'),h('b',null,'aujourd’hui : '+ECOLE_DAYS[i]),h('span',{class:tomorrow?'ecole-gap':''},tomorrow?'demain ?':'demain')),ecoleCalendarChoice(api,opts,ans,ECOLE_VOICE.calendarWrong));}};
 }
 if(kind==='month'){
  const i=rint(0,11),ans=ECOLE_MONTHS[(i+1)%12],opts=shuffle([ans,...sample(ECOLE_MONTHS.filter(m=>m!==ans&&m!==ECOLE_MONTHS[i]),2)]),say=`Quel mois vient après ${ECOLE_MONTHS[i]} ?`;
  return {cls:'ecole-stage ecole-calendar',say,caption:say,exemplar:'mois:'+i,render(st,api){uWrap(st,h('div',{class:'ecole-big-word'},ECOLE_MONTHS[i]+' → ?'),ecoleCalendarChoice(api,opts,ans,ECOLE_VOICE.monthWrong));}};
 }
 if(kind==='grid'){
  const date=rint(1,ECOLE_CAL_LENGTH),ans=ECOLE_DAYS[(ECOLE_CAL_START+date-1)%7],opts=shuffle([ans,...sample(ECOLE_DAYS.filter(d=>d!==ans),2)]);
  return {cls:'ecole-stage ecole-calendar',say:ECOLE_VOICE.calendarAsk,caption:'Quel jour est la date entourée ?',exemplar:'calendrier:'+date,render(st,api){
   const grid=h('div',{class:'ecole-month','aria-label':'calendrier'},ECOLE_DAYS.map(d=>h('b',null,d.slice(0,3))),Array.from({length:ECOLE_CAL_START},()=>h('span',{class:'empty'})),
    Array.from({length:ECOLE_CAL_LENGTH},(_,k)=>h('span',{class:k+1===date?'ring':''},String(k+1))));
   uWrap(st,grid,ecoleCalendarChoice(api,opts,ans,ECOLE_VOICE.calendarGridWrong));}};
 }
 const S0=pick(ECOLE_SEASONS),m=pick(S0.months),say=`En quelle saison est le mois de ${m} ?`;
 return {cls:'ecole-stage ecole-calendar',say,caption:say,exemplar:'saison:'+m,render(st,api){
  let target;const row=ecoleRow(4,ECOLE_SEASONS.map(s=>{const b=h('button',{class:'card pic ecole-season','aria-label':s.id},ecolePic(s.e,s.id),h('span',{class:'ecole-card-text small'},s.id));if(s===S0)target=b;
   onTap(b,()=>api.answer(s===S0,{el:b,correctEl:target,feedback:ECOLE_VOICE.seasonWrong,praise:['Oui !',ecoleSeasonSentence(m,S0)]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-big-word'},m),row);
 }};
}
ecoleRegister('calendrier',{title:'Les jours et les mois',sub:'La semaine, hier, demain, le calendrier',icon:'📅',color:'sky',stage:'#eef5fd',
 levels:ecoleLevels('calendrier','P1',[{kind:'after',name:'Le jour d’après'},{kind:'before',name:'Le jour d’avant'},{kind:'hier',name:'Hier, aujourd’hui, demain'},{kind:'month',name:'Les mois dans l’ordre'},{kind:'grid',name:'Lire le calendrier'},{kind:'season',name:'Les saisons'}]),make:ecoleCalendarItem},'grands','calculer','heure');

/* ---------- 8. Figures et solides ---------- */
const ECOLE_FIGURES={
 carré:{sides:4,svg:(c)=>`<rect x="18" y="18" width="64" height="64" rx="2" fill="${c}"/>`},
 rectangle:{sides:4,svg:(c)=>`<rect x="6" y="28" width="88" height="44" rx="2" fill="${c}"/>`},
 triangle:{sides:3,svg:(c)=>`<polygon points="50,10 92,86 8,86" fill="${c}"/>`},
 rond:{sides:0,svg:(c)=>`<circle cx="50" cy="50" r="40" fill="${c}"/>`},
 pentagone:{sides:5,svg:(c)=>`<polygon points="50,8 92,39 76,90 24,90 8,39" fill="${c}"/>`},
 hexagone:{sides:6,svg:(c)=>`<polygon points="28,12 72,12 94,50 72,88 28,88 6,50" fill="${c}"/>`}
};
const ECOLE_SHAPE_COLORS=['#e25b4f','#3b82c4','#f0b731','#46a663','#9a62c6'];
function ecoleFigureSVG(name,color,turn=0){return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(${turn} 50 50)" stroke="#2c3e55" stroke-width="3" stroke-linejoin="round">${ECOLE_FIGURES[name].svg(color)}</g></svg>`;}
const ECOLE_SOLIDS={
 cube:{rolls:false,svg:`<polygon points="20,40 62,40 62,82 20,82" fill="#f6c443"/><polygon points="20,40 38,22 80,22 62,40" fill="#ffe08a"/><polygon points="62,40 80,22 80,64 62,82" fill="#d9a520"/>`},
 pavé:{rolls:false,svg:`<polygon points="8,42 66,42 66,82 8,82" fill="#7fb6ec"/><polygon points="8,42 26,26 84,26 66,42" fill="#b8d8f7"/><polygon points="66,42 84,26 84,66 66,82" fill="#4f8ccc"/>`},
 boule:{rolls:true,svg:`<defs><radialGradient id="g" cx="38%" cy="35%" r="65%"><stop offset="0" stop-color="#ffd0cc"/><stop offset="1" stop-color="#d9463b"/></radialGradient></defs><circle cx="50" cy="52" r="38" fill="url(#g)"/>`},
 cylindre:{rolls:true,svg:`<path d="M24 24 V76 A26 9 0 0 0 76 76 V24" fill="#5fbf7c"/><ellipse cx="50" cy="24" rx="26" ry="9" fill="#a9e5bb"/>`},
 cône:{rolls:true,svg:`<path d="M50 10 L80 76 A30 10 0 0 1 20 76 Z" fill="#b48ae0"/><ellipse cx="50" cy="76" rx="30" ry="10" fill="#8a5fc0" opacity=".35"/>`},
 pyramide:{rolls:false,svg:`<polygon points="50,10 18,74 52,88" fill="#f0a35a"/><polygon points="50,10 52,88 86,70" fill="#c7782f"/>`}
};
const ECOLE_EVERYDAY=[['⚽','le ballon','boule'],['🍊','l’orange','boule'],['🎲','le dé','cube'],['🧊','le glaçon','cube'],['📦','le carton','pavé'],['🥫','la boîte de conserve','cylindre'],['🥁','le tambour','cylindre'],['🕯️','la bougie','cylindre'],['🍦','le cornet de glace','cône']].map(([e,label,solid])=>({e,label,solid}));
function ecoleSolidName(n){return n==='boule'?'une boule':n==='pyramide'?'une pyramide':'un '+n;}
function ecoleSolidSVG(name){return `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#2c3e55" stroke-width="2.5" stroke-linejoin="round">${ECOLE_SOLIDS[name].svg}</g></svg>`;}
function ecoleFigureCard(content,label){return h('button',{class:'card pic ecole-shape-card','aria-label':label},h('span',{class:'ecole-shape',html:content}));}
function ecoleShapesItem(ctx){
 const kind=ctx.L.kind;
 if(kind==='name'){
  const names=['carré','rectangle','triangle','rond'],ans=ecoleFresh(ctx,names),opts=shuffle([ans,...sample(names.filter(n=>n!==ans),2)]);
  const say=ans==='rond'?'Touche le rond.':`Touche le ${ans}.`;
  return {cls:'ecole-stage ecole-shapes',say,caption:say,exemplar:'figure:'+ans,render(st,api){let target;
   const row=ecoleRow(3,opts.map(n=>{const b=ecoleFigureCard(ecoleFigureSVG(n,pick(ECOLE_SHAPE_COLORS),n==='rond'?0:pick([0,0,15,-15])),'figure');if(n===ans)target=b;onTap(b,()=>api.answer(n===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.shapeWrong,praise:['Oui !',`C’est le ${ans}.`]}));return b;}));api.key(target);uWrap(st,row);}};
 }
 if(kind==='sides'||kind==='corners'){
  const names=['triangle','carré','rectangle','pentagone','hexagone'],n=ecoleFresh(ctx,names),ans=ECOLE_FIGURES[n].sides,opts=[3,4,5,6];
  const say=kind==='sides'?ECOLE_VOICE.sidesAsk:ECOLE_VOICE.cornersAsk;
  return {cls:'ecole-stage ecole-shapes',say,caption:kind==='sides'?'Combien de côtés ?':'Combien de sommets ?',exemplar:kind+':'+n,render(st,api){let target;
   const row=ecoleRow(4,opts.map(v=>{const b=ecoleTextCard(String(v),nw(v),'ecole-num');if(v===ans)target=b;onTap(b,()=>api.answer(v===ans,{el:b,correctEl:target,feedback:kind==='sides'?ECOLE_VOICE.countWrong:ECOLE_VOICE.cornerWrong,praise:['Oui !',kind==='sides'?`${nw(ans)} côtés.`:`${nw(ans)} sommets.`]}));return b;}));
   api.key(target);uWrap(st,h('span',{class:'ecole-shape big',html:ecoleFigureSVG(n,pick(ECOLE_SHAPE_COLORS),pick([0,10,-10]))}),row);}};
 }
 const names=Object.keys(ECOLE_SOLIDS);
 if(kind==='solid'){
  const ans=ecoleFresh(ctx,names),opts=shuffle([ans,...sample(names.filter(n=>n!==ans),2)]),say=ans==='boule'||ans==='pyramide'?`Touche la ${ans}.`:`Touche le ${ans}.`;
  return {cls:'ecole-stage ecole-shapes',say,caption:say,exemplar:'solide:'+ans,render(st,api){let target;
   const row=ecoleRow(3,opts.map(n=>{const b=ecoleFigureCard(ecoleSolidSVG(n),'solide');if(n===ans)target=b;onTap(b,()=>api.answer(n===ans,{el:b,correctEl:target,feedback:ECOLE_VOICE.solidWrong,praise:['Oui !',ans==='boule'||ans==='pyramide'?`C’est la ${ans}.`:`C’est le ${ans}.`]}));return b;}));api.key(target);uWrap(st,row);}};
 }
 if(kind==='everyday'){
  const O=ecoleFresh(ctx,ECOLE_EVERYDAY,x=>x.label),opts=shuffle([O.solid,...sample(names.filter(n=>n!==O.solid),2)]),say=`Quel solide a la même forme que ${O.label} ?`;
  return {cls:'ecole-stage ecole-shapes',say,caption:'Les solides autour de nous',exemplar:'quotidien:'+O.label,render(st,api){let target;
   const row=ecoleRow(3,opts.map(n=>{const b=ecoleFigureCard(ecoleSolidSVG(n),'solide');if(n===O.solid)target=b;onTap(b,()=>api.answer(n===O.solid,{el:b,correctEl:target,feedback:ECOLE_VOICE.solidWrong,praise:['Oui !',`C’est ${ecoleSolidName(O.solid)}.`]}));return b;}));
   api.key(target);uWrap(st,ecolePic(O.e,O.label,'big'),row);}};
 }
 const roller=ecoleFresh(ctx,names.filter(n=>ECOLE_SOLIDS[n].rolls)),opts=shuffle([roller,...sample(names.filter(n=>!ECOLE_SOLIDS[n].rolls),2)]);
 return {cls:'ecole-stage ecole-shapes',say:ECOLE_VOICE.rollAsk,caption:'Quel solide roule ?',exemplar:'roule:'+opts.join(','),render(st,api){let target;
  const row=ecoleRow(3,opts.map(n=>{const b=ecoleFigureCard(ecoleSolidSVG(n),'solide');if(n===roller)target=b;onTap(b,()=>api.answer(n===roller,{el:b,correctEl:target,feedback:ECOLE_VOICE.rollWrong,praise:['Oui !',roller==='boule'?'La boule roule.':roller==='cône'?'Le cône roule.':'Le cylindre roule.']}));return b;}));api.key(target);uWrap(st,row);}};
}
ecoleRegister('formesSolides',{title:'Figures et solides',sub:'Côtés, sommets, cubes et boules',icon:'🔷',color:'sky',stage:'#eef5fd',
 levels:ecoleLevels('geometrie','P1',[{kind:'name',name:'Reconnaître les figures'},{kind:'sides',name:'Compter les côtés'},{kind:'corners',name:'Compter les sommets'},{kind:'solid',name:'Reconnaître les solides'},{kind:'everyday',name:'Les solides autour de nous'},{kind:'roll',name:'Ce qui roule'}]),make:ecoleShapesItem},'grands','calculer','grandeurs');

/* =========================================================
   LOLA — Jouer et écouter
   ========================================================= */

/* ---------- 9. Copier le modèle ---------- */
const ECOLE_MODEL_COLORS=[{id:'rouge',hex:'#e04545'},{id:'bleu',hex:'#2f76d2'},{id:'jaune',hex:'#f2c230'},{id:'vert',hex:'#3aa65a'}];
const ECOLE_MODEL_LEVELS=[{cols:2,rows:1,colors:2},{cols:2,rows:2,colors:2},{cols:2,rows:2,colors:3},{cols:3,rows:2,colors:3},{cols:3,rows:3,colors:3}];
function ecoleModelGrid(spec,cells,focus){
 return h('div',{class:'ecole-grid',style:{gridTemplateColumns:`repeat(${spec.cols},1fr)`}},cells.map((c,i)=>h('span',{class:'ecole-cell'+(i===focus?' focus':'')},c?h('i',{style:{background:c.hex}}):null)));
}
function ecoleModelErrorItem(ctx){
 const spec={cols:3,rows:2,colors:3},palette=sample(ECOLE_MODEL_COLORS,3),size=6,model=Array.from({length:size},()=>pick(palette));
 const bad=rnd(size),copy=model.slice();copy[bad]=pick(palette.filter(c=>c.id!==model[bad].id));
 return {cls:'ecole-stage ecole-model',say:ECOLE_VOICE.modelError,caption:'Trouve l’erreur',exemplar:'modele-erreur:'+model.map(c=>c.id).join(',')+':'+bad,render(st,api){
  let target;const grid=h('div',{class:'ecole-grid',style:{gridTemplateColumns:`repeat(${spec.cols},1fr)`}},copy.map((c,i)=>{const b=h('button',{class:'ecole-cell ecole-cell-button','aria-label':'case '+(i+1)},h('i',{style:{background:c.hex}}));if(i===bad)target=b;
   onTap(b,()=>api.answer(i===bad,{el:b,correctEl:target,feedback:ECOLE_VOICE.modelErrorWrong,praise:ECOLE_VOICE.modelErrorDone}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-model-pair'},h('div',{class:'ecole-model-ref'},h('small',null,'Le modèle'),ecoleModelGrid(spec,model,-1)),h('div',{class:'ecole-model-ref'},h('small',null,'La copie'),grid)));
 }};
}
function ecoleModelItem(ctx){
 if(ctx.L.error)return ecoleModelErrorItem(ctx);
 const spec=ECOLE_MODEL_LEVELS[ctx.li],palette=sample(ECOLE_MODEL_COLORS,spec.colors),size=spec.cols*spec.rows;
 let model=Array.from({length:size},()=>pick(palette));let guard=0;
 while(new Set(model.map(c=>c.id)).size<Math.min(spec.colors,size)&&guard++<20)model=Array.from({length:size},()=>pick(palette));
 return {cls:'ecole-stage ecole-model',say:ECOLE_VOICE.modelAsk,caption:'Copie le modèle',exemplar:'modele:'+model.map(c=>c.id).join(','),render(st,api){
  let at=0,done=false;const copy=Array(size).fill(null);const holder=h('div',{class:'ecole-model-copy'});
  const draw=()=>{holder.innerHTML='';holder.append(ecoleModelGrid(spec,copy,done?-1:at));};draw();
  const buttons={};const paletteRow=h('div',{class:'ecole-palette'},palette.map(c=>{const b=h('button',{class:'ecole-paint','aria-label':c.id,style:{background:c.hex}});buttons[c.id]=b;
   onTap(b,()=>{if(done||!api.alive())return;if(c.id!==model[at].id){api.step(false,{el:b,correctEl:buttons[model[at].id],feedback:ECOLE_VOICE.modelWrong});return;}
    copy[at]=c;at++;if(at===size){done=true;draw();api.answer(true,{el:holder,praise:ECOLE_VOICE.modelDone});}else{draw();ecoleMoveKey(api,b,buttons[model[at].id]);api.step(true,{say:c.id});}});return b;}));
  api.key(buttons[model[0].id]);
  uWrap(st,h('div',{class:'ecole-model-pair'},h('div',{class:'ecole-model-ref'},h('small',null,'Le modèle'),ecoleModelGrid(spec,model,-1)),holder),paletteRow);
 }};
}
ecoleRegister('copieModele',{title:'Copier le modèle',sub:'Les couleurs à la bonne place',icon:'🟥',color:'gold',stage:'#fffaf0',
 levels:ecoleLevels('modele','M1',[{name:'Deux cases, deux couleurs',n:4},{name:'Quatre cases, deux couleurs',n:4},{name:'Quatre cases, trois couleurs',n:4},{name:'Six cases, trois couleurs',n:4},{name:'Neuf cases, trois couleurs',n:4},{error:true,name:'Trouve l’erreur dans la copie',n:5}]),make:ecoleModelItem},'petits','jouer','formes');

/* ---------- 10. Ce qui va ensemble ---------- */
const ECOLE_TOGETHER=[
 {g:'corps',a:['🪥','la brosse à dents'],b:['🦷','la dent'],why:'On se brosse les dents avec la brosse à dents.'},
 {g:'corps',a:['🧦','la chaussette'],b:['🦶','le pied'],why:'La chaussette va sur le pied.'},
 {g:'corps',a:['🧤','le gant'],b:['✋','la main'],why:'Le gant va sur la main.'},
 {g:'maison',a:['🔑','la clé'],b:['🚪','la porte'],why:'La clé ouvre la porte.'},
 {g:'maison',a:['🥄','la cuillère'],b:['🥣','le bol'],why:'On mange dans le bol avec la cuillère.'},
 {g:'maison',a:['🖌️','le pinceau'],b:['🎨','la peinture'],why:'On peint avec le pinceau.'},
 {g:'maison',a:['✏️','le crayon'],b:['📄','la feuille'],why:'On dessine sur la feuille avec le crayon.'},
 {g:'repas',a:['🐶','le chien'],b:['🦴','l’os'],why:'Le chien aime ronger son os.'},
 {g:'repas',a:['🐰','le lapin'],b:['🥕','la carotte'],why:'Le lapin mange la carotte.'},
 {g:'repas',a:['🐭','la souris'],b:['🧀','le fromage'],why:'La souris aime le fromage.'},
 {g:'repas',a:['🐒','le singe'],b:['🍌','la banane'],why:'Le singe mange la banane.'},
 {g:'nature',a:['☂️','le parapluie'],b:['🌧️','la pluie'],why:'Le parapluie protège de la pluie.'},
 {g:'nature',a:['🐝','l’abeille'],b:['🌸','la fleur'],why:'L’abeille butine la fleur.'},
 {g:'nature',a:['🐦','l’oiseau'],b:['🪺','le nid'],why:'L’oiseau vit dans son nid.'},
 {g:'nature',a:['🐟','le poisson'],b:['💧','l’eau'],why:'Le poisson nage dans l’eau.'},
 {g:'bebe',a:['🍼','le biberon'],b:['👶','le bébé'],why:'Le bébé boit au biberon.'}
];
const ECOLE_OPPOSITES=[[['☀️','le jour'],['🌙','la nuit']],[['🔥','chaud'],['❄️','froid']],[['🐘','grand'],['🐭','petit']],[['😀','content'],['😢','triste']],[['🐇','rapide'],['🐢','lent']],[['⬆️','en haut'],['⬇️','en bas']]];
function ecoleOppositeItem(ctx){
 const k=rnd(ECOLE_OPPOSITES.length),pair=ECOLE_OPPOSITES[k],flip=Math.random()<.5,A=flip?pair[1]:pair[0],B=flip?pair[0]:pair[1];
 const others=sample(ECOLE_OPPOSITES.filter((_,i)=>i!==k).map(p=>p[rnd(2)]),ctx.L.options-1),opts=shuffle([B,...others]);
 return {cls:'ecole-stage ecole-together',say:`Quel est le contraire de ${A[1]} ?`,caption:'Les contraires',exemplar:'contraire:'+A[1]+':'+others.map(o=>o[1]).join(','),render(st,api){
  let target;const row=ecoleRow(opts.length,opts.map(o=>{const b=h('button',{class:'card pic ecole-pic-card','aria-label':o[1]},ecolePic(o[0],o[1]));if(o===B)target=b;
   onTap(b,()=>api.answer(o===B,{el:b,correctEl:target,feedback:ECOLE_VOICE.oppositeWrong,praise:['Oui !',`Le contraire de ${A[1]}, c’est ${B[1]}.`]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-together-model'},ecolePic(A[0],A[1],'big'),h('span',{class:'ecole-plus','aria-hidden':'true'},'↔'),h('span',{class:'ecole-gap big'},'?')),row);
 }};
}
function ecoleTogetherAsk(p){return `Qu’est-ce qui va avec ${p.a[1]} ?`;}
function ecoleTogetherItem(ctx){
 if(ctx.L.opposite)return ecoleOppositeItem(ctx);
 const P0=ecoleFresh(ctx,ECOLE_TOGETHER,x=>x.a[1]),others=sample(ECOLE_TOGETHER.filter(x=>x.g!==P0.g),ctx.L.options-1),opts=shuffle([P0,...others]);
 return {cls:'ecole-stage ecole-together',say:ecoleTogetherAsk(P0),caption:'Ce qui va ensemble',exemplar:'ensemble:'+P0.a[1]+':'+others.map(o=>o.b[1]).join(','),render(st,api){
  let target;const row=ecoleRow(opts.length,opts.map(o=>{const b=h('button',{class:'card pic ecole-pic-card','aria-label':o.b[1]},ecolePic(o.b[0],o.b[1]));if(o===P0)target=b;
   onTap(b,()=>api.answer(o===P0,{el:b,correctEl:target,feedback:ECOLE_VOICE.pairWrong,praise:['Oui !',P0.why]}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-together-model'},ecolePic(P0.a[0],P0.a[1],'big'),h('span',{class:'ecole-plus','aria-hidden':'true'},'+'),h('span',{class:'ecole-gap big'},'?')),row);
 }};
}
ecoleRegister('ensemble',{title:'Ce qui va ensemble',sub:'Associer les objets et les contraires',icon:'🧦',color:'teal',stage:'#edf6f2',
 levels:ecoleLevels('ensemble','M1',[{options:2,name:'Deux images'},{options:3,name:'Trois images'},{options:4,name:'Quatre images'},{options:2,opposite:true,name:'Les contraires, deux images'},{options:3,opposite:true,name:'Les contraires, trois images'}]),make:ecoleTogetherItem},'petits','lire','ferme');

/* ---------- 11. Pareil que le modèle ---------- */
const ECOLE_MONSTER_COLORS=['#e8574e','#3c87d6','#f2c230','#47ad66'];
const ECOLE_MONSTER_BIG=['color','hat'],ECOLE_MONSTER_SMALL=['eyes','mouth','arms','spots'];
function ecoleMonsterSVG(m){
 const arms=m.arms?'M18 52 L6 30 M82 52 L94 30':'M18 56 L6 72 M82 56 L94 72';
 const eyes=m.eyes===1?'<circle cx="50" cy="42" r="9" fill="#fff"/><circle cx="50" cy="43" r="4" fill="#1f2e45"/>':'<circle cx="38" cy="42" r="8" fill="#fff"/><circle cx="62" cy="42" r="8" fill="#fff"/><circle cx="38" cy="43" r="3.5" fill="#1f2e45"/><circle cx="62" cy="43" r="3.5" fill="#1f2e45"/>';
 const mouth=m.mouth?'<path d="M36 62 Q50 76 64 62" fill="none" stroke="#1f2e45" stroke-width="4" stroke-linecap="round"/>':'<ellipse cx="50" cy="66" rx="9" ry="7" fill="#1f2e45"/>';
 const spots=m.spots?'<circle cx="30" cy="70" r="4" fill="#ffffffaa"/><circle cx="70" cy="74" r="5" fill="#ffffffaa"/><circle cx="62" cy="84" r="3" fill="#ffffffaa"/>':'';
 const hat=m.hat?'<polygon points="50,2 64,22 36,22" fill="#7b4fc2" stroke="#2c3e55" stroke-width="2"/><circle cx="50" cy="3" r="4" fill="#f2c230"/>':'';
 return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${arms}" stroke="#2c3e55" stroke-width="6" stroke-linecap="round"/><rect x="18" y="20" width="64" height="74" rx="30" fill="${ECOLE_MONSTER_COLORS[m.color]}" stroke="#2c3e55" stroke-width="3"/>${eyes}${mouth}${spots}${hat}</svg>`;
}
function ecoleMonsterKey(m){return [m.color,m.hat,m.eyes,m.mouth,m.arms,m.spots].join('');}
function ecoleMonsterVary(m,attr){const v={...m};if(attr==='color')v.color=(m.color+1+rnd(3))%4;else if(attr==='eyes')v.eyes=m.eyes===1?2:1;else v[attr]=!m[attr];return v;}
function ecoleDetailItem(ctx){
 const L=ctx.L,model={color:rnd(4),hat:Math.random()<.5,eyes:pick([1,2]),mouth:Math.random()<.5,arms:Math.random()<.5,spots:Math.random()<.5};
 const attrs=L.big?ECOLE_MONSTER_BIG:ECOLE_MONSTER_SMALL,variants=[];const seen=new Set([ecoleMonsterKey(model)]);let guard=0;
 while(variants.length<L.options-1&&guard++<50){const v=ecoleMonsterVary(model,pick(attrs));if(!seen.has(ecoleMonsterKey(v))){seen.add(ecoleMonsterKey(v));variants.push(v);}}
 const opts=shuffle([{m:model,ok:true},...variants.map(m=>({m,ok:false}))]);
 return {cls:'ecole-stage ecole-detail',say:ECOLE_VOICE.detailAsk,caption:'Trouve le même dessin',exemplar:'pareil:'+ecoleMonsterKey(model)+':'+variants.map(ecoleMonsterKey).join(','),render(st,api){
  let target;const row=ecoleRow(opts.length,opts.map(o=>{const b=ecoleFigureCard(ecoleMonsterSVG(o.m),'dessin');if(o.ok)target=b;onTap(b,()=>api.answer(o.ok,{el:b,correctEl:target,feedback:ECOLE_VOICE.detailWrong,praise:ECOLE_VOICE.detailDone}));return b;}));
  api.key(target);uWrap(st,h('div',{class:'ecole-model-ref'},h('small',null,'Le modèle'),h('span',{class:'ecole-shape big',html:ecoleMonsterSVG(model)})),row);
 }};
}
ecoleRegister('pareilModele',{title:'Pareil que le modèle',sub:'Observer les détails',icon:'🔍',color:'gold',stage:'#fffaf0',
 levels:ecoleLevels('pareil','M1',[{options:2,big:true,name:'Deux dessins, une grande différence',n:5},{options:3,big:true,name:'Trois dessins, grandes différences',n:5},{options:3,name:'Trois dessins, petits détails',n:5},{options:4,name:'Quatre dessins, petits détails',n:5}]),make:ecoleDetailItem},'petits','jouer','ombres');

/* Place finale dans chaque thème : de l’entrée la plus concrète à la plus exigeante. */
const ECOLE_PLACES=[['grands','lire','lettresMiroir','balade'],['grands','lire','petitsMots','pseudoMot'],['grands','lire','phraseOrdre','lisFais'],['grands','lire','graphies','phraseOrdre'],
 ['grands','calculer','maisonNombres','blocs'],['grands','calculer','nombresLettres','pontDix'],['grands','calculer','formesSolides','grandeurs'],['grands','calculer','calendrier','heure'],
 ['petits','lire','ensemble','ferme'],['petits','jouer','copieModele','formes'],['petits','jouer','pareilModele','ombres']];
if(typeof THEME_DIFFICULTY_ORDER!=='undefined')for(const [world,theme,id,after] of ECOLE_PLACES){
 const order=THEME_DIFFICULTY_ORDER[world]&&THEME_DIFFICULTY_ORDER[world][theme];if(!order)continue;
 const was=order.indexOf(id);if(was>=0)order.splice(was,1);const at=order.indexOf(after);order.splice(at>=0?at+1:order.length,0,id);
}

/* ---------- Toutes les phrases que Charline doit avoir enregistrées ---------- */
function ecoleParcoursVoiceLines(){
 const out=[];const add=(...xs)=>xs.flat(4).forEach(x=>{if(typeof x==='string'&&x.trim())out.push(x);});
 const walk=v=>{if(typeof v==='string')add(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};walk(ECOLE_VOICE);
 add('Oui !');
 Object.values(ECOLE_MIRROR_WORDS).forEach(list=>list.forEach(([w])=>add(w)));
 ECOLE_GRAPH_FAMILIES.forEach(f=>{add(f.anchor[0]);f.rule().forEach(x=>{if(typeof x==='string')add(x);});f.words.forEach(([w])=>add(w));});
 ECOLE_NOUNS.forEach(n=>{add(n.w,(n.g==='m'?'un ':'une ')+n.w,(n.g==='m'?'le ':'la ')+n.w);if(n.pl)add('des '+n.pl,'les '+n.pl);});
 ECOLE_PEOPLE.forEach(p=>add(p.w));ECOLE_PRONOUN_VERBS.forEach(v=>add('Il '+v+'.','Elle '+v+'.'));
 ECOLE_ORDER_SENTENCES.forEach(s=>add(s.s));
 for(let N=3;N<=10;N++)for(let a=0;a<=N;a++)add(ecoleHouseSay(N,a),nw(a)+' et '+nw(N-a)+', ça fait '+nw(N)+'.','Pense à la maison : '+nw(a)+' et combien font '+nw(N)+' ?','La maison du '+nw(N));
 for(let n=0;n<=100;n++)add(nw(n),'La réponse, c’est '+nw(n)+'.');
 add('Tape ta réponse avec les chiffres.','Pas tout à fait.','Tape-la pour continuer.','Pas tout à fait. Essaie encore !');
 ECOLE_DAYS.forEach(d=>add(d,`Quel jour vient après ${d} ?`,`Quel jour vient avant ${d} ?`,`Aujourd’hui, c’est ${d}. Quel jour serons-nous demain ?`,`Aujourd’hui, c’est ${d}. Quel jour était-ce hier ?`));
 ECOLE_MONTHS.forEach(m=>add(m,`Quel mois vient après ${m} ?`));
 ECOLE_SEASONS.forEach(s=>{add(s.id);s.months.forEach(m=>add(`En quelle saison est le mois de ${m} ?`,ecoleSeasonSentence(m,s)));});
 ['carré','rectangle','triangle'].forEach(n=>add(`Touche le ${n}.`,`C’est le ${n}.`));add('Touche le rond.','C’est le rond.');
 for(let k=3;k<=6;k++)add(`${nw(k)} côtés.`,`${nw(k)} sommets.`);
 Object.keys(ECOLE_SOLIDS).forEach(n=>{const fem=n==='boule'||n==='pyramide';add(fem?`Touche la ${n}.`:`Touche le ${n}.`,fem?`C’est la ${n}.`:`C’est le ${n}.`);});
 add('La boule roule.','Le cône roule.','Le cylindre roule.');
 ECOLE_EVERYDAY.forEach(o=>add(`Quel solide a la même forme que ${o.label} ?`));Object.keys(ECOLE_SOLIDS).forEach(n=>add(`C’est ${ecoleSolidName(n)}.`));
 ECOLE_MODEL_COLORS.forEach(c=>add(c.id));
 ECOLE_TOGETHER.forEach(p=>add(ecoleTogetherAsk(p),p.why));
 ECOLE_OPPOSITES.forEach(([a,b])=>[[a,b],[b,a]].forEach(([x,y])=>add(`Quel est le contraire de ${x[1]} ?`,`Le contraire de ${x[1]}, c’est ${y[1]}.`)));
 return uniq(out);
}

/* ---------- Mise en page ---------- */
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent=`
.ecole-stage .upgrade-wrap{gap:16px;align-items:center}
.ecole-pic{display:inline-flex;align-items:center;justify-content:center;font-size:54px;line-height:1}
.ecole-pic.big{font-size:clamp(70px,13vw,110px)}
.ecole-pic .lumi-illustration{width:1em;height:1em}
.ecole-picture-line{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}
.ecole-gap-word,.ecole-big-word{font-size:clamp(40px,8vw,72px);letter-spacing:.02em;background:#fff;border-radius:22px;padding:4px 22px 14px;box-shadow:0 6px 0 rgba(31,46,69,.10)}
.ecole-gap{display:inline-block;line-height:1.15;min-width:1.1em;text-align:center;color:#b46a1f;border-bottom:4px dashed #d79a52;margin:0 .05em}
.ecole-gap.filled{color:#2b8050;border-bottom-color:#2b8050}
.ecole-gap.big{font-size:clamp(46px,9vw,80px);min-width:1.4em}
.ecole-letter-pair{display:flex;gap:40px;line-height:1.25;font-size:clamp(90px,16vw,150px);background:#fff;border-radius:26px;padding:0 40px 18px;box-shadow:0 6px 0 rgba(31,46,69,.10)}
.ecole-letter-card .ecole-card-text{font-size:clamp(52px,10vw,86px)}
.ecole-card-text{font-size:clamp(28px,5vw,44px);line-height:1.4}
.ecole-card-text.small{font-size:20px}
.ecole-word-list{display:flex;flex-direction:column;align-items:stretch;gap:12px;min-width:min(420px,88vw)}
.ecole-word-list .card{width:100%;min-height:76px;font-size:clamp(28px,5.4vw,42px);justify-content:center;position:relative}
.ecole-word-list .card .spk{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;color:#6b7c95}
.ecole-graph-mark{color:#c0392b;font-weight:400;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:6px}
.ecole-rule-card{display:flex;align-items:center;gap:20px;background:#fff;border-radius:26px;padding:16px 26px;box-shadow:0 6px 0 rgba(31,46,69,.10)}
.ecole-rule-word{font-size:clamp(44px,8vw,72px)}
.ecole-phrase-line{font-size:clamp(36px,7vw,62px);background:#fff;border-radius:20px;padding:4px 22px 14px}
.ecole-count-pics{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.ecole-count-pics .ecole-pic{font-size:clamp(64px,11vw,92px)}
.ecole-sentence{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;justify-content:center;background:#fff;border-radius:20px;padding:10px 18px 16px;min-height:70px;font-size:clamp(28px,5vw,40px)}
.ecole-slot{min-width:2.2em;line-height:1.25;min-height:1.3em;border-bottom:3px dashed #9fb0c6;text-align:center;color:#9fb0c6}
.ecole-slot.filled{color:#1f2e45;border-bottom-color:transparent}
.ecole-tiles{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.ecole-tile{min-width:96px;min-height:72px;font-size:clamp(26px,4.6vw,38px)}
.ecole-tile.used{opacity:.25}
.ecole-house-wrap{display:flex;justify-content:center}
.ecole-house{display:flex;flex-direction:column;align-items:center;min-width:220px}
.ecole-roof{width:0;height:0;border-left:130px solid transparent;border-right:130px solid transparent;border-bottom:82px solid #e8775e;position:relative}
.ecole-roof b{position:absolute;left:50%;top:26px;transform:translateX(-50%);font-size:44px;color:#fff;font-weight:400}
.ecole-floors{background:#fff6e3;border:4px solid #c9925a;border-top:0;padding:8px 12px;display:flex;flex-direction:column;gap:8px;min-width:220px}
.ecole-floor{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:4px;border-radius:12px}
.ecole-floor.focus{background:#fff0b0;box-shadow:0 0 0 3px #e1b23a}
.ecole-room{background:#fff;border:3px solid #9fb7d3;border-radius:12px;font-size:38px;text-align:center;min-height:58px;line-height:1.4}
.ecole-dots{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.ecole-dots i{width:20px;height:20px;border-radius:50%;border:2px dashed #7d93ad;background:#fff}
.ecole-dots i.on{background:#3b82c4;border:2px solid #2b5e90}
.ecole-big-number{font-size:clamp(80px,15vw,130px);background:#fff;border-radius:26px;padding:0 34px 10px;box-shadow:0 6px 0 rgba(31,46,69,.10)}
.ecole-days-strip{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;font-size:clamp(22px,3.6vw,32px)}
.ecole-days-strip>*{background:#fff;border-radius:16px;padding:6px 16px 12px}
.ecole-days-strip b{font-weight:400;background:#fff0b0}
.ecole-month{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;background:#fff;border-radius:18px;padding:8px;max-width:min(430px,92vw);width:100%}
.ecole-month b{font-weight:400;font-size:15px;line-height:1.3;text-align:center;color:#55647b}
.ecole-month span{font-size:18px;line-height:1.3;text-align:center;border-radius:8px;background:#f1f5fa;padding:2px 0 4px}
.ecole-month span.empty{background:transparent}
.ecole-month span.ring{background:#fff0b0;box-shadow:0 0 0 3px #d1491f}
.ecole-season{flex-direction:column;gap:4px}
.ecole-day-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.ecole-day{position:relative;min-width:clamp(150px,24vw,210px);min-height:84px;padding-right:38px}
.ecole-day .ecole-card-text{font-size:clamp(26px,4.2vw,36px)}
.ecole-day .spk{position:absolute;right:8px;bottom:8px;width:28px;height:28px;color:#6b7c95}
.ecole-calendar .upgrade-wrap{gap:12px}
.ecole-shape{display:block;width:96px;height:96px}
.ecole-shape.big{width:min(180px,40vw);height:min(180px,40vw)}
.ecole-shape svg{display:block;width:100%;height:100%}
.ecole-shape-card{padding:10px}
.ecole-shape-card .ecole-shape{width:clamp(96px,14vw,128px);height:clamp(96px,14vw,128px)}
.ecole-model-pair{display:flex;gap:26px;align-items:flex-start;justify-content:center;flex-wrap:wrap}
.ecole-model-ref{display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border-radius:20px;padding:8px 14px 14px}
.ecole-model-ref small{font-size:18px;color:#55647b}
.ecole-grid{display:grid;gap:8px}
.ecole-cell{width:clamp(62px,13vw,96px);height:clamp(62px,13vw,96px);border-radius:16px;border:3px dashed #9fb0c6;background:#fff;display:flex;align-items:center;justify-content:center}
.ecole-model-ref .ecole-cell{border-style:solid}
.ecole-cell-button{padding:0;cursor:pointer}
.ecole-cell.focus{border:4px solid #e1b23a;background:#fff8d6;animation:ecole-glow 1.2s ease-in-out infinite alternate}
.ecole-cell i{display:block;width:70%;height:70%;border-radius:50%}
@keyframes ecole-glow{from{box-shadow:0 0 0 0 #f1c94a}to{box-shadow:0 0 0 8px #f1c94a55}}
.ecole-palette{display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
.ecole-paint{width:clamp(84px,16vw,120px);height:clamp(84px,16vw,120px);border-radius:50%;border:5px solid #fff;box-shadow:0 5px 0 rgba(31,46,69,.18)}
.ecole-together-model{display:flex;align-items:center;gap:18px;background:#fff;border-radius:26px;padding:10px 26px}
.ecole-plus{font-size:52px;color:#55647b}
.ecole-pic-card{min-width:112px;min-height:112px}
.ecole-help{align-self:center}
@media(prefers-reduced-motion:reduce){.ecole-cell.focus{animation:none}}
@media(max-width:600px){.ecole-roof{border-left-width:110px;border-right-width:110px}.ecole-tile{min-width:80px}}
`;document.head.append(style);}
