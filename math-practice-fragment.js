/* Concrete practice and spaced recall. Old mathematical modules remain intact. */
const MATH_REVIEW_DAYS=[1,3,7,14,30],MATH_DAY_MS=86400000;
const MATH_PRACTICE_VOICE=[
 'Commence par toucher la première case.','Touche le dé pour avancer.','Touche chaque case, dans l’ordre.','Tu peux faire glisser la ligne pour voir les autres cases.',
 'Chaque point du dé fait avancer d’une dizaine.','Nous avançons ensemble, avec Lumi.','Tu as parcouru toute la ligne.','Regarde où tu es. Touche la case suivante.',
 'Calcule dans ta tête. Écris le nombre manquant.','Regarde encore. Tu peux utiliser les points.','Découvre d’abord quelques calculs. Ensuite, tu pourras les retrouver ici.',
 'Tu peux refaire ces calculs pour t’entraîner.','Complète le cadre pour faire dix.','Combien faut-il ajouter pour faire dix ?','Tu peux regarder le cadre si tu en as besoin.',
 'Les deux côtés doivent contenir autant de cubes. Trouve le nombre manquant.','Le signe égal veut dire : autant de chaque côté.','Regarde les cubes de chaque côté.',
 'Écoute l’histoire. Place les deux barres. Puis choisis ce qu’il faut faire.','Place d’abord la barre bleue, puis la barre rouge.','Regarde les couleurs des deux barres.',
 'Choisis ce qu’il faut faire avec les deux groupes.','Regarde les deux barres pour trouver combien.','Il faut réunir les deux groupes.','Il faut chercher la différence.','Il faut partager en deux groupes égaux.',
 'Chaque petit carré vaut une unité. Combien d’unités mesure le trait ?','Touche le trait le plus long.','Touche le trait le plus court.',
 'Chaque cube pèse autant. Touche le plateau le plus lourd.','Compte les cubes de chaque plateau.','Choisis les pièces à rendre.','C’est trop. Recommence avec moins de pièces.','Il n’y a rien à rendre.',
 'Écoute les nombres et montre les doigts.','Touche les doigts pour les lever, un à un.','Maintenant, montre cette quantité avec ta propre main, loin de l’écran.',
 'Tape ta réponse avec les chiffres.','Pas tout à fait. Essaie encore !','Tape-la pour continuer.','Oui !','Tu as terminé ! Merci d’avoir joué.'
];
function mathPracticeState(p=P()){
 const s=p.mathPractice||(p.mathPractice={v:1,encountered:{},review:{}});
 s.encountered=s.encountered||{};s.review=s.review||{};return s;
}
function mathFactFromConfig(config){
 if(!Array.isArray(config.eq)||!Number.isInteger(config.ans)||config.ans<0||config.ans>100)return null;
 let form=config.eq.slice();if(form.filter(x=>x==='?').length===2&&form.length===5&&form[1]==='+'&&form[3]==='=')form[0]=config.ans;
 if(form.filter(x=>x==='?').length!==1||form.some(x=>typeof x!=='number'&&!['?','+','-','−','='].includes(x)))return null;
 const complete=form.map(x=>x==='?'?config.ans:x),equal=complete.indexOf('=');
 const evaluate=parts=>{if(!parts.length||typeof parts[0]!=='number')return NaN;let value=parts[0];for(let i=1;i<parts.length;i+=2){if(!['+','-','−'].includes(parts[i])||typeof parts[i+1]!=='number')return NaN;value+=parts[i]==='+'?parts[i+1]:-parts[i+1];}return value;};
 if(equal<0||evaluate(complete.slice(0,equal))!==evaluate(complete.slice(equal+1)))return null;
 if(complete.some(x=>typeof x==='number'&&(!Number.isInteger(x)||x<0||x>100)))return null;
 return {id:form.join('|'),eq:form,answer:config.ans};
}
const keypadBeforeMathPractice=kpItem,choiceBeforeMathPractice=chItem;
kpItem=function(config){const item=keypadBeforeMathPractice(config),fact=mathFactFromConfig(config);return fact?{...item,mathPracticeFact:fact}:item;};
chItem=function(config){const item=choiceBeforeMathPractice(config),fact=mathFactFromConfig(config);return fact?{...item,mathPracticeFact:fact}:item;};
function observeMathFact(p,fact,result,now=Date.now()){
 if(!fact||!result||result.skipped||result.first==null)return false;
 const state=mathPracticeState(p),old=state.encountered[fact.id];state.encountered[fact.id]={...fact,firstSeen:old?.firstSeen||now,lastSeen:now,exposures:(old?.exposures||0)+1};return true;
}
const engineBeforeMathPractice=Engine.play.bind(Engine);
Engine.play=async function(item,run){
 const p=P(),result=await engineBeforeMathPractice(item,run);
 if(!run.abort&&RUN===run&&run.gid!=='rappelCalcul'&&item.mathPracticeFact&&observeMathFact(p,item.mathPracticeFact,result))save();
 return result;
};
function mathReviewPlan(p=P(),now=Date.now()){
 const state=mathPracticeState(p),facts=Object.values(state.encountered).filter(f=>mathFactFromConfig({eq:f.eq,ans:f.answer}));
 const due=facts.filter(f=>!state.review[f.id]||(state.review[f.id].due||0)<=now).sort((a,b)=>(state.review[a.id]?.due||0)-(state.review[b.id]?.due||0)||(a.lastSeen||0)-(b.lastSeen||0));
 const waiting=facts.filter(f=>!due.includes(f)).sort((a,b)=>(state.review[a.id].lastAt||0)-(state.review[b.id].lastAt||0));
 const plan=[...due,...waiting].slice(0,6);if(!plan.length)return [];
 while(plan.length<6)plan.push(plan[plan.length%Math.min(facts.length,plan.length)]);
 return plan.map(f=>({...f,eq:f.eq.slice()}));
}
function mathReviewRecord(p,fact,result,now=Date.now()){
 if(!result||result.skipped||result.first==null)return false;
 const state=mathPracticeState(p);if(!state.encountered[fact.id])return false;
 const old=state.review[fact.id],e=old||{stage:-1,alone:0,aided:0,attempts:0,due:0,lastAt:0};
 e.attempts++;e.lastAt=now;
 if(result.first&&!result.helped){e.alone++;if(!old||e.due<=now){e.stage=Math.min(MATH_REVIEW_DAYS.length-1,e.stage+1);e.due=now+MATH_REVIEW_DAYS[e.stage]*MATH_DAY_MS;}}
 else{e.aided++;e.stage=-1;e.due=now+MATH_DAY_MS;}
 state.review[fact.id]=e;return true;
}
function mathPracticeKeypad(config){
 const base=kpItem({...config,praise:config.praise||MATH_PRACTICE_VOICE[40],hint:config.hint||MATH_PRACTICE_VOICE[9]});
 return {...base,cls:'upgrade-stage math-practice-stage',answer:config.ans,render(st,api){
  const support=config.strategy?h('div',{class:'math-strategy',hidden:true},config.strategy()):null;
  base.render(st,{...api,answer(ok,options){if(!ok&&support){support.hidden=false;api.help();}return api.answer(ok,options);}});if(support)st.append(support);
 }};
}
function mathReviewItem(fact){
 return mathPracticeKeypad({say:MATH_PRACTICE_VOICE[8],caption:'Un calcul déjà rencontré',eq:fact.eq,ans:fact.answer,hint:MATH_PRACTICE_VOICE[9],strategy:()=>{
  const eq=fact.eq,complete=eq.map(x=>x==='?'?fact.answer:x);
  if(complete.length===5&&complete[3]==='='&&complete[0]<=20&&complete[2]<=20){if(complete[1]==='+'&&complete[4]<=20)return framesFor(complete[0],complete[2]);if(['-','−'].includes(complete[1]))return framesFor(complete[0],0,complete[2]);}
  return h('div',{class:'eq'},complete.map(x=>h('span',null,String(x))));
 }});
}
async function runMathReview(){
 Sfx.ensure();const gid='rappelCalcul',g=GAMES[gid],gp=gameProg(gid),plan=mathReviewPlan();
 if(!plan.length){
  RUN=null;Shell.open({level:g.title,bg:g.stage});Shell.stage.innerHTML='';Shell.stage.className='stage upgrade-stage math-practice-stage';Shell.setDots(0);Shell.item={say:MATH_PRACTICE_VOICE[10]};Shell.caption('Les calculs rencontrés apparaîtront ici.');
  uWrap(Shell.stage,h('p',{class:'u-note'},MATH_PRACTICE_VOICE[10]),uButton('Découvrir des calculs',openCalcul),uButton('Choisir un jeu',()=>Shell.close()));Voice.say(MATH_PRACTICE_VOICE[10]);return;
 }
 const session=resumeSession('game',{gid,li:0});if(!session.mathReviewPlan)session.mathReviewPlan=plan;save();
 const run={gid,levelIndex:0,key:'math-review',session,abort:false,res:[...session.res]};RUN=run;Shell.open({level:g.title,bg:g.stage});Shell.setDots(6);
 for(let i=0;i<6;i++){
  Shell.now(i);if(i<session.next){markResult(i,session.res[i]);continue;}
  const fact=session.mathReviewPlan[i],r=await Engine.play(mathReviewItem(fact),run);if(run.abort||RUN!==run)return;
  run.res.push(r);mathReviewRecord(P(),fact,r);checkpoint(run,i+1);markResult(i,r);
 }
 if(!run.abort&&RUN===run)finishGame(run,g,gp);
}
GAMES.rappelCalcul={id:'rappelCalcul',title:'Mon rappel de calcul',sub:'Six calculs déjà rencontrés, sans chronomètre',icon:'🧠',color:'sky',stage:'#eff7fd',demo:'number',levels:[{name:'Six calculs déjà rencontrés',n:6,skill:'math:review:local',tag:'P1',ref:'Retrouver des faits effectivement rencontrés ; espacement 1, 3, 7, 14, 30 jours, sans valider les modules initiaux'}],open:runMathReview};

