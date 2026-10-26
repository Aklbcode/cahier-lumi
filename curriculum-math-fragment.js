/* Math curriculum: keep every stored module ID and level index. Dependencies
   concern access and guidance; parent openings never manufacture assessment. */
const CURRICULUM_MATH_ORDER=[
 'n10:0','n10:1','n10:2',
 'a10:0','s10:0','pb:0','c10:0','dbl:0','a10:1','s10:1','c10:1','a10:2','s10:2','c10:2',
 'n20:0','n20:1','n20:2','dbl:1','dbl:2',
 'a20:0','s20:0','pb:1','a20:1','s20:1','a20:2','s20:2',
 'n100:0','n100:1','n100:2','mul:0','mul:1','mul:2','pb:2'
];
const CURRICULUM_MATH_REQUIRES={
 'n10:0':[],'n10:1':[],'n10:2':['n10:1'],
 'a10:0':['n10:1'],'s10:0':['n10:1'],'c10:0':['n10:1'],'dbl:0':['a10:0'],
 'a10:1':['a10:0'],'s10:1':['s10:0'],'c10:1':['c10:0'],
 'a10:2':['a10:1'],'s10:2':['s10:1'],'c10:2':['c10:1','a10:0','s10:0'],
 'pb:0':['a10:0','s10:0'],
 'n20:0':['n10:1'],'n20:1':['n20:0','a10:0'],'n20:2':['n20:0','n10:2'],
 'dbl:1':['dbl:0','n20:0'],'dbl:2':['dbl:1','s10:0'],
 'a20:0':['n20:1','a10:1'],'s20:0':['n20:1','s10:1'],
 'a20:1':['a20:0','c10:1'],'s20:1':['s20:0','c10:1'],
 'a20:2':['a20:1','c10:2','s20:0'],'s20:2':['s20:1','a10:1'],
 'pb:1':['pb:0','n20:0','a20:0','s20:0'],
 'n100:0':['n20:0'],'n100:1':['n100:0'],'n100:2':['n100:0','a10:0','s10:0'],
 'mul:0':['a10:1','n100:0'],'mul:1':['mul:0'],'mul:2':['mul:1','n100:0'],
 'pb:2':['pb:1','mul:0']
};
const CURRICULUM_MATH_GROUPS=[
 {id:'nombres10',title:'Les nombres jusqu’à dix',keys:['n10:0','n10:1','n10:2']},
 {id:'operations10',title:'Ajouter, enlever et composer jusqu’à dix',keys:['a10:0','s10:0','c10:0','dbl:0','a10:1','s10:1','c10:1','a10:2','s10:2','c10:2']},
 {id:'problemes10',title:'Des histoires avec les nombres jusqu’à dix',keys:['pb:0']},
 {id:'nombres20',title:'Les nombres jusqu’à vingt',keys:['n20:0','n20:1','n20:2','dbl:1','dbl:2']},
 {id:'operations20',title:'Calculer et résoudre jusqu’à vingt',keys:['a20:0','s20:0','a20:1','s20:1','a20:2','s20:2','pb:1']},
 {id:'extensions',title:'Pour aller plus loin',note:'Les nombres jusqu’à cent et la multiplication sont des prolongements. Ils ne bloquent pas les problèmes jusqu’à vingt.',keys:['n100:0','n100:1','n100:2','mul:0','mul:1','mul:2','pb:2']}
];
function curriculumMathTarget(key){
 if(typeof key!=='string')return null;const parts=key.split(':'),mi=MODS.findIndex(M=>M.id===parts[0]),lv=Number(parts[1]);
 return parts.length===2&&mi>=0&&Number.isInteger(lv)&&lv>=0&&lv<MODS[mi].levels.length?{mi,lv}:null;
}
function curriculumMathKey(mi,lv){return Number.isInteger(mi)&&MODS[mi]&&Number.isInteger(lv)&&lv>=0&&lv<MODS[mi].levels.length?MODS[mi].id+':'+lv:null;}
function curriculumMathPassed(id,lv,p=P()){
 const mp=p.calcul?.mods?.[id],entry=mp?.pass?.[lv];
 if(entry)return !entry.parent&&!entry.review;
 /* Same interpretation as the existing modProg migration, without mutating p. */
 return !mp?.pass&&!!mp?.done?.[lv];
}
function curriculumMathParentPassed(id,lv,p){return !!p.calcul?.mods?.[id]?.pass?.[lv]?.parent;}
function curriculumMathSatisfied(key,p){const t=curriculumMathTarget(key);return !!t&&(curriculumMathPassed(MODS[t.mi].id,t.lv,p)||curriculumMathParentPassed(MODS[t.mi].id,t.lv,p));}
function curriculumMathLeaf(key,p,seen){
 if(!key||seen.has(key))return null;seen.add(key);const t=curriculumMathTarget(key);if(!t)return null;
 if(curriculumMathSatisfied(key,p))return null;
 for(const required of CURRICULUM_MATH_REQUIRES[key]||[]){if(!curriculumMathSatisfied(required,p)){const leaf=curriculumMathLeaf(required,p,seen);if(leaf)return leaf;}}
 return t;
}
function curriculumMathAccess(mi,lv,p=P()){
 const key=curriculumMathKey(mi,lv);if(!key||!Object.prototype.hasOwnProperty.call(CURRICULUM_MATH_REQUIRES,key))return {ready:false,reason:'Choisis une activité disponible.',missing:[]};
 const id=MODS[mi].id,mp=p.calcul?.mods?.[id]||{},missing=CURRICULUM_MATH_REQUIRES[key].filter(k=>!curriculumMathSatisfied(k,p));
 const passed=curriculumMathPassed(id,lv,p),parentPassed=curriculumMathParentPassed(id,lv,p);
 const openedByAction=(p.parentActions||[]).some(a=>!a.undone&&a.target?.kind==='calcul'&&a.target.mi===mi&&a.target.index===lv);
 const parentStart=Number.isInteger(mp.parentStart)&&lv<=mp.parentStart;
 const parent=!!p.familyAccess?.calcul||parentStart||parentPassed||openedByAction;
 if(p.demo===true)return {ready:true,admin:true,missing,passed};
 if(passed||parent)return {ready:true,passed,parent,parentPassed,missing};
 /* c.open only grants historically available access. New successes never raise
    this legacy frontier. Its old per-level rule is preserved exactly. */
 const oldOpen=Number.isInteger(p.calcul?.open)?p.calcul.open:0;
 const legacy=mi<=oldOpen&&(lv===0||!!mp.pass?.[lv-1]||!!(!mp.pass&&mp.done?.[lv-1]));
 if(legacy)return {ready:true,legacy:true,missing};
 if(!missing.length)return {ready:true,missing:[]};
 const target=curriculumMathLeaf(missing[0],p,new Set()),name=target?MODS[target.mi].name+' · '+MODS[target.mi].levels[target.lv].name:'';
 return {ready:false,reason:name?'Pour commencer, essaie « '+name+' ».':'Commence par les petites quantités.',missing,target};
}
function curriculumMathNext(p=P(),played){
 const playedKey=typeof played==='string'?played:played?curriculumMathKey(played.mi,played.lv):null,index=CURRICULUM_MATH_ORDER.indexOf(playedKey);
 const after=index<0?CURRICULUM_MATH_ORDER:CURRICULUM_MATH_ORDER.slice(index+1).concat(CURRICULUM_MATH_ORDER.slice(0,index+1));
 for(const key of after){const t=curriculumMathTarget(key);if(t&&!curriculumMathSatisfied(key,p)&&curriculumMathAccess(t.mi,t.lv,p).ready)return t;}
 return null;
}
function curriculumMathCurrent(p=P()){
 const c=p.calcul||{},resume=p.resume;
 if(resume?.kind==='module'&&curriculumMathKey(resume.mi,resume.lv)&&curriculumMathAccess(resume.mi,resume.lv,p).ready)return {mi:resume.mi,lv:resume.lv};
 const action=(p.parentActions||[]).slice().reverse().find(a=>!a.undone&&a.target?.kind==='calcul');
 if(action&&action.at>(c.focus?.at||0)){
  const mi=action.target.mi,mp=c.mods?.[MODS[mi]?.id],lv=Number.isInteger(mp?.parentStart)?mp.parentStart:action.target.index;
  if(curriculumMathKey(mi,lv)&&curriculumMathAccess(mi,lv,p).ready)return {mi,lv};
 }
 if(c.focus&&curriculumMathKey(c.focus.mi,c.focus.lv)&&curriculumMathAccess(c.focus.mi,c.focus.lv,p).ready)return {mi:c.focus.mi,lv:c.focus.lv};
 const oldMi=Number.isInteger(c.open)?clamp(c.open,0,MODS.length-1):0,old= c.mods?.[MODS[oldMi].id];
 if(Number.isInteger(old?.parentStart)){const lv=clamp(old.parentStart,0,MODS[oldMi].levels.length-1);if(curriculumMathAccess(oldMi,lv,p).ready)return {mi:oldMi,lv};}
 return curriculumMathNext(p)||curriculumMathTarget(CURRICULUM_MATH_ORDER[0]);
}
function curriculumMathSetFocus(target){if(!target)return;const c=calc();c.focus={mi:target.mi,lv:target.lv,at:Date.now()};save();}
function curriculumMathPrepare(mi,lv){
 const access=curriculumMathAccess(mi,lv);if(access.ready){runModule(mi,lv);return;}
 const target=access.target,modal=h('div',{class:'modal',role:'dialog','aria-modal':'true','aria-label':'Préparer cette étape'}),sheet=h('div',{class:'sheet'}),close=()=>modal.remove();
 sheet.append(h('h3',null,'Une étape pour commencer'),h('p',null,access.reason));
 if(target)sheet.append(uButton('Commencer par cette activité',()=>{close();curriculumMathSetFocus(target);runModule(target.mi,target.lv);}));
 sheet.append(uButton('Revenir au parcours',close),uButton('Aide du parent',()=>parentGate(()=>{parentAdjust(S.current,{kind:'calcul',mi,index:lv},'open');close();runModule(mi,lv);})));modal.append(sheet);document.body.append(modal);
 Voice.say(typeof FAMILY_LINES!=='undefined'?FAMILY_LINES.locked:'Commençons par l’activité proposée.');
}
function curriculumMathStyle(){
 if(typeof document==='undefined'||!document.head||document.querySelector('#curriculum-math-style'))return;
 const style=h('style',{id:'curriculum-math-style'},'.curriculum-math-map{width:100%;max-width:900px;margin:auto;padding:18px;box-sizing:border-box;overflow:auto;max-height:100%}.curriculum-math-group{margin:0 0 16px;border:2px solid #d7e2ee;border-radius:20px;background:#fff;padding:12px}.curriculum-math-group summary{cursor:pointer;padding:8px;font-size:21px;font-weight:700;color:#22466c}.curriculum-math-group summary small{font-size:14px;font-weight:400;display:block;margin:5px 0 0 19px}.curriculum-math-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:9px;padding-top:10px}.curriculum-math-step{display:flex;align-items:flex-start;gap:10px;text-align:left;min-height:86px;padding:13px;border:2px solid #d8e4ef;border-radius:14px;background:#f7fbff;color:#263f58;font:inherit;cursor:pointer}.curriculum-math-step>span:first-child{font-size:25px;flex:none}.curriculum-math-step b,.curriculum-math-step small{display:block}.curriculum-math-step b{font-size:18px}.curriculum-math-step small{font-size:13px;margin-top:4px}.curriculum-math-step.current{border-color:#1e72ba;box-shadow:0 0 0 2px #b9dff8}.curriculum-math-step.needs{background:#f7f5f0;border-style:dashed}.curriculum-math-step.passed{background:#f0f8ef}.curriculum-math-note{font-size:15px;line-height:1.45;margin:9px 0;color:#48627b}@media(max-width:600px){.curriculum-math-map{padding:10px}.curriculum-math-list{grid-template-columns:1fr}.curriculum-math-group summary{font-size:19px}}');document.head.append(style);
}
openCalcul=function(){
 Sfx.ensure();RUN=null;VoicePack.prefetchScope('calcul');curriculumMathStyle();
 Shell.open({bg:'#EAF3FF',level:'Compter et calculer',onClose:null});Shell.setDots(0);const st=Shell.stage;st.innerHTML='';st.className='stage';st.style.background='#EAF3FF';
 const p=P(),current=curriculumMathCurrent(p),currentKey=curriculumMathKey(current.mi,current.lv),wrap=h('div',{class:'curriculum-math-map'});
 wrap.append(h('h2',null,'Mon chemin de calcul'),h('p',{class:'curriculum-math-note'},'Les étapes vont des quantités aux calculs et aux problèmes. Tu peux revoir ce que tu as déjà fait.'));
 CURRICULUM_MATH_GROUPS.forEach(group=>{
  const completed=group.keys.filter(key=>{const t=curriculumMathTarget(key);return curriculumMathPassed(MODS[t.mi].id,t.lv,p);}).length,active=group.keys.includes(currentKey);
  const details=h('details',{class:'curriculum-math-group',open:active||undefined}),summary=h('summary',null,group.title,h('small',null,completed+' / '+group.keys.length+' séries réussies dans le jeu'));
  details.append(summary);if(group.note)details.append(h('p',{class:'curriculum-math-note'},group.note));const list=h('div',{class:'curriculum-math-list'});
  group.keys.forEach(key=>{const t=curriculumMathTarget(key),M=MODS[t.mi],L=M.levels[t.lv],access=curriculumMathAccess(t.mi,t.lv,p),passed=curriculumMathPassed(M.id,t.lv,p),active=key===currentKey;
   const status=passed?'Réussi dans le jeu':access.parent?'Accès ouvert par le parent':access.legacy&&access.missing.length?'Accès conservé':access.ready?'À essayer':'À préparer';
   const button=h('button',{class:'curriculum-math-step'+(active?' current':'')+(passed?' passed':'')+(!access.ready?' needs':''),'data-math-key':key,'aria-current':active?'step':null,'aria-label':M.name+' · '+L.name+' · '+status},h('span',{'aria-hidden':'true'},passed?'✓':access.ready?M.em:'↪'),h('span',null,h('b',null,L.name),h('small',null,M.name),h('small',null,status)));
   onTap(button,()=>{Voice.stop();if(access.ready){curriculumMathSetFocus(t);runModule(t.mi,t.lv);}else curriculumMathPrepare(t.mi,t.lv);});list.append(button);
  });details.append(list);wrap.append(details);
 });st.append(wrap);const say='Choisis une activité pour compter et calculer.';Shell.item={say};Shell.caption('Choisis une activité');Voice.say(say);
};
const levelStateBeforeCurriculumMath=levelState;
levelState=function(gid){
 if(gid!=='calcul')return levelStateBeforeCurriculumMath(gid);
 const p=P(),active=curriculumMathCurrent(p),items=CURRICULUM_MATH_ORDER.map(key=>{const t=curriculumMathTarget(key),M=MODS[t.mi],access=curriculumMathAccess(t.mi,t.lv,p);return {name:M.name+' · '+M.levels[t.lv].name,open:access.ready,go:()=>runModule(t.mi,t.lv),mi:t.mi,lv:t.lv,key,missing:access.missing};});
 const current=items.findIndex(x=>x.mi===active.mi&&x.lv===active.lv);
 return {current:Math.max(0,current)+1,total:items.length,label:'Étape',items};
};
GAMES.calcul.open=openCalcul;
GAMES.calcul.info=function(){const p=P(),n=CURRICULUM_MATH_ORDER.filter(key=>{const t=curriculumMathTarget(key);return curriculumMathPassed(MODS[t.mi].id,t.lv,p);}).length;return {lv:n+' séries réussies sur '+CURRICULUM_MATH_ORDER.length,pct:n/CURRICULUM_MATH_ORDER.length};};

