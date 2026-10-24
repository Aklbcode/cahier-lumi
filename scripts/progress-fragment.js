/* Niveaux lisibles : repère local à une activité, sans classement ni récompense supplémentaire. */
function levelState(gid) {
  const p=P(),g=GAMES[gid];
  if(!g)return null;
  if(gid==='lecture'){
    const li=clamp(p.lecture.unlocked||0,0,LESSONS.length-1);
    return {current:li+1,total:LESSONS.length,label:'Niveau',items:LESSONS.map((L,i)=>({name:'Le son « '+L.main+' »',open:i<=li,go:()=>runLesson(i)}))};
  }
  if(gid==='calcul'){
    const c=calc(),items=[],active=clamp(c.open||0,0,MODS.length-1),mp=modProg(MODS[active].id),start=Number.isInteger(mp.parentStart)?clamp(mp.parentStart,0,MODS[active].levels.length-1):0;
    let local=MODS[active].levels.findIndex((L,i)=>i>=start&&(!mp.pass[i]||mp.pass[i].review));if(local<0)local=Math.max(start,MODS[active].levels.length-1);
    MODS.forEach((M,mi)=>{const progress=modProg(M.id),opened=Number.isInteger(progress.parentStart)?progress.parentStart:0;M.levels.forEach((L,lv)=>items.push({name:M.name+' · '+L.name,open:mi<=c.open&&(lv===0||lv<=opened||!!progress.pass[lv-1]),go:()=>runModule(mi,lv),mi,lv}));});
    const current=items.findIndex(x=>x.mi===active&&x.lv===local);
    return {current:current+1,total:items.length,label:'Niveau',items};
  }
  if(g.levels?.length){const gp=p.games[gid]||{lvl:0,unlocked:0},li=clamp(gp.lvl||0,0,g.levels.length-1);return {current:li+1,total:g.levels.length,label:'Niveau',items:g.levels.map((L,i)=>({name:L.name||'Niveau '+(i+1),open:i<=Math.max(gp.unlocked||0,li),go:()=>{gameProg(gid).lvl=i;save();runGame(gid);}}))};}
  if(gid==='livres'){const done=MINI_BOOKS.filter(b=>{const e=p.bookEvidence?.[b.id];return !!e&&(!!e.completedAt||!e.skipped||e.attempts?.some(a=>!a.skipped));}).length;return {current:done,total:MINI_BOOKS.length,label:'Livres terminés',items:MINI_BOOKS.map(b=>({name:b.title,open:true,go:()=>readMiniBook(b)}))};}
  return null;
}
function currentRunLevel(run=RUN){
  if(!run)return null;
  const s=run.session;
  if(s?.kind==='lesson'){const view=levelState('lecture');return {...view,current:s.li+1,name:LESSONS[s.li].main};}
  if(s?.kind==='module'){const view=levelState('calcul'),i=view.items.findIndex(x=>x.mi===s.mi&&x.lv===s.lv);return {...view,current:i+1,name:MODS[s.mi].levels[s.lv].name};}
  if(s?.kind==='game'){const view=levelState(run.gid),li=run.levelIndex??s.li;return view?{...view,current:li+1,name:GAMES[run.gid].levels[li].name}:null;}
  if(run.gid==='livres'&&run.bookId){const view=levelState('livres'),i=MINI_BOOKS.findIndex(b=>b.id===run.bookId);return i>=0?{...view,current:i+1,label:'Livre',name:MINI_BOOKS[i].title}:null;}
  return null;
}
function progressMeter(view,cls='activity-progress'){
  const value=clamp(view.current,0,view.total),label=`${view.label} ${value} / ${view.total}`;
  return h('div',{class:cls},h('small',null,label),h('div',{class:'activity-progress-track',role:'progressbar','aria-label':view.label,'aria-valuemin':0,'aria-valuemax':view.total,'aria-valuenow':value},h('i',{style:{width:(value/view.total*100)+'%'}})));
}
const gameTileBeforeProgress=simpleGameTile;
simpleGameTile=function(id){const tile=gameTileBeforeProgress(id),view=levelState(id);if(view){tile.append(progressMeter(view));tile.setAttribute('aria-label',(SIMPLE_GAME_NAMES[id]||GAMES[id].title)+', '+view.label+' '+view.current+' sur '+view.total);}else tile.append(h('small',{class:'activity-free'},'Activité libre'));return tile;};
function showLevelChoices(view){
  Voice.stop();
  const sheet=h('div',{class:'sheet level-choice-sheet'}),modal=h('div',{class:'modal',role:'dialog','aria-modal':'true','aria-label':'Les niveaux de cette activité'},sheet);
  const close=()=>modal.remove();
  const list=h('div',{class:'level-choice-list'});
  view.items.forEach((entry,i)=>{const current=i===view.current-1,b=h('button',{class:'level-choice'+(current?' current':''),disabled:!entry.open,'aria-current':current?'step':null},h('b',null,String(i+1)),h('span',null,entry.name),h('span',{'aria-hidden':'true'},entry.open?(current?'●':'→'):'🔒'));if(entry.open)onTap(b,()=>{close();Voice.stop();if(RUN)RUN.abort=true;Shell.clearCeleb();entry.go();});list.append(b);});
  sheet.append(h('h3',null,'Les niveaux'),h('p',null,(view.label==='Livre'?'Tu es au livre ':'Tu es au niveau ')+view.current+' sur '+view.total+'.'),list,onTap(h('button',{class:'pbtn'},'Revenir au jeu'),close));document.body.append(modal);
}
const shellOpenBeforeProgress=Shell.open.bind(Shell);
Shell.open=function(options){shellOpenBeforeProgress(options);if(this.skipBtn)this.skipBtn.hidden=false;this.levelView=currentRunLevel();if(!this.progressEl){this.progressEl=h('div',{class:'game-level-progress'});this.el.insertBefore(this.progressEl,$('.stage-wrap',this.el));}this.progressEl.innerHTML='';const view=this.levelView;this.progressEl.hidden=!view;if(view){const button=onTap(h('button',{class:'game-level-button','aria-label':'Voir les niveaux disponibles'},view.label+' '+view.current+' / '+view.total+' ▾'),()=>showLevelChoices(view));this.progressEl.append(button,h('span',{class:'game-level-name'},view.name||''));}};
const celebrateBeforeProgress=Celebrate.show.bind(Celebrate);
Celebrate.show=function(options){
  celebrateBeforeProgress(options);
  const panel=$('.celebrate',Shell.el),acts=panel&&$('.acts',panel);if(!panel||!acts)return;
  const view=Shell.levelView,skipped=options.skipped??(RUN?.res||[]).filter(r=>r.skipped).length;
  if(Shell.skipBtn)Shell.skipBtn.hidden=true;
  const title=$('h2',panel);if(skipped)title.textContent='Série terminée · '+skipped+' exercice'+(skipped>1?'s':'')+' passé'+(skipped>1?'s':'');else if(view)title.textContent=view.label+' '+view.current+' / '+view.total+' terminé';
  if(options.note)panel.insertBefore(h('p',{class:'completion-note'},options.note),acts);
  if(options.next&&options.nextLabel){const next=$('button',acts);if(next)next.textContent=options.nextLabel;}
};
/* Keep the completed level distinct from the automatically selected following level.
   In particular, Rejouer must never silently start a different level. */
