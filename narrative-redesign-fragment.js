/* Ordonner une histoire : un geste par réponse, repères fixes et aide racontée.
   Le petit exemple du verre est distinct des trois récits ensuite évalués. */
const NARRATIVE_LEVELS = [
 {frames:2,anchor:true,listen:true,name:'Trouver la fin',tag:'M1–M2'},
 {frames:2,anchor:false,name:'Le début et la fin',tag:'M2–M3'},
 {frames:3,anchor:true,name:'Trouver la suite',tag:'M3'},
 {frames:3,anchor:false,name:'Trois images dans l’ordre',tag:'M3–P1'},
 {frames:4,anchor:false,name:'Quatre images dans l’ordre',tag:'P1'}
];
const NARRATIVE_STORY_IDS = ['tour','dessin','bateau'];
function narrativeModel(ctx){
 const L=ctx.L,stories=SEQUENCE_STORIES.filter(s=>NARRATIVE_STORY_IDS.includes(s.id));
 ctx.used=ctx.used||[];
 const unseen=stories.filter(s=>!ctx.used.includes('narrative:'+s.id));
 const story=pick(unseen.length?unseen:stories);ctx.used.push('narrative:'+story.id);
 const indices=L.frames===2?[0,3]:L.frames===3?[0,2,3]:[0,1,2,3];
 return {story,indices,initial:L.anchor?[indices[0]]:[],options:L.listen?[2,3]:indices.slice(L.anchor?1:0)};
}
function narrativePositionLabel(index,length){return index===0?'Début':index===length-1?'Fin':'Ensuite';}
function narrativePrompt(at,length,listen){
 if(listen)return 'Touche l’image qui montre la fin.';
 if(at===0)return 'Touche l’image du début.';
 if(at===length-1)return 'Touche l’image qui vient à la fin.';
 return 'Touche l’image qui vient ensuite.';
}
function narrativeDemoSVG(full){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 190"><rect width="250" height="190" rx="20" fill="#e9f3f8"/><path d="M0 159H250V190H0Z" fill="#dcc9b1"/><path d="M83 51H168L157 155H94Z" fill="#ffffff" fill-opacity=".8" stroke="#7198b2" stroke-width="5"/>${full?'<path d="M91 86H160L153 151H98Z" fill="#7dc4e4"/><path d="M91 86Q125 94 160 86" fill="none" stroke="#4c9cc9" stroke-width="3"/>':''}<path d="M98 62L102 132" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`;}
function narrativeItem(ctx){
 const m=narrativeModel(ctx),story=m.story;
 const item={cls:'upgrade-stage',autoSay:false,caption:'Le début → la suite → la fin',
  exemplar:story.id+':'+m.indices.join(',')+':'+(ctx.L.anchor?'debut-donne':'sans-modele'),
  evidenceKey:ctx.L.listen?'narrative:listen-order':'narrative:order',
  render(st,api){
   let chosen=m.initial.slice(),showing=false;const cards=new Map();
   const slots=h('div',{class:'narrative-timeline'}),tray=h('div',{class:'picture-options narrative-tray'}),prompt=h('p',{class:'narrative-prompt'});
   const sayPrompt=()=>narrativePrompt(chosen.length,m.indices.length,ctx.L.listen);
   const draw=()=>{
    slots.innerHTML='';
    for(let i=0;i<m.indices.length;i++){
     const cell=h('div',{class:'narrative-cell'+(i===chosen.length?' current':'')});
     cell.append(h('div',{class:'narrative-label'},(i+1)+' · '+narrativePositionLabel(i,m.indices.length)),h('div',{class:'narrative-picture',html:i<chosen.length?sequenceSVG(story.id,chosen[i]):'<span aria-hidden="true">?</span>'}));slots.append(cell);
     if(i<m.indices.length-1)slots.append(h('span',{class:'narrative-arrow','aria-hidden':'true'},'→'));
    }
    for(const [step,b]of cards){const used=chosen.includes(step);b.classList.toggle('used',used);b.disabled=used||showing;b.setAttribute('aria-pressed',String(used));}
    prompt.textContent=chosen.length===m.indices.length?'Oui, l’histoire est dans le bon ordre !':sayPrompt();Shell.caption(prompt.textContent);
    if(Shell.item){Shell.item.say=prompt.textContent;Shell.item.replay=()=>Voice.say(prompt.textContent);}
   };
   const strategy=()=>{const step=m.indices[chosen.length];cards.get(step)?.classList.add('reveal');slots.querySelector('.current')?.classList.add('reveal');};
   api.strategy=strategy;
   const model=async()=>{
    if(!api.alive()||showing)return;api.help();showing=true;draw();
    await Voice.say('Regarde et écoute l’histoire dans l’ordre.');
    for(let i=0;i<m.indices.length;i++){
     if(!api.alive())return;
     const picture=slots.children[i*2]?.querySelector('.narrative-picture');
     if(picture)picture.innerHTML=sequenceSVG(story.id,m.indices[i]);
     slots.children[i*2]?.classList.add('playing');await Voice.say(story.events[m.indices[i]]);
     slots.children[i*2]?.classList.remove('playing');
    }
    if(!api.alive())return;showing=false;draw();strategy();Voice.say(sayPrompt());
   };
   for(const step of shuffle(m.options)){
    const box=h('div',{class:'picture-option'}),b=h('button',{class:'sequence-card narrative-choice',html:sequenceSVG(story.id,step),'aria-label':story.events[step]});cards.set(step,b);
    onTap(b,async()=>{
     if(!api.alive()||showing||chosen.includes(step))return;
     if(step!==m.indices[chosen.length])return api.step(false,{el:b,feedback:ctx.L.listen?'Écoute encore le début et la fin.':sayPrompt()});
     chosen.push(step);draw();
     if(chosen.length===m.indices.length)return api.answer(true,{praise:'Oui, l’histoire est dans le bon ordre !'});
     api.step(true,{say:[story.events[step],250,sayPrompt()]});
    });
    box.append(b,uButton('🔊',()=>{if(api.alive()&&!showing)Voice.say(story.events[step]);},{class:'choice-voice','aria-label':'Écouter cette image'}));tray.append(box);
   }
   const initialVoice=()=>ctx.L.listen?['Écoute le début et la fin.',story.events[0],300,story.events[3],300,sayPrompt()]:['Mets les images dans l’ordre de l’histoire.',sayPrompt()];
   const begin=()=>{
    if(!api.alive())return;st.innerHTML='';
    uWrap(st,h('div',{class:'narrative-title'},story.title),slots,prompt,tray,h('div',{class:'sequence-tools'},uButton('🔊 Réécouter',()=>Voice.say(initialVoice())),uButton('👀 Montre-moi',model)));
    draw();Voice.say(initialVoice());
   };
   if(!P().narrativeIntroV2){
    const start=uButton('À moi de jouer',()=>{if(!api.alive())return;P().narrativeIntroV2=Date.now();save();begin();},{class:'go-btn'});
    const demo=h('div',{class:'narrative-demo'},h('div',{class:'narrative-cell'},h('div',{class:'narrative-label'},'1 · Début'),h('div',{class:'narrative-picture',html:narrativeDemoSVG(false)})),h('span',{class:'narrative-arrow','aria-hidden':'true'},'→'),h('div',{class:'narrative-cell'},h('div',{class:'narrative-label'},'2 · Fin'),h('div',{class:'narrative-picture',html:narrativeDemoSVG(true)})));
    const explain=['Regarde cet exemple.','Au début, le verre est vide.','À la fin, le verre est rempli.','Maintenant, à toi avec une autre histoire.'];
    if(Shell.item){Shell.item.say=explain;Shell.item.replay=()=>Voice.say(explain);}
    uWrap(st,h('p',{class:'narrative-prompt'},'Un petit exemple'),demo,start);Shell.caption('Du début à la fin');Voice.say(explain);
   }else begin();
  }};
 return item;
}
for(const id of ['recit','recitP']){
 GAMES[id]={...GAMES[id],title:'Ordonner une histoire',sub:'Le début, la suite et la fin',make:narrativeItem,levels:NARRATIVE_LEVELS.slice(0,id==='recitP'?3:5).map((L,i)=>({...L,n:3,skill:'narrative:order:'+i,ref:'Comprendre la succession de situations concrètes ; une démonstration distincte puis une aide facultative'}))};
 SIMPLE_GAME_NAMES[id]='Ordonner une histoire';
}
function narrativeVoiceLines(){return [
 'Touche l’image qui montre la fin.','Touche l’image du début.','Touche l’image qui vient à la fin.','Touche l’image qui vient ensuite.',
 'Regarde et écoute l’histoire dans l’ordre.','Écoute encore le début et la fin.','Oui, l’histoire est dans le bon ordre !',
 'Écoute le début et la fin.','Mets les images dans l’ordre de l’histoire.',
 'Regarde cet exemple.','Au début, le verre est vide.','À la fin, le verre est rempli.','Maintenant, à toi avec une autre histoire.'
 ];}
function narrativeStyle(){const style=h('style');style.textContent=`
 .narrative-title{font-weight:800;font-size:clamp(19px,3vw,25px);color:#69517d}.narrative-prompt{font-size:clamp(20px,3vw,27px);font-weight:800;text-align:center;margin:6px 0;max-width:680px}
 .narrative-timeline,.narrative-demo{display:flex;align-items:center;justify-content:center;width:min(760px,95vw);gap:6px}.narrative-cell{width:min(170px,22vw);flex:1;min-width:0;border-radius:20px;border:3px solid #d4c8e0;background:#fff;overflow:hidden;transition:box-shadow .2s}
 .narrative-cell.current{border-color:#a185bc;border-style:dashed}.narrative-cell.reveal,.narrative-cell.playing{box-shadow:0 0 0 5px #f4cf62}.narrative-label{text-align:center;font-size:clamp(12px,2vw,17px);font-weight:800;padding:7px 2px;color:#675078;background:#f1eaf8}
 .narrative-picture{aspect-ratio:250/190;display:flex;align-items:center;justify-content:center;min-height:70px}.narrative-picture svg{width:100%;height:100%;display:block}.narrative-picture span{color:#b2a2c7;font-size:43px}.narrative-arrow{font-size:clamp(16px,3vw,27px);font-weight:900;color:#8e779f;flex-shrink:0}.narrative-choice{min-height:105px;touch-action:manipulation}.narrative-choice.used{visibility:visible;opacity:.25}.narrative-tray{max-width:780px;gap:12px}.narrative-demo{max-width:480px}
 @media(max-width:560px){.narrative-timeline{gap:3px}.narrative-cell{border-width:2px;border-radius:12px}.narrative-label{font-size:12px;padding:5px 1px}.narrative-timeline .narrative-arrow{font-size:16px}.narrative-picture{min-height:52px}.narrative-tray .sequence-card{width:38vw;max-width:180px}.narrative-tray{gap:10px}.narrative-prompt{font-size:20px}}
 `;document.head.append(style);}
const bootBeforeNarrativeRedesign=boot;boot=function(){narrativeStyle();bootBeforeNarrativeRedesign();};