function mathLineItem(ctx){
 const L=ctx.L,values=Array.from({length:L.end/L.step},(_,i)=>(i+1)*L.step);
 return {cls:'upgrade-stage math-line-stage',say:[MATH_PRACTICE_VOICE[0],L.coop?MATH_PRACTICE_VOICE[5]:MATH_PRACTICE_VOICE[2],...(L.step===10?[MATH_PRACTICE_VOICE[4]]:[])],caption:L.coop?'Avancer ensemble sur la ligne':'Avancer case par case',lineModel:{values,cooperative:!!L.coop},render(st,api){
  let at=-1,pending=0,wrongs=['ligne','ligneP'].includes(RUN?.gid)?RUN.session?.partialWrongs||0:0,finished=false;const status=h('p',{class:'math-line-status'}),track=h('div',{class:'math-line-track'}),buttons=[];
  const roll=h('button',{class:'math-line-roll','aria-label':'Lancer le dé'},'🎲');
  const update=()=>{buttons.forEach((b,i)=>{b.classList.toggle('current',i===at);b.setAttribute('aria-current',i===at?'step':'false');const marker=b.querySelector('.math-line-pawn');if(marker)marker.remove();if(i===at)b.append(h('span',{class:'math-line-pawn','aria-hidden':'true'},L.coop?'🙂 ✨':'🙂'));});roll.disabled=at<0||pending>0||finished;status.textContent=at<0?'Touche la première case.':pending?'Encore '+pending+' case'+(pending>1?'s':''):'Touche le dé.';const next=buttons[at+1];if(next&&typeof next.scrollIntoView==='function')next.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});};
  values.forEach((value,i)=>{const b=h('button',{class:'math-line-cell','aria-label':String(value),'data-line-index':i},h('span',null,String(value)));onTap(b,()=>{if(!api.alive()||finished)return;if(at>=0&&!pending){Voice.say(MATH_PRACTICE_VOICE[1]);return;}if(i!==at+1){wrongs++;api.step(false,{el:b,feedback:MATH_PRACTICE_VOICE[7]});return;}at=i;if(pending)pending--;Voice.say(nw(value));api.step(true);if(at===values.length-1){finished=true;update();api.finish(wrongs===0,{wrongs,completed:true});}else update();});buttons.push(b);track.append(b);});
  onTap(roll,()=>{if(!api.alive()||roll.disabled)return;pending=rint(1,Math.min(3,values.length-1-at));roll.innerHTML='';roll.append(diceEl(pending));Voice.say(pending===1?'Avance d’une case.':'Avance de '+nw(pending)+' cases.');update();});
  api.strategy=()=>buttons[at+1]?.classList.add('reveal');update();uWrap(st,h('div',{class:'math-line-scroll'},track),roll,status);
 }};
}
for(const [id,world,levels]of [
 ['ligneP','petits',[{end:10,step:1,name:'La ligne de un à dix'},{end:10,step:1,coop:true,name:'Ensemble jusqu’à dix'}]],
 ['ligne','grands',[{end:20,step:1,name:'La ligne de un à vingt'},{end:20,step:1,coop:true,name:'Ensemble jusqu’à vingt'},{end:100,step:10,name:'Les dizaines jusqu’à cent'}]]
])GAMES[id]={id,title:'Avancer sur la ligne',sub:'Le dé et les nombres, sans course',icon:'🎲',color:'sky',stage:'#edf5fb',demo:'number',advanceOnCompletion:true,levels:levels.map((L,i)=>({...L,n:1,skill:'math:line:'+world+':'+i,tag:world==='petits'?'M1–M3':'P1',ref:'Toucher et entendre chaque nombre sur un plateau linéaire ; coopération sans classement'})),make:mathLineItem};

