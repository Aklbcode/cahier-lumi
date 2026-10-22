/* Read-only simulation of the app's reading instructions against its audio bank. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
const fake=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
const api=require('../speech-engine.js');
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fake,createTextNode:t=>({textContent:t}),body:fake(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:api});
vm.runInContext(source,ctx,{timeout:3000});
const messages=vm.runInContext(`(()=>{const out=[];LESSONS.forEach((L,li)=>{out.push(itIntro(L).say,itLettre(L,li).say);const c={usedE:new Set()};for(let n=0;n<20;n++)out.push(itEcoute(L,c).say);for(const t of sylPool(li))out.push(itFusion(L,li,'hear',t,true).say,itFusion(L,li,'read',t,false).say);});return out;})()`,ctx,{timeout:10000});
const bank=JSON.parse(fs.readFileSync(path.join(root,'voix/index-belge.json'),'utf8'));
const norm=t=>api.norm(t).replace(/[.!?…:]+$/,'').trim();
const normalized=new Map(Object.keys(bank.clips).map(k=>[norm(k),k]));
function key(t,r){const k=api.speechBucket(r)+'|'+t;return bank.clips[k]?k:normalized.get(norm(k));}
const missing=new Set();let units=0;
for(const message of messages)for(const p of api.speechJoin(message)){
 if(typeof p==='number'||/^[\s.!?…,;:]+$/.test(p.t))continue;
 if(p.phoneme||p.syllable){const k=(p.phoneme?'ph|':'sy|')+(p.phoneme||p.syllable);units++;if(!bank.clips[k])missing.add(k);}
 else if(key(p.t,p.rate))units++;
 else for(const s of api.speechSegments(p.t)){units++;if(!key(s.t,p.rate))missing.add(api.speechBucket(p.rate)+'|'+s.t);}
}
const result={messages:messages.length,units,missing:[...missing].sort(),voice:bank.voice,complete:bank.complete===true};
fs.writeFileSync(path.join(root,'audit-voix/couverture-lecture-belge.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));if(missing.size)process.exitCode=1;
