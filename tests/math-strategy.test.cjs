const vm=require('node:vm'),{loadApp,Element}=require('./helpers/render-fixture.cjs');
const originalQueryAll=Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll=function(selector){if(selector.includes(' ')&&!selector.includes(',')){let nodes=[this];for(const part of selector.trim().split(/\s+/))nodes=[...new Set(nodes.flatMap(n=>originalQueryAll.call(n,part)))];return nodes;}return originalQueryAll.call(this,selector);};
const {ctx}=loadApp({Blob,URL,AbortController,setTimeout:fn=>{Promise.resolve().then(fn);return 0;},clearTimeout(){}});
async function main(){try{await vm.runInContext(`(async()=>{
 const check=(ok,msg)=>{if(!ok)throw Error(msg)},flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
 save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Sfx.ensure=()=>{};Lumi.react=()=>{};S=defState();Shell.build();
 const type=(n)=>{const keys=Shell.stage.querySelector('.keypad').querySelectorAll('button');for(const d of String(n))keys.find(b=>b.getAttribute('aria-label')===d).click();keys.find(b=>b.getAttribute('aria-label')==='valider').click();};
 const configs=[{eq:[7,'+','?','=',10],ans:3,kind:'complement'},{eq:[2,'+',5,'=','?'],ans:7,kind:'count-on'},{eq:[8,'+',5,'=','?'],ans:13,kind:'through-ten'},{eq:[9,'−',4,'=','?'],ans:5,kind:'subtract'}];
 for(const c of configs){
  const item=kpItem({say:'Calcule.',...c}),run={gid:'calcul',abort:false,res:[]};RUN=run;Shell.open({level:'Calcul'});const pending=Engine.play(item,run),support=Shell.stage.querySelector('.math-core-strategy');
  check(item.mathCoreStrategy.kind===c.kind&&(support.hidden||support.getAttribute('hidden')!==null),'The appropriate strategy begins hidden');type(0);await flush();
  check(!support.hidden&&item.helped,'An actual wrong keypad response reveals a concrete strategy and records help');
  if(c.kind==='subtract')check(support.querySelectorAll('.x').length===4,'Subtraction visibly crosses out the removed points');
  if(c.kind==='through-ten')check(support.querySelectorAll('.frame').length===2&&item.mathCoreStrategy.line.includes(10),'Crossing ten has two frames and a count through ten');
  type(c.ans);const result=await pending;check(!result.first&&result.helped&&result.wrongs===1,'A supported response never turns into independent recall');
  check(mathPracticeState().encountered[item.mathPracticeFact.id],'The same displayed equation remains available for later review');
 }
 const item=kpItem({say:'Calcule.',eq:[2,'+',3,'=','?'],ans:5}),run={gid:'calcul',exam:true,abort:false,res:[]};RUN=run;Shell.open({level:'Calcul'});const pending=Engine.play(item,run);type(0);const result=await pending;check(result.first===false&&!item.helped&&(Shell.stage.querySelector('.math-core-strategy').hidden||Shell.stage.querySelector('.math-core-strategy').getAttribute('hidden')!==null),'An independent assessment never reveals the strategy');
 const choice=chItem({eq:[3,'+',2,'=','?'],ans:5,opts:[4,5,6,7]}),run2={gid:'calcul',abort:false,res:[]};RUN=run2;Shell.open({level:'Calcul'});const p2=Engine.play(choice,run2),cards=Shell.stage.querySelectorAll('.card');cards.find(b=>b.textContent==='4').click();await flush();check(!Shell.stage.querySelector('.math-core-strategy').hidden,'Choice questions receive the same concrete support');Shell.skipCurrent();const skipped=await p2;check(skipped.skipped&&skipped.first===null,'The supported question can still be passed without success');
 })()`,ctx,{timeout:10000});}finally{Element.prototype.querySelectorAll=originalQueryAll;}console.log('Calcul : compléments, surcomptage, passage par dix et retrait visibles après erreur ; aide, défi, rappel et passage préservés.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
