/* Short sessions, explicit access and descriptive records. No school certification. */
const FAMILY_LINES={
 start:'Commencer ma séance.',demo:'Voici une petite démonstration. Regarde le geste.',turn:'À toi de jouer.',
 locked:'Cette activité se prépare avec les jeux précédents. Un adulte peut aussi l’ouvrir.',
 finished:'Tu as terminé cette série. Tu peux faire une pause ou choisir la suite.',
 add:'Touche pour ajouter.',remove:'Touche pour enlever.',restart:'Touche pour recommencer.',look:'Touche pour regarder.',ready:'Touche quand c’est prêt.',
 showAdult:'Tu peux montrer ce que tu sais faire à un adulte.',choose:'Choisis une activité.',checked:'Tu as pris le temps de vérifier.',
 balance:'Regarde les deux côtés : ils doivent avoir autant de cubes.',count:'Un cube dans chaque case.',match:'Choisis la même image.',
 path:'Regarde le départ, puis suis le chemin.',piece:'Choisis la pièce, puis sa place.',listen:'Écoute, puis touche l’image.',
 stroke:'Trace un trait avec ton doigt.',sequence:'Regarde comment le motif se répète. Choisis l’image qui vient après.',
 grid:'Regarde le personnage qui manque. Un seul de chaque par ligne et par colonne.',
 order:'Compare les tailles. Commence par le plus petit.',table:'Regarde la couleur de la ligne et la forme de la colonne.',
 letters:'Regarde les lettres de gauche à droite. Tu peux les toucher pour les écouter.',
 audio:'Écoute les propositions. Ensuite, choisis celle qui correspond au mot écrit.',
 place:'Choisis l’objet, puis touche la place demandée.',search:'Regarde l’image du modèle, puis retrouve la même image.',
 relation:'Observe le lien entre les deux images. Retrouve le même lien dans la deuxième paire.',
 bars:'Regarde les groupes. Chaque barre représente une quantité.',story:'Regarde l’image du début, puis celle de la fin.',
 fingers:'Touche les doigts pour les lever, un à un.',numberline:'Touche chaque case, dans l’ordre.'
};
const FAMILY_VOICE=Object.values(FAMILY_LINES);
function familyGuidanceVoiceLines(){return FAMILY_VOICE.slice();}
const FAMILY_ICONS={consignesP:'📦',alphabetP:'🔤',sonsP:'👂',ferme:'🐄',tailles:'📏',nombres:'🧮',grandpetit:'🐘',lecture:'📖',lettre1:'🚩',rappel:'🔁',mots:'✏️',riviere:'🧱',balade:'🔠',memo:'🐶',memoG:'🐶',memoMots:'🗂️',suites:'🟣',suitesG:'🟣',sudoku:'🔲',monstre:'🍪',monstreP:'🍪',recit:'🎞️',recitP:'🎞️',atelier:'🎨',messages:'💌',livres:'📚',blocs:'🧊',blocsP:'🧊',paniers:'🧺'};
for(const [id,icon]of Object.entries(FAMILY_ICONS))if(GAMES[id])GAMES[id].icon=icon;
for(const id of ['suites','suitesG'])if(GAMES[id]?.levels)GAMES[id].levels.forEach(L=>{
 if(L.num)L.name=(L.down?'Reculer':'Avancer')+' de '+(L.steps||[1]).join(' ou ')+(L.mid?' · nombre au milieu':' · nombre à la fin');
 else L.name='Motif '+(L.pats||['AB']).join(' / ')+(L.mid?' · au milieu':' · à la fin')+' · '+(L.miss||1)+' place'+((L.miss||1)>1?'s':'')+' · '+(L.opts||3)+' choix'+(L.kind==='col'?' · couleurs':' · images');
});
for(const id of ['monstre','monstreP'])if(GAMES[id]?.levels)GAMES[id].levels.forEach(L=>L.name=(L.op==='+'?'Ajouter':L.op==='-'?'Enlever':'Compter')+' jusqu’à '+L.max+(L.mode?' · '+L.mode:''));
if(GAMES.robot?.levels)GAMES.robot.levels.forEach(L=>L.name=(L.sz||3)+' × '+(L.sz||3)+' cases · chemin de '+L.steps+' pas');
for(const id of ['recit','recitP'])if(GAMES[id]?.levels)GAMES[id].levels.forEach((L,i)=>L.name=L.frames+' images : '+(L.listen?'écouter et trouver la fin':L.cause?'comprendre la cause':L.anchor?'début donné':L.frames===4?'récit complet':'sans début donné'));
if(GAMES.sonsP?.levels)GAMES.sonsP.levels.forEach(L=>L.name='Sons '+L.keys.join(' · ')+(L.name?' · '+L.name:''));
for(const id of ['suites','suitesG','monstre','monstreP','recit','recitP','sonsP']){
 const levels=GAMES[id]?.levels;if(!levels)continue;const counts={};for(const L of levels)counts[L.name]=(counts[L.name]||0)+1;
 levels.forEach((L,i)=>{if(counts[L.name]>1)L.name+=' · '+(L.len?'modèle de '+L.len+' éléments':'étape '+(i+1));});
}
const FAMILY_ACTIVITY_ORDER={
 grands:{lire:['recit','syllabes','lecture','lettre1','rappel','mots','riviere','balade','pseudoMot','lectureEclair','lisFais','livres'],calculer:['blocs','ligne','pontDix','paniers','calcul','rappelCalcul','balance','barres','marche','grandeurs','heure'],jouer:['memoG','robot','lynxG','cherche','tangram','suitesG','rangerG','tableau','sudoku','analogies','cheminG','miroir','memoMots']},
 petits:{calculer:['doigts','tailles','nombres','blocsP','grandpetit','ligneP'],jouer:['formes','ombres','monstreP','puzzle','memo','lynx','cherche','suites','tangram','tableau','chemin']}
};
for(const [world,groups]of Object.entries(FAMILY_ACTIVITY_ORDER))for(const [theme,ordered]of Object.entries(groups)){
 const t=THEMES[world].find(t=>t.id===theme);if(!t)continue;const available=t.ids.filter(id=>GAMES[id]);
 t.ids=[...ordered.filter(id=>available.includes(id)),...available.filter(id=>!ordered.includes(id))];
 THEME_DIFFICULTY_ORDER[world][theme]=t.ids.slice();
}
/* A previous visit or an adult opening is preserved. It is never an acquired skill. */
function familyIndependentSounds(p){return Object.entries(p.lecture?.pass||{}).filter(([i,v])=>Number.isInteger(+i)&&+i>=0&&+i<LESSONS.length&&v&&!v.parent&&!v.review).map(([i])=>+i);}
function familyPlayed(p,id){
 const g=p.games?.[id];if(g&&(g.rounds>0||g.unlocked>0||Object.keys(g.best||{}).length))return true;
 if(p.last?.[id]||p.familyEvents?.some(e=>e.id===id))return true;
 if(p.resume?.gid===id||id==='lecture'&&p.resume?.kind==='lesson'||id==='calcul'&&p.resume?.kind==='module')return true;
 if(id==='livres'&&Object.keys(p.bookEvidence||{}).length)return true;
 const keys={mots:['encoding:words'],riviere:['encoding:words'],messages:['writing:message']};
 return (keys[id]||[]).some(k=>{const e=p.evidence?.[k];return !!(e&&(e.alone||e.aided||e.n||e.last));});
}
function familyAccess(id,p=P()){
 if(!GAMES[id])return {ready:false,reason:'Choisis une activité disponible.'};
 if(p.demo===true||S.current==='admin'&&p===P())return {ready:true,admin:true};
 if(p.familyAccess?.[id])return {ready:true,parent:true};
 if(familyPlayed(p,id))return {ready:true,previous:true};
 if((p.parentActions||[]).some(a=>!a.undone&&a.target?.kind==='game'&&a.target.gid===id))return {ready:true,parent:true};
 if(typeof readingPracticeAccess==='function'&&['pseudoMot','lisFais','lectureEclair'].includes(id)){
  const access=readingPracticeAccess(id,p);if(!access.ready)return {...access,reason:'Préparer les sons dans « Apprendre à lire ».'};
 }
 const required={riviere:2,mots:2,balade:3,messages:3,livres:3};
 if(required[id]&&familyIndependentSounds(p).length<required[id]){
  /* This is legacy access, never evidence that these correspondences were mastered. */
  if(Number(p.lecture?.unlocked)>=required[id])return {ready:true,legacy:true};
  return {ready:false,reason:'Réussir seul '+required[id]+' sons dans « Apprendre à lire ».'};
 }
 const needs={pontDix:['nombres','blocs','blocsP'],balance:['pontDix'],barres:['pontDix'],tableau:['formes']};
 if(needs[id]&&!needs[id].some(g=>familyPlayed(p,g)))return {ready:false,reason:'Commencer par « '+(SIMPLE_GAME_NAMES[needs[id][0]]||GAMES[needs[id][0]]?.title||'Compter')+' ».'};
 return {ready:true};
}
function familyLocked(id,access){
 const modal=h('div',{class:'modal',role:'dialog','aria-label':'Préparer cette activité'}),close=()=>modal.remove();
 modal.append(h('div',{class:'sheet'},h('div',{class:'family-lock-picture','aria-hidden':'true'},'🔒'),h('h3',null,SIMPLE_GAME_NAMES[id]||GAMES[id]?.title||'Activité'),h('p',null,access.reason),
  uButton('🔊',()=>Voice.say(FAMILY_LINES.locked),{'aria-label':'Écouter'}),uButton('Revenir aux jeux',close),
  uButton('Un adulte peut ouvrir',()=>parentGate(()=>{P().familyAccess=P().familyAccess||{};P().familyAccess[id]=Date.now();save();close();runGame(id);}))));document.body.append(modal);Voice.say(FAMILY_LINES.locked);
}
const familyTileBefore=simpleGameTile;
simpleGameTile=function(id){const access=familyAccess(id);if(access.ready)return familyTileBefore(id);
 const g=GAMES[id],name=SIMPLE_GAME_NAMES[id]||g.title,t=onTap(h('button',{class:'simple-game family-locked','data-gid':id,'aria-label':name+' · à préparer'},h('span',{class:'simple-game-picture','aria-hidden':'true'},lumiIllustration(g.icon,name)),h('b',null,name),h('small',null,'🔒 '+access.reason)),()=>familyLocked(id,access));
 const view=levelState(id);if(view)t.append(progressMeter(view));return t;
};
const familyRunBefore=runGame;
runGame=function(id){if(!GAMES[id])return Promise.resolve();const access=familyAccess(id);if(!access.ready){familyLocked(id,access);return Promise.resolve();}return familyRunBefore(id);};
/* A demonstration has its own controls, model and hand. It never answers the
   actual question and never writes skill/stars/evidence. It can be skipped. */
