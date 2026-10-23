/* Cursive liée classique. Les chemins ci-dessous sont des modèles de geste
   explicites propres à Lumi, et non les contours d'une police à colorier.
   Borel sert de référence typographique liée. Ce choix ne prétend pas être
   l'unique modèle enseigné dans les écoles belges. Les observations script
   historiques ne sont pas converties en observations cursives. */
const SCHOOL_WRITING_VERSION='cursive-liee-v1';
function schoolCurve(start,...segments){let at=start;return writingJoin(...segments.map(s=>{const points=writingCurve(at,s[0],s[1],s[2],24);at=s[2];return points;}));}
const SCHOOL_WRITING_MODELS={
 e:{strokes:[schoolCurve([8,85],[[20,77],[62,48],[51,45]],[[32,39],[23,57],[37,76]],[[48,93],[69,85],[92,73]])]},
 l:{strokes:[schoolCurve([8,85],[[27,70],[70,17],[53,14]],[[30,10],[31,53],[42,77]],[[49,92],[68,88],[92,74]])]},
 i:{strokes:[schoolCurve([8,85],[[20,76],[34,51],[42,39]],[[40,51],[37,71],[43,79]],[[51,91],[73,84],[92,74]]),writingLine([44,23],[44,24],3)]},
 u:{strokes:[schoolCurve([8,85],[[18,78],[28,52],[33,39]],[[29,57],[22,79],[35,84]],[[46,87],[58,53],[61,39]],[[58,55],[54,76],[63,82]],[[70,89],[80,83],[92,74]])]},
 t:{strokes:[schoolCurve([8,85],[[23,73],[41,35],[48,23]],[[43,44],[36,70],[43,80]],[[51,93],[72,85],[92,74]]),writingLine([29,44],[66,44])]},
 c:{strokes:[schoolCurve([8,85],[[25,72],[60,40],[65,43]],[[38,25],[18,47],[25,70]],[[31,92],[63,91],[92,74]])]},
 o:{strokes:[schoolCurve([8,85],[[25,71],[60,38],[64,43]],[[36,25],[18,50],[28,73]],[[41,96],[72,78],[66,52]],[[65,44],[61,40],[58,43]],[[56,48],[74,61],[92,54]])]},
 a:{strokes:[schoolCurve([8,85],[[24,73],[55,38],[61,43]],[[39,26],[17,48],[25,72]],[[35,96],[61,83],[62,43]],[[60,57],[55,77],[63,82]],[[72,90],[81,83],[92,74]])]},
 d:{strokes:[schoolCurve([8,85],[[24,73],[55,38],[61,43]],[[39,26],[17,48],[25,72]],[[35,96],[61,83],[62,43]],[[65,29],[69,13],[68,14]],[[65,35],[55,72],[63,82]],[[72,90],[81,83],[92,74]])]},
 n:{strokes:[schoolCurve([8,85],[[18,76],[29,49],[34,39]],[[31,53],[28,75],[28,84]],[[36,62],[48,31],[62,42]],[[73,51],[57,74],[66,82]],[[74,90],[83,82],[92,74]])]},
 m:{strokes:[schoolCurve([7,85],[[14,75],[21,50],[25,39]],[[22,55],[20,75],[20,84]],[[28,63],[37,32],[47,42]],[[54,49],[45,72],[45,84]],[[53,61],[64,33],[74,43]],[[83,52],[69,75],[77,82]],[[83,88],[89,79],[95,73]])]},
 p:{strokes:[schoolCurve([8,85],[[19,74],[30,49],[36,39]],[[33,63],[27,93],[24,107]],[[32,89],[41,38],[57,42]],[[76,47],[73,76],[55,82]],[[44,85],[39,78],[45,75]],[[59,85],[75,85],[92,74]])]}
};
for(const [letter,model]of Object.entries(SCHOOL_WRITING_MODELS)){model.letter=letter;model.cursive=true;model.version=SCHOOL_WRITING_VERSION;model.entry=model.strokes[0][0];model.exit=model.strokes[0].at(-1);}
const SCHOOL_WRITING_SOUND_KEYS={e:'e',l:'l',i:'i',u:'u',t:'t',c:'k',o:'o',a:'a',d:'d',n:'n',m:'m',p:'p'};
const SCHOOL_WRITING_VOICE_LINES=[
 'Le point vert montre le départ. Trace cette lettre en écriture attachée.',
 'Regarde la lettre attachée. Copie-la dans la grande case.',
 'Regarde bien la lettre attachée. Cache le modèle, puis écris-la.',
 'La lettre est cachée. Écris-la en écriture attachée.',
 'Le trait continue sans lever le doigt. Les petits points et les barres se font après.',
 'Tu as suivi le modèle attaché. Tu peux continuer.',
 'Regarde aussi comment les lettres se lient dans les prénoms Lola et Luca.',
 'Tu peux essayer ces mots avec un crayon sur du papier.'
];
function schoolWritingVoiceLines(){return [...SCHOOL_WRITING_VOICE_LINES];}
function schoolWritingStoreResult(symbol,mode,result,aided){
 const p=P(),all=p.cursivePractice||(p.cursivePractice={version:SCHOOL_WRITING_VERSION,items:{}}),key=symbol+':'+mode,e=all.items[key]||(all.items[key]={completed:0,aided:0,last:null});e.completed++;if(aided)e.aided++;
 e.last={at:Date.now(),modelVersion:SCHOOL_WRITING_VERSION,mode,aided,coverage:Math.round(result.coverage*100),outside:Math.round(result.outside*100),orderObserved:result.orderObserved,screenGestureOnly:true};save();
}
function schoolWritingItem(symbol,mode='trace'){
 const model=SCHOOL_WRITING_MODELS[symbol];if(!model)return null;
 const prompt=SCHOOL_WRITING_VOICE_LINES[mode==='copy'?1:mode==='recall'?2:0];
 return {cls:'upgrade-stage writing-stage school-writing-stage',skill:'cursive:'+mode,evidenceKey:'cursive:'+SCHOOL_WRITING_VERSION+':'+mode+':'+symbol,exemplar:'cursive:'+symbol+':'+mode+':'+SCHOOL_WRITING_VERSION,say:[prompt,...sndHear(SCHOOL_WRITING_SOUND_KEYS[symbol])],caption:mode==='copy'?'Copie en attaché':mode==='recall'?'Écris en attaché de mémoire':'Trace en attaché',render(st,api){
  let strokes=[],active=null,aided=false,ghost=mode==='trace',recallReady=mode!=='recall',demoToken=0,recorded=false,input;
  const reference=h('div',{class:'writing-reference',html:writingSVG(model)}),referenceWrap=h('div',{class:'writing-reference-wrap'},h('span',null,'La lettre attachée'),reference);
  const board=h('div',{class:'writing-board','aria-label':'Zone pour écrire la lettre attachée',role:'img'}),status=h('p',{class:'u-note writing-status','aria-live':'polite'},''),tools=h('div',{class:'urow'});
  const paint=writingBoardView(board,model),draw=()=>paint({guide:ghost,ink:strokes,numbers:mode==='trace'||aided});
  const redraw=progress=>{reference.innerHTML=writingSVG(model,{progress});};
  const demo=async(manual=true)=>{if(manual){aided=true;api.help();Voice.say(WRITING_VOICE_LINES[5]);}const token=++demoToken;referenceWrap.hidden=false;if(mode==='recall'&&recallReady){ghost=true;aided=true;api.help();draw();}for(let si=0;si<model.strokes.length;si++){for(let step=1;step<=24;step++){if(token!==demoToken||!api.alive())return;redraw({stroke:si,fraction:step/24});await new Promise(r=>setTimeout(r,35));}await new Promise(r=>setTimeout(r,130));}if(api.alive()&&token===demoToken)redraw(null);};
  const show=uButton('Regarder',()=>demo(true)),undo=uButton('Un trait',()=>{if(!api.alive())return;input?.reset();strokes.pop();active=null;draw();}),clear=uButton('Refaire',()=>{if(!api.alive())return;input?.reset();strokes=[];active=null;draw();status.textContent='';});
  const done=uButton('Fini',()=>{if(!api.alive()||!recallReady)return;if(!strokes.some(s=>s.length)){Voice.say(WRITING_VOICE_LINES[6]);return;}const result=writingTraceMetrics(model,strokes);if(result.ok){if(!recorded){recorded=true;schoolWritingStoreResult(symbol,mode,result,writingEffectiveAid(aided,RUN));}return api.answer(true,{el:board,praise:SCHOOL_WRITING_VOICE_LINES[5]});}const line=result.outside>.34||result.tooMuch?WRITING_VOICE_LINES[8]:WRITING_VOICE_LINES[7];status.textContent=line;api.answer(false,{el:board,feedback:line});});
  const hide=uButton('Cacher le modèle',()=>{if(!api.alive())return;demoToken++;recallReady=true;ghost=false;referenceWrap.hidden=true;hide.hidden=true;board.style.visibility='visible';done.hidden=false;strokes=[];draw();if(Shell.item)Shell.item.say=[SCHOOL_WRITING_VOICE_LINES[3],...sndHear(SCHOOL_WRITING_SOUND_KEYS[symbol])];Shell.caption('Écris en attaché de mémoire');Voice.say(SCHOOL_WRITING_VOICE_LINES[3]);});
  tools.append(show,undo,clear,done);if(mode==='recall'){board.style.visibility='hidden';done.hidden=true;tools.prepend(hide);}else if(mode==='trace')referenceWrap.classList.add('writing-reference-compact');
  const transfer=h('div',{class:'school-writing-transfer'},h('span',null,'Des lettres qui se lient : '),h('span',{class:'school-cursive-model',lang:'fr'},'lola · luca'));
  uWrap(st,h('div',{class:'writing-surface'},referenceWrap,board),tools,status,transfer);
  input=writingBoardInput(board,{canDraw:()=>api.alive()&&recallReady,begin:p=>{active=[p];strokes.push(active);draw();},extend:p=>{if(!active)return;const last=active.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.3&&active.length<1800){active.push(p);draw();}},finish:()=>{active=null;}});
  api.strategy=()=>{aided=true;ghost=true;referenceWrap.hidden=false;board.classList.add('reveal');draw();status.textContent=WRITING_VOICE_LINES[11];};draw();
  setTimeout(()=>{if(api.alive()&&writingAutoDemoAllowed(mode,recallReady))demo(false);},550);
 }};
}
GAMES.cursive={id:'cursive',title:'Écrire en attaché',sub:'Tracer, copier, écrire de mémoire',icon:'✍️',color:'orange',stage:'#fff4e3',levels:[
 ...['trace','copy','recall'].flatMap(mode=>[
  {set:['e','l','i','u'],mode,name:(mode==='trace'?'Tracer':mode==='copy'?'Copier':'Retrouver')+' les boucles et les coupes'},
  {set:['c','o','a','d'],mode,name:(mode==='trace'?'Tracer':mode==='copy'?'Copier':'Retrouver')+' les lettres rondes'},
  {set:['n','m','p','t'],mode,name:(mode==='trace'?'Tracer':mode==='copy'?'Copier':'Retrouver')+' les ponts et les grandes lettres'}
 ])
].map((L,i)=>({...L,n:3,tag:'P1',skill:'cursive:'+SCHOOL_WRITING_VERSION+':'+L.mode+':'+i,ref:'Modèle cursif lié ; observation du geste sur écran, sans certification sur papier'})),make(ctx){return schoolWritingItem(avoidRepeat(ctx,ctx.L.set),ctx.L.mode);}};
/* Un nouvel identifiant garde les réussites des anciens tracés script intactes. */
for(const world of ['grands','petits']){WORLD_TILES[world]=WORLD_TILES[world].map(id=>id==='trace'?'cursive':id);THEMES[world].forEach(t=>t.ids=t.ids.map(id=>id==='trace'?'cursive':id));}
if(typeof THEME_DIFFICULTY_ORDER!=='undefined')for(const world of ['grands','petits'])for(const [theme,ids]of Object.entries(THEME_DIFFICULTY_ORDER[world]||{}))THEME_DIFFICULTY_ORDER[world][theme]=ids.map(id=>id==='trace'?'cursive':id);
SIMPLE_GAME_NAMES.cursive='Écrire en attaché';
function schoolWritingWorksheetSVG(letters=['e','l','i','u','c','o','a','d','n','m','p','t']){
 const selected=letters.filter(s=>SCHOOL_WRITING_MODELS[s]).slice(0,12);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 794 1123"><rect width="794" height="1123" fill="white"/><text x="45" y="45" font-family="Arial,sans-serif" font-size="22">Les lettres attachées de Lumi</text><text x="45" y="71" font-family="Arial,sans-serif" font-size="12">Regarde le départ et le geste. Trace, puis copie avec un crayon.</text>${selected.map((s,i)=>`<g transform="translate(${45+(i%2)*365},${90+Math.floor(i/2)*151})"><rect width="335" height="138" rx="5" fill="white" stroke="#bbb"/><text x="9" y="19" font-family="Arial,sans-serif" font-size="13">${s}</text><g transform="translate(15,6) scale(.95)">${writingSVG(SCHOOL_WRITING_MODELS[s]).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g><path d="M130 87H320M130 42H320" stroke="#b7c5d6" stroke-width="1"/></g>`).join('')}<text x="45" y="1040" font-family="Arial,sans-serif" font-size="12">Ces modèles de cursive liée sont un choix pédagogique ; le modèle de l’école peut varier.</text><text x="45" y="1064" font-family="Arial,sans-serif" font-size="12">Sur écran, seule la ressemblance du geste est observée. Un adulte accompagne l’écriture sur papier.</text></svg>`;
}
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`@font-face{font-family:"Borel Lumi";src:url("assets/fonts/Borel-Regular.ttf") format("truetype");font-style:normal;font-weight:400;font-display:swap}.school-cursive-model,.grapheme.cursive,.letter.cursive,.cursive{font-family:"Borel Lumi",cursive;font-weight:400;font-variant-ligatures:common-ligatures contextual;letter-spacing:0}.school-writing-transfer{text-align:center;font-size:14px;color:#665e68;line-height:1.8}.school-writing-transfer .school-cursive-model{font-size:30px;white-space:nowrap}.school-writing-stage .writing-reference-wrap{max-width:180px}.school-writing-stage .writing-board{width:min(46vw,350px,calc(87vh - 360px));min-width:140px}.school-writing-stage .school-writing-transfer{flex:none}`;document.head.append(style);}
