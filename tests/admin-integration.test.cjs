const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
async function main(){
 const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 if(!html.includes('const ADMIN_PROFILE_ID='))throw Error('Admin must be integrated into index.html');
 const fake=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
 const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,localStorage:{setItem(){},getItem(){return null}},window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fake,createTextNode:t=>({textContent:t}),body:fake(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
 const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
 vm.runInContext(source,ctx);
 await vm.runInContext(`(async()=>{
 const check=(b,msg)=>{if(!b)throw Error(msg)};
 S=defState();save=()=>{};
 for(const id of ['luca','lola']){S.current=id;P().skills.sentinel={ok:id==='luca'?2:1,n:3};P().lecture.unlocked=id==='luca'?7:2;P().cards=[{name:id}];P().resume={kind:'game',gid:id==='luca'?'sudoku':'memo',li:1};seriesRewards().stars=id==='luca'?4:8;}
 const childBefore=JSON.stringify({luca:S.progress.luca,lola:S.progress.lola});
 S.at={luca:17,lola:18,reglages:19};Remote.state='on';Track.init();
 const settingsBefore=docSig('reglages');S.current='admin';P().skills.demo={ok:20,n:21};prof().world='petits';S.world='petits';Track.mark();
 check(JSON.stringify(syncDocs())===JSON.stringify(['reglages','luca','lola']),'Admin excluded from synchronization document list');
 check(!JSON.parse(localDoc('reglages')).worlds.some(([id])=>id==='admin'),'Admin world omitted from shared settings');
 check(docSig('reglages')===settingsBefore,'Admin universe changes do not change synchronized settings');
 check(S.at.luca===17&&S.at.lola===18&&S.at.reglages===19&&!S.at.admin,'Admin play does not timestamp child/cloud documents');
 check(JSON.stringify({luca:S.progress.luca,lola:S.progress.lola})===childBefore,'Admin setup and play preserve exact child documents');
 const adminBefore=JSON.stringify(S.progress.admin);applyDoc('admin','invalid ignored payload');applyDoc('reglages',JSON.stringify({worlds:[['admin','grands']]}));
 check(JSON.stringify(S.progress.admin)===adminBefore&&prof().world==='petits','Incoming cloud records cannot replace local Admin data or universe');
 const writes=[];Remote.db={doc:key=>({set:async value=>writes.push({key,value})})};Remote.refs={};Remote.pushed={luca:17,lola:18,reglages:19};Remote.busy=false;Remote.again=false;
 await Remote.save();check(writes.length===0,'Admin-only use sends no cloud document');
 S.at.luca=20;await Remote.save();check(writes.length===1&&writes[0].key.endsWith('/cahier-luca'),'Normal Luca synchronization still works');
 check(writes.every(w=>!w.key.endsWith('/cahier-admin')),'Admin is never uploaded');
 const saved=migrate(JSON.parse(JSON.stringify(S)));
 check(saved.current==='luca'&&JSON.stringify(saved.progress.admin)===adminBefore,'Local reload preserves Admin and returns to a child');
 check(JSON.stringify({luca:saved.progress.luca,lola:saved.progress.lola})===childBefore,'Reload preserves child exercises, cards and skills');
 /* A legacy family cloud document must not delete the separate local profile. */
 S=saved;S.updatedAt=1;const cloud={v:1,updatedAt:100,profiles:[{id:'luca',world:'grands'},{id:'lola',world:'petits'}],settings:{},progress:{luca:{remoteSentinel:'luca'},lola:{remoteSentinel:'lola'}}};
 const legacyDb={doc:key=>({get:async()=>key.endsWith('/cahier')?{exists:true,data:()=>({state:JSON.stringify(cloud)})}:{exists:false},set:async()=>{}})};
 window.claude={use:async name=>name==='db'?legacyDb:{id:async()=> 'integration-user'}};
 Remote.db=null;Remote.refs={};Remote.pushed={};Remote.ready=false;Remote.state='pending';Remote.busy=false;Remote.again=false;Remote.uid=null;
 applyGifts=()=>{};Voice.choose=()=>{};renderHome=()=>{};Shell.isOpen=()=>false;
 await Remote.init();
 check(S.progress.admin&&JSON.stringify(S.progress.admin)===adminBefore,'Legacy cloud import must preserve local Admin data');
 check(S.progress.luca.remoteSentinel==='luca'&&S.progress.lola.remoteSentinel==='lola','Legacy child cloud import still works normally');
 })()`,ctx,{timeout:10000});
 console.log('Admin intégré : isolation cloud, horodatages enfants, rechargement et import historique vérifiés.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
