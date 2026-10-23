/* Passer un exercice reste une navigation : aucune réussite ou erreur inventée. */
scoreOf=function(res){
  const sc=res.filter(r=>r&&!r.skipped&&r.first!=null),answered=sc.length,skipped=res.filter(r=>r?.skipped).length,ok=sc.filter(r=>r.first).length;
  const errors=sc.reduce((sum,r)=>sum+(r.first?0:Math.max(1,r.wrongs||0)),0),base=errors===0?3:errors===1?2:1;
  /* A skipped item contributes no earned star. A full unanswered series earns none.
     Demonstrations (first:null, without skipped) are not assessment items. */
  const stars=answered?Math.floor(base*answered/(answered+skipped)):0;
  return {pct:answered?ok/answered:0,errors,stars,answered,skipped,ok};
};
function skippedNote(n){return n===1?'Un exercice a été passé. Tu peux le reprendre en rejouant ce niveau.':`${n} exercices ont été passés. Tu peux les reprendre en rejouant ce niveau.`;}
function markResult(i,r){Shell.mark(i,r.skipped?'skipped':r.first==null?'ok':r.first?'ok':'half');}
function countableResult(r){return r.first!=null&&!r.skipped;}
runDefi=async function(run,items,memo){
  run.exam=false;Shell.setLevel('À toi de jouer');Shell.setDots(0);
  await Engine.play(defiIntro(memo),run);if(run.abort||RUN!==run)return null;
  run.exam=true;Shell.setDots(items.length);const res=[];
  for(let i=0;i<items.length;i++){Shell.now(i);const r=await Engine.play(items[i],run);if(run.abort||RUN!==run)return null;res.push(r);Shell.mark(i,r.skipped?'skipped':'rec');}
  run.exam=false;const skipped=res.filter(r=>r.skipped).length,ok=res.filter(r=>!r.skipped&&r.first).length;
  return {ok,n:items.length,res,skipped,answered:res.filter(countableResult).length,pass:skipped===0&&ok>=DEFI.pass};
};
runLesson=async function(li){
  Sfx.ensure();const session=resumeSession('lesson',{li}),run={gid:'lecture',levelIndex:li,session,abort:false,res:[...session.res]};RUN=run;
  Shell.open({bg:'#FFFFFF',level:`Le son ${LESSONS[li].main}`,onClose:()=>openLecture()});
  const items=withSeed(session.seed,()=>buildLesson(li));Shell.setDots(items.length);
  for(let i=0;i<items.length;i++){
    Shell.now(i);if(i<session.next){markResult(i,session.res[i]);continue;}
    const r=await Engine.play(items[i],run);if(run.abort||RUN!==run)return;
    run.res.push(r);checkpoint(run,i+1);markResult(i,r);if(countableResult(r)&&items[i].skill)recordGp(items[i].skill,r.first);
  }
  const initial=scoreOf(run.res),{pct,stars}=initial,lec=P().lecture,ps=lec.pass[li];
  let shown=stars,note=null,noteSay=null,next=null,up=false;
  const nextLesson=()=>runLesson(Math.min(li+1,LESSONS.length-1));
  if(initial.skipped){note=skippedNote(initial.skipped);if(ps&&!ps.review&&lec.unlocked>li)next=nextLesson;}
  else if(ps&&!ps.review){if(pct>=.8)lec.done[li]=Math.max(lec.done[li]||0,stars);note='Révision terminée.';next=lec.unlocked>li?nextLesson:null;}
  else if(pct<.6){shown=stars;note='On s’entraîne encore un peu : rejoue la leçon, puis tu feras le petit défi.';noteSay='Rejoue la leçon, et ensuite, tu feras le petit défi.';}
  else{
    const items2=buildDefi([li],items.ctx),d=await runDefi(run,items2,false);if(!d)return;
    run.res.push(...d.res);d.res.forEach((r,i)=>{if(countableResult(r)&&items2[i].skill)recordGp(items2[i].skill,r.first);});
    logDefi({li,at:Date.now(),ok:d.ok,n:d.n,skipped:d.skipped,kind:'defi'});
    if(d.pass){lec.pass[li]={at:Date.now(),score:d.ok};lec.done[li]=Math.max(lec.done[li]||0,stars);if(li===lec.unlocked&&li<LESSONS.length-1){lec.unlocked++;up=true;}note=`Défi réussi : ${d.ok} sur ${d.n}`+(up?` · nouveau son : « ${LESSONS[li+1].main} »`:'');noteSay=up?'Défi réussi ! Tu as débloqué un nouveau son !':'Défi réussi !';next=lec.unlocked>li?nextLesson:null;}
    else if(d.skipped){note=skippedNote(d.skipped);}
    else{shown=1;note=`Défi : ${d.ok} sur ${d.n}. Il en faut 5 : rejoue la leçon, puis retente le défi.`;noteSay=`Tu as eu ${nw(d.ok)} sur six. Il en faut cinq. Rejoue la leçon pour t’entraîner, et tu retenteras le défi.`;}
  }
  clearResume(run);const finalScore=scoreOf(run.res),sticker=finalScore.stars>0?addStars(finalScore.stars):null;save();Shell.onClose=()=>openLecture();
  Celebrate.show({stars:shown,sticker,note,noteSay,next,nextLabel:'Niveau suivant',again:()=>runLesson(li),home:()=>openLecture()});
};
runModule=async function(mi,lv){
  Sfx.ensure();const M=MODS[mi],L=M.levels[lv],session=resumeSession('module',{mi,lv}),run={gid:'calcul',levelIndex:lv,key:'calc:'+M.id+':'+lv,session,abort:false,res:[...session.res]};RUN=run;
  Shell.open({bg:'#EAF3FF',level:M.name,onClose:()=>openCalcul()});const n=8;Shell.setDots(n);const items=withSeed(session.seed,()=>genDistinct(L.gen,n,false));
  for(let i=0;i<n;i++){
    Shell.now(i);if(i<session.next){markResult(i,session.res[i]);continue;}
    const r=await Engine.play(items[i],run);if(run.abort||RUN!==run)return;
    run.res.push(r);checkpoint(run,i+1);markResult(i,r);if(countableResult(r))recordSkill(`calc:${M.id}:${lv}`,r.first);
  }
  const initial=scoreOf(run.res),{pct,stars}=initial,mp=modProg(M.id),c=calc(),ps=mp.pass[lv];let shown=stars,note=null,noteSay=null,next=null;
  const goOn=()=>{
    if(lv<M.levels.length-1){next=()=>runModule(mi,lv+1);return mp.pass[lv+1]?null:`Niveau ${lv+2} débloqué : ${M.levels[lv+1].name}`;}
    if(mi===c.open&&mi<MODS.length-1){c.open++;next=()=>runModule(mi+1,0);return `Nouvelle activité : ${MODS[mi+1].name}`;}
    if(mi<MODS.length-1&&c.open>mi)next=()=>runModule(mi+1,nextLevel(mi+1));return null;
  };
  if(initial.skipped){note=skippedNote(initial.skipped);/* No call to goOn: it may open the following module. */}
  else if(ps&&!ps.review){if(pct>=.8)mp.done[lv]=Math.max(mp.done[lv]||0,stars);note='Révision terminée.';goOn();}
  else if(pct<.6){shown=stars;note='On s’entraîne encore un peu : rejoue ce niveau, puis tu feras le petit défi.';noteSay='Rejoue ce niveau, et ensuite, tu feras le petit défi.';}
  else{
    const d=await runDefi(run,genDistinct(L.gen,DEFI.n,true),false);if(!d)return;
    run.res.push(...d.res);d.res.forEach(r=>{if(countableResult(r))recordSkill(`calc:${M.id}:${lv}`,r.first);});logCalc({k:[`${M.id}:${lv}`],at:Date.now(),ok:d.ok,n:d.n,skipped:d.skipped,kind:'defi'});
    if(d.pass){mp.pass[lv]={at:Date.now(),score:d.ok};mp.done[lv]=Math.max(mp.done[lv]||0,stars);const unlocked=goOn();note=`Défi réussi : ${d.ok} sur ${d.n}`+(unlocked?` · ${unlocked}`:'');noteSay=unlocked?'Défi réussi ! Tu as débloqué la suite !':'Défi réussi !';}
    else if(d.skipped){note=skippedNote(d.skipped);}
    else{shown=1;note=`Défi : ${d.ok} sur ${d.n}. Il en faut 5 : rejoue ce niveau, puis retente le défi.`;noteSay=`Tu as eu ${nw(d.ok)} sur six. Il en faut cinq. Rejoue ce niveau pour t’entraîner, et tu retenteras le défi.`;}
  }
  clearResume(run);const finalScore=scoreOf(run.res),sticker=finalScore.stars>0?addStars(finalScore.stars):null;save();Shell.onClose=()=>openCalcul();
  Celebrate.show({stars:shown,sticker,note,noteSay,next,nextLabel:'Niveau suivant',again:()=>runModule(mi,lv),home:()=>openCalcul()});
};
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent='.dots i.skipped{background:#d4d9df;box-shadow:inset 0 0 0 3px #8b96a5;position:relative}.dots i.skipped::after{content:"↪";position:absolute;inset:-4px;font:700 16px/23px sans-serif;text-align:center;color:#4c5c70}';document.head.append(style);}
