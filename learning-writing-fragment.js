/* Écriture : formes script explicites, démonstration, repassage, copie et rappel.
   La géométrie constate une ressemblance sur écran ; elle ne note ni la tenue du
   crayon ni une compétence scolaire. Les anciens tracés restent un repli pour
   les graphèmes qui n'ont pas encore de modèle vectoriel vérifié. */
function writingLine(a,b,n=18){return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);}
function writingCurve(a,b,c,d,n=32){return Array.from({length:n+1},(_,i)=>{const t=i/n,q=1-t;return [q*q*q*a[0]+3*q*q*t*b[0]+3*q*t*t*c[0]+t*t*t*d[0],q*q*q*a[1]+3*q*q*t*b[1]+3*q*t*t*c[1]+t*t*t*d[1]];});}
function writingArc(cx,cy,rx,ry,start,end,n=48){return Array.from({length:n+1},(_,i)=>{const a=(start+(end-start)*i/n)*Math.PI/180;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];});}
function writingJoin(...parts){return parts.flatMap((p,i)=>i?p.slice(1):p);}
const WRITING_MODELS={
 c:{letter:'c',strokes:[writingArc(50,60,23,25,-50,-310)]},
 o:{letter:'o',strokes:[writingArc(50,60,22,25,-50,-410)]},
 a:{letter:'a',strokes:[writingArc(47,60,21,25,-40,-400),writingLine([68,36],[68,85])]},
 d:{letter:'d',strokes:[writingArc(47,60,21,25,-40,-400),writingLine([68,13],[68,85])]},
 i:{letter:'i',strokes:[writingLine([50,39],[50,85]),writingLine([50,24],[50,24.8],2)]},
 l:{letter:'l',strokes:[writingLine([50,14],[50,85])]},
 t:{letter:'t',strokes:[writingLine([50,22],[50,85]),writingLine([34,43],[68,43])]},
 u:{letter:'u',strokes:[writingJoin(writingLine([30,38],[30,65]),writingCurve([30,65],[30,94],[70,94],[70,65]),writingLine([70,65],[70,38]))]},
 n:{letter:'n',strokes:[writingLine([29,38],[29,85]),writingJoin(writingCurve([29,58],[29,25],[70,25],[70,58]),writingLine([70,58],[70,85]))]},
 m:{letter:'m',strokes:[writingLine([19,38],[19,85]),writingJoin(writingCurve([19,58],[19,25],[50,25],[50,58]),writingLine([50,58],[50,85])),writingJoin(writingCurve([50,58],[50,25],[81,25],[81,58]),writingLine([81,58],[81,85]))]},
 p:{letter:'p',strokes:[writingLine([31,38],[31,101]),writingCurve([31,43],[91,16],[91,103],[31,77])]},
 b:{letter:'b',strokes:[writingLine([31,13],[31,85]),writingCurve([31,47],[91,16],[91,108],[31,80])]},
 horizontal:{gesture:true,label:'Le chemin',strokes:[writingLine([15,60],[85,60])]},
 vertical:{gesture:true,label:'La pluie',strokes:[writingLine([50,18],[50,94])]},
 slope:{gesture:true,label:'La glissade',strokes:[writingLine([22,25],[80,85])]},
 wave:{gesture:true,label:'La colline',strokes:[writingCurve([12,82],[28,15],[72,15],[88,82])]},
 circle:{gesture:true,label:'La bulle',strokes:[writingArc(50,60,29,29,-60,-420)]}
};
function writingLength(strokes){return strokes.reduce((sum,s)=>sum+s.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-s[i][0],p[1]-s[i][1]),0),0);}
function writingPointSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function writingDistance(p,strokes){let best=Infinity;for(const s of strokes){if(s.length===1)best=Math.min(best,Math.hypot(p[0]-s[0][0],p[1]-s[0][1]));for(let i=1;i<s.length;i++)best=Math.min(best,writingPointSegment(p,s[i-1],s[i]));}return best;}
function writingSamples(strokes,spacing=2){const out=[];for(const s of strokes){if(s.length)out.push(s[0]);for(let i=1;i<s.length;i++){const a=s[i-1],b=s[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/spacing));for(let k=1;k<=n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}}return out;}
function writingTraceMetrics(model,ink,small=false){
 const valid=Array.isArray(ink)&&ink.every(s=>Array.isArray(s)&&s.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)));
 if(!valid||!ink.some(s=>s.length))return {ok:false,coverage:0,outside:1,orderObserved:false};
 const tolerance=small?11:8.5,ref=model.strokes,perStroke=ref.map(s=>{const samples=writingSamples([s]);return samples.filter(p=>writingDistance(p,ink)<=tolerance).length/samples.length;}),points=writingSamples(ink),outside=points.filter(p=>writingDistance(p,ref)>tolerance*1.2).length/Math.max(1,points.length),coverage=Math.min(...perStroke),travel=writingLength(ink),referenceTravel=writingLength(ref),tooMuch=travel>Math.max(15,referenceTravel)*(small?4.5:3.5),enoughTravel=travel>=referenceTravel*(small?.5:.8);
 let cursor=0;const orderObserved=ref.every(s=>{for(;cursor<ink.length;cursor++){const path=ink[cursor];if(path.length&&Math.hypot(path[0][0]-s[0][0],path[0][1]-s[0][1])<=tolerance*1.7&&writingDistance(s.at(-1),[path])<=tolerance*1.7){cursor++;return true;}}return false;});
 return {ok:coverage>=(small?.65:.68)&&outside<=(small?.42:.34)&&!tooMuch&&enoughTravel,coverage,outside,orderObserved,tooMuch};
}
function writingEscape(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function writingPoints(s){return s.map(p=>p.map(n=>Number(n).toFixed(2)).join(',')).join(' ');}
function writingSVG(model,{guide=true,ink=[],progress=null,numbers=true}={}){
 const ref=model.strokes.map((s,i)=>`<polyline points="${writingPoints(s)}" fill="none" stroke="${guide?'#d5dce6':'transparent'}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>${guide&&numbers?`<circle cx="${s[0][0]}" cy="${s[0][1]}" r="4.8" fill="#42856c"/><text x="${s[0][0]}" y="${s[0][1]+1.8}" text-anchor="middle" font-family="Arial,sans-serif" font-size="5" fill="white">${i+1}</text>`:''}`).join('');
 let demo='';if(progress){for(let i=0;i<=progress.stroke&&i<model.strokes.length;i++){const s=model.strokes[i],count=i<progress.stroke?s.length:Math.max(1,Math.ceil(s.length*progress.fraction));demo+=`<polyline points="${writingPoints(s.slice(0,count))}" fill="none" stroke="#e69c3f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;if(i===progress.stroke){const p=s[Math.min(s.length-1,count-1)];demo+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#b66e22"/>`;}}}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115" aria-hidden="true"><rect x="0" y="0" width="100" height="115" rx="5" fill="#fffdf8"/><path d="M4 85H96" stroke="#9bb5d1" stroke-width=".6"/><path d="M4 38H96" stroke="#d8e3ed" stroke-dasharray="2 2" stroke-width=".5"/>${ref}${demo}${ink.map(s=>`<polyline points="${writingPoints(s.length===1?[s[0],[s[0][0]+.01,s[0][1]]]:s)}" fill="none" stroke="#336cb1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
}
const WRITING_VOICE_LINES=[
 'Regarde le point de départ et le chemin. Puis trace avec ton doigt.',
 'Le point vert montre où commencer. Suis le chemin gris.',
 'Regarde le petit modèle. Écris la même lettre dans la grande case.',
 'Regarde bien la lettre. Quand tu es prêt, cache le modèle et écris-la.',
 'Le modèle est caché. Écris la lettre que tu viens de regarder.',
 'Tu peux regarder le geste encore une fois.',
 'Commence par dessiner dans la grande case.',
 'Il manque un morceau du chemin. Essaie encore doucement.',
 'Essaie de rester près du chemin. Tu peux effacer et recommencer.',
 'Ton geste ressemble au modèle. Tu peux continuer.',
 'Le chemin est dessiné. Tu peux continuer.',
 'Le modèle est revenu pour t’aider. Regarde le point de départ.',
 'Dessine d’abord le chemin avec ton doigt.',
 'Tu peux aussi faire ces gestes avec un crayon sur du papier.'
];
function writingVoiceLines(){return [...WRITING_VOICE_LINES];}
const WRITING_SOUND_KEYS={c:'k',o:'o',a:'a',d:'d',i:'i',l:'l',t:'t',u:'u',n:'n',m:'m',p:'p',b:'b'};
function writingEffectiveAid(local,run){return !!(local||run?.session?.partialHelped);}
function writingAutoDemoAllowed(mode,ready){return mode!=='recall'||!ready;}
function writingStoreResult(symbol,mode,result,aided){const p=P(),all=p.writingPractice||(p.writingPractice={version:1,items:{}}),key=symbol+':'+mode,e=all.items[key]||(all.items[key]={completed:0,aided:0,last:null});e.completed++;if(aided)e.aided++;e.last={at:Date.now(),mode,aided,coverage:Math.round(result.coverage*100),outside:Math.round(result.outside*100),orderObserved:result.orderObserved,screenGestureOnly:true};save();}
function writingItem(symbol,mode='trace',small=false){
 const model=WRITING_MODELS[symbol];if(!model)return null;
 const prompt=small?WRITING_VOICE_LINES[0]:mode==='copy'?WRITING_VOICE_LINES[2]:mode==='recall'?WRITING_VOICE_LINES[3]:WRITING_VOICE_LINES[1];
 return {cls:'upgrade-stage writing-stage',skill:'writing:'+mode,evidenceKey:'writing:'+mode+':'+symbol,exemplar:'writing:'+symbol+':'+mode+':vector-v1',say:model.gesture?prompt:[prompt,...sndHear(WRITING_SOUND_KEYS[symbol])],caption:small?'Dessine le chemin':mode==='copy'?'Copie la lettre':mode==='recall'?'Écris de mémoire':'Trace la lettre',render(st,api){
  let strokes=[],active=null,pointer=null,aided=false,ghost=mode==='trace',hidden=mode==='recall',recallReady=mode!=='recall',demoToken=0,recorded=false;
  const reference=h('div',{class:'writing-reference',html:writingSVG(model)}),referenceWrap=h('div',{class:'writing-reference-wrap'},h('span',null,model.gesture?'Le modèle':'La lettre'),reference);
  const board=h('div',{class:'writing-board','aria-label':small?'Zone pour dessiner le chemin':'Zone pour écrire la lettre',role:'img'}),status=h('p',{class:'u-note writing-status','aria-live':'polite'},''),tools=h('div',{class:'urow'});
  const draw=()=>{board.innerHTML=writingSVG(model,{guide:ghost,ink:strokes,numbers:mode==='trace'||aided});};
  const redrawReference=progress=>{reference.innerHTML=writingSVG(model,{progress});};
  const demo=async(manual=true)=>{if(manual){aided=true;api.help();Voice.say(WRITING_VOICE_LINES[5]);}const token=++demoToken;referenceWrap.hidden=false;if(mode==='recall'&&recallReady){ghost=true;aided=true;api.help();draw();}for(let si=0;si<model.strokes.length;si++){for(let step=1;step<=24;step++){if(token!==demoToken||!api.alive())return;redrawReference({stroke:si,fraction:step/24});await new Promise(r=>setTimeout(r,35));}await new Promise(r=>setTimeout(r,130));}if(api.alive()&&token===demoToken)redrawReference(null);};
  const show=h('button',{class:'ubtn'},'👀 Regarder');onTap(show,()=>demo(true));
  const clear=uButton('↶ Refaire',()=>{if(!api.alive())return;strokes=[];active=null;pointer=null;draw();status.textContent='';});
  const undo=uButton('↶ Un trait',()=>{if(!api.alive())return;strokes.pop();active=null;pointer=null;draw();});
  const done=uButton('✓ Fini',()=>{if(!api.alive()||!recallReady)return;if(!strokes.some(s=>s.length)){Voice.say(small?WRITING_VOICE_LINES[12]:WRITING_VOICE_LINES[6]);return;}const result=writingTraceMetrics(model,strokes,small);if(result.ok){if(!recorded){recorded=true;writingStoreResult(symbol,mode,result,writingEffectiveAid(aided,RUN));}return api.answer(true,{el:board,praise:small?WRITING_VOICE_LINES[10]:WRITING_VOICE_LINES[9]});}const line=result.outside>(small?.42:.34)||result.tooMuch?WRITING_VOICE_LINES[8]:WRITING_VOICE_LINES[7];status.textContent=line;api.answer(false,{el:board,feedback:line});});
  const hide=uButton('🙈 Cacher le modèle',()=>{if(!api.alive())return;demoToken++;recallReady=true;hidden=true;ghost=false;referenceWrap.hidden=true;hide.hidden=true;board.style.visibility='visible';done.hidden=false;strokes=[];draw();if(Shell.item){Shell.item.say=model.gesture?WRITING_VOICE_LINES[4]:[WRITING_VOICE_LINES[4],...sndHear(WRITING_SOUND_KEYS[symbol])];}Shell.caption('Écris de mémoire');Voice.say(WRITING_VOICE_LINES[4]);});
  tools.append(show,undo,clear,done);if(mode==='recall'){board.style.visibility='hidden';done.hidden=true;tools.prepend(hide);}else if(mode==='trace')referenceWrap.classList.add('writing-reference-compact');
  const surface=h('div',{class:'writing-surface'},referenceWrap,board);uWrap(st,surface,tools,status);
  const point=e=>{const r=board.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width*100,0,100),clamp((e.clientY-r.top)/r.height*115,0,115)];};
  board.addEventListener('pointerdown',e=>{if(!api.alive()||!recallReady||pointer!==null||e.isPrimary===false||e.button>0)return;e.preventDefault();pointer=e.pointerId;try{board.setPointerCapture(pointer);}catch(_){}active=[point(e)];strokes.push(active);draw();});
  board.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||!active||!api.alive())return;e.preventDefault();const p=point(e),last=active.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.3&&active.length<1800){active.push(p);draw();}});
  const end=e=>{if(pointer!==e.pointerId)return;active=null;pointer=null;};board.addEventListener('pointerup',end);board.addEventListener('pointercancel',end);board.addEventListener('lostpointercapture',()=>{active=null;pointer=null;});
  api.strategy=()=>{aided=true;ghost=true;referenceWrap.hidden=false;board.classList.add('reveal');draw();status.textContent=WRITING_VOICE_LINES[11];};
  draw();setTimeout(()=>{if(api.alive()&&writingAutoDemoAllowed(mode,recallReady))demo(false);},550);
 }};
}
const legacyWritingMake=GAMES.trace.make.bind(GAMES.trace);
Object.assign(GAMES.trace,{title:'J’écris les lettres',sub:'Regarder, tracer, copier, retrouver',levels:[
 {set:['c','o','a','d'],mode:'trace',name:'Les lettres rondes'},
 {set:['i','l','t','u'],mode:'trace',name:'Les traits et les courbes'},
 {set:['n','m','p','b'],mode:'trace',name:'Les ponts et les ventres'},
 {set:['c','o','a','d'],mode:'copy',name:'Copier les lettres rondes'},
 {set:['i','l','t','u'],mode:'copy',name:'Copier les traits et courbes'},
 {set:['n','m','p','b'],mode:'copy',name:'Copier les ponts et ventres'},
 {set:['c','o','a','d'],mode:'recall',name:'Retrouver les lettres rondes'},
 {set:['i','l','t','u'],mode:'recall',name:'Retrouver les traits et courbes'},
 {set:['n','m','p','b'],mode:'recall',name:'Retrouver les ponts et ventres'}
].map((x,i)=>({...x,n:3,tag:'P1',skill:'writing:'+x.mode+':'+i,ref:'Geste sur écran : '+(x.mode==='trace'?'repasser avec un guide':x.mode==='copy'?'copier un modèle éloigné':'rappeler un modèle brièvement caché')})),make(ctx){const L=ctx.L,symbol=avoidRepeat(ctx,L.set);if(!WRITING_MODELS[symbol]||L.font==='cursive')return legacyWritingMake({...ctx,L:{...L,set:[symbol]}});return writingItem(symbol,L.mode||'trace');}});
GAMES.pretrace={id:'pretrace',title:'Les chemins du doigt',sub:'Des gestes avant les lettres',icon:'🖍️',color:'orange',stage:'#fff4e3',levels:[['horizontal'],['vertical'],['slope'],['wave'],['circle']].map((set,i)=>({set,name:WRITING_MODELS[set[0]].label,n:3,skill:'pretrace:'+i,tag:'M1–M3',ref:'Explorer un geste graphique simple sans évaluer l’écriture'})),make(ctx){return writingItem(ctx.L.set[0],'trace',true);}};
addThemeGame('petits','creer','pretrace');SIMPLE_GAME_NAMES.pretrace='Les chemins du doigt';SIMPLE_GAME_NAMES.trace='J’écris les lettres';
function writingWorksheetSVG(letters=['c','o','a','d','i','l','t','u','n','m','p','b']){
 const selected=letters.filter(s=>WRITING_MODELS[s]&&!WRITING_MODELS[s].gesture).slice(0,12);return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 794 1123"><rect width="794" height="1123" fill="white"/><text x="48" y="53" font-family="Arial,sans-serif" font-size="23" fill="#333">Les lettres de Lumi</text><text x="48" y="80" font-family="Arial,sans-serif" font-size="13" fill="#555">Regarde le départ et l’ordre. Trace, puis copie avec ton crayon.</text>${selected.map((s,i)=>{const m=WRITING_MODELS[s],x=48+(i%2)*365,y=104+Math.floor(i/2)*153;return `<g transform="translate(${x},${y})"><rect width="333" height="137" rx="8" fill="white" stroke="#ccc"/><text x="12" y="23" font-family="Arial,sans-serif" font-size="18">${writingEscape(s)}</text><g transform="translate(23,8) scale(.95)">${writingSVG(m).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g><path d="M134 89H318M134 44H318" stroke="#bbc9d5" stroke-width="1"/><path d="M230 18V116" stroke="#ddd" stroke-dasharray="3 4"/></g>`;}).join('')}<text x="48" y="1066" font-family="Arial,sans-serif" font-size="12" fill="#555">Un adulte peut observer le confort, le sens du tracé et la tenue du crayon.</text><text x="48" y="1084" font-family="Arial,sans-serif" font-size="12" fill="#555">Les jeux sur écran ne certifient pas l’écriture sur papier.</text></svg>`;
}
function downloadWritingWorksheet(){const url=URL.createObjectURL(new Blob([writingWorksheetSVG()],{type:'image/svg+xml'})),a=h('a',{href:url,download:'Lumi-ecriture-papier.svg'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
const parentBeforeWriting=parentArea;
parentArea=function(){parentBeforeWriting();const w=$('.parent .wrap');if(!w)return;const box=h('div',{class:'pcard'},h('h3',null,'Écriture : du doigt au crayon'),h('p',null,'Douze lettres script : geste démontré, repassage, copie avec modèle, puis rappel après modèle caché. Les observations concernent seulement le geste sur écran ; elles ne certifient pas une compétence scolaire.'),h('p',null,'Une fiche imprimable permet de reprendre les mêmes lettres au crayon, avec un adulte.'),uButton('⬇ Fiche pour le papier',downloadWritingWorksheet));const p=P(),items=Object.entries(p.writingPractice?.items||{});if(items.length){const table=h('table',{style:{width:'100%',marginTop:'16px',borderCollapse:'collapse',textAlign:'left'}},h('thead',null,h('tr',null,['Mode','Gestes terminés','Aide redemandée'].map(label=>h('th',{style:{padding:'7px',borderBottom:'1px solid var(--line)'}},label))))),body=h('tbody');for(const [mode,label]of [['trace','Repassage guidé'],['copy','Copie avec modèle'],['recall','Rappel après modèle caché']]){const group=items.filter(([key])=>key.endsWith(':'+mode)).map(([,e])=>e);body.append(h('tr',null,[label,group.reduce((n,e)=>n+e.completed,0),group.reduce((n,e)=>n+e.aided,0)].map(text=>h('td',{style:{padding:'7px',borderBottom:'1px solid var(--line)'}},String(text)))));}table.append(body);box.append(table,h('p',null,'Le rappel commence après une présentation du modèle. Une aide reprise après interruption reste comptée comme une aide. Ce n’est pas une mesure du rappel à long terme.'));}w.append(box);};
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`.writing-surface{display:flex;align-items:center;justify-content:center;gap:clamp(14px,3vw,36px);width:100%;max-width:760px;margin:auto}.writing-board{width:min(46vw,350px);aspect-ratio:100/115;touch-action:none;user-select:none;border:3px solid #bfd0e0;border-radius:18px;box-shadow:0 8px 24px #6352450d;overflow:hidden;background:#fffdf8}.writing-board svg,.writing-reference svg{display:block;width:100%;height:100%;pointer-events:none}.writing-reference-wrap{font-size:15px;color:#716677;text-align:center;max-width:180px}.writing-reference-wrap[hidden]{display:none!important}.writing-reference{width:min(20vw,155px);aspect-ratio:100/115;border:2px solid #e5d8c3;border-radius:12px;overflow:hidden;margin-top:5px}.writing-reference-compact .writing-reference{width:min(16vw,120px)}.writing-stage .urow{gap:8px}.writing-stage .ubtn{font-size:clamp(15px,2vw,19px);padding:12px 16px}.writing-status{min-height:24px}.writing-stage .u-wrap{gap:12px}@media(max-width:520px){.writing-board{width:55vw}.writing-reference{width:24vw}.writing-reference-compact .writing-reference{width:19vw}.writing-surface{gap:10px}.writing-stage .ubtn{padding:10px 12px}}`;document.head.append(style);}