function mathTenBridgeItem(ctx){
 const a=avoidRepeat(ctx,[1,2,3,4,5,6,7,8,9]),answer=10-a,L=ctx.L;
 if(L.mode==='fill')return {cls:'upgrade-stage math-practice-stage',say:MATH_PRACTICE_VOICE[12],caption:'Complète le cadre de dix',model:{a,answer},render(st,api){
  let added=0;const frame=h('div',{class:'math-ten-grid'}),status=h('p',{class:'u-note'},a+' + ? = 10');
  for(let i=0;i<10;i++){const b=h('button',{class:'math-ten-cell'+(i<a?' fixed':''),disabled:i<a,'aria-label':i<a?'Cube déjà placé':'Ajouter un cube'},i<a?'●':'');onTap(b,()=>{if(!api.alive()||b.disabled)return;b.disabled=true;b.classList.add('added');b.textContent='●';added++;Voice.say(nw(added));status.textContent=a+' + '+added+' = '+(a+added);if(added===answer)api.finish(null,{completed:true,practice:true});});frame.append(b);}uWrap(st,frame,status);
 }};
 return mathPracticeKeypad({say:MATH_PRACTICE_VOICE[13],caption:'Compléter à dix',eq:[a,'+','?','=',10],ans:answer,visual:()=>{const box=h('div',{class:'math-frame-support'},frameEl(a));if(L.mode==='hidden'){box.hidden=true;const outer=h('div',null,box);outer.append(uButton('Voir le cadre',()=>{box.hidden=false;const active=Shell.item;if(active)active.helped=true;if(RUN?.session){RUN.session.partialHelped=true;save();}Voice.say(MATH_PRACTICE_VOICE[14]);}));return outer;}return box;},hint:MATH_PRACTICE_VOICE[14]});
}
GAMES.pontDix={id:'pontDix',title:'Le pont des dix',sub:'Construire puis retrouver les compléments',icon:'🌉',color:'teal',stage:'#eaf6f3',demo:'count',advanceOnCompletion:true,levels:[{mode:'fill',name:'Construire dix avec les cubes'},{mode:'visible',name:'Retrouver le complément avec le cadre'},{mode:'hidden',name:'Retrouver le complément sans le cadre'}].map((L,i)=>({...L,n:4,skill:'math:ten-bridge:'+i,tag:'P1',ref:'Compléter à dix du matériel manipulé au rappel ; les aides restent distinctes des réponses seules'})),make:mathTenBridgeItem};
function mathBalanceItem(ctx){
 const a=rint(1,5),b=rint(1,5),fixed=rint(1,a+b-1),answer=a+b-fixed;
 const eq=ctx.L.reverse?['?','+',fixed,'=',a,'+',b]:[a,'+',b,'=','?', '+',fixed];
 const item=mathPracticeKeypad({say:[MATH_PRACTICE_VOICE[15],MATH_PRACTICE_VOICE[16]],caption:'Autant à gauche qu’à droite',eq,ans:answer,visual:ctx.L.concrete?()=>h('div',{class:'math-balance'},h('div',{class:'math-pan'},frameEl(a,b)),h('span',{class:'math-equal'},'='),h('div',{class:'math-pan'},frameEl(fixed),h('span',null,'+ ?'))):null,hint:MATH_PRACTICE_VOICE[17],strategy:()=>h('div',{class:'math-balance'},frameEl(a,b),h('span',{class:'math-equal'},'='),frameEl(fixed,answer))});
 return {...item,model:{a,b,fixed,answer,eq}};
}
GAMES.balance={id:'balance',title:'Équilibrer les deux côtés',sub:'Comprendre le signe égal',icon:'⚖️',color:'teal',stage:'#eef7f3',demo:'balance',levels:[{concrete:true,name:'Autant avec les cubes'},{concrete:false,reverse:true,name:'L’inconnue de l’autre côté'}].map((L,i)=>({...L,n:4,skill:'math:equality:'+i,tag:'P1',ref:'Comprendre une égalité comme deux quantités égales ; inconnue à droite ou à gauche'})),make:mathBalanceItem};