function memoryLevelCompleted(run,g){
  const memory=['memo','memoG','memoMots'].includes(g.id);
  if(!memory&&!g.advanceOnCompletion)return false;
  const played=run.levelIndex??run.session?.li??0,L=g.levels[played],expected=L?.n||g.n||6;
  /* Turning over a nonmatching pair is ordinary exploration in a memory game.
     Completion opens the next board; mistakes still determine the star score.
     Historical resume records have no completed flag, but their boolean first
     result was emitted only after all pairs had been found. */
  return run.res.length===expected&&run.res.every(r=>r&&!r.skipped&&(r.completed===true||(memory&&typeof r.first==='boolean')));
}
finishGame=function(run,g,gp){
  clearResume(run);
  const played=run.levelIndex??run.session?.li??gp.lvl,{pct,stars}=scoreOf(run.res);
  const skipped=run.res.some(r=>r.skipped);
  gp.rounds++;if(stars>0)gp.best[played]=Math.max(gp.best[played]||0,stars);
  let up=false,down=false;
  if(!skipped){if(pct>=.8||memoryLevelCompleted(run,g)){gp.low=0;if(played<g.levels.length-1){gp.lvl=played+1;gp.unlocked=Math.max(gp.unlocked,gp.lvl);up=true;}}
  else if(pct<.5){gp.low=(gp.low||0)+1;if(gp.low>=2&&played>0){gp.lvl=played-1;gp.low=0;down=true;}}
  else gp.low=0;}
  const sticker=stars>0?addStars(stars):null;save();
  const start=i=>{gp.lvl=i;save();runGame(g.id);},next=played<g.levels.length-1&&gp.unlocked>played?()=>start(played+1):null;
  Celebrate.show({stars,sticker,note:skipped?'Certains exercices ont été passés.':up?g.levels[played+1].name:down?'Tu peux reprendre le niveau précédent ou rejouer celui-ci.':null,next,nextLabel:'Niveau suivant',again:()=>start(played),home:()=>Shell.close()});
  const panel=$('.celebrate',Shell.el),acts=panel&&$('.acts',panel);if(acts){const buttons=$$('button',acts),again=buttons[next?1:0];if(again)again.textContent='Rejouer ce niveau';}
};
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`
.simple-game .activity-progress{display:block;width:100%;margin-top:6px;text-align:left}.activity-progress small{display:block;font:600 13px/1.4 var(--font-read);color:var(--ink-soft)}.activity-progress-track{height:7px;overflow:hidden;background:#dfe8ee;border-radius:9px;margin-top:5px}.activity-progress-track i{display:block;height:100%;background:#75b399;border-radius:inherit;min-width:0}.activity-free{display:block;font-size:13px;color:var(--ink-soft);margin-top:7px}.game-level-progress{display:flex;justify-content:center;align-items:center;gap:12px;flex:none;padding:0 22px 4px}.game-level-progress[hidden]{display:none}.game-level-button{border-radius:20px;background:#fff;border:1px solid var(--line);padding:6px 13px;font-size:14px;font-weight:700;white-space:nowrap}.game-level-name{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%}.level-choice-sheet{max-width:600px}.level-choice-list{display:grid;gap:7px;max-height:56vh;overflow:auto;padding:5px}.level-choice{display:flex;align-items:center;gap:12px;padding:12px;border:2px solid #dce6e3;border-radius:13px;text-align:left;background:white}.level-choice.current{border-color:#3c9672;background:#edf7f1}.level-choice:disabled{opacity:.5}.level-choice>b{display:grid;place-items:center;background:#e8f3ee;border-radius:50%;width:32px;height:32px;flex:none}.level-choice>span:nth-child(2){flex:1}.completion-note{max-width:560px;text-align:center;padding:0 15px;font-size:18px;color:var(--ink-soft)}@media(max-width:600px){.game-level-progress{padding:0 12px 3px;gap:8px}.game-level-button,.game-level-name{font-size:12px}.game-level-name{max-width:48%}.simple-game .activity-progress small{font-size:12px}.completion-note{font-size:15px}}
`;document.head.append(style);}