function familyDemoKind(id){
 if(id==='doigts')return 'fingers';if(id==='ligne'||id==='ligneP')return 'numberline';
 if(GAMES[id]?.demo)return GAMES[id].demo;
 if(['recit','recitP'].includes(id))return 'story';if(['pseudoMot'].includes(id))return 'audio';if(['lisFais','consignes','consignesP','espace'].includes(id))return 'place';
 if(/memo/.test(id))return 'pairs';if(/trace|cursive|chemin|robot/.test(id))return 'path';if(/tangram|puzzle/.test(id))return 'piece';
 if(/suites/.test(id))return 'sequence';if(id==='sudoku')return 'grid';if(id==='tableau')return 'table';if(id==='analogies')return 'relation';
 if(/taille|ranger/.test(id))return 'order';if(/cherche|lynx/.test(id))return 'search';
 if(/lecture|lettre|balade|riviere|rappel$|mots|sonsP|alphabet|messages|livres/.test(id))return 'letters';
 if(/nombre|bloc|monstre|doigt|ligne/.test(id))return 'count';if(/calcul|pont/.test(id))return 'number';return 'match';
}
function familyDemoNode(id){
 const kind=familyDemoKind(id),node=h('div',{class:'family-demo',role:'dialog','aria-label':'Une démonstration indépendante de la question','data-demo-kind':kind}),board=h('div',{class:'family-demo-board','aria-hidden':'true'}),hand=h('span',{class:'family-demo-hand'},'👆');
 const lines={pairs:FAMILY_LINES.match,path:FAMILY_LINES.path,piece:FAMILY_LINES.piece,balance:FAMILY_LINES.balance,count:FAMILY_LINES.count,number:FAMILY_LINES.count,bars:FAMILY_LINES.bars,sequence:FAMILY_LINES.sequence,grid:FAMILY_LINES.grid,table:FAMILY_LINES.table,relation:FAMILY_LINES.relation,order:FAMILY_LINES.order,search:FAMILY_LINES.search,letters:FAMILY_LINES.letters,audio:FAMILY_LINES.audio,place:FAMILY_LINES.place,match:FAMILY_LINES.match,story:FAMILY_LINES.story};
 const line=FAMILY_LINES[kind]||lines[kind]||FAMILY_LINES.match;
 if(kind==='story'&&typeof narrativeDemoSVG==='function')board.append(h('span',{html:narrativeDemoSVG(false)}),h('span',null,'→'),h('span',{html:narrativeDemoSVG(true)}));
 else if(kind==='fingers')board.append(h('span',{html:mathFingerSVG(2),style:{width:'160px',height:'160px'}}));
 else if(kind==='numberline')board.append(h('div',{class:'family-demo-path'},'1 · 2 · 3 · 4'));
 else if(kind==='path')board.append(h('div',{class:'family-demo-path'},'● · · · 🦋'));
 else if(kind==='piece')board.append(h('div',{class:'family-demo-shape'},'▲'),h('div',{class:'family-demo-slot'},'△'));
 else if(kind==='balance')board.append(h('div',null,'🟦🟦'),h('span',null,'='),h('div',null,'🟦🟦'));
 else if(kind==='bars')board.append(h('div',{class:'family-demo-bars'},'▰▰'),h('div',{class:'family-demo-bars'},'▰'));
 else if(['count','number'].includes(kind))board.append(h('div',{class:'family-demo-blocks'},'🟦 🟦'),h('div',{class:'family-demo-slot'},'□ □'));
 else if(kind==='pairs')board.append(characterPicture(BLUEY_CARDS[0]),characterPicture(BLUEY_CARDS[0]));
 else if(kind==='sequence')board.append(h('div',null,'● ▲ ● ▲'),h('div',{class:'family-demo-slot'},'?'));
 else if(kind==='grid')board.append(h('div',{class:'family-demo-mini-grid'},h('span',null,'●'),h('span',null,'▲'),h('span',null,'▲'),h('span',{class:'family-demo-slot'},'?')));
 else if(kind==='table')board.append(h('div',{class:'family-demo-mini-grid'},h('span',null,'🔵'),h('span',null,'■'),h('span',null,'🔴'),h('span',{class:'family-demo-slot'},'■')));
 else if(kind==='order')board.append(...[20,40,60].map(size=>h('span',{class:'family-demo-size',style:{width:size+'px',height:size+'px'}})));
 else if(kind==='letters')board.append(h('div',{class:'family-demo-letter'},'m'),h('span',null,'→'),h('div',{class:'family-demo-letter'},'a'));
 else if(kind==='audio')board.append(h('div',null,'🔊 ①'),h('div',null,'🔊 ②'),h('div',{class:'family-demo-slot'},'✓'));
 else if(kind==='place')board.append(lumiIllustration('⚽','balle'),h('div',{class:'family-demo-slot'},'□'));
 else if(kind==='relation')board.append(h('div',null,'🐘 → 🐘'),h('span',{class:'family-demo-slot'},'↔'));
 else if(kind==='search')board.append(lumiIllustration('🌷','tulipe'),h('div',{class:'family-demo-slot'},lumiIllustration('🍎','pomme'),lumiIllustration('🌷','tulipe')));
 else board.append(lumiIllustration('🍎','pomme'),lumiIllustration('🍎','pomme'),lumiIllustration('🌷','tulipe'));
 board.append(hand);node.append(h('h3',null,'Un petit exemple'),board,h('p',null,line));node.demoLine=line;return node;
}
const familyActionIcons={Ajouter:['＋',FAMILY_LINES.add],Enlever:['−',FAMILY_LINES.remove],Refaire:['↶',FAMILY_LINES.restart],Recommencer:['↶',FAMILY_LINES.restart],Regarder:['👀',FAMILY_LINES.look],'C’est prêt':['✓',FAMILY_LINES.ready],Vérifier:['✓',FAMILY_LINES.ready],Fini:['✓',FAMILY_LINES.ready],'Montre-moi':['👀',FAMILY_LINES.look],'Un trait':['〰',FAMILY_LINES.stroke]};
function familyVisualActions(st){if(S.world!=='petits')return;
 for(const b of st.querySelectorAll('button')){if(b.classList.contains('family-action-icon')||b.querySelector('img,svg')||b.children.length>1)continue;const text=b.textContent.trim().replace(/^[^A-Za-zÀ-ÿ]+/,'').replace(/\s*[→←↶]$/,'').trim(),act=familyActionIcons[text];if(!act)continue;b.setAttribute('aria-label',text);b.setAttribute('title',text);b.textContent=act[0];b.classList.add('family-action-icon');
  /* Speak before the action, never after a correct-answer feedback has begun. */
  let last=0;const say=()=>{if(Date.now()-last<500)return;last=Date.now();Voice.say(act[1]);};
  if(window.PointerEvent)b.addEventListener('pointerdown',say);else{b.addEventListener('touchstart',say,{passive:true});b.addEventListener('mousedown',say);}b.addEventListener('focus',say);
 }
}
let FAMILY_DEMO_ACTIVE=false;
/* 25/10/2026 : à la demande du parent, plus de démonstration avant les exercices. */
let FAMILY_DEMOS_ENABLED=false;
function familyShowDemo(id,run,p){return new Promise(resolve=>{
 const st=Shell.stage,cover=familyDemoNode(id);let released=false;FAMILY_DEMO_ACTIVE=cover;st.innerHTML='';st.append(cover);Shell.item={say:[FAMILY_LINES.demo,cover.demoLine]};Shell.caption('Un petit exemple');
 const release=()=>{if(released)return;released=true;cover.remove();if(FAMILY_DEMO_ACTIVE===cover){FAMILY_DEMO_ACTIVE=false;Timer.last=Date.now();Voice.stop();}if(Shell.skipCurrent===release)Shell.skipCurrent=null;const active=!run.abort&&RUN===run;if(active){p.familyDemos=p.familyDemos||{};p.familyDemos[id]=Date.now();save();}resolve(active);};
 cover.append(uButton('▶',release,{'aria-label':'Commencer le jeu','data-demo-start':'yes'}));Shell.skipCurrent=release;Voice.say([FAMILY_LINES.demo,cover.demoLine]);setTimeout(release,5000);
 });}