function mathBarsStory(kind,a,b){return kind==='join'?'Lumi a '+nw(a)+' cubes bleus. Elle reçoit encore '+nw(b)+' cubes rouges. Combien de cubes a-t-elle en tout ?':kind==='compare'?'Lumi a '+nw(a)+' cubes bleus. Son ami a '+nw(b)+' cubes rouges. Combien de cubes Lumi a-t-elle de plus ?':'Il y a '+nw(a+b)+' cubes. Partage-les dans deux boîtes, avec autant dans chaque boîte. Combien de cubes y aura-t-il dans chaque boîte ?';}
function mathBarsItem(ctx){
 const kind=ctx.L.kind,a=kind==='compare'?rint(4,9):rint(1,5),b=kind==='compare'?rint(1,a-1):kind==='share'?a:rint(1,5),answer=kind==='join'?a+b:kind==='compare'?a-b:a,operation=kind==='join'?'+':kind==='compare'?'−':'share',story=mathBarsStory(kind,a,b),eq=kind==='share'?null:[a,operation,b,'=','?'];
 return {cls:'upgrade-stage math-practice-stage',say:[story,MATH_PRACTICE_VOICE[18]],caption:'L’histoire, les barres, puis le calcul',model:{kind,a,b,answer,operation},mathPracticeFact:eq?mathFactFromConfig({eq,ans:answer}):null,render(st,api){
  let placed=0,phase='bars';const slots=h('div',{class:'math-bar-slots'},h('div',{class:'math-bar-slot','aria-label':'Place de la barre bleue'}),h('div',{class:'math-bar-slot','aria-label':'Place de la barre rouge'})),tray=h('div',{class:'urow'}),controls=h('div',{class:'urow'}),work=h('div',{class:'math-bar-answer'});
  const unit=Math.min(30,240/Math.max(a,b)),bar=(value,index)=>h('span',{class:'math-bar'+(index?' red':' blue'),style:{width:value*unit+'px'},'aria-label':(index?'Barre rouge, ':'Barre bleue, ')+nw(value)+' cubes'},Array.from({length:value},()=>h('i')));
  [a,b].forEach((value,index)=>{const button=h('button',{class:'ubtn math-bar-piece','data-bar':index},bar(value,index));onTap(button,()=>{if(!api.alive()||phase!=='bars'||button.disabled)return;if(index!==placed)return api.step(false,{el:button,feedback:MATH_PRACTICE_VOICE[19]});button.disabled=true;slots.children[placed].append(bar(value,index));placed++;api.step(true);if(placed===2){phase='operation';controls.hidden=false;Voice.say(MATH_PRACTICE_VOICE[21]);}});tray.append(button);});
  const choices=kind==='share'?['+','share']:['+','−'];choices.forEach(op=>controls.append(uButton(op==='share'?'Partager en deux':op,()=>{if(!api.alive()||phase!=='operation')return;if(op!==operation)return api.step(false,{feedback:MATH_PRACTICE_VOICE[kind==='join'?23:kind==='compare'?24:25]});phase='answer';controls.hidden=true;const input=mathPracticeKeypad({say:MATH_PRACTICE_VOICE[22],eq,ans:answer,hint:MATH_PRACTICE_VOICE[22]});input.render(work,api);Voice.say(MATH_PRACTICE_VOICE[22]);})));
  controls.hidden=true;uWrap(st,uButton('🔊 Écouter l’histoire',()=>Voice.say(story)),slots,tray,controls,work);
 }};
}
GAMES.barres={id:'barres',title:'Résoudre avec les barres',sub:'Manipuler avant de choisir le calcul',icon:'▰',color:'sky',stage:'#eef6ff',demo:'bars',levels:[{kind:'join',name:'Réunir deux groupes'},{kind:'compare',name:'Chercher combien de plus'},{kind:'share',name:'Partager dans deux boîtes'}].map((L,i)=>({...L,n:3,skill:'math:bars:'+i,tag:'P1',ref:'Écouter une histoire, représenter deux quantités, choisir une opération et trouver le résultat'})),make:mathBarsItem};

