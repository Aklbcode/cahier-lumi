/* Lola : dénombrer une collection rouge et choisir son écriture chiffrée.
   Le cadre garde dix cases, même pour les petites quantités. Les consignes
   utilisent exclusivement les enregistrements de la voix Charline existante. */
const LOLA_TEN_FRAME_VOICE=['Combien de points ?',180,'Touche le bon chiffre.'];
function lolaTenFramePlan(max,n=8){
 const range=Array.from({length:max},(_,i)=>i+1),plan=[];
 while(plan.length<n){const next=shuffle(range);if(plan.length&&next.length>1&&next[0]===plan[plan.length-1])[next[0],next[1]]=[next[1],next[0]];plan.push(...next);}
 return plan.slice(0,n);
}
function lolaTenFrameItem(ctx){
 const L=ctx.L,bag=ctx.bag||(ctx.bag={});
 if(!bag.lolaTenFramePlan)bag.lolaTenFramePlan=lolaTenFramePlan(L.max,ctx.n||L.n||8);
 const answer=bag.lolaTenFramePlan[ctx.i%bag.lolaTenFramePlan.length];
 const positions=(L.scattered?sample(Array.from({length:10},(_,i)=>i),answer):Array.from({length:answer},(_,i)=>i)).sort((a,b)=>a-b);
 return {cls:'upgrade-stage lola-ten-frame-stage',say:LOLA_TEN_FRAME_VOICE,caption:'Compte les boules rouges. Touche le bon chiffre.',
  model:{answer,positions,max:L.max,scattered:!!L.scattered},render(st,api){
   const filled=new Set(positions),frame=h('div',{class:'lola-ten-frame','aria-hidden':'true'});
   for(let i=0;i<10;i++)frame.append(h('div',{class:'lola-ten-cell'+(filled.has(i)?' is-filled':'')},filled.has(i)?h('span',{class:'lola-ten-ball'}):null));
   const choices=h('div',{class:'lola-ten-choices'+(L.max<=3?' small-range':'') ,'aria-label':'Choisir le nombre de boules rouges'});
   let target;
   for(let n=1;n<=L.max;n++){
    const button=h('button',{class:'lola-ten-number','data-number':n,'aria-label':String(n)},String(n));
    if(n===answer)target=button;
    onTap(button,()=>{if(api.alive())api.answer(n===answer,{el:button,correctEl:target});});
    choices.append(button);
   }
   api.key(target);st.append(frame,choices);
  }};
}
GAMES.boulesP={id:'boulesP',title:'Compter les boules rouges',sub:'Compter dans un cadre de dix cases',icon:'🔴',color:'pink',stage:'#fff5ee',n:8,
 levels:[
  {name:'De 1 à 3 boules',max:3,tag:'M1–M2'},
  {name:'De 1 à 5 boules',max:5,tag:'M2–M3'},
  {name:'De 1 à 10 boules',max:10,tag:'M3'},
  {name:'Jusqu’à 10, avec des places différentes',max:10,scattered:true,tag:'M3'}
 ].map((L,i)=>({...L,n:8,skill:'math:red-ten-frame:'+i,ref:'Dénombrer les boules rouges et associer la quantité au nombre écrit, de 1 à 10'})),make:lolaTenFrameItem};
SIMPLE_GAME_NAMES.boulesP=GAMES.boulesP.title;
if(!WORLD_TILES.petits.includes('boulesP'))WORLD_TILES.petits.push('boulesP');
{
 const theme=THEMES.petits.find(t=>t.id==='calculer');
 if(theme&&!theme.ids.includes('boulesP'))theme.ids.splice(Math.max(0,theme.ids.indexOf('nombres')+1),0,'boulesP');
 const order=THEME_DIFFICULTY_ORDER.petits.calculer;
 if(order&&!order.includes('boulesP'))order.splice(Math.max(0,order.indexOf('nombres')+1),0,'boulesP');
 const familyOrder=typeof FAMILY_ACTIVITY_ORDER!=='undefined'&&FAMILY_ACTIVITY_ORDER.petits.calculer;
 if(familyOrder&&!familyOrder.includes('boulesP'))familyOrder.splice(Math.max(0,familyOrder.indexOf('nombres')+1),0,'boulesP');
 const group=typeof LEARNING_PATHS!=='undefined'&&LEARNING_PATHS.petits.calculer.find(g=>g.id==='quantites');
 if(group&&!group.ids.includes('boulesP'))group.ids.splice(Math.max(0,group.ids.indexOf('nombres')+1),0,'boulesP');
}
if(typeof document!=='undefined'&&document.head){const style=h('style');style.textContent=`
.lola-ten-frame-stage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(18px,3vh,30px);padding:20px 12px;overflow:auto}
.lola-ten-frame{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:min(490px,92%);border:3px solid #4d4540;border-radius:8px;overflow:hidden;background:#fff;box-sizing:border-box}
.lola-ten-cell{height:clamp(47px,9vw,78px);display:flex;align-items:center;justify-content:center;border-right:2px solid #736760;border-bottom:2px solid #736760;box-sizing:border-box}
.lola-ten-cell:nth-child(5n){border-right:0}.lola-ten-cell:nth-child(n+6){border-bottom:0}
.lola-ten-ball{display:block;width:clamp(28px,6vw,48px);height:clamp(28px,6vw,48px);border-radius:50%;background:#d73932;border:2px solid #a92521;box-sizing:border-box}
.lola-ten-choices{display:grid;grid-template-columns:repeat(5,minmax(48px,1fr));gap:10px;width:min(470px,94%)}
.lola-ten-choices.small-range{grid-template-columns:repeat(3,minmax(48px,1fr));max-width:300px}
.lola-ten-number{min-height:58px;min-width:48px;padding:6px;border:2px solid #b6a49a;border-radius:15px;background:white;color:#302e2b;font:400 clamp(30px,6vw,44px)/1.3 var(--font-read);box-shadow:0 3px 0 #ddcdc3;touch-action:manipulation}
.lola-ten-number:focus-visible{outline:4px solid #296eae;outline-offset:3px}.lola-ten-number:hover{background:#fff0e5}
@media(max-width:420px){.lola-ten-choices{gap:8px}.lola-ten-number{min-height:52px}.lola-ten-frame-stage{padding:14px 6px;gap:18px}}
@media(max-height:540px) and (orientation:landscape){.lola-ten-frame-stage{gap:12px;padding:8px}.lola-ten-cell{height:44px}.lola-ten-ball{width:30px;height:30px}.lola-ten-frame{max-width:330px}.lola-ten-number{min-height:44px;font-size:28px}.lola-ten-choices{gap:7px;max-width:390px}}
`;document.head.append(style);}
