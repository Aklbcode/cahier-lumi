/* Real animal recordings replace synthetic spellings such as “bzzzz”.
   Spoken guidance and feedback still use the selected Charline voice. */
const AnimalCalls={serial:0,source:null,buffers:new Map(),
 stop(){this.serial++;if(this.source){try{this.source.stop();}catch(_){}this.source=null;}},
 async listen(animal,api,status){
  Sfx.ensure();const spoken=Voice.say('Écoute ce bruit. Quel animal l’a fait ?'),token=this.serial;
  await spoken;if(token!==this.serial||!api.alive())return;
  try{const ctx=Sfx.ensure();if(!ctx)throw Error('Audio indisponible');let data=this.buffers.get(animal.file);if(!data){data=fetch(animal.file).then(r=>{if(!r.ok)throw Error('Audio absent');return r.arrayBuffer();}).then(b=>new Promise((ok,fail)=>{const result=ctx.decodeAudioData(b,ok,fail);if(result?.then)result.then(ok,fail);}));this.buffers.set(animal.file,data);data.catch(()=>this.buffers.delete(animal.file));}const buffer=await data;if(token!==this.serial||!api.alive())return;const source=ctx.createBufferSource(),gain=ctx.createGain();gain.gain.value=.8;source.buffer=buffer;source.connect(gain);gain.connect(ctx.destination);this.source=source;source.onended=()=>{if(this.source===source)this.source=null;};source.start();if(status){status.hidden=true;status.textContent='';}}
  catch(_){if(token!==this.serial||!api.alive())return;if(status){status.hidden=false;status.textContent='Le bruit ne se charge pas. Réessaie ou passe cet exercice.';}}
 }
};
const stopBeforeAnimalCalls=Voice.stop.bind(Voice);Voice.stop=function(){AnimalCalls.stop();return stopBeforeAnimalCalls();};
const imagierBeforeRealCalls=GAMES.ferme.make;
GAMES.ferme.make=function(ctx){if(ctx.L.mode!=='cri')return imagierBeforeRealCalls(ctx);const pool=CRIS.filter(a=>ANIMAL_AUDIO[a[0]]),animal=avoidRepeat(ctx,pool,a=>a[0]),entry=ANIMAL_AUDIO[animal[0]],options=shuffle([animal,...sample(pool.filter(a=>a[0]!==animal[0]),ctx.L.k-1)]);let replay=null;return {autoSay:false,cls:'upgrade-stage',say:'Écoute ce bruit. Quel animal l’a fait ?',caption:'Écoute le vrai bruit de l’animal',evidenceKey:'preschool:animal-calls',exemplar:entry.name,replay:()=>replay&&replay(),render(st,api){let target;const status=h('p',{class:'u-note',role:'status',hidden:true}),row=h('div',{class:'row'},options.map(a=>{const b=card(a[0],a[1]);if(a===animal)target=b;onTap(b,()=>api.answer(a===animal,{el:b,correctEl:target,praise:a[0]==='🐝'?'Oui, c’est une abeille.':`Oui, c’est ${a[1]}.`,feedback:'Écoute encore le bruit, puis choisis l’animal.'}));return b;}));replay=()=>AnimalCalls.listen(entry,api,status);uWrap(st,uButton('🔊 Écouter le bruit',replay),row,status);replay();}};};
function animalVoiceLines(){return ['Écoute ce bruit. Quel animal l’a fait ?','Écoute encore le bruit, puis choisis l’animal.',...CRIS.filter(a=>ANIMAL_AUDIO[a[0]]).map(a=>a[0]==='🐝'?'Oui, c’est une abeille.':`Oui, c’est ${a[1]}.`)];}