function mathQuantityStrip(n){return h('div',{class:'math-unit-strip','aria-label':nw(n)+' unités'},Array.from({length:n},()=>h('i')));}
function mathMoneyStory(price,paid){return ['Le prix est de '+nw(price)+(price===1?' euro.':' euros.'),'Tu donnes '+nw(paid)+' euros.'];}
function mathMagnitudeItem(ctx){
 const mode=ctx.L.mode;
 if(mode==='unit'){const answer=rint(2,9);return {...mathPracticeKeypad({say:MATH_PRACTICE_VOICE[26],ans:answer,visual:()=>mathQuantityStrip(answer),hint:MATH_PRACTICE_VOICE[26]}),model:{mode,answer}};}
 if(mode==='change'){
  const paid=ctx.L.paid,price=rint(1,paid),answer=paid-price;
  return {cls:'upgrade-stage math-practice-stage',say:[...mathMoneyStory(price,paid),MATH_PRACTICE_VOICE[31]],caption:'Rendre juste en euros',model:{mode,paid,price,answer},render(st,api){
   let returned=0;const label=h('p',{class:'u-note'},'Prix : '+price+' € · Donné : '+paid+' €'),sum=h('div',{class:'eq'},'0 €'),coins=h('div',{class:'urow'});
   for(const coin of [1,2,5])coins.append(uButton(coin+' €',()=>{if(!api.alive())return;const next=returned+coin;if(next>answer){returned=0;sum.textContent='0 €';return api.step(false,{feedback:MATH_PRACTICE_VOICE[32]});}returned=next;sum.textContent=returned+' €';if(returned===answer)api.answer(true);else api.step(true);}));
   coins.append(uButton('0 €',()=>{if(!api.alive())return;api.answer(answer===0,{feedback:MATH_PRACTICE_VOICE[31],praise:MATH_PRACTICE_VOICE[33]});}));uWrap(st,label,sum,coins);
  }};
 }
 const a=rint(2,7),b=pick([1,2,3,4,5,6,7,8].filter(n=>n!==a)),long=mode==='mass'||ctx.i%2===0,want=long?Math.max(a,b):Math.min(a,b);
 return {cls:'upgrade-stage math-practice-stage',say:MATH_PRACTICE_VOICE[mode==='mass'?29:long?27:28],caption:mode==='mass'?'Des cubes de même masse':'Les traits commencent au même endroit',model:{mode,a,b,answer:want},render(st,api){
  const row=h('div',{class:mode==='mass'?'math-balance':'math-lengths'});let target;
  for(const n of [a,b]){const content=mode==='mass'?h('div',{class:'math-mass-cubes'},Array.from({length:n},()=>h('span',null,'■'))):mathQuantityStrip(n),button=h('button',{class:'ubtn math-magnitude-choice','data-quantity':n,'aria-label':mode==='mass'?nw(n)+' cubes':'Un trait'},content);if(n===want)target=button;onTap(button,()=>{if(api.alive())api.answer(n===want,{el:button,correctEl:target,feedback:MATH_PRACTICE_VOICE[mode==='mass'?30:long?27:28]});});row.append(button);}uWrap(st,row);
 }};
}
GAMES.grandeurs={id:'grandeurs',title:'Mesurer et comparer',sub:'Longueurs, masses et monnaie',icon:'📏',color:'orange',stage:'#fff5e7',demo:'balance',levels:[{mode:'length',name:'Comparer deux longueurs'},{mode:'unit',name:'Mesurer avec la même unité'},{mode:'mass',name:'Comparer des masses avec des cubes'},{mode:'change',paid:5,name:'Rendre la monnaie sur cinq euros'},{mode:'change',paid:10,name:'Rendre la monnaie sur dix euros'}].map((L,i)=>({...L,n:4,skill:'math:magnitudes:'+i,tag:'P1',ref:'Comparer des longueurs avec une unité commune, des masses égales ou rendre une monnaie exacte en euros'})),make:mathMagnitudeItem};