const familyEngineBefore=Engine.play.bind(Engine);
Engine.play=async function(item,run){
 const id=run.gid||'activite',p=P(),owner=S.current;
 if(FAMILY_DEMOS_ENABLED&&!run.exam&&!window.__TEST__&&(document.defaultView||window.__DEMO_TEST__)&&!p.familyDemos?.[id]&&GAMES[id]){
  const active=await familyShowDemo(id,run,p);if(!active)return {first:null,skipped:true,cancelled:true,demoOnly:true};
 }
 let observer=null,result;try{
  /* The original object identity is part of the cancellation/replay contract. */
  const pending=familyEngineBefore(item,run);familyVisualActions(Shell.stage);
  if(S.world==='petits'&&typeof MutationObserver!=='undefined'){observer=new MutationObserver(()=>{if(RUN===run&&!run.abort&&Shell.item)familyVisualActions(Shell.stage);});observer.observe(Shell.stage,{childList:true,subtree:true});}
  result=await pending;
 }finally{if(observer)observer.disconnect();}
 if(!run.abort&&RUN===run&&S.current===owner&&result&&!result.demoOnly){
  const events=p.familyEvents||(p.familyEvents=[]);events.push({at:Date.now(),id,first:result.first,helped:!!result.helped,skipped:!!result.skipped,exam:!!run.exam,level:run.levelIndex??null,key:item.evidenceKey||item.skill||id});if(events.length>600)events.splice(0,events.length-600);save();
 }return result;
};
/* 25/10/2026 : à la demande du parent, plus de pause imposée par défaut. Les anciens réglages (15/20 min) ne s’appliquent plus ; seul un nouveau choix explicite du parent rétablit une limite. */
function familyTimerLimit(id=S.current){const raw=S.settings.pauseLimitByChild?.[id];if(raw!==undefined){const n=Number(raw);if(Number.isFinite(n)&&n>=0)return Math.min(180,n);}return 0;}
function familyLocalDay(time=Date.now()){const d=new Date(time);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
Timer.byChildUsed={};Timer.familyOwner=S.current;
Timer.tick=function(){const now=Date.now(),delta=Math.min(30000,Math.max(0,now-this.last));this.last=now;const id=S.current;
 if(this.familyOwner!==id){this.familyOwner=id;this.used=this.byChildUsed[id]||0;return;}
 if(this.paused||FAMILY_DEMO_ACTIVE||(!Shell.isOpen()&&!document.querySelector('.ov-screen'))||document.querySelector('.parent,.modal,.who-screen')||document.visibilityState==='hidden')return;
 this.byChildUsed[id]=(this.byChildUsed[id]||0)+delta;this.used=this.byChildUsed[id];
 const p=P(),day=familyLocalDay(now),days=p.familyTimeDays||(p.familyTimeDays={});days[day]=Math.max(0,Number(days[day])||0)+delta;for(const d of Object.keys(days).sort().slice(0,-35))delete days[d];
 const lim=familyTimerLimit();if(lim&&this.used>=lim*60000){this.byChildUsed[id]=0;this.pause();}save();
};
function familyWeekSummary(p,now=Date.now()){
 const since=now-7*86400000,ev=(p.familyEvents||[]).filter(e=>e.at>=since&&e.at<=now),seen=new Map();for(const e of ev){if(!seen.has(e.id))seen.set(e.id,[]);seen.get(e.id).push(e);}
 const named=ids=>ids.map(id=>SIMPLE_GAME_NAMES[id]||GAMES[id]?.title||id).slice(0,3).join(', ')||'aucune observation cette semaine';
 const independent=[],working=[],retry=[];for(const[id,es]of seen){const answers=es.filter(e=>e.first!=null&&!e.skipped),ok=answers.filter(e=>e.first&&!e.helped);if(ok.length>=3)independent.push(id);else if(answers.length)working.push(id);if(answers.some(e=>!e.first||e.helped))retry.push(id);}
 const mins=Math.round(Object.entries(p.familyTimeDays||{}).filter(([day])=>Date.parse(day+'T23:59:59Z')>=since).reduce((s,[,ms])=>s+ms,0)/60000);
 return ['Réussi seul : '+named(independent),'En cours : '+named(working),'À reprendre : '+named(retry),'Temps de jeu observé : '+mins+' min','Exercices passés : '+ev.filter(e=>e.skipped).length];
}
function familyBooksVisited(p){return Object.entries(p.bookEvidence||{}).filter(([,e])=>!!e&&(!!e.completedAt||!!e.at&&!e.skipped||e.attempts?.some(a=>a.at&&!a.skipped)));}
function familyCollection(){const p=P(),ov=ovScreen('Mes découvertes'),sounds=familyIndependentSounds(p);ov.body.append(h('p',null,'Tu peux montrer ces jeux à un adulte.'),h('h3',null,'Les sons retrouvés seul'),h('div',{class:'family-sound-map'},LESSONS.map((L,i)=>h('span',{class:sounds.includes(i)?'seen':'not-seen'},L.main))));
 const books=familyBooksVisited(p);ov.body.append(h('h3',null,'Mes livres parcourus'),h('p',null,books.map(([id])=>MINI_BOOKS.find(b=>b.id===id)?.title||id).join(' · ')||'Les livres viendront après les premiers sons.'));
 const facts=Object.values(p.mathPractice?.encountered||p.mathReview?.facts||p.mathFacts||{});ov.body.append(h('h3',null,'Mes nombres et calculs'),h('p',null,facts.length?'Tu as déjà rencontré des calculs. Retrouve-les dans ton rappel.':'Compte, construis des nombres et essaie tes premiers calculs.'),h('p',{class:'u-note'},'Ce carnet garde des réussites dans les jeux. Un adulte peut aussi les observer en dehors de l’écran.'));Voice.say(FAMILY_LINES.showAdult);}
function familyMathReviewDue(p,now=Date.now()){return Object.values(p.mathPractice?.encountered||{}).some(f=>{const r=p.mathPractice?.review?.[f.id];return (!r||r.due<=now)&&(typeof mathFactFromConfig!=='function'||!!mathFactFromConfig({eq:f.eq,ans:f.answer}));});}
const familyRecommendBefore=recommendedGame;
recommendedGame=function(){const p=P();if(S.world==='grands'&&!p.resume&&GAMES.rappelCalcul&&familyMathReviewDue(p))return 'rappelCalcul';const id=familyRecommendBefore();return familyAccess(id).ready?id:(S.world==='petits'?'alphabetP':'lecture');};
const LUMI_RELEASE={version:'2.7.1',date:'27/10/2026',id:'voix-boules-20261027'};
function familyHomeFooter(main){for(const footer of document.querySelectorAll('.family-version'))footer.remove();if(!main||HOME_THEME)return;main.append(h('footer',{class:'family-version',role:'contentinfo'},'Version '+LUMI_RELEASE.version+' · '+LUMI_RELEASE.date));}
const familyHomeBefore=renderHome;
renderHome=function(theme=HOME_THEME){familyHomeBefore(theme);document.body.setAttribute('data-family-child',S.current);for(const oldFooter of document.querySelectorAll('.family-version'))oldFooter.remove();if(HOME_THEME)return;const main=$('.theme-home');if(!main)return;const old=main.querySelector('.suggestion');if(old)old.remove();const id=recommendedGame(),resume=P().resume;
 const box=h('div',{class:'suggestion family-session'},uButton(resume?'▶ Reprendre ma séance':'▶ Commencer ma séance',()=>{if(resume?.kind==='lesson')runLesson(resume.li);else if(resume?.kind==='module')runModule(resume.mi,resume.lv);else runGame(id);}),uButton('🌱 Mes découvertes',familyCollection));main.insertBefore(box,main.querySelector('.themes-grid'));familyHomeFooter(main);
};
const familyShellBefore=Shell.open.bind(Shell);
Shell.open=function(opts){familyShellBefore(opts);if(S.world==='petits'&&this.progressEl){const b=this.progressEl.querySelector('.game-level-button');if(b){const text=h('span',{class:'family-level-label'},b.textContent.replace(' ▾',''));this.progressEl.insertBefore(text,b);b.remove();}}};
function familyEnhanceParent(){const wrap=$('.parent .wrap');if(!wrap||wrap.querySelector('.family-week'))return;const panel=h('div',{class:'pcard family-week'},h('h3',null,'Cette semaine'));
 for(const id of ['luca','lola']){const p=S.progress[id]||{};panel.append(h('h4',null,kid(id).name),...familyWeekSummary(p).map(line=>h('p',null,line)));}panel.append(h('small',null,'Réussi seul décrit des réponses dans le jeu, sans certifier un acquis scolaire.'));wrap.insertBefore(panel,wrap.children[1]);
 const timer=$('#timer',wrap);if(timer){const box=timer.parentNode.parentNode;box.innerHTML='';box.append(h('h3',null,'Temps d’écran'));for(const id of ['luca','lola']){const value=familyTimerLimit(id),sel=h('select',{'aria-label':'Pause pour '+kid(id).name,'data-family-timer':id},uniq([0,10,15,20,30,45,value]).sort((a,b)=>a-b).map(n=>h('option',{value:n,selected:value===n},n?n+' min':'Sans limite')));sel.value=String(value);sel.addEventListener('change',()=>{S.settings.pauseLimitByChild=S.settings.pauseLimitByChild||{};S.settings.pauseLimitByChild[id]=+sel.value;Timer.byChildUsed[id]=0;if(S.current===id)Timer.used=0;Timer.last=Date.now();save();});box.append(h('div',{class:'prow'},h('label',null,kid(id).name),sel));}box.append(h('p',null,'Par défaut : sans limite. Le parent peut choisir une pause.'));}
 const access=h('div',{class:'pcard family-access'},h('h3',null,'Ouvrir une activité')),who=h('select',{'aria-label':'Enfant pour ouvrir une activité'},['luca','lola'].map(id=>h('option',{value:id},kid(id).name))),activity=h('select',{'aria-label':'Activité à ouvrir'}),status=h('p',{role:'status'});who.value=['luca','lola'].includes(S.current)?S.current:'luca';
 const fill=()=>{const previous=activity.value;activity.innerHTML='';const world=S.profiles.find(p=>p.id===who.value)?.world||'grands',ids=uniq(themesOf(world).flatMap(t=>t.ids));for(const id of ids)activity.append(h('option',{value:id},SIMPLE_GAME_NAMES[id]||GAMES[id].title));activity.value=ids.includes(previous)?previous:(ids[0]||'');};who.addEventListener('change',fill);fill();access.append(who,activity,uButton('Ouvrir cet accès',()=>{if(!GAMES[activity.value]||!['luca','lola'].includes(who.value))return;withParentChild(who.value,p=>{p.familyAccess=p.familyAccess||{};p.familyAccess[activity.value]=Date.now();});save();status.textContent='Accès ouvert. Aucun résultat ni étoile n’a été ajouté.';}),status);wrap.insertBefore(access,wrap.children[2]);
 const progress=$('#prog-who',wrap);if(progress&&!progress.familyEnhanced){progress.familyEnhanced=true;progress.addEventListener('change',()=>familyEnhanceParent());}
}
/* The removed gesture game must not remain the small child's default target. */
const familyInitialTargetBefore=parentInitialTarget;
parentInitialTarget=function(id){const target=familyInitialTargetBefore(id);if(target.kind==='game'&&target.gid==='gestes')return withParentChild(id,()=>({kind:'game',gid:'alphabetP',index:gameProg('alphabetP').lvl}));return target;};
const familyParentBefore=parentArea;
parentArea=function(){familyParentBefore();familyEnhanceParent();};
const familyCelebrateBefore=Celebrate.show.bind(Celebrate);
Celebrate.show=function(options){familyCelebrateBefore(options);const acts=$('.celebrate .acts',Shell.el);if(!acts)return;const pause=uButton('🌿 Faire une pause',()=>{Voice.stop();Shell.onClose=null;Shell.close();});acts.append(pause);const panel=$('.celebrate',Shell.el);if(panel&&!panel.querySelector('.family-series-note'))panel.insertBefore(h('p',{class:'family-series-note'},'Série terminée. La suite reste à ton choix.'),acts);};
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`
.family-version{font-size:12px;color:#465d56;text-align:center;line-height:1.8;margin:24px 0 10px;padding:8px 12px;opacity:1}.family-session{display:flex;justify-content:center;align-items:stretch;gap:12px;flex-wrap:wrap;margin:12px auto 24px}.family-session .ubtn:first-child{background:#287f61;color:white;min-height:100px;font-size:25px;padding:15px 28px;min-width:300px}.family-session .ubtn{border:2px solid #bfd7c9;border-radius:24px}.family-locked{background:#f4f4f0!important}.family-locked small{font-size:13px;color:#5c6569;max-width:100%;line-height:1.9}.family-lock-picture{font-size:50px}.family-sound-map{display:flex;flex-wrap:wrap;gap:12px}.family-sound-map span{padding:12px 18px;border:2px solid #dbe2e0;border-radius:15px;font-size:30px}.family-sound-map .seen{background:#e2f3e9;border-color:#58a77a}.family-sound-map .not-seen{color:#7e8787}.family-week p{margin:5px 0}.family-series-note{font-size:16px;text-align:center}.family-level-label{font-size:14px}.family-action-icon{font-size:36px!important;min-width:80px!important;min-height:80px!important}
body[data-family-child="lola"] .stage .ubtn,body[data-family-child="lola"] .stage .u-btn,body[data-family-child="lola"] .stage .block,body[data-family-child="lola"] .stage .node,body[data-family-child="lola"] .stage .card,body[data-family-child="lola"] .stage .mtool{min-width:80px;min-height:80px}body[data-family-child="lola"] .stage .search-object{min-width:0!important;min-height:0!important}
.family-demo{position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;background:#fffef7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:22px;text-align:center;box-sizing:border-box}.family-demo h3,.family-demo p{margin:0}.family-demo-board{display:flex;align-items:center;justify-content:center;gap:30px;min-height:130px;max-width:450px;width:100%;position:relative;font-size:42px}.family-demo-board img,.family-demo-board .lumi-illustration{width:85px;height:100px}.family-demo-hand{position:absolute;left:20%;top:75%;font-size:42px;animation:family-hand 2s ease-in-out infinite}.family-demo-mini-grid{display:grid;grid-template-columns:repeat(2,70px);gap:8px}.family-demo-mini-grid>span{display:grid;place-items:center;min-height:65px;border:2px solid #cbd6d0}.family-demo-size{display:block;background:#76aacc;border:2px solid #314d64;align-self:flex-end}.family-demo-letter{font-size:55px}.family-demo-bars{padding:8px;background:#b5d4e9;border:2px solid #5884a1}.family-demo-slot{border:3px dashed #7c9889;border-radius:15px;padding:12px}.family-demo-path{letter-spacing:8px!important}.family-demo .ubtn{min-width:80px;min-height:65px}.stage{position:relative}@keyframes family-hand{0%,15%{transform:translate(0,0)}55%,80%{transform:translate(145px,-30px)}100%{transform:translate(0,0)}}@media(prefers-reduced-motion:reduce){.family-demo-hand{animation:none;left:55%}}@media(max-width:600px){.family-session .ubtn:first-child{min-width:0;width:100%;font-size:21px}.family-demo-board{font-size:30px;gap:15px}.family-demo{padding:15px}}
`;document.head.append(style);}
