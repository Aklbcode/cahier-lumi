const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{loadApp}=require('./helpers/render-fixture.cjs');
const {ctx,source}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}}),root=path.join(__dirname,'..');
assert.ok(source.includes('const FAVORITE_CHARACTERS='),'Favorite characters must be integrated in normal app');
vm.runInContext(`
const favoriteCheck=(ok,message)=>{if(!ok)throw Error(message);};save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};Lumi.react=()=>{};S=defState();S.current='luca';
for(const [id,friend]of Object.entries(FAVORITE_ACTIVITIES)){
 const guide=favoriteGuide(friend),img=guide.querySelector('img');favoriteCheck(guide.tagName==='ASIDE'&&guide.getAttribute('aria-label')===FAVORITE_CHARACTERS[friend].label,'Context guide has a useful separate label');
 favoriteCheck(img&&img.getAttribute('src')===FAVORITE_CHARACTERS[friend].image&&img.getAttribute('alt')===FAVORITE_CHARACTERS[friend].name,'Context uses a real local image');
 favoriteCheck(!guide.querySelector('button')&&!guide.querySelector('.favorite-initial'),'Context has neither answer buttons nor letter proxies');
 for(const fn of img.listeners.error||[])fn();favoriteCheck(img.hidden&&guide.textContent.includes(FAVORITE_CHARACTERS[friend].name),'A failed decorative image retains its text');
}
favoriteCheck(!FAVORITE_ACTIVITIES.memo&&!FAVORITE_ACTIVITIES.memoG&&!FAVORITE_ACTIVITIES.couleurs,'Matching and colors use real character answers, not a decorative banner');
for(const gid of ['memo','memoG']){const item=GAMES[gid].make({L:GAMES[gid].levels[0],li:0,i:0,used:[],bag:{}});favoriteCheck(item.memoryKind==='characters'&&String(item.say).includes('Retrouve'),'Character memo still states the actual objective');}
`,ctx,{timeout:10000});
async function main(){
 await vm.runInContext(`(async()=>{
 Shell.caption=()=>{};Shell.bg='#fff';
 for(const gid of Object.keys(FAVORITE_ACTIVITIES))for(const exam of [false,true]){
  const stage=document.createElement('div');Shell.stage=stage;const run={gid,key:'game:'+gid,exam,session:{seed:10,next:0},abort:false};RUN=run;
  const exercise={say:'Une consigne.',autoSay:false,render(st){st.append(h('div',{class:'answer-choices'},h('button',null,'Réponse A'),h('button',null,'Réponse B')));}};
  const pending=Engine.play(exercise,run),guide=stage.querySelector('.favorite-guide'),answers=stage.querySelector('.answer-choices');
  favoriteCheck(answers&&answers.children.length===2,'Narrative context leaves answer content intact');favoriteCheck(exam?!guide:guide&&guide.parentNode===stage&&stage.children[0]===guide,'Context is outside answers and absent during assessment');favoriteCheck(!answers.querySelector('.favorite-guide'),'Context does not become an answer hint');Shell.skipCurrent();await pending;
 }
 const stage=document.createElement('div');Shell.stage=stage;const run={gid:'lecture',key:'lecture',exam:false,session:{seed:10,next:0},abort:false};RUN=run;const pending=Engine.play({autoSay:false,render(st){st.append(h('button',null,'a'));}},run);favoriteCheck(!stage.querySelector('.favorite-guide'),'Phonics answer stays undecorated');Shell.skipCurrent();await pending;
 })()`,ctx,{timeout:10000});
 assert.ok(fs.readFileSync(path.join(root,'scripts/inventory_feedback.cjs'),'utf8').includes('favoriteVoiceLines()'),'New character instructions are included in voice inventory');
 assert.ok(!source.includes("class:'favorite-initial'"),'No abstract B/P letter proxy remains');
 console.log('Personnages : vrais supports, contexte narratif hors réponses, phonèmes préservés et inventaire vocal vérifiés.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