function mathFingerSVG(count){
 const fingers=[{x:11,y:39,w:15,h:34},{x:29,y:10,w:13,h:54},{x:46,y:4,w:13,h:60},{x:63,y:13,w:13,h:53},{x:80,y:29,w:12,h:41}];
 return '<svg viewBox="0 0 106 125" role="img" aria-label="'+count+' doigt'+(count>1?'s':'')+' levé'+(count>1?'s':'')+'"><path d="M22 60 Q54 48 90 62 L88 100 Q58 119 29 99Z" fill="#f5c9a1" stroke="#78583f" stroke-width="3"/>'+fingers.map((f,i)=>'<rect x="'+f.x+'" y="'+(i<count?f.y:58)+'" width="'+f.w+'" height="'+(i<count?f.h:18)+'" rx="7" fill="'+(i<count?'#f5c9a1':'#dca97d')+'" stroke="#78583f" stroke-width="2"/>').join('')+'</svg>';
}
function mathFingersItem(ctx){
 const L=ctx.L,answer=avoidRepeat(ctx,Array.from({length:L.max},(_,i)=>i+1)),prompt=answer===1?'Montre la main avec un doigt.':'Montre la main avec '+nw(answer)+' doigts.';
 if(L.mode==='raise')return {cls:'upgrade-stage math-fingers-stage',say:[prompt,MATH_PRACTICE_VOICE[35]],caption:'Écoute et lève les doigts',model:{answer,mode:'raise'},render(st,api){
  let raised=0;const hand=h('div',{class:'math-hand',html:mathFingerSVG(0)}),buttons=h('div',{class:'urow'});
  for(let i=0;i<5;i++){const button=h('button',{class:'ubtn math-finger-toggle','aria-label':'Lever un doigt'},'☝');onTap(button,()=>{if(!api.alive()||button.disabled)return;button.disabled=true;raised++;hand.innerHTML=mathFingerSVG(raised);Voice.say(nw(raised));if(raised===answer)api.finish(null,{completed:true,practice:true});});buttons.append(button);}uWrap(st,hand,buttons,h('p',{class:'u-note'},MATH_PRACTICE_VOICE[36]));
 }};
 const options=shuffle(uniq([answer,...sample(Array.from({length:L.max},(_,i)=>i+1).filter(n=>n!==answer),2)]));
 return {cls:'upgrade-stage math-fingers-stage',say:prompt,caption:'Regarde combien de doigts sont levés',model:{answer,mode:'recognize'},render(st,api){
  let target;const row=h('div',{class:'urow'},options.map(n=>{const b=h('button',{class:'math-hand-choice','data-fingers':n,'aria-label':nw(n)+(n===1?' doigt':' doigts'),html:mathFingerSVG(n)});if(n===answer)target=b;onTap(b,()=>{if(api.alive())api.answer(n===answer,{el:b,correctEl:target});});return b;}));uWrap(st,row);
 }};
}
GAMES.doigts={id:'doigts',title:'Compter avec les doigts',sub:'Écouter, compter et montrer de un à cinq',icon:'🖐️',color:'pink',stage:'#fff1f6',demo:'count',advanceOnCompletion:true,levels:[{max:3,mode:'recognize',name:'Voir un, deux ou trois doigts'},{max:5,mode:'recognize',name:'Voir jusqu’à cinq doigts'},{max:5,mode:'raise',name:'Lever les doigts, un à un'}].map((L,i)=>({...L,n:4,skill:'math:fingers:'+i,tag:'M1–M3',ref:'Reconnaître de petites quantités et dire la chaîne numérique ; la pratique guidée ne vaut pas une réussite autonome'})),make:mathFingersItem};