/* Latest skip-aware runner, with DAG routing instead of an increasing module
   frontier. Score on screen and credited stars use the same final result. */
runModule=async function(mi,lv){
 const access=curriculumMathAccess(mi,lv);if(!access.ready){curriculumMathPrepare(mi,lv);return;}
 Sfx.ensure();curriculumMathSetFocus({mi,lv});const M=MODS[mi],L=M.levels[lv],session=resumeSession('module',{mi,lv}),run={gid:'calcul',levelIndex:lv,key:'calc:'+M.id+':'+lv,session,abort:false,res:[...session.res]};RUN=run;
 Shell.open({bg:'#EAF3FF',level:M.name,onClose:()=>openCalcul()});const n=8;Shell.setDots(n);const items=withSeed(session.seed,()=>genDistinct(L.gen,n,false));
 for(let i=0;i<n;i++){
  Shell.now(i);if(i<session.next){markResult(i,session.res[i]);continue;}
  const r=await Engine.play(items[i],run);if(run.abort||RUN!==run)return;
  run.res.push(r);checkpoint(run,i+1);markResult(i,r);if(countableResult(r))recordSkill('calc:'+M.id+':'+lv,r.first);
 }
 const initial=scoreOf(run.res),{pct,stars}=initial,mp=modProg(M.id),ps=mp.pass[lv];let note=null,noteSay=null,next=null;
 const goOn=()=>{const target=curriculumMathNext(P(),{mi,lv});if(!target)return null;curriculumMathSetFocus(target);next=()=>runModule(target.mi,target.lv);return 'Prochaine étape : '+MODS[target.mi].name+' · '+MODS[target.mi].levels[target.lv].name;};
 if(initial.skipped){note=skippedNote(initial.skipped);}
 else if(ps&&!ps.review&&!ps.parent){if(pct>=.8)mp.done[lv]=Math.max(mp.done[lv]||0,stars);note='Révision terminée.';goOn();}
 else if(pct<.6){note='On s’entraîne encore un peu : rejoue ce niveau, puis tu feras le petit défi.';noteSay='Rejoue ce niveau, et ensuite, tu feras le petit défi.';}
 else{
  const d=await runDefi(run,genDistinct(L.gen,DEFI.n,true),false);if(!d)return;
  run.res.push(...d.res);d.res.forEach(r=>{if(countableResult(r))recordSkill('calc:'+M.id+':'+lv,r.first);});logCalc({k:[M.id+':'+lv],at:Date.now(),ok:d.ok,n:d.n,skipped:d.skipped,kind:'defi'});
  if(d.pass){mp.pass[lv]={at:Date.now(),score:d.ok};mp.done[lv]=Math.max(mp.done[lv]||0,stars);const following=goOn();note='Défi réussi : '+d.ok+' sur '+d.n+(following?' · '+following:'');noteSay='Défi réussi !';}
  else if(d.skipped){note=skippedNote(d.skipped);}
  else{note='Défi : '+d.ok+' sur '+d.n+'. Il en faut 5 : rejoue ce niveau, puis retente le défi.';noteSay='Tu as eu '+nw(d.ok)+' sur six. Il en faut cinq. Rejoue ce niveau pour t’entraîner, et tu retenteras le défi.';}
 }
 clearResume(run);const finalScore=scoreOf(run.res),sticker=finalScore.stars>0?addStars(finalScore.stars):null;save();Shell.onClose=()=>openCalcul();
 Celebrate.show({stars:finalScore.stars,sticker,note,noteSay,next,nextLabel:'Étape suivante',again:()=>runModule(mi,lv),home:()=>openCalcul()});
};