for(const [world,ids]of [['petits',['doigts','ligneP']],['grands',['ligne','rappelCalcul','pontDix','balance','barres','grandeurs']]]){
 const theme=THEMES[world].find(t=>t.id==='calculer');
 for(const id of ids){SIMPLE_GAME_NAMES[id]=GAMES[id].title;if(!WORLD_TILES[world].includes(id))WORLD_TILES[world].push(id);if(theme&&!theme.ids.includes(id))theme.ids.push(id);}
 const order=THEME_DIFFICULTY_ORDER?.[world]?.calculer;if(order)for(const id of ids)if(!order.includes(id))order.push(id);
}
function mathPracticeVoiceLines(){
 const lines=[...MATH_PRACTICE_VOICE,'Avance d’une case.','Avance de deux cases.','Avance de trois cases.'];
 for(let n=0;n<=100;n++)lines.push(nw(n),'La réponse, c’est '+nw(n)+'.');
 for(let n=1;n<=5;n++)lines.push(n===1?'Montre la main avec un doigt.':'Montre la main avec '+nw(n)+' doigts.');
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){if(a<=5&&b<=5)lines.push(mathBarsStory('join',a,b));if(a>=4&&b<a)lines.push(mathBarsStory('compare',a,b));if(a===b&&a<=5)lines.push(mathBarsStory('share',a,b));}
 for(let n=1;n<=10;n++)lines.push(mathMoneyStory(n,5)[0]);for(const n of [5,10])lines.push(mathMoneyStory(1,n)[1]);
 return uniq(lines);
}
/* Reuse the original questions; an error can now expose the concrete strategy.
   A shown strategy is help, never evidence of independent recall. */
function mathCoreStrategyModel(fact){
 if(!fact)return null;const original=fact.eq,complete=original.map(x=>x==='?'?fact.answer:x),at=complete.indexOf('='),sides=[complete.slice(0,at),complete.slice(at+1)],raw=[original.slice(0,at),original.slice(at+1)];
 const side=sides.findIndex(s=>s.length===3&&['+','−','-'].includes(s[1]));if(side<0)return null;
 const [a,op,b]=sides[side];if(!Number.isInteger(a)||!Number.isInteger(b)||a>20||b>20)return null;
 if(op!=='+'&&a>=b)return {kind:'subtract',a,b,total:a-b,line:Array.from({length:b+1},(_,i)=>a-i)};
 if(op!=='+')return null;const total=a+b;if(total>20)return null;
 if(total===10&&[raw[side][0],raw[side][2]].includes('?')){const known=raw[side][0]==='?'?b:a;return {kind:'complement',a:known,b:10-known,total:10,line:Array.from({length:11-known},(_,i)=>known+i)};}
 const base=Math.max(a,b),add=Math.min(a,b);return {kind:base<10&&total>10?'through-ten':'count-on',a:base,b:add,total,line:Array.from({length:add+1},(_,i)=>base+i)};
}
function mathCoreStrategyNode(model){
 const pictures=model.kind==='subtract'?framesFor(model.a,0,model.b):model.kind==='complement'?frameEl(model.a):framesFor(model.a,model.b);
 return h('div',{class:'math-core-strategy','data-math-strategy':model.kind,hidden:true},pictures,h('div',{class:'math-strategy-countline'},model.line.map((n,i)=>h('span',{style:{animationDelay:(i*.13)+'s'}},(i?'→ ':'')+n))));
}
function mathCoreStrategyItem(item,config){
 const model=mathCoreStrategyModel(item.mathPracticeFact);if(!model||config.strategy||item.mathCoreStrategy)return item;
 const render=item.render;item.mathCoreStrategy=model;item.render=function(st,api){const support=mathCoreStrategyNode(model);let shown=false;
  render(st,{...api,async answer(ok,options){const show=!ok&&!api.exam&&!shown;if(show){shown=true;support.hidden=false;api.help();}
   const result=await api.answer(ok,options);if(show&&api.alive()&&typeof api.say==='function')api.say([MATH_PRACTICE_VOICE[9],...model.line.map(nw)]);return result;}});st.append(support);
 };return item;
}
const mathCoreKeypadBefore=kpItem,mathCoreChoiceBefore=chItem;
kpItem=function(config){return mathCoreStrategyItem(mathCoreKeypadBefore(config),config);};
chItem=function(config){return mathCoreStrategyItem(mathCoreChoiceBefore(config),config);};
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent='.math-core-strategy{padding:10px;border:2px solid #83aa98;border-radius:17px;background:#f4fbf6;max-width:100%;display:flex;align-items:center;flex-direction:column;gap:8px}.math-core-strategy[hidden]{display:none!important}.math-core-strategy .frame{max-width:155px}.math-strategy-countline{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;font-size:22px}.math-strategy-countline span{animation:math-strategy-arrive .4s both}@keyframes math-strategy-arrive{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.math-strategy-countline span{animation:none}}';document.head.append(style);}
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent='.math-practice-stage .upgrade-wrap{gap:12px}.math-line-scroll{width:100%;overflow-x:auto;padding:10px 3px 16px;touch-action:pan-x}.math-line-track{display:flex;align-items:stretch;gap:0;width:max-content;border-bottom:5px solid #839cbd}.math-line-cell{position:relative;min-width:80px;min-height:100px;background:#fff;border:2px solid #b7c9de;border-right-width:0;padding:5px 12px 30px;font-size:27px;flex:none}.math-line-cell.current{background:#fff0b0;border-color:#a17d20}.math-line-pawn{position:absolute;bottom:1px;left:0;right:0;text-align:center;font-size:22px}.math-line-roll{min-width:88px;min-height:88px;border:3px solid #b3c7de;border-radius:20px;background:white;padding:7px;font-size:40px}.math-line-roll .dotcard{width:80px!important;height:80px!important;padding:8px!important;box-shadow:none!important}.math-line-status{margin:0;min-height:34px;font-size:18px}.math-ten-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.math-ten-cell{width:72px;height:72px;border:3px dashed #8ca4b8;border-radius:14px;background:#fff;font-size:28px}.math-ten-cell.fixed{background:#cde4ff}.math-ten-cell.added{background:#fce193}.math-balance{display:flex;align-items:flex-end;justify-content:center;gap:18px;max-width:100%;flex-wrap:wrap}.math-pan{border-bottom:5px solid #84909d;padding:10px;min-width:140px;display:flex;flex-direction:column;align-items:center}.math-pan .frame{max-width:180px}.math-equal{align-self:center;font-size:48px}.math-bar-slots{display:flex;flex-direction:column;gap:9px;min-width:min(330px,90vw)}.math-bar-slot{min-height:58px;border:2px dashed #b4c3d4;border-radius:9px;display:flex;align-items:center;padding:4px}.math-bar{height:42px;min-width:30px;max-width:100%;display:flex;background:#8bbdff;border:2px solid #4f81b5}.math-bar.red{background:#f4a7a7;border-color:#b87575}.math-bar i{flex:1;border-right:1px solid #ffffff88}.math-bar-piece{padding:8px}.math-bar-answer{width:100%;display:flex;flex-direction:column;align-items:center;gap:12px}.math-unit-strip{display:flex;width:max-content;max-width:100%;border:2px solid #4068a0;background:#7cacf0;height:45px}.math-unit-strip i{display:block;width:32px;min-width:16px;border-right:2px solid white}.math-lengths{display:flex;flex-direction:column;align-items:flex-start;gap:18px}.math-magnitude-choice{min-height:85px;min-width:110px;display:flex;align-items:center;justify-content:flex-start}.math-mass-cubes{max-width:190px;display:flex;flex-wrap:wrap;gap:5px;font-size:32px;color:#4370a0}.math-hand{width:175px;max-width:55vw}.math-hand svg,.math-hand-choice svg{display:block;width:100%;height:100%}.math-hand-choice{width:145px;height:180px;border:3px solid #d9d4da;border-radius:20px;background:white;padding:8px}.math-finger-toggle{min-width:80px;min-height:80px;font-size:34px}.math-practice-stage .keypad{max-width:420px}@media(max-width:600px){.math-ten-cell{width:56px;height:64px}.math-hand-choice{width:110px;height:145px}.math-unit-strip i{width:27px}.math-line-cell{min-width:80px}.math-bar-slots{min-width:270px}.math-bar{max-width:260px}}';document.head.append(style);}
